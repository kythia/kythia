/**
 * @namespace: addons/api/routes/guilds/settings.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const app = new Hono();

app.get('/:guildId', async (c) => {
	const guildId = c.req.param('guildId');
	const client = c.get('client');
	const container = client.container;
	const { ServerSetting } = container.models;
	const [settings] = await ServerSetting.findOrCreateCache({
		where: { guildId },
		defaults: {
			guildId,
			guildName: guildId,
		},
	});

	return c.json({ settings });
});

app.patch('/:guildId', async (c) => {
	const guildId = c.req.param('guildId');
	const client = c.get('client');
	const container = client.container;
	const { logger } = container;
	const { ServerSetting } = container.models;
	const guildName = client.guilds.fetch(guildId)?.name;

	const body = await c.req.json();

	try {
		const [settings] = await ServerSetting.findOrCreateCache({
			where: { guildId },
			defaults: {
				guildId,
				guildName: guildName ?? 'unknown',
			},
		});

		const attributes = ServerSetting.getAttributes();
		const validKeys = Object.keys(attributes);

		for (const key of Object.keys(body)) {
			if (['id', 'guildId', 'createdAt', 'updatedAt'].includes(key)) continue;

			if (!validKeys.includes(key)) continue;

			const fieldDef = attributes[key];
			const type = fieldDef.type.key;
			const value = body[key];

			switch (type) {
				case 'BOOLEAN':
					settings[key] = String(value) === 'true' || value === true;
					break;

				case 'INTEGER':
				case 'BIGINT':
				case 'FLOAT':
				case 'DOUBLE': {
					const parsed = parseInt(value, 10);
					settings[key] = Number.isNaN(parsed) ? null : parsed;
					break;
				}

				case 'JSON':
				case 'JSONB':
					settings[key] = typeof value === 'object' ? value : [];
					break;

				default:
					if (value === null || value === undefined) {
						settings[key] = null;
					} else {
						const str = String(value).trim();
						settings[key] = str === '' ? null : str;
					}
					break;
			}
		}

		await settings.save();

		return c.json({ success: true, settings });
	} catch (e) {
		logger.error(`Error saving settings: ${e.message || e}`, { label: 'api' });
		return c.json(
			{ error: 'Failed to save settings', details: e.message },
			500,
		);
	}
});

module.exports = app;
