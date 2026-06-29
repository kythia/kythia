/**
 * @namespace: addons/reminder/buttons/vote-remind.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseButton } = require('kythia-core');
class VoteRemindButton extends BaseButton {
	button = {
		customId: 'vote-remind',
	};

	async execute(interaction) {
		const container = this.container;
		const { models, helpers, kythiaConfig, t, logger } = container;
		const { KythiaReminder } = models;
		const { simpleContainer } = helpers.discord;

		logger.info('[DEBUG] vote-remind button clicked by', interaction.user.tag);

		// Defer the update so the button stops spinning
		await interaction.deferUpdate();
		logger.info('[DEBUG] interaction deferred successfully');

		try {
			// Create a reminder for 12 hours from now
			const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
			await KythiaReminder.create({
				userId: interaction.user.id,
				channelId: null,
				// Force DM
				reason: `Time to vote for ${container.client.user.username} again! >.<`,
				timezone: kythiaConfig.bot.timezone || 'Asia/Jakarta',
				expiresAt,
			});
			logger.info('[DEBUG] KythiaReminder created successfully');
		} catch (error) {
			logger.error('[DEBUG] Failed to create KythiaReminder:', error);
			throw error;
		}

		// Reply with an ephemeral message confirming the reminder
		const msg = await t(
			interaction,
			'reminder.buttons.vote-remind.vote_remind.success',
		);
		logger.info('[DEBUG] translated message:', msg);

		const components = await simpleContainer(interaction, msg, {
			color: kythiaConfig.bot.color,
		});
		logger.info('[DEBUG] created simpleContainer, sending followUp...');

		await interaction.followUp({
			components,
			flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
		});
		logger.info('[DEBUG] followUp sent successfully');
	}
}
exports.default = VoteRemindButton;
