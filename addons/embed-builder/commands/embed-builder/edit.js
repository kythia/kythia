/**
 * @namespace: addons/embed-builder/commands/embed-builder/edit.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	EmbedBuilder,
	MessageFlags,
	ModalBuilder,
	TextInputStyle,
	ActionRowBuilder,
	TextInputBuilder,
	SlashCommandSubcommandBuilder,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class EditCommand extends BaseCommand {
	slashCommand = new SlashCommandSubcommandBuilder()
		.setName('edit')
		.setDescription('✏️ Edit a saved embed')
		.addStringOption((o) =>
			o
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
			where: { id: embedId, guildId: interaction.guild.id },
		});

		if (!record) {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor(0xef4444)
						.setDescription('❌ Embed not found in this server.'),
				],
				flags: MessageFlags.Ephemeral,
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
		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(0x5865f2)
					.setTitle('🧩 Components V2 — Dashboard Required')
					.setDescription(
						`**"${record.name}"** uses Components V2 mode. The full visual editor is available on the dashboard.\n\nYou can also update this embed via the API:\n\`PATCH /api/embed-builder/${record.id}\``,
					),
			],
			flags: MessageFlags.Ephemeral,
		});
	}

	async modal(interaction) {
		const container = this.container;
		const { models } = container;
		const { EmbedBuilder: EmbedModel } = models;

		// customId format: eb-edit|{id}
		const embedId = parseInt(interaction.customId.split('|')[1], 10);

		const record = await EmbedModel.getCache({
			where: { id: embedId, guildId: interaction.guild.id },
		});

		if (!record) {
			return interaction.reply({
				embeds: [
					new EmbedBuilder()
						.setColor(0xef4444)
						.setDescription('❌ Embed not found. It may have been deleted.'),
				],
				flags: MessageFlags.Ephemeral,
			});
		}

		const title = interaction.fields.getTextInputValue('title');
		const description = interaction.fields.getTextInputValue('description');
		const colorRaw = interaction.fields.getTextInputValue('color');
		const imageUrl = interaction.fields.getTextInputValue('image_url');
		const footerText = interaction.fields.getTextInputValue('footer');

		// Parse hex color
		let color = record.data?.color ?? 0x5865f2;
		if (colorRaw) {
			const parsed = parseInt(colorRaw.replace('#', ''), 16);
			if (!Number.isNaN(parsed)) color = parsed;
		}

		const newData = {
			...record.data,
			title: title || undefined,
			description: description || undefined,
			color,
			image: imageUrl ? { url: imageUrl } : undefined,
			footer: footerText ? { text: footerText } : undefined,
		};

		await record.update({ data: newData });

		// If the embed was already sent to Discord, edit the message in-place
		let messageUrl = null;
		if (record.messageId && record.channelId) {
			try {
				const channel = await interaction.client.channels
					.fetch(record.channelId)
					.catch(() => null);

				if (channel) {
					const msg = await channel.messages
						.fetch(record.messageId)
						.catch(() => null);

					if (msg) {
						const updatedEmbed = new EmbedBuilder();
						if (newData.title) updatedEmbed.setTitle(newData.title);
						if (newData.description)
							updatedEmbed.setDescription(newData.description);
						if (newData.color) updatedEmbed.setColor(newData.color);
						if (newData.image?.url) updatedEmbed.setImage(newData.image.url);
						if (newData.footer?.text)
							updatedEmbed.setFooter({ text: newData.footer.text });

						await msg.edit({ embeds: [updatedEmbed] });
						messageUrl = `https://discord.com/channels/${interaction.guild.id}/${record.channelId}/${record.messageId}`;
					}
				}
			} catch {
				// Best-effort — don't fail the whole response if Discord edit fails
			}
		}

		return interaction.reply({
			embeds: [
				new EmbedBuilder()
					.setColor(0x22c55e)
					.setTitle('✅ Embed Updated!')
					.setDescription(
						messageUrl
							? `**"${record.name}"** has been saved and the Discord message was updated!\n[Jump to message](${messageUrl})`
							: `**"${record.name}"** has been saved.\nUse \`/embed-builder send\` to post it to a channel.`,
					),
			],
			flags: MessageFlags.Ephemeral,
		});
	}
}

exports.default = EditCommand;
