/**
 * @namespace: addons/api/routes/booster.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { Hono } = require('hono');
const app = new Hono();

const getClient = (c) => c.get('client');
const getModels = (c) => getClient(c).container.models;

const BOOSTER_FIELDS = [
	'boosterOn',
	'boosterChannelId',
	'boosterEmbedText',
	'boosterEmbedColor',
	'boosterBannerWidth',
	'boosterBannerHeight',
	'boosterBackgroundUrl',
	'boosterForegroundUrl',
	'boosterOverlayColor',
	'boosterAvatarEnabled',
	'boosterAvatarSize',
	'boosterAvatarShape',
	'boosterAvatarYOffset',
	'boosterAvatarBorderWidth',
	'boosterAvatarBorderColor',
	'boosterMainTextContent',
	'boosterMainTextFontFamily',
	'boosterMainTextFontWeight',
	'boosterMainTextColor',
	'boosterMainTextYOffset',
	'boosterSubTextContent',
	'boosterSubTextColor',
	'boosterSubTextYOffset',
	'boosterBorderColor',
	'boosterBorderWidth',
	'boosterShadowColor',
	'boosterLayout',
];

// =============================================================================
// GET /api/booster/:guildId — Get booster settings for a guild
// =============================================================================
app.get('/:guildId', async (c) => {
	const { BoosterSetting } = getModels(c);
	const guildId = c.req.param('guildId');

	try {
		const setting = await BoosterSetting.getCache({ where: { guildId } });

		// Return null defaults for every field if no record exists yet — no 404
		const data = {};
		for (const field of BOOSTER_FIELDS) {
			data[field] = setting?.[field] ?? null;
		}

		return c.json({ success: true, data });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// PATCH /api/booster/:guildId — Partially update booster settings
// =============================================================================
app.patch('/:guildId', async (c) => {
	const { BoosterSetting } = getModels(c);
	const guildId = c.req.param('guildId');

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	try {
		const updates = {};
		for (const field of BOOSTER_FIELDS) {
			if (Object.hasOwn(body, field)) {
				updates[field] = body[field];
			}
		}

		if (Object.keys(updates).length === 0) {
			return c.json(
				{
					success: false,
					error: `No valid fields provided. Allowed fields: ${BOOSTER_FIELDS.join(', ')}`,
				},
				400,
			);
		}

		// Auto-create BoosterSetting if it doesn't exist yet
		const [setting] = await BoosterSetting.findOrCreate({
			where: { guildId },
			defaults: { guildId },
		});

		await setting.update(updates);
		await setting.save();

		const data = {};
		for (const field of BOOSTER_FIELDS) {
			data[field] = setting[field] ?? null;
		}

		return c.json({ success: true, data });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// POST /api/booster/:guildId/test — Test booster settings
// =============================================================================
app.post('/:guildId/test', async (c) => {
	const client = getClient(c);
	const guildId = c.req.param('guildId');

	let body;
	try {
		body = await c.req.json();
	} catch {
		body = {}; // Allow empty body
	}

	const { userId } = body;

	try {
		const guild = await client.guilds.fetch(guildId).catch(() => null);
		if (!guild) {
			return c.json({ success: false, error: 'Guild not found' }, 404);
		}

		let member = null;
		if (userId) {
			member = await guild.members.fetch(userId).catch(() => null);
		}

		if (!member) {
			// Default to guild owner or bot itself if owner cannot be fetched
			member =
				(await guild.members.fetch(guild.ownerId).catch(() => null)) ||
				guild.members.me;
		}

		const oldMember = Object.create(member);
		Object.defineProperty(oldMember, 'premiumSinceTimestamp', { value: null });

		const newMember = Object.create(member);
		Object.defineProperty(newMember, 'premiumSinceTimestamp', {
			value: Date.now(),
		});

		client.emit('guildMemberUpdate', oldMember, newMember);

		return c.json({
			success: true,
			message: `Dispatched guildMemberUpdate event for testing booster.`,
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
