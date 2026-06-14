const {
	ButtonStyle,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
} = require('discord.js');

const SNIPES_PER_PAGE = 1;

function buildNavButtons(page, totalPages, allDisabled = false) {
	return [
		new ButtonBuilder()
			.setCustomId('snipe_first')
			.setLabel('First')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('snipe_prev')
			.setLabel('Prev')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('snipe_next')
			.setLabel('Next')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('snipe_last')
			.setLabel('Last')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

function generateSnipeContainer(
	interaction,
	page,
	snipes,
	totalSnipes,
	navDisabled = false,
) {
	const { kythiaConfig, helpers } = interaction.client.container;
	const { convertColor } = helpers.color;

	const totalPages = Math.max(1, Math.ceil(totalSnipes / SNIPES_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const targetSnipe = snipes[page - 1];

	const mainContainer = new ContainerBuilder().setAccentColor(
		convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
	);

	mainContainer.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			`**Author:** <@${targetSnipe.authorId}> (${targetSnipe.authorTag})\n` +
				`**Sent:** <t:${Math.floor(targetSnipe.timestamp / 1000)}:R>\n\n` +
				(targetSnipe.content || '*(No text content)*'),
		),
	);

	if (targetSnipe.image) {
		mainContainer.addMediaGalleryComponents(
			new MediaGalleryBuilder().addItems([
				new MediaGalleryItemBuilder().setURL(targetSnipe.image),
			]),
		);
	}

	mainContainer.addSeparatorComponents(
		new SeparatorBuilder()
			.setSpacing(SeparatorSpacingSize.Small)
			.setDivider(true),
	);
	mainContainer.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(`- Snipe ${page} of ${totalPages}`),
	);

	if (totalPages > 1) {
		const navButtons = buildNavButtons(page, totalPages, navDisabled);
		mainContainer.addActionRowComponents(
			new ActionRowBuilder().addComponents(...navButtons),
		);
	}

	return { snipeContainer: mainContainer, totalPages };
}

module.exports = {
	buildNavButtons,
	generateSnipeContainer,
};
