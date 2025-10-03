/**
 * @namespace: addons/giveaway/commands/giveaway.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const {
    SlashCommandBuilder,
    EmbedBuilder,
    WebhookClient,
    PermissionFlagsBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    InteractionContextType,
} = require('discord.js');
const { announceWinners } = require('../helpers/giveawayManager');
const Giveaway = require('../database/models/Giveaway');
const { parseDuration } = require('@utils/time');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giveaway')
        .setDescription('🎉 Create a giveaway event to your members')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('start')
                .setDescription('Start a giveaway')
                .addStringOption((option) =>
                    option
                        .setName('type')
                        .setDescription('Giveaway type')
                        .setRequired(true)
                        .addChoices({ name: 'In Server Money', value: 'money' }, { name: 'Other', value: 'another' })
                )
                .addStringOption((option) =>
                    option.setName('duration').setDescription('Duration (e.g. 1 week 4 days 12 minutes)').setRequired(true)
                )
                .addIntegerOption((option) => option.setName('winners').setDescription('Number of winners').setRequired(true))
                .addStringOption((option) => option.setName('prize').setDescription('Prize for the giveaway').setRequired(true))
                .addStringOption((option) =>
                    option.setName('color').setDescription('Embed color (hex code or color name)').setRequired(false)
                )
                .addRoleOption((option) => option.setName('role').setDescription('Role required to join').setRequired(false))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('end')
                .setDescription('End a giveaway')
                .addStringOption((option) => option.setName('message_id').setDescription('Message ID of the giveaway').setRequired(true))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('cancel')
                .setDescription('Cancel a giveaway')
                .addStringOption((option) => option.setName('message_id').setDescription('Message ID of the giveaway').setRequired(true))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('reroll')
                .setDescription('Reroll giveaway winners')
                .addStringOption((option) => option.setName('message_id').setDescription('Message ID of the giveaway').setRequired(true))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setContexts(InteractionContextType.Guild),
    permissions: PermissionFlagsBits.ManageGuild,
    botPermissions: PermissionFlagsBits.SendMessages,
    async execute(interaction) {
        await interaction.deferReply();
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'start':
                await startGiveaway(interaction);
                break;
            case 'end':
                await endGiveaway(interaction);
                break;
            case 'cancel':
                await cancelGiveaway(interaction);
                break;
            case 'reroll':
                await rerollGiveaway(interaction);
                break;
            default: {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(
                        `${await t(interaction, 'giveaway_giveaway_unknown_subcommand_title')}\n${await t(interaction, 'giveaway_giveaway_unknown_subcommand_desc')}`
                    );
                await interaction.editReply({ embeds: [embed], ephemeral: true });
            }
        }
    },
};

async function startGiveaway(interaction) {
    const durationInput = interaction.options.getString('duration');
    const winners = interaction.options.getInteger('winners');
    const prize = interaction.options.getString('prize');
    const type = interaction.options.getString('type') || 'other';
    const color = interaction.options.getString('color') || 'Random';
    const role = interaction.options.getRole('role');

    // Validate duration
    const durationMs = parseDuration(durationInput);
    if (!durationMs || durationMs <= 0 || isNaN(durationMs)) {
        const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                `${await t(interaction, 'giveaway_giveaway_invalid_duration_title')}\n${await t(interaction, 'giveaway_giveaway_invalid_duration_desc')}`
            );
        return interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
    }

    const endTime = Date.now() + durationMs;
    const endTimestamp = Math.floor(endTime / 1000);

    const embed = new EmbedBuilder()
        .setColor(color)
        .setDescription(
            `${await t(interaction, 'giveaway_helpers_giveawayManager_embed_title')}\n` +
                `${await t(interaction, 'giveaway_helpers_giveawayManager_embed_desc', {
                    prize: prize,
                    endRelative: `<t:${endTimestamp}:R>`,
                    endFull: `<t:${endTimestamp}:F>`,
                    host: interaction.user,
                })}`
        )
        .addFields(
            { name: await t(interaction, 'giveaway_helpers_giveawayManager_field_winners'), value: `🏆 ${winners}`, inline: true },
            { name: await t(interaction, 'giveaway_helpers_giveawayManager_field_participants'), value: '👥 0', inline: true }
        )
        // .setImage("https://i.ibb.co/Y0C1Zcw/tenor.gif")
        .setFooter({ text: await t(interaction, 'giveaway_giveaway_embed_footer_starting') });

    if (role) {
        embed.addFields({
            name: await t(interaction, 'giveaway_helpers_giveawayManager_field_role_requirement'),
            value: `${role}`,
            inline: true,
        });
    }

    const button = new ButtonBuilder()
        .setCustomId('giveawayjoin')
        .setLabel(await t(interaction, 'giveaway_giveaway_button_join'))
        .setStyle(ButtonStyle.Success)
        .setEmoji('🎉');

    const row = new ActionRowBuilder().addComponents(button);

    try {
        const message = await interaction.channel.send({
            content: role ? `${role}` : '@everyone',
            embeds: [embed],
            components: [row],
        });

        // Save to database
        await Giveaway.create({
            messageId: message.id,
            channelId: interaction.channel.id,
            guildId: interaction.guild.id,
            hostId: interaction.user.id,
            type: type,
            duration: durationMs,
            endTime: new Date(endTime),
            winners: winners,
            prize: prize,
            participants: '[]',
            ended: false,
            roleId: role?.id || null,
            color: color,
        });

        // Update footer after message ID is available
        embed.setFooter({ text: await t(interaction, 'giveaway_helpers_giveawayManager_embed_footer_id', { id: message.id }) });
        await message.edit({ embeds: [embed] });

        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(
                `${await t(interaction, 'giveaway_giveaway_start_success_title')}\n${await t(interaction, 'giveaway_giveaway_start_success_desc')}`
            );
        await interaction.editReply({ embeds: [successEmbed], ephemeral: true });
    } catch (error) {
        console.error('Failed to create giveaway:', error);
        const errorEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                `${await t(interaction, 'giveaway_helpers_giveawayManager_fatal_error_title')}\n${await t(interaction, 'giveaway_helpers_giveawayManager_fatal_error_desc')}`
            );
        await interaction.editReply({ embeds: [errorEmbed], ephemeral: true });
    }
}

async function endGiveaway(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const messageId = interaction.options.getString('message_id');
    const giveaway = await Giveaway.findOne({ where: { messageId } });

    if (!giveaway || giveaway.ended) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                `${await t(interaction, 'giveaway_giveaway_not_found_title')}\n${await t(interaction, 'giveaway_giveaway_not_found_desc')}`
            );
        return interaction.editReply({ embeds: [embed], ephemeral: true });
    }

    await announceWinners(interaction.client, giveaway);
    const embed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(
            `${await t(interaction, 'giveaway_giveaway_end_success_title')}\n${await t(interaction, 'giveaway_giveaway_end_success_desc')}`
        );
    await interaction.editReply({ embeds: [embed], ephemeral: true });
}

async function rerollGiveaway(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const messageId = interaction.options.getString('message_id');
    const giveaway = await Giveaway.findOne({ where: { messageId } });

    if (!giveaway) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                `${await t(interaction, 'giveaway_giveaway_not_found_title')}\n${await t(interaction, 'giveaway_giveaway_not_found_desc')}`
            );
        return interaction.editReply({ embeds: [embed], ephemeral: true });
    }
    if (!giveaway.ended) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                `${await t(interaction, 'giveaway_giveaway_not_ended_title')}\n${await t(interaction, 'giveaway_giveaway_not_ended_desc')}`
            );
        return interaction.editReply({ embeds: [embed], ephemeral: true });
    }

    await announceWinners(interaction.client, giveaway, true);
    const embed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(
            `${await t(interaction, 'giveaway_giveaway_reroll_success_title')}\n${await t(interaction, 'giveaway_giveaway_reroll_success_desc')}`
        );
    await interaction.editReply({ embeds: [embed], ephemeral: true });
}

async function cancelGiveaway(interaction) {
    const messageId = interaction.options.getString('message_id');
    const giveaway = await Giveaway.getCache({ where: { messageId } });

    if (!giveaway || giveaway.ended) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                `${await t(interaction, 'giveaway_giveaway_not_found_title')}\n${await t(interaction, 'giveaway_giveaway_not_found_desc')}`
            );
        return interaction.editReply({ embeds: [embed], ephemeral: true });
    }

    giveaway.ended = true;
    await giveaway.saveAndUpdateCache('messageId');

    const embed = new EmbedBuilder()
        .setColor('DarkRed')
        .setDescription(
            `${await t(interaction, 'giveaway_giveaway_cancelled_title', { prize: giveaway.prize })}\n${await t(interaction, 'giveaway_giveaway_cancelled_desc', { user: interaction.user })}`
        )
        .setTimestamp();

    const channel = await interaction.client.channels.fetch(giveaway.channelId);
    const message = await channel.messages.fetch(giveaway.messageId);

    const disabledButton = new ButtonBuilder()
        .setCustomId('giveawayjoin')
        .setLabel(await t(interaction, 'giveaway_giveaway_button_cancelled'))
        .setStyle(ButtonStyle.Danger)
        .setEmoji('❌')
        .setDisabled(true);
    const row = new ActionRowBuilder().addComponents(disabledButton);

    await message.edit({ embeds: [embed], components: [row] });

    const replyEmbed = new EmbedBuilder()
        .setColor('Green')
        .setDescription(
            `${await t(interaction, 'giveaway_giveaway_cancel_success_title')}\n${await t(interaction, 'giveaway_giveaway_cancel_success_desc')}`
        );
    await interaction.editReply({ embeds: [replyEmbed], ephemeral: true });
}
