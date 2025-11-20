/**
 * @namespace: addons/adventure/commands/inventory.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { EmbedBuilder } = require('discord.js');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('inventory')
            .setNameLocalizations({ id: 'inventaris', fr: 'inventaire', ja: 'インベントリ' })
            .setDescription('🎒 Look at your inventory')
            .setDescriptionLocalizations({
                id: '🎒 Lihat inventaris yang kamu punya',
                fr: '🎒 Ton inventaire',
                ja: '🎒 所持品を確認しよう',
            }),
    async execute(interaction, container) {
        // Dependency
        const { t, models, kythiaConfig, helpers } = container;
        const { UserAdventure, InventoryAdventure } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();
        const userId = interaction.user.id;
        const user = await UserAdventure.getCache({ userId: userId });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'adventure.no.character'))
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const inventory = await InventoryAdventure.getAllCache({
            where: { userId: userId },
            cacheTags: [`InventoryAdventure:inventory:byUser:${userId}`],
        });

        if (inventory.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'adventure.inventory.empty'))
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setFooter(await embedFooter(interaction));

            return interaction.editReply({ embeds: [embed] });
        }

        // Count items
        const itemCount = {};
        inventory.forEach((item) => {
            if (itemCount[item.itemName]) {
                itemCount[item.itemName]++;
            } else {
                itemCount[item.itemName] = 1;
            }
        });

        // Compose item list
        const itemList = Object.entries(itemCount)
            .map(([itemName, count]) => `${itemName} x${count}`)
            .join('\n');

        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setDescription(
                await t(interaction, 'adventure.inventory.list', {
                    username: interaction.user.username,
                    items: itemList,
                })
            )
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
