/**
 * @namespace: addons/music/helpers/KaraokeManager.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
	MessageFlags,
} = require('discord.js');

/**
 * 🎤 Karaoke Manager
 *
 * Manages per-guild real-time live lyrics ("karaoke mode") using the
 * LavaLyrics Lavalink plugin. Listens to raw WebSocket events pushed
 * by Lavalink — no polling, fully event-driven.
 *
 * Flow:
 *  1. User presses the [Lyrics] button on the Now Playing embed.
 *  2. KaraokeManager subscribes the player via REST.
 *  3. Lavalink starts pushing LyricsFoundEvent / LyricsLineEvent over WS.
 *  4. Each LyricsLineEvent → bot edits a dedicated "Karaoke" Discord message.
 *  5. Track ends / user toggles off → unsubscribe + auto-delete message.
 *
 * @class KaraokeManager
 * @param {object} container - Kythia global dependency injection container.
 */
class KaraokeManager {
	constructor(container) {
		this.container = container;
		this.client = container.client;
		this.logger = container.logger;
		this.config = container.kythiaConfig;

		/**
		 * Map<guildId, KaraokeSession>
		 * KaraokeSession: {
		 *   message:      Discord Message,
		 *   lines:        Array<{ timestamp, line }>,
		 *   currentIndex: number,
		 *   channelId:    string,
		 *   node:         Poru Node,
		 *   guildId:      string,
		 *   trackTitle:   string,
		 *   trackAuthor:  string,
		 * }
		 */
		this.sessions = new Map();

		// Track nodes we've already attached listeners to
		this._attachedNodes = new WeakSet();
	}

	// ─────────────────────────────────────────────────────────────────────────
	// INITIALIZATION
	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * Attach raw WebSocket listeners to all current + future Poru nodes.
	 * Must be called after `poru.init()`.
	 * @param {object} poru - The Poru instance (client.poru)
	 */
	attachNodeListeners(poru) {
		// Listen to future node connections
		poru.on('nodeConnect', (node) => {
			this._attachToNode(node);
		});

		// Attach to already-connected nodes (in case init runs after nodeConnect)
		if (poru.nodes?.size) {
			for (const node of poru.nodes.values()) {
				if (node.ws) this._attachToNode(node);
			}
		}
	}

	/**
	 * Attach a raw WS message listener to a single Poru node.
	 * Guarded against double-attach via WeakSet.
	 * @param {object} node - Poru Node instance
	 */
	_attachToNode(node) {
		if (!node.ws) return;
		if (this._attachedNodes.has(node.ws)) return;

		this._attachedNodes.add(node.ws);

		node.ws.on('message', (data) => {
			try {
				const payload = JSON.parse(data.toString());
				if (payload.op !== 'event') return;
				if (
					payload.type !== 'LyricsFoundEvent' &&
					payload.type !== 'LyricsNotFoundEvent' &&
					payload.type !== 'LyricsLineEvent'
				)
					return;

				// Fire-and-forget: don't block Poru's WS loop
				this._handleLyricsEvent(payload).catch((e) => {
					this.logger.warn(
						`KaraokeManager: event handler error: ${e.message}`,
						{
							label: 'karaoke',
						},
					);
				});
			} catch (_e) {
				// Malformed JSON — ignore silently
			}
		});

		this.logger.info(`🎤 KaraokeManager: attached to node "${node.name}"`, {
			label: 'karaoke',
		});
	}

