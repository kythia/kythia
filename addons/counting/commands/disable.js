/**
 * @namespace: addons/counting/commands/disable.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class DisableCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('disable')
			.setDescription('Disable the counting channel.');
	async execute(interaction) {
		const container = this.container;
		const { models, t, helpers } = container;
		const { Counting } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const deleted = await Counting.destroy({
			where: {
				guildId: interaction.guild.id,
			},
		});
		if (deleted) {
			const desc = await t(interaction, 'counting.commands.disable.success');
			await interaction.editReply({
				components: await simpleContainer(interaction, desc, {
					color: 'Green',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			const desc = await t(
				interaction,
				'counting.commands.disable.not_enabled',
			);
			await interaction.editReply({
				components: await simpleContainer(interaction, desc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = DisableCommand;
