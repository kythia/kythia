/**
 * @namespace: addons/tempvoice/select_menus/tv_region_menu.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseSelectMenu } = require('kythia-core');

class TvRegionMenuSelectMenu extends BaseSelectMenu {
	selectMenu = { customId: 'tv_region_menu' };

	async execute(interaction) {
		const container = this.container;

		const { models, client, t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		const { TempVoiceChannel } = models;
		const channelId = interaction.customId.split(':')[1];
		const newRegion =
			interaction.values[0] === 'auto' ? null : interaction.values[0]; // 'auto' = null

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

		try {
			await channel.setRTCRegion(newRegion);

			await interaction.update({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.region.success', {
						region: newRegion || 'Automatic',
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

module.exports = TvRegionMenuSelectMenu;
