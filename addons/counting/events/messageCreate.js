/**
 * @namespace: addons/counting/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const { parseInputToNumber, formatNumberByMode } = require('../helpers');
const channelQueues = new Map();
class CountingQueue {
	constructor() {
		this.queue = [];
		this.isProcessing = false;
	}
	enqueue(task) {
		return new Promise((resolve, reject) => {
			this.queue.push(async () => {
				try {
					await task();
					resolve();
				} catch (e) {
					reject(e);
				}
			});
			this.processNext();
		});
	}
	async processNext() {
		if (this.isProcessing || this.queue.length === 0) return;
		this.isProcessing = true;
		const task = this.queue.shift();
		try {
			await task();
		} catch (_e) {}
		this.isProcessing = false;
		this.processNext();
	}
}

/**
 * @param {import('discord.js').Message} message
 * @param {import('kythia-core').Kythia} bot
 */

const { BaseEvent } = require('kythia-core');
class MessageCreateEvent extends BaseEvent {
	async execute(message) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		if (!message.author || message.author.bot || !message.guild) return;
		if (!message.channel || !message.channelId) return;
		const { models, t, helpers } = container;
		const { Counting, CountingUser } = models;
		const { simpleContainer } = helpers.discord;
		const guildId = message.guild.id;

		// Initial check to prevent queueing messages in non-counting channels
		const quickSetting = await Counting.getCache({
			guildId,
		});
		if (!quickSetting?.channelId) return;
		if (message.channelId !== quickSetting.channelId) return;
		const lines = message.content
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean);
		if (lines.length === 0) return;
		const mode = quickSetting.mode || 'decimal';
		const mathEnabled = quickSetting.mathEnabled;
		const successReaction = quickSetting.successReaction || '🌸';
		const failReaction = quickSetting.failReaction || '❌';

		// Can't be parsed at all = plain chat message, delete it silently
		const firstInput = parseInputToNumber(lines[0], mode, mathEnabled);
		if (firstInput === null) {
			await message.delete().catch(() => {});
			return;
		}

		// Initialize the channel's async queue if it doesn't exist
		if (!channelQueues.has(message.channel.id)) {
			channelQueues.set(message.channel.id, new CountingQueue());
		}
		const queue = channelQueues.get(message.channel.id);
		return queue.enqueue(async () => {
			// Inside the queue: Fetch fresh setting to guarantee exact DB state sequentially
			const setting = await Counting.getCache({
				guildId,
			});
			if (!setting?.channelId || message.channel.id !== setting.channelId)
				return;
			let expectedFromDB = BigInt(setting.currentCount || 0) + 1n;

			// Handle race conditions/cache lag by checking the actual last message in the channel
			// (This is mostly redundant with the queue, but good for cross-shard/external DB syncing)
			if (firstInput !== expectedFromDB) {
				try {
					const messages = await helpers.discord.fetchMessagesQuerySafe(
						message.channel,
						{
							limit: 1,
							before: message.id,
						},
					);
					const lastMsg = messages.first();
					if (lastMsg) {
						const lastLines = lastMsg.content
							.split('\n')
							.map((l) => l.trim())
							.filter(Boolean);
						if (lastLines.length > 0) {
							const lastNumberInChat = parseInputToNumber(
								lastLines[lastLines.length - 1],
								mode,
								mathEnabled,
							);
							if (
								lastNumberInChat !== null &&
								firstInput === lastNumberInChat + 1n
							) {
								setting.currentCount = Number(lastNumberInChat);
								expectedFromDB = lastNumberInChat + 1n;
							}
						}
					}
				} catch (_e) {}
			}
			let simulatedNext = expectedFromDB;
			let simulatedLastUser = setting.lastUserId;
			let successCount = 0;
			let failedAtLine = -1;
			let failReason = null; // 'invalid', 'double_count', 'wrong_number'

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];
				const parsed = parseInputToNumber(line, mode, mathEnabled);
				if (parsed === null) {
					failedAtLine = i;
					failReason = 'invalid';
					break;
				}
				if (
					i === 0 &&
					simulatedLastUser === message.author.id &&
					parsed === simulatedNext
				) {
					failedAtLine = i;
					failReason = 'double_count';
					break;
				}
				if (parsed === simulatedNext) {
					successCount++;
					simulatedNext++;
					simulatedLastUser = message.author.id;
				} else {
					failedAtLine = i;
					failReason = 'wrong_number';
					break;
				}
			}

			// Helper to fetch/create user stats
			const getUserStats = async (userId) => {
				const [userStat] = await CountingUser.findOrCreateCache({
					where: {
						guildId,
						userId,
					},
					defaults: {
						correctCounts: 0,
						ruinedCounts: 0,
					},
				});
				return userStat;
			};

			// Immediate failure on line 0
			if (failedAtLine === 0) {
				if (failReason === 'invalid') {
					// Handled by the firstInput check above
					return;
				} else if (failReason === 'double_count') {
					const warning = await t(
						message,
						'counting.events.messageCreate.game.double_count',
					);
					const components = await simpleContainer(message, warning, {
						color: 'Red',
					});
					await message.reply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
					return;
				} else if (failReason === 'wrong_number') {
					await message.react(failReaction).catch(() => {});
					const userStat = await getUserStats(message.author.id);
					userStat.ruinedCounts += 1;
					await userStat.save();
					const isStrict = setting.strictEnabled;
					let desc;
					const formattedPrev = formatNumberByMode(expectedFromDB - 1n, mode);
					if (isStrict) {
						desc = await t(
							message,
							'counting.helpers.index.game.wrong_number_reset',
							{
								number: formattedPrev,
								user: message.author.toString(),
							},
						);
						setting.currentCount = 0;
						setting.lastUserId = null;
					} else {
						desc = await t(
							message,
							'counting.helpers.index.game.wrong_number',
							{
								number: formattedPrev,
								user: message.author.toString(),
							},
						);
					}
					const components = await simpleContainer(message, desc, {
						color: 'Red',
					});
					await message.reply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
					await setting.save();
					return;
				}
			}

			// If we had at least 1 success
			if (successCount > 0) {
				const userStat = await getUserStats(message.author.id);
				userStat.correctCounts += successCount;

				// Milestone celebration
				let hitMilestone = false;
				let highestMilestone = 0n;
				for (let n = expectedFromDB; n < simulatedNext; n++) {
					if (n > 0n && n % 100n === 0n) {
						hitMilestone = true;
						highestMilestone = n;
					}
				}
				if (hitMilestone) {
					const milestoneDesc = await t(
						message,
						'counting.events.messageCreate.game.milestone',
						{
							number: formatNumberByMode(highestMilestone, mode),
							user: message.author.toString(),
						},
					);
					const components = await simpleContainer(message, milestoneDesc, {
						color: 'Gold',
					});
					await message.channel.send({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}

				// If it failed midway
				if (failedAtLine > 0) {
					await message.react(failReaction).catch(() => {});
					userStat.ruinedCounts += 1;
					const isStrict = setting.strictEnabled;
					let desc;
					const formattedPrev = formatNumberByMode(simulatedNext - 1n, mode);
					if (isStrict) {
						desc = await t(
							message,
							'counting.helpers.index.game.wrong_number_reset',
							{
								number: formattedPrev,
								user: message.author.toString(),
							},
						);
						setting.currentCount = 0;
						setting.lastUserId = null;
					} else {
						desc = await t(
							message,
							'counting.helpers.index.game.wrong_number',
							{
								number: formattedPrev,
								user: message.author.toString(),
							},
						);
						setting.currentCount = Number(simulatedNext - 1n);
						setting.lastUserId = message.author.id;
					}
					const components = await simpleContainer(message, desc, {
						color: 'Red',
					});
					await message.reply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				} else {
					// Complete success
					setting.currentCount = Number(simulatedNext - 1n);
					setting.lastUserId = message.author.id;
					await message.react(successReaction).catch(() => {});
				}
				await userStat.save();
				await setting.save();
			}
		});
	}
}
module.exports = MessageCreateEvent;
