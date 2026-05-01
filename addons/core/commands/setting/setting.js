/**
 * @namespace: addons/core/commands/setting/setting.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */
const {
	InteractionContextType,
	SeparatorSpacingSize,
	SlashCommandBuilder,
	PermissionFlagsBits,
	TextDisplayBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	MessageFlags,
} = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');

const langDir = path.join(__dirname, '../../lang');
let availableLanguages = [];

try {
	const files = fs.readdirSync(langDir);
	availableLanguages = files
		.filter((file) => file.endsWith('.json'))
		.map((file) => {
			const langCode = path.basename(file, '.json');
			try {
				const langData = JSON.parse(
					fs.readFileSync(path.join(langDir, file), 'utf8'),
				);
				return {
					name: langData.languageName || langCode,
					value: langCode,
				};
			} catch {
				return {
					name: langCode,
					value: langCode,
				};
			}
		});
} catch (_e) {
	availableLanguages = [];
}
/**
 * Memastikan data dari DB yang seharusnya array benar-benar array.
 * @param {*} dbField - Field dari model Sequelize.
 * @returns {Array} - Field yang sudah dijamin berupa array.
 */
// function ensureArray(dbField) {
// 	if (Array.isArray(dbField)) {
// 		return dbField;
// 	}
// 	if (typeof dbField === 'string') {
// 		try {
// 			const parsed = JSON.parse(dbField);
// 			return Array.isArray(parsed) ? parsed : [];
// 		} catch {
// 			return [];
// 		}
// 	}
// 	return [];
// }

const createToggleOption = () => {
	return (opt) =>
		opt
			.setName('status')
			.setDescription('Select status')
			.setRequired(true)
			.addChoices(
				{ name: 'Enable', value: 'enable' },
				{ name: 'Disable', value: 'disable' },
			);
};

const featureMap = {
	activity: ['activityOn', 'Activity'],
	'server-stats': ['serverStatsOn', 'Server Stats'],
	leveling: ['levelingOn', 'Leveling'],
	adventure: ['adventureOn', 'Adventure'],
	'minecraft-stats': ['minecraftStatsOn', 'Minecraft Stats'],
	streak: ['streakOn', 'Streak'],
	invites: ['invitesOn', 'Invites'],
	'boost-log': ['boostLogOn', 'Boost Log'],
};

const toggleableFeatures = Object.keys(featureMap);

// const command =

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('set')
		.setDescription('⚙️ Settings bot configuration')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

		// language
		.addSubcommandGroup((group) =>
			group
				.setName('language')
				.setDescription('🌐 Language settings')
				.addSubcommand((sub) =>
					sub
						.setName('set')
						.setDescription('🌐 Set bot language')
						.addStringOption((opt) =>
							Array.isArray(availableLanguages) && availableLanguages.length > 0
								? opt
										.setName('lang')
										.setDescription('Choose language')
										.setRequired(true)
										.addChoices(...availableLanguages)
								: opt
										.setName('lang')
										.setDescription('Choose language')
										.setRequired(true),
						),
				),
		)

		// view
		.addSubcommand((sub) =>
			sub.setName('view').setDescription('🔍 View all bot settings'),
		)

		// features
		.addSubcommandGroup((group) => {
			group
				.setName('features')
				.setDescription('🔄 Enable or disable a specific feature');

			for (const [subcommandName, [, featureDisplayName]] of Object.entries(
				featureMap,
			)) {
				group.addSubcommand((sub) =>
					sub
						.setName(subcommandName)
						.setDescription(
							`Enable or disable the ${featureDisplayName} feature`,
						)
						.addStringOption(createToggleOption()),
				);
			}

			return group;
		}),
	permissions: PermissionFlagsBits.ManageGuild,
	botPermissions: PermissionFlagsBits.ManageGuild,

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, kythiaConfig, helpers, models, logger } = container;
		const { simpleContainer } = helpers.discord;
		// const { convertColor } = helpers.color;
		const { ServerSetting } = models;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const group = interaction.options.getSubcommandGroup(false);
		const sub = interaction.options.getSubcommand();
		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;

		const [serverSetting, created] = await ServerSetting.findOrCreateWithCache({
			where: { guildId: guildId },
			defaults: { guildId: guildId, guildName: guildName },
		});

		if (created) {
			await ServerSetting.clearNegativeCache({ where: { guildId: guildId } });
			logger.info(
				`[CACHE] Cleared negative cache for new ServerSetting: ${guildId}`,
				{ label: 'core' },
			);
		}

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

		if (sub === 'view') {
			if (!serverSetting || !serverSetting.dataValues) {
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
			function formatKey(key) {
				return key
					.replace(/([a-z])([A-Z])/g, '$1 $2')
					.replace(/^./, (str) => str.toUpperCase())
					.replace(/\s([a-z])/g, (_match, p1) => ` ${p1.toUpperCase()}`);
			}
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
								displayValue = cleanedValue
									.map((item) => `\`${item}\``)
									.join(', ');
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
			let currentPage = '';
			const MAX_LENGTH = 4096;
			for (const line of allLines) {
				if (currentPage.length + line.length + 1 > MAX_LENGTH) {
					pages.push(currentPage);
					currentPage = '';
				}
				currentPage += `${line}\n`;
			}
			if (currentPage.length > 0) {
				pages.push(currentPage);
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

			const {
				ActionRowBuilder,
				ButtonBuilder,
				ButtonStyle,
			} = require('discord.js');
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
				(i.customId === 'setting_view_prev' ||
					i.customId === 'setting_view_next');
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

			return;
		}

		if (toggleableFeatures.includes(sub)) {
			const status = interaction.options.getString('status');
			const [settingKey, featureName] = featureMap[sub];

			serverSetting[settingKey] = status === 'enable';
			await serverSetting.save();

			const isEnabled = status === 'enable';
			const translationKey = isEnabled
				? 'core.setting.setting.feature.enabled'
				: 'core.setting.setting.feature.disabled';

			const components = await simpleContainer(
				interaction,
				await t(interaction, translationKey, { feature: featureName }),
				{ color: isEnabled ? 'Green' : 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		switch (group) {
			case 'features': {
				if (toggleableFeatures.includes(sub)) {
					const status = interaction.options.getString('status');
					const [settingKey, featureName] = featureMap[sub];

					serverSetting[settingKey] = status === 'enable';
					await serverSetting.save();

					const components = await simpleContainer(
						interaction,
						`✅ Fitur **${featureName}** telah **di-${status === 'enable' ? 'aktifkan' : 'nonaktifkan'}**.`,
						{ color: status === 'enable' ? 'Green' : 'Red' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				break;
			}
			case 'language': {
				if (sub === 'set') {
					const lang = interaction.options.getString('lang');
					serverSetting.lang = lang;
					await serverSetting.save();
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.setting.setting.language.set', { lang }),
						{ color: 'Green' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				break;
			}
			default: {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'core.setting.setting.command.not.found'),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}
	},
};
