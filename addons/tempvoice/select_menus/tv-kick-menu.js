/**
 * @namespace: addons/tempvoice/select_menus/tv-kick-menu.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseSelectMenu } = require('kythia-core');
class TvKickMenuSelectMenu extends BaseSelectMenu {
	selectMenu = {
		customId: 'tv_kick_menu',
	};
	async execute(interaction) {
		const container = this.container;
		const { models, client, t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		const { TempVoiceChannel } = models;
		const userIdToKick = interaction.values[0];
		const channelId = interaction.customId.split(':')[1];
		if (!channelId) {
			return interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.common.no_channel_id'),
					{
						color: 'Red',
					},
				),
			});
		}
		const activeChannel = await TempVoiceChannel.getCache({
			channelId: channelId,
			ownerId: interaction.user.id,
		});
		if (!activeChannel) {
			return interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.common.not_owner'),
					{
						color: 'Red',
					},
				),
			});
		}
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
			return interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.common.channel_not_found'),
					{
						color: 'Red',
					},
				),
			});
		}
		const memberToKick = await helpers.discord.getMemberSafe(
			interaction.guild,
			userIdToKick,
		);
		if (!memberToKick) {
			return interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.kick.menu.user_not_found'),
					{
						color: 'Red',
					},
				),
			});
		}
		if (memberToKick.voice.channelId !== channelId) {
			return interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.kick.menu.not_in_channel', {
						user: memberToKick.displayName,
					}),
					{
						color: 'Red',
					},
				),
			});
		}
		try {
			await memberToKick.voice.disconnect(
				await t(interaction, 'tempvoice.kick.menu.kick_reason'),
			);
			await interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.kick.menu.success', {
						user: memberToKick.displayName,
					}),
					{
						color: 'Green',
					},
				),
			});
		} catch (_err) {
			await interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.common.fail'),
					{
						color: 'Red',
					},
				),
			});
		}
	}
}
module.exports = TvKickMenuSelectMenu;
