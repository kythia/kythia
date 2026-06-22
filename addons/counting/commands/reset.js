/**
 * @namespace: addons/counting/commands/reset.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class ResetCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand.setName('reset').setDescription('Reset the counting channel.');
	async execute(interaction) {
		const container = this.container;
		const { models, t, helpers } = container;
		const { Counting } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const guildId = interaction.guild.id;
		const counting = await Counting.getCache({
			guildId,
		});
		if (!counting) {
			const desc = await t(interaction, 'counting.commands.reset.not_enabled');
			await interaction.editReply({
				components: await simpleContainer(interaction, desc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
			return;
		}
		counting.currentCount = 0;
		counting.lastUserId = null;
		let reset = false;
		try {
			await counting.save();
			reset = true;
		} catch (_e) {
			reset = false;
		}
		if (reset) {
			const desc = await t(interaction, 'counting.commands.reset.success');
			await interaction.editReply({
				components: await simpleContainer(interaction, desc, {
					color: 'Green',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			const desc = await t(interaction, 'counting.commands.reset.fail');
			await interaction.editReply({
				components: await simpleContainer(interaction, desc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = ResetCommand;
