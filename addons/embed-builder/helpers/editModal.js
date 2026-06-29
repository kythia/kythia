const { EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = async function editModal(interaction, container) {
	const { models } = container;
	const { EmbedBuilder: EmbedModel } = models;

	// customId format: eb-edit|{id}
	const embedId = parseInt(interaction.customId.split('|')[1], 10);
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
		image: imageUrl
			? {
					url: imageUrl,
				}
			: undefined,
		footer: footerText
			? {
					text: footerText,
				}
			: undefined,
	};
	await record.update({
		data: newData,
	});

	// If the embed was already sent to Discord, edit the message in-place
	let messageUrl = null;
	if (record.messageId && record.channelId) {
		try {
			const channel = await container.helpers.discord.getChannelSafe(
				interaction.client,
				record.channelId,
			);
			if (channel) {
				const msg = await container.helpers.discord.getMessageSafe(
					channel,
					record.messageId,
				);
				if (msg) {
					const updatedEmbed = new EmbedBuilder();
					if (newData.title) updatedEmbed.setTitle(newData.title);
					if (newData.description)
						updatedEmbed.setDescription(newData.description);
					if (newData.color) updatedEmbed.setColor(newData.color);
					if (newData.image?.url) updatedEmbed.setImage(newData.image.url);
					if (newData.footer?.text)
						updatedEmbed.setFooter({
							text: newData.footer.text,
						});
					await msg.edit({
						embeds: [updatedEmbed],
					});
					messageUrl = `https://discord.com/channels/${interaction.guild.id}/${record.channelId}/${record.messageId}`;
				}
			}
		} catch {
			// Best-effort — don't fail the whole response if Discord edit fails
		}
	}
	const { createContainer } = container.helpers.discord;
	const { t } = container;
	return interaction.reply({
		components: await createContainer(interaction, {
			title: await t(interaction, 'embed-builder.commands.edit.ui.updated'),
			description: messageUrl
				? await t(
						interaction,
						'embed-builder.commands.edit.ui.updated_desc_msg',
						{
							url: messageUrl,
						},
					)
				: await t(
						interaction,
						'embed-builder.commands.edit.ui.updated_desc_nomsg',
					),
			color: 'Green',
		}),
		flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
	});
};
