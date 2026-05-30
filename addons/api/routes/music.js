/**
 * @namespace: addons/api/routes/music.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');

const app = new Hono();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getClient = (c) => c.get('client');
const getModels = (c) => c.get('client').container.models;
const getConfig = (c) => c.get('client').container.kythiaConfig;
const getLogger = (c) => c.get('client').container.logger;

function formatTrack(t) {
	return {
		id: t.id,
		playlistId: t.playlistId,
		title: t.title,
		author: t.author,
		length: Number(t.length),
		uri: t.uri,
		identifier: t.identifier,
	};
}

function formatPlaylist(p, includeTracks = false) {
	const result = {
		id: p.id,
		userId: p.userId,
		name: p.name,
		shareCode: p.shareCode ?? null,
		trackCount: p.tracks ? p.tracks.length : undefined,
		createdAt: p.createdAt,
		updatedAt: p.updatedAt,
	};
	if (includeTracks && p.tracks) result.tracks = p.tracks.map(formatTrack);
	return result;
}

function formatFavorite(f) {
	return {
		id: f.id,
		userId: f.userId,
		title: f.title,
		author: f.author,
		length: Number(f.length),
		uri: f.uri,
		identifier: f.identifier,
		createdAt: f.createdAt,
		updatedAt: f.updatedAt,
	};
}

// ---------------------------------------------------------------------------
// SEARCH  GET /api/music/search
// Lavalink-powered track search — returns candidates to use as track URIs
// ---------------------------------------------------------------------------
app.get('/search', async (c) => {
	const client = getClient(c);
	const kythiaConfig = getConfig(c);
	const { q, limit = '10', source } = c.req.query();

	if (!q || q.trim().length === 0) {
		return c.json({ success: false, error: 'Missing query parameter: q' }, 400);
	}

	if (!client.poru || typeof client.poru.resolve !== 'function') {
		return c.json({ success: false, error: 'Lavalink is not available' }, 503);
	}

	const resultLimit = Math.min(25, Math.max(1, parseInt(limit, 10) || 10));
	const searchSource =
		source || kythiaConfig?.addons?.music?.defaultPlatform || 'ytsearch';

	try {
		const res = await client.poru.resolve({
			query: q,
			source: searchSource,
		});

		if (!res?.tracks || res.tracks.length === 0) {
			return c.json({ success: true, data: [] });
		}

		const tracks = res.tracks.slice(0, resultLimit).map((t) => ({
			title: t.info.title,
			author: t.info.author,
			length: t.info.length,
			uri: t.info.uri,
			identifier: t.info.identifier,
			thumbnail: t.info.artworkUrl || null,
			isStream: t.info.isStream ?? false,
			sourceName: t.info.sourceName ?? null,
		}));

		return c.json({
			success: true,
			loadType: res.loadType,
			playlistInfo: res.playlistInfo || null,
			data: tracks,
		});
	} catch (error) {
		getLogger(c).error('GET /api/music/search error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ============================================================================
// PLAYLISTS
// ============================================================================

// ---------------------------------------------------------------------------
// GET /api/music/playlists/:userId
// List all playlists for a user (without tracks)
// ---------------------------------------------------------------------------
app.get('/playlists/:userId', async (c) => {
	const { Playlist, PlaylistTrack } = getModels(c);
	const { userId } = c.req.param();

	try {
		const playlists = await Playlist.getAllCache({
			where: { userId },
			include: [{ model: PlaylistTrack, as: 'tracks', attributes: ['id'] }],
			order: [['updatedAt', 'DESC']],
		});

		return c.json({
			success: true,
			count: playlists.length,
			data: playlists.map((p) => formatPlaylist(p)),
		});
	} catch (error) {
		getLogger(c).error('GET /api/music/playlists/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// GET /api/music/playlists/:userId/:playlistId
// Get a specific playlist with all its tracks
// ---------------------------------------------------------------------------
app.get('/playlists/:userId/:playlistId', async (c) => {
	const { Playlist, PlaylistTrack } = getModels(c);
	const { userId, playlistId } = c.req.param();

	try {
		const playlist = await Playlist.getCache({
			where: { id: playlistId, userId },
			include: [{ model: PlaylistTrack, as: 'tracks' }],
		});

		if (!playlist) {
			return c.json({ success: false, error: 'Playlist not found' }, 404);
		}

		return c.json({ success: true, data: formatPlaylist(playlist, true) });
	} catch (error) {
		getLogger(c).error(
			'GET /api/music/playlists/:userId/:playlistId error:',
			error,
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/music/playlists/:userId
// Create a new playlist (empty)
// Body: { name: string }
// ---------------------------------------------------------------------------
app.post('/playlists/:userId', async (c) => {
	const { Playlist } = getModels(c);
	const { userId } = c.req.param();

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { name } = body;
	if (!name || typeof name !== 'string' || name.trim().length === 0) {
		return c.json({ success: false, error: 'name is required' }, 400);
	}
	if (name.trim().length > 100) {
		return c.json(
			{ success: false, error: 'name must be 100 characters or less' },
			400,
		);
	}

	try {
		const playlist = await Playlist.create({ userId, name: name.trim() });
		return c.json({ success: true, data: formatPlaylist(playlist) }, 201);
	} catch (error) {
		getLogger(c).error('POST /api/music/playlists/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// PATCH /api/music/playlists/:userId/:playlistId
// Rename a playlist
// Body: { name: string }
// ---------------------------------------------------------------------------
app.patch('/playlists/:userId/:playlistId', async (c) => {
	const { Playlist } = getModels(c);
	const { userId, playlistId } = c.req.param();

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { name } = body;
	if (!name || typeof name !== 'string' || name.trim().length === 0) {
		return c.json({ success: false, error: 'name is required' }, 400);
	}
	if (name.trim().length > 100) {
		return c.json(
			{ success: false, error: 'name must be 100 characters or less' },
			400,
		);
	}

	try {
		const playlist = await Playlist.getCache({
			where: { id: playlistId, userId },
		});
		if (!playlist)
			return c.json({ success: false, error: 'Playlist not found' }, 404);

		playlist.name = name.trim();
		await playlist.save();
		return c.json({ success: true, data: formatPlaylist(playlist) });
	} catch (error) {
		getLogger(c).error(
			'PATCH /api/music/playlists/:userId/:playlistId error:',
			error,
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/music/playlists/:userId/:playlistId
// Delete a playlist (cascades to tracks)
// ---------------------------------------------------------------------------
app.delete('/playlists/:userId/:playlistId', async (c) => {
	const { Playlist } = getModels(c);
	const { userId, playlistId } = c.req.param();

	try {
		const playlist = await Playlist.getCache({
			where: { id: playlistId, userId },
		});
		if (!playlist)
			return c.json({ success: false, error: 'Playlist not found' }, 404);

		await playlist.destroy();
		return c.json({
			success: true,
			message: `Playlist "${playlist.name}" deleted`,
		});
	} catch (error) {
		getLogger(c).error(
			'DELETE /api/music/playlists/:userId/:playlistId error:',
			error,
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ============================================================================
// PLAYLIST TRACKS
// ============================================================================

// ---------------------------------------------------------------------------
// POST /api/music/playlists/:userId/:playlistId/tracks
// Add a track to a playlist. Can add directly via URI or search by query.
// Body: { uri?, title?, author?, length?, identifier? } OR { query?, source? }
// ---------------------------------------------------------------------------
app.post('/playlists/:userId/:playlistId/tracks', async (c) => {
	const client = getClient(c);
	const kythiaConfig = getConfig(c);
	const { Playlist, PlaylistTrack } = getModels(c);
	const { userId, playlistId } = c.req.param();

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const playlist = await Playlist.getCache({
		where: { id: playlistId, userId },
	});
	if (!playlist)
		return c.json({ success: false, error: 'Playlist not found' }, 404);

	let title, author, length, uri, identifier;

	if (body.uri) {
		// Direct add — URI provided, metadata is optional (can also be resolved)
		uri = body.uri;
		title = body.title || uri;
		author = body.author || 'Unknown';
		length = parseInt(body.length, 10) || 0;
		identifier = body.identifier || uri;

		// Try to resolve metadata via Lavalink if not all provided
		if (
			(!body.title || !body.author || !body.identifier) &&
			client.poru?.resolve
		) {
			try {
				const res = await client.poru.resolve({
					query: uri,
					source: 'ytsearch',
				});
				if (res?.tracks?.length > 0) {
					const t = res.tracks[0].info;
					title = body.title || t.title;
					author = body.author || t.author;
					length = body.length || t.length;
					identifier = body.identifier || t.identifier;
				}
			} catch {}
		}
	} else if (body.query) {
		// Search and add — resolve via Lavalink
		if (!client.poru?.resolve) {
			return c.json(
				{ success: false, error: 'Lavalink is not available' },
				503,
			);
		}
		const source =
			body.source || kythiaConfig?.addons?.music?.defaultPlatform || 'ytsearch';
		try {
			const res = await client.poru.resolve({ query: body.query, source });
			if (!res?.tracks?.length) {
				return c.json(
					{ success: false, error: 'No tracks found for the given query' },
					404,
				);
			}
			const t = res.tracks[0].info;
			title = t.title;
			author = t.author;
			length = t.length;
			uri = t.uri;
			identifier = t.identifier;
		} catch (e) {
			getLogger(c).error('Track search failed:', e);
			return c.json(
				{ success: false, error: `Track search failed: ${e.message}` },
				500,
			);
		}
	} else {
		return c.json(
			{ success: false, error: 'Either uri or query is required' },
			400,
		);
	}

	try {
		const track = await PlaylistTrack.create({
			playlistId: playlist.id,
			title,
			author,
			length,
			uri,
			identifier,
		});
		return c.json({ success: true, data: formatTrack(track) }, 201);
	} catch (error) {
		getLogger(c).error(
			'POST /api/music/playlists/:userId/:playlistId/tracks error:',
			error,
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/music/playlists/:userId/:playlistId/tracks/:trackId
// Remove a specific track from a playlist
// ---------------------------------------------------------------------------
app.delete('/playlists/:userId/:playlistId/tracks/:trackId', async (c) => {
	const { Playlist, PlaylistTrack } = getModels(c);
	const { userId, playlistId, trackId } = c.req.param();

	try {
		const playlist = await Playlist.getCache({
			where: { id: playlistId, userId },
		});
		if (!playlist)
			return c.json({ success: false, error: 'Playlist not found' }, 404);

		const track = await PlaylistTrack.getCache({
			where: { id: trackId, playlistId: playlist.id },
		});
		if (!track)
			return c.json(
				{ success: false, error: 'Track not found in playlist' },
				404,
			);

		await track.destroy();
		return c.json({
			success: true,
			message: `Track "${track.title}" removed from playlist`,
		});
	} catch (error) {
		getLogger(c).error('DELETE .../tracks/:trackId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/music/playlists/:userId/:playlistId/tracks
// Clear all tracks from a playlist
// ---------------------------------------------------------------------------
app.delete('/playlists/:userId/:playlistId/tracks', async (c) => {
	const { Playlist, PlaylistTrack } = getModels(c);
	const { userId, playlistId } = c.req.param();

	try {
		const playlist = await Playlist.getCache({
			where: { id: playlistId, userId },
		});
		if (!playlist)
			return c.json({ success: false, error: 'Playlist not found' }, 404);

		const deleted = await PlaylistTrack.destroy({
			where: { playlistId: playlist.id },
		});
		return c.json({
			success: true,
			message: `Cleared ${deleted} track(s) from playlist`,
			deleted,
		});
	} catch (error) {
		getLogger(c).error('DELETE .../tracks error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ============================================================================
// FAVORITES
// ============================================================================

// ---------------------------------------------------------------------------
// GET /api/music/favorites/:userId
// List all favorites for a user (with pagination)
// ---------------------------------------------------------------------------
app.get('/favorites/:userId', async (c) => {
	const { Favorite } = getModels(c);
	const { userId } = c.req.param();
	const { page = '1', limit = '50' } = c.req.query();

	const pageNum = Math.max(1, parseInt(page, 10) || 1);
	const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
	const offset = (pageNum - 1) * limitNum;

	try {
		const { count, rows } = await Favorite.findAndCountAll({
			where: { userId },
			order: [['createdAt', 'DESC']],
			limit: limitNum,
			offset,
		});
		return c.json({
			success: true,
			count,
			page: pageNum,
			totalPages: Math.ceil(count / limitNum) || 1,
			data: rows.map(formatFavorite),
		});
	} catch (error) {
		getLogger(c).error('GET /api/music/favorites/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/music/favorites/:userId
// Add a favorite. Supports URI (with auto-resolve) or search by query.
// Body: { uri?, title?, author?, length?, identifier? } OR { query?, source? }
// ---------------------------------------------------------------------------
app.post('/favorites/:userId', async (c) => {
	const client = getClient(c);
	const kythiaConfig = getConfig(c);
	const { Favorite } = getModels(c);
	const { userId } = c.req.param();

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	let title, author, length, uri, identifier;

	if (body.uri) {
		uri = body.uri;
		title = body.title || uri;
		author = body.author || 'Unknown';
		length = parseInt(body.length, 10) || 0;
		identifier = body.identifier || uri;

		if (
			(!body.title || !body.author || !body.identifier) &&
			client.poru?.resolve
		) {
			try {
				const res = await client.poru.resolve({
					query: uri,
					source: 'ytsearch',
				});
				if (res?.tracks?.length > 0) {
					const t = res.tracks[0].info;
					title = body.title || t.title;
					author = body.author || t.author;
					length = body.length || t.length;
					identifier = body.identifier || t.identifier;
				}
			} catch {}
		}
	} else if (body.query) {
		if (!client.poru?.resolve) {
			return c.json(
				{ success: false, error: 'Lavalink is not available' },
				503,
			);
		}
		const source =
			body.source || kythiaConfig?.addons?.music?.defaultPlatform || 'ytsearch';
		try {
			const res = await client.poru.resolve({ query: body.query, source });
			if (!res?.tracks?.length) {
				return c.json(
					{ success: false, error: 'No tracks found for the given query' },
					404,
				);
			}
			const t = res.tracks[0].info;
			title = t.title;
			author = t.author;
			length = t.length;
			uri = t.uri;
			identifier = t.identifier;
		} catch (e) {
			return c.json(
				{ success: false, error: `Track search failed: ${e.message}` },
				500,
			);
		}
	} else {
		return c.json(
			{ success: false, error: 'Either uri or query is required' },
			400,
		);
	}

	// Check for duplicate (unique index on userId+identifier)
	const existing = await Favorite.getCache({ where: { userId, identifier } });
	if (existing) {
		return c.json(
			{ success: false, error: 'This track is already in favorites' },
			409,
		);
	}

	try {
		const fav = await Favorite.create({
			userId,
			title,
			author,
			length,
			uri,
			identifier,
		});
		return c.json({ success: true, data: formatFavorite(fav) }, 201);
	} catch (error) {
		getLogger(c).error('POST /api/music/favorites/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/music/favorites/:userId/:favoriteId
// Remove a specific favorite by ID
// ---------------------------------------------------------------------------
app.delete('/favorites/:userId/:favoriteId', async (c) => {
	const { Favorite } = getModels(c);
	const { userId, favoriteId } = c.req.param();

	try {
		const fav = await Favorite.getCache({ where: { id: favoriteId, userId } });
		if (!fav)
			return c.json({ success: false, error: 'Favorite not found' }, 404);

		await fav.destroy();
		return c.json({
			success: true,
			message: `"${fav.title}" removed from favorites`,
		});
	} catch (error) {
		getLogger(c).error(
			'DELETE /api/music/favorites/:userId/:favoriteId error:',
			error,
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// DELETE /api/music/favorites/:userId
// Clear all favorites for a user
// ---------------------------------------------------------------------------
app.delete('/favorites/:userId', async (c) => {
	const { Favorite } = getModels(c);
	const { userId } = c.req.param();

	try {
		const deleted = await Favorite.destroy({ where: { userId } });
		return c.json({
			success: true,
			message: `Cleared ${deleted} favorite(s)`,
			deleted,
		});
	} catch (error) {
		getLogger(c).error('DELETE /api/music/favorites/:userId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ============================================================================
// 24/7 MODE
// ============================================================================

// ---------------------------------------------------------------------------
// GET /api/music/247/:guildId
// Get 24/7 config for a guild
// ---------------------------------------------------------------------------
app.get('/247/:guildId', async (c) => {
	const { Music247 } = getModels(c);
	const { guildId } = c.req.param();

	try {
		const config = await Music247.getCache({ where: { guildId } });
		if (!config) {
			return c.json({ success: true, data: null, enabled: false });
		}
		return c.json({
			success: true,
			enabled: true,
			data: {
				guildId: config.guildId,
				textChannelId: config.textChannelId,
				voiceChannelId: config.voiceChannelId,
				createdAt: config.createdAt,
				updatedAt: config.updatedAt,
			},
		});
	} catch (error) {
		getLogger(c).error('GET /api/music/247/:guildId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// PUT /api/music/247/:guildId
// Enable/upsert 24/7 mode for a guild
// Body: { textChannelId: string, voiceChannelId: string }
// ---------------------------------------------------------------------------
app.put('/247/:guildId', async (c) => {
	const { Music247 } = getModels(c);
	const { guildId } = c.req.param();

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { textChannelId, voiceChannelId } = body;
	if (!textChannelId || !voiceChannelId) {
		return c.json(
			{
				success: false,
				error: 'textChannelId and voiceChannelId are required',
			},
			400,
		);
	}

	try {
		const [config, created] = await Music247.findOrCreate({
			where: { guildId },
			defaults: { guildId, textChannelId, voiceChannelId },
		});
		if (!created) {
			config.textChannelId = textChannelId;
			config.voiceChannelId = voiceChannelId;
			await config.save();
		}
		return c.json(
			{
				success: true,
				created,
				data: {
					guildId: config.guildId,
					textChannelId: config.textChannelId,
					voiceChannelId: config.voiceChannelId,
					createdAt: config.createdAt,
					updatedAt: config.updatedAt,
				},
			},
			created ? 201 : 200,
		);
	} catch (error) {
		getLogger(c).error('PUT /api/music/247/:guildId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ============================================================================
// PLAYER CONTROLS  /api/music/player/:guildId
// Delegates to the same MusicHandlers methods used by Discord slash commands
// and buttons — so no logic is duplicated and everything stays in sync.
// ============================================================================

/**
 * Resolve the live Poru player for a guild, or null.
 */
