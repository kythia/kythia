/**
 * @namespace: addons/dashboard/tasks/statusMonitor.js
 * @type: Scheduled Task
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const cron = require('node-cron');
const StatusHistory = require('../database/models/StatusHistory');
const { getLavalinkStatus } = require('../web/helpers/status');
const { Op } = require('sequelize');
const logger = require('@utils/logger');

/**
 * 🤖 getBotStatus
 * Helper function to check the status of the bot from the provided client object.
 * @param {Client} client - Instance of the Discord Client.
 * @returns {{status: string}} - Returns an object with the bot status: 'operational' or 'outage'.
 */
function getBotStatus(client) {
    if (client && client.isReady()) {
        return { status: 'operational' };
    }
    return { status: 'outage' };
}

/**
 * ⏰ initializeStatusMonitor
 * Main function to initialize and run the status monitoring cron job.
 * This job runs every 5 minutes and records the status of the bot and all Lavalink nodes to the database.
 * @param {Client} client - The running Discord Client instance.
 */
function initializeStatusMonitor(client) {
    // logger.info('   -> Initializing status monitoring task...');

    cron.schedule('*/5 * * * *', async () => {
        try {
            const recordsToCreate = [];

            // 1. Check bot status
            const botStatus = getBotStatus(client);
            recordsToCreate.push({ component: 'bot', status: botStatus.status });

            // 2. Check status of each Lavalink node
            const lavalinkNodes = await getLavalinkStatus();

            // 3. Add each node's status to the records list
            for (const node of lavalinkNodes) {
                recordsToCreate.push({
                    component: `lavalink-${node.host}`,
                    status: node.status,
                });
            }

            // 4. Save all statuses to the database in a single query
            await StatusHistory.bulkCreate(recordsToCreate);
            logger.info(`📅 Status history (${recordsToCreate.length} records) saved successfully.`);
        } catch (error) {
            logger.error('📅 Failed to run or save status history:', error);
        }
    });
    // logger.info('   -> Status monitoring task scheduled successfully.');
}

/**
 * 🧹 initializeDatabasePruning
 * Initializes a scheduled task to prune old status history data from the database.
 * This job runs daily at 02:00 AM and deletes records older than 90 days.
 */
function initializeDatabasePruning() {
    // logger.info('   -> Initializing old status data cleanup task...');

    cron.schedule('0 2 * * *', async () => {
        logger.info('📅 Running old status data cleanup...');
        try {
            const ninetyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 90));

            const deletedRows = await StatusHistory.destroy({
                where: {
                    timestamp: {
                        [Op.lt]: ninetyDaysAgo, // lt = less than
                    },
                },
            });

            if (deletedRows > 0) {
                logger.info(`📅 Successfully deleted ${deletedRows} status records older than 90 days.`);
            } else {
                logger.info('📅 No old status data to delete.');
            }
        } catch (error) {
            logger.error('📅 Failed to clean up old status data:', error);
        }
    });
}

module.exports = { initializeStatusMonitor, initializeDatabasePruning };
