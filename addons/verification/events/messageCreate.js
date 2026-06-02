/**
 * @namespace: addons/verification/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const {
	getSession,
	getSessionByChannel,
	incrementAttempts,
} = require('../helpers/session');
const {
	handleSuccess,
	handleFail,
	buildCaptchaPayload,
} = require('../helpers/verify');

module.exports = async (bot, message) => {
	if (!message.author || message.author.bot) return;

	const container = bot.client.container;
	const { models, logger } = container;
	const { VerificationConfig, ServerSetting } = models;

	try {
		let session = null;
		let guildId = null;

		if (message.guild) {
			guildId = message.guild.id;
			session = getSession(guildId, message.author.id);
		} else {
			// DM fallback
			session = getSessionByChannel(message.channel.id, message.author.id);
			if (session) guildId = session.guildId;
		}

		if (!session?.answer || !guildId) return;

		// Only respond in the session's channel
		if (message.channel.id !== session.channelId) return;

		const settings = await ServerSetting.getCache({
			guildId: guildId,
		});
		if (!settings?.verificationOn) return;

		const config = await VerificationConfig.getCache({
			where: { guildId: guildId },
		});
		if (!config) return;

		const input = message.content.trim().toUpperCase().replace(/\s+/g, '');
		const correct = session.answer.toUpperCase();

		if (input === correct) {
			await message.delete().catch(() => null);
			const guild =
				bot.client.guilds.cache.get(guildId) ||
				(await bot.client.guilds.fetch(guildId).catch(() => null));
			if (!guild) return;
			const member = await guild.members
				.fetch(message.author.id)
				.catch(() => null);
			if (!member) return;
			await handleSuccess(member, config);
			const { simpleContainer } = container.helpers.discord;
			const comps = await simpleContainer(
				message.channel,
				`✅ <@${message.author.id}> You're verified! Welcome to **${guild.name}**.`,
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
			const attempts = incrementAttempts(guildId, message.author.id);
			const guild =
				bot.client.guilds.cache.get(guildId) ||
				(await bot.client.guilds.fetch(guildId).catch(() => null));
			if (!guild) return;
			const member = await guild.members
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
