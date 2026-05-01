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
	// raw
	// .addSubcommandGroup((group) =>
	// 	group
	// 		.setName('raw')
	// 		.setDescription('🧰 Advanced: set any ServerSetting field')
	// 		.addSubcommand((sub) =>
	// 			sub
	// 				.setName('set')
	// 				.setDescription('🧰 Set any field (admin only)')
	// 				.addStringOption((opt) =>
	// 					opt.setName('field').setDescription('Field name').setRequired(true),
	// 				)
	// 				.addStringOption((opt) =>
	// 					opt.setName('value').setDescription('Value').setRequired(true),
	// 				),
	// 		),
	// )

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

	// channels
	// TODO: realocate this command
	.addSubcommandGroup((group) =>
		group
			.setName('channels')
			.setDescription('📢 Misc channels settings')
			.addSubcommand((sub) =>
				sub
					.setName('announcement')
					.setDescription('📢 Set announcement channel')
					.addChannelOption((opt) =>
						opt.setName('channel').setDescription('Channel').setRequired(true),
					),
			)
			.addSubcommand((sub) =>
				sub
					.setName('invite')
					.setDescription('📢 Set invite log channel')
					.addChannelOption((opt) =>
						opt.setName('channel').setDescription('Channel').setRequired(true),
					),
			),
	)

	// stats
	// TODO: relocate this command
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
	)

	// leveling
	// TODO: relocate this command
	.addSubcommandGroup((group) =>
		group
			.setName('leveling')
			.setDescription('🎮 Leveling system settings')
			.addSubcommand((sub) =>
				sub
					.setName('channel')
					.setDescription('🎮 Set channel for level up messages')
					.addChannelOption((opt) =>
						opt
							.setName('channel')
							.setDescription('Channel for level up messages')
							.setRequired(true),
					),
			)
			.addSubcommand((sub) =>
				sub
					.setName('cooldown')
					.setDescription('🎮 Set XP gain cooldown')
					.addIntegerOption((opt) =>
						opt
							.setName('cooldown')
							.setDescription('Cooldown in seconds')
							.setRequired(true),
					),
			)
			.addSubcommand((sub) =>
				sub
					.setName('xp')
					.setDescription('🎮 Set XP amount per message')
					.addIntegerOption((opt) =>
						opt
							.setName('xp')
							.setDescription('XP gained per message')
							.setRequired(true),
					),
			)
			.addSubcommand((sub) =>
				sub
					.setName('rolereward')
					.setDescription('🎮 Set role reward for a specific level')
					.addStringOption((opt) =>
						opt
							.setName('action')
							.setDescription('Add or remove role reward')
							.setRequired(true)
							.addChoices(
								{ name: 'Add', value: 'add' },
								{ name: 'Remove', value: 'remove' },
							),
					)
					.addIntegerOption((opt) =>
						opt
							.setName('level')
							.setDescription('Required level')
							.setRequired(true),
					)
					.addRoleOption((opt) =>
						opt
							.setName('role')
							.setDescription('Role to be given')
							.setRequired(true),
					),
			),
	)

	// streak settings
	// TODO: relocate this command
	.addSubcommandGroup((group) =>
		group
			.setName('streak-settings')
			.setDescription('🔥 Streak additional settings')
			.addSubcommand((sub) =>
				sub
					.setName('minimum')
					.setDescription('🔥 Set minimum streak')
					.addIntegerOption((opt) =>
						opt
							.setName('minimum')
							.setDescription('Minimum streak')
							.setRequired(true),
					),
			)
			.addSubcommand((sub) =>
				sub
					.setName('emoji')
					.setDescription('🔥 Set streak emoji')
					.addStringOption((opt) =>
						opt.setName('emoji').setDescription('Emoji').setRequired(true),
					),
			)
			.addSubcommand((sub) =>
				sub
					.setName('nickname')
					.setDescription('🔥 Toggle auto-nickname for streak')
					.addStringOption(createToggleOption()),
			),
	)

	// streak
	// TODO: relocate this command
	.addSubcommandGroup((group) =>
		group
			.setName('streak')
			.setDescription('🔥 Streak system settings')
			.addSubcommand((sub) =>
				sub
					.setName('rolereward')
					.setDescription('🔥 Set role reward for a specific streak')
					.addStringOption((opt) =>
						opt
							.setName('action')
							.setDescription('Add or remove role reward')
							.setRequired(true)
							.addChoices(
								{ name: 'Add', value: 'add' },
								{ name: 'Remove', value: 'remove' },
							),
					)
					.addIntegerOption((opt) =>
						opt
							.setName('streak')
							.setDescription('Required streak')
							.setRequired(true),
					)
					.addRoleOption((opt) =>
						opt
							.setName('role')
							.setDescription('Role to be given')
							.setRequired(true),
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
		const channel = interaction.options.getChannel('channel');

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
			case 'leveling': {
				switch (sub) {
					case 'channel': {
						const targetChannel = interaction.options.getChannel('channel');
						serverSetting.levelingChannelId = targetChannel.id;
						await serverSetting.save();
						const components = await simpleContainer(
							interaction,
							await t(
								interaction,
								'core.setting.setting.leveling.channel.set',
								{ channel: `<#${targetChannel.id}>` },
							),
							{ color: 'Green' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
					case 'cooldown': {
						const cooldown = interaction.options.getInteger('cooldown');
						serverSetting.levelingCooldown = cooldown * 1000;
						await serverSetting.save();
						const components = await simpleContainer(
							interaction,
							await t(
								interaction,
								'core.setting.setting.leveling.cooldown.set',
								{ cooldown },
							),
							{ color: 'Green' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
					case 'xp': {
						const xp = interaction.options.getInteger('xp');
						serverSetting.levelingXp = xp;
						await serverSetting.save();
						const components = await simpleContainer(
							interaction,
							await t(interaction, 'core.setting.setting.leveling.xp.set', {
								xp,
							}),
							{ color: 'Green' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
					case 'rolereward': {
						const role = interaction.options.getRole('role');
						const level = interaction.options.getInteger('level');
						const action = interaction.options.getString('action');
						if (!serverSetting.roleRewards) serverSetting.roleRewards = [];
						let components;
						if (action === 'add') {
							serverSetting.roleRewards = serverSetting.roleRewards.filter(
								(r) => r.level !== level,
							);
							serverSetting.roleRewards.push({ level, role: role.id });
							components = await simpleContainer(
								interaction,
								await t(
									interaction,
									'core.setting.setting.leveling.rolereward.add',
									{ role: `<@&${role.id}>`, level },
								),
								{ color: 'Green' },
							);
						} else if (action === 'remove') {
							const initial = serverSetting.roleRewards.length;
							serverSetting.roleRewards = serverSetting.roleRewards.filter(
								(r) => r.level !== level,
							);
							if (serverSetting.roleRewards.length === initial) {
								components = await simpleContainer(
									interaction,
									await t(
										interaction,
										'core.setting.setting.leveling.rolereward.notfound',
										{ level },
									),
									{ color: 'Red' },
								);
							} else {
								components = await simpleContainer(
									interaction,
									await t(
										interaction,
										'core.setting.setting.leveling.rolereward.remove',
										{ level },
									),
									{ color: 'Green' },
								);
							}
						}
						serverSetting.changed('roleRewards', true);
						await serverSetting.save();
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
			case 'testimony': {
				switch (sub) {
					case 'testimony-channel': {
						if (!channel || channel.type !== 0) {
							const components = await simpleContainer(
								interaction,
								await t(
									interaction,
									'core.setting.setting.testimony.channel.invalid',
								),
								{ color: 'Red' },
							);
							return interaction.editReply({
								components,
								flags: MessageFlags.IsComponentsV2,
							});
						}
						serverSetting.testimonyChannelId = channel.id;
						await serverSetting.save();
						const components = await simpleContainer(
							interaction,
							await t(
								interaction,
								'core.setting.setting.testimony.channel.set',
								{ channel: `<#${channel.id}>` },
							),
							{ color: 'Green' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
					case 'feedback-channel': {
						if (!channel || channel.type !== 0) {
							const components = await simpleContainer(
								interaction,
								await t(
									interaction,
									'core.setting.setting.testimony.channel.invalid',
								),
								{ color: 'Red' },
							);
							return interaction.editReply({
								components,
								flags: MessageFlags.IsComponentsV2,
							});
						}
						serverSetting.feedbackChannelId = channel.id;
						await serverSetting.save();
						const components = await simpleContainer(
							interaction,
							await t(
								interaction,
								'core.setting.setting.testimony.feedback.channel.set',
								{ channel: `<#${channel.id}>` },
							),
							{ color: 'Green' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
					case 'count-channel': {
						if (!channel) {
							const components = await simpleContainer(
								interaction,
								await t(
									interaction,
									'core.setting.setting.testimony.channel.invalid',
								),
								{ color: 'Red' },
							);
							return interaction.editReply({
								components,
								flags: MessageFlags.IsComponentsV2,
							});
						}
						serverSetting.testimonyCountChannelId = channel.id;
						await serverSetting.save();
						const components2 = await simpleContainer(
							interaction,
							await t(
								interaction,
								'core.setting.setting.testimony.count.channel.set',
								{ channel: `<#${channel.id}>` },
							),
							{ color: 'Green' },
						);
						return interaction.editReply({
							components: components2,
							flags: MessageFlags.IsComponentsV2,
						});
					}
					case 'count-format': {
						const format = interaction.options.getString('format');
						if (!format || !format.includes('{count}')) {
							const components = await simpleContainer(
								interaction,
								await t(
									interaction,
									'core.setting.setting.testimony.count.format.invalid',
								),
								{ color: 'Red' },
							);
							return interaction.editReply({
								components,
								flags: MessageFlags.IsComponentsV2,
							});
						}
						serverSetting.testimonyCountFormat = format;
						await serverSetting.save();
						const components = await simpleContainer(
							interaction,
							await t(
								interaction,
								'core.setting.setting.testimony.count.format.set',
								{ format },
							),
							{ color: 'Green' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
					case 'reset-count': {
						serverSetting.testimonyCount = 0;
						serverSetting.changed('testimonyCount');
						await serverSetting.save();
						const components = await simpleContainer(
							interaction,
							await t(
								interaction,
								'core.setting.setting.testimony.count.reset',
							),
							{ color: 'Green' },
						);
						if (serverSetting.testimonyCountChannelId) {
							try {
								const testimonyCountChannel = await interaction.client.channels
									.fetch(serverSetting.testimonyCountChannelId)
									.catch(() => null);
								if (testimonyCountChannel) {
									const format =
										serverSetting.testimonyCountFormat || '{count} Testimonies';
									const newName = format.replace(
										/{count}/gi,
										serverSetting.testimonyCount,
									);
									if (testimonyCountChannel.name !== newName) {
										await testimonyCountChannel.setName(newName);
									}
								}
							} catch (_err) {}
						}
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
					case 'count': {
						const count = interaction.options.getInteger('count');
						if (typeof count !== 'number' || count < 0) {
							const components = await simpleContainer(
								interaction,
								await t(
									interaction,
									'core.setting.setting.testimony.count.invalid',
								),
								{ color: 'Red' },
							);
							return interaction.editReply({
								components,
								flags: MessageFlags.IsComponentsV2,
							});
						}
						serverSetting.testimonyCount = count;
						serverSetting.changed('testimonyCount');
						await serverSetting.save();
						const components = await simpleContainer(
							interaction,
							await t(interaction, 'core.setting.setting.testimony.count.set', {
								count,
							}),
							{ color: 'Green' },
						);
						if (serverSetting.testimonyCountChannelId) {
							try {
								const testimonyCountChannel = await interaction.client.channels
									.fetch(serverSetting.testimonyCountChannelId)
									.catch(() => null);
								if (testimonyCountChannel) {
									const format =
										serverSetting.testimonyCountFormat || '{count} Testimonies';
									const newName = format.replace(
										/{count}/gi,
										serverSetting.testimonyCount,
									);
									if (testimonyCountChannel.name !== newName) {
										await testimonyCountChannel.setName(newName);
									}
								}
							} catch (_err) {}
						}
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
				}
				break;
			}
			case 'streak': {
				switch (sub) {
					case 'rolereward': {
						const role = interaction.options.getRole('role');
						const streak = interaction.options.getInteger('streak');
						const action = interaction.options.getString('action');
						if (!serverSetting.streakRoleRewards)
							serverSetting.streakRoleRewards = [];
						let components;
						if (action === 'add') {
							serverSetting.streakRoleRewards =
								serverSetting.streakRoleRewards.filter(
									(r) => r.streak !== streak,
								);
							serverSetting.streakRoleRewards.push({ streak, role: role.id });
							components = await simpleContainer(
								interaction,
								await t(
									interaction,
									'core.setting.setting.streak.rolereward.add',
									{ role: `<@&${role.id}>`, streak },
								),
								{ color: 'Green' },
							);
						} else if (action === 'remove') {
							const initial = serverSetting.streakRoleRewards.length;
							serverSetting.streakRoleRewards =
								serverSetting.streakRoleRewards.filter(
									(r) => r.streak !== streak,
								);
							if (serverSetting.streakRoleRewards.length === initial) {
								components = await simpleContainer(
									interaction,
									await t(
										interaction,
										'core.setting.setting.streak.rolereward.notfound',
										{ streak },
									),
									{ color: 'Red' },
								);
							} else {
								components = await simpleContainer(
									interaction,
									await t(
										interaction,
										'core.setting.setting.streak.rolereward.remove',
										{ streak },
									),
									{ color: 'Green' },
								);
							}
						}
						serverSetting.changed('streakRoleRewards', true);
						await serverSetting.save();
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
				}
				break;
			}
			case 'streak-settings': {
				if (sub === 'minimum') {
					const minimum = interaction.options.getInteger('minimum');
					serverSetting.streakMinimum = minimum;
					await serverSetting.save();
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.setting.setting.streak.minimum.set', {
							minimum,
						}),
						{ color: 'Green' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				if (sub === 'emoji') {
					const emoji = interaction.options.getString('emoji');
					serverSetting.streakEmoji = emoji;
					await serverSetting.save();
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.setting.setting.streak.emoji.set', {
							emoji,
						}),
						{ color: 'Green' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				if (sub === 'nickname') {
					const status = interaction.options.getString('status');
					serverSetting.streakNickname = status === 'enable';
					await serverSetting.save();
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.setting.setting.streak.nickname.set', {
							status: status === 'enable' ? 'Enabled' : 'Disabled',
						}),
						{ color: status === 'enable' ? 'Green' : 'Red' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				break;
			}
			case 'channels': {
				if (sub === 'announcement') {
					serverSetting.announcementChannelId = channel.id;
					await serverSetting.save();
					const components = await simpleContainer(
						interaction,
						await t(
							interaction,
							'core.setting.setting.announcement.channel.set',
							{ channel: `<#${channel.id}>` },
						),
						{ color: 'Green' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				if (sub === 'invite') {
					serverSetting.inviteChannelId = channel.id;
					await serverSetting.save();
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.setting.setting.invite.channel.set', {
							channel: `<#${channel.id}>`,
						}),
						{ color: 'Green' },
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				break;
			}
			case 'raw': {
				if (sub === 'set') {
					const field = interaction.options.getString('field');
					const valueStr = interaction.options.getString('value');
					if (!Object.hasOwn(serverSetting.dataValues, field)) {
						const components = await simpleContainer(
							interaction,
							await t(interaction, 'core.setting.setting.raw.field.invalid', {
								field,
							}),
							{ color: 'Red' },
						);
						return interaction.editReply({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
					const original = serverSetting.dataValues[field];
					let parsed = valueStr;
					try {
						if (typeof original === 'number') parsed = Number(valueStr);
						else if (typeof original === 'boolean')
							parsed = ['true', '1', 'yes', 'on', 'enable'].includes(
								valueStr.toLowerCase(),
							);
						else if (Array.isArray(original)) parsed = JSON.parse(valueStr);
						else if (original === null) {
							try {
								parsed = JSON.parse(valueStr);
							} catch {
								parsed = valueStr;
							}
						}
					} catch (_) {
						parsed = valueStr;
					}
					serverSetting[field] = parsed;
					if (Array.isArray(parsed)) serverSetting.changed(field, true);
					await serverSetting.save();
					const components = await simpleContainer(
						interaction,
						await t(interaction, 'core.setting.setting.raw.set', {
							field,
							value: `\`${valueStr}\``,
						}),
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
