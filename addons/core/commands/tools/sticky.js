/**
 * @namespace: addons/core/commands/tools/sticky.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sticky')
        .setDescription('📌 Manage sticky messages in a channel.')
        .addSubcommand((sub) =>
            sub
                .setName('set')
                .setDescription('Sets a sticky message for this channel.')
                .addStringOption((opt) => opt.setName('message').setDescription('The content of the sticky message.').setRequired(true))
        )
        .addSubcommand((sub) => sub.setName('remove').setDescription('Removes the sticky message from this channel.'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .setContexts(InteractionContextType.Guild),

    guildOnly: true,
    permissions: PermissionFlagsBits.ManageMessages,
    botPermissions: PermissionFlagsBits.ManageMessages,
    async execute(interaction, container) {
        const { t, kythiaConfig, helpers, models } = container;
        const { embedFooter } = helpers.discord;
        const { StickyMessage } = models;

        const sub = interaction.options.getSubcommand();
        const channelId = interaction.channel.id;

        switch (sub) {
            case 'set': {
                const pesan = interaction.options.getString('message');
                const existingSticky = await StickyMessage.getCache({ channelId });

                if (existingSticky) {
                    return interaction.reply({ content: await t(interaction, 'core.tools.sticky.set.error.exists'), ephemeral: true });
                }

                const stickyEmbed = new EmbedBuilder()
                    .setTitle(await t(interaction, 'core.tools.sticky.embed.title'))
                    .setDescription(pesan)
                    .setColor(kythiaConfig.bot.color)
                    .setFooter(await embedFooter(interaction));

                const message = await interaction.channel.send({ embeds: [stickyEmbed] });

                await StickyMessage.create(
                    {
                        channelId,
                        message: pesan,
                        messageId: message.id,
                    },
                    { individualHooks: true }
                );

                return interaction.reply({ content: await t(interaction, 'core.tools.sticky.set.success'), ephemeral: true });
            }

            case 'remove': {
                const sticky = await StickyMessage.getCache({ channelId: channelId });

                if (!sticky) {
                    return interaction.reply({
                        content: await t(interaction, 'core.tools.sticky.remove.error.not.found'),
                        ephemeral: true,
                    });
                }

                if (sticky && sticky.messageId) {
                    try {
                        const oldMsg = await interaction.channel.messages.fetch(sticky.messageId).catch(() => null);
                        if (oldMsg) await oldMsg.delete().catch(() => {});
                    } catch (err) {
                        // ignore error
                    }
                }
                await sticky.destroy({ individualHooks: true });
                return interaction.reply({ content: await t(interaction, 'core.tools.sticky.remove.success'), ephemeral: true });
            }
        }
    },
};
