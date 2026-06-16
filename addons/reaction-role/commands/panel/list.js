/**
 * @namespace: addons/reaction-role/commands/panel/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ListCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('list')
			.setDescription('📜 List all reaction role panels in this server.');

	async execute(interaction) {
		const container = this.container;
		const { models, helpers, kythiaConfig, logger, t } = container;
		const { ReactionRolePanel, ReactionRole } = models;
		const { convertColor } = helpers.color;
		const { chunkTextDisplay } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		try {
			const panels = await ReactionRolePanel.getAllCache({
				where: { guildId: interaction.guildId },
			});

			const accentColor = convertColor(kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			});

			if (!panels || panels.length === 0) {
				const emptyContainer = new ContainerBuilder()
					.setAccentColor(accentColor)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(interaction, 'reaction-role.panel.list.empty_md'),
						),
					);

				return interaction.editReply({
					components: [emptyContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// Load emoji binding counts for all panels at once
			const allBindings = await ReactionRole.getAllCache({
				where: { guildId: interaction.guildId },
				attributes: ['panelId'],
			});

			const countMap = {};
			for (const b of allBindings) {
				if (b.panelId !== null) {
					countMap[b.panelId] = (countMap[b.panelId] || 0) + 1;
				}
			}

			let description = '';
			for (const panel of panels) {
				const emojiCount = countMap[panel.id] || 0;
				const modeLabel =
					panel.mode === 'post_embed' ? '📨 Embed' : '🔗 Message';
				const typeLabel =
					panel.panelType === 'dropdown' ? '🔽 Dropdown' : '😀 Reaction';
				const messageLink = panel.messageId
					? ` • [Jump](https://discord.com/channels/${panel.guildId}/${panel.channelId}/${panel.messageId})`
					: '';

				description += `**[ID: ${panel.id}]** ${panel.title || '*(untitled)*'}\n${modeLabel} • ${typeLabel} • <#${panel.channelId}>${messageLink} • ${emojiCount} option(s)\n\n`;
			}

			const listContainer = new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(
					...chunkTextDisplay(
						await t(interaction, 'reaction-role.panel.list.content_md', {
							count: panels.length,
							description,
						}),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						'Use `/reaction-role panel delete` to remove a panel.',
					),
				);

			return interaction.editReply({
				components: [listContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error: ${error.message || error}`, {
				label: 'reaction-role:panel:list',
			});
			return interaction.editReply({
				content: 'An error occurred while listing panels.',
			});
		}
	}
}

exports.default = ListCommand;
