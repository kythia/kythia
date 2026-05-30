/**
 * @namespace: addons/music/helpers/reload-node.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { reloadConfig } = require('@coreHelpers/reload-config');

async function reloadLavalinkNodes(client) {
	const { logger, kythiaConfig } = client.container;
	logger.info(`🔄 Attempting to reload Lavalink nodes...`, { label: 'music' });
	reloadConfig();

	for (const node of client.poru.nodes.values()) {
		try {
			await node.disconnect();
			logger.info(`🔌 Disconnected from node "${node.name}".`, {
				label: 'music',
			});
		} catch (e) {
			logger.warn(
				`⚠️ Failed to disconnect from node "${node.name}": ${e.message}`,
				{ label: 'music' },
			);
		}
	}
	client.poru.nodes.clear();
	logger.info(`All old nodes have been cleared.`, { label: 'music' });

	const newNodes = (kythiaConfig.addons.music.lavalink.hosts || 'localhost')
		.split(',')
		.map((host, i) => ({
			name: `Kythia Nodes #${i + 1}`,
			host: host.trim(),
			port: parseInt(
				(kythiaConfig.addons.music.lavalink.ports || '2333').split(',')[i] ||
					'2333',
				10,
			),
			password:
				(
					kythiaConfig.addons.music.lavalink.passwords || 'youshallnotpass'
				).split(',')[i] || 'youshallnotpass',
			secure:
				(
					(kythiaConfig.addons.music.lavalink.secures || 'false').split(',')[
						i
					] || 'false'
				).toLowerCase() === 'true',
		}));

	for (const nodeConfig of newNodes) {
		client.poru.addNode(nodeConfig);
	}
	logger.info(`✅ Added ${newNodes.length} new node(s) to Poru.`, {
		label: 'music',
	});

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
			logger.info(
				`✅ New node "${bestNode.name}" is connected. Moving players...`,
				{ label: 'music' },
			);
			let movedPlayers = 0;
			for (const player of client.poru.players.values()) {
				if (player.voiceChannel) {
					await player.moveNode(bestNode.name);
					movedPlayers++;
				}
			}
			logger.info(`🚀 Moved ${movedPlayers} player(s) successfully.`, {
				label: 'music',
			});
		} else {
			throw new Error('New node failed to connect within the time limit.');
		}

		return true;
	} catch (error) {
		logger.error(`Error during player migration: ${error.message || error}`, {
			label: 'reload-node',
		});
		return false;
	}
}

module.exports = { reloadLavalinkNodes };
