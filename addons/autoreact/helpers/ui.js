const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');

const ITEMS_PER_PAGE = 10;

async function buildNavButtons(
	interaction,
	page,
	totalPages,
	allDisabled = false,
) {
	const { t } = interaction.client.container;

	return [
		new ButtonBuilder()
			.setCustomId('autoreact_list_first')
			.setLabel(await t(interaction, 'common.first'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('autoreact_list_prev')
			.setLabel(await t(interaction, 'common.previous'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('autoreact_list_next')
			.setLabel(await t(interaction, 'common.next'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('autoreact_list_last')
			.setLabel(await t(interaction, 'common.last'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

async function generateListContainer(
	interaction,
	page,
	reacts,
	accentColor,
	navDisabled = false,
) {
	const { t } = interaction.client.container;
	const totalPages = Math.max(1, Math.ceil(reacts.length / ITEMS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * ITEMS_PER_PAGE;
	const pageItems = reacts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	const listContainer = new ContainerBuilder()
		.setAccentColor(accentColor)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'autoreact.list.title', { page, totalPages }),
			),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Large)
				.setDivider(true),
		);

	if (pageItems.length === 0) {
		listContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'autoreact.list.empty'),
			),
		);
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

		listContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(lines.join('\n')),
		);
	}

	listContainer
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'autoreact.list.footer', { page, totalPages }),
			),
		);

	if (totalPages > 1) {
		const buttons = await buildNavButtons(
			interaction,
			page,
			totalPages,
			navDisabled,
		);
		listContainer.addActionRowComponents(
			new ActionRowBuilder().addComponents(...buttons),
		);
	}

	return { listContainer, page, totalPages };
}

module.exports = {
	buildNavButtons,
	generateListContainer,
};
