/**
 * @namespace: addons/reminder/buttons/vote_remind.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseButton } = require('kythia-core');

class VoteRemindButton extends BaseButton {
	async execute(interaction) {
		const container = this.container;
		const { models, helpers, kythiaConfig } = container;
		const { KythiaReminder } = models;
		const { simpleContainer } = helpers.discord;
		const { t } = helpers.lang;

		// Defer the update so the button stops spinning
		await interaction.deferUpdate();

		// Create a reminder for 12 hours from now
		const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);

		await KythiaReminder.create({
			userId: interaction.user.id,
			channelId: null, // Force DM
			reason: `Time to vote for ${container.client.user.username} again! >.<`,
			timezone: kythiaConfig.bot.timezone || 'Asia/Jakarta',
			expiresAt,
		});

		// Reply with an ephemeral message confirming the reminder
		const msg = await t(interaction, 'reminder.buttons.vote_remind.success');
		const components = await simpleContainer(interaction, msg, {
			color: kythiaConfig.bot.color,
		});

		await interaction.followUp({
			components,
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = VoteRemindButton;
