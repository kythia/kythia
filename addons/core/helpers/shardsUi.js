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
		contentText = await t(interaction, 'core.utils.kyth.shards.empty');
	} else {
		const entries = await Promise.all(
			pageShards.map(async (shard) => {
				return await t(interaction, 'core.utils.kyth.shards.entry', {
					id: shard.id,
					uptime: `<t:${Math.floor((Date.now() - shard.uptime) / 1000)}:R>`,
					users: shard.users,
					guilds: shard.guilds,
				});
			}),
		);
		contentText = entries.join('\n\n');
	}

	const [containerStr] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		title: await t(interaction, 'core.utils.kyth.shards.title'),
		content: contentText,
		footer: await t(interaction, 'core.utils.kyth.shards.footer', {
			page,
			totalPages,
			totalShards,
		}),
		customIdPrefix: 'kyth_shards',
		navDisabled,
	});

	return { containerStr, page, totalPages };
}

module.exports = { generateShardsContainer };
