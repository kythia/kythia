const {
	SeparatorSpacingSize,
	TextDisplayBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	ButtonBuilder,
	ButtonStyle,
} = require('discord.js');

const PETS_PER_PAGE = 10;

async function buildNavButtons(
	interaction,
	page,
	totalPages,
	allDisabled = false,
) {
	const { t } = interaction.client.container;
	return [
		new ButtonBuilder()
			.setCustomId('pets_first')
			.setLabel(await t(interaction, 'common.pagination.first'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('pets_prev')
			.setLabel(await t(interaction, 'common.pagination.prev'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('pets_next')
			.setLabel(await t(interaction, 'common.pagination.next'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('pets_last')
			.setLabel(await t(interaction, 'common.pagination.last'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

async function generatePetListContainer(
	interaction,
	page,
	allPets,
	totalPets,
	navDisabled = false,
) {
	const { t, kythiaConfig, helpers } = interaction.client.container;
	const { convertColor } = helpers.color;

	const totalPages = Math.max(1, Math.ceil(totalPets / PETS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * PETS_PER_PAGE;
	const pagePets = allPets.slice(startIndex, startIndex + PETS_PER_PAGE);

	let petListText = '';
	if (pagePets.length === 0) {
		petListText = await t(interaction, 'pet.admin.list.list.empty.desc');
	} else {
		const entries = await Promise.all(
			pagePets.map(async (pet) => {
				return `**> ${pet.icon} ${pet.name}**\n${await t(
					interaction,
					'pet.admin.list.list.field',
					{
						rarity: pet.rarity,
						bonusType: pet.bonusType ? pet.bonusType.toUpperCase() : 'UNKNOWN',
						bonusValue: pet.bonusValue,
					},
				)}`;
			}),
		);
		petListText = entries.join('\n\n');
	}

	const navButtons = await buildNavButtons(
		interaction,
		page,
		totalPages,
		navDisabled,
	);

	const petListContainer = new ContainerBuilder()
		.setAccentColor(
			convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## ${await t(interaction, 'pet.admin.list.list.title')}`,
			),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(petListText))
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'pet.admin.list.list.footer', {
					page,
					totalPages,
					total: totalPets,
				}),
			),
		)
		.addActionRowComponents(
			new ActionRowBuilder().addComponents(...navButtons),
		);

	return { petListContainer, page, totalPages };
}

module.exports = {
	buildNavButtons,
	generatePetListContainer,
};
