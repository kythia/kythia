/**
 * @namespace: addons/tempvoice/buttons/tv_waiting_allow.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const { BaseButton } = require('kythia-core');
class TvWaitingAllowButton extends BaseButton {
	button = {
		customId: 'tv_waiting_allow',
	};
	async execute(interaction) {
		const container = this.container;
		const { models, client, t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		const { TempVoiceChannel } = models;
		const [_, mainChannelId, userIdToMove] = interaction.customId.split(':');

		// 1. Cek kepemilikan
		const activeChannel = await TempVoiceChannel.getCache({
			channelId: mainChannelId,
			ownerId: interaction.user.id,
		});
		if (!activeChannel)
			return interaction.reply({
				components:
					await interaction.client.container.helpers.discord.simpleContainer(
						interaction,
						await t(interaction, 'tempvoice.common.not_owner'),
						{
							color: 'Red',
						},
					),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});

		// 2. Fetch channel & user
		let mainChannel;
		try {
			mainChannel = await client.container.helpers.discord.getChannelGlobalSafe(
				client,
				mainChannelId,
			);
		} catch (error) {
			logger.error(
				`CRITICAL: Failed to fetch channel ${mainChannelId} for rename. Error: ${error.message || error}`,
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
		const member = await helpers.discord.getMemberSafe(
			interaction.guild,
			userIdToMove,
		);
		if (!mainChannel || !member)
			return interaction.reply({
				components:
					await interaction.client.container.helpers.discord.simpleContainer(
						interaction,
						await t(interaction, 'tempvoice.waiting.user_or_channel_gone'),
					),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});

		// 3. Pindahin user
		try {
			await member.voice.setChannel(mainChannel);
			await interaction.message.delete(); // Hapus pesan notif
		} catch (_e) {
			await interaction.reply({
				components:
					await interaction.client.container.helpers.discord.simpleContainer(
						interaction,
						await t(interaction, 'tempvoice.waiting.move_fail'),
						{
							color: 'Red',
						},
					),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	}
}
exports.default = TvWaitingAllowButton;
