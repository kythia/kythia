const CHANNELS_PER_PAGE = 10;

async function generateAIListContainer(
	interaction,
	page,
	allChannelIds,
	totalChannels,
	navDisabled = false,
) {
	const { t, helpers } = interaction.client.container;
	const { createPaginationContainer } = helpers.discord;

	const totalPages = Math.max(1, Math.ceil(totalChannels / CHANNELS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * CHANNELS_PER_PAGE;
	const pageChannelIds = allChannelIds.slice(
		startIndex,
		startIndex + CHANNELS_PER_PAGE,
	);

	let listText = '';
	if (pageChannelIds.length === 0) {
		listText = await t(interaction, 'ai.ai.list.empty');
	} else {
		const entries = pageChannelIds.map((channelId, index) => {
			const globalIndex = startIndex + index + 1;
			return `${globalIndex}. <#${channelId}>`;
		});
		listText = entries.join('\n');
	}

	const [aiListContainer] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		title: await t(interaction, 'ai.ai.list.title'),
		content: listText,
		footer: await t(interaction, 'ai.ai.list.footer', {
			page,
			totalPages,
			totalChannels,
		}),
		customIdPrefix: 'ai_list',
		navDisabled,
	});

	return { aiListContainer, page, totalPages };
}

module.exports = {
	generateAIListContainer,
};
