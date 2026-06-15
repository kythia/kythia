const GUILDS_PER_PAGE = 10;

async function generateServersContainer(
	interaction,
	page,
	guildList,
	totalGuilds,
	navDisabled = false,
) {
	const { t, kythiaConfig, helpers } = interaction.client.container;
	const { createPaginationContainer } = helpers.discord;
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

	const [containerStr] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		title: `## ${await t(interaction, 'core.utils.kyth.servers.title')}`,
		content: contentText,
		footer: await t(interaction, 'core.utils.kyth.servers.footer', {
			page,
			totalPages,
			totalServers: totalGuilds,
		}),
		customIdPrefix: 'kyth_servers',
		navDisabled,
	});

	return { containerStr, page, totalPages };
}

module.exports = { generateServersContainer };
