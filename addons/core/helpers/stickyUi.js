const ITEMS_PER_PAGE = 10;

async function generateListContainer(
	interaction,
	page,
	stickies,
	accentColor,
	navDisabled = false,
) {
	const { t } = interaction.client.container;
	const { createPaginationContainer } =
		interaction.client.container.helpers.discord;
	const totalPages = Math.max(1, Math.ceil(stickies.length / ITEMS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * ITEMS_PER_PAGE;
	const pageItems = stickies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	let content = '';
	if (pageItems.length === 0) {
		content = await t(interaction, 'core.tools.sticky.list.empty');
	} else {
		const entries = await Promise.all(
			pageItems.map((sticky) =>
				t(interaction, 'core.tools.sticky.list.entry', {
					channelId: sticky.channelId,
				}),
			),
		);
		content = entries.join('');
	}

	const [listContainer] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		title: await t(interaction, 'core.tools.sticky.list.title'),
		content,
		footer: await t(interaction, 'core.tools.sticky.list.footer', {
			page,
			totalPages,
		}),
		customIdPrefix: 'sticky_list',
		color: accentColor,
		navDisabled,
	});

	return { listContainer, page, totalPages };
}

module.exports = {
	generateListContainer,
};
