/**
 * @namespace: addons/tempvoice/modals/tv_rename_modal.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	execute: async (interaction, container) => {
		const { models, t, client, logger, helpers } = container;
		const { TempVoiceChannel } = models;
		const { simpleContainer } = helpers.discord;
		const newName = interaction.fields.getTextInputValue('channel_name');

		const channelId = interaction.customId.split(':')[1];
		if (!channelId) {
			return interaction.reply({
				content: await t(interaction, 'tempvoice.rename.modal.error.no_id'),
				flags: MessageFlags.Ephemeral,
			});
		}

		const activeChannel = await TempVoiceChannel.getCache({
			channelId: channelId,
			ownerId: interaction.user.id,
		});
		if (!activeChannel) {
			return interaction.reply({
				content: await t(interaction, 'tempvoice.rename.modal.error.not_owner'),
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
				content: await t(interaction, 'tempvoice.rename.modal.error.not_found'),
				flags: MessageFlags.Ephemeral,
			});
		}

		await channel.setName(newName);

		await interaction.reply({
			content: await t(interaction, 'tempvoice.rename.modal.success', {
				newName,
			}),
			flags: MessageFlags.Ephemeral,
		});
	},
};
