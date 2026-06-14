/**
 * Get Lavalink nodes ping/latency information
 * @param {object} client - Discord client instance
 * @returns {Promise<Array>} Array of node information with ping
 */
async function getLavalinkNodesPings(client) {
	const nodes = [];

	if (!client.poru) {
		return nodes;
	}

	for (const [name, node] of client.poru.nodes.entries()) {
		try {
			const stats = node.stats || {};
			const isConnected = node.isConnected || false;
			let ping = isConnected ? (stats.ping ?? -1) : -1;
			const players = stats.players || 0;

			if (isConnected && ping === -1) {
				const host = node.options?.host;
				const port = node.options?.port;
				const password = node.options?.password;
				const secure = node.options?.secure;

				if (host && port && password) {
					try {
						const url = `http${secure ? 's' : ''}://${host}:${port}/version`;
						const startTime = Date.now();

						const res = await fetch(url, {
							headers: { Authorization: password },
						});

						if (res.ok) {
							ping = Date.now() - startTime;
						}
					} catch (_fetchError) {}
				}
			}

			nodes.push({
				name: name,
				host: node.options?.host || 'Unknown',
				port: node.options?.port || 2333,
				ping: ping,
				players: players,
				connected: isConnected,
				status: isConnected
					? ping !== -1
						? 'operational'
						: 'no_stats'
					: 'disconnected',
			});
		} catch (_error) {
			nodes.push({
				name: name,
				host: node.options?.host || 'Unknown',
				port: node.options?.port || 2333,
				ping: -1,
				players: 0,
				connected: false,
				status: 'error',
			});
		}
	}

	return nodes;
}

/**
 * Get Sequelize DB ping/latency information
 * @param {object} container - The bot's container
 * @returns {Promise<{ping: number, status: string, error?: string}>}
 */
async function getDbPing(container) {
	const { sequelize } = container;
	if (!sequelize) {
		return { ping: -1, status: 'not_configured' };
	}
	let ping = -1;
	let status = 'unknown';
	let errorMsg;
	try {
		const start = Date.now();
		await sequelize.authenticate();
		ping = Date.now() - start;
		status = 'connected';
	} catch (err) {
		status = 'error';
		errorMsg = err.message || String(err);
	}
	return { ping, status, error: errorMsg };
}

/**
 * Get Redis ping/latency information (HA-Aware)
 * @param {object} container - The bot's container
 * @returns {Promise<Array>} Array of node information with ping
 */
async function getRedisPings(container) {
	const { models } = container;

	const anyModelKey = models ? Object.keys(models)[0] : undefined;
	const KythiaModel = anyModelKey
		? Object.getPrototypeOf(models[anyModelKey])
		: null;

	if (
		!KythiaModel?._redisFallbackURLs ||
		KythiaModel._redisFallbackURLs.length === 0
	) {
		return [];
	}

	const redis = KythiaModel.redis;
	const urls = KythiaModel._redisFallbackURLs;
	const currentIndex = KythiaModel._redisCurrentIndex;
	const isConnected = KythiaModel.isRedisConnected;
	const failedIndexes = KythiaModel._redisFailedIndexes || new Set();

	let activePing = -1;
	if (isConnected && redis && typeof redis.ping === 'function') {
		try {
			const start = Date.now();
			await redis.ping();
			activePing = Date.now() - start;
		} catch (_e) {
			activePing = -2;
		}
	}

	const nodes = [];
	for (const [index, _url] of urls.entries()) {
		const name = `Kythia Redis #${index + 1}`;

		if (index === currentIndex) {
			if (isConnected) {
				nodes.push({ name: name, status: 'active', ping: activePing });
			} else {
				nodes.push({ name: name, status: 'failed', ping: -1 });
			}
		} else if (failedIndexes.has(index)) {
			nodes.push({ name: name, status: 'failed', ping: -1 });
		} else {
			nodes.push({ name: name, status: 'standby', ping: -1 });
		}
	}
	return nodes;
}

module.exports = {
	getLavalinkNodesPings,
	getDbPing,
	getRedisPings,
};
