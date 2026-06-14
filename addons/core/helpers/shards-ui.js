const {
	SeparatorSpacingSize,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');

const SHARDS_PER_PAGE = 10;

async function buildNavButtons(
	interaction,
	page,
	totalPages,
	allDisabled = false,
) {
	const { t } = interaction.client.container;
	return [
		new ButtonBuilder()
			.setCustomId('kyth_shards_first')
			.setLabel(
				await t(interaction, 'common.pagination.first', {
					defaultValue: 'First Page',
				}),
			)
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('kyth_shards_prev')
			.setLabel(
				await t(interaction, 'common.pagination.prev', {
					defaultValue: 'Previous Page',
				}),
			)
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('kyth_shards_next')
			.setLabel(
				await t(interaction, 'common.pagination.next', {
					defaultValue: 'Next Page',
				}),
			)
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('kyth_shards_last')
			.setLabel(
				await t(interaction, 'common.pagination.last', {
					defaultValue: 'Last Page',
				}),
			)
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

async function generateShardsContainer(
	interaction,
	page,
	shardList,
	totalShards,
	navDisabled = false,
) {
	const { t, kythiaConfig, helpers } = interaction.client.container;
	const { convertColor } = helpers.color;
	const { chunkTextDisplay } = helpers.discord;

	const totalPages = Math.max(1, Math.ceil(totalShards / SHARDS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * SHARDS_PER_PAGE;
	const pageShards = shardList.slice(startIndex, startIndex + SHARDS_PER_PAGE);

	let contentText = '';
	if (pageShards.length === 0) {
		contentText = await t(interaction, 'core.utils.kyth.shards.empty', {
			defaultValue: 'No shards found.',
		});
	} else {
		const entries = await Promise.all(
			pageShards.map(async (shard) => {
				const defaultText = `**Shard #${shard.id}**\n\`⏱️\` Uptime: <t:${Math.floor((Date.now() - shard.uptime) / 1000)}:R>\n\`👥\` Users: **${shard.users}** | \`🌐\` Guilds: **${shard.guilds}**`;

				return await t(interaction, 'core.utils.kyth.shards.entry', {
					id: shard.id,
					uptime: `<t:${Math.floor((Date.now() - shard.uptime) / 1000)}:R>`,
					users: shard.users,
					guilds: shard.guilds,
					defaultValue: defaultText,
				});
			}),
		);
		contentText = entries.join('\n\n');
	}

	const navButtons = await buildNavButtons(
		interaction,
		page,
		totalPages,
		navDisabled,
	);

	const containerStr = new ContainerBuilder()
		.setAccentColor(
			convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
		)
		.addTextDisplayComponents(
			...chunkTextDisplay(
				`## ${await t(interaction, 'core.utils.kyth.shards.title', { defaultValue: '🧩 Bot Shards' })}`,
			),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(...chunkTextDisplay(contentText))
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(
			...chunkTextDisplay(
				await t(interaction, 'core.utils.kyth.shards.footer', {
					page,
					totalPages,
					totalShards,
					defaultValue: `Page ${page} of ${totalPages} | Total Shards: ${totalShards}`,
				}),
			),
		)
		.addActionRowComponents(
			new ActionRowBuilder().addComponents(...navButtons),
		);

	return { containerStr, page, totalPages };
}

module.exports = { generateShardsContainer };
