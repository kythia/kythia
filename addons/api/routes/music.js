/**
 * @namespace: addons/api/routes/music.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
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
