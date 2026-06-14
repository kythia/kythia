const {
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	SeparatorSpacingSize,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
} = require('discord.js');

const USERS_PER_PAGE = 10;

async function buildNavButtons(
	interaction,
	page,
	totalPages,
	allDisabled = false,
) {
	const { t } = interaction.client.container;
	return [
		new ButtonBuilder()
			.setCustomId('premium_list_first')
			.setLabel(await t(interaction, 'core.premium.premium.list.nav.first'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('premium_list_prev')
			.setLabel(await t(interaction, 'core.premium.premium.list.nav.prev'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('premium_list_next')
			.setLabel(await t(interaction, 'core.premium.premium.list.nav.next'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('premium_list_last')
			.setLabel(await t(interaction, 'core.premium.premium.list.nav.last'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

async function generatePremiumListContainer(
	interaction,
	page,
	allPremiumUsers,
	totalUsers,
	navDisabled = false,
) {
	const { t, kythiaConfig, helpers } = interaction.client.container;
	const { convertColor } = helpers.color;

	const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * USERS_PER_PAGE;
	const pageUsers = allPremiumUsers.slice(
		startIndex,
		startIndex + USERS_PER_PAGE,
	);

	let listText = '';
	if (pageUsers.length === 0) {
		listText = await t(interaction, 'core.premium.premium.list.empty');
	} else {
		const entries = await Promise.all(
			pageUsers.map(async (p, index) => {
				const globalIndex = startIndex + index + 1;
				return await t(interaction, 'core.premium.premium.list.item', {
					index: globalIndex,
					user: `<@${p.userId}>`,
					expires: `<t:${Math.floor(new Date(p.premiumExpiresAt).getTime() / 1000)}:R>`,
				});
			}),
		);
		listText = entries.join('\n');
	}

	const navButtons = await buildNavButtons(
		interaction,
		page,
		totalPages,
		navDisabled,
	);

	const premiumListContainer = new ContainerBuilder()
		.setAccentColor(
			convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## ${await t(interaction, 'core.premium.premium.list.title')}`,
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
				await t(interaction, 'core.premium.premium.list.footer', {
					page,
					totalPages,
					totalUsers,
				}),
			),
		)
		.addActionRowComponents(
			new ActionRowBuilder().addComponents(...navButtons),
		);

	return { premiumListContainer, page, totalPages };
}

module.exports = { generatePremiumListContainer };