function getPlayer(c, guildId) {
	const client = getClient(c);
	if (!client.poru) return null;
	return client.poru.players.get(guildId) ?? null;
}

/**
 * Build a minimal mock Discord interaction that satisfies what MusicHandlers
 * methods need — without actually being a real Discord interaction.
 *
 * All Discord reply lifecycle calls (reply/editReply/deferReply/followUp) are
 * no-ops — we only care about the side effects on the Poru player, not the
 * Discord message output.
 *
 * Fields provided:
 *  - guildId, client             → used by all handlers + simpleContainer
 *  - guild                       → resolved from client cache (may be null for uncached)
 *  - locale, guildLocale         → TranslatorManager.t() fallback (uses guildId first)
 *  - options.getString/Integer   → option value accessor used by volume/loop/seek/autoplay
 *  - isChatInputCommand()        → controls branch logic in handleLoop / handleAutoplay
 *  - deferred, replied getters   → guards in handleBack / handleShuffle (deferReply guards)
 *  - deferReply/reply/editReply/followUp → no-ops so handlers don't crash after player ops
 *
 * @param {object} opts
 * @param {string}  opts.guildId
 * @param {object}  opts.client         — real Discord client
 * @param {object}  [opts.optionValues] — map of option name → raw value
 * @param {boolean} [opts.isChatInput]  — true = slash command path, false = button path
 */
