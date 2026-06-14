/**
 * @namespace: addons/ticket/modals/tkt-open-reason.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { createTicketChannel } = require('../helpers');
const { MessageFlags } = require('discord.js');

const { BaseModal } = require('kythia-core');

class TktOpenReasonModal extends BaseModal {
	modal = {};

	async execute(interaction) {
		const container = this.container;

		const { models, t, helpers, logger } = container;
		const { TicketConfig } = models;
		const { simpleContainer } = helpers.discord;

		try {
			const configId = interaction.customId.split(':')[1];
			const reason = interaction.fields.getTextInputValue('reason');

			const ticketConfig = await TicketConfig.getCache({ id: configId });
			if (!ticketConfig) {
				const desc = await t(interaction, 'ticket.errors.invalid_config');
				return interaction.reply({
					components: await simpleContainer(interaction, desc, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}

			await createTicketChannel(interaction, ticketConfig, container, reason);
		} catch (error) {
			logger.error(
				`Error in tkt-open-reason handler: ${error.message || error}`,
				{
					label: 'core:modals:tkt-open-reason',
				},
			);
			const descError = await t(interaction, 'ticket.errors.create_failed');
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					components: await simpleContainer(interaction, descError, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					components: await simpleContainer(interaction, descError, {
						color: 'Red',
					}),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
		}
	}
}

exports.default = TktOpenReasonModal;
