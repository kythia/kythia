/**
 * @namespace: addons/pro/register.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const CloudflareApi = require('./helpers/CloudflareApi');

module.exports = {
	initialize(bot) {
		const summary = [];

		bot.addClientReadyHook((_sequelize) => {
			const container = bot.client.container;
			const { logger, kythiaConfig, models } = container;

			summary.push(' ╰┈➤ DnsRecord & Monitor model associations registered.');

			try {
				const cloudflareService = new CloudflareApi({
					kythiaConfig: kythiaConfig,
					logger: logger,
					models: models,
				});

				if (!bot.client.container.services) {
					bot.client.container.services = {};
				}

				bot.client.container.services.cloudflare = cloudflareService;

				summary.push(' ╰┈➤ ✅ Cloudflare Service ready.');
			} catch (error) {
				logger.error(
					`🔥 FATAL: Failed to initialize Cloudflare Service: ${error.message || error}`,
					{ label: 'pro' },
				);
				summary.push(' ╰┈➤ ❌ FAILED to load Cloudflare Service.');
			}
		});

		return summary;
	},
};
