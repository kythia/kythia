/**
 * @namespace: addons/tempvoice/buttons/tv-privacy.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	ContainerBuilder,
	TextDisplayBuilder,
	MessageFlags,
} = require('discord.js');
const { BaseButton } = require('kythia-core');
class TvPrivacyButton extends BaseButton {
	button = {
		customId: 'tv_privacy',
	};
	async execute(interaction) {
		const container = this.container;
		const { client, models, t, helpers, logger } = container;
		const { TempVoiceChannel } = models;
		const { convertColor } = helpers.color;
		const { simpleContainer } = helpers.discord;
		const activeChannel = await TempVoiceChannel.getCache({
			ownerId: interaction.user.id,
			guildId: interaction.guild.id,
		});
		if (!activeChannel) {
			return interaction.reply({
				components:
					await interaction.client.container.helpers.discord.simpleContainer(
						interaction,
						await t(interaction, 'tempvoice.privacy.no_active_channel'),
						{
							color: 'Red',
						},
					),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
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
		if (!channel) {
			return interaction.reply({
				components:
					await interaction.client.container.helpers.discord.simpleContainer(
						interaction,
						await t(interaction, 'tempvoice.privacy.channel_not_found'),
						{
							color: 'Red',
						},
					),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const menu = new StringSelectMenuBuilder()
			.setCustomId(`tv_privacy_menu:${channelId}`)
			.setPlaceholder(
				await t(interaction, 'tempvoice.privacy.menu.placeholder'),
			)
			.addOptions([
				{
					label: await t(interaction, 'tempvoice.privacy.menu.lock.label'),
					description: await t(interaction, 'tempvoice.privacy.menu.lock.desc'),
					value: 'lock_channel',
					emoji: '🔒',
				},
				{
					label: await t(interaction, 'tempvoice.privacy.menu.unlock.label'),
					description: await t(
						interaction,
						'tempvoice.privacy.menu.unlock.desc',
					),
					value: 'unlock_channel',
					emoji: '🔓',
				},
				{
					label: await t(interaction, 'tempvoice.privacy.menu.invisible.label'),
					description: await t(
						interaction,
						'tempvoice.privacy.menu.invisible.desc',
					),
					value: 'invisible_channel',
					emoji: '❌',
				},
				{
					label: await t(interaction, 'tempvoice.privacy.menu.visible.label'),
					description: await t(
						interaction,
						'tempvoice.privacy.menu.visible.desc',
					),
					value: 'visible_channel',
					emoji: '👁️',
				},
			]);
		const row = new ActionRowBuilder().addComponents(menu);
		const containerComponent = new ContainerBuilder()
			.setAccentColor(
				typeof convertColor === 'function'
					? convertColor('#ffb86c', {
							from: 'hex',
							to: 'decimal',
						})
					: 0xffb86c,
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'tempvoice.privacy.menu.content'),
				),
			)
			.addActionRowComponents(row);
		await interaction.reply({
			components: [containerComponent],
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	}
}
exports.default = TvPrivacyButton;
