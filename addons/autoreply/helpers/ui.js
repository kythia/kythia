const ITEMS_PER_PAGE = 10;

async function generateListContainer(
	interaction,
	page,
	replies,
	_accentColor,
	navDisabled = false,
) {
	const { t } = interaction.client.container;
	const { createPaginationContainer } =
		interaction.client.container.helpers.discord;
	const totalPages = Math.max(1, Math.ceil(replies.length / ITEMS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * ITEMS_PER_PAGE;
	const pageItems = replies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	let content = '';

	if (pageItems.length === 0) {
		content = await t(interaction, 'autoreply.list.empty');
	} else {
		const entries = await Promise.all(
			pageItems.map(async (reply) => {
				const containerTag = reply.useContainer
					? await t(interaction, 'autoreply.list.container_tag')
					: '';
				return t(interaction, 'autoreply.list.entry', {
					trigger: reply.trigger,
					container: containerTag,
				});
			}),
		);
		content = entries.join('');
	}

	const [listContainer] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		title: `## ${await t(interaction, 'autoreply.list.title', { page, totalPages })}`,
		content,
		footer: await t(interaction, 'autoreply.list.footer', {
			page,
			totalPages,
		}),
		customIdPrefix: 'autoreply_list',
		navDisabled,
	});

	return { listContainer, page, totalPages };
}

module.exports = {
	generateListContainer,
};
