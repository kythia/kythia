/**
 * @namespace: addons/core/commands/setting/setting.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const { updateStats } = require('../../helpers/stats');
const ServerSetting = require('@coreModels/ServerSetting');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

const fs = require('fs');
const path = require('path');

const langDir = path.join(__dirname, '../../../src/lang');
let availableLanguages = [];

try {
    const files = fs.readdirSync(langDir);
    availableLanguages = files
        .filter((file) => file.endsWith('.json'))
        .map((file) => {
            const langCode = path.basename(file, '.json');
            try {
                const langData = JSON.parse(fs.readFileSync(path.join(langDir, file), 'utf8'));
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
} catch (e) {
    availableLanguages = [];
}
/**
 * Memastikan data dari DB yang seharusnya array benar-benar array.
 * @param {*} dbField - Field dari model Sequelize.
 * @returns {Array} - Field yang sudah dijamin berupa array.
 */
function ensureArray(dbField) {
    if (Array.isArray(dbField)) {
        return dbField;
    }
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

const createToggleOption = () => {
    return (opt) =>
        opt
            .setName('status')
            .setDescription('Select status')
            .setRequired(true)
            .addChoices({ name: 'Enable', value: 'enable' }, { name: 'Disable', value: 'disable' });
};

const featureMap = {
    // key: nama subcommand, value: [kolom_database, nama_fitur_untuk_user]
    'anti-invites': ['antiInviteOn', 'Anti-Invites'],
    'anti-links': ['antiLinkOn', 'Anti-Links'],
    'anti-spam': ['antiSpamOn', 'Anti-Spam'],
    'anti-badwords': ['antiBadwordOn', 'Anti-Badwords'],
    'server-stats': ['serverStatsOn', 'Server Stats'],
    leveling: ['levelingOn', 'Leveling'],
    economy: ['economyOn', 'Economy'],
    'welcome-in': ['welcomeInOn', 'Welcome In'],
    'welcome-out': ['welcomeOutOn', 'Welcome Out'],
    'minecraft-stats': ['minecraftStatsOn', 'Minecraft Stats'],
    streak: ['streakOn', 'Streak'],
    pet: ['petOn', 'Pet'],
    clan: ['clanOn', 'Clan'],
    adventure: ['adventureOn', 'Adventure'],
    nsfw: ['nsfwOn', 'NSFW'],
    checklist: ['checklistOn', 'Checklist'],
};

const toggleableFeatures = Object.keys(featureMap);

const command = new SlashCommandBuilder()
    .setName('set')
    .setDescription('⚙️ Settings bot configuration')
    .setContexts(InteractionContextType.Guild)
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommandGroup((group) =>
        group
            .setName('automod')
            .setDescription('🔒 Automod settings')
            .addSubcommand((sub) =>
                sub
                    .setName('whitelist')
                    .setDescription('🔄 Add or remove from whitelist')
                    .addStringOption((opt) =>
                        opt
                            .setName('action')
                            .setDescription('Add or remove')
                            .setRequired(true)
                            .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' })
                    )
                    .addMentionableOption((opt) => opt.setName('target').setDescription('User or role').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('badwords')
                    .setDescription('🔄 Add or remove bad words')
                    .addStringOption((opt) =>
                        opt
                            .setName('action')
                            .setDescription('Add or remove')
                            .setRequired(true)
                            .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' })
                    )
                    .addStringOption((opt) => opt.setName('word').setDescription('Word').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('badword-whitelist')
                    .setDescription('🔄 Add or remove bad word whitelist')
                    .addStringOption((opt) =>
                        opt
                            .setName('action')
                            .setDescription('Add or remove')
                            .setRequired(true)
                            .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' })
                    )
                    .addStringOption((opt) => opt.setName('word').setDescription('Word').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('exception-channel')
                    .setDescription('🔄 Add or remove exception channel')
                    .addStringOption((opt) =>
                        opt
                            .setName('action')
                            .setDescription('Add or remove')
                            .setRequired(true)
                            .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' })
                    )
                    .addChannelOption((opt) => opt.setName('channel').setDescription('Channel for exception').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('log-channel')
                    .setDescription('🔄 Channel to be used for automod logs')
                    .addChannelOption((opt) => opt.setName('channel').setDescription('Select channel for automod logs').setRequired(true))
            )
            .addSubcommand((sub) => sub.setName('badwords-list').setDescription('View bad words list'))
            .addSubcommand((sub) => sub.setName('badwords-whitelist-list').setDescription('View bad words whitelist list'))
            .addSubcommand((sub) => sub.setName('exception-channel-list').setDescription('View exception channels'))
            .addSubcommand((sub) => sub.setName('whitelist-list').setDescription('View whitelist'))
    )
    // SERVER STATS
    .addSubcommandGroup((group) =>
        group
            .setName('stats')
            .setDescription('📈 Server statistics settings')
            .addSubcommand((sub) =>
                sub
                    .setName('add')
                    .setDescription('📈 Add a new stat for a specific channel')
                    .addStringOption((opt) => opt.setName('format').setDescription('Stat format, e.g.: {memberstotal}').setRequired(true))
                    .addChannelOption((opt) =>
                        opt
                            .setName('channel')
                            .setDescription('📈 Select a channel to use as stat (if not selected, the bot will create a new channel)')
                            .setRequired(false)
                    )
            )
            .addSubcommand((sub) =>
                sub
                    .setName('edit')
                    .setDescription('📈 Edit the format of an existing stat channel')
                    .addStringOption((opt) =>
                        opt.setName('stats').setDescription('Select the stat to edit').setRequired(true).setAutocomplete(true)
                    )
                    .addChannelOption((opt) => opt.setName('channel').setDescription('📈 Edit stat channel').setRequired(false))
                    .addStringOption((opt) =>
                        opt.setName('format').setDescription('📈 Edit stat format, e.g.: {membersonline}').setRequired(false)
                    )
            )
            .addSubcommand((sub) =>
                sub
                    .setName('enable')
                    .setDescription('📈 Enable stat channel')
                    .addStringOption((opt) =>
                        opt.setName('stats').setDescription('Select the stat to enable').setRequired(true).setAutocomplete(true)
                    )
            )
            .addSubcommand((sub) =>
                sub
                    .setName('disable')
                    .setDescription('📈 Disable stat channel')
                    .addStringOption((opt) =>
                        opt.setName('stats').setDescription('Select the stat to disable').setRequired(true).setAutocomplete(true)
                    )
            )
            .addSubcommand((sub) =>
                sub
                    .setName('remove')
                    .setDescription('📈 Delete the stat and its channel')
                    .addStringOption((opt) =>
                        opt.setName('stats').setDescription('Select the stat to delete').setRequired(true).setAutocomplete(true)
                    )
            )
    )
    // ADMINS
    .addSubcommandGroup((group) =>
        group
            .setName('admin')
            .setDescription('🔒 Bot admin settings')
            .addSubcommand((sub) =>
                sub
                    .setName('edit')
                    .setDescription('🔒 Add or remove admin')
                    .addStringOption((opt) =>
                        opt
                            .setName('action')
                            .setDescription('Add or remove')
                            .setRequired(true)
                            .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' })
                    )
                    .addMentionableOption((opt) => opt.setName('target').setDescription('User or role admin').setRequired(true))
            )
            .addSubcommand((sub) => sub.setName('admin-list').setDescription('View admin list'))
    )
    // WELCOME IN - OUT
    .addSubcommandGroup((group) =>
        group
            .setName('welcome')
            .setDescription('👋 Welcome system settings')
            .addSubcommand((sub) =>
                sub
                    .setName('in-channel')
                    .setDescription('👋 Set welcome in channel')
                    .addChannelOption((opt) => opt.setName('channel').setDescription('Welcome in channel').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('out-channel')
                    .setDescription('👋 Set welcome out channel')
                    .addChannelOption((opt) => opt.setName('channel').setDescription('Welcome out channel').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('role')
                    .setDescription('👋 Set welcome role')
                    .addRoleOption((opt) => opt.setName('role').setDescription('Role for welcome').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('in-text')
                    .setDescription('👋 Set welcome in text')
                    .addStringOption((opt) => opt.setName('text').setDescription('Text for welcome in').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('out-text')
                    .setDescription('👋 Set welcome out text')
                    .addStringOption((opt) => opt.setName('text').setDescription('Text for welcome out').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('in-background')
                    .setDescription('👋 Set welcome in background')
                    .addStringOption((opt) => opt.setName('background').setDescription('Background for welcome in').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('out-background')
                    .setDescription('👋 Set welcome out background')
                    .addStringOption((opt) => opt.setName('background').setDescription('Background for welcome out').setRequired(true))
            )
    )
    // COOLDOWN
    .addSubcommandGroup((group) =>
        group
            .setName('cooldown')
            .setDescription('⏳ Cooldown settings in the system')
            .addSubcommand((sub) =>
                sub
                    .setName('daily')
                    .setDescription('⏳ Set daily cooldown')
                    .addIntegerOption((opt) => opt.setName('cooldown').setDescription('Cooldown in seconds').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('beg')
                    .setDescription('⏳ Set beg cooldown')
                    .addIntegerOption((opt) => opt.setName('cooldown').setDescription('Cooldown in seconds').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('lootbox')
                    .setDescription('⏳ Set lootbox cooldown')
                    .addIntegerOption((opt) => opt.setName('cooldown').setDescription('Cooldown in seconds').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('work')
                    .setDescription('⏳ Set work cooldown')
                    .addIntegerOption((opt) => opt.setName('cooldown').setDescription('Cooldown in seconds').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('rob')
                    .setDescription('⏳ Set rob cooldown')
                    .addIntegerOption((opt) => opt.setName('cooldown').setDescription('Cooldown in seconds').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('hack')
                    .setDescription('⏳Set hack cooldown')
                    .addIntegerOption((opt) => opt.setName('cooldown').setDescription('Cooldown in seconds').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('pet')
                    .setDescription('⏳ Set pet cooldown')
                    .addIntegerOption((opt) => opt.setName('cooldown').setDescription('Cooldown in seconds').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('gacha')
                    .setDescription('⏳ Set gacha cooldown')
                    .addIntegerOption((opt) => opt.setName('cooldown').setDescription('Cooldown in seconds').setRequired(true))
            )
    )
    // LEVELING
    .addSubcommandGroup((group) =>
        group
            .setName('leveling')
            .setDescription('🎮 Leveling system settings')
            .addSubcommand((sub) =>
                sub
                    .setName('channel')
                    .setDescription('🎮 Set channel for level up messages')
                    .addChannelOption((opt) => opt.setName('channel').setDescription('Channel for level up messages').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('cooldown')
                    .setDescription('🎮 Set XP gain cooldown')
                    .addIntegerOption((opt) => opt.setName('cooldown').setDescription('Cooldown in seconds').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('xp')
                    .setDescription('🎮 Set XP amount per message')
                    .addIntegerOption((opt) => opt.setName('xp').setDescription('XP gained per message').setRequired(true))
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
                            .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' })
                    )
                    .addIntegerOption((opt) => opt.setName('level').setDescription('Required level').setRequired(true))
                    .addRoleOption((opt) => opt.setName('role').setDescription('Role to be given').setRequired(true))
            )
    )
    // Minecraft server settings: ip, port, ip-channel, port-channel, status-channel
    .addSubcommandGroup((group) =>
        group
            .setName('minecraft')
            .setDescription('🎮 Minecraft server settings')
            .addSubcommand((sub) =>
                sub
                    .setName('ip')
                    .setDescription('🎮 Set Minecraft server IP')
                    .addStringOption((opt) => opt.setName('ip').setDescription('Minecraft server IP').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('port')
                    .setDescription('🎮 Set Minecraft server port')
                    .addIntegerOption((opt) => opt.setName('port').setDescription('Minecraft server port').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('ip-channel')
                    .setDescription('🎮 Set channel to display Minecraft server IP')
                    .addChannelOption((opt) => opt.setName('channel').setDescription('Channel for Minecraft IP').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('port-channel')
                    .setDescription('🎮 Set channel to display Minecraft server port')
                    .addChannelOption((opt) => opt.setName('channel').setDescription('Channel for Minecraft port').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('status-channel')
                    .setDescription('🎮 Set channel for Minecraft server status')
                    .addChannelOption((opt) => opt.setName('channel').setDescription('Channel for Minecraft status').setRequired(true))
            )
    )
    // LANGUAGE
    .addSubcommand((sub) =>
        sub
            .setName('language')
            .setDescription('🌐 Set bot language')
            .addStringOption((opt) =>
                Array.isArray(availableLanguages) && availableLanguages.length > 0
                    ? opt
                          .setName('lang')
                          .setDescription('Choose language')
                          .setRequired(true)
                          .addChoices(...availableLanguages)
                    : opt.setName('lang').setDescription('Choose language').setRequired(true)
            )
    )
    // TESTIMONY
    .addSubcommandGroup((group) =>
        group
            .setName('testimony')
            .setDescription('💬 Testimony system settings')
            .addSubcommand((sub) =>
                sub
                    .setName('testimony-channel')
                    .setDescription('💬 Set channel to send testimonies')
                    .addChannelOption((opt) => opt.setName('channel').setDescription('Testimony channel').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('feedback-channel')
                    .setDescription('💬 Set channel for testimony feedback')
                    .addChannelOption((opt) => opt.setName('channel').setDescription('Testimony feedback channel').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('count-channel')
                    .setDescription('💬 Set channel to display testimony count (name will be changed automatically)')
                    .addChannelOption((opt) => opt.setName('channel').setDescription('Testimony counter channel').setRequired(true))
            )
            .addSubcommand((sub) =>
                sub
                    .setName('count-format')
                    .setDescription('💬 Set channel name format for testimony counter')
                    .addStringOption((opt) =>
                        opt
                            .setName('format')
                            .setDescription('Channel name format, use {count} for the number. Example: testimony-{count}')
                            .setRequired(true)
                    )
            )
            .addSubcommand((sub) => sub.setName('reset-count').setDescription('💬 Reset testimony count to 0'))
            .addSubcommand((sub) =>
                sub
                    .setName('count')
                    .setDescription('💬 Change testimony count')
                    .addIntegerOption((opt) => opt.setName('count').setDescription('New testimony count').setRequired(true))
            )
    )
    // LEVELING
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
                            .addChoices({ name: 'Add', value: 'add' }, { name: 'Remove', value: 'remove' })
                    )
                    .addIntegerOption((opt) => opt.setName('streak').setDescription('Required streak').setRequired(true))
                    .addRoleOption((opt) => opt.setName('role').setDescription('Role to be given').setRequired(true))
            )
    )
    // STANDALONE
    .addSubcommand((sub) => sub.setName('view').setDescription('🔍 View all bot settings'))

    .addSubcommandGroup((group) => {
        group.setName('features').setDescription('🔄 Enable or disable a specific feature');

        // Loop untuk mengisi group 'toggle' ini
        for (const [subcommandName, [, featureDisplayName]] of Object.entries(featureMap)) {
            group.addSubcommand((sub) =>
                sub
                    .setName(subcommandName)
                    .setDescription(`Enable or disable the ${featureDisplayName} feature`)
                    .addStringOption(createToggleOption())
            );
        }

        return group;
    });
module.exports = {
    data: command,
    permissions: PermissionFlagsBits.ManageGuild,
    botPermissions: PermissionFlagsBits.ManageGuild,
    async autocomplete(interaction) {
        const focused = interaction.options.getFocused();
        const serverSetting = await ServerSetting.getCache({ guildId: interaction.guild.id });
        const stats = serverSetting?.serverStats ?? [];

        const filtered = stats
            .filter((stat) => {
                const channel = interaction.guild.channels.cache.get(stat.channelId);
                return channel && channel.name.toLowerCase().includes(focused.toLowerCase());
            })
            .map(async (stat) => {
                const channel = interaction.guild.channels.cache.get(stat.channelId);
                return {
                    name: `${channel.name} (${stat.enabled ? await t(interaction, 'core_setting_setting_stats_enabled') : await t(interaction, 'core_setting_setting_stats_disabled')})`,
                    value: channel.id,
                };
            });

        await interaction.respond(filtered.slice(0, 25)); // Discord limit 25
    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // GET
        const group = interaction.options.getSubcommandGroup(false);
        const sub = interaction.options.getSubcommand();
        const guildId = interaction.guild.id;
        const guildName = interaction.guild.name;
        const status = interaction.options.getString('status');
        const action = interaction.options.getString('action');
        const target = interaction.options.getMentionable('target');
        const channel = interaction.options.getChannel('channel');

        // FETCH OR CREATE BOT SETTING (Anti Race Condition Version)
        const [serverSetting, created] = await ServerSetting.findOrCreateWithCache({
            where: { guildId: guildId },
            defaults: { guildId: guildId, guildName: guildName },
        });

        // Jika setting baru saja dibuat, ada kemungkinan negative cache yang perlu dibersihkan.
        // Hook `afterSave` sudah menangani cache positif, tapi kita perlu membersihkan
        // "catatan hantu" secara manual di sini.
        if (created) {
            await ServerSetting.clearNegativeCache({ where: { guildId: guildId } });
            logger.info(`[CACHE] Cleared negative cache for new ServerSetting: ${guildId}`);
        }

        // EMBED
        const embed = new EmbedBuilder()
            .setTitle(await t(interaction, 'core_setting_setting_embed_title'))
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter(await embedFooter(interaction))
            .setTimestamp();

        if (sub === 'view') {
            if (!serverSetting || !serverSetting.dataValues) {
                embed.setDescription(await t(interaction, 'core_setting_setting_no_config'));
                return interaction.editReply({ embeds: [embed] });
            }
            const settings = serverSetting.dataValues;
            const kategori = { umum: [], boolean: [], array: [], lainnya: [] };
            function formatKey(key) {
                return key
                    .replace(/([a-z])([A-Z])/g, '$1 $2')
                    .replace(/^./, (str) => str.toUpperCase())
                    .replace(/\s([a-z])/g, (match, p1) => ` ${p1.toUpperCase()}`);
            }
            for (const [key, value] of Object.entries(settings)) {
                if (['id', 'guildId'].includes(key) || value === null) continue;
                const formattedKey = `\`${formatKey(key)}\``;
                if (typeof value === 'boolean') {
                    let displayKey = formattedKey.replace(/\sOn`$/, '`');
                    kategori.boolean.push(`${value ? '🟩 ・' + displayKey : '🟥 ・' + displayKey}`);
                } else if (Array.isArray(value)) {
                    if (value.length === 0) {
                        kategori.array.push(`🟪 ・${formattedKey} ➜ *${await t(interaction, 'core_setting_setting_empty')}*`);
                    } else {
                        let list = '';
                        value.forEach((item) => {
                            if (typeof item === 'object' && item.level && (item.roleId || item.role)) {
                                const roleDisplay = item.roleId ? `<@&${item.roleId}>` : `<@&${item.role}>`;
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
                    if (
                        key.toLowerCase().includes('channelid') ||
                        key.toLowerCase().includes('forumid') ||
                        (key.toLowerCase().includes('categoryid') && value)
                    ) {
                        displayValue = `<#${value}>`;
                    } else if (key.toLowerCase().includes('roleid')) {
                        displayValue = `<@&${value}>`;
                    }
                    kategori.umum.push(
                        `🟨 ・${formattedKey} ➜ ${displayValue || '*' + (await t(interaction, 'core_setting_setting_not_set')) + '*'}`
                    );
                } else {
                    kategori.lainnya.push(`⬛ ・${formattedKey}`);
                }
            }
            const descriptionBlocks = [];
            if (kategori.boolean.length) {
                descriptionBlocks.push(
                    `### ⭕ ${await t(interaction, 'core_setting_setting_section_boolean')}\n${kategori.boolean.join('\n')}`
                );
            }
            if (kategori.umum.length) {
                descriptionBlocks.push(`### ⚙️ ${await t(interaction, 'core_setting_setting_section_umum')}\n${kategori.umum.join('\n')}`);
            }
            if (kategori.array.length) {
                descriptionBlocks.push(
                    `### 🗃️ ${await t(interaction, 'core_setting_setting_section_array')}\n${kategori.array.join('\n\n')}`
                );
            }
            if (kategori.lainnya.length) {
                descriptionBlocks.push(
                    `### ❓ ${await t(interaction, 'core_setting_setting_section_lainnya')}\n${kategori.lainnya.join('\n')}`
                );
            }
            const finalDescription = descriptionBlocks.join('\n\n');
            embed
                .setTitle(await t(interaction, 'core_setting_setting_embed_title_view'))
                .setColor(kythia.bot.color)
                .setDescription(finalDescription || (await t(interaction, 'core_setting_setting_no_configured')))
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        // --- INI LOGIKA BARUNYA ---
        if (toggleableFeatures.includes(sub)) {
            const status = interaction.options.getString('status');
            const [settingKey, featureName] = featureMap[sub];

            // Asumsi kamu punya model ServerSetting yang sudah di-fetch
            // const serverSetting = await ServerSetting.getCache({ guildId: interaction.guild.id });

            serverSetting[settingKey] = status === 'enable';
            await serverSetting.saveAndUpdateCache(); // Asumsi method ini ada di KythiaModel

            const isEnabled = status === 'enable';
            const translationKey = isEnabled ? 'core_setting_setting_feature_enabled' : 'core_setting_setting_feature_disabled';

            embed.setDescription(await t(interaction, translationKey, { feature: featureName }));
            return interaction.editReply({ embeds: [embed] });
        }

        switch (group) {
            case 'automod': {
                switch (sub) {
                    case 'whitelist': {
                        // Di dalam case "whitelist":
                        const targetId = target.id;
                        let whitelist = ensureArray(serverSetting.whitelist); // Jadi satu baris!

                        if (action === 'add') {
                            if (whitelist.includes(targetId)) {
                                embed.setDescription(await t(interaction, 'core_setting_setting_whitelist_already'));
                                return interaction.editReply({ embeds: [embed] });
                            }
                            whitelist.push(targetId);
                            serverSetting.whitelist = whitelist;
                            serverSetting.changed('whitelist', true);
                            await serverSetting.saveAndUpdateCache('guildId');

                            const isRole = interaction.guild.roles.cache.has(targetId);
                            embed.setDescription(
                                isRole
                                    ? await t(interaction, 'core_setting_setting_whitelist_add_role', { role: `<@&${targetId}>` })
                                    : await t(interaction, 'core_setting_setting_whitelist_add_user', { user: `<@${targetId}>` })
                            );
                            return interaction.editReply({ embeds: [embed] });
                        } else if (action === 'remove') {
                            if (!whitelist.includes(targetId)) {
                                embed.setDescription(await t(interaction, 'core_setting_setting_whitelist_notfound'));
                                return interaction.editReply({ embeds: [embed] });
                            }
                            whitelist = whitelist.filter((id) => id !== targetId);
                            serverSetting.whitelist = whitelist;
                            serverSetting.changed('whitelist', true);
                            await serverSetting.saveAndUpdateCache('guildId');

                            const isRole = interaction.guild.roles.cache.has(targetId);
                            embed.setDescription(
                                isRole
                                    ? await t(interaction, 'core_setting_setting_whitelist_remove_role', { role: `<@&${targetId}>` })
                                    : await t(interaction, 'core_setting_setting_whitelist_remove_user', { user: `<@${targetId}>` })
                            );
                            return interaction.editReply({ embeds: [embed] });
                        } else {
                            embed.setDescription(await t(interaction, 'core_setting_setting_whitelist_invalid_action'));
                            return interaction.editReply({ embeds: [embed] });
                        }
                    }
                    case 'whitelist-list': {
                        let whitelist = serverSetting.whitelist;
                        if (typeof whitelist === 'string') {
                            try {
                                whitelist = JSON.parse(whitelist);
                            } catch {
                                whitelist = [];
                            }
                        }
                        if (!Array.isArray(whitelist)) whitelist = [];
                        if (whitelist.length === 0) {
                            embed.setDescription(await t(interaction, 'core_setting_setting_whitelist_empty'));
                            return interaction.editReply({ embeds: [embed] });
                        }
                        const whitelistString = whitelist
                            .map(async (id) => {
                                const member = interaction.guild.members.cache.get(id);
                                if (member) return `<@${id}>`;
                                const role = interaction.guild.roles.cache.get(id);
                                if (role) return `<@&${id}>`;
                                return await t(interaction, 'core_setting_setting_invalid_id', { id });
                            })
                            .join('\n');
                        embed.setDescription(await t(interaction, 'core_setting_setting_whitelist_list', { list: whitelistString }));
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'badwords': {
                        let badwords = serverSetting.badwords;
                        if (!Array.isArray(badwords) && typeof badwords === 'string') {
                            try {
                                badwords = JSON.parse(badwords);
                            } catch {
                                badwords = [];
                            }
                        } else if (!Array.isArray(badwords)) {
                            badwords = [];
                        }
                        const word = interaction.options.getString('word');
                        if (!word) {
                            embed.setDescription(await t(interaction, 'core_setting_setting_badword_word_required'));
                            return interaction.editReply({ embeds: [embed] });
                        }
                        if (action === 'add') {
                            if (badwords.includes(word.toLowerCase())) {
                                embed.setDescription(await t(interaction, 'core_setting_setting_badword_already'));
                                return interaction.editReply({ embeds: [embed] });
                            }
                            badwords.push(word.toLowerCase());
                            serverSetting.badwords = badwords;
                            serverSetting.changed('badwords', true);
                            await serverSetting.saveAndUpdateCache('guildId');
                            try {
                                const { regexCache } = require('../../system/automod');
                                if (regexCache && typeof regexCache.delete === 'function') {
                                    regexCache.delete(interaction.guild.id);
                                }
                            } catch {}
                            embed.setDescription(await t(interaction, 'core_setting_setting_badword_add', { word }));
                            return interaction.editReply({ embeds: [embed] });
                        } else if (action === 'remove') {
                            if (!badwords.includes(word.toLowerCase())) {
                                embed.setDescription(await t(interaction, 'core_setting_setting_badword_notfound'));
                                return interaction.editReply({ embeds: [embed] });
                            }
                            badwords = badwords.filter((w) => w !== word.toLowerCase());
                            serverSetting.badwords = badwords;
                            serverSetting.changed('badwords', true);
                            await serverSetting.saveAndUpdateCache('guildId');
                            embed.setDescription(await t(interaction, 'core_setting_setting_badword_remove', { word }));
                            return interaction.editReply({ embeds: [embed] });
                        }
                        break;
                    }
                    case 'badwords-list': {
                        let badwords = serverSetting.badwords;
                        if (typeof badwords === 'string') {
                            try {
                                badwords = JSON.parse(badwords);
                            } catch {
                                badwords = [];
                            }
                        }
                        if (!Array.isArray(badwords)) badwords = [];
                        if (badwords.length === 0) {
                            embed.setDescription(await t(interaction, 'core_setting_setting_badword_empty'));
                            return interaction.editReply({ embeds: [embed] });
                        }
                        const badwordsString = badwords.map((w) => `• \`${w}\``).join('\n');
                        embed.setDescription(await t(interaction, 'core_setting_setting_badword_list', { list: badwordsString }));
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'badword-whitelist': {
                        let badwordWhitelist = serverSetting.badwordWhitelist;
                        if (!Array.isArray(badwordWhitelist) && typeof badwordWhitelist === 'string') {
                            try {
                                badwordWhitelist = JSON.parse(badwordWhitelist);
                            } catch {
                                badwordWhitelist = [];
                            }
                        } else if (!Array.isArray(badwordWhitelist)) {
                            badwordWhitelist = [];
                        }
                        const word = interaction.options.getString('word');
                        if (!word) {
                            embed.setDescription(await t(interaction, 'core_setting_setting_badword_word_required'));
                            return interaction.editReply({ embeds: [embed] });
                        }
                        if (action === 'add') {
                            if (badwordWhitelist.includes(word.toLowerCase())) {
                                embed.setDescription(await t(interaction, 'core_setting_setting_badword_whitelist_already'));
                                return interaction.editReply({ embeds: [embed] });
                            }
                            badwordWhitelist.push(word.toLowerCase());
                            serverSetting.badwordWhitelist = badwordWhitelist;
                            serverSetting.changed('badwordWhitelist', true);
                            await serverSetting.saveAndUpdateCache('guildId');
                            try {
                                const { regexCache } = require('../../system/automod');
                                if (regexCache && typeof regexCache.delete === 'function') {
                                    regexCache.delete(interaction.guild.id);
                                }
                            } catch {}
                            embed.setDescription(await t(interaction, 'core_setting_setting_badword_whitelist_add', { word }));
                            return interaction.editReply({ embeds: [embed] });
                        } else if (action === 'remove') {
                            if (!badwordWhitelist.includes(word.toLowerCase())) {
                                embed.setDescription(await t(interaction, 'core_setting_setting_badword_whitelist_notfound'));
                                return interaction.editReply({ embeds: [embed] });
                            }
                            badwordWhitelist = badwordWhitelist.filter((w) => w !== word.toLowerCase());
                            serverSetting.badwordWhitelist = badwordWhitelist;
                            serverSetting.changed('badwordWhitelist', true);
                            await serverSetting.saveAndUpdateCache('guildId');
                            embed.setDescription(await t(interaction, 'core_setting_setting_badword_whitelist_remove', { word }));
                            return interaction.editReply({ embeds: [embed] });
                        }
                        break;
                    }
                    case 'badword-whitelist-list': {
                        let badwordWhitelist = serverSetting.badwordWhitelist;
                        if (typeof badwordWhitelist === 'string') {
                            try {
                                badwordWhitelist = JSON.parse(badwordWhitelist);
                            } catch {
                                badwordWhitelist = [];
                            }
                        }
                        if (!Array.isArray(badwordWhitelist)) badwordWhitelist = [];
                        if (badwordWhitelist.length === 0) {
                            embed.setDescription(await t(interaction, 'core_setting_setting_badword_whitelist_empty'));
                            return interaction.editReply({ embeds: [embed] });
                        }
                        const badwordWhitelistString = badwordWhitelist.map((w) => `• \`${w}\``).join('\n');
                        embed.setDescription(
                            await t(interaction, 'core_setting_setting_badword_whitelist_list', { list: badwordWhitelistString })
                        );
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'exception-channel': {
                        const targetId = channel.id;
                        let ignoredChannels = serverSetting.ignoredChannels;
                        if (!Array.isArray(ignoredChannels) && typeof ignoredChannels === 'string') {
                            try {
                                ignoredChannels = JSON.parse(ignoredChannels);
                            } catch {
                                ignoredChannels = [];
                            }
                        } else if (!Array.isArray(ignoredChannels)) {
                            ignoredChannels = [];
                        }
                        if (action === 'add') {
                            if (ignoredChannels.includes(targetId)) {
                                embed.setDescription(await t(interaction, 'core_setting_setting_exception_channel_already'));
                                return interaction.editReply({ embeds: [embed] });
                            }
                            ignoredChannels.push(targetId);
                            serverSetting.ignoredChannels = ignoredChannels;
                            serverSetting.changed('ignoredChannels', true);
                            await serverSetting.saveAndUpdateCache('guildId');
                            embed.setDescription(
                                await t(interaction, 'core_setting_setting_exception_channel_add', { channel: `<#${targetId}>` })
                            );
                            return interaction.editReply({ embeds: [embed] });
                        } else if (action === 'remove') {
                            if (!ignoredChannels.includes(targetId)) {
                                embed.setDescription(await t(interaction, 'core_setting_setting_exception_channel_notfound'));
                                return interaction.editReply({ embeds: [embed] });
                            }
                            ignoredChannels = ignoredChannels.filter((id) => id !== targetId);
                            serverSetting.ignoredChannels = ignoredChannels;
                            serverSetting.changed('ignoredChannels', true);
                            await serverSetting.saveAndUpdateCache('guildId');
                            embed.setDescription(
                                await t(interaction, 'core_setting_setting_exception_channel_remove', { channel: `<#${targetId}>` })
                            );
                            return interaction.editReply({ embeds: [embed] });
                        } else {
                            embed.setDescription(await t(interaction, 'core_setting_setting_exception_channel_invalid_action'));
                            return interaction.editReply({ embeds: [embed] });
                        }
                    }
                    case 'exception-channel-list': {
                        let ignoredChannels = serverSetting.ignoredChannels;
                        if (typeof ignoredChannels === 'string') {
                            try {
                                ignoredChannels = JSON.parse(ignoredChannels);
                            } catch {
                                ignoredChannels = [];
                            }
                        }
                        if (!Array.isArray(ignoredChannels)) ignoredChannels = [];
                        if (ignoredChannels.length === 0) {
                            embed.setDescription(await t(interaction, 'core_setting_setting_exception_channel_empty'));
                            return interaction.editReply({ embeds: [embed] });
                        }
                        const list = ignoredChannels
                            .map(async (id) => {
                                const ch = interaction.guild.channels.cache.get(id);
                                return ch ? `<#${id}>` : await t(interaction, 'core_setting_setting_invalid_id', { id });
                            })
                            .join('\n');
                        embed.setDescription(await t(interaction, 'core_setting_setting_exception_channel_list', { list }));
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'log-channel': {
                        const targetChannel = channel;
                        if (!targetChannel.isTextBased()) {
                            embed.setDescription(await t(interaction, 'core_setting_setting_log_channel_invalid'));
                            return interaction.editReply({ embeds: [embed] });
                        }
                        serverSetting.modLogChannelId = targetChannel.id;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(
                            await t(interaction, 'core_setting_setting_log_channel_set', { channel: `<#${targetChannel.id}>` })
                        );
                        return interaction.editReply({ embeds: [embed] });
                    }
                }
            }
            // case "feature": {
            //   // sub-nya sekarang cuma 'toggle'
            //   const featureToToggle = interaction.options.getString("feature_name");
            //   const status = interaction.options.getString("status");

            //   const featureMap = {
            //     "anti-invites": ["antiInviteOn", await t(interaction, "core_setting_setting_feature_anti_invites")],
            //     "anti-links": ["antiLinkOn", await t(interaction, "core_setting_setting_feature_anti_links")],
            //     "anti-spam": ["antiSpamOn", await t(interaction, "core_setting_setting_feature_anti_spam")],
            //     "anti-badwords": ["antiBadwordOn", await t(interaction, "core_setting_setting_feature_anti_badwords")],
            //     "server-stats": ["serverStatsOn", await t(interaction, "core_setting_setting_feature_server_stats")],
            //     economy: ["economyOn", await t(interaction, "core_setting_setting_feature_economy")],
            //     giveaway: ["giveawayOn", await t(interaction, "core_setting_setting_feature_giveaway")],
            //     invites: ["invitesOn", await t(interaction, "core_setting_setting_feature_invites")],
            //     suggestion: ["suggestionOn", await t(interaction, "core_setting_setting_feature_suggestion")],
            //     ticket: ["ticketOn", await t(interaction, "core_setting_setting_feature_ticket")],
            //     pet: ["petOn", await t(interaction, "core_setting_setting_feature_pet")],
            //     clan: ["clanOn", await t(interaction, "core_setting_setting_feature_clan")],
            //     adventure: ["adventureOn", await t(interaction, "core_setting_setting_feature_adventure")],
            //     leveling: ["levelingOn", await t(interaction, "core_setting_setting_feature_leveling")],
            //     "welcome-in": ["welcomeInOn", await t(interaction, "core_setting_setting_feature_welcome_in")],
            //     "welcome-out": ["welcomeOutOn", await t(interaction, "core_setting_setting_feature_welcome_out")],
            //     nsfw: ["nsfwOn", await t(interaction, "core_setting_setting_feature_nsfw")],
            //     checklist: ["checklistOn", await t(interaction, "core_setting_setting_feature_checklist")],
            //     "minecraft-stats": ["minecraftStatsOn", await t(interaction, "core_setting_setting_feature_minecraft_stats")],
            //     testimony: ["testimonyOn", await t(interaction, "core_setting_setting_feature_testimony")],
            //     music: ["musicOn", await t(interaction, "core_setting_setting_feature_music")],
            //     streak: ["streakOn", await t(interaction, "core_setting_setting_feature_streak")],
            //   };

            //   const [settingKey, featureName] = featureMap[featureToToggle];
            //   serverSetting[settingKey] = (status === "enable");
            //   await serverSetting.saveAndUpdateCache("guildId");

            //   embed.setDescription(
            //     await t(interaction, "core_setting_setting_feature_toggle", {
            //       feature: featureName,
            //       status: status === "enable"
            //         ? await t(interaction, "core_setting_setting_feature_enabled")
            //         : await t(interaction, "core_setting_setting_feature_disabled")
            //     })
            //   );
            //   return interaction.editReply({ embeds: [embed] });
            // }
            case 'features': {
                // 'sub' di sini adalah nama fiturnya (misal: "anti-invites")
                // Cek apakah subcommand ini ada di featureMap kita
                if (toggleableFeatures.includes(sub)) {
                    const status = interaction.options.getString('status');
                    const [settingKey, featureName] = featureMap[sub];

                    serverSetting[settingKey] = status === 'enable';
                    await serverSetting.saveAndUpdateCache();

                    embed.setDescription(`✅ Fitur **${featureName}** telah **di-${status === 'enable' ? 'aktifkan' : 'nonaktifkan'}**.`);
                    return interaction.editReply({ embeds: [embed] });
                }
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
                    case 'add': {
                        const format = interaction.options.getString('format');
                        let channel = interaction.options.getChannel('channel');
                        const hasAllowedPlaceholder = allowedPlaceholders.some((ph) => format.includes(ph));
                        if (!hasAllowedPlaceholder) {
                            return interaction.editReply({
                                content: await t(interaction, 'core_setting_setting_stats_format_invalid', {
                                    placeholders: allowedPlaceholders.join(', '),
                                }),
                                ephemeral: true,
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
                        const already = serverSetting.serverStats?.find((s) => s.channelId === channel.id);
                        if (already) {
                            return interaction.editReply({
                                content: await t(interaction, 'core_setting_setting_stats_already'),
                                ephemeral: true,
                            });
                        }
                        serverSetting.serverStats ??= [];
                        serverSetting.serverStats.push({ channelId: channel.id, format, enabled: true });
                        serverSetting.changed('serverStats', true);
                        await serverSetting.saveAndUpdateCache('guildId');
                        await updateStats(interaction, interaction.client, [serverSetting]);
                        return interaction.editReply({
                            content: await t(interaction, 'core_setting_setting_stats_add', { channel: `<#${channel.id}>`, format }),
                        });
                    }
                    case 'edit': {
                        const statsId = interaction.options.getString('stats');
                        const format = interaction.options.getString('format');
                        let stat = serverSetting.serverStats?.find((s) => s.channelId === statsId);
                        if (!stat)
                            return interaction.editReply({
                                content: await t(interaction, 'core_setting_setting_stats_notfound'),
                                ephemeral: true,
                            });
                        if (format) stat.format = format;
                        const hasAllowedPlaceholder = allowedPlaceholders.some((ph) => format.includes(ph));
                        if (!hasAllowedPlaceholder) {
                            return interaction.editReply({
                                content: await t(interaction, 'core_setting_setting_stats_format_invalid', {
                                    placeholders: allowedPlaceholders.join(', '),
                                }),
                                ephemeral: true,
                            });
                        }
                        serverSetting.changed('serverStats', true);
                        await serverSetting.saveAndUpdateCache('guildId');
                        await updateStats(interaction, interaction.client, [serverSetting]);
                        return interaction.editReply({
                            content: await t(interaction, 'core_setting_setting_stats_edit', { channel: `<#${statsId}>`, format }),
                        });
                    }
                    case 'enable': {
                        const statsId = interaction.options.getString('stats');
                        let stat = serverSetting.serverStats?.find((s) => s.channelId === statsId);
                        if (!stat)
                            return interaction.editReply({
                                content: await t(interaction, 'core_setting_setting_stats_notfound'),
                                ephemeral: true,
                            });
                        stat.enabled = true;
                        serverSetting.changed('serverStats', true);
                        await serverSetting.saveAndUpdateCache('guildId');
                        await updateStats(interaction, interaction.client, [serverSetting]);
                        return interaction.editReply({
                            content: await t(interaction, 'core_setting_setting_stats_enabled_msg', { channel: `<#${statsId}>` }),
                        });
                    }
                    case 'disable': {
                        const statsId = interaction.options.getString('stats');
                        let stat = serverSetting.serverStats?.find((s) => s.channelId === statsId);
                        if (!stat)
                            return interaction.editReply({
                                content: await t(interaction, 'core_setting_setting_stats_notfound'),
                                ephemeral: true,
                            });
                        stat.enabled = false;
                        serverSetting.changed('serverStats', true);
                        await serverSetting.saveAndUpdateCache('guildId');
                        await updateStats(interaction, interaction.client, [serverSetting]);
                        return interaction.editReply({
                            content: await t(interaction, 'core_setting_setting_stats_disabled_msg', { channel: `<#${statsId}>` }),
                        });
                    }
                    case 'remove': {
                        const statsId = interaction.options.getString('stats');
                        const channel = interaction.guild.channels.cache.get(statsId);
                        const before = serverSetting.serverStats?.length || 0;
                        serverSetting.serverStats = serverSetting.serverStats?.filter((s) => s.channelId !== statsId);
                        const after = serverSetting.serverStats?.length || 0;
                        try {
                            if (channel && channel.deletable) {
                                await channel.delete('Stat channel removed');
                            }
                        } catch (_) {}
                        serverSetting.changed('serverStats', true);
                        await serverSetting.saveAndUpdateCache('guildId');
                        const msg =
                            before === after
                                ? await t(interaction, 'core_setting_setting_stats_remove_notfound')
                                : await t(interaction, 'core_setting_setting_stats_remove_success');
                        await updateStats(interaction, interaction.client, [serverSetting]);
                        return interaction.editReply({ content: msg });
                    }
                }
            }
            case 'cooldown': {
                const cooldown = interaction.options.getInteger('cooldown');
                const cooldownMap = {
                    daily: ['dailyCooldown', await t(interaction, 'core_setting_setting_cooldown_daily')],
                    beg: ['begCooldown', await t(interaction, 'core_setting_setting_cooldown_beg')],
                    lootbox: ['lootboxCooldown', await t(interaction, 'core_setting_setting_cooldown_lootbox')],
                    work: ['workCooldown', await t(interaction, 'core_setting_setting_cooldown_work')],
                    rob: ['robCooldown', await t(interaction, 'core_setting_setting_cooldown_rob')],
                    hack: ['hackCooldown', await t(interaction, 'core_setting_setting_cooldown_hack')],
                    pet: ['petCooldown', await t(interaction, 'core_setting_setting_cooldown_pet')],
                    gacha: ['gachaCooldown', await t(interaction, 'core_setting_setting_cooldown_gacha')],
                };
                const [settingKey, featureName] = cooldownMap[sub];
                serverSetting[settingKey] = cooldown;
                await serverSetting.saveAndUpdateCache('guildId');
                embed.setDescription(await t(interaction, 'core_setting_setting_cooldown_set', { feature: featureName, cooldown }));
                return interaction.editReply({ embeds: [embed] });
            }
            case 'welcome': {
                switch (sub) {
                    case 'in-channel': {
                        const targetChannel = channel;
                        serverSetting.welcomeInChannelId = targetChannel.id;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(
                            await t(interaction, 'core_setting_setting_welcome_in_channel_set', { channel: `<#${targetChannel.id}>` })
                        );
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'out-channel': {
                        const targetChannel = channel;
                        serverSetting.welcomeOutChannelId = targetChannel.id;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(
                            await t(interaction, 'core_setting_setting_welcome_out_channel_set', { channel: `<#${targetChannel.id}>` })
                        );
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'role': {
                        const targetRole = interaction.options.getRole('role');
                        serverSetting.welcomeRoleId = targetRole.id;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(
                            await t(interaction, 'core_setting_setting_welcome_role_set', { role: `<@&${targetRole.id}>` })
                        );
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'in-text': {
                        const text = interaction.options.getString('text');
                        serverSetting.welcomeInText = text;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(await t(interaction, 'core_setting_setting_welcome_in_text_set', { text }));
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'out-text': {
                        const text = interaction.options.getString('text');
                        serverSetting.welcomeOutText = text;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(await t(interaction, 'core_setting_setting_welcome_out_text_set', { text }));
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'in-background': {
                        const background = interaction.options.getString('background');
                        if (!background.startsWith('http')) {
                            return interaction.editReply({
                                content: await t(interaction, 'core_setting_setting_welcome_in_background_invalid'),
                            });
                        }
                        serverSetting.welcomeInBackgroundUrl = background;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(await t(interaction, 'core_setting_setting_welcome_in_background_set', { background }));
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'out-background': {
                        const background = interaction.options.getString('background');
                        if (!background.startsWith('http')) {
                            return interaction.editReply({
                                content: await t(interaction, 'core_setting_setting_welcome_out_background_invalid'),
                            });
                        }
                        serverSetting.welcomeOutBackgroundUrl = background;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(await t(interaction, 'core_setting_setting_welcome_out_background_set', { background }));
                        return interaction.editReply({ embeds: [embed] });
                    }
                }
            }
            case 'leveling': {
                switch (sub) {
                    case 'channel': {
                        const targetChannel = interaction.options.getChannel('channel');
                        serverSetting.levelingChannelId = targetChannel.id;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(
                            await t(interaction, 'core_setting_setting_leveling_channel_set', { channel: `<#${targetChannel.id}>` })
                        );
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'cooldown': {
                        const cooldown = interaction.options.getInteger('cooldown');
                        serverSetting.levelingCooldown = cooldown * 1000;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(await t(interaction, 'core_setting_setting_leveling_cooldown_set', { cooldown }));
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'xp': {
                        const xp = interaction.options.getInteger('xp');
                        serverSetting.levelingXp = xp;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(await t(interaction, 'core_setting_setting_leveling_xp_set', { xp }));
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'rolereward': {
                        const role = interaction.options.getRole('role');
                        const level = interaction.options.getInteger('level');
                        const action = interaction.options.getString('action');
                        if (!serverSetting.roleRewards) serverSetting.roleRewards = [];
                        if (action === 'add') {
                            serverSetting.roleRewards = serverSetting.roleRewards.filter((r) => r.level !== level);
                            serverSetting.roleRewards.push({ level, role: role.id });
                            embed.setDescription(
                                await t(interaction, 'core_setting_setting_leveling_rolereward_add', { role: `<@&${role.id}>`, level })
                            );
                        } else if (action === 'remove') {
                            const initial = serverSetting.roleRewards.length;
                            serverSetting.roleRewards = serverSetting.roleRewards.filter((r) => r.level !== level);
                            if (serverSetting.roleRewards.length === initial) {
                                embed.setDescription(await t(interaction, 'core_setting_setting_leveling_rolereward_notfound', { level }));
                            } else {
                                embed.setDescription(await t(interaction, 'core_setting_setting_leveling_rolereward_remove', { level }));
                            }
                        }
                        serverSetting.changed('roleRewards', true);
                        await serverSetting.saveAndUpdateCache('guildId');
                        return interaction.editReply({ embeds: [embed] });
                    }
                }
            }
            case 'minecraft': {
                switch (sub) {
                    case 'ip': {
                        const ip = interaction.options.getString('ip');
                        serverSetting.minecraftIp = ip;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(await t(interaction, 'core_setting_setting_minecraft_ip_set', { ip }));
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'port': {
                        const port = interaction.options.getInteger('port');
                        serverSetting.minecraftPort = port;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(await t(interaction, 'core_setting_setting_minecraft_port_set', { port }));
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'ip-channel': {
                        serverSetting.minecraftIpChannelId = channel.id;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(
                            await t(interaction, 'core_setting_setting_minecraft_ip_channel_set', { channel: `<#${channel.id}>` })
                        );
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'port-channel': {
                        serverSetting.minecraftPortChannelId = channel.id;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(
                            await t(interaction, 'core_setting_setting_minecraft_port_channel_set', { channel: `<#${channel.id}>` })
                        );
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'status-channel': {
                        serverSetting.minecraftStatusChannelId = channel.id;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(
                            await t(interaction, 'core_setting_setting_minecraft_status_channel_set', { channel: `<#${channel.id}>` })
                        );
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'players-channel': {
                        serverSetting.minecraftPlayersChannelId = channel.id;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(
                            await t(interaction, 'core_setting_setting_minecraft_players_channel_set', { channel: `<#${channel.id}>` })
                        );
                        return interaction.editReply({ embeds: [embed] });
                    }
                }
            }
            case 'language': {
                switch (sub) {
                    case 'set': {
                        const lang = interaction.options.getString('lang');
                        serverSetting.lang = lang;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(await t(interaction, 'core_setting_setting_language_set', { lang }));
                        return interaction.editReply({ embeds: [embed] });
                    }
                }
            }
            case 'testimony': {
                switch (sub) {
                    case 'channel': {
                        if (!channel || channel.type !== 0) {
                            embed.setDescription(await t(interaction, 'core_setting_setting_testimony_channel_invalid'));
                            return interaction.editReply({ embeds: [embed] });
                        }
                        serverSetting.testimonyChannelId = channel.id;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(
                            await t(interaction, 'core_setting_setting_testimony_channel_set', { channel: `<#${channel.id}>` })
                        );
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'feedback-channel': {
                        if (!channel || channel.type !== 0) {
                            embed.setDescription(await t(interaction, 'core_setting_setting_testimony_channel_invalid'));
                            return interaction.editReply({ embeds: [embed] });
                        }
                        serverSetting.feedbackChannelId = channel.id;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(
                            await t(interaction, 'core_setting_setting_testimony_feedback_channel_set', { channel: `<#${channel.id}>` })
                        );
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'count-channel': {
                        if (!channel) {
                            embed.setDescription(await t(interaction, 'core_setting_setting_testimony_channel_invalid'));
                            return interaction.editReply({ embeds: [embed] });
                        }
                        serverSetting.testimonyCountChannelId = channel.id;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(
                            await t(interaction, 'core_setting_setting_testimony_count_channel_set', { channel: `<#${channel.id}>` })
                        );
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'count-format': {
                        const format = interaction.options.getString('format');
                        if (!format || !format.includes('{count}')) {
                            embed.setDescription(await t(interaction, 'core_setting_setting_testimony_count_format_invalid'));
                            return interaction.editReply({ embeds: [embed] });
                        }
                        serverSetting.testimonyCountFormat = format;
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(await t(interaction, 'core_setting_setting_testimony_count_format_set', { format }));
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'reset-count': {
                        serverSetting.testimonyCount = 0;
                        serverSetting.changed('testimonyCount');
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(await t(interaction, 'core_setting_setting_testimony_count_reset'));
                        if (serverSetting.testimonyCountChannelId) {
                            try {
                                const testimonyCountChannel = await interaction.client.channels
                                    .fetch(serverSetting.testimonyCountChannelId)
                                    .catch(() => null);
                                if (testimonyCountChannel) {
                                    let format = serverSetting.testimonyCountFormat || '{count} Testimonies';
                                    const newName = format.replace(/{count}/gi, serverSetting.testimonyCount);
                                    if (testimonyCountChannel.name !== newName) {
                                        await testimonyCountChannel.setName(newName);
                                    }
                                }
                            } catch (err) {}
                        }
                        return interaction.editReply({ embeds: [embed] });
                    }
                    case 'count': {
                        const count = interaction.options.getInteger('count');
                        if (typeof count !== 'number' || count < 0) {
                            embed.setDescription(await t(interaction, 'core_setting_setting_testimony_count_invalid'));
                            return interaction.editReply({ embeds: [embed] });
                        }
                        serverSetting.testimonyCount = count;
                        serverSetting.changed('testimonyCount');
                        await serverSetting.saveAndUpdateCache('guildId');
                        embed.setDescription(await t(interaction, 'core_setting_setting_testimony_count_set', { count }));
                        if (serverSetting.testimonyCountChannelId) {
                            try {
                                const testimonyCountChannel = await interaction.client.channels
                                    .fetch(serverSetting.testimonyCountChannelId)
                                    .catch(() => null);
                                if (testimonyCountChannel) {
                                    let format = serverSetting.testimonyCountFormat || '{count} Testimonies';
                                    const newName = format.replace(/{count}/gi, serverSetting.testimonyCount);
                                    if (testimonyCountChannel.name !== newName) {
                                        await testimonyCountChannel.setName(newName);
                                    }
                                }
                            } catch (err) {}
                        }
                        return interaction.editReply({ embeds: [embed] });
                    }
                }
            }
            case 'streak': {
                switch (sub) {
                    case 'rolereward': {
                        const role = interaction.options.getRole('role');
                        const streak = interaction.options.getInteger('streak');
                        const action = interaction.options.getString('action');
                        if (!serverSetting.streakRoleRewards) serverSetting.streakRoleRewards = [];
                        if (action === 'add') {
                            serverSetting.streakRoleRewards = serverSetting.streakRoleRewards.filter((r) => r.streak !== streak);
                            serverSetting.streakRoleRewards.push({ streak, role: role.id });
                            embed.setDescription(
                                await t(interaction, 'core_setting_setting_streak_rolereward_add', { role: `<@&${role.id}>`, streak })
                            );
                        } else if (action === 'remove') {
                            const initial = serverSetting.streakRoleRewards.length;
                            serverSetting.streakRoleRewards = serverSetting.streakRoleRewards.filter((r) => r.streak !== streak);
                            if (serverSetting.streakRoleRewards.length === initial) {
                                embed.setDescription(await t(interaction, 'core_setting_setting_streak_rolereward_notfound', { streak }));
                            } else {
                                embed.setDescription(await t(interaction, 'core_setting_setting_streak_rolereward_remove', { streak }));
                            }
                        }
                        serverSetting.changed('streakRoleRewards', true);
                        await serverSetting.saveAndUpdateCache('guildId');
                        return interaction.editReply({ embeds: [embed] });
                    }
                }
            }
            default: {
                embed.setDescription(await t(interaction, 'core_setting_setting_command_not_found'));
                return interaction.editReply({ embeds: [embed] });
            }
        }
    },
};
