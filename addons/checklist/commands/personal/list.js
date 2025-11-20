/**
 * @namespace: addons/checklist/commands/personal/list.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { getChecklistAndItems, getScopeMeta, safeReply } = require('../../helpers');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('list').setDescription('View all personal checklist'),

    async execute(interaction, container) {
        // Dependency
        const { t, kythiaConfig, helpers } = container;
        const { embedFooter } = helpers.discord;

        const guildId = interaction.guild?.id;
        const userId = interaction.user.id; // Personal scope
        const group = 'personal';

        const { checklist, items } = await getChecklistAndItems({ guildId, userId });
        const { scopeKey, colorName, ephemeral } = getScopeMeta(userId, group);

        if (!checklist || !Array.isArray(items) || items.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle(await t(interaction, 'checklist.server.toggle.empty.title', { scope: await t(interaction, scopeKey) }))
                .setDescription(await t(interaction, 'checklist.server.list.list.empty.desc'))
                .setColor('Red')
                .setTimestamp();
            return safeReply(interaction, { embeds: [embed], ephemeral });
        }

        // Split into fields if too long
        const maxFieldLength = 1024;
        let descArr = [];
        let current = '';
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const line = `${item.checked ? '✅' : '⬜'} \`${i + 1}\` ${item.text}\n`;
            if ((current + line).length > maxFieldLength) {
                descArr.push(current);
                current = '';
            }
            current += line;
        }
        if (current) descArr.push(current);

        const embed = new EmbedBuilder()
            .setTitle(await t(interaction, 'checklist.server.list.list.title', { scope: await t(interaction, scopeKey) }))
            .setColor(colorName)
            .setTimestamp()
            .setFooter(await embedFooter(interaction));

        for (let idx = 0; idx < descArr.length; idx++) {
            embed.addFields({
                name:
                    descArr.length > 1
                        ? await t(interaction, 'checklist.server.list.list.field.title.multi', { index: idx + 1 })
                        : await t(interaction, 'checklist.server.list.list.field.title.single'),
                value: descArr[idx],
            });
        }

        await safeReply(interaction, { embeds: [embed], ephemeral });
    },
};
