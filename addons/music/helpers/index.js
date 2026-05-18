/**
 * @namespace: addons/music/helpers/index.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */
const { generateContent } = require('@addons/ai/helpers/gemini');
const { YoutubeTranscript } = require('youtube-transcript');
const { PermissionFlagsBits } = require('discord.js');

/**
 * ⏱️ Formats a duration in milliseconds to a human-readable string (hh:mm:ss or mm:ss).
 * @param {number} ms - Duration in milliseconds.
 * @returns {string} Formatted duration string.
 */
function formatTrackDuration(ms) {
	if (typeof ms !== 'number' || Number.isNaN(ms) || ms < 0) return '0:00';
	const totalSeconds = Math.floor(ms / 1000);
	const hours = Math.floor(totalSeconds / 3600);
	const minutes = Math.floor((totalSeconds % 3600) / 60);
	const seconds = totalSeconds % 60;
	if (hours > 0) {
		return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
	} else {
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}
}

/**
 * 🎚️ Creates a progress bar string for the currently playing track.
 * @param {Player} player - The Erela.js player instance.
 * @returns {string} Progress bar string with current and total duration.
 */
function createProgressBar(player) {
	if (!player.currentTrack?.info.length) return '';

	if (player.currentTrack.info.isStream)
		return '`00:00|▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬🔴 LIVE`';

	const current = player.position;

	const total = player.currentTrack.info.length;
	const size = 25;

	let percent = Math.round((current / total) * size);

	if (percent < 0) percent = 0;
	if (percent > size) percent = size;

	const empty = size - percent;
	const safeEmpty = empty < 0 ? 0 : empty;

	const progress = `${'▬'.repeat(percent)}🔵${'▬'.repeat(safeEmpty)}`;
	return `\`${formatTrackDuration(current)}|${progress}|${formatTrackDuration(total)}\``;
}

/**
 * 🎤 Generates lyrics for a song using a transcript from a YouTube video.
 * @param {string} artist - The artist of the song.
 * @param {string} title - The title of the song.
 * @param {string} trackUri - The URI of the YouTube video.
 * @returns {Promise<string>} The generated lyrics.
 */
async function generateLyricsWithTranscript(
	container,
	artist,
	title,
	trackUri,
) {
	const { logger } = container;
	let transcriptText = null;
	let transcript = null;
	try {
		transcript = await YoutubeTranscript.fetchTranscript(trackUri);
		if (transcript && transcript.length > 0) {
			transcriptText = transcript.map((line) => line.text).join(' ');
		}
	} catch (e) {
		logger.warn(`Can't get transcript for ${trackUri}: ${e.message}`, {
			label: 'music',
		});
	}

	if (!transcriptText) {
		return null;
	}

	const prompt = `You are an expert lyricist. Given the following information, generate the full lyrics of the song as accurately as possible, using the transcript as your main reference. 
        Artist: "${artist}"
        Title: "${title}"
        Transcript (reference): "${transcriptText}"

        Write the lyrics in a coherent, complete, and natural way, matching the style and tone of ${artist}.`;

	try {
		const aiLyrics = await generateContent(prompt);
		return aiLyrics;
	} catch (e) {
		logger.error(`Error when generating lyrics with AI: ${e.stack}`, {
			label: 'music',
		});
		return null;
	}
}

/**
 * 🔒 Checks if the user has permission to control the player.
 * Permission is granted to the Bot Owner, Server Admin, or the user who requested the song.
 * @param {import('discord.js').Interaction} interaction
 * @param {object} player - Poru Player
 * @returns {boolean}
 */
function hasControlPermission(interaction, player) {
	const { isOwner } = interaction.client.container.helpers.discord;

	if (isOwner(interaction.user.id)) return true;

	if (
		interaction.member.permissions.has(PermissionFlagsBits.ManageGuild) ||
		interaction.member.permissions.has(PermissionFlagsBits.Administrator)
	)
		return true;

	if (!player.currentTrack) return false;

	const requesterId = player.currentTrack.info.requester?.id;
	if (interaction.user.id === requesterId) return true;

	return false;
}

module.exports = {
	formatTrackDuration,
	createProgressBar,
	generateLyricsWithTranscript,
	hasControlPermission,
};
