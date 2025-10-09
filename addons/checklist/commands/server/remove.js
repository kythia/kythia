/**
 * @namespace: addons/checklist/commands/server/remove.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { getChecklistAndItems, getScopeMeta, safeReply } = require('../../helpers');
const { EmbedBuilder } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('remove')
            .setDescription('Remove item from server checklist')
            .addIntegerOption((option) => option.setName('index').setDescription('Item number to remove').setRequired(true)),

    async execute(interaction) {
        const guildId = interaction.guild?.id;
        const userId = null; // Server scope
        const group = 'server';

        const index = interaction.options.getInteger('index');
        if (!index || typeof index !== 'number' || index < 1) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(await t(interaction, 'checklist_server_toggle_invalid_index_title'))
                .setDescription(await t(interaction, 'checklist_server_toggle_invalid_index_desc'))
                .setTimestamp();
            return safeReply(interaction, { embeds: [embed], ephemeral: true });
        }

        const { checklist, items } = await getChecklistAndItems({ guildId, userId });
        const { scopeKey, color, ephemeral } = getScopeMeta(userId, group);

        if (!checklist || !Array.isArray(items) || items.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle(await t(interaction, 'checklist_server_toggle_empty_title', { scope: await t(interaction, scopeKey) }))
                .setDescription(await t(interaction, 'checklist_server_remove_remove_empty_desc'))
                .setColor('Red')
                .setTimestamp();
            return safeReply(interaction, { embeds: [embed], ephemeral });
        }

        if (index < 1 || index > items.length) {
            const embed = new EmbedBuilder()
                .setTitle(await t(interaction, 'checklist_server_toggle_invalid_index_title'))
                .setDescription(await t(interaction, 'checklist_server_toggle_invalid_index_desc'))
                .setColor('Red')
                .setTimestamp();
            return safeReply(interaction, { embeds: [embed], ephemeral });
        }

        const removed = items.splice(index - 1, 1);
        try {
            await checklist.update({ items: JSON.stringify(items) });
        } catch (e) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Checklist Error')
                .setDescription('Failed to update checklist. Please try again.')
                .setTimestamp();
            return safeReply(interaction, { embeds: [embed], ephemeral });
        }

        const embed = new EmbedBuilder()
            .setTitle(await t(interaction, 'checklist_server_remove_remove_success_title', { scope: await t(interaction, scopeKey) }))
            .setDescription(await t(interaction, 'checklist_server_remove_remove_success_desc', { item: removed[0]?.text || '-' }))
            .setColor(color)
            .setFooter(await embedFooter(interaction))
            .setTimestamp();

        await safeReply(interaction, { embeds: [embed], ephemeral });
    },
};
