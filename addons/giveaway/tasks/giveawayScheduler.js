/**
 * @namespace: addons/giveaway/tasks/giveawayScheduler.js
 * @type: Scheduled Task
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

// addons/giveaway/helpers/giveawayScheduler.js
const { Op } = require('sequelize');
const Giveaway = require('../database/models/Giveaway');
const { announceWinners } = require('../helpers/giveawayManager');
const logger = require('@utils/logger');

const CHECK_INTERVAL = kythia.addons.giveaway.checkInterval * 1000;

async function checkExpiredGiveaways(client) {
    try {
        const expiredGiveaways = await Giveaway.getAllCache({
            where: {
                ended: false,
                endTime: {
                    [Op.lte]: new Date(), // Find giveaways that have ended
                },
            },
        });

        if (expiredGiveaways.length > 0) {
            logger.info(`🎁 Found ${expiredGiveaways.length} expired giveaways.`);
            for (const giveaway of expiredGiveaways) {
                await announceWinners(client, giveaway);
            }
        }
    } catch (error) {
        logger.error('🎁 Failed to check giveaways:', error);
    }
}

function initializeGiveawayScheduler(client) {
    logger.info(`🎁 Giveaway Scheduler activated! Checking every ${kythia.addons.giveaway.checkInterval} seconds.`);
    checkExpiredGiveaways(client);
    setInterval(() => checkExpiredGiveaways(client), CHECK_INTERVAL);
}

module.exports = { initializeGiveawayScheduler };
