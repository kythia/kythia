/**
 * @namespace: addons/checklist/commands/personal/toggle.js
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
            .setName('toggle')
            .setDescription('Toggle personal checklist item complete/incomplete')
            .addIntegerOption((option) => option.setName('index').setDescription('Item number to toggle').setRequired(true)),

    async execute(interaction, container) {
        // Dependency
        const t = container.t;
        const { embedFooter } = container.helpers.discord;
        const { convertColor } = container.helpers.color;

        const guildId = interaction.guild?.id;
        const userId = interaction.user.id; // Personal scope
        const group = 'personal';

        const index = interaction.options.getInteger('index');
        if (!index || typeof index !== 'number' || index < 1) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle(await t(interaction, 'checklist.server.toggle.invalid.index.title'))
                .setDescription(await t(interaction, 'checklist.server.toggle.invalid.index.desc'))
                .setTimestamp();
            return safeReply(interaction, { embeds: [embed], ephemeral: true });
        }

        const { checklist, items } = await getChecklistAndItems({ guildId, userId });
        const { scopeKey, ephemeral } = getScopeMeta(userId, group);

        if (!checklist || !Array.isArray(items) || items.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle(await t(interaction, 'checklist.server.toggle.empty.title', { scope: await t(interaction, scopeKey) }))
                .setDescription(await t(interaction, 'checklist.server.toggle.toggle.empty.desc'))
                .setColor('Red')
                .setTimestamp();
            return safeReply(interaction, { embeds: [embed], ephemeral });
        }

        if (index < 1 || index > items.length) {
            const embed = new EmbedBuilder()
                .setTitle(await t(interaction, 'checklist.server.toggle.invalid.index.title'))
                .setDescription(await t(interaction, 'checklist.server.toggle.invalid.index.desc'))
                .setColor('Red')
                .setTimestamp();
            return safeReply(interaction, { embeds: [embed], ephemeral });
        }

        items[index - 1].checked = !items[index - 1].checked;
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

        const checked = items[index - 1].checked;
        const color = checked
            ? convertColor('Green', { from: 'discord', to: 'decimal' })
            : convertColor('Yellow', { from: 'discord', to: 'decimal' });
        const statusKey = checked ? 'checklist.status.done' : 'checklist.status.undone';

        const embed = new EmbedBuilder()
            .setTitle(await t(interaction, 'checklist.server.toggle.toggle.success.title', { scope: await t(interaction, scopeKey) }))
            .addFields(
                { name: await t(interaction, 'checklist.server.toggle.item.field'), value: `\`${items[index - 1].text}\``, inline: true },
                { name: await t(interaction, 'checklist.server.toggle.status.field'), value: await t(interaction, statusKey), inline: true }
            )
            .setColor(color)
            .setFooter(await embedFooter(interaction))
            .setTimestamp();

        await safeReply(interaction, { embeds: [embed], ephemeral });
    },
};
