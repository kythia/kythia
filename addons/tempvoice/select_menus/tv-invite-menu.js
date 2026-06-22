/**
 * @namespace: addons/tempvoice/select_menus/tv-invite-menu.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const { BaseSelectMenu } = require('kythia-core');
class TvInviteMenuSelectMenu extends BaseSelectMenu {
	selectMenu = {
		customId: 'tv_invite_menu',
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
		const userIdsToInvite = interaction.values;
		const successNames = [];
		const failNames = [];
		let inviteUrl = '';
		try {
			const inviteReason = await t(
				interaction,
				'tempvoice.select_menus.tv-invite-menu.invite.invite_reason',
			);
			const invite = await channel.createInvite({
				maxAge: 3600,
				maxUses: userIdsToInvite.length + 1,
				reason: inviteReason,
			});
			inviteUrl = invite.url;
		} catch (err) {
			logger.error(`Gagal bikin invite: ${err.message || err}`, {
				label: 'tempvoice',
			});
			return interaction.update({
				components: await simpleContainer(
					interaction,
					await t(
						interaction,
						'tempvoice.select_menus.tv-invite-menu.invite.fail',
					),
					{
						color: 'Red',
					},
				),
			});
		}
		const dmContent = await t(
			interaction,
			'tempvoice.select_menus.tv-invite-menu.invite.dm_message',
			{
				user: interaction.user.globalName || interaction.user.username,
				guild: interaction.guild.name,
				channel: channel.name,
				inviteUrl: inviteUrl,
			},
		);
		for (const userId of userIdsToInvite) {
			const user = await client.container.helpers.discord.getUserSafe(
				client,
				userId,
			);
			if (user) {
				try {
					await user.send({
						components: await simpleContainer(interaction, dmContent),
						flags: MessageFlags.IsComponentsV2,
					});
					successNames.push(user.globalName || user.username);
				} catch (dmError) {
					logger.warn(`Gagal DM user ${user.tag}: ${dmError.message}`, {
						label: 'tempvoice',
					});
					failNames.push(user.globalName || user.username);
				}
			}
		}
		let summaryContent = '';
		if (successNames.length > 0) {
			summaryContent += `${await t(
				interaction,
				'tempvoice.select_menus.tv-invite-menu.invite.success_dm',
				{
					users: successNames.join(', '),
				},
			)}\n`;
		}
		if (failNames.length > 0) {
			summaryContent += await t(
				interaction,
				'tempvoice.select_menus.tv-invite-menu.invite.fail_dm',
				{
					users: failNames.join(', '),
				},
			);
		}
		await interaction.update({
			components: await simpleContainer(interaction, summaryContent, {
				color: 'Green',
			}),
		});
	}
}
module.exports = TvInviteMenuSelectMenu;
