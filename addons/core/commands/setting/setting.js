/**
 * @namespace: addons/core/commands/setting/setting.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */
const {
	SlashCommandBuilder,
	ChannelType,
	PermissionFlagsBits,
	InteractionContextType,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	MessageFlags,
} = require('discord.js');
const { updateStats } = require('../../helpers/stats');

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

const command = new SlashCommandBuilder()
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
					.setDescription(`Enable or disable the ${featureDisplayName} feature`)
					.addStringOption(createToggleOption()),
			);
		}

		return group;
	})

	// stats
	// TODO: relocate this command
	// make new addon, stats addon
	.addSubcommandGroup((group) =>
		group
			.setName('stats')
			.setDescription('📈 Server statistics settings')
			.addSubcommand((sub) =>
				sub
					.setName('category')
					.setDescription('📈 Set category for server stats channels')
					.addChannelOption((opt) =>
						opt
							.setName('category')
							.setDescription('Category channel')
							.setRequired(true),
					),
			)
			.addSubcommand((sub) =>
				sub
					.setName('add')
					.setDescription('📈 Add a new stat for a specific channel')
					.addStringOption((opt) =>
						opt
							.setName('format')
							.setDescription('Stat format, e.g.: {memberstotal}')
							.setRequired(true),
					)
					.addChannelOption((opt) =>
						opt
							.setName('channel')
							.setDescription(
								'📈 Select a channel to use as stat (if not selected, the bot will create a new channel)',
							)
							.setRequired(false),
					),
			)
			.addSubcommand((sub) =>
				sub
					.setName('edit')
					.setDescription('📈 Edit the format of an existing stat channel')
					.addStringOption((opt) =>
						opt
							.setName('stats')
							.setDescription('Select the stat to edit')
							.setRequired(true)
							.setAutocomplete(true),
					)
					.addChannelOption((opt) =>
						opt
							.setName('channel')
							.setDescription('📈 Edit stat channel')
							.setRequired(false),
					)
					.addStringOption((opt) =>
						opt
							.setName('format')
							.setDescription('📈 Edit stat format, e.g.: {membersonline}')
							.setRequired(false),
					),
			)
			.addSubcommand((sub) =>
				sub
					.setName('enable')
					.setDescription('📈 Enable stat channel')
					.addStringOption((opt) =>
						opt
							.setName('stats')
							.setDescription('Select the stat to enable')
							.setRequired(true)
							.setAutocomplete(true),
					),
			)
			.addSubcommand((sub) =>
				sub
					.setName('disable')
					.setDescription('📈 Disable stat channel')
					.addStringOption((opt) =>
						opt
							.setName('stats')
							.setDescription('Select the stat to disable')
							.setRequired(true)
							.setAutocomplete(true),
					),
			)
			.addSubcommand((sub) =>
				sub
					.setName('remove')
					.setDescription('📈 Delete the stat and its channel')
					.addStringOption((opt) =>
						opt
							.setName('stats')
							.setDescription('Select the stat to delete')
							.setRequired(true)
							.setAutocomplete(true),
					),
			),
	);

