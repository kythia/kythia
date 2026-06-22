/**
 * @namespace: addons/core/commands/utils/kyth/presence/afk.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class AfkCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('afk')
			.setDescription('Set bot AFK status')
			.addBooleanOption((option) =>
				option
					.setName('afk')
					.setDescription('Whether to set as AFK')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		try {
			const afk = interaction.options.getBoolean('afk');
			await interaction.client.user.setAFK(afk);
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.commands.utils.kyth.presence.afk.success', {
					state: afk ? 'enabled' : 'disabled',
				}),
				{
					color: 'Green',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error setting AFK: ${error.message || error}`, {
				label: 'presence',
			});
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.helpers.index.utils.presence.error', {
					error: error.message,
				}),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = AfkCommand;
