/**
 * @namespace: addons/embed-builder/commands/embed-builder/edit.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ModalBuilder,
	TextInputStyle,
	ActionRowBuilder,
	TextInputBuilder,
	SlashCommandSubcommandBuilder,
} = require('discord.js');
const { BaseCommand } = require('kythia-core');
class EditCommand extends BaseCommand {
	subcommand = true;
	slashCommand = new SlashCommandSubcommandBuilder()
		.setName('edit')
		.setDescription('Edit a saved embed')
		.addStringOption((option) =>
			option
				.setName('id')
				.setDescription('The embed to edit')
				.setRequired(true)
				.setAutocomplete(true),
		);
	async execute(interaction) {
		const container = this.container;
		const { models } = container;
		const { EmbedBuilder: EmbedModel } = models;
		const embedId = parseInt(interaction.options.getString('id'), 10);
		const record = await EmbedModel.getCache({
			where: {
				id: embedId,
				guildId: interaction.guild.id,
			},
		});
		if (!record) {
			const { simpleContainer } = container.helpers.discord;
			const { t } = container;
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'embed-builder.shared.edit.not_found'),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const data = record.data || {};
		if (record.mode === 'embed') {
			// Open a Discord modal for classic embed fields
			let modalTitle = `Edit: ${record.name}`;
			if (modalTitle.length > 45) {
				modalTitle = `${modalTitle.substring(0, 42)}...`;
			}
			const modal = new ModalBuilder()
				.setCustomId(`eb-edit|${record.id}`)
				.setTitle(modalTitle);
			modal.addComponents(
				new ActionRowBuilder().addComponents(
					new TextInputBuilder()
						.setCustomId('title')
						.setLabel('Title')
						.setStyle(TextInputStyle.Short)
						.setValue(data.title ?? '')
						.setRequired(false)
						.setMaxLength(256),
				),
				new ActionRowBuilder().addComponents(
					new TextInputBuilder()
						.setCustomId('description')
						.setLabel('Description')
						.setStyle(TextInputStyle.Paragraph)
						.setValue(data.description ?? '')
						.setRequired(false)
						.setMaxLength(4000),
				),
				new ActionRowBuilder().addComponents(
					new TextInputBuilder()
						.setCustomId('color')
						.setLabel('Color (hex, e.g. #5865F2)')
						.setStyle(TextInputStyle.Short)
						.setValue(
							data.color
								? `#${Number(data.color).toString(16).padStart(6, '0')}`
								: '',
						)
						.setRequired(false)
						.setMaxLength(7),
				),
				new ActionRowBuilder().addComponents(
					new TextInputBuilder()
						.setCustomId('image_url')
						.setLabel('Image URL (optional)')
						.setStyle(TextInputStyle.Short)
						.setValue(data.image?.url ?? '')
						.setRequired(false)
						.setMaxLength(1000),
				),
				new ActionRowBuilder().addComponents(
					new TextInputBuilder()
						.setCustomId('footer')
						.setLabel('Footer text (optional)')
						.setStyle(TextInputStyle.Short)
						.setValue(data.footer?.text ?? '')
						.setRequired(false)
						.setMaxLength(2048),
				),
			);
			return interaction.showModal(modal);
		}

		// components_v2: modal can't hold full JSON, guide to dashboard instead
		const { createContainer } = container.helpers.discord;
		const { t } = container;
		return interaction.reply({
			components: await createContainer(interaction, {
				title: await t(
					interaction,
					'embed-builder.commands.edit.ui.components_v2',
				),
				description: await t(
					interaction,
					'embed-builder.commands.edit.ui.components_v2_desc',
					{
						name: record.name,
						id: record.id,
					},
				),
				color: '#5865F2',
			}),
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	}
}
exports.default = EditCommand;
