/**
 * @namespace: addons/ticket/commands/type/delete.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { refreshTicketPanel } = require('../../helpers');

const { BaseCommand } = require('kythia-core');

class DeleteCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('delete')
			.setDescription('Deletes a ticket type.')
			.addStringOption((option) =>
				option
					.setName('type_id')
					.setDescription('Select the ticket type to delete.')
					.setAutocomplete(true)
					.setRequired(true),
			);

	async autocomplete(interaction) {
		const container = this.container;
		const { models } = container;
		const { TicketConfig } = models;
		const focusedValue = interaction.options.getFocused();

		const types = await TicketConfig.getAllCache({
			guildId: interaction.guild.id,
		});

		if (!types || types.length === 0) return interaction.respond([]);

		const filtered = types.filter((t) =>
			t.typeName.toLowerCase().includes(focusedValue.toLowerCase()),
		);

		await interaction.respond(
			filtered.slice(0, 25).map((t) => ({
				name: t.typeName.length > 100 ? t.typeName.slice(0, 100) : t.typeName,
				value: t.id.toString(),
			})),
		);
	}

	async execute(interaction) {
		const container = this.container;
		const { models, t, helpers, logger } = container;
		const { TicketConfig } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		try {
			const typeId = interaction.options.getString('type_id');
			const ticketConfig = await TicketConfig.getCache({ id: typeId });

			if (!ticketConfig) {
				const desc = await t(interaction, 'ticket.errors.config_missing');
				return interaction.editReply({
					components: await simpleContainer(interaction, desc, {
						color: 'Red',
					}),
				});
			}

			const { panelMessageId, typeName } = ticketConfig;

			await ticketConfig.destroy();

			await refreshTicketPanel(panelMessageId, container);

			const desc = await t(interaction, 'ticket.type.delete_success', {
				typeName,
			});
			await interaction.editReply({
				components: await simpleContainer(interaction, desc, {
					color: 'Green',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error deleting ticket type: ${error.message || error}`, {
				label: 'ticket',
			});
			const desc = await t(interaction, 'ticket.errors.generic');
			await interaction.editReply({
				components: await simpleContainer(interaction, desc, { color: 'Red' }),
			});
		}
	}
}

exports.default = DeleteCommand;
