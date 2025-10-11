/**
 * @namespace: addons/music/helpers/reloadNode.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const logger = require('@utils/logger');
const { reloadConfig } = require('@utils/reload_config');

async function reloadLavalinkNodes(client) {
    logger.info('🔄 Attempting to reload Lavalink nodes...');
    reloadConfig();

    for (const node of client.poru.nodes.values()) {
        try {
            await node.disconnect();
            logger.info(`🔌 Disconnected from node "${node.name}".`);
        } catch (e) {
            logger.warn(`⚠️ Failed to disconnect from node "${node.name}": ${e.message}`);
        }
    }
    client.poru.nodes.clear();
    logger.info('All old nodes have been cleared.');

    const newNodes = (kythia.addons.music.lavalink.hosts || 'localhost').split(',').map((host, i) => ({
        name: `kythia-${i}`,
        host: host.trim(),
        port: parseInt((kythia.addons.music.lavalink.ports || '2333').split(',')[i] || '2333', 10),
        password: (kythia.addons.music.lavalink.passwords || 'youshallnotpass').split(',')[i] || 'youshallnotpass',
        secure: ((kythia.addons.music.lavalink.secures || 'false').split(',')[i] || 'false').toLowerCase() === 'true',
    }));

    for (const nodeConfig of newNodes) {
        client.poru.addNode(nodeConfig);
    }
    logger.info(`✅ Added ${newNodes.length} new node(s) to Poru.`);

    try {
        let attempts = 0;
        let bestNode = null;
        const maxAttempts = 20;

        while (attempts < maxAttempts) {
            const availableNodes = client.poru.leastUsedNodes;

            if (availableNodes.length > 0 && availableNodes[0].isConnected) {
                bestNode = availableNodes[0];
                break;
            }

            attempts++;

            await new Promise((resolve) => setTimeout(resolve, 500));
        }

        if (bestNode) {
            logger.info(`✅ New node "${bestNode.name}" is connected. Moving players...`);
            let movedPlayers = 0;
            for (const player of client.poru.players.values()) {
                if (player.voiceChannel) {
                    await player.moveNode(bestNode.name);
                    movedPlayers++;
                }
            }
            logger.info(`🚀 Moved ${movedPlayers} player(s) successfully.`);
        } else {
            throw new Error('New node failed to connect within the time limit.');
        }

        return true;
    } catch (error) {
        logger.error(`❌ Error during player migration: ${error.message}`);
        return false;
    }
}

module.exports = { reloadLavalinkNodes };
