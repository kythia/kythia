/**
 * @namespace: addons/core/commands/moderation/pin.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    slashCommand: (subcommand) =>
        subcommand
            .setName('pin')
            .setDescription('📌 Pins a message in the channel.')
            .addStringOption((option) => option.setName('message_id').setDescription('ID of the message to pin').setRequired(true)),
    permissions: PermissionFlagsBits.PinMessages,
    botPermissions: PermissionFlagsBits.PinMessages,
    async execute(interaction, container) {
        const { t, helpers } = container;
        const { embedFooter } = helpers.discord;

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
                content: await t(interaction, 'core.moderation.pin.not.found'),
                ephemeral: true,
            });
        }

        try {
            await message.pin();
        } catch (e) {
            return interaction.editReply({
                content: await t(interaction, 'core.moderation.pin.failed'),
                ephemeral: true,
            });
        }

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(
                await t(interaction, 'core.moderation.pin.success', {
                    content: message.content || (await t(interaction, 'core.moderation.pin.no.content')),
                })
            )
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setTimestamp()
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    },
};
