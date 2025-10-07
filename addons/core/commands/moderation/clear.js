/**
 * @namespace: addons/core/commands/moderation/clear.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */
const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    PermissionFlagsBits,
    InteractionContextType,
} = require('discord.js');
const { t } = require('@utils/translator');
const logger = require('@src/utils/logger');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('🗑️ Delete messages from a channel.')
        .addIntegerOption((option) => option.setName('amount').setDescription('Amount of messages to delete (0 = all)').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setContexts(InteractionContextType.Guild),

    permissions: PermissionFlagsBits.ManageMessages,
    botPermissions: PermissionFlagsBits.ManageMessages,
    async execute(interaction, container) {
        const amount = interaction.options.getInteger('amount');

        if (amount === 0) {
            return await showClearOptions(interaction, t, container);
        }

        await interaction.deferReply({ ephemeral: true });

        if (typeof interaction.channel.bulkDelete !== 'function') {
            const embed = new EmbedBuilder().setColor('Orange').setDescription(await t(interaction, 'core_moderation_clear_text_only'));
            return interaction.editReply({ embeds: [embed] });
        }

        try {
            const deleted = await interaction.channel.bulkDelete(amount, true);
            const totalDeleted = deleted.size;

            if (totalDeleted === 0) {
                const embed = new EmbedBuilder()
                    .setColor('Orange')
                    .setDescription(await t(interaction, 'core_moderation_clear_nothing_deleted'));
                return interaction.editReply({ embeds: [embed] });
            }

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(await t(interaction, 'core_moderation_clear_embed_desc', { count: totalDeleted }));
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            logger.error(error);
            const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'core_moderation_clear_error'));
            return interaction.editReply({ embeds: [embed] });
        }
    },
};

// Show options for clear (Nuke/Bulk)
async function showClearOptions(interaction, t, container) {
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
        .setColor('Orange')
        .setDescription(
            '## ' +
                (await t(interaction, 'core_moderation_clear_options_title')) +
                '\n' +
                (await t(interaction, 'core_moderation_clear_options_desc'))
        )
        .addFields(
            { name: '💥 Nuke Channel', value: await t(interaction, 'core_moderation_clear_options_nuke_value') },
            { name: '🗑️ Bulk Delete', value: await t(interaction, 'core_moderation_clear_options_bulk_value') }
        );

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('confirmNuke').setLabel('Nuke Channel').setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId('confirmBulk').setLabel('Bulk Delete All').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('cancelClear').setLabel('Cancel').setStyle(ButtonStyle.Secondary)
    );

    const message = await interaction.editReply({ embeds: [embed], components: [row] });

    const collector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000,
    });

    collector.on('collect', async (btnInteraction) => {
        if (btnInteraction.user.id !== interaction.user.id) {
            const embed = new EmbedBuilder().setColor('Red').setDescription(await t(btnInteraction, 'core_moderation_clear_not_for_you'));
            return btnInteraction.reply({ embeds: [embed], ephemeral: true });
        }

        collector.stop();

        if (btnInteraction.customId === 'confirmNuke') {
            await executeNukeChannel(interaction, btnInteraction, t, container);
        } else if (btnInteraction.customId === 'confirmBulk') {
            await executeBulkDeleteAll(interaction, btnInteraction, t, container);
        } else if (btnInteraction.customId === 'cancelClear') {
            const embed = new EmbedBuilder().setColor('Grey').setDescription(await t(interaction, 'core_moderation_clear_cancel_desc'));
            await interaction.editReply({ embeds: [embed], components: [] });
        }
    });

    collector.on('end', async (collected, reason) => {
        if (reason === 'time') {
            const embed = new EmbedBuilder().setColor('Grey').setDescription(await t(interaction, 'core_moderation_clear_confirm_expired'));
            await interaction.editReply({ embeds: [embed], components: [] });
        }
    });
}

// Nuke logic (Clone & Delete)
async function executeNukeChannel(interaction, btnInteraction, t, container) {
    const progressEmbed = new EmbedBuilder()
        .setColor('Orange')
        .setDescription(await t(interaction, 'core_moderation_clear_nuke_in_progress'));
    await btnInteraction.update({ embeds: [progressEmbed], components: [] });

    try {
        const oldPosition = interaction.channel.position;
        const newChannel = await interaction.channel.clone();
        await interaction.channel.delete();
        await newChannel.setPosition(oldPosition);

        const embed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(await t(interaction, 'core_moderation_clear_success', { user: `${interaction.member}` }));
        await newChannel.send({ embeds: [embed] });
    } catch (err) {
        logger.error('Nuke error:', err);
        const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'core_moderation_clear_error'));
        await interaction.followUp({ embeds: [embed], ephemeral: true });
    }
}

// Bulk delete all logic
async function executeBulkDeleteAll(interaction, btnInteraction, t, container) {
    const progressEmbed = new EmbedBuilder()
        .setColor('Orange')
        .setDescription(await t(interaction, 'core_moderation_clear_bulk_in_progress'));
    await btnInteraction.update({ embeds: [progressEmbed], components: [] });

    try {
        let totalDeleted = 0;
        let hasMore = true;

        while (hasMore) {
            const messages = await interaction.channel.messages.fetch({ limit: 100 });
            const deletableMessages = messages.filter((msg) => Date.now() - msg.createdTimestamp < 1209600000);

            if (deletableMessages.size > 0) {
                const deleted = await interaction.channel.bulkDelete(deletableMessages, true);
                totalDeleted += deleted.size;
            }

            if (deletableMessages.size < 100 || messages.size === 0) {
                hasMore = false;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const doneEmbed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(await t(interaction, 'core_moderation_clear_embed_desc', { count: totalDeleted }));
        // await interaction.channel.send({ embeds: [embed] });

        // const doneEmbed = new EmbedBuilder()
        //   .setColor("Green")
        //   .setDescription(await t(interaction, "core_moderation_clear_done"));
        await interaction.editReply({ embeds: [doneEmbed], components: [] });
    } catch (err) {
        logger.error('Bulk delete all error:', err);
        const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'core_moderation_clear_error'));
        await interaction.followUp({ embeds: [embed], ephemeral: true });
    }
}
