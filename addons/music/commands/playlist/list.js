/**
 * @namespace: addons/music/commands/playlist/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');

class ListCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('list')
			.setDescription('Shows all of your saved playlists.');

	execute(interaction) {
		const container = this.container;
		const { client, guild } = interaction;
		const { musicHandlers } = container;

		return musicHandlers.handlePlaylist(
			interaction,
			client.poru.players.get(guild.id),
		);
	}
}

exports.default = ListCommand;
