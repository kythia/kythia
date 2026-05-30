/**
 * @namespace: addons/social-alerts/helpers/youtube.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

/**
 * Search YouTube channels by query using YouTube Data API v3.
 * @param {string} query
 * @param {string} apiKey
 * @returns {Promise<Array<{id: string, name: string, thumbnail: string}>>}
 */
async function searchYouTubeChannels(query, apiKey) {
	if (!query || query.trim().length < 2) return [];

	const url = new URL('https://www.googleapis.com/youtube/v3/search');
	url.searchParams.set('part', 'snippet');
	url.searchParams.set('type', 'channel');
	url.searchParams.set('q', query.trim());
	url.searchParams.set('maxResults', '25');
	url.searchParams.set('key', apiKey);

	try {
		const response = await fetch(url.href);
		if (!response.ok) return [];
		const data = await response.json();
		return (data.items ?? []).map((item) => ({
			id: item.snippet.channelId,
			name: item.snippet.channelTitle,
			thumbnail: item.snippet.thumbnails?.default?.url ?? null,
		}));
	} catch {
		return [];
	}
}

/**
 * Fetch the latest video from a YouTube channel's RSS feed.
 * @param {string} channelId
 * @returns {Promise<{videoId: string, title: string, url: string, thumbnail: string, publishedAt: string} | null>}
 */
async function fetchLatestVideo(channelId) {
	const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

	try {
		const response = await fetch(feedUrl, {
			headers: { 'User-Agent': 'KythiaBot/1.0' },
		});
		if (!response.ok) return null;

		const xml = await response.text();

		// Extract the first <entry> block
		const entryMatch = xml.match(/<entry>([\s\S]*?)<\/entry>/);
		if (!entryMatch) return null;
		const entry = entryMatch[1];

		const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
		const titleMatch = entry.match(/<title>(.*?)<\/title>/);
		const publishedMatch = entry.match(/<published>(.*?)<\/published>/);

		if (!videoIdMatch) return null;

		const videoId = videoIdMatch[1].trim();
		const title = titleMatch
			? titleMatch[1]
					.trim()
					.replace(/&amp;/g, '&')
					.replace(/&lt;/g, '<')
					.replace(/&gt;/g, '>')
					.replace(/&#39;/g, "'")
					.replace(/&quot;/g, '"')
			: 'New Video';
		const url = `https://www.youtube.com/watch?v=${videoId}`;
		const thumbnail = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
		const publishedAt = publishedMatch ? publishedMatch[1].trim() : null;

		return { videoId, title, url, thumbnail, publishedAt };
	} catch {
		return null;
	}
}

module.exports = { searchYouTubeChannels, fetchLatestVideo };
