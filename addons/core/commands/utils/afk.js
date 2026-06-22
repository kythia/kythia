/**
 * @namespace: addons/core/commands/utils/afk.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class AfkCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('afk')
		.setDescription('Set your Away From Keyboard (AFK) status.')
		.addStringOption((option) =>
			option
				.setName('reason')
				.setDescription('The reason for being AFK.')
				.setRequired(false),
		);
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { UserAFK } = models;
		const { simpleContainer } = helpers.discord;
		const reason =
			interaction.options.getString('reason') ||
			(await t(interaction, 'core.commands.utils.afk.no.reason'));
		const afkData = await UserAFK.getCache({
			userId: interaction.user.id,
		});
		if (afkData) {
			const msg = await t(interaction, 'core.commands.utils.afk.already.afk');
			const components = await simpleContainer(interaction, msg);
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		await UserAFK.create(
			{
				userId: interaction.user.id,
				reason: reason,
				timestamp: new Date(),
			},
			{
				individualHooks: true,
			},
		);
		const replyMessage = await t(
			interaction,
			'core.commands.utils.afk.set.success',
			{
				reason: reason,
			},
		);
		const components = await simpleContainer(interaction, replyMessage);
		await interaction.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = AfkCommand;
