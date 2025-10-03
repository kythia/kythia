/**
 * @namespace: addons/core/commands/moderation/unpin.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unpin')
        .setDescription('📌 Unpins a message in the channel.')
        .addStringOption((option) => option.setName('message_id').setDescription('ID of the message to unpin').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setContexts(InteractionContextType.Guild),
    permissions: PermissionFlagsBits.ManageMessages,
    botPermissions: PermissionFlagsBits.ManageMessages,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const messageId = interaction.options.getString('message_id');

        let message;
        try {
            message = await interaction.channel.messages.fetch(messageId);
        } catch (e) {
            message = null;
        }

        if (!message) {
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_unpin_not_found'),
            });
        }

        try {
            await message.unpin();
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(
                    `## ${await t(interaction, 'core_moderation_unpin_embed_title')}\n` +
                        (await t(interaction, 'core_moderation_unpin_embed_desc', { messageId }))
                )
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        } catch (e) {
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_unpin_failed'),
            });
        }
    },
};
