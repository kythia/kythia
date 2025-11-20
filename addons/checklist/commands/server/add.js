/**
 * @namespace: addons/checklist/commands/server/add.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { getChecklistAndItems, getScopeMeta, safeReply } = require('../../helpers');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Add item to server checklist')
            .addStringOption((option) => option.setName('item').setDescription('Checklist item').setRequired(true)),

    async execute(interaction, container) {
        // Dependency
        const t = container.t;
        const logger = container.logger;
        const { embedFooter } = container.helpers.discord;
        const kythiaConfig = container.kythiaConfig;
        const { convertColor } = container.helpers.color;

        const guildId = interaction.guild?.id;
        const userId = null; // Server scope
        const group = 'server';

        const item = interaction.options.getString('item');
        if (!item || typeof item !== 'string' || !item.trim()) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(await t(interaction, 'checklist.server.add.invalid.item.title'))
                .setDescription(await t(interaction, 'checklist.server.add.invalid.item.desc'))
                .setTimestamp();
            return safeReply(interaction, { embeds: [embed], ephemeral: true });
        }

        const { checklist, items } = await getChecklistAndItems({ guildId, userId, createIfNotExist: true });

        if (items.length >= 100) {
            // Limit checklist size
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(await t(interaction, 'checklist.server.add.full.title'))
                .setDescription(await t(interaction, 'checklist.server.add.full.desc'))
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
            .setTitle(await t(interaction, 'checklist.server.add.add.success.title', { scope: await t(interaction, scopeKey) }))
            .setDescription(await t(interaction, 'checklist.server.add.add.success.desc', { item }))
            .setColor(color)
            .setFooter(await embedFooter(interaction))
            .setTimestamp();

        await safeReply(interaction, { embeds: [embed], ephemeral });
    },
};
