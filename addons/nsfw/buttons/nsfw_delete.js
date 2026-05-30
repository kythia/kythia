/**
 * @namespace: addons/nsfw/buttons/nsfw_delete.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	execute: async (interaction, container) => {
		const { t } = container;

		// Verify ownership via interaction.message.interaction.user.id
		// If the command was sent by the bot as an interaction response, that info should be present
		const ownerId = interaction.message.interaction?.user?.id;

		if (ownerId && ownerId !== interaction.user.id) {
			return interaction.reply({
				content: await t(interaction, 'common.pagination.not.your.interaction'),
				flags: MessageFlags.Ephemeral,
			});
		}

		// Delete the message
		await interaction.message.delete().catch(() => {});
	},
};
