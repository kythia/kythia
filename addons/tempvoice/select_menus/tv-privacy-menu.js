/**
 * @namespace: addons/tempvoice/select_menus/tv_privacy_menu.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { PermissionsBitField, MessageFlags } = require('discord.js');
const { BaseSelectMenu } = require('kythia-core');
class TvPrivacyMenuSelectMenu extends BaseSelectMenu {
	selectMenu = {
		customId: 'tv_privacy_menu',
	};
	async execute(interaction) {
		const container = this.container;
		const { models, client, logger, t, helpers } = container;
		const { simpleContainer } = helpers.discord;
		const { TempVoiceChannel } = models;
		const selectedOp = interaction.values[0];
		const channelId = interaction.customId.split(':')[1];
		if (!channelId) {
			return interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.privacy.menu.no_channel_id'),
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
					await t(interaction, 'tempvoice.privacy.menu.not_owner'),
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
					await t(interaction, 'tempvoice.privacy.menu.channel_not_found'),
					{
						color: 'Red',
					},
				),
			});
		}
		const everyoneRole = interaction.guild.roles.everyone;
		let resultMsg;
		const currentPerms = channel.permissionsFor(everyoneRole);
		const newPerms = {
			ViewChannel: currentPerms.has(PermissionsBitField.Flags.ViewChannel),
			Connect: currentPerms.has(PermissionsBitField.Flags.Connect),
		};
		if (selectedOp === 'lock_channel') {
			newPerms.Connect = false;
			resultMsg = await t(interaction, 'tempvoice.privacy.menu.lock_success');
		} else if (selectedOp === 'unlock_channel') {
			newPerms.Connect = true;
			resultMsg = await t(interaction, 'tempvoice.privacy.menu.unlock_success');
		} else if (selectedOp === 'invisible_channel') {
			newPerms.ViewChannel = false;
			newPerms.Connect = false;
			resultMsg = await t(
				interaction,
				'tempvoice.privacy.menu.invisible_success',
			);
		} else if (selectedOp === 'visible_channel') {
			newPerms.ViewChannel = true;
			newPerms.Connect = true;
			resultMsg = await t(
				interaction,
				'tempvoice.privacy.menu.visible_success',
			);
		}
		try {
			await channel.permissionOverwrites.edit(everyoneRole, {
				[PermissionsBitField.Flags.ViewChannel]: newPerms.ViewChannel,
				[PermissionsBitField.Flags.Connect]: newPerms.Connect,
			});
			await interaction.update({
				components: await simpleContainer(interaction, resultMsg, {
					color: 'Green',
				}),
			});
		} catch (err) {
			logger.error(`Gagal ubah privasi: ${err.message || err}`, {
				label: 'tempvoice',
			});
			await interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.privacy.menu.fail'),
					{
						color: 'Red',
					},
				),
			});
		}
	}
}
module.exports = TvPrivacyMenuSelectMenu;
