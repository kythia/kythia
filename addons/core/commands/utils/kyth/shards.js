/**
 * @namespace: addons/core/commands/utils/kyth/shards.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	SeparatorSpacingSize,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	ButtonBuilder,
	MessageFlags,
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

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('shards')
			.setDescription('🧩 List all bot shards and their info'),

	aliases: ['shards'],
	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t } = container;

		await interaction.deferReply();

		let shards = [];

		if (interaction.client.shard) {
			const results = await interaction.client.shard.broadcastEval((c) => ({
				id: c.shard.ids[0],
				guilds: c.guilds.cache.size,
				users: c.guilds.cache.reduce(
					(acc, guild) => acc + guild.memberCount,
					0,
				),
				uptime: c.uptime,
			}));
			shards = results;
		} else {
			shards = [
				{
					id: 0,
					guilds: interaction.client.guilds.cache.size,
					users: interaction.client.guilds.cache.reduce(
						(acc, guild) => acc + guild.memberCount,
						0,
					),
					uptime: interaction.client.uptime,
				},
			];
		}

		// Sort by ID ascending
		shards.sort((a, b) => a.id - b.id);

		const totalShards = shards.length;
		let currentPage = 1;

		if (totalShards === 0) {
			const { containerStr } = await generateShardsContainer(
				interaction,
				1,
				[],
				0,
				true,
			);
			return interaction.editReply({
				components: [containerStr],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: { parse: [] },
			});
		}

		const { containerStr: initContainer, totalPages: initPages } =
			await generateShardsContainer(
				interaction,
				currentPage,
				shards,
				totalShards,
			);

		const message = await interaction.editReply({
			components: [initContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
			allowedMentions: { parse: [] },
		});

		if (initPages <= 1) return;

		const collector = message.createMessageComponentCollector({ time: 300000 });

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: await t(i, 'common.pagination.not.your.interaction', {
						defaultValue: '❌ This interaction is not for you.',
					}),
					flags: MessageFlags.Ephemeral,
				});
			}

			if (i.customId === 'kyth_shards_first') {
				currentPage = 1;
			} else if (i.customId === 'kyth_shards_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'kyth_shards_next') {
				currentPage = Math.min(initPages, currentPage + 1);
			} else if (i.customId === 'kyth_shards_last') {
				currentPage = initPages;
			}

			const { containerStr: newContainer } = await generateShardsContainer(
				i,
				currentPage,
				shards,
				totalShards,
			);

			await i.update({
				components: [newContainer],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: { parse: [] },
			});
		});

		collector.on('end', async () => {
			try {
				const { containerStr: finalContainer } = await generateShardsContainer(
					interaction,
					currentPage,
					shards,
					totalShards,
					true,
				);

				await interaction.editReply({
					components: [finalContainer],
					flags: MessageFlags.IsComponentsV2,
					allowedMentions: { parse: [] },
				});
			} catch (_e) {}
		});
	},
};
