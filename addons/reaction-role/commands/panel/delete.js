/**
 * @namespace: addons/reaction-role/commands/panel/delete.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ContainerBuilder,
	MessageFlags,
	TextDisplayBuilder,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class DeleteCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('delete')
			.setDescription('🗑️ Delete a reaction role panel and all its bindings.')
			.addIntegerOption((option) =>
				option
					.setName('panel_id')
					.setDescription(
						'The ID of the panel to delete (from /rr panel list).',
					)
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { models, helpers, logger } = container;
		const { ReactionRolePanel, ReactionRole } = models;
		const { convertColor } = helpers.color;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const panelId = interaction.options.getInteger('panel_id');

		try {
			const panel = await ReactionRolePanel.getCache({
				where: { id: panelId, guildId: interaction.guildId },
			});

			if (!panel) {
				return interaction.editReply({
					content: `❌ Panel with ID **${panelId}** not found in this server.`,
				});
			}

			// Remove bot reactions from the panel message (best-effort)
			try {
				const channel = await interaction.client.channels
					.fetch(panel.channelId)
					.catch(() => null);
				if (channel && panel.messageId) {
					const message = await channel.messages
						.fetch(panel.messageId)
						.catch(() => null);
					if (message) {
						const bindings = await ReactionRole.getAllCache({
							where: { panelId: panel.id },
						});
						for (const rr of bindings) {
							try {
								const reaction = message.reactions.cache.find((r) => {
									const e = r.emoji.id ?? r.emoji.name;
									return (
										e === rr.emoji ||
										`<:${r.emoji.name}:${r.emoji.id}>` === rr.emoji
									);
								});
								if (reaction) {
									await reaction.users.remove(interaction.client.user.id);
								}
							} catch (_) {}
						}
					}
				}
			} catch (_) {}

			// Destroy panel (cascades to reaction_roles via FK)
			await panel.destroy();

			const successContainer = new ContainerBuilder()
				.setAccentColor(
					convertColor('Green', { from: 'discord', to: 'decimal' }),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`✅ **Panel [ID: ${panelId}]** has been deleted along with all its emoji bindings.`,
					),
				);

			return interaction.editReply({
				components: [successContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error: ${error.message || error}`, {
				label: 'reaction-role:panel:delete',
			});
			return interaction.editReply({
				content: 'An error occurred while deleting the panel.',
			});
		}
	}
}

exports.default = DeleteCommand;
