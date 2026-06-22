/**
 * @namespace: addons/reminder/commands/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class ListCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand.setName('list').setDescription('View your active reminders.');
	async execute(interaction) {
		const { models, helpers, kythiaConfig, t } = this.container;
		const { KythiaReminder } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		const reminders = await KythiaReminder.getAllCache({
			where: {
				userId: interaction.user.id,
			},
			order: [['expiresAt', 'ASC']],
			limit: 10, // Just show first 10 for simplicity
		});
		if (!reminders || reminders.length === 0) {
			const errContainer = await simpleContainer(
				interaction,
				await t(interaction, 'reminder.commands.list.reminder.empty'),
				{
					color: kythiaConfig.bot.color,
				},
			);
			return interaction.editReply({
				components: errContainer,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const title = await t(interaction, 'reminder.commands.list.reminder.title');
		let desc = `${title}\n\n`;
		for (const r of reminders) {
			const timestampStr = `<t:${Math.floor(r.expiresAt.getTime() / 1000)}:R>`;
			desc += `**#${r.id}** - ${timestampStr}\n> ${r.reason}\n\n`;
		}
		const components = await simpleContainer(interaction, desc.trim(), {
			color: kythiaConfig.bot.color,
		});
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
module.exports = ListCommand;
