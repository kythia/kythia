/**
 * @namespace: addons/api/routes/welcome.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const app = new Hono();

const getClient = (c) => c.get('client');
const getModels = (c) => getClient(c).container.models;

const WELCOME_FIELDS = [
	'welcomeInOn',
	'welcomeInChannelId',
	'welcomeInEmbedText',
	'welcomeInEmbedColor',
	'welcomeInBackgroundUrl',
	'welcomeInBannerWidth',
	'welcomeInBannerHeight',
	'welcomeInOverlayColor',
	'welcomeInAvatarEnabled',
	'welcomeInAvatarSize',
	'welcomeInAvatarShape',
	'welcomeInAvatarYOffset',
	'welcomeInAvatarBorderWidth',
	'welcomeInAvatarBorderColor',
	'welcomeInMainTextContent',
	'welcomeInMainTextFontFamily',
	'welcomeInMainTextFontWeight',
	'welcomeInMainTextColor',
	'welcomeInMainTextYOffset',
	'welcomeInSubTextContent',
	'welcomeInSubTextColor',
	'welcomeInSubTextYOffset',
	'welcomeInBorderColor',
	'welcomeInBorderWidth',
	'welcomeInShadowColor',
	/**
	 * Components V2 layout config for welcome-in.
	 * null  → CV2 card (default)
	 * { style: 'plain-text' } → plain text only
	 */
	'welcomeInLayout',

	'welcomeOutOn',
	'welcomeOutChannelId',
	'welcomeOutEmbedText',
	'welcomeOutEmbedColor',
	'welcomeOutBackgroundUrl',
	'welcomeOutBannerWidth',
	'welcomeOutBannerHeight',
	'welcomeOutOverlayColor',
	'welcomeOutAvatarEnabled',
	'welcomeOutAvatarSize',
	'welcomeOutAvatarShape',
	'welcomeOutAvatarYOffset',
	'welcomeOutAvatarBorderWidth',
	'welcomeOutAvatarBorderColor',
	'welcomeOutMainTextContent',
	'welcomeOutMainTextFontFamily',
	'welcomeOutMainTextFontWeight',
	'welcomeOutMainTextColor',
	'welcomeOutMainTextYOffset',
	'welcomeOutSubTextContent',
	'welcomeOutSubTextColor',
	'welcomeOutSubTextYOffset',
	'welcomeOutBorderColor',
	'welcomeOutBorderWidth',
	/** Same as welcomeInLayout but for the farewell message. */
	'welcomeOutLayout',

	'welcomeRoleId',
	'welcomeDmOn',
	'welcomeDmText',
];

// =============================================================================
// GET /api/welcome/:guildId — Get welcome settings for a guild
// =============================================================================
app.get('/:guildId', async (c) => {
	const { WelcomeSetting } = getModels(c);
	const guildId = c.req.param('guildId');

	try {
		const setting = await WelcomeSetting.getCache({ where: { guildId } });

		// Return null defaults for every field if no record exists yet — no 404
		const data = {};
		for (const field of WELCOME_FIELDS) {
			data[field] = setting?.[field] ?? null;
		}

		return c.json({ success: true, data });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// PATCH /api/welcome/:guildId — Partially update welcome settings
// =============================================================================
app.patch('/:guildId', async (c) => {
	const { WelcomeSetting } = getModels(c);
	const guildId = c.req.param('guildId');

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	try {
		const updates = {};
		for (const field of WELCOME_FIELDS) {
			if (Object.hasOwn(body, field)) {
				updates[field] = body[field];
			}
		}

		if (Object.keys(updates).length === 0) {
			return c.json(
				{
					success: false,
					error: `No valid fields provided. Allowed fields: ${WELCOME_FIELDS.join(', ')}`,
				},
				400,
			);
		}

		// Auto-create WelcomeSetting if it doesn't exist yet
		const [setting] = await WelcomeSetting.findOrCreateWithCache({
			where: { guildId },
			defaults: { guildId },
		});

		await setting.update(updates);
		await setting.save();

		const data = {};
		for (const field of WELCOME_FIELDS) {
			data[field] = setting[field] ?? null;
		}

		return c.json({ success: true, data });
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

// =============================================================================
// POST /api/welcome/:guildId/test — Test welcome settings
// =============================================================================
app.post('/:guildId/test', async (c) => {
	const client = getClient(c);
	const guildId = c.req.param('guildId');

	let body;
	try {
		body = await c.req.json();
	} catch {
		return c.json({ success: false, error: 'Invalid JSON body' }, 400);
	}

	const { type, userId } = body;
	if (!['in', 'out'].includes(type)) {
		return c.json({ success: false, error: "Type must be 'in' or 'out'" }, 400);
	}

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

		if (type === 'in') {
			client.emit('guildMemberAdd', member);
		} else {
			client.emit('guildMemberRemove', member);
		}

		return c.json({
			success: true,
			message: `Dispatched ${type === 'in' ? 'guildMemberAdd' : 'guildMemberRemove'} event for testing.`,
		});
	} catch (error) {
		return c.json({ success: false, error: error.message }, 500);
	}
});

module.exports = app;
