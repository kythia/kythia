/**
 * @namespace: addons/core/commands/moderation/unpin.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: (subcommand) =>
        subcommand
            .setName('unpin')
            .setDescription('📌 Unpins a message in the channel.')
            .addStringOption((option) => option.setName('message_id').setDescription('ID of the message to unpin').setRequired(true)),
    permissions: PermissionFlagsBits.ManageMessages,
    botPermissions: PermissionFlagsBits.ManageMessages,
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
                content: await t(interaction, 'core.moderation.unpin.not.found'),
            });
        }

        try {
            await message.unpin();
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(
                    `## ${await t(interaction, 'core.moderation.unpin.embed.title')}\n` +
                        (await t(interaction, 'core.moderation.unpin.embed.desc', { messageId }))
                )
                .setThumbnail(interaction.client.user.displayAvatarURL())
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        } catch (e) {
            return interaction.editReply({
                content: await t(interaction, 'core.moderation.unpin.failed'),
            });
        }
    },
};
