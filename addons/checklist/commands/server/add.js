/**
 * @namespace: addons/checklist/commands/server/add.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { getChecklistAndItems, getScopeMeta, safeReply } = require('../../helpers');
const { EmbedBuilder } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Add item to server checklist')
            .addStringOption((option) => option.setName('item').setDescription('Checklist item').setRequired(true)),

    async execute(interaction) {
        const guildId = interaction.guild?.id;
        const userId = null; // Server scope
        const group = 'server';

        const item = interaction.options.getString('item');
        if (!item || typeof item !== 'string' || !item.trim()) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(await t(interaction, 'checklist_server_add_invalid_item_title'))
                .setDescription(await t(interaction, 'checklist_server_add_invalid_item_desc'))
                .setTimestamp();
            return safeReply(interaction, { embeds: [embed], ephemeral: true });
        }

        const { checklist, items } = await getChecklistAndItems({ guildId, userId, createIfNotExist: true });

        if (items.length >= 100) {
            // Limit checklist size
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(await t(interaction, 'checklist_server_add_full_title'))
                .setDescription(await t(interaction, 'checklist_server_add_full_desc'))
                .setTimestamp();
            return safeReply(interaction, { embeds: [embed], ephemeral: true });
        }

        items.push({ text: item, checked: false });
        try {
            await checklist.update({ items: JSON.stringify(items) });
        } catch (e) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Checklist Error')
                .setDescription('Failed to update checklist. Please try again.')
                .setTimestamp();
            return safeReply(interaction, { embeds: [embed], ephemeral: true });
        }

        const { scopeKey, color, ephemeral } = getScopeMeta(userId, group);
        const embed = new EmbedBuilder()
            .setTitle(await t(interaction, 'checklist_server_add_add_success_title', { scope: await t(interaction, scopeKey) }))
            .setDescription(await t(interaction, 'checklist_server_add_add_success_desc', { item }))
            .setColor(color)
            .setFooter(await embedFooter(interaction))
            .setTimestamp();

        await safeReply(interaction, { embeds: [embed], ephemeral });
    },
};
