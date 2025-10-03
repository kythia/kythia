/**
 * @namespace: addons/core/commands/autosetup/autosetup.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const ServerSetting = require('@coreModels/ServerSetting');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autosetup')
        .setDescription('⚙️ Automatically setup certain features')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setContexts(InteractionContextType.Guild)
        .addSubcommand((subcommand) =>
            subcommand
                .setName('testimony')
                .setDescription('Automatically setup testimony & feedback channels')
                .addBooleanOption((option) =>
                    option.setName('newcategory').setDescription('Create a new category or not').setRequired(true)
                )
                .addStringOption((option) =>
                    option.setName('category_id').setDescription('Use an existing category ID (ignore if creating new)').setRequired(false)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('server-stats')
                .setDescription('Automatically setup server statistics channels')
                .addBooleanOption((option) =>
                    option.setName('newcategory').setDescription('Create a new category or not').setRequired(true)
                )
                .addStringOption((option) =>
                    option.setName('category_id').setDescription('Use an existing category ID (ignore if creating new)').setRequired(false)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('minecraft')
                .setDescription('Automatically setup Minecraft server statistics channels')
                .addBooleanOption((option) =>
                    option.setName('newcategory').setDescription('Create a new category or not').setRequired(true)
                )
                .addStringOption((option) =>
                    option.setName('category_id').setDescription('Use an existing category ID (ignore if creating new)').setRequired(false)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('store')
                .setDescription('Automatically setup open/close store channel')
                .addBooleanOption((option) =>
                    option.setName('newcategory').setDescription('Create a new category or not').setRequired(true)
                )
                .addStringOption((option) =>
                    option
                        .setName('type')
                        .setDescription('Store action type (change channel name, send message, or both).')
                        .addChoices(
                            { name: 'Change Channel Name', value: 'channelname' },
                            { name: 'Send Embed Message', value: 'channelmessage' },
                            { name: 'Name + Message', value: 'channelnameandmessage' }
                        )
                        .setRequired(true)
                )
                .addStringOption((option) =>
                    option.setName('category_id').setDescription('Use an existing category ID (ignore if creating new)').setRequired(false)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setContexts(InteractionContextType.Guild),
    voteLocked: true,
    permissions: PermissionFlagsBits.ManageGuild,
    botPermissions: PermissionFlagsBits.ManageGuild,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const subcommand = interaction.options.getSubcommand();

        const guild = interaction.guild;
        const newCategory = interaction.options.getBoolean('newcategory');
        const existingCategoryId = interaction.options.getString('category_id');

        switch (subcommand) {
            case 'testimony': {
                let category = null;

                if (newCategory) {
                    category = await guild.channels.create({
                        name: await t(interaction, 'core_autosetup_autosetup_testimony_category_name'),
                        type: ChannelType.GuildCategory,
                    });
                } else {
                    category = guild.channels.cache.get(existingCategoryId);
                    if (!category || category.type !== ChannelType.GuildCategory) {
                        return interaction.editReply({ content: await t(interaction, 'core_autosetup_autosetup_invalid_category_id') });
                    }
                }

                const testimonyChannel = await guild.channels.create({
                    name: await t(interaction, 'core_autosetup_autosetup_testimony_channel_name'),
                    type: ChannelType.GuildText,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                });

                const feedbackChannel = await guild.channels.create({
                    name: await t(interaction, 'core_autosetup_autosetup_feedback_channel_name'),
                    type: ChannelType.GuildText,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                });

                const countChannel = await guild.channels.create({
                    name: await t(interaction, 'core_autosetup_autosetup_testimony_count_channel_name', { count: 0 }),
                    type: ChannelType.GuildVoice,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionFlagsBits.Connect],
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                });

                // simpan ke database
                const serverSetting = await ServerSetting.getCache({ guildId: guild.id });
                serverSetting.testimonyChannelId = testimonyChannel.id;
                serverSetting.feedbackChannelId = feedbackChannel.id;
                serverSetting.testimonyCountChannelId = countChannel.id;
                serverSetting.testimonyCountFormat = await t(interaction, 'core_autosetup_autosetup_testimony_count_channel_name', {
                    count: '{count}',
                });

                await serverSetting.saveAndUpdateCache('guildId');

                await interaction.editReply({
                    content: await t(interaction, 'core_autosetup_autosetup_testimony_success', {
                        testimonyChannel: testimonyChannel.id,
                        feedbackChannel: feedbackChannel.id,
                        countChannel: countChannel.id,
                    }),
                });
                break;
            }
            case 'server-stats': {
                let category = null;

                if (newCategory) {
                    category = await guild.channels.create({
                        name: await t(interaction, 'core_autosetup_autosetup_serverstats_category_name'),
                        type: ChannelType.GuildCategory,
                    });
                } else {
                    category = guild.channels.cache.get(existingCategoryId);
                    if (!category || category.type !== ChannelType.GuildCategory) {
                        return interaction.editReply({ content: await t(interaction, 'core_autosetup_autosetup_invalid_category_id') });
                    }
                }

                // Create stats channels
                const totalMembers = guild.memberCount;
                const onlineMembers = guild.members.cache.filter(
                    (m) => m.presence && ['online', 'idle', 'dnd'].includes(m.presence.status)
                ).size;
                const botCount = guild.members.cache.filter((m) => m.user.bot).size;
                const humanCount = totalMembers - botCount;

                const totalMembersChannel = await guild.channels.create({
                    name: await t(interaction, 'core_autosetup_autosetup_serverstats_total', { memberstotal: totalMembers }),
                    type: ChannelType.GuildVoice,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionFlagsBits.Connect],
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                });

                const onlineMembersChannel = await guild.channels.create({
                    name: await t(interaction, 'core_autosetup_autosetup_serverstats_online', { online: onlineMembers }),
                    type: ChannelType.GuildVoice,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionFlagsBits.Connect],
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                });

                const humanMembersChannel = await guild.channels.create({
                    name: await t(interaction, 'core_autosetup_autosetup_serverstats_humans', { humans: humanCount }),
                    type: ChannelType.GuildVoice,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionFlagsBits.Connect],
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                });

                const botMembersChannel = await guild.channels.create({
                    name: await t(interaction, 'core_autosetup_autosetup_serverstats_bots', { bots: botCount }),
                    type: ChannelType.GuildVoice,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionFlagsBits.Connect],
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                });

                // simpan ke database
                const serverSetting = await ServerSetting.getCache({ guildId: guild.id });
                serverSetting.serverStatsCategoryId = category.id;
                serverSetting.serverStatsOn = true;
                serverSetting.serverStats = [
                    {
                        channelId: totalMembersChannel.id,
                        format: await t(interaction, 'core_autosetup_autosetup_serverstats_total', { memberstotal: '{memberstotal}' }),
                        enabled: true,
                    },
                    {
                        channelId: onlineMembersChannel.id,
                        format: await t(interaction, 'core_autosetup_autosetup_serverstats_online', { online: '{online}' }),
                        enabled: true,
                    },
                    {
                        channelId: humanMembersChannel.id,
                        format: await t(interaction, 'core_autosetup_autosetup_serverstats_humans', { humans: '{humans}' }),
                        enabled: true,
                    },
                    {
                        channelId: botMembersChannel.id,
                        format: await t(interaction, 'core_autosetup_autosetup_serverstats_bots', { bots: '{bots}' }),
                        enabled: true,
                    },
                ];
                await serverSetting.saveAndUpdateCache('guildId');

                await interaction.editReply({
                    content: await t(interaction, 'core_autosetup_autosetup_serverstats_success', {
                        total: totalMembersChannel.id,
                        online: onlineMembersChannel.id,
                        humans: humanMembersChannel.id,
                        bots: botMembersChannel.id,
                    }),
                });
                break;
            }
            case 'minecraft': {
                let category = null;

                if (newCategory) {
                    category = await guild.channels.create({
                        name: await t(interaction, 'core_autosetup_autosetup_minecraft_category_name'),
                        type: ChannelType.GuildCategory,
                    });
                } else {
                    category = guild.channels.cache.get(existingCategoryId);
                    if (!category || category.type !== ChannelType.GuildCategory) {
                        return interaction.editReply({ content: await t(interaction, 'core_autosetup_autosetup_invalid_category_id') });
                    }
                }

                // simpan ke database
                const serverSetting = await ServerSetting.getCache({ guildId: guild.id });

                // ambil IP dan Port dulu biar bisa generate nama
                const ip = serverSetting.minecraftIp || '0.0.0.0';
                const port = serverSetting.minecraftPort || 25565;

                const ipName = await t(interaction, 'core_autosetup_autosetup_minecraft_ip_channel', { ip });
                const portName = await t(interaction, 'core_autosetup_autosetup_minecraft_port_channel', { port });
                const statusName = await t(interaction, 'core_autosetup_autosetup_minecraft_status_channel');
                const playersName = await t(interaction, 'core_autosetup_autosetup_minecraft_players_channel', { players: 0, max: 0 });

                // bikin channel satu per satu
                const ipChannel = await guild.channels.create({
                    name: ipName,
                    type: ChannelType.GuildVoice,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionFlagsBits.Connect],
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                });
                serverSetting.minecraftIpChannelId = ipChannel.id;

                const portChannel = await guild.channels.create({
                    name: portName,
                    type: ChannelType.GuildVoice,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionFlagsBits.Connect],
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                });
                serverSetting.minecraftPortChannelId = portChannel.id;

                const statusChannel = await guild.channels.create({
                    name: statusName,
                    type: ChannelType.GuildVoice,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionFlagsBits.Connect],
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                });
                serverSetting.minecraftStatusChannelId = statusChannel.id;

                const playersChannel = await guild.channels.create({
                    name: playersName,
                    type: ChannelType.GuildVoice,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            deny: [PermissionFlagsBits.Connect],
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                });
                serverSetting.minecraftPlayersChannelId = playersChannel.id;

                await serverSetting.saveAndUpdateCache('guildId');

                await interaction.editReply({
                    content: await t(interaction, 'core_autosetup_autosetup_minecraft_success', {
                        ip: ipChannel.id,
                        port: portChannel.id,
                        status: statusChannel.id,
                        players: playersChannel.id,
                    }),
                });
                break;
            }
            case 'store': {
                let category = null;

                if (newCategory) {
                    category = await guild.channels.create({
                        name: await t(interaction, 'core_autosetup_autosetup_store_category_name'),
                        type: ChannelType.GuildCategory,
                    });
                } else {
                    category = guild.channels.cache.get(existingCategoryId);
                    if (!category || category.type !== ChannelType.GuildCategory) {
                        return interaction.editReply({ content: await t(interaction, 'core_autosetup_autosetup_invalid_category_id') });
                    }
                }

                // Buat channel untuk open/close store
                const storeChannel = await guild.channels.create({
                    name: await t(interaction, 'core_autosetup_autosetup_store_open_channel_name'),
                    type: ChannelType.GuildText,
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: guild.roles.everyone,
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                });

                // Default values mirip dengan store.js
                const type = interaction.options.getString('type') || 'channelnameandmessage';
                const openName = await t(interaction, 'core_autosetup_autosetup_store_open_channel_name');
                const openTitle = await t(interaction, 'core_autosetup_autosetup_store_open_title');
                const openDesc = await t(interaction, 'core_autosetup_autosetup_store_open_desc');
                const openColor = 'Green';
                const closeName = await t(interaction, 'core_autosetup_autosetup_store_close_channel_name');
                const closeTitle = await t(interaction, 'core_autosetup_autosetup_store_close_title');
                const closeDesc = await t(interaction, 'core_autosetup_autosetup_store_close_desc');
                const closeColor = 'Red';

                // validasi kalau tipenya butuh message
                if (['channelmessage', 'channelnameandmessage'].includes(type)) {
                    if (!openTitle || !openDesc || !closeTitle || !closeDesc) {
                        return interaction.editReply({
                            content: await t(interaction, 'core_autosetup_autosetup_store_missing_embed_fields'),
                            ephemeral: true,
                        });
                    }
                }

                // Format embed OPEN
                const openEmbed =
                    openTitle || openDesc
                        ? [
                              {
                                  title: openTitle || undefined,
                                  description: openDesc || undefined,
                                  color: openColor,
                              },
                          ]
                        : [];

                // Format embed CLOSE
                const closeEmbed =
                    closeTitle || closeDesc
                        ? [
                              {
                                  title: closeTitle || undefined,
                                  description: closeDesc || undefined,
                                  color: closeColor,
                              },
                          ]
                        : [];

                // simpan ke database
                const serverSetting = await ServerSetting.getCache({ guildId: guild.id });
                serverSetting.openCloseChannelId = storeChannel.id;
                serverSetting.openCloseType = type;
                serverSetting.openChannelNameFormat = openName;
                serverSetting.closeChannelNameFormat = closeName;
                serverSetting.openChannelMessageFormat = openEmbed;
                serverSetting.closeChannelMessageFormat = closeEmbed;

                await serverSetting.saveAndUpdateCache('guildId');

                await interaction.editReply({
                    content: await t(interaction, 'core_autosetup_autosetup_store_success', {
                        storeChannel: storeChannel.id,
                    }),
                });
                break;
            }
        }
    },
};
