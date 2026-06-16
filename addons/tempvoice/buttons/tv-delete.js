/**
 * @namespace: addons/tempvoice/buttons/tv-delete.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	MessageFlags,
} = require('discord.js');
const { BaseButton } = require('kythia-core');
class TvDeleteButton extends BaseButton {
	button = {
		customId: 'tv_delete',
	};
	async execute(interaction) {
		const container = this.container;
		const { models, client, t, helpers, logger } = container;
		const { TempVoiceChannel } = models;
		const { simpleContainer } = helpers.discord;
		const ownerId = interaction.user.id;
		const activeChannel = await TempVoiceChannel.getCache({
			ownerId: ownerId,
			guildId: interaction.guild.id,
		});
		if (!activeChannel) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.tv_delete.no_active'),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}
		const channelId = activeChannel.channelId;
		let channel;
		try {
			channel = await client.container.helpers.discord.getChannelGlobalSafe(
				client,
				channelId,
			);
		} catch (error) {
			logger.error(
				`CRITICAL: Failed to fetch channel ${channelId} for rename. Error: ${error.message || error}`,
				{
					label: 'tempvoice',
				},
			);
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.common.channel_not_found'),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}
		const rowBtns = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('tv_delete_confirm')
				.setLabel(await t(interaction, 'tempvoice.tv_delete.delete_btn'))
				.setStyle(ButtonStyle.Danger)
				.setEmoji('🗑️'),
			new ButtonBuilder()
				.setCustomId('tv_delete_cancel')
				.setLabel(await t(interaction, 'tempvoice.tv_delete.cancel_btn'))
				.setStyle(ButtonStyle.Secondary),
		);
		const confirmText = await t(interaction, 'tempvoice.tv_delete.confirm');
		const confirmComponents = await simpleContainer(interaction, confirmText);
		if (
			Array.isArray(confirmComponents) &&
			confirmComponents[0]?.addActionRowComponents
		) {
			confirmComponents[0].addActionRowComponents(rowBtns);
		}
		await interaction.reply({
			components: confirmComponents,
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
		});
		const msg = await interaction.fetchReply();
		const filter = (i) =>
			i.user.id === interaction.user.id &&
			(i.customId === 'tv_delete_confirm' || i.customId === 'tv_delete_cancel');
		const collector = msg.createMessageComponentCollector({
			filter,
			componentType: ComponentType.Button,
			time: 15_000,
			max: 1,
		});
		collector.on('collect', async (btnInteraction) => {
			let message, color;
			if (btnInteraction.customId === 'tv_delete_confirm') {
				await channel.delete(
					await t(btnInteraction, 'tempvoice.tv_delete.deleted_reason'),
				);
				message = await t(btnInteraction, 'tempvoice.tv_delete.deleted');
				color = 'Green';
			} else {
				message = await t(btnInteraction, 'tempvoice.tv_delete.cancelled');
				color = 'Red';
			}
			await btnInteraction.update({
				components: await simpleContainer(btnInteraction, message, {
					color,
				}),
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		});
		collector.on('end', async (_collected, reason) => {
			if (reason === 'time' && msg.editable) {
				const expiredMsg = await t(interaction, 'tempvoice.tv_delete.expired');
				await msg
					.edit({
						components: await simpleContainer(interaction, expiredMsg, {
							color: 'Grey',
						}),
						flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
						embeds: [],
					})
					.catch(() => {});
			}
		});
	}
}
exports.default = TvDeleteButton;
