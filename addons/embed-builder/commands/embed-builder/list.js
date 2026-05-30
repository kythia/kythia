/**
 * @namespace: addons/embed-builder/commands/embed-builder/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	SlashCommandSubcommandBuilder,
	EmbedBuilder,
	MessageFlags,
} = require('discord.js');

module.exports = {
	slashCommand: new SlashCommandSubcommandBuilder()
		.setName('list')
		.setDescription('📋 List all saved embeds for this server'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models } = container;
		const { EmbedBuilder: EmbedModel } = models;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const embeds = await EmbedModel.getAllCache({
			where: { guildId: interaction.guild.id },
			order: [['createdAt', 'DESC']],
		});

		if (embeds.length === 0) {
			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(0x5865f2)
						.setDescription(
							'📭 No saved embeds yet.\nUse `/embed-builder create` to get started!',
						),
				],
			});
		}

		// Chunk into pages of 10
		const perPage = 10;
		const page = embeds.slice(0, perPage);

		const lines = page.map((e) => {
			const modeIcon = e.mode === 'components_v2' ? '🧩' : '📋';
			const sentInfo = e.messageId
				? ` · [sent](https://discord.com/channels/${interaction.guild.id}/${e.channelId}/${e.messageId})`
				: '';
			return `${modeIcon} **${e.name}** \`#${e.id}\`${sentInfo}`;
		});

		const footer =
			embeds.length > perPage
				? `\n\n_...and ${embeds.length - perPage} more. Use the dashboard to see all._`
				: '';

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(0x5865f2)
					.setTitle(`🎨 Saved Embeds — ${interaction.guild.name}`)
					.setDescription(lines.join('\n') + footer)
					.setFooter({
						text: `${embeds.length} embed${embeds.length !== 1 ? 's' : ''} total`,
					}),
			],
		});
	},
};
