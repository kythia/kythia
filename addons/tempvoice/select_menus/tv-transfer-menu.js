/**
 * @namespace: addons/tempvoice/select_menus/tv-transfer-menu.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags, PermissionsBitField } = require('discord.js');
const { BaseSelectMenu } = require('kythia-core');
class TvTransferMenuSelectMenu extends BaseSelectMenu {
	selectMenu = {
		customId: 'tv_transfer_menu',
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
		const newOwnerId = interaction.values[0];
		const oldOwnerId = interaction.user.id;
		if (newOwnerId === oldOwnerId) {
			return interaction.update({
				components: await simpleContainer(
					interaction,
					await t(
						interaction,
						'tempvoice.select_menus.tv-transfer-menu.transfer.transfer_to_self',
					),
					{
						color: 'Yellow',
					},
				),
			});
		}
		const newOwnerMember = await helpers.discord.getMemberSafe(
			interaction.guild,
			newOwnerId,
		);
		if (!newOwnerMember)
			return interaction.update({
				components: await simpleContainer(
					interaction,
					await t(
						interaction,
						'tempvoice.select_menus.tv-transfer-menu.transfer.user_not_found',
					),
					{
						color: 'Red',
					},
				),
			});
		try {
			await channel.permissionOverwrites.delete(interaction.member);
			await channel.permissionOverwrites.edit(newOwnerMember, {
				[PermissionsBitField.Flags.ManageChannels]: true,
				[PermissionsBitField.Flags.MoveMembers]: true,
				[PermissionsBitField.Flags.ViewChannel]: true,
				[PermissionsBitField.Flags.Connect]: true,
			});
			activeChannel.ownerId = newOwnerId;
			await activeChannel.save();

			// This message informs the previous owner (interaction.user) the transfer was successful.
			await interaction.update({
				components: await simpleContainer(
					interaction,
					await t(
						interaction,
						'tempvoice.select_menus.tv-transfer-menu.transfer.success',
						{
							user: newOwnerMember.displayName,
						},
					),
					{
						color: 'Green',
					},
				),
			});
			try {
				const newOwnerMsgContent = await t(
					interaction,
					'tempvoice.select_menus.tv-transfer-menu.transfer.newowner',
					{
						user: `<@${newOwnerId}>`,
					},
				);
				await channel.send({
					components: await simpleContainer(interaction, newOwnerMsgContent, {
						color: 'Green',
					}),
					flags: MessageFlags.IsComponentsV2, // Pastiin pake V2
				});
			} catch (sendErr) {
				logger.error(
					`Gagal kirim notif transfer ke channel: ${sendErr.message}`,
					{
						label: 'tempvoice',
					},
				);
			}
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
module.exports = TvTransferMenuSelectMenu;
