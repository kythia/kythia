/**
 * @namespace: addons/api/routes/webhooks.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Hono } = require('hono');
const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	SectionBuilder,
	ThumbnailBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
} = require('discord.js');
const app = new Hono();
app.post('/topgg', async (c) => {
	const client = c.get('client');
	const container = client.container;
	const { models, logger, helpers, kythiaConfig } = container;
	const { convertColor } = helpers.color;
	const { KythiaVoter, KythiaUser } = models;
	const config = c.get('config');
	const { topgg, webhookVoteLogs } = config.api;
	if (c.req.header('Authorization') !== topgg.authToken) {
		return c.json(
			{
				error: 'Unauthorized Top.gg',
			},
			401,
		);
	}
	let body;
	try {
		const rawBody = await c.req.text();
		const safeBody = rawBody.replace(/"user"\s*:\s*(\d+)/g, '"user": "$1"');
		body = JSON.parse(safeBody);
	} catch {
		return c.json(
			{
				error: 'Invalid JSON Body',
			},
			400,
		);
	}
	const userId = body.user;
	if (!userId)
		return c.json(
			{
				error: 'No User ID',
			},
			400,
		);
	try {
		await KythiaVoter.updateOrCreateCache(
			{
				userId,
			},
			{
				votedAt: new Date(),
			},
		);
		const voteExpiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
		const [user, isNew] = await KythiaUser.getOrCreateCache(
			{
				userId,
			},
			{
				kythiaCoin: 0,
				isVoted: false,
				voteExpiresAt,
				votePoints: 0,
			},
		);
		user.kythiaCoin = (user.kythiaCoin || 0) + 1000;
		user.isVoted = true;
		user.voteExpiresAt = voteExpiresAt;
		user.votePoints = (user.votePoints || 0) + 1;
		await user.save();
		try {
			const discordUser = await client.container.helpers.discord.getUserSafe(
				client,
				userId,
			);
			const { simpleContainer } = helpers.discord;
			const msg = isNew
				? `## \`👤\` Kythia Account Created!\nThanks for voting! You got **1,000 Kythia Coins** and unlock **vote only** command as a thank you. \nDont forget to vote for Kythia tomorrow!`
				: `## \`🩷\` Thanks for voting!\nYou got **1,000 Kythia Coins** and unlock **vote only** command as a thank you. \nDont forget to vote for Kythia tomorrow!`;
			const components = await simpleContainer(
				{
					client,
				},
				msg,
				{
					color: config.bot.color,
				},
			);
			components[0]
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addActionRowComponents(
					new ActionRowBuilder().addComponents(
						new ButtonBuilder()
							.setCustomId('vote-remind')
							.setLabel('Remind me in 12h')
							.setStyle(ButtonStyle.Primary),
					),
				);
			await discordUser.send({
				components,
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		} catch (err) {
			logger.warn(`Failed DM to ${userId}\n${err.message || err}`, {
				label: 'api',
			});
		}
		const accentColor = convertColor(config.bot.color, {
			from: 'hex',
			to: 'decimal',
		});
		if (webhookVoteLogs && client) {
			try {
				const user = await client.container.helpers.discord.getUserSafe(
					client,
					userId,
				);
				const webhookUrl = new URL(webhookVoteLogs);
				webhookUrl.searchParams.append('wait', 'true');
				webhookUrl.searchParams.append('with_components', 'true');
				const voteContainer = new ContainerBuilder()
					.setAccentColor(accentColor)
					.addSectionComponents(
						new SectionBuilder()
							.addTextDisplayComponents(
								new TextDisplayBuilder().setContent(`## New Vote!`),
							)
							.setThumbnailAccessory(
								new ThumbnailBuilder()
									.setDescription(user.username)
									.setURL(user.displayAvatarURL()),
							),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addMediaGalleryComponents(
						new MediaGalleryBuilder().addItems([
							new MediaGalleryItemBuilder().setURL(
								kythiaConfig.settings.voteBannerImage,
							),
						]),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addSectionComponents(
						new SectionBuilder()
							.addTextDisplayComponents(
								new TextDisplayBuilder().setContent(
									`<@${userId}> (${user.username})\njust gave their love and support to **${config.bot.name}** on Top.gg!\n\nYou're very cool >,<! thank youu very muchh, Dont forget **${config.bot.name}** tomorrow!\n-# psttt look at my dm!`,
								),
							)
							.setThumbnailAccessory(
								new ThumbnailBuilder()
									.setDescription(user.username)
									.setURL(user.displayAvatarURL()),
							),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addActionRowComponents(
						new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setStyle(ButtonStyle.Link)
								.setLabel(`🌸 Vote ${config.bot.name}`)
								.setURL(`https://top.gg/bot/${config.bot.clientId}/vote`),
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`-# © ${config.bot.name} by ${config.owner.names}`,
						),
					);
				const payload = {
					flags: MessageFlags.IsComponentsV2,
					components: [voteContainer.toJSON()],
					allowed_mentions: {
						parse: [],
					},
				};
				const response = await fetch(webhookUrl.href, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(payload),
				});
				if (!response.ok) {
					const errorBody = await response.text();
					logger.warn(
						`Failed to send log message via fetch. Status: ${response.status}. Body: ${errorBody}`,
						{
							label: 'webhook',
						},
					);
				}
			} catch (logError) {
				logger.warn(
					`Vote saved, but failed to log the vote. Error: ${logError.message}`,
					{
						label: 'webhook',
					},
				);
			}
		}
		return c.json({
			success: true,
		});
	} catch (e) {
		logger.error(`Error: ${e.message || e}`, {
			label: 'api',
		});
		return c.json(
			{
				error: 'Internal Error',
			},
			500,
		);
	}
});
app.post('/license-created', async (c) => {
	const client = c.get('client');
	const { logger, helpers } = client.container;
	const { simpleContainer } = helpers.discord;
	const config = c.get('config');
	const secret = c.req.header('Authorization');
	const API_SECRET = config.addons.api?.secret || process.env.API_SECRET;
	if (secret !== `Bearer ${API_SECRET}`) {
		return c.json(
			{
				error: 'Unauthorized',
			},
			401,
		);
	}
	const body = await c.req.json();
	const { userId, licenseKey, transactionId } = body;
	if (!userId || !licenseKey) {
		return c.json(
			{
				error: 'Missing Data',
			},
			400,
		);
	}
	try {
		const user = await client.container.helpers.discord.getUserSafe(
			client,
			userId,
		);
		if (!user)
			return c.json(
				{
					error: 'User Not Found',
				},
				404,
			);
		const msg = `## \`🎉\` Purchase Successful!\nThank you for purchasing **Kythia Dashboard / Addons**.\n\nHere is your **License Key**:\n\`\`\`${licenseKey}\`\`\`\n\n**Transaction ID**: \`${transactionId}\`\n\n> *Please keep this key safe. Do not share it with anyone.*`;
		const components = await simpleContainer(
			{
				client,
			},
			msg,
			{
				color: '#00ff00',
				// Green for success
				footer: 'Kythia Automated Delivery System',
			},
		);
		await user.send({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
		logger.info(`License key sent to ${user.tag} (${userId})`, {
			label: 'api',
		});
		return c.json({
			success: true,
		});
	} catch (err) {
		logger.error(`Failed to send license to ${userId}: ${err.message || err}`, {
			label: 'api',
		});
		return c.json(
			{
				error: 'Failed to DM User',
				details: err.message,
			},
			500,
		);
	}
});
module.exports = app;
