/**
 * @namespace: addons/economy/commands/inventory.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('inventory').setDescription('🛄 View all items in your inventory.'),
    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser, Inventory } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();
        let user = await KythiaUser.getCache({ userId: interaction.user.id });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const inventoryItems = await Inventory.getAllCache({ userId: user.userId });

        if (inventoryItems.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'economy.inventory.inventory.empty'))
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const itemCounts = inventoryItems.reduce((acc, item) => {
            acc[item.itemName] = (acc[item.itemName] || 0) + 1;
            return acc;
        }, {});

        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setDescription(await t(interaction, 'economy.inventory.inventory.title'))
            .setTimestamp()
            .setFooter(await embedFooter(interaction));

        const itemEntries = Object.entries(itemCounts);
        const fields = [];
        const totalItems = itemEntries.length;
        // We want to always fill in groups of 3: 1 2 filler, 3 4 filler, etc.
        // So, for n items, we need to fill up to the next multiple of 2, then add a filler after every 2 items.
        let i = 0;
        while (i < itemEntries.length || i % 2 !== 0) {
            // Add up to 2 items, then a filler
            for (let j = 0; j < 2; j++) {
                if (i < itemEntries.length) {
                    const [itemName, count] = itemEntries[i];
                    fields.push({
                        name: await t(interaction, 'economy.inventory.inventory.item.field.name', { itemName, count }),
                        value: await t(interaction, 'economy.inventory.inventory.item.field.value', { count }),
                        inline: true,
                    });
                    i++;
                } else {
                    // If no more items, but we need to fill the slot, add a filler
                    fields.push({
                        name: '\u200B',
                        value: '\u200B',
                        inline: true,
                    });
                    i++;
                }
            }
            // Always add a filler after every 2 items
            fields.push({
                name: '\u200B',
                value: '\u200B',
                inline: true,
            });
        }
        // If there are only 4 items, this will ensure the 5th is always a filler.
        embed.addFields(fields);

        await interaction.editReply({ embeds: [embed] });
    },
};
