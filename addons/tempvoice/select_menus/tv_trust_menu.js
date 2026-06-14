/**
 * @namespace: addons/tempvoice/select_menus/tv_trust_menu.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { PermissionsBitField, MessageFlags } = require('discord.js');

const { BaseSelectMenu } = require('kythia-core');

class TvTrustMenuSelectMenu extends BaseSelectMenu {
	selectMenu = {};

	async execute(interaction) {
		const container = this.container;

		const { models, client, t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		const channelId = interaction.customId.split(':')[1];
		const { TempVoiceChannel } = models;

		if (!channelId)
			return interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.common.no_channel_id'),
					{ color: 'Red' },
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
					await t(interaction, 'tempvoice.common.not_owner'),
					{ color: 'Red' },
				),
			});

		let channel;
		try {
			channel = await client.channels.fetch(channelId, { force: true });
		} catch (error) {
			logger.error(
				`CRITICAL: Failed to fetch channel ${channelId} for rename. Error: ${error.message || error}`,
				{ label: 'tempvoice' },
			);

			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.common.channel_not_found'),
					{ color: 'Red' },
				),
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}
		if (!channel)
			return interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.common.channel_not_found'),
					{
						color: 'Red',
					},
				),
			});

		const userIdsToTrust = interaction.values;
		const trustedNames = [];

		try {
			for (const userId of userIdsToTrust) {
				const member = await interaction.guild.members
					.fetch(userId)
					.catch(() => null);
				if (member) {
					await channel.permissionOverwrites.edit(member, {
						[PermissionsBitField.Flags.ViewChannel]: true,
						[PermissionsBitField.Flags.Connect]: true,
						[PermissionsBitField.Flags.Speak]: true,
					});
					trustedNames.push(member.displayName);
				}
			}

			await interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.trust.success', {
						users: trustedNames.join(', '),
					}),
					{ color: 'Green' },
				),
			});
		} catch (_err) {
			await interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.common.fail'),
					{ color: 'Red' },
				),
			});
		}
	}
}

module.exports = TvTrustMenuSelectMenu;
