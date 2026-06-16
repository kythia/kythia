const { MessageFlags } = require('discord.js');

/**
 * @namespace: addons/tempvoice/buttons/tv-waiting-deny.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { BaseButton } = require('kythia-core');
class TvWaitingDenyButton extends BaseButton {
	button = {
		customId: 'tv_waiting_deny',
	};
	async execute(interaction) {
		const container = this.container;
		const { models, t } = container;
		const [_, mainChannelId, userIdToKick] = interaction.customId.split(':');

		// 1. Cek kepemilikan
		const activeChannel = await models.TempVoiceChannel.getCache({
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

		// 2. Fetch user
		const member = await container.helpers.discord.getMemberSafe(
			interaction.guild,
			userIdToKick,
		);
		if (!member)
			return interaction.reply({
				components:
					await interaction.client.container.helpers.discord.simpleContainer(
						interaction,
						await t(interaction, 'tempvoice.waiting.user_or_channel_gone'),
					),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});

		// 3. Kick user
		try {
			await member.voice.disconnect(
				await t(interaction, 'tempvoice.waiting.deny_reason'),
			);
			await interaction.message.delete(); // Hapus pesan notif
		} catch (_e) {
			await interaction.reply({
				components:
					await interaction.client.container.helpers.discord.simpleContainer(
						interaction,
						await t(interaction, 'tempvoice.waiting.kick_fail'),
						{
							color: 'Red',
						},
					),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	}
}
exports.default = TvWaitingDenyButton;
