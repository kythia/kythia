/**
 * @namespace: addons/modmail/commands/unblock.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class UnblockCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('unblock')
			.setDescription('Remove a modmail block from a user.')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to unblock.')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { models, t, helpers, logger } = container;
		const { ModmailConfig } = models;
		const { simpleContainer } = helpers.discord;
		const user = interaction.options.getUser('user');
		try {
			const config = await ModmailConfig.getCache({
				guildId: interaction.guild.id,
			});
			if (!config) {
				const desc = await t(
					interaction,
					'modmail.helpers.index.errors.not_configured',
				);
				return interaction.reply({
					components: await simpleContainer(interaction, desc, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
			const blocked = Array.isArray(config.blockedUserIds)
				? [...config.blockedUserIds]
				: [];
			if (!blocked.includes(user.id)) {
				const desc = await t(
					interaction,
					'modmail.commands.unblock.not_blocked',
					{
						userId: user.id,
					},
				);
				return interaction.reply({
					components: await simpleContainer(interaction, desc, {
						color: 'Yellow',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
			config.blockedUserIds = blocked.filter((id) => id !== user.id);
			await config.save();
			const desc = await t(interaction, 'modmail.commands.unblock.success', {
				userId: user.id,
			});
			return interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Green',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		} catch (error) {
			logger.error(
				`[modmail:unblock] Error: ${error.message || String(error)}`,
				{
					label: 'modmail:unblock',
				},
			);
			const desc = await t(interaction, 'modmail.helpers.index.errors.generic');
			return interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Red',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	}
}
exports.default = UnblockCommand;
