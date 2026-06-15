/**
 * @namespace: addons/music/commands/utils/history.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class HistoryCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('history')
			.setDescription('📜 Show the history of played songs');

	async execute(interaction) {
		const { simpleContainer } = interaction.client.container.helpers.discord;

		const container = this.container;
		const { client, member, guild } = interaction;
		const { t, musicHandlers, music } = container;

		if (!member?.voice?.channel) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'music.music.voice.channel.not.found'),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		const player = client.poru.players.get(guild.id);

		return musicHandlers.handleHistory(interaction, player, music.guildStates);
	}
}

exports.default = HistoryCommand;
