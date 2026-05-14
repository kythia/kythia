/**
 * @namespace: addons/verification/events/messageCreate.js
 * @type: Event Handler
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

module.exports = async (bot, message) => {
	if (message.author.bot || !message.guild) return;

	const container = bot.client.container;
	const { models, logger } = container;
	const { VerificationConfig, ServerSetting } = models;

	try {
		const settings = await ServerSetting.getCache({
			guildId: message.guild.id,
		});
		if (!settings?.verificationOn) return;

		const session = getSession(message.guild.id, message.author.id);
		if (!session || !session.answer) return; // no active image session

		// Only respond in the session's channel
		if (message.channel.id !== session.channelId) return;

		const config = await VerificationConfig.getCache({
			where: { guildId: message.guild.id },
		});
		if (!config) return;

		const input = message.content.trim().toUpperCase().replace(/\s+/g, '');
		const correct = session.answer.toUpperCase();

		if (input === correct) {
			await message.delete().catch(() => null);
			const member = await message.guild.members
				.fetch(message.author.id)
				.catch(() => null);
			if (!member) return;
			await handleSuccess(member, config);
			const { simpleContainer } = container.helpers.discord;
			const comps = await simpleContainer(
				message.channel,
				`✅ <@${message.author.id}> You're verified! Welcome to **${message.guild.name}**.`,
				{ color: 'Green' },
			);
			await message.channel
				.send({
					content: `<@${message.author.id}>`,
					components: comps,
					allowedMentions: { users: [message.author.id] },
					flags: MessageFlags.IsComponentsV2,
				})
				.then((m) => setTimeout(() => m.delete().catch(() => null), 8000));
		} else {
			await message.delete().catch(() => null);
			const attempts = incrementAttempts(message.guild.id, message.author.id);
			const member = await message.guild.members
				.fetch(message.author.id)
				.catch(() => null);
			if (!member) return;

			await handleFail(member, config, attempts, async (remaining) => {
				// Re-send a fresh image captcha
				const payload = await buildCaptchaPayload(member, config);
				session.answer = payload.answer;
				await message.channel
					.send({
						content: `❌ <@${message.author.id}> Wrong code! **${remaining}** attempt(s) remaining. New captcha:`,
						...payload,
						allowedMentions: { users: [message.author.id] },
					})
					.catch(() => null);
			});
		}
	} catch (err) {
		logger.error(`messageCreate error: ${err.message || err}`, {
			label: 'verification',
		});
	}
};
