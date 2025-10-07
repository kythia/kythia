/**
 * @namespace: addons/core/commands/utils/afk.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { SlashCommandBuilder, InteractionContextType } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { t } = require('@utils/translator');
const AFK = require('@coreModels/UserAFK'); // Sesuaikan path ke model AFK

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('💤 Set your Away From Keyboard (AFK) status.')
        .addStringOption((option) => option.setName('reason').setDescription('The reason for being AFK.').setRequired(false))
        .setContexts(InteractionContextType.Guild),
    async execute(interaction) {
        const reason = interaction.options.getString('reason') || (await t(interaction, 'core_utils_afk_no_reason'));

        try {
            const afkData = await AFK.getCache({
                userId: interaction.user.id,
                guildId: interaction.guild.id,
            });

            if (afkData) {
                await interaction.reply({
                    content: await t(interaction, 'core_utils_afk_already_afk'),
                    ephemeral: true,
                });
                return;
            }

            // Buat entri AFK baru di database
            await AFK.create(
                {
                    userId: interaction.user.id,
                    guildId: interaction.guild.id,
                    reason: reason,
                    timestamp: new Date(),
                },
                { individualHooks: true }
            );

            const replyMessage = await t(interaction, 'core_utils_afk_set_success', { reason: reason });
            await interaction.reply({
                content: replyMessage,
                ephemeral: true,
            });
        } catch (error) {
            console.error('Error executing AFK command:', error);
            await interaction.reply({
                content: await t(interaction, 'core_utils_afk_error'),
                ephemeral: true,
            });
        }
    },
};
