/**
 * @namespace: addons/embed-builder/commands/embed-builder/create.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	SlashCommandSubcommandBuilder,
	EmbedBuilder,
	MessageFlags,
} = require('discord.js');

module.exports = {
	slashCommand: new SlashCommandSubcommandBuilder()
		.setName('create')
		.setDescription('✨ Create a new saved embed')
		.addStringOption((o) =>
			o
				.setName('name')
				.setDescription(
					'A label to identify this embed (e.g. "welcome-message")',
				)
				.setRequired(true)
				.setMaxLength(100),
		)
		.addStringOption((o) =>
			o
				.setName('mode')
				.setDescription('Builder type (default: embed)')
				.setRequired(false)
				.addChoices(
					{ name: '📋 Classic Embed', value: 'embed' },
					{ name: '🧩 Components V2', value: 'components_v2' },
				),
		),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models } = container;
		const { EmbedBuilder: EmbedModel } = models;

		const name = interaction.options.getString('name');
		const mode = interaction.options.getString('mode') ?? 'embed';

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		// Check for duplicate name in this guild
		const existing = await EmbedModel.getCache({
			where: { guildId: interaction.guild.id, name },
		});

		if (existing) {
			return interaction.editReply({
				embeds: [
					new EmbedBuilder()
						.setColor(0xef4444)
						.setDescription(
							`❌ An embed named **"${name}"** already exists in this server.\nUse \`/embed-builder edit\` to modify it.`,
						),
				],
			});
		}

		// Default data templates
		const defaultData =
			mode === 'embed'
				? {
						title: 'My Embed',
						description:
							'Edit this embed using the dashboard or /embed-builder edit.',
						color: 0x5865f2,
					}
				: {
						components: [
							{
								type: 17, // Container
								accent_color: 0x5865f2,
								components: [
									{
										type: 10, // TextDisplay
										content: 'Edit this component using the dashboard.',
									},
								],
							},
						],
					};

		const record = await EmbedModel.create({
			guildId: interaction.guild.id,
			createdBy: interaction.user.id,
			name,
			mode,
			data: defaultData,
			messageId: null,
			channelId: null,
		});

		return interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setColor(0x22c55e)
					.setTitle('🎨 Embed Created!')
					.setDescription(
						`**Name:** \`${name}\`\n**Mode:** \`${mode}\`\n**ID:** \`${record.id}\`\n\nUse \`/embed-builder edit\` or the dashboard to customise it, then \`/embed-builder send\` to post it.`,
					),
			],
		});
	},
};
