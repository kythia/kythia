/**
 * @namespace: addons/nsfw/buttons/nsfw-delete.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseButton } = require('kythia-core');

class NsfwDeleteButton extends BaseButton {
	button = { customId: 'nsfw_delete' };

	async execute(interaction) {
		const container = this.container;

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
	}
}

exports.default = NsfwDeleteButton;
