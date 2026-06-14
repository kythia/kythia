/**
 * @namespace: addons/server/commands/server/restore.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { ChannelType, MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
const restoreHelper = require('../../helpers/restore');

class RestoreCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('restore')
			.setDescription('Restore server structure from a JSON backup file')
			.addAttachmentOption((option) =>
				option
					.setName('file')
					.setDescription('Server backup file (.json)')
					.setRequired(true),
			)
			.addBooleanOption((option) =>
				option
					.setName('clear')
					.setDescription('Delete all channels & roles first?')
					.setRequired(false),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, logger, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { guild } = interaction;
		await interaction.deferReply();
		let components = await simpleContainer(
			interaction,
			`## ${await t(interaction, 'server.server.restore.progress.start')}`,
			{
				color: kythiaConfig.bot.color,
			},
		);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
		const file = interaction.options.getAttachment('file');
		if (!file?.name.endsWith('.json')) {
			components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'server.server.restore.file.invalid')}`,
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const fetchAssetBuffer = async (url) => {
			if (!url) return null;
			try {
				const { default: fetch } = await import('node-fetch');
				const res = await fetch(url, {
					signal: AbortSignal.timeout(15000),
				});
				if (!res.ok) return null;
				return Buffer.from(await res.arrayBuffer());
			} catch {
				return null;
			}
		};
		const updateStatus = async (text) => {
			const comps = await simpleContainer(interaction, `## ${text}`, {
				color: kythiaConfig.bot.color,
			});
			await interaction
				.editReply({
					components: comps,
					flags: MessageFlags.IsComponentsV2,
				})
				.catch(() => {});
		};
		try {
			const { default: fetch } = await import('node-fetch');
			const res = await fetch(file.url);
			const backup = await res.json();
			const clearBefore = interaction.options.getBoolean('clear') ?? false;
			if (!backup?.metadata) {
				components = await simpleContainer(
					interaction,
					`## ${await t(interaction, 'server.server.restore.data.invalid')}`,
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// ─────────────────────────── CLEAR ───────────────────────────
			if (clearBefore) {
				await updateStatus(
					await t(interaction, 'server.server.restore.clearing'),
				);

				// Delete channels
				const channelsToDelete = [...guild.channels.cache.values()];
				for (const c of channelsToDelete) {
					await c.delete('Restore: clearing before restore').catch(() => {});
				}

				// Delete editable roles (not managed/bot roles)
				const rolesToDelete = [...guild.roles.cache.values()].filter(
					(r) => r.editable && r.name !== '@everyone' && !r.managed,
				);
				for (const r of rolesToDelete) {
					await r.delete('Restore: clearing before restore').catch(() => {});
				}

				// Delete emojis
				for (const e of [...guild.emojis.cache.values()]) {
					await e.delete('Restore: clearing before restore').catch(() => {});
				}

				// Delete stickers
				const existingStickers = await guild.stickers.fetch().catch(() => null);
				if (existingStickers) {
					for (const s of [...existingStickers.values()]) {
						await s.delete('Restore: clearing before restore').catch(() => {});
					}
				}
			}

			// ────────────────────────── SETTINGS ─────────────────────────
			await updateStatus(
				await t(interaction, 'server.server.restore.settings'),
			);
			const settings = backup.settings;
			const iconBuffer = await fetchAssetBuffer(settings.iconURL);
			const bannerBuffer = await fetchAssetBuffer(settings.bannerURL);
			const splashBuffer = await fetchAssetBuffer(settings.splashURL);
			await guild
				.edit({
					name: settings.name,
					verificationLevel: settings.verificationLevel,
					explicitContentFilter: settings.explicitContentFilter,
					defaultMessageNotifications: settings.defaultMessageNotifications,
					preferredLocale: settings.preferredLocale,
					...(iconBuffer && {
						icon: iconBuffer,
					}),
					...(bannerBuffer && {
						banner: bannerBuffer,
					}),
					...(splashBuffer && {
						splash: splashBuffer,
					}),
					afkTimeout: settings.afkTimeout,
					premiumProgressBarEnabled: settings.premiumProgressBarEnabled,
					description: settings.description ?? null,
				})
				.catch((e) =>
					logger.warn(`Failed to update server settings: ${e.message}`, {
						label: 'restore',
					}),
				);

			// ─────────────────────────── ROLES ───────────────────────────
			await updateStatus(
				await t(interaction, 'server.server.restore.roles.text'),
			);

			// roleMap: oldId → new Role
			const roleMap = new Map();
			const roleList = (backup.roles ?? []).slice().reverse(); // lowest position first

			let roleIdx = 0;
			for (const roleData of roleList) {
				// Skip managed/integrated roles (bots etc.)
				if (roleData.managed) {
					roleIdx++;
					continue;
				}

				// Try to download role icon
				const roleIconBuffer = await fetchAssetBuffer(roleData.icon);
				const created = await guild.roles
					.create({
						name: roleData.name,
						color: roleData.color,
						hoist: roleData.hoist,
						permissions: BigInt(roleData.permissions),
						mentionable: roleData.mentionable,
						reason: 'Restore backup',
						...(roleIconBuffer && {
							icon: roleIconBuffer,
						}),
						...(roleData.unicodeEmoji &&
							!roleIconBuffer && {
								unicodeEmoji: roleData.unicodeEmoji,
							}),
					})
					.catch(() => null);
				if (created) roleMap.set(roleData.id, created);
				roleIdx++;
				if (roleIdx % 5 === 0 || roleIdx === roleList.length) {
					await updateStatus(
						await t(interaction, 'server.server.restore.roles.progress', {
							current: roleIdx,
							total: roleList.length,
						}),
					);
				}
			}

			// ────────────────────────── CHANNELS ─────────────────────────
			await updateStatus(
				await t(interaction, 'server.server.restore.channels.text'),
			);

			// channelMap: oldId → new Channel
			const channelMap = new Map();

			// Pass 1: Create categories
			const categories = (backup.channels ?? []).filter(
				(c) => c.type === ChannelType.GuildCategory,
			);
			let catIdx = 0;
			for (const catData of categories) {
				const permOverwrites = restoreHelper.buildPermOverwrites(
					catData.permissionOverwrites,
					roleMap,
				);
				const created = await guild.channels
					.create({
						name: catData.name,
						type: ChannelType.GuildCategory,
						position: catData.rawPosition ?? catData.position,
						permissionOverwrites: permOverwrites,
					})
					.catch(() => null);
				if (created) channelMap.set(catData.id, created);
				catIdx++;
				if (catIdx % 3 === 0 || catIdx === categories.length) {
					await updateStatus(
						await t(interaction, 'server.server.restore.categories.progress', {
							current: catIdx,
							total: categories.length,
						}),
					);
				}
			}

			// Pass 2: Create non-category channels
			const nonCatChannels = (backup.channels ?? []).filter(
				(c) => c.type !== ChannelType.GuildCategory,
			);
			let chIdx = 0;
			for (const chanData of nonCatChannels) {
				// Resolve parent category
				const parentChannel = chanData.parentId
					? channelMap.get(chanData.parentId)
					: null;
				const permOverwrites = restoreHelper.buildPermOverwrites(
					chanData.permissionOverwrites,
					roleMap,
				);
				const createOptions = {
					name: chanData.name,
					type: chanData.type,
					position: chanData.rawPosition ?? chanData.position,
					parent: parentChannel?.id ?? null,
					permissionOverwrites: permOverwrites,
				};

				// Text-like channels
				if (
					chanData.type === ChannelType.GuildText ||
					chanData.type === ChannelType.GuildAnnouncement
				) {
					createOptions.topic = chanData.topic;
					createOptions.nsfw = chanData.nsfw;
					createOptions.rateLimitPerUser = chanData.rateLimitPerUser;
					createOptions.defaultAutoArchiveDuration =
						chanData.defaultAutoArchiveDuration;
				}

				// Voice channels
				if (
					chanData.type === ChannelType.GuildVoice ||
					chanData.type === ChannelType.GuildStageVoice
				) {
					createOptions.bitrate = chanData.bitrate;
					createOptions.userLimit = chanData.userLimit;
					createOptions.rtcRegion = chanData.rtcRegion;
					createOptions.videoQualityMode = chanData.videoQualityMode;
				}

				// Forum / Media channels
				if (
					chanData.type === ChannelType.GuildForum ||
					chanData.type === ChannelType.GuildMedia
				) {
					createOptions.rateLimitPerUser = chanData.rateLimitPerUser;
					createOptions.defaultThreadRateLimitPerUser =
						chanData.defaultThreadRateLimitPerUser;
					if (chanData.availableTags?.length) {
						createOptions.availableTags = chanData.availableTags.map((tag) => ({
							name: tag.name,
							moderated: tag.moderated,
							emoji: tag.emoji ?? null,
						}));
					}
				}
				const created = await guild.channels
					.create(createOptions)
					.catch(() => null);
				if (created) channelMap.set(chanData.id, created);
				chIdx++;
				if (chIdx % 5 === 0 || chIdx === nonCatChannels.length) {
					await updateStatus(
						await t(interaction, 'server.server.restore.channels.progress', {
							current: chIdx,
							total: nonCatChannels.length,
						}),
					);
				}
			}

			// Restore special channels on the guild after channels are created
			await restoreHelper.restoreSpecialChannels(
				guild,
				backup.settings,
				channelMap,
				logger,
			);

			// ──────────────────────────── EMOJIS & STICKERS ──────────────────────────
			await updateStatus(await t(interaction, 'server.server.restore.assets'));
			for (const emoji of backup.emojis ?? []) {
				const buffer = await fetchAssetBuffer(emoji.url);
				if (!buffer) continue;
				await guild.emojis
					.create({
						name: emoji.name,
						attachment: buffer,
					})
					.catch((e) =>
						logger.warn(`Failed to restore emoji ${emoji.name}: ${e.message}`, {
							label: 'restore',
						}),
					);
			}
			for (const sticker of backup.stickers ?? []) {
				const buffer = await fetchAssetBuffer(sticker.url);
				if (!buffer) continue;
				await guild.stickers
					.create({
						name: sticker.name,
						description: sticker.description ?? sticker.name,
						tags: sticker.tags?.split(',')[0]?.trim() || sticker.name,
						file: buffer,
					})
					.catch((e) =>
						logger.warn(
							`Failed to restore sticker ${sticker.name}: ${e.message}`,
							{
								label: 'restore',
							},
						),
					);
			}

			// ─────────────────────────── DONE ─────────────────────────
			components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'server.server.restore.success', {
					name: backup.metadata.guildName,
				})}`,
				{
					color: 'Green',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (err) {
			logger.error(`Restore error: ${err.message || err}`, {
				label: 'server:restore',
			});
			components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'server.server.restore.failed')}`,
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = RestoreCommand;
