/**
 * @namespace: addons/ticket/commands/close.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { closeTicket } = require('../helpers');

const { BaseCommand } = require('kythia-core');

class CloseCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('close')
			.setDescription('Close the ticket and delete the ticket channel.');

	async execute(interaction) {
		const container = this.container;
		const { models, t, helpers } = container;
		const { Ticket, TicketConfig } = models;
		const { simpleContainer } = helpers.discord;
		const ticket = await Ticket.getCache({
			channelId: interaction.channel.id,
			status: 'open',
		});

		if (!ticket) {
			const desc = await t(interaction, 'ticket.errors.not_a_ticket');
			return interaction.reply({
				components: await simpleContainer(interaction, desc, { color: 'Red' }),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		const ticketConfig = await TicketConfig.getCache({
			id: ticket.ticketConfigId,
		});
		if (!ticketConfig) {
			const desc = await t(interaction, 'ticket.errors.config_missing');
			return interaction.reply({
				components: await simpleContainer(interaction, desc, { color: 'Red' }),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		await closeTicket(interaction, container);
	}
}

exports.default = CloseCommand;
