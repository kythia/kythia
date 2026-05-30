/**
 * @namespace: addons/core/commands/utils/kyth/servers.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	SeparatorSpacingSize,
	TextDisplayBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	ButtonBuilder,
	MessageFlags,
	ButtonStyle,
} = require('discord.js');

const GUILDS_PER_PAGE = 10;

async function buildNavButtons(
	interaction,
	page,
	totalPages,
	allDisabled = false,
) {
	const { t } = interaction.client.container;
	return [
		new ButtonBuilder()
			.setCustomId('kyth_servers_first')
			.setLabel(await t(interaction, 'common.pagination.first'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('kyth_servers_prev')
			.setLabel(await t(interaction, 'common.pagination.prev'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('kyth_servers_next')
			.setLabel(await t(interaction, 'common.pagination.next'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('kyth_servers_last')
			.setLabel(await t(interaction, 'common.pagination.last'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

async function generateServersContainer(
	interaction,
	page,
	guildList,
	totalGuilds,
	navDisabled = false,
) {
	const { t, kythiaConfig, helpers } = interaction.client.container;
	const { convertColor } = helpers.color;

	const totalPages = Math.max(1, Math.ceil(totalGuilds / GUILDS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * GUILDS_PER_PAGE;
	const pageGuilds = guildList.slice(startIndex, startIndex + GUILDS_PER_PAGE);

	let contentText = '';
	if (pageGuilds.length === 0) {
		contentText = await t(interaction, 'core.utils.kyth.servers.empty');
	} else {
		const entries = await Promise.all(
			pageGuilds.map(async (guild, index) => {
				const rank = startIndex + index + 1;
				return await t(interaction, 'core.utils.kyth.servers.entry', {
					rank,
					name: guild.name,
					id: guild.id,
					members: guild.members,
				});
			}),
		);
		contentText = entries.join('\n');
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
			new TextDisplayBuilder().setContent(
				`## ${await t(interaction, 'core.utils.kyth.servers.title')}`,
			),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(contentText))
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'core.utils.kyth.servers.footer', {
					page,
					totalPages,
					totalServers: totalGuilds,
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
			.setName('servers')
			.setDescription('🌐 List all servers the bot is in'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t } = container;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		let guilds = [];

		if (interaction.client.shard) {
			const results = await interaction.client.shard.broadcastEval((c) =>
				c.guilds.cache.map((g) => ({
					id: g.id,
					name: g.name,
					members: g.memberCount,
				})),
			);
			guilds = results.flat();
		} else {
			guilds = interaction.client.guilds.cache.map((g) => ({
				id: g.id,
				name: g.name,
				members: g.memberCount,
			}));
		}

		// Sort by members descending
		guilds.sort((a, b) => b.members - a.members);

		const totalGuilds = guilds.length;
		let currentPage = 1;

		if (totalGuilds === 0) {
			const { containerStr } = await generateServersContainer(
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
			await generateServersContainer(
				interaction,
				currentPage,
				guilds,
				totalGuilds,
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
					content: await t(i, 'common.pagination.not.your.interaction'),
					flags: MessageFlags.Ephemeral,
				});
			}

			if (i.customId === 'kyth_servers_first') {
				currentPage = 1;
			} else if (i.customId === 'kyth_servers_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'kyth_servers_next') {
				currentPage = Math.min(initPages, currentPage + 1);
			} else if (i.customId === 'kyth_servers_last') {
				currentPage = initPages;
			}

			const { containerStr: newContainer } = await generateServersContainer(
				i,
				currentPage,
				guilds,
				totalGuilds,
			);

			await i.update({
				components: [newContainer],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: { parse: [] },
			});
		});

		collector.on('end', async () => {
			try {
				const { containerStr: finalContainer } = await generateServersContainer(
					interaction,
					currentPage,
					guilds,
					totalGuilds,
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