module.exports = {
	slashCommand: command,
	permissions: PermissionFlagsBits.ManageGuild,
	botPermissions: PermissionFlagsBits.ManageGuild,
	async autocomplete(interaction) {
		const container = interaction.client.container;
		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { getChannelSafe } = helpers.discord;
		const focused = interaction.options.getFocused();
		const settings = await ServerSetting.getCache({
			guildId: interaction.guild.id,
		});
		const stats = settings?.serverStats ?? [];

		const choices = [];
		for (const stat of stats) {
			const channel = await getChannelSafe(interaction.guild, stat.channelId);
			if (!channel) continue;

			const channelName = channel.name || 'Unknown Channel';
			if (channelName.toLowerCase().includes(focused.toLowerCase())) {
				const statusText = stat.enabled
					? await t(interaction, 'core.setting.setting.stats.enabled.text')
					: await t(interaction, 'core.setting.setting.stats.disabled.text');

				const finalName = `${channelName} (${statusText})`;
				choices.push({
					name: finalName.length > 100 ? finalName.slice(0, 100) : finalName,
					value: channel.id,
				});
			}
			if (choices.length >= 25) break;
		}

		await interaction.respond(choices);
	},

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, kythiaConfig, helpers, models, logger } = container;
		const { getChannelSafe, simpleContainer } = helpers.discord;
		// const { convertColor } = helpers.color;
		const { ServerSetting } = models;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const group = interaction.options.getSubcommandGroup(false);
		const sub = interaction.options.getSubcommand();
		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;
		const _status = interaction.options.getString('status');
		// const action = interaction.options.getString('action');
		// const target = interaction.options.getMentionable('target');
		// const channel = interaction.options.getChannel('channel');

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
			case 'stats': {
				const allowedPlaceholders = [
					'{memberstotal}',
					'{online}',
					'{idle}',
					'{dnd}',
					'{offline}',
					'{bots}',
					'{humans}',
					'{online_bots}',
					'{online_humans}',
					'{boosts}',
					'{boost_level}',
					'{channels}',
					'{text_channels}',
					'{voice_channels}',
					'{categories}',
					'{announcement_channels}',
					'{stage_channels}',
					'{roles}',
					'{emojis}',
					'{stickers}',
					'{guild}',
					'{guild_id}',
					'{owner}',
					'{owner_id}',
					'{region}',
					'{verified}',
					'{partnered}',
					'{date}',
					'{time}',
					'{datetime}',
					'{day}',
					'{month}',
					'{year}',
					'{hour}',
					'{minute}',
					'{second}',
					'{timestamp}',
					'{created_date}',
					'{created_time}',
					'{guild_age}',
					'{member_join}',
				];
				switch (sub) {
					case 'category': {
						const cat = interaction.options.getChannel('category');
						if (!cat || cat.type !== ChannelType.GuildCategory) {
							const components = await simpleContainer(
								interaction,
								await t(
									interaction,
									'core.setting.setting.stats.category.invalid',
								),
								{ color: 'Red' },
							);
							return interaction.editReply({
								components,
								flags: MessageFlags.IsComponentsV2,
							});
						}
						serverSetting.serverStatsCategoryId = cat.id;
						await serverSetting.save();
						const components = await simpleContainer(
							interaction,
							await t(interaction, 'core.setting.setting.stats.category.set', {
								category: `<#${cat.id}>`,
							}),
							{ color: 'Green' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
					case 'add': {
						const format = interaction.options.getString('format');
						let channel = interaction.options.getChannel('channel');
						const hasAllowedPlaceholder = allowedPlaceholders.some((ph) =>
							format.includes(ph),
						);
						if (!hasAllowedPlaceholder) {
							const components = await simpleContainer(
								interaction,
								await t(
									interaction,
									'core.setting.setting.stats.format.invalid',
									{
										placeholders: allowedPlaceholders.join(', '),
									},
								),
								{ color: 'Red' },
							);
							return interaction.editReply({
								components,
								flags: MessageFlags.IsComponentsV2,
							});
						}
						if (!channel) {
							channel = await interaction.guild.channels.create({
								name: format.replace(/{.*?}/g, '0'),
								type: ChannelType.GuildVoice,
								parent: serverSetting.serverStatsCategoryId,
								permissionOverwrites: [
									{
										id: interaction.guild.roles.everyone,
										deny: [PermissionFlagsBits.Connect],
										allow: [PermissionFlagsBits.ViewChannel],
									},
								],
							});
						}
						const already = serverSetting.serverStats?.find(
							(s) => s.channelId === channel.id,
						);
						if (already) {
							const components = await simpleContainer(
								interaction,
								await t(interaction, 'core.setting.setting.stats.already'),
								{ color: 'Yellow' },
							);
							return interaction.editReply({
								components,
								flags: MessageFlags.IsComponentsV2,
							});
						}
						serverSetting.serverStats ??= [];
						serverSetting.serverStats.push({
							channelId: channel.id,
							format,
							enabled: true,
						});
						serverSetting.changed('serverStats', true);
						await serverSetting.save();
						await updateStats(interaction, interaction.client, [serverSetting]);
						const components = await simpleContainer(
							interaction,
							await t(interaction, 'core.setting.setting.stats.add', {
								channel: `<#${channel.id}>`,
								format,
							}),
							{ color: 'Green' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
					case 'edit': {
						const statsId = interaction.options.getString('stats');
						const format = interaction.options.getString('format');
						const stat = serverSetting.serverStats?.find(
							(s) => s.channelId === statsId,
						);
						if (!stat) {
							const components = await simpleContainer(
								interaction,
								await t(interaction, 'core.setting.setting.stats.notfound'),
								{ color: 'Red' },
							);
							return interaction.editReply({
								components,
								flags: MessageFlags.IsComponentsV2,
							});
						}
						if (format) stat.format = format;
						const hasAllowedPlaceholder = allowedPlaceholders.some((ph) =>
							format.includes(ph),
						);
						if (!hasAllowedPlaceholder) {
							const components = await simpleContainer(
								interaction,
								await t(
									interaction,
									'core.setting.setting.stats.format.invalid',
									{
										placeholders: allowedPlaceholders.join(', '),
									},
								),
								{ color: 'Red' },
							);
							return interaction.editReply({
								components,
								flags: MessageFlags.IsComponentsV2,
							});
						}
						serverSetting.changed('serverStats', true);
						await serverSetting.save();
						await updateStats(interaction, interaction.client, [serverSetting]);
						const components = await simpleContainer(
							interaction,
							await t(interaction, 'core.setting.setting.stats.edit', {
								channel: `<#${statsId}>`,
								format,
							}),
							{ color: 'Green' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
					case 'enable': {
						const statsId = interaction.options.getString('stats');
						const stat = serverSetting.serverStats?.find(
							(s) => s.channelId === statsId,
						);
						if (!stat) {
							const components = await simpleContainer(
								interaction,
								await t(interaction, 'core.setting.setting.stats.notfound'),
								{ color: 'Red' },
							);
							return interaction.editReply({
								components,
								flags: MessageFlags.IsComponentsV2,
							});
						}
						stat.enabled = true;
						serverSetting.changed('serverStats', true);
						await serverSetting.save();
						await updateStats(interaction, interaction.client, [serverSetting]);
						const components = await simpleContainer(
							interaction,
							await t(interaction, 'core.setting.setting.stats.enabled.msg', {
								channel: `<#${statsId}>`,
							}),
							{ color: 'Green' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
					case 'disable': {
						const statsId = interaction.options.getString('stats');
						const stat = serverSetting.serverStats?.find(
							(s) => s.channelId === statsId,
						);
						if (!stat) {
							const components = await simpleContainer(
								interaction,
								await t(interaction, 'core.setting.setting.stats.notfound'),
								{ color: 'Red' },
							);
							return interaction.editReply({
								components,
								flags: MessageFlags.IsComponentsV2,
							});
						}
						stat.enabled = false;
						serverSetting.changed('serverStats', true);
						await serverSetting.save();
						await updateStats(interaction, interaction.client, [serverSetting]);
						const components = await simpleContainer(
							interaction,
							await t(interaction, 'core.setting.setting.stats.disabled.msg', {
								channel: `<#${statsId}>`,
							}),
							{ color: 'Red' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
					case 'remove': {
						const statsId = interaction.options.getString('stats');
						const channel = await getChannelSafe(interaction.guild, statsId);
						const before = serverSetting.serverStats?.length || 0;
						serverSetting.serverStats = serverSetting.serverStats?.filter(
							(s) => s.channelId !== statsId,
						);
						const after = serverSetting.serverStats?.length || 0;
						try {
							if (channel?.deletable) {
								await channel.delete('Stat channel removed');
							}
						} catch (_) {}
						serverSetting.changed('serverStats', true);
						await serverSetting.save();
						await updateStats(interaction, interaction.client, [serverSetting]);
						const isSuccess = before !== after;
						const components = await simpleContainer(
							interaction,
							isSuccess
								? await t(
										interaction,
										'core.setting.setting.stats.remove.success',
									)
								: await t(
										interaction,
										'core.setting.setting.stats.remove.notfound',
									),
							{ color: isSuccess ? 'Green' : 'Yellow' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
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
