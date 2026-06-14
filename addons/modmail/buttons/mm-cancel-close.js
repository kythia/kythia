/**
 * @namespace: addons/modmail/buttons/mm-cancel-close.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseButton } = require('kythia-core');

class MmCancelCloseButton extends BaseButton {
	button = {};

	async execute(interaction) {
		const container = this.container;

		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;
		const desc = await t(interaction, 'modmail.close.cancelled');
		return interaction.reply({
			components: await simpleContainer(interaction, desc, {
				color: 'Blurple',
			}),
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	}
}

exports.default = MmCancelCloseButton;
