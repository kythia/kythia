/**
 * @namespace: addons/tempvoice/select_menus/tv-unblock-menu.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { PermissionsBitField, MessageFlags } = require('discord.js');
const { BaseSelectMenu } = require('kythia-core');
class TvUnblockMenuSelectMenu extends BaseSelectMenu {
	selectMenu = {
		customId: 'tv_unblock_menu',
	};
	async execute(interaction) {
		const container = this.container;
		const { models, client, t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		const { TempVoiceChannel } = models;
		const channelId = interaction.customId.split(':')[1];
		if (!channelId)
			return interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.shared.common.no_channel_id'),
					{
						color: 'Red',
					},
				),
			});
		const activeChannel = await TempVoiceChannel.getCache({
			channelId: channelId,
			ownerId: interaction.user.id,
		});
		if (!activeChannel)
			return interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.shared.common.not_owner'),
					{
						color: 'Red',
					},
				),
			});
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
					await t(interaction, 'tempvoice.shared.common.channel_not_found'),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}
		if (!channel)
			return interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.shared.common.channel_not_found'),
					{
						color: 'Red',
					},
				),
			});
		const userIdsToUnblock = interaction.values;
		const unblockedNames = [];
		try {
			for (const userId of userIdsToUnblock) {
				const member = await helpers.discord.getMemberSafe(
					interaction.guild,
					userId,
				);
				if (member) {
					await channel.permissionOverwrites.edit(member, {
						[PermissionsBitField.Flags.ViewChannel]: null,
						[PermissionsBitField.Flags.Connect]: null,
					});
					unblockedNames.push(member.displayName);
				}
			}
			await interaction.update({
				components: await simpleContainer(
					interaction,
					await t(
						interaction,
						'tempvoice.select_menus.tv-unblock-menu.unblock.success',
						{
							users: unblockedNames.join(', '),
						},
					),
					{
						color: 'Green',
					},
				),
			});
		} catch (_err) {
			await interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.shared.common.fail'),
					{
						color: 'Red',
					},
				),
			});
		}
	}
}
module.exports = TvUnblockMenuSelectMenu;
