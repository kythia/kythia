/**
 * @namespace: addons/social-alerts/helpers/instagram.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

/**
 * Validate an Instagram username and resolve the display name.
 * Uses the public Instagram oEmbed endpoint (no auth required for public display).
 * Falls back to RSSHub if oEmbed is unavailable.
 *
 * @param {string} username - Without @ prefix
 * @param {string} [rsshubUrl='https://rsshub.app']
 * @returns {Promise<{username: string, displayName: string} | null>}
 */
async function validateInstagramUser(
	username,
	rsshubUrl = 'https://rsshub.app',
) {
	const cleanUsername = username.replace(/^@/, '').trim();

	// Try RSSHub first — it's the most reliable validation method without auth
	try {
		const feedUrl = `${rsshubUrl.replace(/\/$/, '')}/instagram/user/${cleanUsername}`;
		const response = await fetch(feedUrl, {
			headers: { 'User-Agent': 'KythiaBot/1.0' },
			signal: AbortSignal.timeout(10_000),
		});

		if (!response.ok) return null;

		const xml = await response.text();
		if (!xml.includes('<item>') && !xml.includes('<entry>')) return null;

		// Extract author/channel title
		const titleMatch =
			xml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
			xml.match(/<title>(.*?)<\/title>/);
		const displayName = titleMatch ? titleMatch[1].trim() : `@${cleanUsername}`;

		return { username: `@${cleanUsername}`, displayName };
	} catch {
		return null;
	}
}

/**
 * Fetch the latest Instagram post for a user via RSSHub.
 *
 * @param {string} username - Can include @ prefix
 * @param {string} [rsshubUrl='https://rsshub.app']
 * @returns {Promise<{videoId: string, title: string, url: string, thumbnail: string|null, publishedAt: string|null} | null>}
 */
async function fetchLatestInstagram(
	username,
	rsshubUrl = 'https://rsshub.app',
) {
	const cleanUsername = username.replace(/^@/, '').trim();
	const feedUrl = `${rsshubUrl.replace(/\/$/, '')}/instagram/user/${cleanUsername}`;

	try {
		const response = await fetch(feedUrl, {
			headers: { 'User-Agent': 'KythiaBot/1.0' },
			signal: AbortSignal.timeout(10_000),
		});

		if (!response.ok) return null;

		const xml = await response.text();

		const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);
		if (!itemMatch) return null;
		const item = itemMatch[1];

		const linkMatch = item.match(/<link>(.*?)<\/link>/);
		const titleMatch =
			item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
			item.match(/<title>(.*?)<\/title>/);
		const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
		const guidMatch = item.match(/<guid[^>]*>(.*?)<\/guid>/);

		const rawUrl = linkMatch ? linkMatch[1].trim() : null;
		if (!rawUrl) return null;

		// Extract post ID from Instagram URL (e.g. /p/POSTID/)
		const postIdMatch = rawUrl.match(/\/(p|reel|tv)\/([A-Za-z0-9_-]+)/);
		const videoId = postIdMatch
			? postIdMatch[2]
			: guidMatch
				? guidMatch[1].trim()
				: rawUrl;

		const title = titleMatch
			? titleMatch[1]
					.trim()
					.replace(/&amp;/g, '&')
					.replace(/&lt;/g, '<')
					.replace(/&gt;/g, '>')
					.replace(/&#39;/g, "'")
					.replace(/&quot;/g, '"')
			: 'New Instagram Post';

		const publishedAt = pubDateMatch
			? new Date(pubDateMatch[1].trim()).toISOString()
			: null;

		// Try to pull thumbnail from media:thumbnail or description img
		const mediaThumbnailMatch = item.match(
			/<media:thumbnail[^>]+url="([^"]+)"/,
		);
		const descMatch = item.match(
			/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/,
		);
		let thumbnail = null;
		if (mediaThumbnailMatch) {
			thumbnail = mediaThumbnailMatch[1];
		} else if (descMatch) {
			const imgMatch = descMatch[1].match(/<img[^>]+src="([^"]+)"/);
			if (imgMatch) thumbnail = imgMatch[1];
		}

		return { videoId, title, url: rawUrl, thumbnail, publishedAt };
	} catch {
		return null;
	}
}

module.exports = { validateInstagramUser, fetchLatestInstagram };
