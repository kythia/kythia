/**
 * @namespace: addons/modmail/commands/snippet/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('list')
			.setDescription('List all saved quick-reply snippets for this server.'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, t, helpers, logger } = container;
		const { ModmailConfig } = models;
		const { simpleContainer } = helpers.discord;

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
					? config.snippets
					: {};
			const keys = Object.keys(snippets);

			if (keys.length === 0) {
				const desc = await t(interaction, 'modmail.snippet.list_empty');
				return interaction.reply({
					components: await simpleContainer(interaction, desc, {
						color: 'Blurple',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}

			const lines = keys
				.map((k) => {
					const preview =
						snippets[k].length > 80
							? `${snippets[k].slice(0, 80)}…`
							: snippets[k];
					return `**\`${k}\`** — ${preview}`;
				})
				.join('\n');

			const header = await t(interaction, 'modmail.snippet.list_header', {
				count: keys.length,
				s: keys.length === 1 ? '' : 's',
			});
			const desc = `${header}\n\n${lines}`;
			return interaction.reply({
				components: await simpleContainer(interaction, desc, {
					color: 'Blurple',
				}),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		} catch (error) {
			logger.error(`snippet list failed: ${error.message || error}`, {
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
