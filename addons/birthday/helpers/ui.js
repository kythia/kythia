const USERS_PER_PAGE = 10;

async function generateUpcomingContainer(
	interaction,
	page,
	allUpcoming,
	totalUsers,
	navDisabled = false,
) {
	const { t, kythiaConfig, helpers } = interaction.client.container;
	const { createPaginationContainer } = helpers.discord;
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

	const [container] = await createPaginationContainer(interaction, {
		page,
		totalPages,
		title: await t(interaction, 'birthday.list.title'),
		content: contentText,
		footer: await t(interaction, 'common.container.pagination.footer', {
			page,
			totalPages,
		}),
		customIdPrefix: 'upcoming',
		navDisabled,
	});

	return { container, page, totalPages };
}

module.exports = {
	generateUpcomingContainer,
};