function makeMockInteraction({
	guildId,
	client,
	optionValues = {},
	isChatInput = true,
}) {
	let _deferred = false;
	let _replied = false;

	// Resolve guild from cache (may be null if bot hasn't cached it yet, which is fine —
	// t() falls back via guildId lookup in guildLanguageCache, then to defaultLang)
	const guild = client.guilds?.cache?.get(guildId) ?? null;
	const defaultLocale =
		client.container?.kythiaConfig?.bot?.language ?? 'en-US';

	return {
		guildId,
		client,
		guild,

		// locale / guildLocale: TranslatorManager.t() reads guildId first and falls back;
		// providing these as a safety net for any code that reads them directly.
		locale: guild?.preferredLocale ?? defaultLocale,
		guildLocale: guild?.preferredLocale ?? defaultLocale,

		// member / user — stubs; handlers only use these for display strings (no-op replies)
		member: {
			voice: { channel: null },
			displayName: 'API',
			roles: { cache: new Map() },
		},
		user: {
			id: 'api',
			username: 'API',
			displayName: 'API',
			toString: () => 'API',
		},

		// channel stub — needed if any code tries to access interaction.channel
		channel: guild?.systemChannel ?? null,

		// Discord option accessors
		options: {
			getString: (name) =>
				Object.hasOwn(optionValues, name) ? optionValues[name] : null,
			getInteger: (name) =>
				Object.hasOwn(optionValues, name)
					? parseInt(optionValues[name], 10)
					: null,
			getNumber: (name) =>
				Object.hasOwn(optionValues, name) ? Number(optionValues[name]) : null,
			getBoolean: (name) =>
				Object.hasOwn(optionValues, name) ? Boolean(optionValues[name]) : null,
			getUser: () => null,
			getChannel: () => null,
			getRole: () => null,
			getSubcommand: (required = false) => {
				if (required) throw new Error('No subcommand');
				return null;
			},
			getSubcommandGroup: (required = false) => {
				if (required) throw new Error('No subcommand group');
				return null;
			},
		},

		// Type discriminators
		isChatInputCommand: () => isChatInput,
		isButton: () => false,
		isStringSelectMenu: () => false,
		isRepliable: () => true,
		isMessageComponent: () => false,
		inGuild: () => !!guild,
		inCachedGuild: () => !!guild,

		// Reply lifecycle — tracked state, no-op implementations
		get deferred() {
			return _deferred;
		},
		get replied() {
			return _replied;
		},

		deferReply: () => {
			_deferred = true;
		},
		reply: () => {
			_replied = true;
		},
		editReply: async () => {},
		followUp: async () => {},
		deleteReply: async () => {},
		fetchReply: async () => null,
	};
}

