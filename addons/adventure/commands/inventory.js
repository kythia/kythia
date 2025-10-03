/**
 * @namespace: addons/adventure/commands/inventory.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const Inventory = require('../database/models/InventoryAdventure');
const User = require('../database/models/UserAdventure');
const { embedFooter } = require('@utils/discord');
const { EmbedBuilder } = require('discord.js');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('inventory').setDescription('🎒 Look at your inventory'),
    guildOnly: true,
    async execute(interaction) {
        await interaction.deferReply();
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const user = await User.getCache({ userId: userId, guildId: guildId });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'adventure_no_character'))
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const inventory = await Inventory.getAllCache({ userId: userId });

        if (inventory.length === 0) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'adventure_inventory_empty'))
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
            .setColor(kythia.bot.color)
            .setDescription(
                await t(interaction, 'adventure_inventory_list', {
                    username: interaction.user.username,
                    items: itemList,
                })
            )
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
