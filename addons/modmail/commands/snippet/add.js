/**
 * @namespace: addons/modmail/commands/snippet/add.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('add')
			.setDescription('Add a new quick-reply snippet.')
			.addStringOption((option) =>
				option
					.setName('name')
					.setDescription(
						'Short name/trigger for the snippet (e.g. "hello", "scam").',
					)
					.setRequired(true)
					.setMaxLength(32),
			)
			.addStringOption((option) =>
				option
					.setName('content')
					.setDescription('The snippet text content.')
					.setRequired(true)
					.setMaxLength(2000),
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
		const content = interaction.options.getString('content');

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

			if (Object.keys(snippets).length >= 50) {
				const desc = await t(interaction, 'modmail.snippet.limit');
				return interaction.reply({
					components: await simpleContainer(interaction, desc, {
						color: 'Yellow',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}

			snippets[name] = content;
			config.snippets = snippets;
			await config.save();

			const desc = await t(interaction, 'modmail.snippet.add_success', {
				name,
			});
			return interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Green',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		} catch (error) {
			logger.error(`snippet add failed: ${error.message || error}`, {
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
