/**
 * @namespace: addons/core/events/guildCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	PermissionsBitField,
	ContainerBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	MessageFlags,
} = require('discord.js');
const Sentry = require('@sentry/node');

async function getInviteLink(guild) {
	if (guild.vanityURLCode) {
		return `https://discord.gg/${guild.vanityURLCode}`;
	}
	try {
		const channels = guild.channels.cache.filter(
			(ch) => ch.type === 0 || ch.type === 2 || ch.type === 5,
		);
		let existingInvites = [];
		try {
			existingInvites = await guild.invites.fetch();
			if (existingInvites && existingInvites.size > 0) {
				const useable = existingInvites.find((i) => !i.expired && i.url);
				if (useable) return useable.url;
				const anyInvite = existingInvites.first();
				if (anyInvite) return anyInvite.url;
			}
		} catch (_err) {}
		for (const channel of channels.values()) {
			const perms = channel.permissionsFor(guild.members.me);
			if (perms?.has(PermissionsBitField.Flags.CreateInstantInvite)) {
				try {
					const invite = await channel.createInvite({
						maxAge: 0,
						maxUses: 0,
						reason: 'Bot joined - sharing server invite for logging',
					});
					if (invite?.url) {
						return invite.url;
					}
				} catch (_e) {}
			}
		}
	} catch (_e) {}
	return null;
}

function getWelcomeChannel(guild) {
	const canSend = (ch) => {
		if (!ch) return false;
		const perms = ch.permissionsFor(guild.members.me);
		return (
			perms?.has(PermissionsBitField.Flags.ViewChannel) &&
			perms?.has(PermissionsBitField.Flags.SendMessages)
		);
	};

	let channel = guild.channels.cache.find(
		(ch) =>
			ch.type === 0 &&
			typeof ch.name === 'string' &&
			ch.name.toLowerCase() === 'general' &&
			canSend(ch),
	);

	if (!channel && canSend(guild.systemChannel)) {
		channel = guild.systemChannel;
	}

	if (!channel) {
		channel = guild.channels.cache.find((ch) => ch.type === 0 && canSend(ch));
	}

	return channel;
}

module.exports = async (bot, guild) => {
	const container = bot.client.container;
	const { t, models, helpers, kythiaConfig, logger } = container;
	const { ServerSetting, KythiaBlacklist, BotGrowthSnapshot } = models;

	const { convertColor } = helpers.color;

	// ─── Guild Blacklist Check ────────────────────────────────────────────────
	const blacklisted = await KythiaBlacklist.getCache({
		where: { type: 'guild', targetId: guild.id },
	}).catch(() => null);

	if (blacklisted) {
		logger.info(
			`Left blacklisted guild "${guild.name}" (${guild.id}) | Reason: ${blacklisted.reason ?? 'none'}`,
			{ label: 'guildCreate:blacklist' },
		);
		await guild.leave().catch(() => {});
		return;
	}

	const locale = guild.preferredLocale || 'en';
	const [setting] = await ServerSetting.findOrCreateWithCache({
		where: { guildId: guild.id },
		defaults: {
			guildId: guild.id,
			guildName: guild.name ?? 'Unknown',
			lang: locale,
		},
	});

	if (setting.createdAt === setting.updatedAt) {
		logger.info(`Default bot settings created for server: ${guild.name}`, {
			label: 'guildCreate',
		});
	}

	const minMembers = kythiaConfig.bot.minMembers ?? 0;
	if (minMembers > 0 && (guild.memberCount ?? 0) < minMembers) {
		logger.info(
			`Left guild "${guild.name}" (${guild.id}) — only ${guild.memberCount} members (min: ${minMembers})`,
			{ label: 'guildCreate' },
		);

		const { simpleContainer } = helpers.discord;
		const channel = getWelcomeChannel(guild);

		if (channel) {
			try {
				const fakeInteraction = {
					client: bot.client,
					guild: guild,
					user: bot.client.user,
				};
				const msg = await t(
					fakeInteraction,
					'core.events.guildCreate.events.guild.create.min.members',
					{ bot: bot.client.user.username, threshold: minMembers },
				);
				const components = await simpleContainer(fakeInteraction, msg, {
					color: 'Red',
				});
				await channel.send({
					components,
					flags: MessageFlags.IsComponentsV2,
					allowedMentions: {
						parse: [],
					},
				});
			} catch (_e) {}
		}

		await guild.leave();
		return;
	}

	let ownerName = 'Unknown';
	try {
		let owner = guild.members?.cache?.get(guild.ownerId);
		if (!owner && typeof guild.fetchOwner === 'function') {
			owner = await guild.fetchOwner();
		}
		if (owner?.user?.username) {
			ownerName = owner.user.username;
		}
	} catch (_e) {}

	const inviteUrl = await getInviteLink(guild);
	const inviteText = inviteUrl
		? inviteUrl
		: await t(guild, 'core.events.guildCreate.events.guild.create.no.invite');

	const webhookUrl = kythiaConfig.api.webhookGuildInviteLeave;
	if (webhookUrl) {
		try {
			const accentColor = convertColor(kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			});

			const inviteContainer = new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(
							guild,
							'core.events.guildCreate.events.guild.create.webhook.desc',
							{
								bot: guild.client.user.username,
								guild: guild.name,
								guildId: guild.id,
								ownerId: guild.ownerId,
								ownerName: ownerName,
								memberCount: guild.memberCount ?? '?',
								invite: inviteText,
								createdAt: guild.createdAt.toLocaleDateString('en-US', {
									year: 'numeric',
									month: 'long',
									day: 'numeric',
								}),
							},
						),
					),
				);

			const url = new URL(webhookUrl);
			url.searchParams.append('wait', 'true');
			url.searchParams.append('with_components', 'true');

			const payload = {
				flags: MessageFlags.IsComponentsV2,
				components: [inviteContainer.toJSON()],
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
				`Failed to send guild create webhook: ${err.message || err}`,
				{
					label: 'guildCreate:webhook',
				},
			);
			if (bot.config?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}

	const channel = getWelcomeChannel(guild);
	if (channel) {
		try {
			const fakeInteraction = {
				client: bot.client,
				guild: guild,
				user: bot.client.user,
			};
			const accentColor = convertColor(kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			});

			const welcomeContainer = new ContainerBuilder()
				.setAccentColor(accentColor)

				.addMediaGalleryComponents(
					new MediaGalleryBuilder().addItems([
						new MediaGalleryItemBuilder().setURL(
							kythiaConfig.settings.bannerImage,
						),
					]),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)

				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(
							guild,
							'core.events.guildCreate.events.guild.create.welcome.desc',
							{
								bot: guild.client.user.username,
							},
						),
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
							.setLabel('Official Web')
							.setStyle(ButtonStyle.Link)
							.setURL(kythiaConfig.settings.kythiaWeb)
							.setEmoji('🌸'),
						new ButtonBuilder()
							.setLabel('Support server')
							.setStyle(ButtonStyle.Link)
							.setURL(kythiaConfig.settings.supportServer)
							.setEmoji('🎂'),
						new ButtonBuilder()
							.setLabel('Contact Owner')
							.setStyle(ButtonStyle.Link)
							.setURL(kythiaConfig.settings.ownerWeb)
							.setEmoji('❄️'),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)

				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(fakeInteraction, 'common.container.footer', {
							username: bot.client.user.username,
						}),
					),
				);

			await channel.send({
				components: [welcomeContainer],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		} catch (_e) {
			try {
				await channel.send(
					await t(
						guild,
						'core.events.guildCreate.events.guild.create.welcome.fallback',
						{
							bot: guild.client.user.username,
						},
					),
				);
			} catch (fallbackError) {
				logger.error(
					`Failed to send welcome message & fallback: ${fallbackError.message}`,
					{ label: 'guildCreate:fallback' },
				);
				if (bot.config?.sentry?.dsn) {
					Sentry.captureException(fallbackError);
				}
			}
		}
	}

	// ─── Bot Growth Snapshot ─────────────────────────────────────────────────
	try {
		if (BotGrowthSnapshot) {
			await BotGrowthSnapshot.create({
				guildId: guild.id,
				guildName: guild.name ?? null,
				memberCount: guild.memberCount ?? 0,
				event: 'join',
				totalGuilds: bot.client.guilds.cache.size,
			});
		}
	} catch (snapErr) {
		logger.error(`Failed to record bot growth snapshot: ${snapErr.message}`, {
			label: 'guildCreate:growth',
		});
	}
};
