/**
 * @namespace: addons/core/commands/utils/stats.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	version,
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SlashCommandBuilder,
	SeparatorSpacingSize,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
} = require('discord.js');
const os = require('node:os');
const { BaseCommand } = require('kythia-core');
const statsHelper = require('../../helpers/stats');

// Helpers extracted to addons/core/helpers/stats.js

class StatsCommand extends BaseCommand {
	aliases = ['s', '📊'];
	slashCommand = new SlashCommandBuilder()
		.setName('stats')
		.setDescription(`📊 Displays kythia statistics.`);
	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers, models, sequelize } = container;
		const { convertColor } = helpers.color;

		// Get any registered model subclass. Since static methods/properties
		// are inherited, we can just use the subclass directly as our KythiaModel proxy.
		const anyModelKey = models ? Object.keys(models)[0] : undefined;
		const KythiaModel = anyModelKey ? models[anyModelKey] : null;
		let cacheStatus = 'N/A';
		let cacheHits = 0;
		let cacheMisses = 0;
		if (KythiaModel && typeof KythiaModel.getGlobalCacheStats === 'function') {
			// ✅ Aggregate across ALL model subclasses in this shard.
			// Reading KythiaModel.cacheStats directly always returns 0 because
			// each subclass gets its own isolated cacheStats object in autoBoot().
			const sequelizeModels =
				sequelize?.models ??
				(KythiaModel
					? {
							[KythiaModel.name]: KythiaModel,
						}
					: {});
			const stats = KythiaModel.getGlobalCacheStats(sequelizeModels);
			cacheHits = (stats.redisHits || 0) + (stats.mapHits || 0);
			cacheMisses = stats.misses || 0;
			const urls = KythiaModel._redisFallbackURLs || [];
			const currentIndex = KythiaModel._redisCurrentIndex || 0;
			if (KythiaModel.isRedisConnected) {
				if (urls.length > 1) {
					const statusList = [];
					urls.forEach((_url, index) => {
						const name = `Kythia Redis #${index + 1}`;
						if (index === currentIndex) {
							statusList.push(`✅ **${name} (Active)**`);
						} else if (KythiaModel._redisFailedIndexes.has(index)) {
							statusList.push(`❌ ${name} (Failed)`);
						} else {
							statusList.push(`⚪ ${name} (Standby)`);
						}
					});
					cacheStatus = statusList.join('\n');
				} else {
					cacheStatus = '> `✅` **Kythia Redis (Online)**';
				}
			} else if (!KythiaModel.isShardMode) {
				cacheStatus = '> `⚠️` **In-Memory (Fallback)**';
			} else {
				cacheStatus = '> `❌` **DISABLED (Sharding)**';
			}
		}
		const { client } = interaction;
		const username = interaction.client.user.username;
		const uptime = container.shutdownManager?.getMasterUptime() ?? '0s';
		let totalMemory = process.memoryUsage().rss;
		let guilds = client.guilds.cache.size;
		let users = client.guilds.cache.reduce(
			(acc, guild) => acc + (guild.memberCount || 0),
			0,
		);
		let shardStatusSection = '';
		if (client.shard) {
			const shardInfo = await client.shard.broadcastEval((c) => {
				let localCacheStats = {
					redisHits: 0,
					mapHits: 0,
					misses: 0,
				};
				try {
					const sModels = c.container?.sequelize?.models ?? c.container?.models;
					const anyModelKey = sModels ? Object.keys(sModels)[0] : undefined;
					const modelCls = anyModelKey ? sModels[anyModelKey] : null;
					if (modelCls && typeof modelCls.getGlobalCacheStats === 'function') {
						localCacheStats = modelCls.getGlobalCacheStats(sModels);
					}
				} catch (_e) {}
				return {
					id: c.shard.ids[0],
					ping: Math.round(c.ws.ping),
					guilds: c.guilds.cache.size,
					members: c.guilds.cache.reduce(
						(acc, guild) => acc + (guild.memberCount || 0),
						0,
					),
					ram_usage: process.memoryUsage().rss,
					cacheStats: localCacheStats,
				};
			});
			guilds = shardInfo.reduce((acc, data) => acc + data.guilds, 0);
			users = shardInfo.reduce((acc, data) => acc + data.members, 0);
			totalMemory = shardInfo.reduce((acc, data) => acc + data.ram_usage, 0);
			const globalCacheStats = shardInfo.reduce(
				(acc, data) => {
					acc.redisHits += data.cacheStats?.redisHits || 0;
					acc.mapHits += data.cacheStats?.mapHits || 0;
					acc.misses += data.cacheStats?.misses || 0;
					return acc;
				},
				{
					redisHits: 0,
					mapHits: 0,
					misses: 0,
				},
			);
			cacheHits = globalCacheStats.redisHits + globalCacheStats.mapHits;
			cacheMisses = globalCacheStats.misses;
			const totalShards = shardInfo.length;
			const shardDetails = shardInfo
				.sort((a, b) => a.id - b.id)
				.map(
					(s) =>
						`> \`#${s.id}\` 🟢 **Operational** • 📶 ${s.ping < 0 ? 'N/A' : `${s.ping}ms`} • 🛡️ ${s.guilds} • 👥 ${s.members} • 💾 ${(s.ram_usage / 1024 / 1024).toFixed(2)}MB`,
				)
				.join('\n');
			shardStatusSection = `\n\n**Shards (${totalShards})**\n${shardDetails}`;
		} else {
			shardStatusSection = '\n\n**Shards**\n> `❌` **Sharding Disabled**';
		}
		const memory = (totalMemory / 1024 / 1024).toFixed(2);
		let runtimeDisplay;
		if (process.versions.bun) {
			runtimeDisplay = `**Bun:** \`${process.versions.bun}\``;
		} else if (process.versions.deno) {
			runtimeDisplay = `**Deno:** \`${process.versions.deno}\``;
		} else {
			runtimeDisplay = `**Node.js:** \`${process.version}\``;
		}
		const djs = version;
		const cpu = os.cpus()[0].model;
		const owner = `${kythiaConfig.owner.names} (${kythiaConfig.owner.ids})`;
		const kythiaVersion = kythiaConfig.version;
		const kythiaCoreVersion = statsHelper.getKythiaCoreVersion() || 'N/A';
		const githubCommit = statsHelper.getGitCommitId();
		const desc = await t(interaction, 'core.utils.stats.embed.desc', {
			username,
			uptime,
			memory,
			guilds,
			users,
			runtime: runtimeDisplay,
			djs,
			cpu,
			owner,
			kythiaVersion,
			kythiaCoreVersion,
			githubCommit: githubCommit || 'N/A',
			cacheStatus: cacheStatus,
			cacheHits: cacheHits,
			cacheMisses: cacheMisses,
		});

		// Append shard stats to the description
		const descWithShards = desc + shardStatusSection;
		const bannerUrl = kythiaConfig.settings.statsBannerImage;
		const mainContainer = new ContainerBuilder().setAccentColor(
			convertColor(kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			}),
		);
		if (bannerUrl) {
			mainContainer.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems([
					new MediaGalleryItemBuilder().setURL(bannerUrl),
				]),
			);
			mainContainer.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			);
		}
		mainContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(descWithShards),
		);
		mainContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);
		const footerText = await t(interaction, 'common.container.footer', {
			username: interaction.client.user.username,
		});
		mainContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`${footerText}`),
		);
		await interaction.reply({
			components: [mainContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = StatsCommand;
