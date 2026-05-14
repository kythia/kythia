/**
 * @namespace: addons/verification/buttons/verify-emoji.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { MessageFlags } = require('discord.js');
const { getSession, incrementAttempts } = require('../helpers/session');
const {
	handleSuccess,
	handleFail,
	buildCaptchaPayload,
} = require('../helpers/verify');

module.exports = {
	customId: 'verify-emoji',

	async execute(interaction, bot) {
		const { models, logger } = bot.client.container;
		const { VerificationConfig } = models;

		try {
			const parts = interaction.customId.split(':');
			const targetUserId = parts[1];
			const result = parts[2]; // 'correct' or 'wrong'

			if (interaction.user.id !== targetUserId) {
				return interaction.reply({
					content: '❌ This captcha is not for you!',
					flags: MessageFlags.Ephemeral,
				});
			}

			if (!getSession(interaction.guild.id, interaction.user.id)) {
				return interaction.reply({
					content: '⏰ This captcha has expired.',
					flags: MessageFlags.Ephemeral,
				});
			}

			await interaction.deferUpdate();

			const config = await VerificationConfig.getCache({
				where: { guildId: interaction.guild.id },
			});
			if (!config) return;

			const member = await interaction.guild.members
				.fetch(interaction.user.id)
				.catch(() => null);
			if (!member) return;

			if (result === 'correct') {
				await handleSuccess(member, config);
				const { simpleContainer } = bot.client.container.helpers.discord;
				const comps = await simpleContainer(
					interaction,
					`✅ <@${interaction.user.id}> Correct! You're now verified. Welcome to **${interaction.guild.name}**! 🎉`,
					{ color: 'Green' },
				);
				await interaction
					.editReply({
						content: null,
						components: comps,
						files: [],
						flags: MessageFlags.IsComponentsV2,
					})
					.catch(() => null);
			} else {
				const attempts = incrementAttempts(
					interaction.guild.id,
					interaction.user.id,
				);
				await handleFail(member, config, attempts, async (remaining) => {
					const payload = buildCaptchaPayload(member, config);
					await interaction
						.editReply({
							content: `❌ Wrong emoji! **${remaining}** attempt(s) remaining. New challenge:`,
							...payload,
						})
						.catch(() => null);
				});

				if (config.maxAttempts - attempts <= 0) {
					await interaction
						.editReply({
							content: config.kickOnFail
								? `❌ Too many wrong answers. You have been kicked.`
								: `❌ Too many wrong answers. Please contact a moderator.`,
							components: [],
						})
						.catch(() => null);
				}
			}
		} catch (err) {
			logger.error(`verify-emoji button error: ${err.message || err}`, {
				label: 'verification',
			});
		}
	},
};
