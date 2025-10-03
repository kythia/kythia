/**
 * @namespace: addons/music/helpers/index.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { YoutubeTranscript } = require('youtube-transcript');
const logger = require('@utils/logger');
const { generateContent } = require('@addons/ai/helpers/gemini');
const { PermissionFlagsBits } = require('discord.js');

/**
 * ⏱️ Formats a duration in milliseconds to a human-readable string (hh:mm:ss or mm:ss).
 * @param {number} ms - Duration in milliseconds.
 * @returns {string} Formatted duration string.
 */
function formatDuration(ms) {
    if (typeof ms !== 'number' || isNaN(ms) || ms < 0) return '0:00';
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
    // === PERUBAHAN UTAMA DI SINI ===
    // Menggunakan player.currentTrack, bukan player.queue.current
    if (!player.currentTrack || !player.currentTrack.info.length) return '';

    // Mengecek isStream dari info lagu
    if (player.currentTrack.info.isStream) return '`00:00|▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬🔴 LIVE`';

    const current = player.position;
    // Mengambil durasi dari info.length
    const total = player.currentTrack.info.length;
    const size = 25;

    // Logika di bawah ini sudah benar, tidak perlu diubah
    let percent = Math.round((current / total) * size);

    if (percent < 0) percent = 0;
    if (percent > size) percent = size;

    const empty = size - percent;
    const safeEmpty = empty < 0 ? 0 : empty;

    const progress = '▬'.repeat(percent) + '🔵' + '▬'.repeat(safeEmpty);
    return `\`${formatDuration(current)}|${progress}|${formatDuration(total)}\``;
}

/**
 * 🎤 Generates lyrics for a song using a transcript from a YouTube video.
 * @param {string} artist - The artist of the song.
 * @param {string} title - The title of the song.
 * @param {string} trackUri - The URI of the YouTube video.
 * @returns {Promise<string>} The generated lyrics.
 */
async function generateLyricsWithTranscript(artist, title, trackUri) {
    let transcriptText = null;
    let transcript = null;
    try {
        // 1. Try to fetch transcript from YouTube video
        transcript = await YoutubeTranscript.fetchTranscript(trackUri);
        if (transcript && transcript.length > 0) {
            // Join all transcript lines into a single paragraph
            transcriptText = transcript.map((line) => line.text).join(' ');
        }
    } catch (e) {
        logger.warn(`Can't get transcript for ${trackUri}: ${e.message}`);
        // If failed, transcriptText remains null
    }

    // console.log(transcriptText);
    // 2. Build prompt only if transcript is available
    if (!transcriptText) {
        return null;
    }

    const prompt = `You are an expert lyricist. Given the following information, generate the full lyrics of the song as accurately as possible, using the transcript as your main reference. 
        Artist: "${artist}"
        Title: "${title}"
        Transcript (reference): "${transcriptText}"

        Write the lyrics in a coherent, complete, and natural way, matching the style and tone of ${artist}.`;

    // 3. Call AI with the constructed prompt
    try {
        const aiLyrics = await generateContent(prompt);
        return aiLyrics;
    } catch (e) {
        logger.error(`Error when generating lyrics with AI: ${e.stack}`);
        return null;
    }
}

/**
 * 🔒 Cek apakah user punya izin buat mengontrol player.
 * Izin diberikan ke Owner Bot, Admin Server, atau si perequest lagu.
 * @param {import('discord.js').Interaction} interaction
 * @param {object} player - Player Poru
 * @returns {boolean}
 */
function hasControlPermission(interaction, player) {
    // 1. Cek apakah ada lagu yang jalan
    if (!player.currentTrack) return false; // Seharusnya tidak terjadi, tapi untuk jaga-jaga

    // 2. Owner bot selalu boleh
    if (interaction.user.id === kythia.owner.id) return true;

    // 3. Admin server selalu boleh
    if (
        interaction.member.permissions.has(PermissionFlagsBits.ManageGuild) ||
        interaction.member.permissions.has(PermissionFlagsBits.Administrator)
    )
        return true;

    // 4. Cek apakah user adalah si perequest lagu
    const requesterId = player.currentTrack.info.requester?.id;
    if (interaction.user.id === requesterId) return true;

    // Jika semua gagal, berarti tidak punya izin
    return false;
}

module.exports = {
    formatDuration,
    createProgressBar,
    generateLyricsWithTranscript,
    hasControlPermission,
};
