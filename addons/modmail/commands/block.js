/**
 * @namespace: addons/modmail/commands/block.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('block')
			.setDescription('Block a user from opening new modmail threads.')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user to block.')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('reason')
					.setDescription('Reason for blocking (for staff reference).')
					.setRequired(false)
					.setMaxLength(300),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, t, helpers, logger } = container;
		const { ModmailConfig } = models;
		const { simpleContainer } = helpers.discord;

		const user = interaction.options.getUser('user');
		const reason = interaction.options.getString('reason') || null;

		try {
			const config = await ModmailConfig.getCache({
				guildId: interaction.guild.id,
			});
			if (!config) {
				const desc = await t(interaction, 'modmail.errors.not_configured');
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

			if (blocked.includes(user.id)) {
				const desc = await t(interaction, 'modmail.block.already_blocked', {
					userId: user.id,
				});
				return interaction.reply({
					components: await simpleContainer(interaction, desc, {
						color: 'Yellow',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}

			blocked.push(user.id);
			config.blockedUserIds = blocked;
			await config.save();

			const desc = await t(interaction, 'modmail.block.success', {
				userId: user.id,
				reason: reason || 'No reason provided',
			});
			return interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Green',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		} catch (error) {
			logger.error(`Error: ${error.message || String(error)}`, {
				label: 'modmail:block',
			});
			const desc = await t(interaction, 'modmail.errors.generic');
			return interaction.reply({
				components: await simpleContainer(interaction, desc, { color: 'Red' }),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	},
};
