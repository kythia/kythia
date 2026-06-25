/**
 * @namespace: addons/music/helpers/handlers/MusicHandlers.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	generateLyricsWithTranscript,
	formatTrackDuration,
} = require('../index');

const {
	ButtonStyle,
	FileBuilder,
	MessageFlags,
	ButtonBuilder,
	ComponentType,
	SectionBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	ActionRowBuilder,
	ThumbnailBuilder,
	AttachmentBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	SeparatorSpacingSize,
	MediaGalleryItemBuilder,
	StringSelectMenuBuilder,
} = require('discord.js');

const { customFilter } = require('poru');

let ytDlp = null;
try {
	ytDlp = require('yt-dlp-exec');
} catch {
	/* yt-dlp-exec not installed — download feature disabled */
}
const path = require('node:path');
const axios = require('axios');
const fs = require('node:fs');

/**
 * 🎵 Music Handlers Service
 *
 * This class is responsible for handling the business logic behind all music-related commands.
 * Acts as the bridge between Discord interactions (Slash Commands/Buttons)
 * and the Poru/Lavalink player systems.
 *
 * Key Features:
 * - Handles Play, Pause, Skip, Stop, etc.
 * - Manages Playlist & Favorites logic.
 * - Handles Radio & Lyrics search.
 * - Uses "Auto-Bind" in the constructor so methods are safe to use as callbacks.
 *
 * @class MusicHandlers
 * @param {object} container - The global Kythia Dependency Injection container.
 * @property {import('discord.js').Client} client - The Discord Client instance.
 * @property {object} logger - The system logger.
 * @property {object} config - The Kythia configuration object.
 */
class MusicHandlers {
	constructor(container) {
		const { client, logger, t, kythiaConfig, helpers } = container;

		this.container = container;
		this.client = client;
		this.logger = logger;
		this.t = t;
		this.config = kythiaConfig;

		this.setVoiceChannelStatus = helpers.discord.setVoiceChannelStatus;
		this.convertColor = helpers.color.convertColor;
		this.isOwner = helpers.discord.isOwner;
		this.embedFooter = helpers.discord.embedFooter;
		this.isPremium = helpers.discord.isPremium;
		this.simpleContainer = helpers.discord.simpleContainer;
		this.premiumLocked = (interaction, requiredTier) =>
			helpers.discord.premiumLocked(interaction, this.container, requiredTier);
		this.voteLocked = (interaction) =>
			helpers.discord.voteLocked(interaction, this.container);

		this.guildStates = new Map();
		this.TICKER_INTERVAL = 5000;

		const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
		for (const method of methods) {
			if (method !== 'constructor' && typeof this[method] === 'function') {
				this[method] = this[method].bind(this);
			}
		}
	}

	get Favorite() {
		return this.container.models.Favorite;
	}
	get Playlist() {
		return this.container.models.Playlist;
	}
	get PlaylistTrack() {
		return this.container.models.PlaylistTrack;
	}
	get Music247() {
		return this.container.models.Music247;
	}

