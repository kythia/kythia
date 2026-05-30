/**
 * @namespace: addons/social-alerts/helpers/tiktok.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const TIKTOK_USER_INFO_URL =
	'https://open.tiktokapis.com/v2/research/user/info/';

// In-memory token cache so we don't re-fetch on every autocomplete call
let _cachedToken = null;
let _tokenExpiresAt = 0;

/**
 * Get a TikTok app access token via client_credentials grant.
 * Automatically caches and reuses the token until 60 seconds before expiry.
 *
 * @param {string} clientKey
 * @param {string} clientSecret
 * @returns {Promise<string|null>}
 */
async function getTikTokAccessToken(clientKey, clientSecret) {
	const now = Date.now();

	// Return cached token if still valid (with 60s buffer)
	if (_cachedToken && now < _tokenExpiresAt - 60_000) {
		return _cachedToken;
	}

	try {
		const response = await fetch(TIKTOK_TOKEN_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Cache-Control': 'no-cache',
			},
			body: new URLSearchParams({
				client_key: clientKey,
				client_secret: clientSecret,
				grant_type: 'client_credentials',
			}),
			signal: AbortSignal.timeout(8_000),
		});

		if (!response.ok) return null;

		const data = await response.json();
		if (!data.access_token) return null;

		_cachedToken = data.access_token;
		// expires_in is in seconds; convert to ms
		_tokenExpiresAt = now + (data.expires_in ?? 7200) * 1000;

		return _cachedToken;
	} catch {
		return null;
	}
}

/**
 * Look up a TikTok user by username using the Research API.
 * Returns display name, avatar URL, and follower count.
 *
 * @param {string} username - Without @ prefix (e.g. "elonmusk")
 * @param {string} accessToken
 * @returns {Promise<{displayName: string, avatarUrl: string, followerCount: number} | null>}
 */
async function lookupTikTokUser(username, accessToken) {
	// Strip @ if present
	const cleanUsername = username.replace(/^@/, '');

	try {
		const response = await fetch(
			`${TIKTOK_USER_INFO_URL}?fields=display_name,avatar_url,follower_count`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username: cleanUsername }),
				signal: AbortSignal.timeout(6_000),
			},
		);

		if (!response.ok) return null;

		const json = await response.json();
		const user = json?.data?.user_info;
		if (!user) return null;

		return {
			username: `@${cleanUsername}`,
			displayName: user.display_name || cleanUsername,
			avatarUrl: user.avatar_url || null,
			followerCount: user.follower_count ?? 0,
		};
	} catch {
		return null;
	}
}

/**
 * Fetch the latest TikTok video from a user via RSSHub.
 * @param {string} username - Can include @ prefix
 * @param {string} [rsshubUrl='https://rsshub.app']
 * @returns {Promise<{videoId: string, title: string, url: string, thumbnail: string|null, publishedAt: string|null} | null>}
 */
async function fetchLatestTikTok(username, rsshubUrl = 'https://rsshub.app') {
	const normalizedUsername = username.startsWith('@')
		? username
		: `@${username}`;
	const feedUrl = `${rsshubUrl.replace(/\/$/, '')}/tiktok/user/${encodeURIComponent(normalizedUsername)}`;

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

		const videoIdMatch = rawUrl.match(/\/video\/(\d+)/);
		const videoId = videoIdMatch
			? videoIdMatch[1]
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
			: 'New TikTok Video';

		const publishedAt = pubDateMatch
			? new Date(pubDateMatch[1].trim()).toISOString()
			: null;

		const descMatch = item.match(
			/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/,
		);
		let thumbnail = null;
		if (descMatch) {
			const imgMatch = descMatch[1].match(/<img[^>]+src="([^"]+)"/);
			if (imgMatch) thumbnail = imgMatch[1];
		}

		return { videoId, title, url: rawUrl, thumbnail, publishedAt };
	} catch {
		return null;
	}
}

/**
 * Validate that a TikTok username resolves to content via RSSHub.
 * Used as a fallback when TikTok API credentials are unavailable.
 *
 * @param {string} username
 * @param {string} [rsshubUrl='https://rsshub.app']
 * @returns {Promise<{username: string, displayName: string, feedUrl: string} | null>}
 */
async function validateTikTokUser(username, rsshubUrl = 'https://rsshub.app') {
	const normalizedUsername = username.startsWith('@')
		? username
		: `@${username}`;
	const feedUrl = `${rsshubUrl.replace(/\/$/, '')}/tiktok/user/${encodeURIComponent(normalizedUsername)}`;

	try {
		const response = await fetch(feedUrl, {
			headers: { 'User-Agent': 'KythiaBot/1.0' },
			signal: AbortSignal.timeout(10_000),
		});

		if (!response.ok) return null;

		const xml = await response.text();
		const titleMatch =
			xml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) ||
			xml.match(/<title>(.*?)<\/title>/);
		const channelTitle = titleMatch ? titleMatch[1].trim() : normalizedUsername;

		if (!xml.includes('<item>')) return null;

		return {
			username: normalizedUsername,
			displayName: channelTitle,
			feedUrl,
		};
	} catch {
		return null;
	}
}

module.exports = {
	getTikTokAccessToken,
	lookupTikTokUser,
	fetchLatestTikTok,
	validateTikTokUser,
};
