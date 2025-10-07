/**
 * @namespace: addons/ai/commands/ai.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { SlashCommandBuilder, PermissionFlagsBits, InteractionContextType, EmbedBuilder } = require('discord.js');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription('🌸 Manage AI mode in this channel')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
        .setContexts(InteractionContextType.Guild)
        .addSubcommand((sub) => sub.setName('enable').setDescription('Enable AI in this channel'))
        .addSubcommand((sub) => sub.setName('disable').setDescription('Disable AI in this channel')),
    permissions: PermissionFlagsBits.ManageGuild,
    isInMainGuild: true,
    voteLocked: true,
    guildOnly: true,
    async execute(interaction, container) {
        const { kythiaManager } = container;
        await interaction.deferReply();

        const channelId = interaction.channel.id;
        let serverSetting = await kythiaManager.get(interaction.guild.id);
        let aiChannelIds = Array.isArray(serverSetting?.aiChannelIds) ? [...serverSetting.aiChannelIds] : [];
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'enable') {
            if (aiChannelIds.includes(channelId)) {
                const embed = new EmbedBuilder().setColor('Yellow').setDescription(await t(interaction, 'ai_ai_manage_already_enabled'));
                return interaction.editReply({ embeds: [embed] });
            }

            aiChannelIds.push(channelId);
            await kythiaManager.update(interaction.guild.id, {
                aiChannelIds: aiChannelIds,
            });
            const embed = new EmbedBuilder().setColor('Green').setDescription(await t(interaction, 'ai_ai_manage_enable_success'));
            return interaction.editReply({ embeds: [embed] });
        }

        if (subcommand === 'disable') {
            const index = aiChannelIds.indexOf(channelId);
            if (index === -1) {
                const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'ai_ai_manage_not_enabled'));
                return interaction.editReply({ embeds: [embed] });
            }

            aiChannelIds.splice(index, 1);
            await kythiaManager.update(interaction.guild.id, {
                aiChannelIds: aiChannelIds,
            });
            const embed = new EmbedBuilder().setColor('Orange').setDescription(await t(interaction, 'ai_ai_manage_disable_success'));
            return interaction.editReply({ embeds: [embed] });
        }

        // Fallback for unknown subcommand
        const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'ai_ai_manage_unknown_subcommand'));
        return interaction.editReply({ embeds: [embed] });
    },
};
