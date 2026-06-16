/**
 * @namespace: addons/core/commands/setting/setting.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
	InteractionContextType,
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const { BaseCommand } = require('kythia-core');
const settinguiHelper = require('../../helpers/settingUi');

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
				{
					name: 'Enable',
					value: 'enable',
				},
				{
					name: 'Disable',
					value: 'disable',
				},
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
class SettingCommand extends BaseCommand {
	permissions = PermissionFlagsBits.ManageGuild;
	botPermissions = PermissionFlagsBits.ManageGuild;

	slashCommand = new SlashCommandBuilder()
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
		});

	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers, models, logger } = container;
		const { simpleContainer } = helpers.discord;
		// const { convertColor } = helpers.color;
		const { ServerSetting } = models;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const group = interaction.options.getSubcommandGroup(false);
		const sub = interaction.options.getSubcommand();
		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;
		const [serverSetting, created] = await ServerSetting.findOrCreateCache({
			where: {
				guildId: guildId,
			},
			defaults: {
				guildId: guildId,
				guildName: guildName,
			},
		});
		if (created) {
			await ServerSetting.clearNegativeCache({
				where: {
					guildId: guildId,
				},
			});
			logger.info(
				`[CACHE] Cleared negative cache for new ServerSetting: ${guildId}`,
				{
					label: 'core',
				},
			);
		}
		if (sub === 'view') {
			await settinguiHelper.handleViewSettings(
				interaction,
				serverSetting,
				t,
				kythiaConfig,
				helpers,
			);
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
				await t(interaction, translationKey, {
					feature: featureName,
				}),
				{
					color: isEnabled ? 'Green' : 'Red',
				},
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
					const isEnabled = status === 'enable';
					const translationKey = isEnabled
						? 'core.setting.setting.feature.enabled'
						: 'core.setting.setting.feature.disabled';
					const components = await simpleContainer(
						interaction,
						await t(interaction, translationKey, {
							feature: featureName,
						}),
						{
							color: status === 'enable' ? 'Green' : 'Red',
						},
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
						await t(interaction, 'core.setting.setting.language.set', {
							lang,
						}),
						{
							color: 'Green',
						},
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
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}
	}
}

exports.default = SettingCommand;
