/**
 * @namespace: addons/automod/commands/setting/automod-setting.js
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
const {
	DEFAULT_CONFIG,
	serializeConfig,
	getAntiNukeConfig,
} = require('../../helpers/antinuke');
const { BaseCommand } = require('kythia-core');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function ensureArray(dbField) {
	if (Array.isArray(dbField)) return dbField;
	if (typeof dbField === 'string') {
		try {
			const parsed = JSON.parse(dbField);
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}
	return [];
}
const createToggleOption = () => (option) =>
	option
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

// ---------------------------------------------------------------------------
// Anti-* feature toggles (all automod-specific)
// ---------------------------------------------------------------------------
const automodFeatureMap = {
	'anti-invites': ['antiInviteOn', 'Anti-Invites'],
	'anti-links': ['antiLinkOn', 'Anti-Links'],
	'anti-spam': ['antiSpamOn', 'Anti-Spam'],
	'anti-badwords': ['antiBadwordOn', 'Anti-Badwords'],
	'anti-mention': ['antiMentionOn', 'Anti-Mention'],
	'anti-all-caps': ['antiAllCapsOn', 'Anti-All Caps'],
	'anti-emoji-spam': ['antiEmojiSpamOn', 'Anti-Emoji Spam'],
	'anti-zalgo': ['antiZalgoOn', 'Anti-Zalgo'],
};
class AutomodSettingCommand extends BaseCommand {
	permissions = PermissionFlagsBits.ManageGuild;
	botPermissions = PermissionFlagsBits.ManageGuild;
	voteLocked = true;
	slashCommand = new SlashCommandBuilder()
		.setName('automod')
		.setDescription('Automod settings')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

		// --- Whitelist ---
		.addSubcommandGroup((group) =>
			group
				.setName('whitelist')
				.setDescription(
					'Manage automod whitelist (users/roles immune to automod)',
				)
				.addSubcommand((sub) =>
					sub
						.setName('add')
						.setDescription('Add a user or role to the whitelist')
						.addMentionableOption((option) =>
							option
								.setName('target')
								.setDescription('User or role')
								.setRequired(true),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('remove')
						.setDescription('Remove a user or role from the whitelist')
						.addMentionableOption((option) =>
							option
								.setName('target')
								.setDescription('User or role')
								.setRequired(true),
						),
				)
				.addSubcommand((sub) =>
					sub.setName('list').setDescription('View the current whitelist'),
				),
		)

		// --- Badwords ---
		.addSubcommandGroup((group) =>
			group
				.setName('badwords')
				.setDescription('Manage blocked words')
				.addSubcommand((sub) =>
					sub
						.setName('add')
						.setDescription('Add a word to the blocklist')
						.addStringOption((option) =>
							option
								.setName('word')
								.setDescription('Word to block')
								.setRequired(true),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('remove')
						.setDescription('Remove a word from the blocklist')
						.addStringOption((option) =>
							option
								.setName('word')
								.setDescription('Word to unblock')
								.setRequired(true),
						),
				)
				.addSubcommand((sub) =>
					sub.setName('list').setDescription('View the blocked words list'),
				),
		)

		// --- Badword whitelist ---
		.addSubcommandGroup((group) =>
			group
				.setName('badword-whitelist')
				.setDescription('Manage badword exceptions (whitelisted words)')
				.addSubcommand((sub) =>
					sub
						.setName('add')
						.setDescription(
							'Whitelist a word (allow even if it contains badwords)',
						)
						.addStringOption((option) =>
							option
								.setName('word')
								.setDescription('Word to allow')
								.setRequired(true),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('remove')
						.setDescription('Remove a word from the badword whitelist')
						.addStringOption((option) =>
							option
								.setName('word')
								.setDescription('Word to remove')
								.setRequired(true),
						),
				)
				.addSubcommand((sub) =>
					sub.setName('list').setDescription('View the badword whitelist'),
				),
		)

		// --- Ignored Channels ---
		.addSubcommandGroup((group) =>
			group
				.setName('ignored-channels')
				.setDescription('Manage channels ignored by automod')
				.addSubcommand((sub) =>
					sub
						.setName('add')
						.setDescription('Add a channel to the exception list')
						.addChannelOption((option) =>
							option
								.setName('channel')
								.setDescription('Channel to ignore')
								.setRequired(true),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('remove')
						.setDescription('Remove a channel from the exception list')
						.addChannelOption((option) =>
							option
								.setName('channel')
								.setDescription('Channel to remove')
								.setRequired(true),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('list')
						.setDescription('View all automod-ignored channels'),
				),
		)

		// --- Log channels ---
		.addSubcommandGroup((group) =>
			group
				.setName('logs')
				.setDescription('Configure automod log channels')
				.addSubcommand((sub) =>
					sub
						.setName('mod-log')
						.setDescription('Set the mod log channel (automod warnings)')
						.addChannelOption((option) =>
							option
								.setName('channel')
								.setDescription('Channel for mod logs')
								.setRequired(true),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('audit-log')
						.setDescription('Set the audit log channel (message edits/deletes)')
						.addChannelOption((option) =>
							option
								.setName('channel')
								.setDescription('Channel for audit logs')
								.setRequired(true),
						),
				),
		)

		// --- Feature toggles (anti-*) ---
		.addSubcommandGroup((group) => {
			group
				.setName('toggle')
				.setDescription('Enable or disable specific automod protections');
			for (const [subName, [, displayName]] of Object.entries(
				automodFeatureMap,
			)) {
				group.addSubcommand((sub) =>
					sub
						.setName(subName)
						.setDescription(`Enable or disable ${displayName}`)
						.addStringOption(createToggleOption()),
				);
			}
			return group;
		})

		// --- AntiNuke ---
		.addSubcommandGroup((group) =>
			group
				.setName('antinuke')
				.setDescription('Configure the AntiNuke protection system')
				.addSubcommand((sub) =>
					sub
						.setName('toggle')
						.setDescription('Enable or disable the entire AntiNuke system')
						.addStringOption((option) =>
							option
								.setName('status')
								.setDescription('Enable or disable')
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
								),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('module')
						.setDescription('Enable or disable a specific AntiNuke module')
						.addStringOption((option) =>
							option
								.setName('module')
								.setDescription('Which module')
								.setRequired(true)
								.addChoices(
									{
										name: 'Mass Ban',
										value: 'massBan',
									},
									{
										name: 'Mass Kick',
										value: 'massKick',
									},
									{
										name: 'Channel Create',
										value: 'channelCreate',
									},
									{
										name: 'Channel Delete',
										value: 'channelDelete',
									},
									{
										name: 'Role Delete',
										value: 'roleDelete',
									},
									{
										name: 'Webhook Create',
										value: 'webhookCreate',
									},
									{
										name: 'Admin Grant',
										value: 'adminGrant',
									},
								),
						)
						.addStringOption((option) =>
							option
								.setName('status')
								.setDescription('Enable or disable this module')
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
								),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('threshold')
						.setDescription('Set threshold (count + window) for a module')
						.addStringOption((option) =>
							option
								.setName('module')
								.setDescription('Which module')
								.setRequired(true)
								.addChoices(
									{
										name: 'Mass Ban',
										value: 'massBan',
									},
									{
										name: 'Mass Kick',
										value: 'massKick',
									},
									{
										name: 'Channel Create',
										value: 'channelCreate',
									},
									{
										name: 'Channel Delete',
										value: 'channelDelete',
									},
									{
										name: 'Role Delete',
										value: 'roleDelete',
									},
									{
										name: 'Webhook Create',
										value: 'webhookCreate',
									},
								),
						)
						.addIntegerOption((option) =>
							option
								.setName('count')
								.setDescription('Number of actions before triggering (e.g. 3)')
								.setRequired(true)
								.setMinValue(1)
								.setMaxValue(20),
						)
						.addIntegerOption((option) =>
							option
								.setName('seconds')
								.setDescription('Time window in seconds (e.g. 10)')
								.setRequired(true)
								.setMinValue(3)
								.setMaxValue(300),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('action')
						.setDescription('Set the punishment action for a module')
						.addStringOption((option) =>
							option
								.setName('module')
								.setDescription('Which module')
								.setRequired(true)
								.addChoices(
									{
										name: 'Mass Ban',
										value: 'massBan',
									},
									{
										name: 'Mass Kick',
										value: 'massKick',
									},
									{
										name: 'Channel Create',
										value: 'channelCreate',
									},
									{
										name: 'Channel Delete',
										value: 'channelDelete',
									},
									{
										name: 'Role Delete',
										value: 'roleDelete',
									},
									{
										name: 'Webhook Create',
										value: 'webhookCreate',
									},
									{
										name: 'Admin Grant',
										value: 'adminGrant',
									},
								),
						)
						.addStringOption((option) =>
							option
								.setName('action')
								.setDescription('Action to take')
								.setRequired(true)
								.addChoices(
									{
										name: 'Kick',
										value: 'kick',
									},
									{
										name: 'Ban',
										value: 'ban',
									},
									{
										name: 'Strip All Roles',
										value: 'dehoistRole',
									},
									{
										name: 'Log Only (no action)',
										value: 'none',
									},
								),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('whitelist')
						.setDescription('Add or remove a user/role from antinuke immunity')
						.addStringOption((option) =>
							option
								.setName('action')
								.setDescription('Add or remove')
								.setRequired(true)
								.addChoices(
									{
										name: 'Add',
										value: 'add',
									},
									{
										name: 'Remove',
										value: 'remove',
									},
								),
						)
						.addMentionableOption((option) =>
							option
								.setName('target')
								.setDescription('User or role')
								.setRequired(true),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('log-channel')
						.setDescription('Set a dedicated channel for AntiNuke alerts')
						.addChannelOption((option) =>
							option
								.setName('channel')
								.setDescription('Log channel')
								.setRequired(true),
						),
				)
				.addSubcommand((sub) =>
					sub
						.setName('status')
						.setDescription('View current AntiNuke configuration'),
				),
		);
	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers, models } = container;
		const { getChannelSafe, simpleContainer } = helpers.discord;
		const { ServerSetting } = models;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const group = interaction.options.getSubcommandGroup(false);
		const sub = interaction.options.getSubcommand();
		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;
		const target = interaction.options.getMentionable?.('target') ?? null;
		const channel = interaction.options.getChannel?.('channel') ?? null;
		const [serverSetting] = await ServerSetting.findOrCreateCache({
			where: {
				guildId,
			},
			defaults: {
				guildId,
				guildName,
			},
		});

		// -----------------------------------------------------------------------
		// feature toggles: /automod toggle <anti-*>
		// -----------------------------------------------------------------------
		if (group === 'toggle') {
			const entry = automodFeatureMap[sub];
			if (entry) {
				const [settingKey, featureName] = entry;
				const status = interaction.options.getString('status');
				serverSetting[settingKey] = status === 'enable';
				await serverSetting.save();
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						status === 'enable'
							? 'automod.setting.feature.enabled'
							: 'automod.setting.feature.disabled',
						{
							feature: featureName,
						},
					),
					{
						color: status === 'enable' ? 'Green' : 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}

		// -----------------------------------------------------------------------
		// whitelist
		// -----------------------------------------------------------------------
		if (group === 'whitelist') {
			let whitelist = ensureArray(serverSetting.whitelist);
			const targetId = target?.id;
			if (sub === 'add') {
				if (whitelist.includes(targetId)) {
					const components = await simpleContainer(
						interaction,
						await t(
							interaction,
							'automod.commands.setting.automod-setting.whitelist.already',
						),
						{
							color: 'Yellow',
						},
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				whitelist.push(targetId);
				serverSetting.whitelist = whitelist;
				serverSetting.changed('whitelist', true);
				await serverSetting.save();
				const isRole = interaction.guild.roles.cache.has(targetId);
				const components = await simpleContainer(
					interaction,
					isRole
						? await t(
								interaction,
								'automod.commands.setting.automod-setting.whitelist.add.role',
								{
									role: `<@&${targetId}>`,
								},
							)
						: await t(
								interaction,
								'automod.commands.setting.automod-setting.whitelist.add.user',
								{
									user: `<@${targetId}>`,
								},
							),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (sub === 'remove') {
				if (!whitelist.includes(targetId)) {
					const components = await simpleContainer(
						interaction,
						await t(
							interaction,
							'automod.commands.setting.automod-setting.whitelist.notfound',
						),
						{
							color: 'Red',
						},
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				whitelist = whitelist.filter((id) => id !== targetId);
				serverSetting.whitelist = whitelist;
				serverSetting.changed('whitelist', true);
				await serverSetting.save();
				const isRole = interaction.guild.roles.cache.has(targetId);
				const components = await simpleContainer(
					interaction,
					isRole
						? await t(
								interaction,
								'automod.commands.setting.automod-setting.whitelist.remove.role',
								{
									role: `<@&${targetId}>`,
								},
							)
						: await t(
								interaction,
								'automod.commands.setting.automod-setting.whitelist.remove.user',
								{
									user: `<@${targetId}>`,
								},
							),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (sub === 'list') {
				if (whitelist.length === 0) {
					const components = await simpleContainer(
						interaction,
						await t(
							interaction,
							'automod.commands.setting.automod-setting.whitelist.empty',
						),
						{
							color: 'Yellow',
						},
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				const whitelistString = whitelist
					.map((id) => {
						if (interaction.guild.members.cache.has(id)) return `<@${id}>`;
						if (interaction.guild.roles.cache.has(id)) return `<@&${id}>`;
						return `\`${id}\``;
					})
					.join('\n');
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.whitelist.list',
						{
							list: whitelistString,
						},
					),
					{
						color: kythiaConfig.bot.color,
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}

		// -----------------------------------------------------------------------
		// badwords
		// -----------------------------------------------------------------------
		if (group === 'badwords') {
			let badwords = ensureArray(serverSetting.badwords);
			const word = interaction.options.getString('word');
			if (sub === 'add') {
				if (badwords.includes(word.toLowerCase())) {
					const components = await simpleContainer(
						interaction,
						await t(
							interaction,
							'automod.commands.setting.automod-setting.badword.already',
						),
						{
							color: 'Yellow',
						},
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				badwords.push(word.toLowerCase());
				serverSetting.badwords = badwords;
				serverSetting.changed('badwords', true);
				await serverSetting.save();
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.badword.add',
						{
							word,
						},
					),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (sub === 'remove') {
				if (!badwords.includes(word.toLowerCase())) {
					const components = await simpleContainer(
						interaction,
						await t(
							interaction,
							'automod.commands.setting.automod-setting.badword.notfound',
						),
						{
							color: 'Red',
						},
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				badwords = badwords.filter((w) => w !== word.toLowerCase());
				serverSetting.badwords = badwords;
				serverSetting.changed('badwords', true);
				await serverSetting.save();
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.badword.remove',
						{
							word,
						},
					),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (sub === 'list') {
				if (badwords.length === 0) {
					const components = await simpleContainer(
						interaction,
						await t(
							interaction,
							'automod.commands.setting.automod-setting.badword.empty',
						),
						{
							color: 'Yellow',
						},
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				const badwordsString = badwords.map((w) => `• \`${w}\``).join('\n');
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.badword.list',
						{
							list: badwordsString,
						},
					),
					{
						color: kythiaConfig.bot.color,
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}

		// -----------------------------------------------------------------------
		// badword-whitelist
		// -----------------------------------------------------------------------
		if (group === 'badword-whitelist') {
			let badwordWhitelist = ensureArray(serverSetting.badwordWhitelist);
			const word = interaction.options.getString('word');
			if (sub === 'add') {
				if (badwordWhitelist.includes(word.toLowerCase())) {
					const components = await simpleContainer(
						interaction,
						await t(
							interaction,
							'automod.commands.setting.automod-setting.badword.whitelist.already',
						),
						{
							color: 'Yellow',
						},
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				badwordWhitelist.push(word.toLowerCase());
				serverSetting.badwordWhitelist = badwordWhitelist;
				serverSetting.changed('badwordWhitelist', true);
				await serverSetting.save();
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.badword.whitelist.add',
						{
							word,
						},
					),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (sub === 'remove') {
				if (!badwordWhitelist.includes(word.toLowerCase())) {
					const components = await simpleContainer(
						interaction,
						await t(
							interaction,
							'automod.commands.setting.automod-setting.badword.whitelist.notfound',
						),
						{
							color: 'Red',
						},
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				badwordWhitelist = badwordWhitelist.filter(
					(w) => w !== word.toLowerCase(),
				);
				serverSetting.badwordWhitelist = badwordWhitelist;
				serverSetting.changed('badwordWhitelist', true);
				await serverSetting.save();
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.badword.whitelist.remove',
						{
							word,
						},
					),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (sub === 'list') {
				if (badwordWhitelist.length === 0) {
					const components = await simpleContainer(
						interaction,
						await t(
							interaction,
							'automod.commands.setting.automod-setting.badword.whitelist.empty',
						),
						{
							color: 'Yellow',
						},
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				const list = badwordWhitelist.map((w) => `• \`${w}\``).join('\n');
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.badword.whitelist.list',
						{
							list,
						},
					),
					{
						color: kythiaConfig.bot.color,
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}

		// -----------------------------------------------------------------------
		// ignored-channels
		// -----------------------------------------------------------------------
		if (group === 'ignored-channels') {
			let ignoredChannels = ensureArray(serverSetting.ignoredChannels);
			const targetId = channel?.id;
			if (sub === 'add') {
				if (ignoredChannels.includes(targetId)) {
					const components = await simpleContainer(
						interaction,
						await t(
							interaction,
							'automod.commands.setting.automod-setting.exception.channel.already',
						),
						{
							color: 'Yellow',
						},
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				ignoredChannels.push(targetId);
				serverSetting.ignoredChannels = ignoredChannels;
				serverSetting.changed('ignoredChannels', true);
				await serverSetting.save();
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.exception.channel.add',
						{
							channel: `<#${targetId}>`,
						},
					),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (sub === 'remove') {
				if (!ignoredChannels.includes(targetId)) {
					const components = await simpleContainer(
						interaction,
						await t(
							interaction,
							'automod.commands.setting.automod-setting.exception.channel.notfound',
						),
						{
							color: 'Red',
						},
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				ignoredChannels = ignoredChannels.filter((id) => id !== targetId);
				serverSetting.ignoredChannels = ignoredChannels;
				serverSetting.changed('ignoredChannels', true);
				await serverSetting.save();
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.exception.channel.remove',
						{
							channel: `<#${targetId}>`,
						},
					),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (sub === 'list') {
				if (ignoredChannels.length === 0) {
					const components = await simpleContainer(
						interaction,
						await t(
							interaction,
							'automod.commands.setting.automod-setting.exception.channel.empty',
						),
						{
							color: 'Yellow',
						},
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				const listItems = await Promise.all(
					ignoredChannels.map(async (id) => {
						const ch = await getChannelSafe(interaction.guild, id);
						return ch
							? `<#${id}>`
							: await t(
									interaction,
									'automod.commands.setting.automod-setting.invalid.id',
									{
										id,
									},
								);
					}),
				);
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.exception.channel.list',
						{
							list: listItems.join('\n'),
						},
					),
					{
						color: kythiaConfig.bot.color,
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}

		// -----------------------------------------------------------------------
		// logs
		// -----------------------------------------------------------------------
		if (group === 'logs') {
			if (!channel?.isTextBased()) {
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.log.channel.invalid',
					),
					{
						color: 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (sub === 'mod-log') {
				serverSetting.modLogChannelId = channel.id;
				await serverSetting.save();
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.mod.log.channel.set',
						{
							channel: `<#${channel.id}>`,
						},
					),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (sub === 'audit-log') {
				serverSetting.auditLogChannelId = channel.id;
				await serverSetting.save();
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.audit.log.channel.set',
						{
							channel: `<#${channel.id}>`,
						},
					),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}

		// -----------------------------------------------------------------------
		// antinuke
		// -----------------------------------------------------------------------
		if (group === 'antinuke') {
			const config = getAntiNukeConfig(serverSetting);
			const saveConfig = async (newConfig) => {
				serverSetting.antiNukeConfig = serializeConfig(newConfig);
				serverSetting.changed('antiNukeConfig', true);
				await serverSetting.save();
			};
			if (sub === 'toggle') {
				const status = interaction.options.getString('status');
				config.enabled = status === 'enable';
				await saveConfig(config);
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.antinuke.toggle.success',
						{
							status: status === 'enable' ? 'enabled' : 'disabled',
						},
					),
					{
						color: status === 'enable' ? 'Green' : 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (sub === 'module') {
				const moduleName = interaction.options.getString('module');
				const status = interaction.options.getString('status');
				if (!config.modules[moduleName]) {
					config.modules[moduleName] = DEFAULT_CONFIG().modules[moduleName] || {
						enabled: false,
						action: 'kick',
					};
				}
				config.modules[moduleName].enabled = status === 'enable';
				await saveConfig(config);
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.antinuke.module.success',
						{
							module: moduleName,
							status: status === 'enable' ? 'enabled' : 'disabled',
						},
					),
					{
						color: status === 'enable' ? 'Green' : 'Red',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (sub === 'threshold') {
				const moduleName = interaction.options.getString('module');
				const count = interaction.options.getInteger('count');
				const seconds = interaction.options.getInteger('seconds');
				if (!config.modules[moduleName]) {
					config.modules[moduleName] = DEFAULT_CONFIG().modules[moduleName] || {
						enabled: true,
						action: 'kick',
					};
				}
				config.modules[moduleName].threshold = count;
				config.modules[moduleName].window = seconds * 1000;
				await saveConfig(config);
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.antinuke.threshold.success',
						{
							module: moduleName,
							count: count,
							seconds: seconds,
						},
					),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (sub === 'action') {
				const moduleName = interaction.options.getString('module');
				const action = interaction.options.getString('action');
				if (!config.modules[moduleName]) {
					config.modules[moduleName] = DEFAULT_CONFIG().modules[moduleName] || {
						enabled: true,
					};
				}
				config.modules[moduleName].action = action;
				await saveConfig(config);
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.antinuke.action.success',
						{
							module: moduleName,
							action: action,
						},
					),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (sub === 'whitelist') {
				const action = interaction.options.getString('action');
				const targetMention = interaction.options.getMentionable('target');
				const targetId = targetMention?.id;
				const isRole = interaction.guild.roles.cache.has(targetId);
				const listKey = isRole ? 'whitelistedRoles' : 'whitelistedUsers';
				if (!Array.isArray(config[listKey])) config[listKey] = [];
				if (action === 'add') {
					if (!config[listKey].includes(targetId))
						config[listKey].push(targetId);
				} else {
					config[listKey] = config[listKey].filter((id) => id !== targetId);
				}
				await saveConfig(config);
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.antinuke.whitelist.success',
						{
							target: isRole ? `<@&${targetId}>` : `<@${targetId}>`,
							action: action === 'add' ? 'added to' : 'removed from',
						},
					),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (sub === 'log-channel') {
				const logCh = interaction.options.getChannel('channel');
				if (!logCh?.isTextBased()) {
					const components = await simpleContainer(
						interaction,
						await t(
							interaction,
							'automod.commands.setting.automod-setting.antinuke.log_channel.invalid',
						),
						{
							color: 'Red',
						},
					);
					return interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				config.logChannelId = logCh.id;
				await saveConfig(config);
				const components = await simpleContainer(
					interaction,
					await t(
						interaction,
						'automod.commands.setting.automod-setting.antinuke.log_channel.success',
						{
							channel: `<#${logCh.id}>`,
						},
					),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (sub === 'status') {
				const moduleLines = Object.entries(config.modules)
					.map(([name, mod]) => {
						const icon = mod.enabled ? '🟢' : '🔴';
						const threshold = mod.threshold
							? ` · **${mod.threshold}** in **${(mod.window || 10000) / 1000}s**`
							: '';
						return `${icon} \`${name}\` — ${mod.action}${threshold}`;
					})
					.join('\n');
				const wlUsers =
					(config.whitelistedUsers || []).map((id) => `<@${id}>`).join(', ') ||
					'None';
				const wlRoles =
					(config.whitelistedRoles || []).map((id) => `<@&${id}>`).join(', ') ||
					'None';
				const logCh = config.logChannelId
					? `<#${config.logChannelId}>`
					: 'Defaults to audit log channel';
				const title = await t(
					interaction,
					'automod.commands.setting.automod-setting.antinuke.status.title',
				);
				const systemStr = await t(
					interaction,
					'automod.commands.setting.automod-setting.antinuke.status.system',
					{
						status: config.enabled ? '🟢 Enabled' : '🔴 Disabled',
					},
				);
				const logChannelStr = await t(
					interaction,
					'automod.commands.setting.automod-setting.antinuke.status.log_channel',
					{
						channel: logCh,
					},
				);
				const modulesStr = await t(
					interaction,
					'automod.commands.setting.automod-setting.antinuke.status.modules',
					{
						modules: moduleLines,
					},
				);
				const immunityStr = await t(
					interaction,
					'automod.commands.setting.automod-setting.antinuke.status.immunity',
					{
						users: wlUsers,
						roles: wlRoles,
					},
				);
				const components = await simpleContainer(
					interaction,
					`${title}\n\n${systemStr}\n${logChannelStr}\n\n${modulesStr}\n\n${immunityStr}`,
					{
						color: kythiaConfig.bot.color,
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
					allowedMentions: {
						parse: [],
					},
				});
			}
		}
	}
}
exports.default = AutomodSettingCommand;
