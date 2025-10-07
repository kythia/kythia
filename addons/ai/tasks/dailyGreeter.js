/**
 * @namespace: addons/ai/tasks/dailyGreeter.js
 * @type: Scheduled Task
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { getAndUseNextAvailableToken } = require('../helpers/gemini');
const { GoogleGenAI } = require('@google/genai');
const logger = require('@src/utils/logger');
const cron = require('node-cron');

// Helper untuk mencari channel utama (logika tetap, hanya dipisah)
function findMainChannel(guild, client) {
    let mainChannel = null;
    if (guild.systemChannelId) {
        mainChannel = guild.channels.cache.get(guild.systemChannelId);
    }
    if (!mainChannel) {
        mainChannel = guild.channels.cache
            .filter((channel) => channel.type === 0 && channel.viewable && channel.permissionsFor(client.user)?.has('SEND_MESSAGES'))
            .sort((a, b) => a.position - b.position)
            .first();
    }
    if (!mainChannel) {
        mainChannel = guild.channels.cache.find((channel) => channel.name === 'general' && channel.type === 0);
    }
    return mainChannel;
}

function initializeAiTasks(bot) {
    const client = bot.client;

    const schedule = kythia.addons.ai.dailyGreeterSchedule || '0 7 * * *';
    cron.schedule(
        schedule,
        async () => {
            if (kythia.addons.ai.geminiApiKeys.length === 0) return;

            try {
                const guilds = client.guilds.cache;

                for (const [guildId, guild] of guilds) {
                    try {
                        const mainChannel = findMainChannel(guild, client);
                        if (!mainChannel) continue;

                        const personaPrompt = kythia.addons.ai.personaPrompt;
                        const morningPrompt = kythia.addons.ai.dailyGreeterPrompt;

                        let guildInfo = `FYI: Nama Server ${guild.name}\n
                    Jumlah Member Online ${guild.members.cache.filter((m) => !m.user.bot).size}`;

                        const prompt = `${personaPrompt}\n\n${morningPrompt}\n${guildInfo}`;

                        const tokenIdx = await getAndUseNextAvailableToken();
                        if (tokenIdx === -1) {
                            logger.info(`❌ No AI tokens available for daily greeter. Skipping.`);
                            return;
                        }

                        const GEMINI_API_KEY = kythia.addons.ai.geminiApiKeys.split(',')[tokenIdx];
                        const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

                        const response = await genAI.models.generateContent({
                            model: kythia.addons.ai.model,
                            contents: prompt,
                        });

                        const greeting = response.text ? response.text.trim() : '❌ Failed to generate greeting';
                        await mainChannel.send(greeting);
                    } catch (err) {
                        logger.error(`❌ Failed to process greeting for guild ${guildId}:`, err.message);
                    }
                }
            } catch (err) {
                logger.error('❌ Failed to run daily greeter task:', err);
            }
        },
        {
            timezone: kythia.bot.timezone,
        }
    );
}

module.exports = { initializeAiTasks };
