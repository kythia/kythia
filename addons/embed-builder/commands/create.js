/**
 * @namespace: addons/embed-builder/commands/embed-builder/create.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, SlashCommandSubcommandBuilder } = require('discord.js');
const { BaseCommand } = require('kythia-core');

class CreateCommand extends BaseCommand {
	subcommand = true;
	slashCommand = new SlashCommandSubcommandBuilder()
		.setName('create')
		.setDescription('Create a new saved embed')
		.addStringOption((option) =>
			option
				.setName('name')
				.setDescription(
					'A label to identify this embed (e.g. "welcome-message")',
				)
				.setRequired(true)
				.setMaxLength(100),
		)
		.addStringOption((option) =>
			option
				.setName('mode')
				.setDescription('Builder type (default: embed)')
				.setRequired(false)
				.addChoices(
					{
						name: '📋 Classic Embed',
						value: 'embed',
					},
					{
						name: '🧩 Components V2',
						value: 'components_v2',
					},
				),
		);

	async execute(interaction) {
		const container = this.container;
		const { models, t } = container;
		const { EmbedBuilder: EmbedModel } = models;
		const name = interaction.options.getString('name');
		const mode = interaction.options.getString('mode') ?? 'embed';
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});

		// Check for duplicate name in this guild
		const existing = await EmbedModel.getCache({
			where: {
				guildId: interaction.guild.id,
				name,
			},
		});
		if (existing) {
			const { simpleContainer } = container.helpers.discord;
			return interaction.editReply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'embed-builder.create.duplicate', {
						name,
					}),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Default data templates
		const defaultData =
			mode === 'embed'
				? {
						title: await t(
							interaction,
							'embed-builder.create.default.embed_title',
						),
						description: await t(
							interaction,
							'embed-builder.create.default.embed_desc',
						),
						color: 0x5865f2,
					}
				: {
						components: [
							{
								type: 17,
								// Container
								accent_color: 0x5865f2,
								components: [
									{
										type: 10,
										// TextDisplay
										content: await t(
											interaction,
											'embed-builder.create.default.component_content',
										),
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
		const { createContainer } = container.helpers.discord;
		return interaction.editReply({
			components: await createContainer(interaction, {
				title: await t(interaction, 'embed-builder.create.success.title'),
				description: await t(interaction, 'embed-builder.create.success.desc', {
					name,
					mode,
					id: record.id,
				}),
				color: 'Green',
			}),
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = CreateCommand;
