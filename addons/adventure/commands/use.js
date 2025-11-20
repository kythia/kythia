/**
 * @namespace: addons/adventure/commands/use.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { getItem } = require('../helpers/items');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('use').setDescription('Use an item from your inventory'),

    async execute(interaction, container) {
        // Dependency
        const { t, models, kythiaConfig, helpers } = container;
        const { UserAdventure, InventoryAdventure } = models;
        const { embedFooter } = helpers.discord;
        const user = await UserAdventure.getCache({ userId: interaction.user.id });

        if (!user) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'adventure.no.character'))
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const inventory = await InventoryAdventure.findAll({
            where: {
                userId: interaction.user.id,
                itemName: ['🍶 Health Potion', '🍶 Revival'],
            },
            raw: true,
        });

        if (inventory.length === 0) {
            return interaction.reply({
                content: await t(interaction, 'inventory.no.usable.items'),
                ephemeral: true,
            });
        }

        const options = inventory.map((item) => ({
            label: item.itemName,
            description: getItem(item.itemName)?.description || 'No description',
            value: item.itemName,
            emoji: item.itemName.split(' ')[0],
        }));

        const selectMenu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('use_item_select')
                .setPlaceholder(t(interaction, 'inventory.select.item.placeholder'))
                .addOptions(options)
        );

        const embed = new EmbedBuilder()
            .setTitle(t(interaction, 'inventory.use.title'))
            .setDescription(t(interaction, 'inventory.use.desc'))
            .setColor('#2ecc71');

        await interaction.reply({
            embeds: [embed],
            components: [selectMenu],
            ephemeral: true,
        });

        const filter = (i) => i.customId === 'use_item_select' && i.user.id === interaction.user.id;

        try {
            const response = await interaction.channel.awaitMessageComponent({
                filter,
                time: 60000,
            });

            const itemName = response.values[0];
            const item = getItem(itemName);

            if (!item) {
                return response.update({
                    content: t(interaction, 'inventory.item.not.found'),
                    embeds: [],
                    components: [],
                });
            }

            let resultMessage = '';
            const userMaxHp = getUserMaxHp(user);

            switch (itemName) {
                case '🍶 Health Potion':
                    const healAmount = 50;
                    const newHp = Math.min(user.hp + healAmount, user.maxHp);
                    const actualHeal = newHp - user.hp;
                    user.hp = newHp;
                    await user.saveAndUpdateCache();

                    await InventoryAdventure.decrement('quantity', {
                        where: { userId: interaction.user.id, itemName },
                    });
                    await InventoryAdventure.clearCache({ userId: interaction.user.id, itemName });

                    resultMessage = t(interaction, 'inventory.use.potion.success', { amount: actualHeal });
                    break;

                case '🍶 Revival':
                    resultMessage = t(interaction, 'inventory.use.revival.success');
                    break;

                default:
                    resultMessage = t(interaction, 'inventory.cannot.use.item');
            }

            await response.update({
                content: resultMessage,
                embeds: [],
                components: [],
            });
        } catch (error) {
            if (!interaction.replied) {
                await interaction.editReply({
                    content: t(interaction, 'inventory.selection.timeout'),
                    embeds: [],
                    components: [],
                });
            }
        }
    },
};
