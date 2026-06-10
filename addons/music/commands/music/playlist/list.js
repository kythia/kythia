/**
 * @namespace: addons/music/commands/music/playlist/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('list')
			.setDescription('Shows all of your saved playlists.'),

	execute(interaction, container) {
		const { client, guild } = interaction;
		const { musicHandlers } = container;

		return musicHandlers.handlePlaylist(
			interaction,
			client.poru.players.get(guild.id),
		);
	},
};
