/**
 * @namespace: addons/checklist/commands/server/clear.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { getChecklistAndItems, getScopeMeta, safeReply } = require('../../helpers');
const { EmbedBuilder } = require('discord.js');
const { t } = require('@coreHelpers/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('clear').setDescription('Clear all server checklist'),

    async execute(interaction) {
        const guildId = interaction.guild?.id;
        const userId = null; // Server scope
        const group = 'server';

        const { checklist, items } = await getChecklistAndItems({ guildId, userId });
        const { scopeKey, colorName, ephemeral } = getScopeMeta(userId, group);

        if (!checklist || !Array.isArray(items) || items.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle(await t(interaction, 'checklist.server.clear.already.empty.title', { scope: await t(interaction, scopeKey) }))
                .setDescription(await t(interaction, 'checklist.server.clear.clear.empty.desc'))
                .setColor('Red')
                .setTimestamp();
            return safeReply(interaction, { embeds: [embed], ephemeral });
        }

        try {
            await checklist.update({ items: '[]' });
        } catch (e) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Checklist Error')
                .setDescription('Failed to clear checklist. Please try again.')
                .setTimestamp();
            return safeReply(interaction, { embeds: [embed], ephemeral });
        }

        const embed = new EmbedBuilder()
            .setTitle(await t(interaction, 'checklist.server.clear.clear.success.title', { scope: await t(interaction, scopeKey) }))
            .setDescription(await t(interaction, 'checklist.server.clear.clear.success.desc'))
            .setColor(colorName)
            .setTimestamp();

        await safeReply(interaction, { embeds: [embed], ephemeral });
    },
};
