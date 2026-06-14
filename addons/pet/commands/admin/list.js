/**
 * @namespace: addons/pet/commands/admin/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	SeparatorSpacingSize,
	TextDisplayBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	ButtonBuilder,
	MessageFlags,
	ButtonStyle,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

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
						bonusType: pet.bonusType.toUpperCase(),
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

class ListCommand extends BaseCommand {
	slashCommand = (subcommand) =>
		subcommand.setName('list').setDescription('Show all pets in the system');

	subcommand = true;
	teamOnly = true;

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { simpleContainer } = helpers.discord;
		const { Pet } = models;

		await interaction.deferReply();

		const allPets = await Pet.getAllCache({
			cacheTags: ['Pet:all'],
		});

		const totalPets = allPets.length;
		let currentPage = 1;

		if (totalPets === 0) {
			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'pet.admin.list.list.empty.title')}\n${await t(interaction, 'pet.admin.list.list.empty.desc')}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const { petListContainer, totalPages } = await generatePetListContainer(
			interaction,
			currentPage,
			allPets,
			totalPets,
		);

		const message = await interaction.editReply({
			components: [petListContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});

		if (totalPages <= 1) return;

		const collector = message.createMessageComponentCollector({ time: 300000 });

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: await t(i, 'common.pagination.not.your.interaction'),
					flags: MessageFlags.Ephemeral,
				});
			}

			if (i.customId === 'pets_first') {
				currentPage = 1;
			} else if (i.customId === 'pets_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'pets_next') {
				currentPage = Math.min(totalPages, currentPage + 1);
			} else if (i.customId === 'pets_last') {
				currentPage = totalPages;
			}

			const { petListContainer: newPetListContainer } =
				await generatePetListContainer(i, currentPage, allPets, totalPets);

			await i.update({
				components: [newPetListContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		});

		collector.on('end', async () => {
			try {
				const { petListContainer: finalContainer } =
					await generatePetListContainer(
						interaction,
						currentPage,
						allPets,
						totalPets,
						true,
					);

				await message.edit({
					components: [finalContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (_e) {}
		});
	}
}

exports.default = ListCommand;
