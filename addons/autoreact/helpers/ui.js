const ITEMS_PER_PAGE = 10;

async function generateListContainer(
	interaction,
	page,
	reacts,
	accentColor,
	navDisabled = false,
) {
	const { t } = interaction.client.container;
	const { createPaginationContainer } =
		interaction.client.container.helpers.discord;
	const totalPages = Math.max(1, Math.ceil(reacts.length / ITEMS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * ITEMS_PER_PAGE;
	const pageItems = reacts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	let content = '';

	if (pageItems.length === 0) {
		content = await t(interaction, 'autoreact.list.empty');
	} else {
		const lines = [];
		for (const react of pageItems) {
			let triggerDisplay = react.trigger;
			if (react.type === 'channel') {
				triggerDisplay = `<#${react.trigger}>`;
			} else {
				triggerDisplay = `\`${react.trigger}\``;
			}

			// Format: 😲 | `#general` (channel)
			lines.push(`${react.emoji} | ${triggerDisplay} *(${react.type})*`);
		}
		content = lines.join('\n');
	}

	const [listContainer] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		title: await t(interaction, 'autoreact.list.title', { page, totalPages }),
		content,
		footer: await t(interaction, 'autoreact.list.footer', {
			page,
			totalPages,
		}),
		customIdPrefix: 'autoreact_list',
		color: accentColor,
		navDisabled,
	});

	return { listContainer, page, totalPages };
}

module.exports = {
	generateListContainer,
};
