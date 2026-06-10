/**
 * @namespace: addons/music/commands/music/playlist/track-add.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('track-add')
			.setDescription('Adds a single song to one of your playlists.')
			.addStringOption((option) =>
				option
					.setName('name')
					.setDescription('The name of the playlist to add the song to.')
					.setRequired(true)
					.setAutocomplete(true),
			)
			.addStringOption((option) =>
				option
					.setName('search')
					.setDescription('The song title or URL to add.')
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
		const { client, guild } = interaction;
		const { musicHandlers } = container;

		return musicHandlers.handlePlaylist(
			interaction,
			client.poru.players.get(guild.id),
		);
	},
};
