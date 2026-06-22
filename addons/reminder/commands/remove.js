/**
 * @namespace: addons/reminder/commands/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class RemoveCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Remove an active reminder.')
			.addIntegerOption((option) =>
				option
					.setName('id')
					.setDescription('The ID of the reminder to remove')
					.setRequired(true),
			);
	async execute(interaction) {
		const { models, helpers, kythiaConfig, t } = this.container;
		const { KythiaReminder } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		const id = interaction.options.getInteger('id');
		const reminder = await KythiaReminder.getCache({
			where: {
				id,
				userId: interaction.user.id,
			},
		});
		if (!reminder) {
			const errContainer = await simpleContainer(
				interaction,
				await t(interaction, 'reminder.commands.remove.reminder.not_found'),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components: errContainer,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		await reminder.destroy();
		const msg = await t(
			interaction,
			'reminder.commands.remove.reminder.success',
			{
				id: id,
			},
		);
		const components = await simpleContainer(interaction, msg, {
			color: kythiaConfig.bot.color,
		});
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
module.exports = RemoveCommand;
