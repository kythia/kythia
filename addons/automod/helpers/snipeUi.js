/**
 * @namespace: addons/automod/helpers/snipeUi.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

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

	const { t } = interaction.client.container;
	const content =
		(await t(interaction, 'automod.moderation.snipe.ui.author', {
			author: `<@${targetSnipe.authorId}>`,
			tag: targetSnipe.authorTag,
		})) +
		'\n' +
		(await t(interaction, 'automod.moderation.snipe.ui.sent', {
			time: `<t:${Math.floor(targetSnipe.timestamp / 1000)}:R>`,
		})) +
		'\n\n' +
		(targetSnipe.content ||
			(await t(interaction, 'automod.moderation.snipe.ui.no_content')));

	const media = targetSnipe.image ? [targetSnipe.image] : undefined;

	const [snipeContainer] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		content,
		media,
		footer: await t(interaction, 'automod.moderation.snipe.ui.footer', {
			page,
			totalPages,
		}),
		customIdPrefix: 'snipe',
		navDisabled,
	});

	return { snipeContainer, totalPages };
}

module.exports = {
	generateSnipeContainer,
};
