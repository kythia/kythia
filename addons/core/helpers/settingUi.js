const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	MessageFlags,
	SeparatorSpacingSize,
} = require('discord.js');

function cleanAndParseJson(value) {
	if (typeof value !== 'string') return value;
	let tempValue = value;
	try {
		while (typeof tempValue === 'string') {
			tempValue = JSON.parse(tempValue);
		}
		return tempValue;
	} catch (_e) {
		return tempValue;
	}
}

function formatKey(key) {
	return key
		.replace(/([a-z])([A-Z])/g, '$1 $2')
		.replace(/^./, (str) => str.toUpperCase())
		.replace(/\s([a-z])/g, (_match, p1) => ` ${p1.toUpperCase()}`);
}

async function handleViewSettings(
	interaction,
	serverSetting,
	t,
	kythiaConfig,
	helpers,
) {
	const { simpleContainer } = helpers.discord;

	if (!serverSetting?.dataValues) {
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'core.setting.setting.no.config'),
			{ color: kythiaConfig.bot.color },
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}

	const settings = serverSetting.dataValues;
	const kategori = { umum: [], boolean: [], array: [], lainnya: [] };

	for (const [key, value] of Object.entries(settings)) {
		if (['id', 'guildId'].includes(key)) continue;
		const formattedKey = `\`${formatKey(key)}\``;
		if (typeof value === 'boolean') {
			const displayKey = formattedKey.replace(/\sOn`$/, '`');
			kategori.boolean.push(
				`${value ? `🟩 ・${displayKey}` : `🟥 ・${displayKey}`}`,
			);
		} else if (Array.isArray(value)) {
			if (value.length === 0) {
				kategori.array.push(
					`🟪 ・${formattedKey} ➜ *${await t(interaction, 'core.setting.setting.empty')}*`,
				);
			} else {
				let list = '';
				value.forEach((item) => {
					if (
						typeof item === 'object' &&
						item.level &&
						(item.roleId || item.role)
					) {
						const roleDisplay = item.roleId
							? `<@&${item.roleId}>`
							: `<@&${item.role}>`;
						list += `   └ 🥇 level ${item.level} ➜ ${roleDisplay}\n`;
					} else if (typeof item === 'object') {
						list += `   └ 🔹 \`${JSON.stringify(item)}\`\n`;
					} else {
						list += `   └ 🔹 ${item}\n`;
					}
				});
				kategori.array.push(`🟪 ・${formattedKey}:\n${list.trim()}`);
			}
		} else if (typeof value === 'string' || typeof value === 'number') {
			let displayValue = value;
			const cleanedValue = cleanAndParseJson(value);

			if (
				key === 'badwords' ||
				key === 'whitelist' ||
				key === 'ignoredChannels'
			) {
				if (Array.isArray(cleanedValue) && cleanedValue.length > 0) {
					if (key === 'ignoredChannels') {
						displayValue = cleanedValue.map((id) => `<#${id}>`).join(', ');
					} else {
						displayValue = cleanedValue.map((item) => `\`${item}\``).join(', ');
					}
				} else {
					displayValue = `*${await t(interaction, 'core.setting.setting.empty')}*`;
				}
			} else if (key === 'serverStats') {
				if (Array.isArray(cleanedValue) && cleanedValue.length > 0) {
					displayValue = cleanedValue
						.map((stat) => `\n   └ ${stat.format} ➜ <#${stat.channelId}>`)
						.join('');
				} else {
					displayValue = `*${await t(interaction, 'core.setting.setting.not.set')}*`;
				}
			} else if (
				key.toLowerCase().includes('channelid') ||
				key.toLowerCase().includes('forumid') ||
				(key.toLowerCase().includes('categoryid') && value)
			) {
				displayValue = `<#${value}>`;
			} else if (key.toLowerCase().includes('roleid')) {
				displayValue = `<@&${value}>`;
			}
			kategori.umum.push(
				`🟨 ・${formattedKey} ➜ ${displayValue || `*${await t(interaction, 'core.setting.setting.not.set')}*`}`,
			);
		} else {
			kategori.lainnya.push(`⬛ ・${formattedKey}`);
		}
	}

	const allLines = [];

	if (kategori.boolean.length) {
		allLines.push(
			`### ⭕ ${await t(interaction, 'core.setting.setting.section.boolean')}`,
		);
		allLines.push(...kategori.boolean);
		allLines.push('');
	}

	if (kategori.umum.length) {
		allLines.push(
			`### ⚙️ ${await t(interaction, 'core.setting.setting.section.umum')}`,
		);
		allLines.push(...kategori.umum);
		allLines.push('');
	}

	if (kategori.array.length) {
		allLines.push(
			`### 🗃️ ${await t(interaction, 'core.setting.setting.section.array')}`,
		);
		allLines.push(...kategori.array);
		allLines.push('');
	}

	if (kategori.lainnya.length) {
		allLines.push(
			`### ❓ ${await t(interaction, 'core.setting.setting.section.lainnya')}`,
		);
		allLines.push(...kategori.lainnya);
		allLines.push('');
	}

	const pages = [];
	let currentPageText = '';
	const MAX_LENGTH = 4096;
	for (const line of allLines) {
		if (currentPageText.length + line.length + 1 > MAX_LENGTH) {
			pages.push(currentPageText);
			currentPageText = '';
		}
		currentPageText += `${line}\n`;
	}
	if (currentPageText.length > 0) {
		pages.push(currentPageText);
	}

	let page = 0;
	const totalPages = pages.length;

	const buildPageContainer = async (pageIdx) => {
		const { convertColor } = helpers.color;
		const container = new ContainerBuilder()
			.setAccentColor(
				convertColor(kythiaConfig.bot.color, {
					from: 'hex',
					to: 'decimal',
				}),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`## ${await t(interaction, 'core.setting.setting.embed.title.view')}`,
				),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					pages[pageIdx] ||
						(await t(interaction, 'core.setting.setting.no.configured')),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`${await t(interaction, 'common.embed.footer', { username: interaction.client.user.username })} • Page ${pageIdx + 1}/${totalPages}`,
				),
			);
		return container;
	};

	if (pages.length === 1) {
		const container = await buildPageContainer(0);
		return interaction.editReply({
			components: [container],
			flags: MessageFlags.IsComponentsV2,
		});
	}

	const prevBtn = new ButtonBuilder()
		.setCustomId('setting_view_prev')
		.setLabel('◀️')
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(true);
	const nextBtn = new ButtonBuilder()
		.setCustomId('setting_view_next')
		.setLabel('▶️')
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(pages.length <= 1);

	const row = new ActionRowBuilder().addComponents(prevBtn, nextBtn);

	const msg = await interaction.editReply({
		components: [await buildPageContainer(page), row],
		flags: MessageFlags.IsComponentsV2,
		fetchReply: true,
	});

	const filter = (i) =>
		i.user.id === interaction.user.id &&
		(i.customId === 'setting_view_prev' || i.customId === 'setting_view_next');
	const collector = msg.createMessageComponentCollector({
		filter,
		time: 60_000,
	});

	collector.on('collect', async (i) => {
		if (i.customId === 'setting_view_prev') {
			page = Math.max(0, page - 1);
		} else if (i.customId === 'setting_view_next') {
			page = Math.min(pages.length - 1, page + 1);
		}

		prevBtn.setDisabled(page === 0);
		nextBtn.setDisabled(page === pages.length - 1);

		await i.update({
			components: [await buildPageContainer(page), row],
			flags: MessageFlags.IsComponentsV2,
		});
	});

	collector.on('end', async () => {
		prevBtn.setDisabled(true);
		nextBtn.setDisabled(true);
		try {
			await msg.edit({
				components: [row],
			});
		} catch (_e) {}
	});
}

module.exports = {
	handleViewSettings,
};
