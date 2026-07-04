/**
 * @namespace: addons/leveling/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { addXp } = require('../helpers');
const { ChannelType } = require('discord.js');
const cooldown = new Map();

/**
 * Award XP on a message in a guild (except bots).
 * @param {import('kythia-core').Kythia} bot - Instance of main Bot class.
 * @param {import('discord.js').Message} message - The message object.
 */

const { BaseEvent } = require('kythia-core');

class MessageCreateEvent extends BaseEvent {
	async execute(message) {
		const _container = this.container;
		const _bot = { client: this.client, container: this.container };

		const { ServerSetting, LevelingSetting } = this.container.models;
		if (!message.author || message.author.bot || !message.guild) return;
		const guildId = message.guild.id;
		const userId = message.author.id;
		const { helpers } = this.container;
		const { getChannelSafe } = helpers.discord;

		// Feature flag lives in ServerSetting
		const serverSetting = await ServerSetting.getCache({ guildId });
		if (!serverSetting?.levelingOn) return;

		// XP-specific settings are in LevelingSetting (falls back gracefully if row missing)
		const setting = await LevelingSetting.getCache({ guildId });

		// Check if message XP is enabled for this guild
		if (setting?.messageXpEnabled === false) return;

		if (message.channel) {
			if (message.channel.isThread()) {
				if (setting?.threadXpEnabled === false) return;
				if (
					setting?.forumXpEnabled === false &&
					message.channel.parent?.type === ChannelType.GuildForum
				)
					return;
			}
			if (
				message.channel.isVoiceBased() &&
				setting?.textInVoiceXpEnabled === false
			)
				return;
		}

		// Respect noXpChannels and noXpRoles
		if (
			Array.isArray(setting?.noXpChannels) &&
			setting.noXpChannels.includes(message.channelId)
		)
			return;
		if (Array.isArray(setting?.noXpRoles)) {
			const member =
				message.member ||
				(await helpers.discord.getMemberSafe(message.guild, userId));
			if (
				member &&
				setting.noXpRoles.some((roleId) => member.roles.cache.has(roleId))
			)
				return;
		}

		// Determine XP to award (random between min and max)
		const xpMin =
			typeof setting?.messageXpMin === 'number' ? setting.messageXpMin : 15;
		const xpMax =
			typeof setting?.messageXpMax === 'number' ? setting.messageXpMax : 25;
		const xpToAdd =
			xpMin === xpMax
				? xpMin
				: Math.floor(Math.random() * (xpMax - xpMin + 1)) + xpMin;

		// Cooldown in seconds (DB stores seconds), convert to ms
		const cooldownSeconds =
			typeof setting?.messageXpCooldown === 'number'
				? setting.messageXpCooldown
				: 60;
		const cooldownTime = cooldownSeconds * 1000;

		const key = `${guildId}-${userId}`;
		const now = Date.now();

		if (now - (cooldown.get(key) || 0) >= cooldownTime) {
			const channel =
				(await getChannelSafe(message.guild, setting?.levelingChannelId)) ||
				message.channel;
			await addXp(guildId, userId, xpToAdd, message, channel);
			cooldown.set(key, now);
		}
	}
}

module.exports = MessageCreateEvent;
