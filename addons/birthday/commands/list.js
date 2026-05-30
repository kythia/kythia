/**
 * @namespace: addons/birthday/commands/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const { DateTime } = require('luxon');

const USERS_PER_PAGE = 10;
const MAX_BIRTHDAYS = 100;

async function buildNavButtons(
	interaction,
	page,
	totalPages,
	allDisabled = false,
) {
	const { t } = interaction.client.container;
	return [
		new ButtonBuilder()
			.setCustomId('upcoming_first')
			.setLabel(await t(interaction, 'common.pagination.first'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('upcoming_prev')
			.setLabel(await t(interaction, 'common.pagination.prev'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('upcoming_next')
			.setLabel(await t(interaction, 'common.pagination.next'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('upcoming_last')
			.setLabel(await t(interaction, 'common.pagination.last'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

async function generateUpcomingContainer(
	interaction,
	page,
	allUpcoming,
	totalUsers,
	navDisabled = false,
) {
	const { t, kythiaConfig, helpers } = interaction.client.container;
	const { convertColor } = helpers.color;

	const totalPages = Math.max(1, Math.ceil(totalUsers / USERS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * USERS_PER_PAGE;
	const pageItems = allUpcoming.slice(startIndex, startIndex + USERS_PER_PAGE);

	// Helper for Zodiac
	const getZodiac = (day, month) => {
		const zodiacs = [
			{ sign: '♑ Capricorn', lastDay: 19 },
			{ sign: '♒ Aquarius', lastDay: 18 },
			{ sign: '♓ Pisces', lastDay: 20 },
			{ sign: '♈ Aries', lastDay: 19 },
			{ sign: '♉ Taurus', lastDay: 20 },
			{ sign: '♊ Gemini', lastDay: 20 },
			{ sign: '♋ Cancer', lastDay: 22 },
			{ sign: '♌ Leo', lastDay: 22 },
			{ sign: '♍ Virgo', lastDay: 22 },
			{ sign: '♎ Libra', lastDay: 22 },
			{ sign: '♏ Scorpio', lastDay: 21 },
			{ sign: '♐ Sagittarius', lastDay: 21 },
			{ sign: '♑ Capricorn', lastDay: 31 },
		];
		return day > zodiacs[month - 1].lastDay
			? zodiacs[month].sign
			: zodiacs[month - 1].sign;
	};

	let contentText = '';
	if (pageItems.length === 0) {
		contentText = await t(interaction, 'birthday.list.empty');
	} else {
		const lines = [];
		for (const b of pageItems) {
			const dateStr = b.nextBirthday.toFormat('MMMM d');

			// Age Calculation
			let ageInfo = '';
			if (b.year) {
				const age = b.nextBirthday.year - b.year;
				ageInfo = ` (${age})`;
			}

			// Zodiac
			const zodiac = getZodiac(b.day, b.month);

			const dayLabel =
				Math.ceil(b.daysUntil) === 0
					? '🎉 **Today!**'
					: `in ${Math.ceil(b.daysUntil)} days`;

			// Format: @User • Jan 15 (25) ♑ • in 5 days
			lines.push(
				`<@${b.userId}> • **${dateStr}**${ageInfo} ${zodiac} • ${dayLabel}`,
			);
		}
		contentText = lines.join('\n');
	}

	const navButtons = await buildNavButtons(
		interaction,
		page,
		totalPages,
		navDisabled,
	);

	const colorInput = kythiaConfig.bot.color || '#5865F2';
	const accentColor = convertColor(colorInput, {
		from: 'hex',
		to: 'decimal',
	});

	const container = new ContainerBuilder()
		.setAccentColor(accentColor)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'birthday.list.title'),
			),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(contentText))
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'common.container.pagination.footer', {
					page,
					totalPages,
				}),
			),
		)
		.addActionRowComponents(
			new ActionRowBuilder().addComponents(...navButtons),
		);

	return { container, page, totalPages };
}

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('list')
			.setDescription('📅 See a list of upcoming birthdays.'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers } = container;
		const { UserBirthday } = models;

		await interaction.deferReply();

		// Fetch birthdays
		const birthdays = await UserBirthday.getAllCache({
			where: {
				guildId: interaction.guild.id,
			},
			limit: MAX_BIRTHDAYS,
		});

		if (birthdays.length === 0) {
			const components = await helpers.discord.simpleContainer(
				interaction,
				await t(interaction, 'birthday.list.empty'),
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		}

		// Sort logic
		const now = DateTime.now();
		const upcoming = birthdays
			.map((b) => {
				let next = DateTime.fromObject({
					day: b.day,
					month: b.month,
					year: now.year,
				});
				if (next < now.startOf('day')) {
					next = next.plus({ years: 1 });
				}
				return {
					...b.toJSON(),
					nextBirthday: next,
					daysUntil: next.diff(now, 'days').days,
				};
			})
			.sort((a, b) => a.nextBirthday - b.nextBirthday);

		const totalUsers = upcoming.length;
		let currentPage = 1;

		const { container: initialContainer, totalPages } =
			await generateUpcomingContainer(
				interaction,
				currentPage,
				upcoming,
				totalUsers,
			);

		const message = await interaction.editReply({
			components: [initialContainer],
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
					content: await t(i, 'common.error.interaction_refused'),
					flags: MessageFlags.Ephemeral,
				});
			}

			if (i.customId === 'upcoming_first') {
				currentPage = 1;
			} else if (i.customId === 'upcoming_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'upcoming_next') {
				currentPage = Math.min(totalPages, currentPage + 1);
			} else if (i.customId === 'upcoming_last') {
				currentPage = totalPages;
			}

			const { container: newContainer } = await generateUpcomingContainer(
				i,
				currentPage,
				upcoming,
				totalUsers,
			);

			await i.update({
				components: [newContainer],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		});

		collector.on('end', async () => {
			try {
				const { container: finalContainer } = await generateUpcomingContainer(
					interaction,
					currentPage,
					upcoming,
					totalUsers,
					true,
				);

				await message.edit({
					components: [finalContainer],
					flags: MessageFlags.IsComponentsV2,
					allowedMentions: {
						parse: [],
					},
				});
			} catch (_e) {}
		});
	},
};
