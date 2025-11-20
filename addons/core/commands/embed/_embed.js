/**
 * @namespace: addons/core/commands/embed/_embed.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const Embed = require('@coreModels/Embed'); // Sesuaikan path
const { t } = require('@coreHelpers/translator');
const logger = require('@coreHelpers/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('💬 Make various embeds with buttons and fields.')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('create')
                .setDescription('Make an embed with buttons and fields.')
                .addChannelOption((option) => option.setName('channel').setDescription('Target channel for the embed').setRequired(true))
                .addStringOption((option) => option.setName('title').setDescription('Embed title').setRequired(false))
                .addStringOption((option) => option.setName('description').setDescription('Embed description').setRequired(false))
                .addStringOption((option) =>
                    option
                        .setName('buttons')
                        .setDescription('Buttons (Format: Text|LINK|Style(Primary, Secondary, Success, Danger), separated by ~~)')
                        .setRequired(false)
                )
                .addStringOption((option) =>
                    option.setName('fields').setDescription('Fields (Format: Title|Value, separated by ~~)').setRequired(false)
                )
                .addAttachmentOption((option) => option.setName('image').setDescription('Image').setRequired(false))
                .addStringOption((option) =>
                    option.setName('color').setDescription('Embed color (hex code or color name)').setRequired(false)
                )
                .addStringOption((option) => option.setName('footer').setDescription('Footer text').setRequired(false))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('delete')
                .setDescription('Delete embed react role')
                .addStringOption((option) =>
                    option.setName('message_id').setDescription('ID pesan embed react role yang ingin dihapus').setRequired(true)
                )
        )
        .addSubcommandGroup((group) =>
            group
                .setName('role')
                .setDescription('Create an embed with role buttons.')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('create')
                        .setDescription('Create an embed with role buttons')
                        .addStringOption((option) => option.setName('title').setDescription('Embed title').setRequired(true))
                        .addStringOption((option) => option.setName('description').setDescription('Embed description').setRequired(true))
                        .addChannelOption((option) =>
                            option.setName('channel').setDescription('Target channel for the embed').setRequired(true)
                        )
                        .addStringOption((option) =>
                            option
                                .setName('buttons')
                                .setDescription(
                                    'Buttons (Format: Label|RoleID|Style(Primary, Secondary, Success, Danger), separated by ~~)'
                                )
                                .setRequired(true)
                        )
                        .addStringOption((option) =>
                            option.setName('color').setDescription('Embed color (hex code or color name)').setRequired(false)
                        )
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.SendMessages)
        .setContexts(InteractionContextType.Guild),

    async execute(interaction) {
        await interaction.deferReply();

        const group = interaction.options.getSubcommandGroup(false);
        const subcommand = interaction.options.getSubcommand();

        switch (group) {
            case 'role': {
                switch (subcommand) {
                    case 'create': {
                        const title = interaction.options.getString('title');
                        let description = interaction.options.getString('description');
                        const channel = interaction.options.getChannel('channel');
                        const buttonsInput = interaction.options.getString('buttons');
                        const color = interaction.options.getString('color') || kythia.bot.color;

                        description = description.replace(/\\n/g, '\n');

                        const buttonsData = [];
                        const buttonEntries = buttonsInput.split(/~~\s*/);

                        for (const entry of buttonEntries) {
                            const [label, roleId, style] = entry.split('|');

                            if (!label || !roleId || !style) {
                                return interaction.editReply({
                                    content: await t(interaction, 'core.embed.embed.role.button.format.error'),
                                });
                            }

                            const validStyles = Object.keys(ButtonStyle).filter((k) => isNaN(k));
                            if (!validStyles.includes(style)) {
                                return interaction.editReply({
                                    content: await t(interaction, 'core.embed.embed.role.button.style.error', {
                                        styles: validStyles.join(', '),
                                    }),
                                });
                            }

                            buttonsData.push({
                                label,
                                roleId,
                                style: ButtonStyle[style],
                            });
                        }

                        for (const btn of buttonsData) {
                            const role = interaction.guild.roles.cache.get(btn.roleId);

                            if (!role) {
                                return interaction.editReply({
                                    content: await t(interaction, 'core.embed.embed.role.not.found', { roleId: btn.roleId }),
                                });
                            }

                            if (role.comparePositionTo(interaction.guild.members.me.roles.highest) >= 0) {
                                return interaction.editReply({
                                    content: await t(interaction, 'core.embed.embed.role.too.high', { roleName: role.name }),
                                });
                            }
                        }

                        let newEmbed;
                        try {
                            newEmbed = await Embed.create({
                                guildId: interaction.guildId,
                                title,
                                description,
                                channelId: channel.id,
                                buttons: buttonsData,
                            });
                        } catch (error) {
                            logger.error(error);
                            return interaction.editReply({ content: await t(interaction, 'core.embed.embed.db.save.error') });
                        }

                        const buttonsWithId = buttonsData.map((btn, i) => ({
                            ...btn,
                            customId: `reactrole-${newEmbed.id}-${i}`,
                        }));

                        newEmbed.buttons = buttonsWithId;
                        try {
                            await newEmbed.save();
                        } catch (error) {
                            logger.error(error);
                            return interaction.editReply({ content: await t(interaction, 'core.embed.embed.db.button.save.error') });
                        }

                        const actionRow = new ActionRowBuilder();
                        buttonsWithId.forEach((btn) => {
                            actionRow.addComponents(new ButtonBuilder().setCustomId(btn.customId).setLabel(btn.label).setStyle(btn.style));
                        });

                        const embed = new EmbedBuilder()
                            .setTitle(title)
                            .setDescription(description)
                            .setColor(color)
                            .setFooter({ text: 'Sistem', iconURL: interaction.client.user.displayAvatarURL() })
                            .setTimestamp();

                        let message;
                        try {
                            message = await channel.send({
                                embeds: [embed],
                                components: [actionRow],
                            });
                        } catch (error) {
                            logger.error(error);
                            return interaction.editReply({ content: await t(interaction, 'core.embed.embed.send.error') });
                        }

                        try {
                            await newEmbed.update({ messageId: message.id });
                        } catch (error) {
                            logger.error(error);
                        }

                        return interaction.editReply({
                            content: await t(interaction, 'core.embed.embed.sent.success', { channel: channel.toString() }),
                        });
                    }
                }
                break;
            }
            default: {
                switch (subcommand) {
                    case 'create': {
                        const channel = interaction.options.getChannel('channel');
                        const title = interaction.options.getString('title');
                        let description = interaction.options.getString('description');
                        const buttonsInput = interaction.options.getString('buttons') || null;
                        const fieldsInput = interaction.options.getString('fields') || null;
                        const footer = interaction.options.getString('footer');
                        const image = interaction.options.getAttachment('image');
                        const color = interaction.options.getString('color') || kythia.bot.color;

                        if (description) description = description.replace(/\\n/g, '\n');

                        if (buttonsInput) {
                            const buttonEntries = buttonsInput.split(/~~\s*/);
                            for (const entry of buttonEntries) {
                                const [label, link] = entry.split('|');
                                if (link && !/^https?:\/\/\S+$/i.test(link)) {
                                    return interaction.editReply({ content: await t(interaction, 'core.embed.embed.button.link.invalid') });
                                }
                            }
                        }

                        const buttonsData = [];
                        if (buttonsInput) {
                            const buttonEntries = buttonsInput.split(/~~\s*/);

                            for (const entry of buttonEntries) {
                                const [label, link] = entry.split('|');

                                if (!label || !link) {
                                    return interaction.editReply({ content: await t(interaction, 'core.embed.embed.button.format.error') });
                                }

                                buttonsData.push({
                                    label,
                                    link,
                                    style: ButtonStyle.Link,
                                });
                            }
                        }

                        const fieldsData = [];
                        if (fieldsInput) {
                            const fieldEntries = fieldsInput.split(/~~\s*/);

                            for (const entry of fieldEntries) {
                                const [name, value] = entry.split('|');

                                if (!name || !value) {
                                    return interaction.editReply({ content: await t(interaction, 'core.embed.embed.field.format.error') });
                                }

                                fieldsData.push({
                                    name,
                                    value,
                                    inline: false,
                                });
                            }
                        }

                        let newEmbed = null;
                        let storeToDb = !!interaction.guild;
                        if (storeToDb) {
                            try {
                                newEmbed = await Embed.create({
                                    guildId: interaction.guildId,
                                    title,
                                    description,
                                    channelId: channel.id,
                                    buttons: buttonsData,
                                    fields: fieldsData,
                                });
                            } catch (error) {
                                logger.error(error);
                                return interaction.editReply({ content: await t(interaction, 'core.embed.embed.db.save.error') });
                            }
                        }

                        const buttons = buttonsData;

                        if (storeToDb && newEmbed) {
                            newEmbed.buttons = buttons;
                            try {
                                await newEmbed.save();
                            } catch (error) {
                                logger.error(error);
                                return interaction.editReply({ content: await t(interaction, 'core.embed.embed.db.button.save.error') });
                            }
                        }

                        const rows = [];
                        let currentRow = new ActionRowBuilder();
                        buttonsData.forEach((btn) => {
                            if (currentRow.components.length === 5) {
                                rows.push(currentRow);
                                currentRow = new ActionRowBuilder();
                            }

                            currentRow.addComponents(new ButtonBuilder().setLabel(btn.label).setStyle(btn.style).setURL(btn.link));
                        });
                        if (currentRow.components.length > 0) rows.push(currentRow);

                        const embed = new EmbedBuilder().setColor(color);

                        if (title) embed.setTitle(title);
                        if (description) embed.setDescription(description);
                        if (footer) embed.setFooter({ text: footer });

                        if (fieldsData.length > 0) {
                            embed.addFields(...fieldsData);
                        }

                        if (image) {
                            embed.setImage(image.url);
                        }

                        let message;
                        try {
                            message = await channel.send({
                                embeds: [embed],
                                components: rows,
                            });
                        } catch (error) {
                            logger.error(error);
                            return interaction.editReply({ content: await t(interaction, 'core.embed.embed.send.error') });
                        }

                        if (storeToDb && newEmbed) {
                            try {
                                await newEmbed.update({ messageId: message.id });
                            } catch (error) {
                                logger.error(error);
                            }
                        }

                        return interaction.editReply({
                            content: await t(interaction, 'core.embed.embed.sent.success', { channel: channel.toString() }),
                        });
                    }

                    case 'delete': {
                        const messageId = interaction.options.getString('message_id');
                        if (!messageId) {
                            return interaction.editReply({ content: await t(interaction, 'core.embed.embed.delete.no.id') });
                        }

                        if (interaction.guild) {
                            const reactEmbed = await Embed.getCache({ messageId });

                            if (!reactEmbed) {
                                return interaction.editReply({
                                    content: await t(interaction, 'core.embed.embed.delete.not.found', { messageId }),
                                });
                            }

                            let deletedMessage = false;

                            try {
                                const guild = interaction.guild;
                                const channel = await guild.channels.fetch(reactEmbed.channelId).catch(() => null);

                                if (channel) {
                                    const msg = await channel.messages.fetch(messageId).catch(() => null);
                                    if (msg) {
                                        await msg.delete();
                                        deletedMessage = true;
                                    }
                                }
                            } catch (err) {
                                logger.error(`Gagal hapus pesan embed:`, err);
                            }

                            try {
                                await reactEmbed.destroy();
                            } catch (err) {
                                logger.error(`Gagal hapus data embed dari database:`, err);
                                return interaction.editReply({ content: await t(interaction, 'core.embed.embed.delete.db.error') });
                            }

                            return interaction.editReply({
                                content: await t(interaction, 'core.embed.embed.delete.success', {
                                    messageId,
                                    deletedMessage: deletedMessage ? ' (message in channel also deleted)' : '',
                                }),
                            });
                        } else {
                            try {
                                const channel = interaction.channel;
                                const msg = await channel.messages.fetch(messageId).catch(() => null);
                                if (msg) {
                                    await msg.delete();
                                    return interaction.editReply({
                                        content: await t(interaction, 'core.embed.embed.delete.dm.success', { messageId }),
                                    });
                                } else {
                                    return interaction.editReply({
                                        content: await t(interaction, 'core.embed.embed.delete.dm.not.found', { messageId }),
                                    });
                                }
                            } catch (err) {
                                logger.error(`Gagal hapus pesan embed di DM:`, err);
                                return interaction.editReply({ content: await t(interaction, 'core.embed.embed.delete.dm.error') });
                            }
                        }
                    }
                }
                break;
            }
        }
    },
};
