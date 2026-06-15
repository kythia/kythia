const SNIPES_PER_PAGE = 1;

async function generateSnipeContainer(
	interaction,
	page,
	snipes,
	totalSnipes,
	navDisabled = false,
) {
	const { helpers } = interaction.client.container;
	const { createPaginationContainer } = helpers.discord;

	const totalPages = Math.max(1, Math.ceil(totalSnipes / SNIPES_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const targetSnipe = snipes[page - 1];

	const content =
		`**Author:** <@${targetSnipe.authorId}> (${targetSnipe.authorTag})\n` +
		`**Sent:** <t:${Math.floor(targetSnipe.timestamp / 1000)}:R>\n\n` +
		(targetSnipe.content || '*(No text content)*');

	const media = targetSnipe.image ? [targetSnipe.image] : undefined;

	const [snipeContainer] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		content,
		media,
		footer: `- Snipe ${page} of ${totalPages}`,
		customIdPrefix: 'snipe',
		navDisabled,
	});

	return { snipeContainer, totalPages };
}

module.exports = {
	generateSnipeContainer,
};
