/**
 * @namespace: addons/ticket/commands/panel/delete.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class DeleteCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('delete')
			.setDescription('Deletes a ticket panel and all its types.')
			.addStringOption((option) =>
				option
					.setName('panel_id')
					.setDescription('Select the panel to delete.')
					.setAutocomplete(true)
					.setRequired(true),
			);

	async autocomplete(interaction) {
		const container = this.container;
		const { models } = container;
		const { TicketPanel } = models;
		const focusedValue = interaction.options.getFocused();

		const panels = await TicketPanel.getAllCache({
			guildId: interaction.guild.id,
		});

		if (!panels || panels.length === 0) return interaction.respond([]);

		const filtered = panels.filter(
			(p) =>
				p.title.toLowerCase().includes(focusedValue.toLowerCase()) ||
				p.messageId.includes(focusedValue),
		);

		await interaction.respond(
			filtered.slice(0, 25).map((p) => ({
				name: `${p.title.substring(0, 50)} (${p.messageId})`,
				value: p.messageId,
			})),
		);
	}

	async execute(interaction) {
		const container = this.container;
		const { models, t, helpers, logger } = container;
		const { TicketPanel, TicketConfig } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		try {
			const panelMessageId = interaction.options.getString('panel_id');
			const panel = await TicketPanel.getCache({ messageId: panelMessageId });

			if (!panel) {
				const desc = await t(interaction, 'ticket.errors.no_panels_found');
				return interaction.editReply({
					components: await simpleContainer(interaction, desc, {
						color: 'Red',
					}),
				});
			}

			try {
				const channel = await interaction.guild.channels
					.fetch(panel.channelId)
					.catch(() => null);
				if (channel) {
					const message = await channel.messages
						.fetch(panel.messageId)
						.catch(() => null);
					if (message) await message.delete();
				}
			} catch (e) {
				logger.warn(
					`Failed to delete panel message ${panelMessageId}:`,
					e.message,
					{ label: 'ticket' },
				);
			}

			const relatedTypes = await TicketConfig.getAllCache({ panelMessageId });
			if (relatedTypes && relatedTypes.length > 0) {
				for (const type of relatedTypes) {
					await type.destroy();
				}
			}

			await panel.destroy();

			const desc = await t(interaction, 'ticket.panel.delete_success', {
				title: panel.title,
			});
			await interaction.editReply({
				components: await simpleContainer(interaction, desc, {
					color: 'Green',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error deleting panel: ${error.message || error}`, {
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
