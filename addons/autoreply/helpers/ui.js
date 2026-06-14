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
			.setCustomId('autoreply_list_first')
			.setLabel(await t(interaction, 'common.first'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('autoreply_list_prev')
			.setLabel(await t(interaction, 'common.previous'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('autoreply_list_next')
			.setLabel(await t(interaction, 'common.next'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('autoreply_list_last')
			.setLabel(await t(interaction, 'common.last'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

async function generateListContainer(
	interaction,
	page,
	replies,
	accentColor,
	navDisabled = false,
) {
	const { t } = interaction.client.container;
	const totalPages = Math.max(1, Math.ceil(replies.length / ITEMS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * ITEMS_PER_PAGE;
	const pageItems = replies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	const listContainer = new ContainerBuilder()
		.setAccentColor(accentColor)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'autoreply.list.title', { page, totalPages }),
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
				await t(interaction, 'autoreply.list.empty'),
			),
		);
	} else {
		let content = '';

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

		listContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(content),
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
				await t(interaction, 'autoreply.list.footer', { page, totalPages }),
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
