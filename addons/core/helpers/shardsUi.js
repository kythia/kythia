/**
 * @namespace: addons/core/helpers/shardsUi.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const SHARDS_PER_PAGE = 10;
async function generateShardsContainer(
	interaction,
	page,
	shardList,
	totalShards,
	navDisabled = false,
) {
	const { t, helpers } = interaction.client.container;
	const { createPaginationContainer } = helpers.discord;
	const totalPages = Math.max(1, Math.ceil(totalShards / SHARDS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));
	const startIndex = (page - 1) * SHARDS_PER_PAGE;
	const pageShards = shardList.slice(startIndex, startIndex + SHARDS_PER_PAGE);
	let contentText = '';
	if (pageShards.length === 0) {
		contentText = await t(
			interaction,
			'core.helpers.shardsUi.utils.kyth.shards.empty',
		);
	} else {
		const entries = await Promise.all(
			pageShards.map(async (shard) => {
				let shardRss = shard.rss;
				if (shardRss) {
					shardRss = `${(shardRss / 1024 / 1024).toFixed(2)} MB`;
				} else {
					shardRss = 'N/A';
				}
				return await t(
					interaction,
					'core.helpers.shardsUi.utils.kyth.shards.entry',
					{
						id: shard.id,
						uptime: `<t:${Math.floor((Date.now() - shard.uptime) / 1000)}:R>`,
						users: shard.users,
						guilds: shard.guilds,
						shardRss,
					},
				);
			}),
		);
		contentText = entries.join('\n\n');
	}

	// Calculate and append Telemetry & Memory info on the first page or every page (to keep it visible)
	// We'll append it at the end of contentText
	if (shardList.length > 0 && page === 1) {
		let totalRss = 0;
		const telemetryData = [];
		for (const shard of shardList) {
			if (shard.rss) {
				totalRss += shard.rss;
			}
			if (shard.telemetry) {
				for (const item of shard.telemetry) {
					const existing = telemetryData.find((t) => t.key === item.key);
					if (existing) {
						existing.items += item.items;
					} else {
						telemetryData.push({
							...item,
						});
					}
				}
			}
		}
		telemetryData.sort((a, b) => b.items - a.items);
		const telemetryOutput =
			telemetryData.length > 0
				? (
						await Promise.all(
							telemetryData.map(
								async (tItem) =>
									await t(
										interaction,
										'core.helpers.shardsUi.utils.kyth.shards.telemetry_entry',
										{
											key: tItem.key,
											items: tItem.items,
										},
									),
							),
						)
					).join('\n')
				: await t(
						interaction,
						'core.helpers.shardsUi.utils.kyth.shards.telemetry_empty',
					);
		const memoryInfo = await t(
			interaction,
			'core.helpers.shardsUi.utils.kyth.shards.memory_telemetry',
			{
				totalRss: (totalRss / 1024 / 1024).toFixed(2),
				telemetry: telemetryOutput,
			},
		);
		contentText += `\n${memoryInfo}`;
	}
	const [containerStr] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		title: await t(
			interaction,
			'core.helpers.shardsUi.utils.kyth.shards.title',
		),
		content: contentText,
		footer: await t(
			interaction,
			'core.helpers.shardsUi.utils.kyth.shards.footer',
			{
				page,
				totalPages,
				totalShards,
			},
		),
		customIdPrefix: 'kyth_shards',
		navDisabled,
	});
	return {
		containerStr,
		page,
		totalPages,
	};
}
module.exports = {
	generateShardsContainer,
};
