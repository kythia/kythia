/**
 * @namespace: addons/api/routes/canvas.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { Hono } = require('hono');
const { welcomeBanner } = require('kythia-arts');
const { resolvePreviewText } = require('@coreHelpers');

const app = new Hono();

const intOrUndefined = (val) => {
	if (val === null || val === undefined || val === '') return undefined;
	const parsed = parseInt(val, 10);
	return Number.isNaN(parsed) ? undefined : parsed;
};

const strOrUndefined = (val) => (!val ? undefined : val);

app.post('/preview', async (c) => {
	const client = c.get('client');
	const { logger } = c.get('container');

	try {
		const body = await c.req.json();
		const type = body.type || 'In';
		const prefix = `welcome${type}`;

		const mockUserId = client.user?.id || '000000000000000000';

		const resolvedMainText = await resolvePreviewText(
			body[`${prefix}MainTextContent`],
			type,
			body.guildId,
			c.get('container'),
			client,
		);
		const resolvedSubText = await resolvePreviewText(
			body[`${prefix}SubTextContent`],
			type,
			body.guildId,
			c.get('container'),
			client,
		);

		const options = {
			customUsername: resolvedSubText || 'Kythia Chan',
			botToken: process.env.DISCORD_BOT_TOKEN,

			customWidth: intOrUndefined(body[`${prefix}BannerWidth`]),
			customHeight: intOrUndefined(body[`${prefix}BannerHeight`]),

			customBackground: strOrUndefined(body[`${prefix}BackgroundUrl`]),
			overlayColor: strOrUndefined(body[`${prefix}OverlayColor`]),

			avatarSize:
				body[`${prefix}AvatarEnabled`] === false
					? 0
					: intOrUndefined(body[`${prefix}AvatarSize`]),
			avatarY: intOrUndefined(body[`${prefix}AvatarYOffset`]),

			avatarBorder: {
				width: intOrUndefined(body[`${prefix}AvatarBorderWidth`]),
				color: strOrUndefined(body[`${prefix}AvatarBorderColor`]),
			},

			welcomeText: resolvedMainText,
			welcomeColor: strOrUndefined(body[`${prefix}MainTextColor`]),
			customFont: strOrUndefined(body[`${prefix}MainTextFontFamily`]),
			fontWeight: strOrUndefined(body[`${prefix}MainTextFontWeight`]),
			textOffsetY: intOrUndefined(body[`${prefix}MainTextYOffset`]),

			usernameColor: strOrUndefined(body[`${prefix}SubTextColor`]),

			textShadow: !!body[`${prefix}ShadowColor`],

			type: 'welcome',
		};

		const buffer = await welcomeBanner(mockUserId, options);

		const base64Image = Buffer.from(buffer).toString('base64');
		const dataUri = `data:image/png;base64,${base64Image}`;

		return c.json({
			success: true,
			image: dataUri,
		});
	} catch (e) {
		logger.error(`Error generating canvas preview: ${e.message || e}`, {
			label: 'api',
		});
		return c.json(
			{
				success: false,
				message: 'Failed to generate preview',
				error: e.message,
			},
			500,
		);
	}
});

module.exports = app;