	/**
	 * Starts a karaoke session for a player.
	 * Calls the LavaLyrics subscribe REST endpoint and sends the initial
	 * "Karaoke Mode" message into the given channel.
	 *
	 * @param {object} player    - Poru Player
	 * @param {object} channel   - Discord text channel
	 * @returns {Promise<boolean>} true if subscription succeeded
	 */
	async startSession(player, channel) {
		const node = player.node;
		if (!node?.sessionId) {
			this.logger.warn(
				`KaraokeManager: node has no sessionId for guild ${player.guildId}`,
				{ label: 'karaoke' },
			);
			return false;
		}

		const track = player.currentTrack;

		const { ServerSetting } = this.container.models;
		const setting = await ServerSetting.getCache({
			where: { guildId: player.guildId },
		});
		const lang = setting?.lang || 'en-US';

		// 1. Send the initial "Karaoke Mode" message FIRST
		// This prevents a race condition where Lavalink sends events before the message exists.
		const initialContent = await this._buildInitialContent(
			track,
			lang,
			player.guildId,
		);
		let msg;
		try {
			msg = await channel.send({
				components: [initialContent],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (e) {
			this.logger.error(
				`KaraokeManager: failed to send karaoke message: ${e.message}`,
				{ label: 'karaoke' },
			);
			return false;
		}

		// 2. Setup the session immediately so it can catch WS events
		player.lyricsMessage = msg;
		this.sessions.set(player.guildId, {
			message: msg,
			lines: [],
			currentIndex: -1,
			channelId: channel.id,
			node,
			guildId: player.guildId,
			trackTitle: track?.info?.title || 'Unknown',
			trackAuthor: track?.info?.author || '',
			lang,
		});

		// 3. Subscribe via LavaLyrics REST ONLY NOW
		const subscribed = await this._subscribe(player, node);
		if (!subscribed) {
			// If subscribe fails, clean up the message and session
			await msg.delete().catch(() => {});
			player.lyricsMessage = null;
			this.sessions.delete(player.guildId);
			return false;
		}

		player.lyricsSubscribed = true;

		this.logger.info(`🎤 Karaoke session started for guild ${player.guildId}`, {
			label: 'karaoke',
		});
		return true;
	}

	/**
	 * Stops the karaoke session for a player.
	 * Unsubscribes from LavaLyrics, deletes the karaoke message.
	 *
	 * @param {object} player - Poru Player (or object with { guildId, node })
	 */
	async stopSession(player) {
		const guildId = player?.guildId;
		if (!guildId) return;

		const session = this.sessions.get(guildId);
		if (!session) {
			// Session may not exist but player flag might still be set
			if (player.lyricsSubscribed) {
				player.lyricsSubscribed = false;
			}
			return;
		}

		// Unsubscribe from LavaLyrics
		const node = session.node || player.node;
		if (node) {
			await this._unsubscribe(player, node).catch(() => {});
		}

		// Delete the karaoke message
		try {
			if (session.message?.deletable) {
				await session.message.delete();
			}
		} catch (_e) {}

		// Reset player flags
		player.lyricsSubscribed = false;
		player.lyricsMessage = null;

		this.sessions.delete(guildId);

		this.logger.info(`🎤 Karaoke session stopped for guild ${guildId}`, {
			label: 'karaoke',
		});
	}

	/**
	 * Returns true if there is an active karaoke session for the guild.
	 * @param {string} guildId
	 */
	hasSession(guildId) {
		return this.sessions.has(guildId);
	}

	// ─────────────────────────────────────────────────────────────────────────
	// LAVALYRICS REST
	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * POST /v4/sessions/{sessionId}/players/{guildId}/lyrics/subscribe?skipTrackSource=true
	 *
	 * `skipTrackSource=true` tells LavaLyrics to skip fetching lyrics from
	 * the track's own source (e.g. Spotify) and go straight to the configured
	 * sources list (YouTube, etc.) — prevents 403/500 errors when the track
	 * source requires special API credentials (like Spotify Premium).
	 *
	 * @returns {Promise<boolean>} true on success (204 No Content)
	 */
	async _subscribe(player, node) {
		try {
			const url = `${node.restURL}/v4/sessions/${node.sessionId}/players/${player.guildId}/lyrics/subscribe?skipTrackSource=true`;
			const res = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: node.password,
					Connection: 'close', // Critical for Bun to prevent TCP socket conflicts
				},
			});
			// Consume body completely to free up the socket
			await res.text().catch(() => {});

			if (res.status === 204 || res.status === 200) return true;

			this.logger.warn(
				`KaraokeManager: subscribe returned ${res.status} for guild ${player.guildId}`,
				{ label: 'karaoke' },
			);
			return false;
		} catch (e) {
			this.logger.error(
				`KaraokeManager: subscribe request failed: ${e.message}`,
				{ label: 'karaoke' },
			);
			return false;
		}
	}

