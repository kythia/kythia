/**
 * @namespace: addons/leveling/events/messageReactionAdd.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { addXp } = require('../helpers');

const reactorCooldown = new Map();
const authorCooldown = new Map();

/**
 * Handle awarding XP when a reaction is added.
 * @param {import('kythia-core').Kythia} bot
 * @param {import('discord.js').MessageReaction} reaction
 * @param {import('discord.js').User} user
 */

const { BaseEvent } = require('kythia-core');

class MessageReactionAddEvent extends BaseEvent {
	async execute(reaction, user) {
		const _container = this.container;
		const _bot = { client: this.client, container: this.container };

		if (!user || user.bot || !reaction.message.guild) return;

		if (reaction.partial) await reaction.fetch().catch(() => {});
		if (reaction.message.partial)
			await reaction.message.fetch().catch(() => {});

		const message = reaction.message;
		if (
			!message.guild ||
			!message.author ||
			message.author.bot ||
			message.author.id === user.id
		)
			return;

		const guildId = message.guild.id;
		const reactorId = user.id;
		const authorId = message.author.id;

		const { ServerSetting, LevelingSetting } = this.container.models;
		const serverSetting = await ServerSetting.getCache({ guildId });
		if (!serverSetting?.levelingOn) return;

		const setting = await LevelingSetting.getCache({ guildId });
		if (!setting?.reactionXpEnabled) return;

		if (
			Array.isArray(setting?.noXpChannels) &&
			setting.noXpChannels.includes(message.channel.id)
		)
			return;

		const awardType = setting?.reactionXpAward || 'both';
		if (awardType === 'none') return;

		const min =
			typeof setting?.reactionXpMin === 'number' ? setting.reactionXpMin : 1;
		const max =
			typeof setting?.reactionXpMax === 'number' ? setting.reactionXpMax : 5;
		const xpToAdd =
			min === max ? min : Math.floor(Math.random() * (max - min + 1)) + min;

		const cdSeconds =
			typeof setting?.reactionXpCooldown === 'number'
				? setting.reactionXpCooldown
				: 10;
		const cdTime = cdSeconds * 1000;
		const now = Date.now();

		const { getChannelSafe } = this.container.helpers.discord;
		const announceChannel =
			(await getChannelSafe(message.guild, setting?.levelingChannelId)) ||
			message.channel;

		// Award Reactor
		if ((awardType === 'both' || awardType === 'reactor') && !user.bot) {
			const rKey = `${guildId}-${reactorId}`;
			if (now - (reactorCooldown.get(rKey) || 0) >= cdTime) {
				const fakeMessage = {
					client: message.client,
					guild: message.guild,
					author: user,
					channel: message.channel,
				};
				await addXp(guildId, reactorId, xpToAdd, fakeMessage, announceChannel);
				reactorCooldown.set(rKey, now);
			}
		}

		// Award Author
		if (
			(awardType === 'both' || awardType === 'author') &&
			message.author &&
			!message.author.bot
		) {
			const aKey = `${guildId}-${authorId}`;
			if (now - (authorCooldown.get(aKey) || 0) >= cdTime) {
				await addXp(guildId, authorId, xpToAdd, message, announceChannel);
				authorCooldown.set(aKey, now);
			}
		}
	}
}

module.exports = MessageReactionAddEvent;
