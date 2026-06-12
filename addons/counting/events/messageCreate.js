/**
 * @namespace: addons/counting/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { parseInputToNumber, formatNumberByMode } = require('../helpers');

/**
 * @param {import('discord.js').Message} message
 * @param {import('kythia-core').Kythia} bot
 */
module.exports = async (bot, message) => {
	if (!message.author || message.author.bot || !message.guild) return;

	const { container } = bot;
	const { models, t, helpers } = container;
	const { Counting, CountingUser } = models;
	const { simpleContainer } = helpers.discord;

	const guildId = message.guild.id;

	const setting = await Counting.getCache({ guildId });
	if (!setting?.channelId) return;
	if (message.channel.id !== setting.channelId) return;

	const mode = setting.mode || 'decimal';
	const mathEnabled = setting.mathEnabled;
	const successReaction = setting.successReaction || '🌸';
	const failReaction = setting.failReaction || '❌';

	const inputNumber = parseInputToNumber(message.content, mode, mathEnabled);

	if (inputNumber === null) {
		const warning = await t(message, 'counting.game.invalid_input', {
			mode: mode,
		});
		const components = await simpleContainer(
			message,
			`${message.author}, ${warning}`,
			{ color: 'Red' },
		);
		await message.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
		return;
	}

	const expectedFromDB = BigInt(setting.currentCount || 0) + 1n;

	// Handle race conditions/cache lag by checking the actual last message in the channel
	if (inputNumber !== expectedFromDB) {
		try {
			const messages = await message.channel.messages.fetch({
				limit: 1,
				before: message.id,
			});
			const lastMsg = messages.first();
			if (lastMsg) {
				const lastNumberInChat = parseInputToNumber(
					lastMsg.content,
					mode,
					mathEnabled,
				);
				if (
					lastNumberInChat !== null &&
					inputNumber === lastNumberInChat + 1n
				) {
					setting.currentCount = Number(lastNumberInChat);
				}
			}
		} catch (_e) {}
	}

	const nextNumber = BigInt(setting.currentCount || 0) + 1n;

	// Check for double counting
	if (setting.lastUserId === message.author.id && inputNumber === nextNumber) {
		const warning = await t(message, 'counting.game.double_count');
		const components = await simpleContainer(message, warning, {
			color: 'Red',
		});
		await message.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
		return;
	}

	// Helper to fetch/create user stats
	const getUserStats = async (userId) => {
		const [userStat] = await CountingUser.findOrCreateWithCache({
			where: { guildId, userId },
			defaults: { correctCounts: 0, ruinedCounts: 0 },
		});
		return userStat;
	};

	// Correct Number
	if (inputNumber === nextNumber) {
		setting.currentCount = Number(nextNumber);
		setting.lastUserId = message.author.id;
		await setting.save();
		await message.react(successReaction).catch(() => {});

		// Update user stats
		const userStat = await getUserStats(message.author.id);
		userStat.correctCounts += 1;
		await userStat.save();

		// Milestone celebration
		if (nextNumber > 0n && nextNumber % 100n === 0n) {
			const milestoneDesc = await t(message, 'counting.game.milestone', {
				number: formatNumberByMode(nextNumber, mode),
				user: message.author.toString(),
			});
			const components = await simpleContainer(message, milestoneDesc, {
				color: 'Gold',
			});
			await message.channel.send({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	} else {
		// Wrong Number
		await message.react(failReaction).catch(() => {});

		const userStat = await getUserStats(message.author.id);
		userStat.ruinedCounts += 1;
		await userStat.save();

		const isStrict = setting.strictEnabled;
		let desc;
		const formattedNext = formatNumberByMode(nextNumber, mode);

		if (isStrict) {
			desc = await t(message, 'counting.game.wrong_number_reset', {
				number: formattedNext,
				user: message.author.toString(),
			});
			setting.currentCount = 0;
			setting.lastUserId = null;
		} else {
			desc = await t(message, 'counting.game.wrong_number', {
				number: formattedNext,
				user: message.author.toString(),
			});
		}

		const components = await simpleContainer(message, desc, {
			color: 'Red',
		});
		await message.reply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});

		await setting.save();
	}
};
