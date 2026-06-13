/**
 * @namespace: addons/core/events/guildDelete.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
} = require('discord.js');
const Sentry = require('@sentry/node');

module.exports = async (bot, guild) => {
	const container = bot.client.container;
	const { t, kythiaConfig, helpers, logger, models } = container;
	const { BotGrowthSnapshot } = models;
	const { convertColor } = helpers.color;

	// Ignore server outages or uncached partial guilds sent during restart
	if (guild.available === false || !guild.name) {
		return;
	}

	const minMembers = kythiaConfig.bot.minMembers ?? 0;
	if (minMembers > 0 && (guild.memberCount ?? 0) < minMembers) {
		return;
	}

	const webhookUrl = kythiaConfig.api.webhookGuildInviteLeave;
	if (webhookUrl) {
		try {
			const accentColor = convertColor('Red', {
				from: 'discord',
				to: 'decimal',
			});

			const leaveContainer = new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(
							guild,
							'core.events.guildDelete.events.guild.delete.webhook.desc',
							{
								bot: guild.client?.user?.username ?? 'Unknown Bot',
								guild: guild.name ?? 'Unknown',
								guildId: guild.id ?? 'Unknown',
								ownerId: guild.ownerId ?? 'Unknown',
								memberCount: guild.memberCount ?? '?',
								createdAt: guild.createdAt
									? guild.createdAt.toLocaleDateString('en-US', {
											year: 'numeric',
											month: 'long',
											day: 'numeric',
										})
									: 'Unknown',
							},
						),
					),
				);

			const url = new URL(webhookUrl);
			url.searchParams.append('wait', 'true');
			url.searchParams.append('with_components', 'true');

			const payload = {
				flags: MessageFlags.IsComponentsV2,
				components: [leaveContainer.toJSON()],
				allowed_mentions: {
					parse: [],
				},
			};

			await fetch(url.href, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			});
		} catch (err) {
			logger.error(
				`Failed to send guild delete webhook: ${err.message || err}`,
				{
					label: 'guildDelete:webhook',
				},
			);
			if (bot.config?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}

	// ─── Bot Growth Snapshot ─────────────────────────────────────────────────
	try {
		if (BotGrowthSnapshot) {
			let totalGuilds = bot.client.guilds.cache.size;
			if (bot.client.shard) {
				const results = await bot.client.shard.broadcastEval(
					(c) => c.guilds.cache.size,
				);
				totalGuilds = results.reduce((acc, size) => acc + size, 0);
			}

			await BotGrowthSnapshot.create({
				guildId: guild.id,
				guildName: guild.name ?? null,
				memberCount: guild.memberCount ?? 0,
				event: 'leave',
				totalGuilds,
			});
		}
	} catch (snapErr) {
		logger.error(`Failed to record bot growth snapshot: ${snapErr.message}`, {
			label: 'guildDelete:growth',
		});
	}
};
