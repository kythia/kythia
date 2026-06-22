/**
 * @namespace: addons/music/commands/utils/join.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class JoinCommand extends BaseCommand {
	subcommand = true;
	aliases = ['join'];
	slashCommand = (subcommand) =>
		subcommand
			.setName('join')
			.setDescription('Make Kythia Join the voice channel');
	async execute(interaction) {
		const { simpleContainer } = interaction.client.container.helpers.discord;
		const container = this.container;
		const { client, member, guild } = interaction;
		const { t, musicHandlers } = container;
		if (!member?.voice?.channel) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(
						interaction,
						'music.helpers.index.music.voice.channel.not.found',
					),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const player = client.poru.players.get(guild.id);
		return musicHandlers.handleJoin(interaction, player);
	}
}
exports.default = JoinCommand;
