/**
 * @namespace: addons/verification/buttons/verify-math.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { getSession, incrementAttempts } = require('../helpers/session');
const {
	handleSuccess,
	handleFail,
	buildCaptchaPayload,
} = require('../helpers/verify');
const { MessageFlags } = require('discord.js');

module.exports = {
	customId: 'verify-math',

	async execute(interaction, bot) {
		const { models, logger } = bot.client.container;
		const { VerificationConfig } = models;

		try {
			const parts = interaction.customId.split(':');
			const guildId = parts[1];
			const targetUserId = parts[2];
			const result = parts[3]; // 'correct' or 'wrong_VALUE'

			// Only the right user can click
			if (interaction.user.id !== targetUserId) {
				return interaction.reply({
					content: '❌ This captcha is not for you!',
					flags: MessageFlags.Ephemeral,
				});
			}

			if (!getSession(guildId, interaction.user.id)) {
				return interaction.reply({
					content:
						'⏰ This captcha has expired. Please wait for a new one to be sent.',
					flags: MessageFlags.Ephemeral,
				});
			}

			await interaction.deferUpdate();

			const config = await VerificationConfig.getCache({
				where: { guildId: guildId },
			});
			if (!config) return;

			const guild =
				bot.client.guilds.cache.get(guildId) ||
				(await bot.client.guilds.fetch(guildId).catch(() => null));
			if (!guild) return;

			const member = await guild.members
				.fetch(interaction.user.id)
				.catch(() => null);
			if (!member) return;

			if (result === 'correct') {
				await handleSuccess(member, config);
				const { simpleContainer } = bot.client.container.helpers.discord;
				const comps = await simpleContainer(
					interaction,
					`✅ <@${interaction.user.id}> Correct! You're now verified. Welcome to **${guild.name}**! 🎉`,
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
				const attempts = incrementAttempts(guildId, interaction.user.id);
				await handleFail(member, config, attempts, async (remaining) => {
					const payload = buildCaptchaPayload(member, config);
					await interaction
						.editReply({
							content: `❌ Wrong answer! **${remaining}** attempt(s) remaining. New challenge:`,
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
			logger.error(`verify-math button error: ${err.message || err}`, {
				label: 'verification',
			});
		}
	},
};