// ---------------------------------------------------------------------------
// GET /api/music/player/:guildId
// Snapshot of the current live player state. Safe — no side effects.
// ---------------------------------------------------------------------------
app.get('/player/:guildId', (c) => {
	const { guildId } = c.req.param();
	const player = getPlayer(c, guildId);

	if (!player) return c.json({ success: true, data: null, status: 'idle' });

	const status = player.isPaused
		? 'paused'
		: player.isPlaying
			? 'playing'
			: 'idle';

	return c.json({
		success: true,
		data: {
			guildId,
			status,
			volume: player.volume,
			position: player.position,
			isLoop: {
				track: player.trackRepeat ?? false,
				queue: player.queueRepeat ?? false,
			},
			autoplay: player.autoplay ?? false,
			track: player.currentTrack
				? {
						title: player.currentTrack.info.title,
						author: player.currentTrack.info.author,
						uri: player.currentTrack.info.uri,
						artworkUrl:
							player.currentTrack.info.artworkUrl ||
							player.currentTrack.info.image ||
							null,
						duration: player.currentTrack.info.length,
						requester: player.currentTrack.info.requester?.username ?? null,
					}
				: null,
			queue: (player.queue ?? []).slice(0, 10).map((t) => ({
				title: t.info.title,
				uri: t.info.uri,
				duration: t.info.length,
			})),
			queueLength: (player.queue ?? []).length,
		},
	});
});

