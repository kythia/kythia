/**
 * @namespace: addons/reaction-role/commands/panel/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */
const {
	ContainerBuilder,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder,
} = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('list')
			.setDescription('📜 List all reaction role panels in this server.'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, helpers, kythiaConfig, logger } = container;
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
							'### 🎭 Reaction Role Panels\n\n> No panels found. Use `/reaction-role panel create` to set one up.',
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
						`### 🎭 Reaction Role Panels (${panels.length})\n\n${description}`,
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
	},
};
