/**
 * @namespace: addons/streak/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const NOTIFY_STATUSES = new Set(['CONTINUE', 'NEW', 'FREEZE_USED']);
const DELETE_AFTER_MS = 5 * 1000; // 5 seconds

const { BaseEvent } = require('kythia-core');
class MessageCreateEvent extends BaseEvent {
	async execute(message) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const { models, t, helpers } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { claimStreak } = require('../helpers');
		if (
			!message ||
			message.author?.bot ||
			!message.guild ||
			!message.member ||
			message.system
		)
			return;
		const guildId = message.guild.id;
		const settings = await ServerSetting.getCache({
			guildId: guildId,
		});
		if (!settings?.streakOn) return;
		const result = await claimStreak(container, message.member, settings);
		if (!result || !NOTIFY_STATUSES.has(result.status)) return;
		const { status, streak } = result;
		const streakEmoji = settings.streakEmoji || '🔥';
		let notifText;
		if (status === 'FREEZE_USED') {
			notifText = await t(
				message,
				'streak.helpers.index.streak.claim.freeze.used',
				{
					streakFreezes: streak.streakFreezes,
				},
			);
		} else if (status === 'CONTINUE') {
			notifText = await t(
				message,
				'streak.events.messageCreate.streak.auto.claimed',
				{
					streak: streak.currentStreak,
					emoji: streakEmoji,
				},
			);
		} else {
			// NEW
			notifText = await t(
				message,
				'streak.events.messageCreate.streak.auto.new',
				{
					emoji: streakEmoji,
				},
			);
		}
		try {
			const components = await simpleContainer(message, notifText);
			const reply = await message
				.reply({
					components,
					flags: MessageFlags.IsComponentsV2,
				})
				.catch(() => null);
			if (reply)
				setTimeout(() => reply.delete().catch(() => {}), DELETE_AFTER_MS);
		} catch (_e) {}
	}
}
module.exports = MessageCreateEvent;