	/**
	 * DELETE /v4/sessions/{sessionId}/players/{guildId}/lyrics/subscribe
	 */
	async _unsubscribe(player, node) {
		try {
			const url = `${node.restURL}/v4/sessions/${node.sessionId}/players/${player.guildId}/lyrics/subscribe`;
			const res = await fetch(url, {
				method: 'DELETE',
				headers: {
					Authorization: node.password,
					Connection: 'close',
				},
			});
			await res.text().catch(() => {});
		} catch (e) {
			this.logger.warn(
				`KaraokeManager: unsubscribe request failed: ${e.message}`,
				{ label: 'karaoke' },
			);
		}
	}

	// ─────────────────────────────────────────────────────────────────────────
	// EVENT HANDLER
	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * Dispatches incoming LavaLyrics WebSocket events.
	 * @param {object} payload - Parsed WS JSON payload
	 */
	async _handleLyricsEvent(payload) {
		const { type, guildId } = payload;

		const session = this.sessions.get(guildId);
		if (!session) return;

		switch (type) {
			case 'LyricsFoundEvent': {
				// Store all lines for the sliding-window context
				session.lines = payload.lyrics?.lines || [];
				session.currentIndex = -1;
				await this._updateMessage(session, -1, null).catch(() => {});
				break;
			}
			case 'LyricsNotFoundEvent': {
				await this._updateNotFoundMessage(session).catch(() => {});
				break;
			}
			case 'LyricsLineEvent': {
				const { lineIndex, line, skipped } = payload;
				// Skip lines that were jumped over via seek — don't spam edits
				if (skipped) return;
				session.currentIndex = lineIndex;
				await this._updateMessage(session, lineIndex, line).catch(() => {});
				break;
			}
		}
	}

	// ─────────────────────────────────────────────────────────────────────────
	// MESSAGE BUILDERS
	// ─────────────────────────────────────────────────────────────────────────

	/**
	 * Edits the karaoke message with a sliding window of lyrics.
	 * Window: 2 previous | current (highlighted) | 2 next
	 */
	async _updateMessage(session, lineIndex, currentLine) {
		if (!session.message?.editable) return;

		const { lines, trackTitle, trackAuthor, lang, guildId } = session;
		const container = await this._buildKaraokeContainer(
			trackTitle,
			trackAuthor,
			lines,
			lineIndex,
			currentLine,
			lang,
			guildId,
		);

		await session.message.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * Edits the karaoke message to show "Lyrics not found" fallback.
	 */
	async _updateNotFoundMessage(session) {
		if (!session.message?.editable) return;

		const { trackTitle, trackAuthor, lang, guildId } = session;
		const mockInt = { guildId, locale: lang, guild: { id: guildId } };

		const titleText = await this.container.t(
			mockInt,
			'music.helpers.handlers.music.karaoke.not_found_title',
			{ title: trackTitle, author: trackAuthor },
		);

		const descText = await this.container.t(
			mockInt,
			'music.helpers.handlers.music.karaoke.not_found_desc',
		);

		const container = new ContainerBuilder()
			.setAccentColor(0xe55353) // soft red
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(titleText))
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(descText));

