/**
 * @namespace: addons/core/commands/autosetup/autosetup.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autosetup')
        .setDescription('⚙️ Automatically setup certain features')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setContexts(InteractionContextType.Guild)
        // .addSubcommand((subcommand) =>
        //     subcommand
        //         .setName('testimony')
        //         .setDescription('Automatically setup testimony & feedback channels')
        //         .addBooleanOption((option) =>
        //             option.setName('newcategory').setDescription('Create a new category or not').setRequired(true)
        //         )
        //         .addStringOption((option) =>
        //             option.setName('category_id').setDescription('Use an existing category ID (ignore if creating new)').setRequired(false)
        //         )
        // )
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
        // .addSubcommand((subcommand) =>
        //     subcommand
        //         .setName('minecraft')
        //         .setDescription('Automatically setup Minecraft server statistics channels')
        //         .addBooleanOption((option) =>
        //             option.setName('newcategory').setDescription('Create a new category or not').setRequired(true)
        //         )
        //         .addStringOption((option) =>
        //             option.setName('category_id').setDescription('Use an existing category ID (ignore if creating new)').setRequired(false)
        //         )
        // )
        // .addSubcommand((subcommand) =>
        //     subcommand
        //         .setName('store')
        //         .setDescription('Automatically setup open/close store channel')
        //         .addBooleanOption((option) =>
        //             option.setName('newcategory').setDescription('Create a new category or not').setRequired(true)
        //         )
        //         .addStringOption((option) =>
        //             option
        //                 .setName('type')
        //                 .setDescription('Store action type (change channel name, send message, or both).')
        //                 .addChoices(
        //                     { name: 'Change Channel Name', value: 'channelname' },
        //                     { name: 'Send Embed Message', value: 'channelmessage' },
        //                     { name: 'Name + Message', value: 'channelnameandmessage' }
        //                 )
        //                 .setRequired(true)
        //         )
        //         .addStringOption((option) =>
        //             option.setName('category_id').setDescription('Use an existing category ID (ignore if creating new)').setRequired(false)
        //         )
        // )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setContexts(InteractionContextType.Guild),
    voteLocked: true,
    permissions: PermissionFlagsBits.ManageGuild,
    botPermissions: PermissionFlagsBits.ManageGuild,
    async execute(interaction, container) {
        const { t, helpers, models } = container;
        const { embedFooter } = helpers.discord;
        const { ServerSetting } = models;

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
                        name: await t(interaction, 'core.autosetup.autosetup.testimony.category.name'),
                        type: ChannelType.GuildCategory,
                    });
                } else {
                    category = guild.channels.cache.get(existingCategoryId);
                    if (!category || category.type !== ChannelType.GuildCategory) {
                        return interaction.editReply({ content: await t(interaction, 'core.autosetup.autosetup.invalid.category.id') });
                    }
                }

                const testimonyChannel = await guild.channels.create({
                    name: await t(interaction, 'core.autosetup.autosetup.testimony.channel.name'),
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
                    name: await t(interaction, 'core.autosetup.autosetup.feedback.channel.name'),
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
                    name: await t(interaction, 'core.autosetup.autosetup.testimony.count.channel.name', { count: 0 }),
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
                serverSetting.testimonyCountFormat = await t(interaction, 'core.autosetup.autosetup.testimony.count.channel.name', {
                    count: '{count}',
                });

                await serverSetting.saveAndUpdateCache('guildId');

                await interaction.editReply({
                    content: await t(interaction, 'core.autosetup.autosetup.testimony.success', {
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
                        name: await t(interaction, 'core.autosetup.autosetup.serverstats.category.name'),
                        type: ChannelType.GuildCategory,
                    });
                } else {
                    category = guild.channels.cache.get(existingCategoryId);
                    if (!category || category.type !== ChannelType.GuildCategory) {
                        return interaction.editReply({ content: await t(interaction, 'core.autosetup.autosetup.invalid.category.id') });
                    }
                }

                // Create stats channels
                const totalMembers = guild.memberCount;
                const boostCount = guild.premiumSubscriptionCount || 0;

                const totalMembersChannel = await guild.channels.create({
                    name: await t(interaction, 'core.autosetup.autosetup.serverstats.total', { memberstotal: totalMembers }),
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

                const boostChannel = await guild.channels.create({
                    name: await t(interaction, 'core.autosetup.autosetup.serverstats.boosts', { boosts: boostCount }),
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

                const serverSetting = await ServerSetting.getCache({ guildId: guild.id });
                serverSetting.serverStatsCategoryId = category.id;
                serverSetting.serverStatsOn = true;
                serverSetting.serverStats = [
                    {
                        channelId: totalMembersChannel.id,
                        format: await t(interaction, 'core.autosetup.autosetup.serverstats.total', { memberstotal: '{memberstotal}' }),
                        enabled: true,
                    },
                    {
                        channelId: boostChannel.id,
                        format: await t(interaction, 'core.autosetup.autosetup.serverstats.boosts', { boosts: '{boosts}' }),
                        enabled: true,
                    },
                ];
                await serverSetting.saveAndUpdateCache('guildId');

                await interaction.editReply({
                    content: await t(interaction, 'core.autosetup.autosetup.serverstats.success', {
                        total: totalMembersChannel.id,
                        boosts: boostChannel.id,
                    }),
                });
                break;
            }
            case 'minecraft': {
                let category = null;

                if (newCategory) {
                    category = await guild.channels.create({
                        name: await t(interaction, 'core.autosetup.autosetup.minecraft.category.name'),
                        type: ChannelType.GuildCategory,
                    });
                } else {
                    category = guild.channels.cache.get(existingCategoryId);
                    if (!category || category.type !== ChannelType.GuildCategory) {
                        return interaction.editReply({ content: await t(interaction, 'core.autosetup.autosetup.invalid.category.id') });
                    }
                }

                // simpan ke database
                const serverSetting = await ServerSetting.getCache({ guildId: guild.id });

                // ambil IP dan Port dulu biar bisa generate nama
                const ip = serverSetting.minecraftIp || '0.0.0.0';
                const port = serverSetting.minecraftPort || 25565;

                const ipName = await t(interaction, 'core.autosetup.autosetup.minecraft.ip.channel', { ip });
                const portName = await t(interaction, 'core.autosetup.autosetup.minecraft.port.channel', { port });
                const statusName = await t(interaction, 'core.autosetup.autosetup.minecraft.status.channel');
                const playersName = await t(interaction, 'core.autosetup.autosetup.minecraft.players.channel', { players: 0, max: 0 });

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
                    content: await t(interaction, 'core.autosetup.autosetup.minecraft.success', {
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
                        name: await t(interaction, 'core.autosetup.autosetup.store.category.name'),
                        type: ChannelType.GuildCategory,
                    });
                } else {
                    category = guild.channels.cache.get(existingCategoryId);
                    if (!category || category.type !== ChannelType.GuildCategory) {
                        return interaction.editReply({ content: await t(interaction, 'core.autosetup.autosetup.invalid.category.id') });
                    }
                }

                // Buat channel untuk open/close store
                const storeChannel = await guild.channels.create({
                    name: await t(interaction, 'core.autosetup.autosetup.store.open.channel.name'),
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
                const openName = await t(interaction, 'core.autosetup.autosetup.store.open.channel.name');
                const openTitle = await t(interaction, 'core.autosetup.autosetup.store.open.title');
                const openDesc = await t(interaction, 'core.autosetup.autosetup.store.open.desc');
                const openColor = 'Green';
                const closeName = await t(interaction, 'core.autosetup.autosetup.store.close.channel.name');
                const closeTitle = await t(interaction, 'core.autosetup.autosetup.store.close.title');
                const closeDesc = await t(interaction, 'core.autosetup.autosetup.store.close.desc');
                const closeColor = 'Red';

                // validasi kalau tipenya butuh message
                if (['channelmessage', 'channelnameandmessage'].includes(type)) {
                    if (!openTitle || !openDesc || !closeTitle || !closeDesc) {
                        return interaction.editReply({
                            content: await t(interaction, 'core.autosetup.autosetup.store.missing.embed.fields'),
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
                    content: await t(interaction, 'core.autosetup.autosetup.store.success', {
                        storeChannel: storeChannel.id,
                    }),
                });
                break;
            }
        }
    },
};