// ---------------------------------------------------------------------------
// POST /api/music/player/:guildId/pause
// ---------------------------------------------------------------------------
app.post('/player/:guildId/pause', async (c) => {
	const { guildId } = c.req.param();
	const client = getClient(c);
	const player = getPlayer(c, guildId);
	if (!player)
		return c.json(
			{ success: false, error: 'No active player for this guild' },
			404,
		);
	if (player.isPaused)
		return c.json({ success: false, error: 'Player is already paused' }, 409);

	const handlers = client.container.musicHandlers;
	const interaction = makeMockInteraction({ guildId, client });

	try {
		await handlers.handlePause(interaction, player);
		return c.json({ success: true, status: 'paused' });
	} catch (error) {
		getLogger(c).error('POST /api/music/player/:guildId/pause error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/music/player/:guildId/resume
// ---------------------------------------------------------------------------
app.post('/player/:guildId/resume', async (c) => {
	const { guildId } = c.req.param();
	const client = getClient(c);
	const player = getPlayer(c, guildId);
	if (!player)
		return c.json(
			{ success: false, error: 'No active player for this guild' },
			404,
		);
	if (!player.isPaused)
		return c.json({ success: false, error: 'Player is not paused' }, 409);

	const handlers = client.container.musicHandlers;
	const interaction = makeMockInteraction({ guildId, client });

	try {
		await handlers.handleResume(interaction, player);
		return c.json({ success: true, status: 'playing' });
	} catch (error) {
		getLogger(c).error('POST /api/music/player/:guildId/resume error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/music/player/:guildId/skip
// ---------------------------------------------------------------------------
app.post('/player/:guildId/skip', async (c) => {
	const { guildId } = c.req.param();
	const client = getClient(c);
	const player = getPlayer(c, guildId);
	if (!player)
		return c.json(
			{ success: false, error: 'No active player for this guild' },
			404,
		);
	if (!player.currentTrack)
		return c.json(
			{ success: false, error: 'No track is currently playing' },
			409,
		);

	const handlers = client.container.musicHandlers;
	const skippedTitle = player.currentTrack.info.title;
	const interaction = makeMockInteraction({ guildId, client });

	try {
		await handlers.handleSkip(interaction, player);
		return c.json({ success: true, skipped: skippedTitle });
	} catch (error) {
		getLogger(c).error('POST /api/music/player/:guildId/skip error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/music/player/:guildId/stop
// ---------------------------------------------------------------------------
app.post('/player/:guildId/stop', async (c) => {
	const { guildId } = c.req.param();
	const client = getClient(c);
	const player = getPlayer(c, guildId);
	if (!player)
		return c.json(
			{ success: false, error: 'No active player for this guild' },
			404,
		);

	const handlers = client.container.musicHandlers;
	const interaction = makeMockInteraction({ guildId, client });

	try {
		await handlers.handleStop(interaction, player);
		return c.json({
			success: true,
			message: 'Playback stopped and queue cleared',
		});
	} catch (error) {
		getLogger(c).error('POST /api/music/player/:guildId/stop error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/music/player/:guildId/volume
// Body: { level: number }  (0–200)
// ---------------------------------------------------------------------------
app.post('/player/:guildId/volume', async (c) => {
	const { guildId } = c.req.param();
	const client = getClient(c);
	const player = getPlayer(c, guildId);
	if (!player)
		return c.json(
			{ success: false, error: 'No active player for this guild' },
			404,
		);

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const level = parseInt(body.level, 10);
	if (Number.isNaN(level) || level < 0 || level > 200) {
		return c.json(
			{ success: false, error: 'level must be an integer between 0 and 200' },
			400,
		);
	}

	const handlers = client.container.musicHandlers;
	const interaction = makeMockInteraction({
		guildId,
		client,
		optionValues: { level },
	});

	try {
		await handlers.handleVolume(interaction, player);
		return c.json({ success: true, volume: level });
	} catch (error) {
		getLogger(c).error('POST /api/music/player/:guildId/volume error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/music/player/:guildId/loop
// Body: { mode: "track" | "queue" | "off" }
// ---------------------------------------------------------------------------
app.post('/player/:guildId/loop', async (c) => {
	const { guildId } = c.req.param();
	const client = getClient(c);
	const player = getPlayer(c, guildId);
	if (!player)
		return c.json(
			{ success: false, error: 'No active player for this guild' },
			404,
		);

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const mode = body.mode;
	if (!['track', 'queue', 'off'].includes(mode)) {
		return c.json(
			{ success: false, error: 'mode must be one of: track, queue, off' },
			400,
		);
	}

	const handlers = client.container.musicHandlers;
	// Pass as a slash command so handleLoop reads from options.getString('mode')
	const interaction = makeMockInteraction({
		guildId,
		client,
		optionValues: { mode },
		isChatInput: true,
	});

	try {
		await handlers.handleLoop(interaction, player);
		return c.json({ success: true, loop: mode });
	} catch (error) {
		getLogger(c).error('POST /api/music/player/:guildId/loop error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/music/player/:guildId/shuffle
// ---------------------------------------------------------------------------
app.post('/player/:guildId/shuffle', async (c) => {
	const { guildId } = c.req.param();
	const client = getClient(c);
	const player = getPlayer(c, guildId);
	if (!player)
		return c.json(
			{ success: false, error: 'No active player for this guild' },
			404,
		);
	if ((player.queue?.length ?? 0) < 2) {
		return c.json(
			{ success: false, error: 'Need at least 2 tracks in queue to shuffle' },
			409,
		);
	}

	const handlers = client.container.musicHandlers;
	const interaction = makeMockInteraction({ guildId, client });

	try {
		await handlers.handleShuffle(interaction, player);
		return c.json({
			success: true,
			message: 'Queue shuffled',
			queueLength: player.queue.length,
		});
	} catch (error) {
		getLogger(c).error('POST /api/music/player/:guildId/shuffle error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/music/player/:guildId/seek
// Body: { position: number }  — position in milliseconds
// ---------------------------------------------------------------------------
app.post('/player/:guildId/seek', async (c) => {
	const { guildId } = c.req.param();
	const client = getClient(c);
	const player = getPlayer(c, guildId);
	if (!player)
		return c.json(
			{ success: false, error: 'No active player for this guild' },
			404,
		);
	if (!player.currentTrack)
		return c.json(
			{ success: false, error: 'No track is currently playing' },
			409,
		);

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const position = parseInt(body.position, 10);
	const duration = player.currentTrack.info.length;

	if (Number.isNaN(position) || position < 0) {
		return c.json(
			{
				success: false,
				error: 'position must be a non-negative integer (milliseconds)',
			},
			400,
		);
	}
	if (position > duration) {
		return c.json(
			{
				success: false,
				error: `position (${position}ms) exceeds track duration (${duration}ms)`,
			},
			400,
		);
	}

	// handleSeek expects options.getString('time') as a seconds value string.
	// We convert ms → seconds and pass as the 'time' option.
	const seconds = Math.floor(position / 1000);
	const handlers = client.container.musicHandlers;
	const interaction = makeMockInteraction({
		guildId,
		client,
		optionValues: { time: String(seconds) },
	});

	try {
		await handlers.handleSeek(interaction, player);
		return c.json({ success: true, position });
	} catch (error) {
		getLogger(c).error('POST /api/music/player/:guildId/seek error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/music/player/:guildId/back
// Go back to the previous track in history.
// ---------------------------------------------------------------------------
app.post('/player/:guildId/back', async (c) => {
	const { guildId } = c.req.param();
	const client = getClient(c);
	const player = getPlayer(c, guildId);
	if (!player)
		return c.json(
			{ success: false, error: 'No active player for this guild' },
			404,
		);

	const guildStates = client.container.music?.guildStates;
	const guildState = guildStates?.get(guildId);
	if (!guildState?.previousTracks?.length) {
		return c.json(
			{ success: false, error: 'No previous track in history' },
			409,
		);
	}

	const handlers = client.container.musicHandlers;
	// handleBack reads interaction.guildId to look up guildStates
	const interaction = makeMockInteraction({ guildId, client });

	try {
		await handlers.handleBack(interaction, player, guildStates);
		return c.json({ success: true });
	} catch (error) {
		getLogger(c).error('POST /api/music/player/:guildId/back error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/music/player/:guildId/autoplay
// Body: { enabled: boolean }  — omit to toggle
// ---------------------------------------------------------------------------
app.post('/player/:guildId/autoplay', async (c) => {
	const { guildId } = c.req.param();
	const client = getClient(c);
	const player = getPlayer(c, guildId);
	if (!player)
		return c.json(
			{ success: false, error: 'No active player for this guild' },
			404,
		);

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	// handleAutoplay with isChatInputCommand() === true reads options.getString('status')
	// where 'enable' means true and anything else means false.
	const enabled =
		typeof body.enabled === 'boolean' ? body.enabled : !player.autoplay;
	const handlers = client.container.musicHandlers;
	const interaction = makeMockInteraction({
		guildId,
		client,
		optionValues: { status: enabled ? 'enable' : 'disable' },
		isChatInput: true,
	});

	try {
		await handlers.handleAutoplay(interaction, player);
		return c.json({ success: true, autoplay: enabled });
	} catch (error) {
		getLogger(c).error(
			'POST /api/music/player/:guildId/autoplay error:',
			error,
		);
		return c.json({ success: false, error: error.message }, 500);
	}
});

// ---------------------------------------------------------------------------
// POST /api/music/player/:guildId/play
// Add a track to the queue and start if idle.
// Body: { query: string, source?: string }  OR  { uri: string }
// ---------------------------------------------------------------------------
app.post('/player/:guildId/play', async (c) => {
	const { guildId } = c.req.param();
	const client = getClient(c);
	const kythiaConfig = getConfig(c);

	if (!client.poru)
		return c.json({ success: false, error: 'Lavalink is not available' }, 503);

	const player = getPlayer(c, guildId);
	if (!player) {
		return c.json(
			{
				success: false,
				error:
					'No active player for this guild. Start a session via /music play in Discord first.',
			},
			404,
		);
	}

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const queryRaw = body.uri || body.query;
	if (!queryRaw)
		return c.json(
			{ success: false, error: 'Either uri or query is required' },
			400,
		);

	const source =
		body.source || kythiaConfig?.addons?.music?.defaultPlatform || 'ytsearch';

	let resolvedTrack;
	try {
		const res = await client.poru.resolve({ query: queryRaw, source });
		if (!res?.tracks?.length) {
			return c.json(
				{ success: false, error: 'No tracks found for the given query' },
				404,
			);
		}
		resolvedTrack = res.tracks[0];
	} catch (e) {
		getLogger(c).error(
			'POST /api/music/player/:guildId/play resolve error:',
			e,
		);
		return c.json(
			{ success: false, error: `Track resolve failed: ${e.message}` },
			500,
		);
	}

	try {
		player.queue.add(resolvedTrack);
		if (!player.isPlaying && player.isConnected) {
			player.play();
		}
		return c.json(
			{
				success: true,
				added: {
					title: resolvedTrack.info.title,
					author: resolvedTrack.info.author,
					uri: resolvedTrack.info.uri,
					duration: resolvedTrack.info.length,
				},
				queueLength: player.queue.length,
			},
			201,
		);
	} catch (error) {
		getLogger(c).error('POST /api/music/player/:guildId/play error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});
// ---------------------------------------------------------------------------
// DELETE /api/music/247/:guildId
// Disable 24/7 mode for a guild
// ---------------------------------------------------------------------------
app.delete('/247/:guildId', async (c) => {
	const { Music247 } = getModels(c);
	const { guildId } = c.req.param();

	try {
		const config = await Music247.getCache({ where: { guildId } });
		if (!config) {
			return c.json(
				{ success: false, error: '24/7 mode is not enabled for this guild' },
				404,
			);
		}
		await config.destroy();
		return c.json({
			success: true,
			message: `24/7 mode disabled for guild ${guildId}`,
		});
	} catch (error) {
		getLogger(c).error('DELETE /api/music/247/:guildId error:', error);
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
