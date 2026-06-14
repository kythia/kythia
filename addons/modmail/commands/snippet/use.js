/**
 * @namespace: addons/modmail/commands/snippet/use.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { relayStaffReply } = require('../../helpers');

const { BaseCommand } = require('kythia-core');

class UseCommand extends BaseCommand {
	slashCommand = (subcommand) =>
		subcommand
			.setName('use')
			.setDescription(
				'Send a snippet as a named reply to the user in this modmail thread.',
			)
			.addStringOption((option) =>
				option
					.setName('name')
					.setDescription('Name of the snippet to send.')
					.setRequired(true)
					.setMaxLength(32),
			);

	async execute(interaction) {
		const container = this.container;
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
					? config.snippets
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

			// Relay as a named (non-anonymous) reply
			return relayStaffReply(interaction, snippets[name], false, container);
		} catch (error) {
			logger.error(`snippet use failed: ${error.message || error}`, {
				label: 'modmail',
			});
			const desc = await t(interaction, 'modmail.errors.generic');
			return interaction.reply({
				components: await simpleContainer(interaction, desc, { color: 'Red' }),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	}
}

exports.default = UseCommand;