		await session.message.edit({
			components: [container],
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * Builds the initial "Karaoke Mode — waiting for lyrics" container.
	 */
	async _buildInitialContent(track, lang, guildId) {
		const title = track?.info?.title || 'Unknown Track';
		const author = track?.info?.author || '';

		const mockInt = { guildId, locale: lang, guild: { id: guildId } };

		const modeText = await this.container.t(
			mockInt,
			'music.helpers.handlers.music.karaoke.mode',
			{ title, author_divider: author ? ' • ' : '', author },
		);

		const loadingText = await this.container.t(
			mockInt,
			'music.helpers.handlers.music.karaoke.loading',
		);

		const poweredText = await this.container.t(
			mockInt,
			'music.helpers.handlers.music.karaoke.powered',
		);

		return new ContainerBuilder()
			.setAccentColor(this._accentColor())
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(modeText))
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(loadingText),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(poweredText),
			);
	}

	/**
	 * Builds the real-time karaoke container.
	 * Shows 2 previous lines (dimmed), current line (highlighted), 2 next lines (dimmed).
	 *
	 * @param {string}  trackTitle   - Song title
	 * @param {string}  trackAuthor  - Song author
	 * @param {Array}   lines        - Full lyrics lines array from LyricsFoundEvent
	 * @param {number}  lineIndex    - Index of the current line (−1 = waiting)
	 * @param {object}  currentLine  - LyricsLine object from LyricsLineEvent
	 * @param {string}  lang         - Guild language
	 * @param {string}  guildId      - Guild ID
	 */
	async _buildKaraokeContainer(
		trackTitle,
		trackAuthor,
		lines,
		lineIndex,
		currentLine,
		lang,
		guildId,
	) {
		const mockInt = { guildId, locale: lang, guild: { id: guildId } };
		const container = new ContainerBuilder().setAccentColor(
			this._accentColor(),
		);

		const modeText = await this.container.t(
			mockInt,
			'music.helpers.handlers.music.karaoke.mode',
			{
				title: trackTitle,
				author_divider: trackAuthor ? ' • ' : '',
				author: trackAuthor,
			},
		);

		// Header
		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(modeText),
		);
		container.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		// Waiting state
		if (lineIndex < 0 || !currentLine) {
			const waitingText = await this.container.t(
				mockInt,
				'music.helpers.handlers.music.karaoke.waiting',
			);
			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(waitingText),
			);
		} else {
			// ── Sliding window: 2 prev | current (highlighted) | 2 next ──
			const CONTEXT = 2;
			const start = Math.max(0, lineIndex - CONTEXT);
			const end = Math.min(lines.length - 1, lineIndex + CONTEXT);

			const parts = [];
			for (let i = start; i <= end; i++) {
				const isCurrent = i === lineIndex;
				const text = isCurrent
					? (currentLine?.line ?? lines[i]?.line ?? '')
					: (lines[i]?.line ?? '');

				if (!text && !isCurrent) {
					// Empty intermediate line — just a blank spacer
					parts.push('');
					continue;
				}

				if (isCurrent) {
					// Current line: visually prominent
					parts.push(`> ## ${text || '♪'}`);
				} else {
					// Context lines (prev & next): dimmed via subtext markdown
					parts.push(`-# ${text}`);
				}
			}

			// Collapse consecutive blank spacers
			const collapsed = parts.filter(
				(l, idx, arr) => !(l === '' && arr[idx - 1] === ''),
			);

			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(collapsed.join('\n') || '> ## ♪'),
			);
		}

		const poweredText = await this.container.t(
			mockInt,
			'music.helpers.handlers.music.karaoke.powered',
		);

		container.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);
		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(poweredText),
		);

		return container;
	}

	/**
	 * Returns the accent color (decimal) from bot config, or a default purple.
	 */
	_accentColor() {
		try {
			const { convertColor } = this.container.helpers.color;
			return convertColor(this.config.bot.color, {
				from: 'hex',
				to: 'decimal',
			});
		} catch {
			return 0x5865f2; // Discord Blurple fallback
		}
	}
}

module.exports = KaraokeManager;
