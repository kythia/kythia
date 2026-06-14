/**
 * @namespace: addons/server/commands/server/backup.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	AttachmentBuilder,
	ContainerBuilder,
	FileBuilder,
	MessageFlags,
	SeparatorBuilder,
	SeparatorSpacingSize,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class BackupCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('backup')
			.setDescription('Backup server structure to a JSON file sent to your DM');

	async execute(interaction) {
		const container = this.container;
		const { t, helpers, logger, kythiaConfig } = container;
		const { simpleContainer, chunkTextDisplay } = helpers.discord;
		const { convertColor } = helpers.color;
		const { guild } = interaction;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		let components = await simpleContainer(
			interaction,
			`${await t(interaction, 'server.server.backup.start')}`,
			{ color: 'Blurple' },
		);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});

		try {
			const [channels, roles, emojis, stickers, bans, webhooks] =
				await Promise.all([
					guild.channels.fetch(),
					guild.roles.fetch(),
					guild.emojis.fetch(),
					guild.stickers.fetch(),
					guild.bans.fetch().catch(() => null),
					guild.fetchWebhooks().catch(() => null),
				]);

			// Build role list sorted by position (highest first = created first on restore)
			const roleList = roles
				.filter((r) => r.name !== '@everyone')
				.sort((a, b) => b.position - a.position)
				.map((role) => ({
					id: role.id,
					name: role.name,
					color: role.hexColor,
					hoist: role.hoist,
					mentionable: role.mentionable,
					managed: role.managed,
					permissions: role.permissions.bitfield.toString(),
					position: role.position,
					icon: role.iconURL({ forceStatic: true }) ?? null,
					unicodeEmoji: role.unicodeEmoji ?? null,
				}));

			// Build channel list — categories first, then rest
			const channelList = [];
			const sortedChannels = [...channels.values()].sort(
				(a, b) => a.rawPosition - b.rawPosition,
			);

			for (const ch of sortedChannels) {
				const entry = {
					id: ch.id,
					name: ch.name,
					type: ch.type,
					rawPosition: ch.rawPosition,
					// Category parent
					parentId: ch.parentId ?? null,
					parentName: ch.parent?.name ?? null,
					// Text / Announcement
					topic: ch.topic ?? null,
					nsfw: ch.nsfw ?? false,
					rateLimitPerUser: ch.rateLimitPerUser ?? 0,
					defaultAutoArchiveDuration: ch.defaultAutoArchiveDuration ?? null,
					// Voice
					bitrate: ch.bitrate ?? null,
					userLimit: ch.userLimit ?? null,
					rtcRegion: ch.rtcRegion ?? null,
					videoQualityMode: ch.videoQualityMode ?? null,
					// Forum / Media
					defaultReactionEmoji: ch.defaultReactionEmoji ?? null,
					defaultThreadRateLimitPerUser:
						ch.defaultThreadRateLimitPerUser ?? null,
					availableTags: ch.availableTags ?? null,
					// Permission overwrites
					permissionOverwrites: ch.permissionOverwrites?.cache
						? [...ch.permissionOverwrites.cache.values()].map((po) => ({
								id: po.id,
								type: po.type === 0 ? 'role' : 'member',
								allow: po.allow.bitfield.toString(),
								deny: po.deny.bitfield.toString(),
							}))
						: [],
				};
				channelList.push(entry);
			}

			const backup = {
				metadata: {
					guildId: guild.id,
					guildName: guild.name,
					backupVersion: '2',
					createdAt: new Date().toISOString(),
					createdBy: interaction.user.id,
				},
				settings: {
					name: guild.name,
					description: guild.description ?? null,
					verificationLevel: guild.verificationLevel,
					explicitContentFilter: guild.explicitContentFilter,
					defaultMessageNotifications: guild.defaultMessageNotifications,
					nsfwLevel: guild.nsfwLevel,
					preferredLocale: guild.preferredLocale,
					// Icons / splash
					iconURL: guild.iconURL({ forceStatic: true }) ?? null,
					bannerURL: guild.bannerURL({ forceStatic: true }) ?? null,
					splashURL: guild.splashURL({ forceStatic: true }) ?? null,
					discoverySplashURL:
						guild.discoverySplashURL({ forceStatic: true }) ?? null,
					// Special channels (stored as IDs for reference; restored if channel recreated)
					systemChannelId: guild.systemChannelId ?? null,
					systemChannelName: guild.systemChannel?.name ?? null,
					systemChannelFlags:
						guild.systemChannelFlags?.bitfield?.toString() ?? null,
					rulesChannelId: guild.rulesChannelId ?? null,
					rulesChannelName: guild.rulesChannel?.name ?? null,
					publicUpdatesChannelId: guild.publicUpdatesChannelId ?? null,
					publicUpdatesChannelName: guild.publicUpdatesChannel?.name ?? null,
					afkChannelId: guild.afkChannelId ?? null,
					afkChannelName: guild.afkChannel?.name ?? null,
					afkTimeout: guild.afkTimeout ?? null,
					// Boosts
					premiumProgressBarEnabled: guild.premiumProgressBarEnabled,
					// Features
					features: guild.features ?? [],
				},
				roles: roleList,
				channels: channelList,
				emojis: emojis.map((e) => ({
					id: e.id,
					name: e.name,
					animated: e.animated,
					url: e.imageURL(),
					roles: [...e.roles.cache.values()].map((r) => r.id),
					requireColons: e.requireColons,
					managed: e.managed,
				})),
				stickers: stickers.map((s) => ({
					id: s.id,
					name: s.name,
					description: s.description ?? null,
					tags: s.tags,
					format: s.format,
					url: s.url,
				})),
				bans: bans
					? [...bans.values()].map((ban) => ({
							userId: ban.user.id,
							reason: ban.reason ?? null,
						}))
					: [],
				webhooks: webhooks
					? [...webhooks.values()].map((wh) => ({
							name: wh.name,
							channelName: wh.channel?.name ?? null,
							avatarURL: wh.avatarURL() ?? null,
						}))
					: [],
			};

			const json = JSON.stringify(backup, null, 2);
			const buffer = Buffer.from(json, 'utf-8');

			if (buffer.length > 10 * 1024 * 1024) {
				components = await simpleContainer(
					interaction,
					`${await t(interaction, 'server.server.backup.too.large')}`,
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const filename = `backup-${guild.id}-${Date.now()}.json`;
			const accentColor = convertColor(kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			});
			const ts = Math.floor(Date.now() / 1000);

			const attachment = new AttachmentBuilder(buffer)
				.setName(filename)
				.setDescription(`Server backup for ${guild.name}`);

			const fileComponent = new FileBuilder()
				.setURL(`attachment://${filename}`)
				.setSpoiler(false);

			const titleLine = `## 📦 Server Backup — **${guild.name}**`;
			const metaLine = [
				`> **Guild ID:** \`${guild.id}\``,
				`> **Created:** <t:${ts}:F>`,
				`> **Requested by:** <@${interaction.user.id}>`,
				`> **Channels:** ${backup.channels.length} | **Roles:** ${backup.roles.length} | **Emojis:** ${backup.emojis.length} | **Stickers:** ${backup.stickers.length}`,
			].join('\n');
			const footerLine = `*Use \`/server restore\` to restore this backup. Keep this file safe!*`;

			const v2Components = [
				new ContainerBuilder()
					.setAccentColor(accentColor)
					.addTextDisplayComponents(...chunkTextDisplay(titleLine))
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(...chunkTextDisplay(metaLine))
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(false),
					)
					.addFileComponents(fileComponent)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(...chunkTextDisplay(footerLine)),
			];

			// Send to DM
			try {
				await interaction.user.send({
					components: v2Components,
					files: [attachment],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (dmErr) {
				logger.warn(
					`Could not DM backup to user ${interaction.user.id}: ${dmErr.message}`,
					{
						label: 'server:backup',
					},
				);
				// DM failed, fallback: attach directly in channel reply
				const failMsg = await t(interaction, 'server.server.backup.dm.failed');
				return interaction.editReply({
					components: [
						new ContainerBuilder()
							.setAccentColor(
								convertColor('Orange', { from: 'named', to: 'decimal' }) ??
									0xffa500,
							)
							.addTextDisplayComponents(...chunkTextDisplay(failMsg))
							.addSeparatorComponents(
								new SeparatorBuilder()
									.setSpacing(SeparatorSpacingSize.Small)
									.setDivider(false),
							)
							.addFileComponents(fileComponent),
					],
					files: [attachment],
					flags: MessageFlags.IsComponentsV2,
				});
			}

			components = await simpleContainer(
				interaction,
				`${await t(interaction, 'server.server.backup.success', { name: guild.name })}`,
				{ color: 'Green' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (err) {
			logger.error(`Server backup error: ${err.message || err}`, {
				label: 'server:backup',
			});
			components = await simpleContainer(
				interaction,
				`${await t(interaction, 'server.server.backup.failed')}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = BackupCommand;
