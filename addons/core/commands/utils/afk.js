/**
 * @namespace: addons/core/commands/utils/afk.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('💤 Set your Away From Keyboard (AFK) status.')
        .addStringOption((option) => option.setName('reason').setDescription('The reason for being AFK.').setRequired(false))
        .setContexts(InteractionContextType.Guild),
    async execute(interaction, container) {
        const { t, models } = container;
        const { UserAFK } = models;

        const reason = interaction.options.getString('reason') || (await t(interaction, 'core.utils.afk.no.reason'));

        try {
            const afkData = await UserAFK.getCache({
                userId: interaction.user.id,
            });

            if (afkData) {
                await interaction.reply({
                    content: await t(interaction, 'core.utils.afk.already.afk'),
                    ephemeral: true,
                });
                return;
            }

            await UserAFK.create(
                {
                    userId: interaction.user.id,
                    reason: reason,
                    timestamp: new Date(),
                },
                { individualHooks: true }
            );

            const replyMessage = await t(interaction, 'core.utils.afk.set.success', { reason: reason });
            await interaction.reply({
                content: replyMessage,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error executing AFK command:', error);
            await interaction.reply({
                content: await t(interaction, 'core.utils.afk.error'),
                ephemeral: true,
            });
        }
    },
};
