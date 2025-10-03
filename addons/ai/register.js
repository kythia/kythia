/**
 * @namespace: addons/ai/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

// addons/dashboard/register.js

const logger = require('@utils/logger');
const { generateCommandSchema } = require('./helpers/commandSchema');
const { initializeAiTasks } = require('./tasks/dailyGreeter');

module.exports = {
    /**
     * Fungsi initialize ini akan dipanggil oleh command handler utama (Bot.js)
     * saat memuat semua addon.
     * @param {Bot} bot Instance dari kelas Bot utama.
     */
    async initialize(bot) {
        const summery = [];
        // 1. Buat skema command untuk AI setelah bot siap dan semua command ter-load
        bot.client.once('clientReady', () => {
            // Kita simpan skema ini di dalam objek bot agar bisa diakses di mana saja
            bot.aiCommandSchema = generateCommandSchema(bot.client);
            logger.info(`✅ Successfully loaded ${bot.aiCommandSchema.length} command schema for AI.`);
        });
        if (kythia.addons.ai.dailyGreeter == true) {
            initializeAiTasks(bot);
            summery.push('   └─ Task: Daily Greeter (Cron Job) On');
        } else {
            summery.push('   └─ Task: Daily Greeter (Cron Job) Off');
        }
        return summery;
    },
};
