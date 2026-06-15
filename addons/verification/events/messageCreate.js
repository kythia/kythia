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

const { BaseEvent } = require('kythia-core');

class MessageCreateEvent extends BaseEvent {
	async execute(message) {
		const container = this.container;

		if (!message.author || message.author.bot) return;

		const { models, logger, helpers } = container;
		const { VerificationConfig, ServerSetting } = models;
		const { getMemberSafe, getGuildSafe } = helpers.discord;

		try {
			let session = null;
			let guildId = null;

			if (message.guild) {
				guildId = message.guild.id;
				session = getSession(guildId, message.author.id);
			} else {
				// DM fallback
				session = getSessionByChannel(message.channelId, message.author.id);
				if (session) guildId = session.guildId;
			}

			if (!session?.answer || !guildId) return;

			// Only respond in the session's channel
			if (message.channelId !== session.channelId) return;

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
				const guild = await getGuildSafe(this.client, guildId);
				if (!guild) return;
				const member = await getMemberSafe(guild, message.author.id);
				if (!member) return;
				await handleSuccess(member, config);
				const { simpleContainer } = helpers.discord;
				const comps = await simpleContainer(
					message.channel,
					`✅ <@${message.author.id}> You're verified! Welcome to **${guild.name}**.`,
					{ color: 'Green' },
				);
				await message.channel
					?.send({
						content: `<@${message.author.id}>`,
						components: comps,
						allowedMentions: { users: [message.author.id] },
						flags: MessageFlags.IsComponentsV2,
					})
					?.then((m) => setTimeout(() => m.delete().catch(() => null), 8000));
			} else {
				await message.delete().catch(() => null);
				const attempts = incrementAttempts(guildId, message.author.id);
				const guild = await getGuildSafe(this.client, guildId);
				if (!guild) return;
				const member = await getMemberSafe(guild, message.author.id);
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
	}
}

module.exports = MessageCreateEvent;
