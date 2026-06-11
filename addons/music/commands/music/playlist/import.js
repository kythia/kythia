/**
 * @namespace: addons/music/commands/music/playlist/import.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('import')
			.setDescription(
				'Import Playlist from Kythia playlist code or external services like Spotify.',
			)
			.addStringOption((option) =>
				option
					.setName('code')
					.setDescription('Kythia playlist code or Spotify URL to import.')
					.setRequired(true),
			),

	execute(interaction, container) {
		const { client, guild } = interaction;
		const { musicHandlers } = container;

		return musicHandlers.handlePlaylist(
			interaction,
			client.poru.players.get(guild.id),
		);
	},
};
