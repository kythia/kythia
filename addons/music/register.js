/**
 * @namespace: addons/music/register.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const MusicHandlers = require('./helpers/handlers/MusicHandlers');
const MusicManager = require('./helpers/MusicManager');
const path = require('node:path');
const fs = require('node:fs');

module.exports = {
	async initialize(bot) {
		const container = bot.client.container;
		const { logger, helpers } = container;
		const { getChannelSafe } = helpers.discord;
		const summary = [];

		container.musicHandlers = new MusicHandlers(container);
		summary.push('   ╰┈➤ 🎵 Music Handlers Injected');

		container.music = new MusicManager(container);
		await container.music.init();

		summary.push('   ╰┈➤ 🎵 Initialize Music Manager');

		bot.addClientReadyHook(async ({ client }) => {
			logger.info(`Checking persistent 24/7 sessions...`, {
				label: '24 7 resurrector',
			});

			const Music247 = container.models.Music247;
			if (!Music247) {
				logger.warn(`Music247 model not found. Skipping.`, {
					label: '24 7 resurrector',
				});
				return;
			}

			const sessions = await Music247.getAllCache();
			if (sessions.length === 0) {
				logger.info(`No active sessions found.`, { label: '24 7 resurrector' });
				return;
			}

			const { ShardClientUtil } = require('discord.js');
			let restoredCount = 0;
			for (const session of sessions) {
				// If sharding is active, only process guilds that belong to this shard
				if (client.shard) {
					const expectedShardId = ShardClientUtil.shardIdForGuildId(
						session.guildId,
						client.shard.count,
					);
					if (!client.shard.ids.includes(expectedShardId)) continue;
				}

				try {
					const guild = await helpers.discord.getGuildSafe(
						client,
						session.guildId,
					);
					const voiceChannel = guild
						? await getChannelSafe(guild, session.voiceChannelId)
						: null;
					const textChannel = guild
						? await getChannelSafe(guild, session.textChannelId)
						: null;

					if (!guild || !voiceChannel || !textChannel) {
						throw new Error('Guild/Channel not found');
					}

					const player = client.poru.createConnection({
						guildId: guild.id,
						voiceChannel: voiceChannel.id,
						textChannel: textChannel.id,
						deaf: true,
					});

					player._247 = true;

					restoredCount++;
				} catch (e) {
					logger.warn(
						`Failed to restore ${session.guildId}: ${e.message}. Skipping...`,
						{ label: '24 7 resurrector' },
					);
				}
			}
			logger.info(
				`🎵 [24/7 Resurrector] Successfully restored ${restoredCount}/${sessions.length} sessions.`,
				{ label: 'music' },
			);
		});

		summary.push('   ╰┈➤ 🎵 24/7 Resurrector Hook is Active');

		const tempPath = path.join(__dirname, 'temp');
		if (!fs.existsSync(tempPath)) {
			fs.mkdirSync(tempPath, { recursive: true });
			summary.push('   ╰┈➤ 📁 Temp Folder Created');
		}

		return summary;
	},
};
