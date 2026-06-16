/**
 * @namespace: addons/core/commands/utils/kyth/debug.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, AttachmentBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class DebugCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('debug-cache')
			.setDescription(
				'🛠️ [DEV] Run comprehensive diagnostic tests on all KythiaModel caching methods.',
			);

	async execute(interaction) {
		const container = this.container;
		const { logger, models, helpers } = container;
		const { simpleContainer } = helpers.discord;
		const Playlist = models.Playlist;
		const PlaylistTrack = models.PlaylistTrack;

		if (!Playlist || !PlaylistTrack) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					'❌ Model `Playlist` atau `PlaylistTrack` tidak ditemukan di container.',
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const logs = [];
		const addLog = (icon, msg) => {
			const time = new Date().toISOString().split('T')[1].slice(0, 8);
			logs.push(`\`[${time}]\` ${icon} ${msg}`);
		};

		const userId = interaction.user.id;
		const testName = `DEBUG_CACHE_TEST_${Date.now()}`;
		let step = 1;
		let playlistId = null;

		const t = async (fn) => {
			const start = Date.now();
			const res = await fn();
			return { res, time: Date.now() - start };
		};

		try {
			const isRedis = Playlist.isRedisConnected;
			const isShard = Playlist.isShardMode;

			addLog('🤖', `**Kythia Cache Diagnostic (Complete Suite)**`);
			addLog('🔌', `Driver: **${isRedis ? 'Redis 🔴' : 'In-Memory 🧠'}**`);
			addLog(
				'⚖️',
				`Shard Mode: **${isShard ? 'ON (Strict)' : 'OFF (Hybrid)'}**`,
			);
			addLog('📦', `Cache Version: \`${Playlist.CACHE_VERSION}\``);
			logs.push('-------------------------------------------');

			// --- 1. Base Setup ---
			const {
				res: [playlist, created],
				time: tInit,
			} = await t(() =>
				Playlist.findOrCreateCache({
					where: { userId, name: testName },
					defaults: {
						userId,
						name: testName,
						shareCode: `DBG-${Date.now()}`,
					},
				}),
			);
			playlistId = playlist.id;

			addLog(
				'✅',
				`**Step ${step++}: Base Setup (findOrCreateCache)** -> ${tInit}ms`,
			);
			addLog('├─', `Playlist ID: \`${playlistId}\` | Created: ${created}`);

			const { time: tBulk } = await t(() =>
				PlaylistTrack.bulkCreate([
					{
						playlistId,
						title: 'Track 1',
						identifier: 'ID1',
						author: 'Author 1',
						length: 100n,
						uri: 'url1',
					},
					{
						playlistId,
						title: 'Track 2',
						identifier: 'ID2',
						author: 'Author 2',
						length: 200n,
						uri: 'url2',
					},
					{
						playlistId,
						title: 'Track 3',
						identifier: 'ID3',
						author: 'Author 3',
						length: 300n,
						uri: 'url3',
					},
				]),
			);
			addLog('├─', `Added 3 Tracks via bulkCreate -> ${tBulk}ms`);

			await Playlist.clearCache({ where: { id: playlistId } });
			addLog('🧹', `**Step ${step++}: clearCache** (Force DB Hit next)`);

			// --- 2. Single Record Read ---
			const { res: coldResult, time: tCold } = await t(() =>
				Playlist.getCache({
					where: { id: playlistId },
					include: [{ model: PlaylistTrack, as: 'tracks' }],
				}),
			);
			addLog('🧊', `**Step ${step++}: getCache (COLD)** -> ${tCold}ms`);
			if (!coldResult?.tracks)
				throw new Error('Cold fetch or associations failed!');

			const { res: warmResult, time: tWarm } = await t(() =>
				Playlist.getCache({
					where: { id: playlistId },
					include: ['tracks'],
				}),
			);
			addLog(
				tWarm < 20 ? '🚀' : '⚠️',
				`**Step ${step++}: getCache (WARM)** -> ${tWarm}ms`,
			);
			if (!(warmResult instanceof Playlist))
				logs.push(`⚠️ **WARNING:** Hasil cache bukan instance Sequelize.`);

			const { time: tRefresh } = await t(() =>
				Playlist.refreshCache({ id: playlistId }),
			);
			addLog('🔄', `**Step ${step++}: refreshCache** -> ${tRefresh}ms`);

			// --- 3. Multi Record Read ---
			const { res: allTracks, time: tAll } = await t(() =>
				PlaylistTrack.getAllCache({ where: { playlistId } }),
			);
			addLog(
				'📚',
				`**Step ${step++}: getAllCache** -> ${tAll}ms (Found ${allTracks.length})`,
			);

			if (allTracks.length > 0) {
				const trackIds = allTracks.map((track) => track.id);
				const { res: bulkTracks, time: tBulkGet } = await t(() =>
					PlaylistTrack.bulkGetCache(trackIds),
				);
				addLog(
					'📦',
					`**Step ${step++}: bulkGetCache** -> ${tBulkGet}ms (Found ${bulkTracks.length})`,
				);
			} else {
				addLog('📦', `**Step ${step++}: bulkGetCache** -> Skipped (No tracks)`);
			}

			// --- 4. Pagination & Stats ---
			const { res: paginated, time: tPaginate } = await t(() =>
				PlaylistTrack.paginateCache({
					where: { playlistId },
					page: 1,
					pageSize: 2,
				}),
			);
			addLog('📄', `**Step ${step++}: paginateCache** -> ${tPaginate}ms`);
			addLog(
				'├─',
				`Page 1/2: Rows ${paginated.rows.length}, Total ${paginated.count}, Pages ${paginated.totalPages}`,
			);

			const { res: count, time: tCount } = await t(() =>
				PlaylistTrack.countCache({ where: { playlistId } }),
			);
			addLog(
				'🔢',
				`**Step ${step++}: countCache** -> ${tCount}ms (Count: ${count})`,
			);

			const { res: exists, time: tExists } = await t(() =>
				Playlist.existsCache({ id: playlistId }),
			);
			addLog(
				'❓',
				`**Step ${step++}: existsCache** -> ${tExists}ms (Exists: ${exists})`,
			);

			// --- 5. Find-or-Create Variations ---
			const {
				res: [_gocInst, gocCreated],
				time: tGoc,
			} = await t(() =>
				Playlist.getOrCreateCache(
					{ id: playlistId },
					{ name: 'Fallback Name' },
				),
			);
			addLog(
				'🔍',
				`**Step ${step++}: getOrCreateCache** -> ${tGoc}ms (Created: ${gocCreated})`,
			);

			const {
				res: [_focInst, focCreated],
				time: tFoc,
			} = await t(() =>
				Playlist.firstOrCreateCache(
					{ id: playlistId },
					{ name: 'Fallback Name 2' },
				),
			);
			addLog(
				'🔍',
				`**Step ${step++}: firstOrCreateCache** -> ${tFoc}ms (Created: ${focCreated})`,
			);

			const {
				res: [_fouInst, fouCreated],
				time: tFou,
			} = await t(() =>
				Playlist.firstOrUpdateCache(
					{ id: playlistId },
					{ name: `${testName} [UPDATED 1]` },
				),
			);
			addLog(
				'✏️',
				`**Step ${step++}: firstOrUpdateCache** -> ${tFou}ms (Created: ${fouCreated})`,
			);

			const {
				res: [_uocInst, uocCreated],
				time: tUoc,
			} = await t(() =>
				Playlist.updateOrCreateCache(
					{ id: playlistId },
					{ name: `${testName} [UPDATED 2]` },
				),
			);
			addLog(
				'✏️',
				`**Step ${step++}: updateOrCreateCache** -> ${tUoc}ms (Created: ${uocCreated})`,
			);

			// Validation of update
			const verifyUpdate = await Playlist.getCache({
				where: { id: playlistId },
			});
			addLog('🧐', `**Step ${step++}: Update Verification**`);
			if (verifyUpdate.name.includes('[UPDATED 2]')) {
				addLog(
					'✅',
					`Cache Consistency: **SYNCED** (Data updated properly in cache)`,
				);
			} else {
				addLog('❌', `Cache Consistency: **STALE** (Data in cache is old!)`);
			}

			// --- 6. Mutation & Cleanup ---
			if (allTracks.length > 0) {
				const trackToInc = allTracks[0];
				const oldLength = trackToInc.length;
				const { time: tInc } = await t(() =>
					PlaylistTrack.incrementCache({ id: trackToInc.id }, 'length', 10),
				);

				// Re-fetch to verify
				const incTrack = await PlaylistTrack.getCache({
					where: { id: trackToInc.id },
				});
				const newLength = incTrack ? incTrack.length : oldLength;
				addLog('📈', `**Step ${step++}: incrementCache** -> ${tInc}ms`);
				addLog('├─', `Old: ${oldLength} -> New: ${newLength}`);
			} else {
				addLog(
					'📈',
					`**Step ${step++}: incrementCache** -> Skipped (No tracks)`,
				);
			}

			const { res: delTracks, time: tDelT } = await t(() =>
				PlaylistTrack.destroyAndClearCache({ where: { playlistId } }),
			);
			addLog(
				'💥',
				`**Step ${step++}: destroyAndClearCache (Tracks)** -> ${tDelT}ms (Deleted: ${delTracks})`,
			);

			const { res: delPlaylist, time: tDelP } = await t(() =>
				Playlist.destroyAndClearCache({ where: { id: playlistId } }),
			);
			addLog(
				'💥',
				`**Step ${step++}: destroyAndClearCache (Playlist)** -> ${tDelP}ms (Deleted: ${delPlaylist})`,
			);

			// Ensure it's destroyed from cache too
			const checkDeleted = await Playlist.getCache({
				where: { id: playlistId },
			});
			if (!checkDeleted) {
				addLog(
					'✅',
					`**Step ${step++}: Negative Cache Verified** (Record accurately reported as missing)`,
				);
			} else {
				addLog(
					'❌',
					`**Step ${step++}: Negative Cache FAILED** (Record still exists in cache!)`,
				);
			}

			playlistId = null; // Prevent finally from running again

			const msg = await container.t(interaction, 'core.utils.kyth.debug', {
				logs: logs.join('\n'),
			});

			if (msg.length > 3500) {
				const attachment = new AttachmentBuilder(Buffer.from(logs.join('\n')), {
					name: 'cache-debug-logs.txt',
				});
				const components = await simpleContainer(
					interaction,
					`🛠️ Kythia Cache Debugger\nLogs are too long, see the attached file for full results.`,
				);
				return interaction.editReply({
					components,
					files: [attachment],
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const components = await simpleContainer(interaction, msg);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error: ${error.message || error}`, {
				label: 'core',
			});

			const errorMsg = `💥 CRITICAL FAILURE\n\n${logs.join('\n')}\n\n**ERROR at Step ${step}:**\n\`\`\`js\n${error.message}\n\`\`\``;

			if (errorMsg.length > 3500) {
				const attachment = new AttachmentBuilder(
					Buffer.from(`${logs.join('\n')}\n\nERROR: ${error.message}`),
					{ name: 'cache-debug-error.txt' },
				);
				const components = await simpleContainer(
					interaction,
					`💥 CRITICAL FAILURE\nLogs attached.`,
				);
				return interaction.editReply({
					components,
					files: [attachment],
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const components = await simpleContainer(interaction, errorMsg);
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} finally {
			if (playlistId) {
				await PlaylistTrack.destroy({ where: { playlistId } }).catch(() => {});
				await Playlist.destroy({ where: { id: playlistId } }).catch(() => {});
				if (Playlist.isRedisConnected) {
					await Playlist.clearCache({ where: { id: playlistId } }).catch(
						() => {},
					);
				}
			}
		}
	}
}

exports.default = DebugCommand;
