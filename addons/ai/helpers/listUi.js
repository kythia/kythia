const {
	ButtonStyle,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');

const CHANNELS_PER_PAGE = 10;

async function buildNavButtons(
	interaction,
	page,
	totalPages,
	allDisabled = false,
) {
	const { t } = interaction.client.container;
	return [
		new ButtonBuilder()
			.setCustomId('ai_list_first')
			.setLabel(await t(interaction, 'ai.ai.list.nav.first'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('ai_list_prev')
			.setLabel(await t(interaction, 'ai.ai.list.nav.prev'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('ai_list_next')
			.setLabel(await t(interaction, 'ai.ai.list.nav.next'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('ai_list_last')
			.setLabel(await t(interaction, 'ai.ai.list.nav.last'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

async function generateAIListContainer(
	interaction,
	page,
	allChannelIds,
	totalChannels,
	navDisabled = false,
) {
	const { t, kythiaConfig, helpers } = interaction.client.container;
	const { convertColor } = helpers.color;

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

	const navButtons = await buildNavButtons(
		interaction,
		page,
		totalPages,
		navDisabled,
	);

	const aiListContainer = new ContainerBuilder()
		.setAccentColor(
			convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## ${await t(interaction, 'ai.ai.list.title')}`,
			),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(listText))
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'ai.ai.list.footer', {
					page,
					totalPages,
					totalChannels,
				}),
			),
		)
		.addActionRowComponents(
			new ActionRowBuilder().addComponents(...navButtons),
		);

	return { aiListContainer, page, totalPages };
}

module.exports = {
	buildNavButtons,
	generateAIListContainer,
};
