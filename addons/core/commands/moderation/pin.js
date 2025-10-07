/**
 * @namespace: addons/core/commands/moderation/pin.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */
const {
    SlashCommandBuilder,
    EmbedBuilder,
    PermissionFlagsBits,
    InteractionContextType,
    ContextMenuCommandBuilder,
    ApplicationCommandType,
} = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    slashCommand: new SlashCommandBuilder()
        .setName('pin')
        .setDescription('📌 Pins a message in the channel.')
        .addStringOption((option) => option.setName('message_id').setDescription('ID of the message to pin').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.PinMessages)
        .setContexts(InteractionContextType.Guild),
    permissions: PermissionFlagsBits.PinMessages,
    botPermissions: PermissionFlagsBits.PinMessages,
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
                content: await t(interaction, 'core_moderation_pin_not_found'),
                ephemeral: true,
            });
        }

        try {
            await message.pin();
        } catch (e) {
            return interaction.editReply({
                content: await t(interaction, 'core_moderation_pin_failed'),
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(
                await t(interaction, 'core_moderation_pin_success', {
                    content: message.content || (await t(interaction, 'core_moderation_pin_no_content')),
                })
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    },
};
