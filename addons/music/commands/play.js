/**
 * @namespace: addons/music/commands/play.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { GuildMember, MessageFlags } = require('discord.js');
const { formatTrackDuration } = require('../helpers');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('play')
			.setDescription('🎶 Play a song or add it to the queue')
			.addStringOption((option) =>
				option
					.setName('search')
					.setDescription(
						'Song title or URL (YouTube, Spotify (can be playlist link))',
					)
					.setRequired(true)
					.setAutocomplete(true),
			),

	async autocomplete(interaction, container) {
		const run = async () => {
			const { client, kythiaConfig } = container;
			const focusedOption = interaction.options.getFocused(true);
			const focusedValue = focusedOption.value;

			if (focusedValue.toLowerCase().includes('spotify')) {
				const truncatedUrl =
					focusedValue.length > 50
						? `${focusedValue.slice(0, 47)}...`
						: focusedValue;
				return interaction.respond([
					{
						name: `🎵 Play Spotify: ${truncatedUrl}`,
						value: focusedValue.slice(0, 100),
					},
				]);
			} else if (focusedValue.toLowerCase().includes('youtube')) {
				const truncatedUrl =
					focusedValue.length > 50
						? `${focusedValue.slice(0, 47)}...`
						: focusedValue;
				return interaction.respond([
					{
						name: `🎵 Play Youtube: ${truncatedUrl}`,
						value: focusedValue.slice(0, 100),
					},
				]);
			} else if (/^https?:\/\//.test(focusedValue)) {
				const truncatedUrl =
					focusedValue.length > 60
						? `${focusedValue.slice(0, 57)}...`
						: focusedValue;
				return interaction.respond([
					{
						name: `🎵 Play from URL: ${truncatedUrl}`,
						value: focusedValue.slice(0, 100),
					},
				]);
			}

			if (!client._musicAutocompleteCache)
				client._musicAutocompleteCache = new Map();
			const searchCache = client._musicAutocompleteCache;

			if (searchCache.has(focusedValue))
				return interaction.respond(searchCache.get(focusedValue));
			if (!focusedValue || focusedValue.trim().length === 0)
				return interaction.respond([]);
			if (/^https?:\/\//.test(focusedValue)) return interaction.respond([]);

			if (!client.poru || typeof client.poru.resolve !== 'function')
				return interaction.respond([]);

			try {
				const source = kythiaConfig.addons.music.defaultPlatform || 'ytsearch';
				const res = await client.poru.resolve({
					query: focusedValue,
					source: source,
					requester: interaction.user,
				});
				if (
					!res?.tracks ||
					!Array.isArray(res.tracks) ||
					res.tracks.length === 0
				)
					return interaction.respond([]);
				const choices = res.tracks
					.slice(0, kythiaConfig.addons.music.autocompleteLimit)
					.map((track) => ({
						name: `🎵 ${track.info.title.length > 80 ? `${track.info.title.slice(0, 77)}…` : track.info.title} [${formatTrackDuration(track.info.length)}]`,
						value: (track.info.uri || '').slice(0, 100),
					}));
				searchCache.set(focusedValue, choices);
				return interaction.respond(choices);
			} catch (_e) {
				return interaction.respond([]);
			}
		};
		try {
			await run();
		} catch (error) {
			if (error.code === 10062 || error.message === 'Unknown interaction')
				return;
		}
	},

	async execute(interaction, container) {
		const { client, member, guild } = interaction;
		const { t, musicHandlers } = container;

		if (!(member instanceof GuildMember) || !member.voice.channel) {
			return interaction.reply({
				content: await t(interaction, 'music.music.voice.channel.not.found'),
				flags: MessageFlags.Ephemeral,
			});
		}

		return musicHandlers.handlePlay(
			interaction,
			client.poru.players.get(guild.id),
		);
	},
};
