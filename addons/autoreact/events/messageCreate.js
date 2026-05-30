/**
 * @namespace: addons/autoreact/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = async (bot, message) => {
	const { models } = bot.client.container;
	const { AutoReact } = models;

	if (message.author.bot || !message.guild) return;

	const allReactions = await AutoReact.getAllCache({
		where: { guildId: message.guild.id },
	});

	if (!allReactions.length) return;

	const content = message.content.toLowerCase();
	const reactions = allReactions.filter(({ type, trigger }) => {
		if (type === 'channel') return trigger === message.channel.id;
		if (type === 'text') {
			const escaped = trigger.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			return new RegExp(`\\b${escaped}\\b`, 'i').test(content);
		}
		return false;
	});

	if (reactions.length === 0) return;

	for (const reaction of reactions) {
		try {
			await message.react(reaction.emoji);
		} catch (_e) {
			// Ignore failed reactions (e.g. invalid emoji, blocked, etc.)
		}
	}
};
