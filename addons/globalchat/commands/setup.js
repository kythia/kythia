/**
 * @namespace: addons/globalchat/commands/setup.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { PermissionFlagsBits, ChannelType, EmbedBuilder, MessageFlags } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('setup')
            .setDescription('Setup a global chat channel for cross-server interaction')
            .addChannelOption((opt) =>
                opt
                    .setName('channel')
                    .setDescription('Select a channel for global chat (optional)')
                    .addChannelTypes(ChannelType.GuildText)
                    .setRequired(false)
            ),
    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers, logger, client } = container;
        const { GlobalChat } = models;
        const { embedFooter } = helpers.discord;

        const apiUrl = kythiaConfig?.addons?.globalchat?.apiUrl;
        const webhookName = 'Kythia Global Chat';

        await interaction.deferReply();

        let alreadySetup = false;
        let existingChannelId = null;

        try {
            const res = await fetch(`${apiUrl}/list`);
            const resJson = await res.json();

            const found = resJson?.data?.guilds?.find((g) => g.id === interaction.guild.id);

            if (found) {
                alreadySetup = true;
                existingChannelId = found.globalChannelId;
            }
        } catch (error) {
            logger.error('Failed to check existing guild from API:', error);
            const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'globalchat.setup.check.failed'));
            return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        let localDbChat = await GlobalChat.getCache({ guildId: interaction.guild.id });
        if (alreadySetup || localDbChat) {
            const embed = new EmbedBuilder().setColor('Red').setDescription(
                await t(interaction, 'globalchat.setup.already.set', {
                    channel: `<#${existingChannelId || localDbChat?.globalChannelId}>`,
                })
            );
            return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        let channel = interaction.options.getChannel('channel');
        let usedChannelId;
        let webhook;

        if (channel) {
            usedChannelId = channel.id;
            try {
                webhook = await channel.createWebhook({
                    name: webhookName,
                    avatar: client.user.displayAvatarURL(),
                });

                const setupEmbed = new EmbedBuilder()
                    .setTitle(await t(interaction, 'globalchat.setup.title'))
                    .setDescription(await t(interaction, 'globalchat.setup.intro.desc'))
                    .setColor(kythia.bot.color)
                    .setFooter(await embedFooter(interaction))
                    .setTimestamp(new Date());

                await channel.send({
                    embeds: [setupEmbed],
                });
            } catch (err) {
                const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'globalchat.setup.webhook.failed'));
                return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }
        } else {
            let createdChannel;
            try {
                createdChannel = await interaction.guild.channels.create({
                    name: '🌏┃global・chat',
                    type: ChannelType.GuildText,
                    topic: `${webhookName} | Make friends, share memes, and bring your best vibes with kythia! `,
                    permissionOverwrites: [
                        {
                            id: client.user.id,
                            type: 1,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.EmbedLinks,
                                PermissionFlagsBits.ReadMessageHistory,
                                PermissionFlagsBits.ManageMessages,
                            ],
                        },
                        {
                            id: interaction.guild.id,
                            type: 0,
                            allow: [
                                PermissionFlagsBits.ViewChannel,
                                PermissionFlagsBits.SendMessages,
                                PermissionFlagsBits.ReadMessageHistory,
                            ],
                        },
                    ],
                });

                try {
                    channel = await interaction.guild.channels.fetch(createdChannel.id);
                } catch (fetchError) {
                    logger.error('❌ Failed to re-fetch the newly created channel:', fetchError);
                }

                usedChannelId = channel.id;

                webhook = await channel.createWebhook({
                    name: webhookName,
                    avatar: client.user.displayAvatarURL(),
                });

                const setupEmbed = new EmbedBuilder()
                    .setTitle(await t(interaction, 'globalchat.setup.title'))
                    .setDescription(await t(interaction, 'globalchat.setup.intro.desc'))
                    .setColor(kythia.bot.color)
                    .setFooter(await embedFooter(interaction))
                    .setTimestamp(new Date());

                await channel.send({
                    embeds: [setupEmbed],
                });
            } catch (err) {
                logger.info(err);
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(await t(interaction, 'globalchat.setup.create.channel.failed'));
                return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
            }
        }

        try {
            await GlobalChat.create({
                guildId: interaction.guild.id,
                globalChannelId: usedChannelId,
                webhookId: webhook.id,
                webhookToken: webhook.token,
            });
        } catch (err) {
            logger.error('Failed to save GlobalChat to DB:', err);
        }

        try {
            await fetch(`${apiUrl}/add`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${kythiaConfig.addons.globalchat.apiKey}`,
                },
                body: JSON.stringify({
                    guildId: interaction.guild.id,
                    globalChannelId: usedChannelId,
                    webhookId: webhook.id,
                    webhookToken: webhook.token,
                }),
            });
        } catch (err) {
            const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'globalchat.setup.register.api.failed'));
            return interaction.editReply({ embeds: [embed], flags: MessageFlags.Ephemeral });
        }

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(await t(interaction, 'globalchat.setup.success', { channel: `<#${usedChannelId}>` }));
        return interaction.editReply({ embeds: [embed] });
    },
};
