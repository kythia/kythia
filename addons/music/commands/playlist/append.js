/**
 * @namespace: addons/music/commands/playlist/append.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { GuildMember, MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('append')
			.setDescription('Adds songs from a playlist to the current queue.')
			.addStringOption((option) =>
				option
					.setName('name')
					.setDescription('The name of the playlist to append.')
					.setRequired(true)
					.setAutocomplete(true),
			),

	async autocomplete(interaction, container) {
		const run = async () => {
			const { models } = container;
			const { Playlist } = models;
			const focusedOption = interaction.options.getFocused(true);
			const focusedValue = focusedOption.value;

			try {
				const userPlaylists = await Playlist.getAllCache({
					where: { userId: interaction.user.id },
					limit: 25,
					cacheTags: [`Playlist:byUser:${interaction.user.id}`],
				});
				if (!userPlaylists) return interaction.respond([]);
				const filteredChoices = userPlaylists
					.map((playlist) => playlist.name)
					.filter((name) =>
						name.toLowerCase().includes(focusedValue.toLowerCase()),
					)
					.map((name) => ({
						name: `🎵 ${name.length > 95 ? `${name.slice(0, 92)}...` : name}`,
						value: name.slice(0, 100),
					}));
				return interaction.respond(filteredChoices.slice(0, 25));
			} catch (_error) {
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

		return musicHandlers.handlePlaylist(
			interaction,
			client.poru.players.get(guild.id),
		);
	},
};
