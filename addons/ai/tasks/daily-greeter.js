/**
 * @namespace: addons/ai/tasks/daily-greeter.js
 * @type: Scheduled Task
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { getAndUseNextAvailableToken } = require('../helpers/gemini');
const { GoogleGenAI } = require('@google/genai');

async function findMainChannel(guild, client) {
	const { getTextChannelSafe } = client.container.helpers.discord;
	let mainChannel = null;
	if (guild.systemChannelId) {
		mainChannel = await getTextChannelSafe(guild, guild.systemChannelId);
	}
	if (!mainChannel) {
		mainChannel = guild.channels.cache
			.filter(
				(channel) =>
					channel.type === 0 &&
					channel.viewable &&
					channel.permissionsFor(client.user)?.has('SEND_MESSAGES'),
			)
			.sort((a, b) => a.position - b.position)
			.first();
	}
	if (!mainChannel) {
		mainChannel = guild.channels.cache.find(
			(channel) => channel.name === 'general' && channel.type === 0,
		);
	}
	return mainChannel;
}

const { BaseTask } = require('kythia-core');

class DailyGreeterTask extends BaseTask {
	task = {
		taskName: 'daily-greeter',
		schedule: '0 7 * * *', // Every day at 7 AM
		active: false,
	};

	async execute(container) {
		const { logger, client, kythiaConfig } = container || this.container;

		const apiKeysStr = kythiaConfig.addons.ai.geminiApiKeys || '';
		if (!apiKeysStr) return;

		try {
			// Runs on all shards, but each shard only processes its own local guilds.cache.
			// This is correct: each shard independently greets its own servers.
			const guilds = client.guilds.cache;

			for (const [guildId, guild] of guilds) {
				try {
					const mainChannel = await findMainChannel(guild, client);
					if (!mainChannel) continue;

					const personaPrompt = kythiaConfig.addons.ai.personaPrompt;
					const morningPrompt = kythiaConfig.addons.ai.dailyGreeterPrompt;

					const guildInfo = `FYI: Nama Server ${guild.name}\n
                    Jumlah Member Online ${guild.members.cache.filter((m) => !m.user?.bot).size}`;

					const prompt = `${personaPrompt}\n\n${morningPrompt}\n${guildInfo}`;

					const tokenIdx = await getAndUseNextAvailableToken();
					if (tokenIdx === -1) {
						logger.info('No AI tokens available for daily greeter. Skipping.', {
							label: 'daily-greeter',
						});
						return;
					}

					const GEMINI_API_KEY = apiKeysStr.split(',')[tokenIdx];
					const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

					const response = await genAI.models.generateContent({
						model: kythiaConfig.addons.ai.model,
						contents: prompt,
					});

					const greeting = response.text
						? response.text.trim()
						: '❌ Failed to generate greeting';
					await mainChannel.send(greeting);
				} catch (err) {
					logger.error(
						`Failed to process greeting for guild ${guildId}: ${err.message}`,
						{ label: 'daily-greeter' },
					);
				}
			}
		} catch (err) {
			logger.error(`Failed to run daily greeter task: ${err.message || err}`, {
				label: 'daily-greeter',
			});
		}
	}
}

exports.default = DailyGreeterTask;
