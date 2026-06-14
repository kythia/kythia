/**
 * @namespace: addons/tempvoice/modals/tv_limit_modal.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseModal } = require('kythia-core');

class TvLimitModalModal extends BaseModal {
	modal = {};

	async execute(interaction) {
		const container = this.container;

		const { models, t, client, logger, helpers } = container;
		const { TempVoiceChannel } = models;
		const { simpleContainer } = helpers.discord;
		const newLimitStr = interaction.fields.getTextInputValue('user_limit');
		const newLimit = parseInt(newLimitStr, 10);
		const channelId = interaction.customId.split(':')[1];

		if (Number.isNaN(newLimit) || newLimit < 0 || newLimit > 99) {
			return interaction.reply({
				content: await t(interaction, 'tempvoice.limit.modal.invalid_input'),
				flags: MessageFlags.Ephemeral,
			});
		}
		if (!channelId) {
			return interaction.reply({
				content: await t(
					interaction,
					'tempvoice.limit.modal.channel_id_not_found',
				),
				flags: MessageFlags.Ephemeral,
			});
		}

		const activeChannel = await TempVoiceChannel.getCache({
			channelId: channelId,
			ownerId: interaction.user.id,
		});
		if (!activeChannel) {
			return interaction.reply({
				content: await t(interaction, 'tempvoice.limit.modal.not_owner'),
				flags: MessageFlags.Ephemeral,
			});
		}

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
		if (!channel) {
			return interaction.reply({
				content: await t(
					interaction,
					'tempvoice.limit.modal.channel_not_found',
				),
				flags: MessageFlags.Ephemeral,
			});
		}

		await channel.setUserLimit(newLimit);
		await interaction.reply({
			content: await t(interaction, 'tempvoice.limit.modal.success', {
				limit:
					newLimit === 0
						? await t(interaction, 'tempvoice.limit.modal.unlimited')
						: newLimit,
			}),
			flags: MessageFlags.Ephemeral,
		});
	}
}

module.exports = TvLimitModalModal;
