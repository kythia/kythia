/**
 * @namespace: addons/core/commands/utils/kyth/premium/list.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonBuilder,
	ButtonStyle,
	ActionRowBuilder,
	SeparatorSpacingSize,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	MessageFlags,
} = require('discord.js');
const { Op } = require('sequelize');

const { BaseCommand } = require('kythia-core');

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

class ListCommand extends BaseCommand {
	slashCommand = (subcommand) =>
		subcommand.setName('list').setDescription('View list of premium users');

	async execute(interaction) {
		const container = this.container;
		const { t, models } = container;
		const { KythiaUser } = models;

		await interaction.deferReply();

		const now = new Date();
		const allPremiumUsers = await KythiaUser.getAllCache({
			where: {
				isPremium: true,
				premiumExpiresAt: { [Op.gt]: now },
			},
			order: [['premiumExpiresAt', 'ASC']],
			cacheTags: ['KythiaUser:premium:list'],
		});

		const totalUsers = allPremiumUsers.length;
		let currentPage = 1;

		if (totalUsers === 0) {
			const { premiumListContainer } = await generatePremiumListContainer(
				interaction,
				1,
				[],
				0,
				/*navDisabled*/ true,
			);
			return interaction.editReply({
				components: [premiumListContainer],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		}

		const { premiumListContainer, totalPages } =
			await generatePremiumListContainer(
				interaction,
				currentPage,
				allPremiumUsers,
				totalUsers,
			);

		const message = await interaction.editReply({
			components: [premiumListContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
			allowedMentions: {
				parse: [],
			},
		});

		if (totalPages <= 1) return;

		const collector = message.createMessageComponentCollector({ time: 300000 });

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: await t(i, 'core.premium.premium.list.not.your.interaction'),
					flags: MessageFlags.Ephemeral,
				});
			}

			if (i.customId === 'premium_list_first') {
				currentPage = 1;
			} else if (i.customId === 'premium_list_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'premium_list_next') {
				currentPage = Math.min(totalPages, currentPage + 1);
			} else if (i.customId === 'premium_list_last') {
				currentPage = totalPages;
			}

			const { premiumListContainer: newPremiumListContainer } =
				await generatePremiumListContainer(
					i,
					currentPage,
					allPremiumUsers,
					totalUsers,
				);

			await i.update({
				components: [newPremiumListContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		});

		collector.on('end', async () => {
			try {
				const { premiumListContainer: finalContainer } =
					await generatePremiumListContainer(
						interaction,
						currentPage,
						allPremiumUsers,
						totalUsers,
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
