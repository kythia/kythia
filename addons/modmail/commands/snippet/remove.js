/**
 * @namespace: addons/modmail/commands/snippet/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Remove a quick-reply snippet.')
			.addStringOption((option) =>
				option
					.setName('name')
					.setDescription('Name of the snippet to remove.')
					.setRequired(true)
					.setMaxLength(32),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, t, helpers, logger } = container;
		const { ModmailConfig } = models;
		const { simpleContainer } = helpers.discord;

		const name = interaction.options.getString('name').toLowerCase().trim();

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

			const snippets =
				typeof config.snippets === 'object' && config.snippets !== null
					? { ...config.snippets }
					: {};

			if (!snippets[name]) {
				const desc = await t(interaction, 'modmail.snippet.not_found', {
					name,
				});
				return interaction.reply({
					components: await simpleContainer(interaction, desc, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}

			delete snippets[name];
			config.snippets = snippets;
			await config.save();

			const desc = await t(interaction, 'modmail.snippet.remove_success', {
				name,
			});
			return interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Green',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		} catch (error) {
			logger.error(`snippet remove failed: ${error.message || error}`, {
				label: 'modmail',
			});
			const desc = await t(interaction, 'modmail.errors.generic');
			return interaction.reply({
				components: await simpleContainer(interaction, desc, { color: 'Red' }),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	},
};