	/**
	 * ▶️ Handles the 'play' subcommand.
	 * Searches for a song/playlist and adds it to the queue, filtering out YouTube Shorts.
	 * If the query is a Spotify playlist link, adds all tracks from that playlist to the queue.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 */
	async handlePlay(interaction) {
		const { client, member, guild, options, channel } = interaction;
		await interaction.deferReply();
		const query = options.getString('search');

		const existingPlayer = client.poru.players.get(guild.id);
		if (
			existingPlayer &&
			existingPlayer.voiceChannel !== member.voice.channel?.id
		) {
			if (await this.isLocked(interaction, existingPlayer)) {
				const msg = await this.t(
					interaction,
					'music.helpers.handlers.247.locked_error',
					{ defaultValue: '❌ This 24/7 session is locked by another user!' },
				);
				const components = await this.simpleContainer(interaction, msg, {
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}

		if (!query) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.play.no.query'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (
			query.toLowerCase().includes('spotify') &&
			(!this.config.addons.music.spotify.clientID ||
				!this.config.addons.music.spotify.clientSecret)
		) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.configured'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		let res;
		try {
			res = await client.poru.resolve({ query, requester: interaction.user });
		} catch (e) {
			this.logger.error(`Poru resolve error: ${e.message || e}`, {
				label: 'music',
			});
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.failed', {
					error: e?.message || 'Unknown error',
				}),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const isSpotifyPlaylist =
			/^https?:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]+/i.test(
				query.trim(),
			);
		if (isSpotifyPlaylist) {
			if (
				res?.loadType !== 'PLAYLIST_LOADED' ||
				!Array.isArray(res.tracks) ||
				res.tracks.length === 0
			) {
				const components = await this.simpleContainer(
					interaction,
					await this.t(interaction, 'music.helpers.handlers.music.results'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const player = client.poru.createConnection({
				guildId: guild.id,
				voiceChannel: member.voice.channel.id,
				textChannel: channel.id,
				deaf: true,
			});

			if (
				!player.isPlaying &&
				guild.members.me?.voice?.channelId === member.voice.channel.id
			) {
				const shard = guild.client.ws.shards.get(guild.shardId);
				if (shard) {
					shard.send({
						op: 4,
						d: {
							guild_id: guild.id,
							channel_id: member.voice.channel.id,
							self_mute: true,
							self_deaf: true,
						},
					});
					setTimeout(() => {
						shard.send({
							op: 4,
							d: {
								guild_id: guild.id,
								channel_id: member.voice.channel.id,
								self_mute: false,
								self_deaf: true,
							},
						});
					}, 250);
				}
			}

			for (const track of res.tracks) {
				track.info.requester = interaction.user;
				player.queue.add(track);
			}

			if (!player.isPlaying && player.isConnected) player.play();

			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.desc.spotify',
					{
						count: res.tracks.length,
						name: res.playlistInfo?.name || 'Spotify Playlist',
					},
				),
				{ color: this.config.bot.color },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (res.loadType === 'search') {
			const filteredTracks = res.tracks.filter(
				(track) => !track.info.isStream && track.info.length > 70000,
			);
			if (!filteredTracks.length) {
				const components = await this.simpleContainer(
					interaction,
					await this.t(interaction, 'music.helpers.handlers.music.results'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			res.tracks = filteredTracks;
		}

		if (res.loadType === 'error') {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.failed', {
					error: res.exception?.message || 'Unknown error',
				}),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (res.loadType === 'empty') {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.results'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const player = client.poru.createConnection({
			guildId: guild.id,
			voiceChannel: member.voice.channel.id,
			textChannel: channel.id,
			deaf: true,
		});

		if (
			!player.isPlaying &&
			guild.members.me?.voice?.channelId === member.voice.channel.id
		) {
			const shard = guild.client.ws.shards.get(guild.shardId);
			if (shard) {
				shard.send({
					op: 4,
					d: {
						guild_id: guild.id,
						channel_id: member.voice.channel.id,
						self_mute: true,
						self_deaf: true,
					},
				});
				setTimeout(() => {
					shard.send({
						op: 4,
						d: {
							guild_id: guild.id,
							channel_id: member.voice.channel.id,
							self_mute: false,
							self_deaf: true,
						},
					});
				}, 250);
			}
		}

		if (res.loadType === 'playlist' || res.loadType === 'PLAYLIST_LOADED') {
			for (const track of res.tracks) {
				track.info.requester = interaction.user;
				player.queue.add(track);
			}
		} else {
			if (!res.tracks || res.tracks.length === 0) {
				const components = await this.simpleContainer(
					interaction,
					await this.t(interaction, 'music.helpers.handlers.music.results'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			const track = res.tracks[0];
			track.info.requester = interaction.user;
			player.queue.add(track);
		}

		if (!player.isPlaying && player.isConnected) player.play();

		let message;
		if (res.loadType === 'playlist' || res.loadType === 'PLAYLIST_LOADED') {
			message = await this.t(
				interaction,
				'music.helpers.handlers.music.playlist.desc.text',
				{
					count: res.tracks.length,
					name: res.playlistInfo?.name || 'Playlist',
				},
			);
		} else {
			const track = res.tracks[0];
			message = await this.t(
				interaction,
				'music.helpers.handlers.music.added.to.queue',
				{
					title: track.info.title,
					url: track.info.uri,
					duration: formatTrackDuration(track.info.length),
					author: track.info.author,
				},
			);
		}
		const components = await this.simpleContainer(interaction, message, {
			color: this.config.bot.color,
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * 📥 Handles the 'join' subcommand.
	 * Joins the user's voice channel.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 */
	async handleJoin(interaction, _player) {
		const { client, member, guild, channel } = interaction;

		if (!member.voice.channel) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.music.voice.channel.not.found'),
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		const existingPlayer = client.poru.players.get(guild.id);
		if (
			existingPlayer &&
			existingPlayer.voiceChannel !== member.voice.channel.id
		) {
			if (await this.isLocked(interaction, existingPlayer)) {
				const msg = await this.t(
					interaction,
					'music.helpers.handlers.247.locked_error',
				);
				const components = await this.simpleContainer(interaction, msg, {
					color: 'Red',
				});
				return interaction.reply({
					components,
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
			existingPlayer.destroy();
		}

		client.poru.createConnection({
			guildId: guild.id,
			voiceChannel: member.voice.channel.id,
			textChannel: channel.id,
			deaf: true,
		});

		if (guild.members.me?.voice?.channelId === member.voice.channel.id) {
			const shard = guild.client.ws.shards.get(guild.shardId);
			if (shard) {
				shard.send({
					op: 4,
					d: {
						guild_id: guild.id,
						channel_id: member.voice.channel.id,
						self_mute: true,
						self_deaf: true,
					},
				});
				setTimeout(() => {
					shard.send({
						op: 4,
						d: {
							guild_id: guild.id,
							channel_id: member.voice.channel.id,
							self_mute: false,
							self_deaf: true,
						},
					});
				}, 250);
			}
		}

		const components = await this.simpleContainer(
			interaction,
			await this.t(interaction, 'music.helpers.handlers.music.joined', {
				channel: member.voice.channel.toString(),
				bot: interaction.client.user.username,
			}),
			{ color: this.config.bot.color },
		);

		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * 📤 Handles the 'leave' subcommand.
	 * Leaves the voice channel and destroys the player.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */
	async handleLeave(interaction, player) {
		if (!player) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.music.player.not.found'),
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		if (await this.isLocked(interaction, player)) {
			const msg = await this.t(
				interaction,
				'music.helpers.handlers.247.locked_error',
				{ defaultValue: '❌ This 24/7 session is locked by another user!' },
			);
			const components = await this.simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		player.destroy();

		const components = await this.simpleContainer(
			interaction,
			await this.t(interaction, 'music.helpers.handlers.music.left', {
				bot: interaction.client.user.username,
			}),
			{ color: this.config.bot.color },
		);

		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * 🔧 Handles the 'repair' subcommand.
	 * Destroys the broken/stuck player, clears all timers & collectors, reconnects
	 * the bot back into the user's voice channel, and resumes the previously-playing
	 * track from the beginning so the session feels completely fresh.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The (possibly stuck) music player instance.
	 */
	async handleRepair(interaction, player) {
		const { client, member, guild, channel } = interaction;
		await interaction.deferReply({ ephemeral: true });

		const savedTrack = player?.currentTrack ?? null;
		const savedQueue = player?.queue ? [...player.queue] : [];
		const savedTextChannel = player?.textChannel ?? channel.id;
		const savedVoiceChannel = member.voice.channel?.id ?? player?.voiceChannel;

		// ── Step 1: tear down the existing player cleanly ──────────────────────
		if (player) {
			// Stop progress-bar interval
			if (player.updateInterval) {
				clearInterval(player.updateInterval);
				player.updateInterval = null;
			}
			// Stop button/collector
			if (player.buttonCollector) {
				try {
					player.buttonCollector.stop('repair');
				} catch (_e) {}
				player.buttonCollector = null;
			}
			// Stop disconnect timeout
			if (player.disconnectTimeout) {
				clearTimeout(player.disconnectTimeout);
				player.disconnectTimeout = null;
			}
			// Delete the stale now-playing message
			if (player.nowPlayingMessage?.deletable) {
				try {
					await player.nowPlayingMessage.delete();
				} catch (_e) {}
				player.nowPlayingMessage = null;
			}
			// Destroy the Lavalink player (closes the session + WS)
			try {
				if (!player.destroyed) player.destroy();
			} catch (_e) {}
		}

		// ── Step 2: re-join voice channel ──────────────────────────────────────
		if (!savedVoiceChannel) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.repair.no_voice',
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		let newPlayer;
		try {
			newPlayer = client.poru.createConnection({
				guildId: guild.id,
				voiceChannel: savedVoiceChannel,
				textChannel: savedTextChannel,
				deaf: true,
			});
		} catch (err) {
			this.logger.error(
				`[repair] Failed to create connection: ${err.message}`,
				{
					label: 'music',
				},
			);
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.repair.connect_failed',
					{
						error: err.message,
					},
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Give the WebSocket voice state a moment to settle
		const shard = guild.client.ws.shards.get(guild.shardId);
		if (shard) {
			shard.send({
				op: 4,
				d: {
					guild_id: guild.id,
					channel_id: savedVoiceChannel,
					self_mute: true,
					self_deaf: true,
				},
			});
			await new Promise((r) => setTimeout(r, 300));
			shard.send({
				op: 4,
				d: {
					guild_id: guild.id,
					channel_id: savedVoiceChannel,
					self_mute: false,
					self_deaf: true,
				},
			});
		}

		// ── Step 3: restore queue & resume playback ────────────────────────────
		if (savedTrack) {
			newPlayer.queue.add(savedTrack);
		}
		for (const t of savedQueue) {
			newPlayer.queue.add(t);
		}

		if (newPlayer.queue.length > 0 && newPlayer.isConnected) {
			newPlayer.play();
		}

		// ── Step 4: confirm to the user ────────────────────────────────────────
		const hasQueue = savedTrack || savedQueue.length > 0;
		const channelMention = `<#${savedVoiceChannel}>`;

		const msgText = hasQueue
			? await this.t(
					interaction,
					'music.helpers.handlers.music.repair.success_with_track',
					{
						channel: channelMention,
						title: savedTrack?.info?.title ?? 'the queue',
					},
				)
			: await this.t(
					interaction,
					'music.helpers.handlers.music.repair.success',
					{
						channel: channelMention,
					},
				);

		const components = await this.simpleContainer(interaction, msgText, {
			color: this.config.bot.color,
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * 🐇 Handles the 'jump' subcommand.
	 * Skips to a specific track in the queue.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */
	async handleJump(interaction, player) {
		const isVote = await this.voteLocked(interaction);
		if (!isVote) return;

		const position = interaction.options.getInteger('position');
		if (position < 1 || position > player.queue.length) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.position', {
					size: player.queue.length,
				}),
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		player.queue.splice(0, position - 1);
		player.skip();
		const components = await this.simpleContainer(
			interaction,
			await this.t(interaction, 'music.helpers.handlers.music.jumped', {
				position,
			}),
			{ color: this.config.bot.color },
		);
		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * 📥 Handles the 'grab' subcommand.
	 * Sends the current track info to the user's DM.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */
	async handleGrab(interaction, player) {
		if (!player.currentTrack) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.playing.desc'),
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const track = player.currentTrack;
		const components = await this.simpleContainer(
			interaction,
			await this.t(
				interaction,
				'music.helpers.handlers.music.nowplaying.text',
				{
					title: track.info.title,
					url: track.info.uri,
					duration: formatTrackDuration(track.info.length),
					author: track.info.author,
				},
			),
			{ color: this.config.bot.color },
		);
		try {
			await interaction.user.send({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
			const successComponents = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.grab.success'),
				{ color: this.config.bot.color },
			);
			return interaction.reply({
				components: successComponents,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		} catch (_e) {
			const failedComponents = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.grab.failed'),
				{ color: 'Red' },
			);
			return interaction.reply({
				components: failedComponents,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	}

	/**
	 * 🔄 Handles the 'replay' subcommand.
	 * Replays the current track from the beginning.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */
	async handleReplay(interaction, player) {
		player.seekTo(0);
		const components = await this.simpleContainer(
			interaction,
			await this.t(interaction, 'music.helpers.handlers.music.replayed'),
			{ color: this.config.bot.color },
		);
		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * [HELPER] Membuat embed dan tombol navigasi untuk halaman history.
	 * @param {Array} history - Array history tracks.
	 * @param {number} page - Halaman yang ingin ditampilkan.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 */
	async _createHistoryEmbed(history, page = 1, interaction) {
		const itemsPerPage = 10;
		const totalPages = Math.ceil(history.length / itemsPerPage) || 1;
		page = Math.max(1, Math.min(page, totalPages));

		const start = (page - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		const currentHistory = history.slice(start, end);

		const historyList = currentHistory
			.map(
				(track, index) =>
					`**${start + index + 1}.** [${track.info.title}](${track.info.uri})`,
			)
			.join('\n');

		const buttons = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(`history_prev_${page}`)
				.setEmoji('◀️')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === 1),
			new ButtonBuilder()
				.setCustomId(`history_next_${page}`)
				.setEmoji('▶️')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === totalPages),
		);

		const container = new ContainerBuilder()
			.setAccentColor(
				this.convertColor(this.config.bot.color, {
					from: 'hex',
					to: 'decimal',
				}),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await this.t(
						interaction,
						'music.helpers.handlers.music.history.title',
					),
				),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(historyList),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addActionRowComponents(buttons)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await this.t(
						interaction,
						'music.helpers.handlers.music.history.footer',
						{
							page,
							totalPages,
							totalTracks: history.length,
						},
					),
				),
			);

		return {
			components: [container],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		};
	}

	/**
	 * 📜 Handles the 'history' subcommand.
	 * Shows the last few played tracks with pagination.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 * @param {Map} guildStates - The guild states map.
	 */
	async handleHistory(interaction, _player, guildStates) {
		try {
			if (!interaction.deferred && !interaction.replied) {
				await interaction.deferReply().catch(() => {});
			}
		} catch (_e) {}

		const guildId = interaction.guildId;
		const guildState = guildStates.get(guildId);

		if (!guildState?.previousTracks || guildState.previousTracks.length === 0) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.history.empty'),
				{ color: 'Red' },
			);
			return interaction
				.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				})
				.catch(() => {});
		}

		const history = guildState.previousTracks;
		const initialPage = 1;
		const historyMessageOptions = await this._createHistoryEmbed(
			history,
			initialPage,
			interaction,
		);

		const message = await interaction
			.editReply(historyMessageOptions)
			.catch(() => null);
		if (!message) return;

		const collector = message.createMessageComponentCollector({
			filter: (i) => i.user.id === interaction.user.id,
			time: 5 * 60 * 1000,
		});

		collector.on('collect', async (buttonInteraction) => {
			const [action, currentPageStr] = buttonInteraction.customId
				.split('_')
				.slice(1);
			let currentPage = parseInt(currentPageStr, 10);

			if (action === 'next') {
				currentPage++;
			} else if (action === 'prev') {
				currentPage--;
			}

			const updatedMessageOptions = await this._createHistoryEmbed(
				history,
				currentPage,
				interaction,
			);

			await buttonInteraction.update(updatedMessageOptions).catch(() => {});
		});

		collector.on('end', async () => {
			if (message?.editable) {
				const finalState = await this._createHistoryEmbed(
					history,
					1,
					interaction,
				);
				finalState.components = [];
				await message.edit(finalState).catch(() => {});
			}
		});
	}

	/**
	 * ⏸️ Handles the 'pause' subcommand.
	 * Pauses the currently playing track.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */
	async handlePause(interaction, player) {
		if (player.isPaused) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.paused'),
				{ color: this.config.bot.color },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		player.pause(true);
		const components = await this.simpleContainer(
			interaction,
			await this.t(interaction, 'music.helpers.handlers.manager.paused'),
			{ color: this.config.bot.color },
		);
		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * ▶️ Handles the 'resume' subcommand.
	 * Resumes playback if paused.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */
	async handleResume(interaction, player) {
		if (!player.isPaused) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.playing.desc'),
				{ color: this.config.bot.color },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		player.pause(false);
		const components = await this.simpleContainer(
			interaction,
			await this.t(interaction, 'music.helpers.handlers.manager.resumed'),
			{ color: this.config.bot.color },
		);
		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	async handlePauseResume(interaction, player) {
		const isPaused = !player.isPaused;
		player.pause(isPaused);

		const state = isPaused
			? await this.t(interaction, 'music.helpers.handlers.manager.paused')
			: await this.t(interaction, 'music.helpers.handlers.manager.resumed');

		const components = await this.simpleContainer(
			interaction,
			await this.t(interaction, 'music.helpers.handlers.manager.reply', {
				state,
			}),
			{ color: this.config.bot.color },
		);
		await interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * ⏭️ Handles the 'skip' subcommand.
	 * Skips the current track.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */
	async handleSkip(interaction, player) {
		if (!player.currentTrack) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.skip'),
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		player.skip();
		const components = await this.simpleContainer(
			interaction,
			await this.t(interaction, 'music.helpers.handlers.music.skipped'),
			{ color: this.config.bot.color },
		);
		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * ⏹️ Handles the 'stop' subcommand.
	 * Stops playback and clears the queue.
	 * This will trigger the 'queueEnd' event, which will then
	 * handle disconnecting or staying based on 24/7 mode.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */
	async handleStop(interaction, player) {
		player.autoplay = false;
		player.manualStop = true;
		player.loop = 'NONE';
		player.trackRepeat = false;
		player.queueRepeat = false;

		player.queue.clear();
		player.skip();

		const components = await this.simpleContainer(
			interaction,
			await this.t(interaction, 'music.helpers.handlers.music.stopped'),
			{ color: 'Red' },
		);
		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * [HELPER] Membuat embed dan tombol navigasi untuk halaman antrian.
	 * @param {object} player - The music player instance.
	 * @param {number} page - Halaman yang ingin ditampilkan.
	 * @returns {import('discord.js').InteractionReplyOptions}
	 */
	async _createQueueEmbed(player, page = 1, interaction) {
		const nowPlaying = player.currentTrack;

		if (!nowPlaying) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.empty'),
				{ color: this.config.bot.color },
			);
			return {
				components,
				flags: MessageFlags.IsComponentsV2,
				fetchReply: true,
			};
		}

		const itemsPerPage = 10;
		const totalPages = Math.ceil(player.queue.length / itemsPerPage) || 1;
		page = Math.max(1, Math.min(page, totalPages));

		const start = (page - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		const currentQueue = player.queue.slice(start, end);
		const _duration = player.queue.reduce(
			(total, track) => total + track.info.length,
			0,
		);
		const queueList = currentQueue
			.map(
				(track, index) =>
					`**${start + index + 1}.** [${track.info.title.length > 55 ? `${track.info.title.slice(0, 52)}…` : track.info.title}](${
						track.info.uri
					}) \`${formatTrackDuration(track.info.length)}\``,
			)
			.join('\n');

		const buttons = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(`queue_prev_${page}`)
				.setEmoji('◀️')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === 1),
			new ButtonBuilder()
				.setCustomId(`queue_next_${page}`)
				.setEmoji('▶️')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === totalPages),
		);

		const container = new ContainerBuilder()
			.setAccentColor(
				this.convertColor(this.config.bot.color, {
					from: 'hex',
					to: 'decimal',
				}),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await this.t(interaction, 'music.helpers.handlers.queue.nowplaying', {
						nowTitle: nowPlaying.info.title,
						nowUrl: nowPlaying.info.uri,
						nowDuration: formatTrackDuration(nowPlaying.info.length),
					}),
				),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					queueList ||
						(await this.t(interaction, 'music.helpers.handlers.music.more')),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addActionRowComponents(buttons)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await this.t(interaction, 'music.helpers.handlers.queue.footer', {
						page: page,
						totalPages: totalPages,
						totalTracks: player.queue.length,
					}),
				),
			);

		return {
			components: [container],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		};
	}

	/**
	 * 📜 Handles the 'queue' subcommand and its button interactions.
	 */
	async handleQueue(interaction, player) {
		try {
			if (!interaction.deferred && !interaction.replied) {
				await interaction.deferReply().catch(() => {});
			}
		} catch (_e) {}

		const nowPlaying = player.currentTrack;

		if (!nowPlaying) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.empty'),
				{ color: this.config.bot.color },
			);
			return interaction
				.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				})
				.catch(() => {});
		}

		let initialPage;
		if (interaction.isChatInputCommand?.()) {
			initialPage = interaction.options.getInteger('page') || 1;
		} else {
			initialPage = 1;
		}
		const queueMessageOptions = await this._createQueueEmbed(
			player,
			initialPage,
			interaction,
		);

		const message = await interaction
			.editReply(queueMessageOptions)
			.catch(() => null);
		if (!message) return;

		const collector = message.createMessageComponentCollector({
			filter: (i) => i.user.id === interaction.user.id,
			time: 5 * 60 * 1000,
		});

		collector.on('collect', async (buttonInteraction) => {
			const [action, currentPageStr] = buttonInteraction.customId
				.split('_')
				.slice(1);
			let currentPage = parseInt(currentPageStr, 10);

			if (action === 'next') {
				currentPage++;
			} else if (action === 'prev') {
				currentPage--;
			}

			const updatedMessageOptions = await this._createQueueEmbed(
				player,
				currentPage,
				interaction,
			);

			await buttonInteraction.update(updatedMessageOptions).catch(() => {});
		});

		collector.on('end', async () => {
			if (message?.editable) {
				const finalState = await this._createQueueEmbed(player, 1, interaction);
				finalState.components = [];
				await message.edit(finalState).catch(() => {});
			}
		});
	}
	/**
	 * ℹ️ Handles the 'nowplaying' subcommand.
	 * Triggers a resend of the now playing panel.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */
	async handleNowPlaying(interaction, player) {
		if (!player.currentTrack) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.nowplaying.error',
				),
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const track = player.currentTrack;
		const components = await this.simpleContainer(
			interaction,
			await this.t(
				interaction,
				'music.helpers.handlers.music.nowplaying.text',
				{
					title: track.info.title,
					url: track.info.uri,
					duration: formatTrackDuration(track.info.length),
					author: track.info.author,
				},
			),
			{ color: this.config.bot.color },
		);
		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * 🔁 Handles the 'loop' subcommand.
	 * Sets repeat mode for track or queue.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */
	async handleLoop(interaction, player) {
		const isVote = await this.voteLocked(interaction);
		if (!isVote) return;

		let nextMode;

		if (interaction.isChatInputCommand()) {
			nextMode = interaction.options.getString('mode');
		} else {
			// Determine current state from Poru's native loop property
			const currentLoop = player.loop || 'NONE';
			if (currentLoop === 'NONE') {
				nextMode = 'track';
			} else if (currentLoop === 'TRACK') {
				nextMode = 'queue';
			} else {
				nextMode = 'off';
			}
		}

		let descriptionText = '';

		switch (nextMode) {
			case 'track':
				// Set Poru's native loop property so it actually repeats the track
				player.loop = 'TRACK';
				// Keep custom booleans for UI state checks
				player.trackRepeat = true;
				player.queueRepeat = false;
				descriptionText = await this.t(
					interaction,
					'music.helpers.handlers.music.track',
				);
				break;
			case 'queue':
				// Set Poru's native loop property for queue repeat
				player.loop = 'QUEUE';
				player.trackRepeat = false;
				player.queueRepeat = true;
				descriptionText = await this.t(
					interaction,
					'music.helpers.handlers.music.queue',
				);
				break;
			default:
				// Turn off all looping
				player.loop = 'NONE';
				player.trackRepeat = false;
				player.queueRepeat = false;
				descriptionText = await this.t(
					interaction,
					'music.helpers.handlers.music.off',
				);
				break;
		}

		const components = await this.simpleContainer(
			interaction,
			descriptionText,
			{ color: nextMode === 'off' ? 'Red' : this.config.bot.color },
		);

		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * 🔄 Handles the 'autoplay' subcommand.
	 * Toggles autoplay and disables all loop modes if enabled.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */
	async handleAutoplay(interaction, player) {
		const isPremium = await this.premiumLocked(interaction, 'cute');
		if (!isPremium) return;

		let nextState;

		if (interaction.isChatInputCommand()) {
			const status = interaction.options.getString('status');
			nextState = status === 'enable';
		} else {
			nextState = !player.autoplay;
		}

		player.autoplay = nextState;

		if (player.autoplay) {
			// Disable all loop modes when autoplay is on
			player.loop = 'NONE';
			player.trackRepeat = false;
			player.queueRepeat = false;
		}

		const statusMessage = player.autoplay
			? await this.t(
					interaction,
					'music.helpers.handlers.music.autoplay.enabled.message',
				)
			: await this.t(
					interaction,
					'music.helpers.handlers.music.autoplay.disabled.message',
				);

		const components = await this.simpleContainer(interaction, statusMessage, {
			color: player.autoplay ? this.config.bot.color : 'Red',
		});

		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * 🔊 Handles the 'volume' subcommand.
	 * Sets the playback volume.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */
	async handleVolume(interaction, player) {
		const level = interaction.options.getInteger('level');
		player.setVolume(level);
		const components = await this.simpleContainer(
			interaction,
			await this.t(interaction, 'music.helpers.handlers.music.set', { level }),
			{ color: this.config.bot.color },
		);
		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * 🔀 Handles the 'shuffle' subcommand.
	 * Shuffles the current queue.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */
	async handleShuffle(interaction, player) {
		const isVote = await this.voteLocked(interaction);
		if (!isVote) return;

		await interaction.deferReply();
		if (player.queue.length < 2) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.enough'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		player.queue.shuffle();

		const components = await this.simpleContainer(
			interaction,
			await this.t(interaction, 'music.helpers.handlers.music.shuffled'),
			{ color: this.config.bot.color },
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
	/**
	 * ⏮️ Handles the 'back' subcommand.
	 * Plays the previous track from history.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 * @param {Map} guildStates - The passed guildStates map.
	 */
	async handleBack(interaction, player, guildStates) {
		const container = interaction.client.container;
		const { logger } = container;
		try {
			const guildId = interaction.guildId;
			const guildState = guildStates.get(guildId);

			if (
				!guildState?.previousTracks ||
				guildState.previousTracks.length === 0
			) {
				// Already handled — just use reply directly if not yet deferred
				if (!interaction.deferred && !interaction.replied) {
					await interaction.deferReply();
				}
				const components = await this.simpleContainer(
					interaction,
					await this.t(
						interaction,
						'music.helpers.handlers.music.no.previous.track',
					),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const previousTrack = guildState.previousTracks.shift();

			if (!interaction.deferred && !interaction.replied) {
				await interaction.deferReply();
			}

			if (player.currentTrack) {
				player.queue.unshift(player.currentTrack);
			}

			player.queue.unshift(previousTrack);

			player._isGoingBack = true;
			player.skip();

			player._isGoingBack = false;

			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playing.previous',
					{ title: previousTrack.info.title },
				),
				{ color: this.config.bot.color },
			);

			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error: ${error.message || error}`, {
				label: 'handleback',
			});

			try {
				if (!interaction.deferred && !interaction.replied) {
					return await interaction.reply({
						content: await interaction.client.container.t(
							interaction,
							'music.handlers.error.go_back',
						),
						flags: MessageFlags.Ephemeral,
					});
				}
				return await interaction.editReply({
					content: await interaction.client.container.t(
						interaction,
						'music.handlers.error.go_back',
					),
				});
			} catch (_e) {
				// Interaction may have expired — nothing we can do
			}
		}
	}
	/**
	 * 🎧 Handles the 'filter' subcommand.
	 * Menampilkan UI filter dengan tombol-tombol filter (11 filter, 5-5-1), menggunakan ContainerBuilder dan collector yang tidak mati.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */
	async handleFilter(interaction, player) {
		const isPremium = await this.premiumLocked(interaction, 'powerful');
		if (!isPremium) return;

		if (!(player.filters instanceof customFilter)) {
			player.filters = new customFilter(player);
		}

		const filterList = [
			{ id: 'nightcore', label: 'Nightcore', emoji: '🎶' },
			{ id: 'vaporwave', label: 'Vaporwave', emoji: '🌫️' },
			{ id: 'bassboost', label: 'Bassboost', emoji: '🔊' },
			{ id: 'eightD', label: '8D', emoji: '🌀' },
			{ id: 'karaoke', label: 'Karaoke', emoji: '🎤' },
			{ id: 'vibrato', label: 'Vibrato', emoji: '🎸' },
			{ id: 'tremolo', label: 'Tremolo', emoji: '🎚️' },
			{ id: 'slowed', label: 'Slowed', emoji: '🐢' },
			{ id: 'distortion', label: 'Distortion', emoji: '🤘' },
			{ id: 'pop', label: 'Pop', emoji: '🎧' },
			{ id: 'soft', label: 'Soft', emoji: '🛌' },
		];

		const resetButton = new ButtonBuilder()
			.setCustomId('filter_reset')
			.setLabel('Reset')

			.setStyle(ButtonStyle.Danger);

		const rows = [
			new ActionRowBuilder(),
			new ActionRowBuilder(),
			new ActionRowBuilder(),
		];

		for (let i = 0; i < filterList.length; i++) {
			const filter = filterList[i];
			const btn = new ButtonBuilder()
				.setCustomId(`filter_${filter.id}`)
				.setLabel(filter.label.slice(0, 80))

				.setStyle(ButtonStyle.Secondary);
			if (i < 5) rows[0].addComponents(btn);
			else if (i < 10) rows[1].addComponents(btn);
			else rows[2].addComponents(btn);
		}

		rows[2].addComponents(resetButton);

		const container = new ContainerBuilder()
			.setAccentColor(
				this.convertColor(this.config.bot.color, {
					from: 'hex',
					to: 'decimal',
				}),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await this.t(interaction, 'music.helpers.handlers.filter.title'),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addActionRowComponents(rows[0])
			.addActionRowComponents(rows[1])
			.addActionRowComponents(rows[2])
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await this.t(interaction, 'common.container.footer', {
						username: interaction.client.user.username,
					}),
				),
			);

		let filterMsg;
		if (interaction.replied || interaction.deferred) {
			filterMsg = await interaction.editReply({
				components: [container],
				fetchReply: true,
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			filterMsg = await interaction.reply({
				components: [container],
				fetchReply: true,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (player.filterCollector) player.filterCollector.stop();
		const collector = filterMsg.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 0,
		});
		player.filterCollector = collector;

		collector.on('collect', async (btnInt) => {
			if (btnInt.user.id !== interaction.user.id) {
				return btnInt.reply({
					content: await this.t(
						btnInt,
						'music.helpers.musicManager.music.permission.denied',
					),
					flags: MessageFlags.Ephemeral,
				});
			}

			if (!(player.filters instanceof customFilter)) {
				player.filters = new customFilter(player);
			}

			if (btnInt.customId === 'filter_reset') {
				player.filters.clearFilters(true);
				await player.filters.updateFilters();
				const components = await this.simpleContainer(
					btnInt,
					await this.t(btnInt, 'music.helpers.handlers.music.filter.reset'),
					{ color: this.config.bot.color },
				);
				await btnInt.reply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
				return;
			}

			const filterId = btnInt.customId.replace('filter_', '');
			let applied = false;
			switch (filterId) {
				case 'nightcore':
					player.filters.setNightcore(true);
					applied = true;
					break;
				case 'vaporwave':
					player.filters.setVaporwave(true);
					applied = true;
					break;
				case 'bassboost':
					player.filters.setBassboost(true);
					applied = true;
					break;
				case 'eightD':
					player.filters.set8D(true);
					applied = true;
					break;
				case 'karaoke':
					player.filters.setKaraoke(true);
					applied = true;
					break;
				case 'vibrato':
					player.filters.setVibrato(true);
					applied = true;
					break;
				case 'tremolo':
					player.filters.setTremolo(true);
					applied = true;
					break;
				case 'slowed':
					player.filters.setSlowmode(true);
					applied = true;
					break;
				case 'distortion':
					player.filters.setDistortion(true);
					applied = true;
					break;
				case 'pop':
					player.filters.setEqualizer([
						{ band: 1, gain: 0.35 },
						{ band: 2, gain: 0.25 },
						{ band: 3, gain: 0.0 },
						{ band: 4, gain: -0.25 },
						{ band: 5, gain: -0.3 },
						{ band: 6, gain: -0.2 },
						{ band: 7, gain: -0.1 },
						{ band: 8, gain: 0.15 },
						{ band: 9, gain: 0.25 },
					]);
					applied = true;
					break;
				case 'soft':
					player.filters.setEqualizer([
						{ band: 0, gain: 0 },
						{ band: 1, gain: 0 },
						{ band: 2, gain: 0 },
						{ band: 3, gain: 0 },
						{ band: 4, gain: 0 },
						{ band: 5, gain: 0 },
						{ band: 6, gain: 0 },
						{ band: 7, gain: 0 },
						{ band: 8, gain: -0.25 },
						{ band: 9, gain: -0.25 },
						{ band: 10, gain: -0.25 },
						{ band: 11, gain: -0.25 },
						{ band: 12, gain: -0.25 },
						{ band: 13, gain: -0.25 },
					]);
					applied = true;
					break;
				default:
					break;
			}

			if (applied) {
				await player.filters.updateFilters();
				const components = await this.simpleContainer(
					btnInt,
					await this.t(btnInt, 'music.helpers.handlers.music.filter.applied', {
						preset: filterId,
					}),
					{ color: this.config.bot.color },
				);
				await btnInt.reply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				const components = await this.simpleContainer(
					btnInt,
					await this.t(
						btnInt,
						'music.helpers.handlers.music.filter.not.available',
						{ preset: filterId },
					),
					{ color: 'Orange' },
				);
				await btnInt.reply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		});

		player.on('destroy', () => {
			if (player.filterCollector) player.filterCollector.stop();
			player.filterCollector = null;
		});
	}

	/**
	 * 🗑️ Handles the 'remove' subcommand.
	 * Removes a song from the queue at the given position.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */
	async handleRemove(interaction, player) {
		const position = interaction.options.getInteger('position');
		if (
			!Number.isInteger(position) ||
			position < 1 ||
			position > player.queue.length
		) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.position', {
					size: player.queue.length,
				}),
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const removed = player.queue.splice(position - 1, 1);
		if (!removed || removed.length === 0) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.failed'),
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const track = removed[0];
		const components = await this.simpleContainer(
			interaction,
			await this.t(interaction, 'music.helpers.handlers.music.removed', {
				title: track.info.title,
				url: track.info.uri,
				position,
			}),
			{ color: this.config.bot.color },
		);
		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * 🔀 Handles the 'move' subcommand.
	 * Moves a song from one position to another in the queue.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */
	async handleMove(interaction, player) {
		const from = interaction.options.getInteger('from');
		const to = interaction.options.getInteger('to');
		const queueSize = player.queue.length;

		if (
			!Number.isInteger(from) ||
			!Number.isInteger(to) ||
			from < 1 ||
			from > queueSize ||
			to < 1 ||
			to > queueSize
		) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.positions', {
					size: queueSize,
				}),
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (from === to) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.position'),
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const trackArr = player.queue.splice(from - 1, 1);
		const track = trackArr[0];
		if (!track) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.music.found'),
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		player.queue.splice(to - 1, 0, track);

		const components = await this.simpleContainer(
			interaction,
			await this.t(interaction, 'music.helpers.handlers.music.moved', {
				title: track.info.title,
				url: track.info.uri,
				from,
				to,
			}),
			{ color: this.config.bot.color },
		);
		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	async handleClear(interaction, player) {
		player.queue.clear();
		const components = await this.simpleContainer(
			interaction,
			await this.t(interaction, 'music.helpers.handlers.music.clear'),
			{ color: this.config.bot.color },
		);
		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	async handleSeek(interaction, player) {
		const timeInput =
			interaction.options.getString('time') ??
			interaction.options.getInteger('time');
		let seconds = 0;

		if (typeof timeInput === 'string') {
			const timeParts = timeInput
				.split(':')
				.map(Number)
				.filter((n) => !Number.isNaN(n));
			if (timeParts.length === 1) {
				seconds = timeParts[0];
			} else if (timeParts.length === 2) {
				seconds = timeParts[0] * 60 + timeParts[1];
			} else if (timeParts.length === 3) {
				seconds = timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
			} else {
				seconds = 0;
			}
		} else if (typeof timeInput === 'number') {
			seconds = timeInput;
		}

		if (Number.isNaN(seconds) || seconds < 0) {
			const components = await this.simpleContainer(
				interaction,
				'❌ Invalid time format! Please use seconds or mm:ss or hh:mm:ss format.',
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		player.seekTo(seconds * 1000);
		const components = await this.simpleContainer(
			interaction,
			await this.t(interaction, 'music.helpers.handlers.music.seeked', {
				time: seconds,
			}),
			{ color: this.config.bot.color },
		);
		return interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	async handleLyrics(interaction, player) {
		await interaction.deferReply({ flags: MessageFlags.IsComponentsV2 });

		const track = player.currentTrack;
		if (!track) {
			const container = new ContainerBuilder().addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await this.t(
						interaction,
						'music.helpers.handlers.music.lyrics.music.not.found',
					),
				),
			);
			return interaction.editReply({
				components: [container],
				flags: MessageFlags.IsComponentsV2,
			});
		}

		let artist, titleForSearch, album, _durationSec;
		const separators = ['-', '–', '|'];
		let potentialSplit = null;
		const originalTitle = track.info.title || '';

		for (const sep of separators) {
			if (originalTitle.includes(sep)) {
				potentialSplit = originalTitle.split(sep);
				break;
			}
		}

		if (potentialSplit && potentialSplit.length >= 2) {
			artist = potentialSplit[0].trim();
			titleForSearch = potentialSplit.slice(1).join(' ').trim();
		} else {
			artist = track.info.author || '';
			titleForSearch = originalTitle;
		}

		const cleanUpRegex = /official|lyric|video|audio|mv|hd|hq|ft|feat/gi;
		artist = artist.replace(cleanUpRegex, '').trim();
		titleForSearch = titleForSearch.replace(cleanUpRegex, '').trim();
		titleForSearch = titleForSearch.replace(/\(.*?\)|\[.*?\]/g, '').trim();

		album = track.info.album || '';
		if (album)
			album = album
				.replace(cleanUpRegex, '')
				.replace(/\(.*?\)|\[.*?\]/g, '')
				.trim();
		_durationSec = Math.round((track.info.length || 0) / 1000);

		if (
			!album &&
			track.info.sourceName &&
			track.info.sourceName.toLowerCase().includes('spotify')
		) {
			album = track.info.album || '';
		}
		if (!album) album = '';

		let lyrics = null;
		let usedLrclib = false;
		let usedAI = false;
		let foundRecord = null;

		try {
			const params = new URLSearchParams();

			if (titleForSearch) {
				params.set('track_name', titleForSearch);
			} else if (originalTitle) {
				params.set('q', originalTitle);
			}

			if (artist) params.set('artist_name', artist);
			if (album) params.set('album_name', album);

			const headers = {
				'User-Agent': 'KythiaBot (https://github.com/kythia/kythia)',
			};

			const lrclibUrl = `https://lrclib.net/api/search?${params.toString()}`;
			const response = await fetch(lrclibUrl, { headers });
			if (response.status === 200) {
				const list = await response.json();

				if (Array.isArray(list) && list.length > 0) {
					foundRecord =
						list.find((record) => {
							return (
								record.trackName &&
								record.artistName &&
								record.trackName
									.toLowerCase()
									.includes(titleForSearch.toLowerCase()) &&
								record.artistName.toLowerCase().includes(artist.toLowerCase())
							);
						}) || list[0];

					if (
						foundRecord &&
						(foundRecord.plainLyrics || foundRecord.syncedLyrics)
					) {
						lyrics = foundRecord.plainLyrics || foundRecord.syncedLyrics;
						usedLrclib = true;
					}
				}
			}
		} catch (e) {
			this.logger.error(`LRCLIB API request failed: ${e.stack}`, {
				label: 'music',
			});
		}

		if (
			!lyrics &&
			this.config.addons.ai.geminiApiKeys &&
			this.config.addons.music.useAI
		) {
			try {
				lyrics = await generateLyricsWithTranscript(
					interaction.client.container,
					artist,
					titleForSearch,
					track.info.uri,
				);
				usedAI = !!lyrics;
			} catch (e) {
				this.logger.error(`Gemini AI lyrics generation failed: ${e.stack}`, {
					label: 'music',
				});
			}
		}

		if (!lyrics) {
			const container = new ContainerBuilder()
				.setAccentColor(
					this.convertColor(this.config.bot.color, {
						from: 'hex',
						to: 'decimal',
					}),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await this.t(
							interaction,
							'music.helpers.handlers.music.lyrics.lyrics.not.found',
						),
					),
				);
			return interaction.editReply({
				components: [container],
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const trimmedLyrics =
			lyrics.length > 4096 ? `${lyrics.substring(0, 4093)}...` : lyrics;

		let footerText;
		if (usedLrclib) {
			footerText = '-# Source: lrclib.net';
		} else if (usedAI) {
			footerText = '-# Generated by AI';
		} else {
			footerText = await this.t(interaction, 'core.utils.about.embed.footer');
		}

		let embedArtist = artist,
			embedTitle = titleForSearch;
		if (foundRecord) {
			embedArtist = foundRecord.artistName || embedArtist;
			embedTitle = foundRecord.trackName || embedTitle;
		}

		const container = new ContainerBuilder()
			.setAccentColor(
				this.convertColor(this.config.bot.color, {
					from: 'hex',
					to: 'decimal',
				}),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await this.t(
						interaction,
						'music.helpers.handlers.music.lyrics.title_md',
						{ artist: embedArtist, title: embedTitle },
					),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems([
					new MediaGalleryItemBuilder().setURL(
						track.info.artworkUrl ?? track.info.image ?? null,
					),
				]),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(trimmedLyrics),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(footerText),
			);

		return interaction.editReply({
			components: [container],
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * 🎤 Handles the karaoke (live lyrics) mode toggle.
	 *
	 * First press  → subscribe to LavaLyrics, send a SEPARATE karaoke message.
	 * Second press → unsubscribe, auto-delete the karaoke message.
	 *
	 * The karaoke message is intentionally separate from the Now Playing embed
	 * to avoid hitting Discord's edit rate limit (~5 edits/5s) on the main UI.
	 *
	 * @param {import('discord.js').ButtonInteraction} interaction
	 * @param {object} player - Poru Player
	 */
	async handleKaraoke(interaction, player) {
		const track = player.currentTrack;

		if (!track) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.lyrics.music.not.found',
				),
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const karaokeManager = this.container.music?.karaokeManager;
		if (!karaokeManager) {
			const components = await this.simpleContainer(
				interaction,
				'❌ Karaoke manager not available.',
				{ color: 'Red' },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// ── Toggle OFF ──────────────────────────────────────────────────────────
		if (player.lyricsSubscribed && karaokeManager.hasSession(player.guildId)) {
			await karaokeManager.stopSession(player).catch(() => {});

			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.karaoke.stopped',
				),
				{ color: this.config.bot.color },
			);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// ── Toggle ON ───────────────────────────────────────────────────────────
		const channel = interaction.channel;
		if (!channel) {
			return interaction.reply({
				content: await interaction.client.container.t(
					interaction,
					'music.handlers.error.no_channel',
				),
				flags: MessageFlags.Ephemeral,
			});
		}

		// Acknowledge immediately before the async subscribe call
		const components = await this.simpleContainer(
			interaction,
			await this.t(
				interaction,
				'music.helpers.handlers.music.karaoke.starting',
			),
			{ color: this.config.bot.color },
		);
		await interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});

		const ok = await karaokeManager.startSession(player, channel);

		if (!ok) {
			// LavaLyrics plugin not installed / node error — show graceful failure
			const fallbackComponents = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.karaoke.failed',
				),
				{ color: 'Orange' },
			);
			try {
				await interaction.editReply({
					components: fallbackComponents,
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (_e) {}
		}
	}

	async handlePlaylist(interaction, player) {
		await interaction.deferReply();

		if (
			player &&
			player.voiceChannel !== interaction.member.voice.channel?.id
		) {
			if (await this.isLocked(interaction, player)) {
				const msg = await this.t(
					interaction,
					'music.helpers.handlers.247.locked_error',
					{ defaultValue: '❌ This 24/7 session is locked by another user!' },
				);
				const components = await this.simpleContainer(interaction, msg, {
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}

		const s = interaction.options.getSubcommand();
		if (s === 'save') return this._handlePlaylistSave(interaction, player);
		if (s === 'load') return this._handlePlaylistLoad(interaction, player);
		if (s === 'list') return this._handlePlaylistList(interaction);
		if (s === 'delete') return this._handlePlaylistDelete(interaction);
		if (s === 'append') return this._handlePlaylistAppend(interaction, player);
		if (s === 'rename') return this._handlePlaylistRename(interaction);
		if (s === 'track-remove')
			return this._handlePlaylistRemoveTrack(interaction);
		if (s === 'track-list') return this._handlePlaylistTrackList(interaction);
		if (s === 'track-add') return this._handlePlaylistTrackAdd(interaction);
		if (s === 'share') return this._handlePlaylistShare(interaction);
		if (s === 'import') return this._handlePlaylistImport(interaction);
	}

	async _handlePlaylistSave(interaction, player) {
		const playlistName = interaction.options.getString('name');
		const userId = interaction.user.id;

		const playlistCount = await this.Playlist.countCache({
			where: { userId },
		});
		const userIsPremium = await this.isPremium(this.container, userId);

		if (
			!this.isOwner(interaction.user.id) &&
			playlistCount >= this.config.addons.music.playlistLimit &&
			!userIsPremium
		) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.save.limit.desc',
					{ count: this.config.addons.music.playlistLimit },
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (!player || (!player.currentTrack && player.queue.length === 0)) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.save.empty.queue',
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const existing = await this.Playlist.getCache({
			userId: userId,
			name: playlistName,
		});
		if (existing) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.save.duplicate',
					{ name: playlistName },
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const playlist = await this.Playlist.create({ userId, name: playlistName });

		const tracksToSave = [];
		if (player.currentTrack) {
			tracksToSave.push({
				playlistId: playlist.id,
				title: player.currentTrack.info.title,
				identifier: player.currentTrack.info.identifier,
				author: player.currentTrack.info.author,
				length: player.currentTrack.info.length,
				uri: player.currentTrack.info.uri,
			});
		}
		for (const track of player.queue) {
			tracksToSave.push({
				playlistId: playlist.id,
				title: track.info.title,
				identifier: track.info.identifier,
				author: track.info.author,
				length: track.info.length,
				uri: track.info.uri,
			});
		}

		await this.PlaylistTrack.bulkCreate(tracksToSave);

		const components = await this.simpleContainer(
			interaction,
			await this.t(
				interaction,
				'music.helpers.handlers.music.playlist.save.success',
				{
					name: playlistName,
					count: tracksToSave.length,
				},
			),
			{ color: this.config.bot.color },
		);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	async _handlePlaylistLoad(interaction, player) {
		const client = interaction.client;
		const playlistName = interaction.options.getString('name');
		const userId = interaction.user.id;

		const playlist = await this.Playlist.getCache({
			userId: userId,
			name: playlistName,

			include: [{ model: this.PlaylistTrack, as: 'tracks' }],
		});

		if (!playlist) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.load.not.found',
					{ name: playlistName },
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (!playlist.tracks || playlist.tracks.length === 0) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.load.empty',
					{ name: playlistName },
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (player) {
			player.queue.clear();
		}

		const newPlayer =
			player ||
			client.poru.createConnection({
				guildId: interaction.guild.id,
				voiceChannel: interaction.member.voice.channel.id,
				textChannel: interaction.channel.id,
				deaf: true,
			});

		let added = 0;
		for (const trackData of playlist.tracks) {
			const poruTrack = await client.poru.resolve({
				query: trackData.uri,
				requester: interaction.user,
			});
			if (poruTrack.tracks?.[0]) {
				newPlayer.queue.add(poruTrack.tracks[0]);
				added++;
			}
		}

		if (!newPlayer.isPlaying) newPlayer.play();

		const components = await this.simpleContainer(
			interaction,
			await this.t(
				interaction,
				'music.helpers.handlers.music.playlist.load.success',
				{ count: added, name: playlistName },
			),
			{ color: this.config.bot.color },
		);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	async _createPlaylistListContainer(
		interaction,
		playlists,
		itemsPerPage,
		totalPages,
		page = 1,
	) {
		page = Math.max(1, Math.min(page, totalPages));
		const start = (page - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		const currentPagePlaylists = playlists.slice(start, end);

		const list = currentPagePlaylists
			.map((p, idx) => `**${start + idx + 1}.** ${p.name}`)
			.join('\n');

		const buttons = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(`playlistlist_prev_${page}`)
				.setEmoji('◀️')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === 1),
			new ButtonBuilder()
				.setCustomId(`playlistlist_next_${page}`)
				.setEmoji('▶️')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === totalPages),
		);

		const container = new ContainerBuilder()
			.setAccentColor(
				this.convertColor(this.config.bot.color, {
					from: 'hex',
					to: 'decimal',
				}),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`${await this.t(interaction, 'music.helpers.handlers.music.playlist.list.title')}`,
				),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					list ||
						(await this.t(
							interaction,
							'music.helpers.handlers.music.playlist.list.empty',
						)),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addActionRowComponents(buttons)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await this.t(interaction, 'music.helpers.handlers.queue.footer', {
						page: page,
						totalPages: totalPages,
						totalTracks: playlists.length,
					}),
				),
			);

		return {
			components: [container],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		};
	}

	async _handlePlaylistList(interaction) {
		const userId = interaction.user.id;

		const playlists = await this.Playlist.getAllCache({
			where: { userId: userId },
			order: [['name', 'ASC']],
			cacheTags: [`Playlist:byUser:${userId}`],
		});

		if (!playlists || playlists.length === 0) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.list.empty',
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const itemsPerPage = 10;
		const totalPages = Math.ceil(playlists.length / itemsPerPage) || 1;

		let initialPage = 1;
		if (interaction.isChatInputCommand()) {
			initialPage = interaction.options.getInteger('page') || 1;
		}

		const messageOptions = await this._createPlaylistListContainer(
			interaction,
			playlists,
			itemsPerPage,
			totalPages,
			initialPage,
		);
		const message = await interaction.editReply(messageOptions);

		const collector = message.createMessageComponentCollector({
			filter: (i) => i.user.id === interaction.user.id,
			time: 5 * 60 * 1000,
		});

		collector.on('collect', async (buttonInteraction) => {
			const [_prefix, action, currentPageStr] =
				buttonInteraction.customId.split('_');
			let currentPage = parseInt(currentPageStr, 10);

			if (action === 'next') {
				currentPage++;
			} else if (action === 'prev') {
				currentPage--;
			}

			const updatedMessageOptions = await this._createPlaylistListContainer(
				buttonInteraction,
				playlists,
				itemsPerPage,
				totalPages,
				currentPage,
			);
			await buttonInteraction.update(updatedMessageOptions);
		});

		collector.on('end', async () => {
			if (message.editable) {
				const finalState = await this._createPlaylistListContainer(
					interaction,
					playlists,
					itemsPerPage,
					totalPages,
					1,
				);
				finalState.components = [];
				await message.edit(finalState).catch(() => {});
			}
		});
	}

	async _handlePlaylistDelete(interaction) {
		const _client = interaction.client;
		const playlistName = interaction.options.getString('name');
		const userId = interaction.user.id;

		const playlist = await this.Playlist.getCache({
			userId: userId,
			name: playlistName,
		});
		if (!playlist) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.delete.not.found',
					{ name: playlistName },
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		await this.PlaylistTrack.destroy({ where: { playlistId: playlist.id } });
		await playlist.destroy();

		const components = await this.simpleContainer(
			interaction,
			await this.t(
				interaction,
				'music.helpers.handlers.music.playlist.delete.success',
				{ name: playlistName },
			),
			{ color: this.config.bot.color },
		);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	async _handlePlaylistAppend(interaction, player) {
		const { client, user } = interaction;
		const playlistName = interaction.options.getString('name');

		if (!player) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.append.no.player',
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const playlist = await this.Playlist.getCache({
			userId: user.id,
			name: playlistName,
			include: { model: this.PlaylistTrack, as: 'tracks' },
		});

		if (!playlist) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.load.not.found',
					{ name: playlistName },
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (!playlist.tracks || playlist.tracks.length === 0) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.load.empty',
					{ name: playlistName },
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		let addedCount = 0;

		for (const trackData of playlist.tracks) {
			const res = await client.poru.resolve({
				query: trackData.uri,
				requester: user,
			});
			if (res?.tracks.length) {
				player.queue.add(res.tracks[0]);
				addedCount++;
			}
		}

		const components = await this.simpleContainer(
			interaction,
			await this.t(
				interaction,
				'music.helpers.handlers.music.playlist.append.success.v2',
				{
					count: addedCount,
					name: playlistName,
				},
			),
			{ color: this.config.bot.color },
		);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	async _handlePlaylistRemoveTrack(interaction) {
		const _client = interaction.client;
		const playlistName = interaction.options.getString('name');
		const position = interaction.options.getInteger('position');
		const userId = interaction.user.id;

		const playlist = await this.Playlist.getCache({
			userId: userId,
			name: playlistName,
			include: [
				{ model: this.PlaylistTrack, as: 'tracks', order: [['id', 'ASC']] },
			],
		});

		if (!playlist) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.remove.track.not.found',
					{ name: playlistName },
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (!playlist.tracks || playlist.tracks.length === 0) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.remove.track.empty',
					{ name: playlistName },
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (position < 1 || position > playlist.tracks.length) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.remove.track.invalid.position',
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const track = playlist.tracks[position - 1];
		await track.destroy();

		const components = await this.simpleContainer(
			interaction,
			await this.t(
				interaction,
				'music.helpers.handlers.music.playlist.remove.track.success',
				{ position, name: playlistName },
			),
			{ color: this.config.bot.color },
		);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	async _handlePlaylistRename(interaction) {
		const _client = interaction.client;
		const playlistName = interaction.options.getString('name');
		const newName = interaction.options.getString('new_name');
		const userId = interaction.user.id;

		const playlist = await this.Playlist.getCache({
			userId: userId,
			name: playlistName,
		});
		if (!playlist) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.rename.not.found',
					{ name: playlistName },
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const existing = await this.Playlist.getCache({
			userId: userId,
			name: newName,
		});
		if (existing) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.rename.duplicate',
					{ name: newName },
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		playlist.name = newName;
		await playlist.save();

		const components = await this.simpleContainer(
			interaction,
			await this.t(
				interaction,
				'music.helpers.handlers.music.playlist.rename.success',
				{ oldName: playlistName, newName },
			),
			{ color: this.config.bot.color },
		);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	async _createTrackListContainer(
		interaction,
		playlist,
		page = 1,
		itemsPerPage,
		totalPages,
	) {
		page = Math.max(1, Math.min(page, totalPages));
		const start = (page - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		const currentTracks = playlist.tracks.slice(start, end);

		const trackList = currentTracks
			.map((t, i) => `**${start + i + 1}.** [${t.title}](${t.uri})`)
			.join('\n');

		const buttons = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(`playlisttracklist_prev_${page}`)
				.setEmoji('◀️')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === 1),
			new ButtonBuilder()
				.setCustomId(`playlisttracklist_next_${page}`)
				.setEmoji('▶️')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === totalPages),
		);

		const container = new ContainerBuilder()
			.setAccentColor(
				this.convertColor(this.config.bot.color, {
					from: 'hex',
					to: 'decimal',
				}),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					(await this.t(
						interaction,
						'music.helpers.handlers.music.playlist.track.list.title',
						{ name: playlist.name },
					)) || playlist.name,
				),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					trackList ||
						(await this.t(interaction, 'music.helpers.handlers.music.more')),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addActionRowComponents(buttons)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await this.t(interaction, 'music.helpers.handlers.queue.footer', {
						page: page,
						totalPages: totalPages,
						totalTracks: playlist.tracks.length,
					}),
				),
			);

		return {
			components: [container],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		};
	}

	async _handlePlaylistTrackList(interaction) {
		const _client = interaction.client;
		const playlistName = interaction.options.getString('name');
		const userId = interaction.user.id;

		const playlistRaw = await this.Playlist.getCache({
			userId: userId,
			name: playlistName,

			include: [{ model: this.PlaylistTrack, as: 'tracks' }],
		});
		const playlist = Array.isArray(playlistRaw) ? playlistRaw[0] : playlistRaw;
		if (!playlist) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.track.list.not.found',
					{ name: playlistName },
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (!playlist.tracks || playlist.tracks.length === 0) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.track.list.empty',
					{ name: playlistName },
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const itemsPerPage = 10;
		const totalPages = Math.ceil(playlist.tracks.length / itemsPerPage) || 1;

		const initialPage = 1;
		const messageOptions = await this._createTrackListContainer(
			interaction,
			playlist,
			initialPage,
			itemsPerPage,
			totalPages,
		);

		const message = await interaction.editReply(messageOptions);

		const collector = message.createMessageComponentCollector({
			filter: (i) => i.user.id === interaction.user.id,
			time: 5 * 60 * 1000,
		});

		collector.on('collect', async (buttonInteraction) => {
			const [action, currentPageStr] = buttonInteraction.customId
				.split('_')
				.slice(1);
			let currentPage = parseInt(currentPageStr, 10);

			if (action === 'next') {
				currentPage++;
			} else if (action === 'prev') {
				currentPage--;
			}

			const updatedMessageOptions = await this._createTrackListContainer(
				interaction,
				playlist,
				currentPage,
				itemsPerPage,
				totalPages,
			);

			await buttonInteraction.update(updatedMessageOptions);
		});

		collector.on('end', async () => {
			if (message.editable) {
				const finalState = await this._createTrackListContainer(
					interaction,
					playlist,
					1,
					itemsPerPage,
					totalPages,
				);
				finalState.components = [];
				await message.edit(finalState).catch(() => {});
			}
		});
	}

	async _handlePlaylistTrackAdd(interaction) {
		const { client, user } = interaction;
		const playlistName = interaction.options.getString('name');
		const query = interaction.options.getString('search');

		const playlist = await this.Playlist.getCache({
			userId: user.id,
			name: playlistName,
		});
		if (!playlist) {
			return interaction.editReply({
				content: await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.load.not.found',
					{ name: playlistName },
				),
			});
		}

		const res = await client.poru.resolve({ query, requester: user });
		if (!res?.tracks || res.tracks.length === 0) {
			return interaction.editReply({
				content: await this.t(
					interaction,
					'music.helpers.handlers.music.play.no.results',
				),
			});
		}

		const trackToAdd = res.tracks[0];

		const existingTrack = await this.PlaylistTrack.getCache({
			playlistId: playlist.id,

			identifier: trackToAdd.info.identifier,
		});

		if (existingTrack) {
			return interaction.editReply({
				content: await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.track.add.duplicate',
					{
						track: trackToAdd.info.title,
						name: playlistName,
					},
				),
			});
		}

		try {
			await this._saveTracksToPlaylist(playlist, [trackToAdd]);

			await interaction.editReply({
				content: await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.track.add.success',
					{
						track: trackToAdd.info.title,
						name: playlistName,
					},
				),
			});
		} catch (e) {
			this.logger.error(`Error adding track to playlist: ${e.message || e}`, {
				label: 'music',
			});
			await interaction.editReply({
				content: await this.t(
					interaction,
					'music.helpers.handlers.music.playlist.track.add.error',
				),
			});
		}
	}

	async _handlePlaylistShare(interaction) {
		const playlistName = interaction.options.getString('name');
		const userId = interaction.user.id;

		const playlist = await this.Playlist.getCache({
			userId: userId,
			name: playlistName,
		});
		if (!playlist) {
			const components = await this.simpleContainer(
				interaction,
				`${await this.t(interaction, 'music.helpers.handlers.playlist.share.not.found.title')}\n${await this.t(
					interaction,
					'music.helpers.handlers.playlist.share.not.found.desc',
					{ name: playlistName },
				)}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		let shareCode = playlist.shareCode;

		if (!shareCode) {
			shareCode = `KYPL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
			playlist.shareCode = shareCode;
			await playlist.save();
		}

		const components = await this.simpleContainer(
			interaction,
			`${await this.t(interaction, 'music.helpers.handlers.playlist.share.title', { name: playlist.name })}\n${await this.t(
				interaction,
				'music.helpers.handlers.playlist.share.desc',
			)}\n\n**${await this.t(interaction, 'music.helpers.handlers.playlist.share.code.label')}**: \`${shareCode}\``,
			{ color: this.config.bot.color },
		);

		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * 📥 Import playlist from share code or Spotify URL.
	 */
	async _handlePlaylistImport(interaction) {
		const codeOrUrl = interaction.options.getString('code');
		const userId = interaction.user.id;

		if (
			/^https?:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]+/i.test(
				codeOrUrl.trim(),
			)
		) {
			return this._importFromSpotify(interaction, codeOrUrl);
		}

		try {
			const originalPlaylist = await this.Playlist.getCache({
				shareCode: codeOrUrl,

				include: [{ model: this.PlaylistTrack, as: 'tracks' }],
			});

			if (!originalPlaylist) {
				const components = await this.simpleContainer(
					interaction,
					`${await this.t(interaction, 'music.helpers.handlers.playlist.import.invalid.title')}\n${await this.t(
						interaction,
						'music.helpers.handlers.playlist.import.invalid.desc',
					)}`,
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			let newPlaylistName = originalPlaylist.name;

			const existing = await this.Playlist.getCache({
				userId: userId,
				name: newPlaylistName,
			});
			if (existing) {
				newPlaylistName = `${newPlaylistName} (Share)`;
			}

			const playlistCount = await this.Playlist.countCache({
				userId: userId,
			});
			const userIsPremium = await this.isPremium(this.container, userId);
			if (
				!this.isOwner(userId) &&
				playlistCount >= this.config.addons.music.playlistLimit &&
				!userIsPremium
			) {
				const components = await this.simpleContainer(
					interaction,
					`${await this.t(interaction, 'music.helpers.handlers.music.playlist.save.limit.title')}\n${await this.t(
						interaction,
						'music.helpers.handlers.music.playlist.save.limit.desc',
						{ count: this.config.addons.music.playlistLimit },
					)}`,
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const newPlaylist = await this.Playlist.create({
				userId: userId,
				name: newPlaylistName,
			});

			const tracksToCopy = originalPlaylist.tracks.map((track) => ({
				playlistId: newPlaylist.id,
				title: track.title,
				identifier: track.identifier,
				author: track.author,
				length: track.length,
				uri: track.uri,
			}));

			await this.PlaylistTrack.bulkCreate(tracksToCopy);

			const components = await this.simpleContainer(
				interaction,
				`${await this.t(interaction, 'music.helpers.handlers.playlist.import.success.title')}\n${await this.t(
					interaction,
					'music.helpers.handlers.playlist.import.success.desc',
					{
						original: originalPlaylist.name,
						name: newPlaylist.name,
						count: tracksToCopy.length,
					},
				)}`,
				{ color: this.config.bot.color },
			);

			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			this.logger.error(
				`Playlist import from code failed: ${error.message || error}`,
				{
					label: 'music',
				},
			);
			const components = await this.simpleContainer(
				interaction,
				`${await this.t(interaction, 'music.helpers.handlers.playlist.import.error.title')}\n${await this.t(interaction, 'music.helpers.handlers.playlist.import.error.desc')}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}

	async _importFromSpotify(interaction, url) {
		const { client, user } = interaction;
		const userId = user.id;

		const res = await client.poru.resolve({
			query: url,
			requester: user,
		});
		if (res?.loadType !== 'PLAYLIST_LOADED' || !res.tracks.length) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.playlist.import.failed',
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const spotifyPlaylistName = res.playlistInfo.name;
		const tracksFromSpotify = res.tracks;

		const existingPlaylist = await this.Playlist.getCache({
			userId: userId,
			name: spotifyPlaylistName,
		});

		if (existingPlaylist) {
			const container = new ContainerBuilder()
				.setAccentColor(
					this.convertColor('Yellow', { from: 'discord', to: 'decimal' }),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await this.t(
							interaction,
							'music.helpers.handlers.playlist.import.duplicate.prompt',
							{ name: spotifyPlaylistName },
						),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addActionRowComponents(
					new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('import_overwrite')
							.setLabel(
								await this.t(
									interaction,
									'music.helpers.handlers.playlist.import.btn.overwrite',
								),
							)
							.setStyle(ButtonStyle.Danger),
						new ButtonBuilder()
							.setCustomId('import_copy')
							.setLabel(
								await this.t(
									interaction,
									'music.helpers.handlers.playlist.import.btn.copy',
								),
							)
							.setStyle(ButtonStyle.Primary),
						new ButtonBuilder()
							.setCustomId('import_cancel')
							.setLabel(
								await this.t(
									interaction,
									'music.helpers.handlers.playlist.import.btn.cancel',
								),
							)
							.setStyle(ButtonStyle.Secondary),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await this.t(interaction, 'common.container.footer', {
							username: client.user.username,
						}),
					),
				);

			const reply = await interaction.editReply({
				components: [container],
				flags: MessageFlags.IsComponentsV2,
			});

			const collector = reply.createMessageComponentCollector({
				filter: (i) => i.user.id === user.id,
				time: 60000,
			});

			collector.on('collect', async (i) => {
				await i.deferUpdate();

				if (i.customId === 'import_overwrite') {
					await this.PlaylistTrack.destroy({
						where: { playlistId: existingPlaylist.id },
					});
					await this._saveTracksToPlaylist(existingPlaylist, tracksFromSpotify);

					const successComponents = await this.simpleContainer(
						interaction,
						await this.t(
							interaction,
							'music.helpers.handlers.playlist.import.overwrite.success',
							{
								count: tracksFromSpotify.length,
								name: spotifyPlaylistName,
								source: 'spotify',
							},
						),
						{ color: this.config.bot.color },
					);
					await i.editReply({
						components: successComponents,
						flags: MessageFlags.IsComponentsV2,
					});
				} else if (i.customId === 'import_copy') {
					let newName = '';
					let copyNum = 1;
					let isNameAvailable = false;

					while (!isNameAvailable) {
						newName = `${spotifyPlaylistName} (${copyNum})`;
						const check = await this.Playlist.getCache({
							userId: userId,
							name: newName,
						});
						if (!check) {
							isNameAvailable = true;
						} else {
							copyNum++;
						}
					}

					const newPlaylist = await this.Playlist.create({
						userId,
						name: newName,
					});
					await this._saveTracksToPlaylist(newPlaylist, tracksFromSpotify);

					const successComponents = await this.simpleContainer(
						interaction,
						await this.t(
							interaction,
							'music.helpers.handlers.playlist.import.copy.success',
							{
								count: tracksFromSpotify.length,
								newName: newName,
								source: 'spotify',
							},
						),
						{ color: this.config.bot.color },
					);
					await i.editReply({
						components: successComponents,
						flags: MessageFlags.IsComponentsV2,
					});
				} else if (i.customId === 'import_cancel') {
					const cancelComponents = await this.simpleContainer(
						interaction,
						await this.t(
							interaction,
							'music.helpers.handlers.playlist.import.cancelled',
						),
						{ color: 'Grey' },
					);
					await i.editReply({
						components: cancelComponents,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				collector.stop();
			});

			collector.on('end', async (_collected, reason) => {
				if (reason === 'time') {
					const timeoutComponents = await this.simpleContainer(
						interaction,
						await this.t(
							interaction,
							'music.helpers.handlers.playlist.import.timeout',
						),
						{ color: 'Red' },
					);
					interaction.editReply({
						components: timeoutComponents,
						flags: MessageFlags.IsComponentsV2,
					});
				}
			});
		} else {
			const playlistCount = await this.Playlist.countCache({
				userId: userId,
			});
			const userIsPremium = await this.isPremium(this.container, userId);
			if (
				!this.isOwner(userId) &&
				playlistCount >= this.config.addons.music.playlistLimit &&
				!userIsPremium
			) {
				const components = await this.simpleContainer(
					interaction,
					await this.t(
						interaction,
						'music.helpers.handlers.music.playlist.save.limit.desc',
						{ count: this.config.addons.music.playlistLimit },
					),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const newPlaylist = await this.Playlist.create({
				userId,
				name: spotifyPlaylistName,
			});
			await this._saveTracksToPlaylist(newPlaylist, tracksFromSpotify);

			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.playlist.import.success.text',
					{
						count: tracksFromSpotify.length,
						name: spotifyPlaylistName,
						source: 'spotify',
					},
				),
				{ color: this.config.bot.color },
			);
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}

	async _saveTracksToPlaylist(playlist, tracks) {
		const tracksToSave = tracks.map((track) => ({
			playlistId: playlist.id,
			title: track.info.title,
			identifier: track.info.identifier,
			author: track.info.author,
			length: track.info.length,
			uri: track.info.uri,
		}));
		await this.PlaylistTrack.bulkCreate(tracksToSave);
	}

	handleFavorite(interaction, player) {
		let s;
		if (interaction.isChatInputCommand()) {
			s = interaction.options.getSubcommand();
		} else {
			s = interaction.customId.split('_')[2];
		}
		if (s === 'play') return this._handleFavoritePlay(interaction, player);
		if (s === 'list') return this._handleFavoriteList(interaction);
		if (s === 'add') return this._handleFavoriteAdd(interaction, player);
		if (s === 'remove') return this._handleFavoriteRemove(interaction);
	}

	async _handleFavoritePlay(interaction, player) {
		await interaction.deferReply();

		const append = interaction.options.getBoolean('append') || false;
		const client = interaction.client;
		const userId = interaction.user.id;

		const favorites = await this.Favorite.getAllCache({
			where: { userId },
			order: [['createdAt', 'ASC']],
			cacheTags: [`Favorite:byUser:${userId}`],
		});

		if (!favorites || favorites.length === 0) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.favorite.play.empty'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (player && !append) {
			player.queue.clear();
		}

		const newPlayer =
			player ||
			client.poru.createConnection({
				guildId: interaction.guild.id,
				voiceChannel: interaction.member.voice.channel.id,
				textChannel: interaction.channel.id,
				deaf: true,
			});

		let added = 0;
		for (const fav of favorites) {
			const poruTrack = await client.poru.resolve({
				query: fav.uri,
				requester: interaction.user,
			});
			if (poruTrack.tracks?.[0]) {
				newPlayer.queue.add(poruTrack.tracks[0]);
				added++;
			}
		}

		if (!newPlayer.isPlaying) newPlayer.play();

		const components = await this.simpleContainer(
			interaction,
			await this.t(
				interaction,
				'music.helpers.handlers.favorite.play.success',
				{ count: added },
			),
			{ color: this.config.bot.color },
		);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
	async _createFavoriteListContainer(
		page = 1,
		totalPages = 1,
		favorites,
		itemsPerPage,
		interaction,
	) {
		page = Math.max(1, Math.min(page, totalPages));
		const start = (page - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		const currentPageFavorites = favorites.slice(start, end);

		const list = currentPageFavorites
			.map((f, idx) => `**${start + idx + 1}.** [${f.title}](${f.uri})`)
			.join('\n');

		const buttons = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId(`favoritelist_prev_${page}`)
				.setEmoji('◀️')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === 1),
			new ButtonBuilder()
				.setCustomId(`favoritelist_next_${page}`)
				.setEmoji('▶️')
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(page === totalPages),
		);

		const container = new ContainerBuilder()
			.setAccentColor(
				this.convertColor(this.config.bot.color, {
					from: 'hex',
					to: 'decimal',
				}),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`${await this.t(interaction, 'music.helpers.handlers.favorite.list.title')}`,
				),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					list ||
						(await this.t(
							interaction,
							'music.helpers.handlers.favorite.list.empty',
						)),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addActionRowComponents(buttons)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await this.t(interaction, 'music.helpers.handlers.queue.footer', {
						page: page,
						totalPages: totalPages,
						totalTracks: favorites.length,
					}),
				),
			);

		return {
			components: [container],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		};
	}

	async _handleFavoriteList(interaction) {
		await interaction.deferReply();
		const userId = interaction.user.id;

		const favorites = await this.Favorite.getAllCache({
			where: { userId },
			order: [['createdAt', 'ASC']],
			cacheTags: [`Favorite:byUser:${userId}`],
		});

		if (!favorites || favorites.length === 0) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.favorite.list.empty'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const itemsPerPage = 10;
		const totalPages = Math.ceil(favorites.length / itemsPerPage) || 1;

		let initialPage = 1;
		if (interaction.isChatInputCommand()) {
			initialPage = interaction.options.getInteger('page') || 1;
		}

		const messageOptions = await this._createFavoriteListContainer(
			initialPage,
			totalPages,
			favorites,
			itemsPerPage,
			interaction,
		);
		const message = await interaction.editReply(messageOptions);

		const collector = message.createMessageComponentCollector({
			filter: (i) => i.user.id === interaction.user.id,
			time: 5 * 60 * 1000,
		});

		collector.on('collect', async (buttonInteraction) => {
			const [_prefix, action, currentPageStr] =
				buttonInteraction.customId.split('_');
			let currentPage = parseInt(currentPageStr, 10);

			if (action === 'next') {
				currentPage++;
			} else if (action === 'prev') {
				currentPage--;
			}

			const updatedMessageOptions = await this._createFavoriteListContainer(
				currentPage,
				totalPages,
				favorites,
				itemsPerPage,
				interaction,
			);
			await buttonInteraction.update(updatedMessageOptions);
		});

		collector.on('end', async () => {
			if (message.editable) {
				const finalState = await this._createFavoriteListContainer(
					1,
					totalPages,
					favorites,
					itemsPerPage,
					interaction,
				);
				finalState.components = [];
				await message.edit(finalState).catch(() => {});
			}
		});
	}

	async _handleFavoriteAdd(interaction, player) {
		await interaction.deferReply();

		const userId = interaction.user.id;
		let track;

		if (interaction.isChatInputCommand()) {
			const query = interaction.options.getString('search');
			const res = await interaction.client.poru.resolve({
				query,
				requester: interaction.user,
			});
			if (!res?.tracks || res.tracks.length === 0) {
				const components = await this.simpleContainer(
					interaction,
					await this.t(
						interaction,
						'music.helpers.handlers.favorite.add.no.track',
					),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			track = res.tracks[0];
		} else {
			track = player?.currentTrack;
		}

		if (!track) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.favorite.add.no.track',
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const existing = await this.Favorite.getCache({
			where: {
				userId,
				identifier: track.info.identifier,
			},
		});

		if (existing) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.favorite.add.duplicate',
					{ title: track.info.title },
				),
				{ color: 'Yellow' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		await this.Favorite.create({
			userId,
			identifier: track.info.identifier,
			title: track.info.title,
			author: track.info.author,
			length: track.info.length,
			uri: track.info.uri,
		});

		const components = await this.simpleContainer(
			interaction,
			await this.t(interaction, 'music.helpers.handlers.favorite.add.success', {
				title: track.info.title || track.info.name,
			}),
			{ color: this.config.bot.color },
		);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	async _handleFavoriteRemove(interaction) {
		await interaction.deferReply();

		const userId = interaction.user.id;
		const name = interaction.options.getString('name');

		const favorite = await this.Favorite.getCache({
			userId: userId,
			title: name,
		});

		if (!favorite) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.helpers.handlers.favorite.list.empty'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (!favorite) {
			const components = await this.simpleContainer(
				interaction,
				await this.t(
					interaction,
					'music.helpers.handlers.favorite.remove.invalid.name',
				),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		await favorite.destroy();

		const components = await this.simpleContainer(
			interaction,
			await this.t(
				interaction,
				'music.helpers.handlers.favorite.remove.success',
				{ title: favorite.title },
			),
			{ color: this.config.bot.color },
		);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * Checks if the bot is locked to a 24/7 channel and the user is unauthorized.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player
	 * @returns {Promise<boolean>}
	 */
	async isLocked(interaction, player) {
		if (!player?._247) return false;

		const { guild, user, member } = interaction;
		const existing247 = await this.Music247.getCache({
			where: { guildId: guild.id },
		});

		if (existing247?.lockedById) {
			const isAdmin = member.permissions.has('Administrator');
			if (existing247.lockedById !== user.id && !isAdmin) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Handles the 24/7 (always-on) music mode for the player.
	 * When enabled, the bot will attempt to stay in the voice channel even when the queue is empty.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 */
	async handle247(interaction, player, lockOption = false) {
		const isPremium = await this.premiumLocked(interaction, 'cute');
		if (!isPremium) return;

		await interaction.deferReply();
		const { client, member, guild, channel, user } = interaction;

		if (await this.isLocked(interaction, player)) {
			const msg = await this.t(
				interaction,
				'music.helpers.handlers.247.locked_error',
				{ defaultValue: '❌ This 24/7 session is locked by another user!' },
			);
			const components = await this.simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		let playerInstance = player;
		if (!playerInstance) {
			playerInstance = client.poru.createConnection({
				guildId: guild.id,
				voiceChannel: member.voice.channel.id,
				textChannel: channel.id,
				deaf: true,
			});

			playerInstance._247 = false;
		}

		const existing247 = await this.Music247.getCache({
			where: { guildId: guild.id },
		});

		// If it's already 247, and they explicitly provided lockOption without toggling intent
		// Let's just keep toggle logic, but update lockedById if lockOption is true
		const newState = !playerInstance._247;
		playerInstance._247 = newState;

		let msg;

		if (newState === true) {
			try {
				const lockedById = lockOption ? user.id : null;
				await this.Music247.findOrCreateCache({
					where: { guildId: guild.id },
					defaults: {
						guildId: guild.id,
						textChannelId: playerInstance.textChannel,
						voiceChannelId: playerInstance.voiceChannel,
						lockedById: lockedById,
					},
				});
				if (existing247) {
					// It's possible it was recreated, update lockedById just in case
					existing247.lockedById = lockedById;
					await existing247.save();
				}
				msg = await this.t(interaction, 'music.helpers.handlers.247.enabled');
			} catch (dbErr) {
				this.logger.error(
					`Failed to save 24/7 to DB: ${dbErr.message || dbErr}`,
					{ label: 'music' },
				);
				msg = await this.t(interaction, 'music.helpers.handlers.247.db_error');
			}
		} else {
			try {
				await this.Music247.destroy({ where: { guildId: guild.id } });
				msg = await this.t(interaction, 'music.helpers.handlers.247.disabled');
			} catch (dbErr) {
				this.logger.error(
					`Failed to remove 24/7 from DB: ${dbErr.message || dbErr}`,
					{ label: 'music' },
				);
				msg = await this.t(interaction, 'music.helpers.handlers.247.db_error');
			}
		}

		const components = await this.simpleContainer(interaction, msg, {
			color: this.config.bot.color,
		});
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	/**
	 * 📻 Handles the 'radio' subcommand.
	 * Searches for real radio stations using Radio Browser API and plays them via Lavalink.
	 * UI updated to use ContainerBuilder for consistency.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {object} player - The music player instance.
	 */

	async handleRadio(interaction, player) {
		const { client, member, guild, channel } = interaction;
		const query = interaction.options.getString('search');
		const accentColor = this.convertColor(this.config.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		await interaction.deferReply();

		if (player && player.voiceChannel !== member.voice.channel?.id) {
			if (await this.isLocked(interaction, player)) {
				const msg = await this.t(
					interaction,
					'music.helpers.handlers.247.locked_error',
					{ defaultValue: '❌ This 24/7 session is locked by another user!' },
				);
				const components = await this.simpleContainer(interaction, msg, {
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}

		const playStation = async (stationData, interactionToUpdate) => {
			if (!player) {
				player = client.poru.createConnection({
					guildId: guild.id,
					voiceChannel: member.voice.channel.id,
					textChannel: channel.id,
					deaf: true,
				});
			}

			const res = await client.poru.resolve({
				query: stationData.url_resolved,
				requester: interaction.user,
			});

			if (res.loadType === 'error' || !res.tracks.length) {
				const errContainer = new ContainerBuilder()
					.setAccentColor(
						this.convertColor('Red', { from: 'discord', to: 'decimal' }),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await this.t(
								interaction,
								'music.helpers.handlers.radio.load_failed',
							),
						),
					);

				if (interactionToUpdate.replied || interactionToUpdate.deferred) {
					return interactionToUpdate.editReply({
						components: [errContainer],
						flags: MessageFlags.IsComponentsV2,
					});
				}
				return interactionToUpdate.followUp({
					components: [errContainer],
					flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
				});
			}

			const track = res.tracks[0];
			track.info.title = stationData.name;
			track.info.author = stationData.country || 'Live Radio';
			track.info.isStream = true;
			track.info.uri = stationData.url_resolved;
			track.info.image = stationData.favicon || null;

			player.queue.clear();
			player.queue.add(track);

			if (!player.isPlaying && player.isConnected) player.play();
			else player.skip();

			const playingContainer = new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await this.t(
							interaction,
							'music.helpers.handlers.radio.live_title',
						),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				);

			const infoText = `**Station:** [${stationData.name}](${stationData.homepage || stationData.url_resolved})\n**Country:** ${stationData.country || 'Global'}\n**Bitrate:** ${stationData.bitrate} kbps`;

			if (stationData.favicon) {
				playingContainer.addSectionComponents(
					new SectionBuilder()
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(infoText),
						)
						.setThumbnailAccessory(
							new ThumbnailBuilder()
								.setDescription('Radio Logo')
								.setURL(stationData.favicon),
						),
				);
			} else {
				playingContainer.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(infoText),
				);
			}

			playingContainer.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
			playingContainer.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await this.t(interaction, 'common.container.footer', {
						username: client.user.username,
					}),
				),
			);

			await interactionToUpdate.editReply({
				components: [playingContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		};

		try {
			const isUUID =
				/^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/.test(
					query,
				);

			if (isUUID) {
				const response = await axios.get(
					`https://de1.api.radio-browser.info/json/stations/byuuid/${query}`,
				);
				if (response.data && response.data.length > 0) {
					return await playStation(response.data[0], interaction);
				}
			}

			const response = await axios.get(
				`https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(query)}&limit=10&hidebroken=true&order=clickcount&reverse=true`,
			);

			if (!response.data || response.data.length === 0) {
				const components = await this.simpleContainer(
					interaction,
					await this.t(interaction, 'music.helpers.handlers.radio.no_results', {
						query,
					}),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			if (response.data.length === 1) {
				return await playStation(response.data[0], interaction);
			}

			const stations = response.data.slice(0, 10);
			const options = stations.map((station) => {
				const label =
					station.name.length > 98
						? `${station.name.substring(0, 95)}...`
						: station.name;
				const description = `${station.countrycode || '🌐'} | ${station.bitrate || 128}kbps | ${station.tags ? station.tags.slice(0, 30) : 'Radio'}`;
				return { label, description, value: station.stationuuid, emoji: '📻' };
			});

			const selectMenu = new StringSelectMenuBuilder()
				.setCustomId('radio_select')
				.setPlaceholder(
					await interaction.client.container.t(
						interaction,
						'music.ui.ph_radio',
					),
				)
				.addOptions(options);
			const row = new ActionRowBuilder().addComponents(selectMenu);

			const selectContainer = new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await this.t(
							interaction,
							'music.helpers.handlers.radio.search_results_md',
							{ query },
						),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await this.t(
							interaction,
							'music.helpers.handlers.radio.select_desc',
							{ query },
						),
					),
				)
				.addActionRowComponents(row);

			const msg = await interaction.editReply({
				components: [selectContainer],
				flags: MessageFlags.IsComponentsV2,
			});

			const collector = msg.createMessageComponentCollector({
				componentType: ComponentType.StringSelect,
				filter: (i) => i.user.id === interaction.user.id,
				time: 30000,
			});

			collector.on('collect', async (i) => {
				await i.deferUpdate();
				const selectedUUID = i.values[0];
				const selectedStation = stations.find(
					(s) => s.stationuuid === selectedUUID,
				);
				if (!selectedStation) return;
				collector.stop('selected');
				await playStation(selectedStation, i);
			});

			collector.on('end', async (_collected, reason) => {
				if (reason === 'time') {
					const timeoutContainer = new ContainerBuilder()
						.setAccentColor(
							this.convertColor('Red', { from: 'discord', to: 'decimal' }),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								await this.t(
									interaction,
									'music.helpers.handlers.radio.timeout',
								),
							),
						);
					await interaction
						.editReply({
							components: [timeoutContainer],
							flags: MessageFlags.IsComponentsV2,
						})
						.catch(() => {});
				}
			});
		} catch (error) {
			this.logger.error(`Radio Handler Error: ${error.message || error}`, {
				label: 'music',
			});
			const errContainer = new ContainerBuilder()
				.setAccentColor(
					this.convertColor('Red', { from: 'discord', to: 'decimal' }),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await this.t(interaction, 'music.helpers.handlers.music.failed', {
							error: error?.message,
						}),
					),
				);
			return interaction.editReply({
				components: [errContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}

	async handleDownload(interaction, player) {
		await interaction.deferReply();

		if (!ytDlp) {
			return interaction.editReply({
				components: await this.simpleContainer(
					interaction,
					await this.t(
						interaction,
						'music.helpers.handlers.music.download.unavailable',
					),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const query = interaction.options.getString('query');
		const track = query ? null : player?.currentTrack;

		if (!query && !track) {
			return interaction.editReply({
				components: await this.simpleContainer(
					interaction,
					await this.t(
						interaction,
						'music.helpers.handlers.music.download.no_track_playing',
					),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const downloadQuery = query || track.info.uri;

		let baseName = 'downloaded_song';
		if (track?.info.title) {
			baseName = track.info.title;
		}

		const safeName =
			baseName
				.replace(/[/\\?%*:|"<>]/g, '')
				.replace(/[^a-zA-Z0-9 \-_]/g, '')
				.trim()
				.substring(0, 50) || `song_${Date.now()}`;

		const fileName = `${safeName}.mp3`;
		const filePath = path.join(__dirname, '../../temp', fileName);

		const maxLength = 600000; // 10 minutes
		if (track && track.info.length > maxLength) {
			return interaction.editReply({
				components: await this.simpleContainer(
					interaction,
					await this.t(
						interaction,
						'music.helpers.handlers.music.download.duration_too_long',
					),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}

		try {
			await ytDlp(downloadQuery, {
				extractAudio: true,
				audioFormat: 'mp3',
				output: filePath,
				noCheckCertificates: true,
			});

			const stats = fs.statSync(filePath);
			const fileSizeInMB = stats.size / (1024 * 1024);

			if (fileSizeInMB > 10) {
				fs.unlinkSync(filePath);
				return interaction.editReply({
					components: await this.simpleContainer(
						interaction,
						await this.t(
							interaction,
							'music.helpers.handlers.music.download.file_too_large',
						),
						{ color: 'Orange' },
					),
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const fileDescription = `Audio file for: ${track?.info.title || query}`;
			const attachment = new AttachmentBuilder(filePath)
				.setName(fileName)
				.setDescription(fileDescription);

			const fileComponent = new FileBuilder()
				.setURL(`attachment://${fileName}`)
				.setSpoiler(false);

			const title = await this.t(
				interaction,
				'music.helpers.handlers.music.download.success',
			);
			const accentColor = this.convertColor(this.config.bot.color, {
				from: 'hex',
				to: 'decimal',
			});

			let contentText;
			if (track) {
				const titleText = await this.t(
					interaction,
					'music.helpers.handlers.music.download.title',
					{ title: track.info.title },
				);
				const authorText = await this.t(
					interaction,
					'music.helpers.handlers.music.download.author',
					{ author: track.info.author },
				);
				contentText = `${titleText}\n${authorText}`;
			} else {
				contentText = await this.t(
					interaction,
					'music.helpers.handlers.music.download.query',
					{ query },
				);
			}

			const v2Components = [
				new ContainerBuilder()
					.setAccentColor(accentColor)
					.addTextDisplayComponents(new TextDisplayBuilder().setContent(title))
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(contentText),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(false),
					)
					.addFileComponents(fileComponent),
			];

			await interaction.editReply({
				components: v2Components,
				files: [attachment],
				flags: MessageFlags.IsComponentsV2,
			});

			fs.unlinkSync(filePath);
		} catch (error) {
			this.logger.error(`Download Error: ${error.message || error}`, {
				label: 'music',
			});
			if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

			return interaction.editReply({
				components: await this.simpleContainer(
					interaction,
					await this.t(
						interaction,
						'music.helpers.handlers.music.download.failed',
					),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

module.exports = MusicHandlers;
