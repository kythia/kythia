/**
 * @namespace: addons/music/commands/favorite/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');

class ListCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand.setName('list').setDescription('🌟 Show your favorite songs.');

	execute(interaction) {
		const container = this.container;
		const { client, guild } = interaction;
		const { musicHandlers } = container;

		return musicHandlers.handleFavorite(
			interaction,
			client.poru.players.get(guild.id),
		);
	}
}

exports.default = ListCommand;
