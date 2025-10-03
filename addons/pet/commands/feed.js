/**
 * @namespace: addons/pet/commands/feed.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { EmbedBuilder } = require('discord.js');
const { UserPet, Pet } = require('../database/models');
const Inventory = require('@coreModels/Inventory');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('feed').setDescription('Feed your pet!'),
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const userPet = await UserPet.getCache({ userId: userId, include: [{ model: Pet, as: 'pet' }] });

        if (!userPet) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet_feed_no_pet_title')}\n${await t(interaction, 'pet_feed_no_pet')}`)
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }
        if (userPet.isDead) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet_feed_dead_title')}\n${await t(interaction, 'pet_feed_dead')}`)
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }

        const petFood = await Inventory.getCache({ userId: userId, itemName: '🍪 Pet Food' });
        if (!petFood) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet_feed_no_food_title')}\n${await t(interaction, 'pet_feed_no_food')}`)
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }
        await petFood.destroy();
        userPet.hunger = Math.min(userPet.hunger + 20, 100);
        userPet.changed('hunger', true);
        await userPet.saveAndUpdateCache('userId');

        // Check if hunger exceeds the maximum limit
        if (userPet.hunger >= 100) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet_feed_full_title')}\n${await t(interaction, 'pet_feed_full')}`)
                .setColor(0x57f287);
            return interaction.editReply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setDescription(
                `## ${await t(interaction, 'pet_feed_success_title')}\n${await t(interaction, 'pet_feed_success', {
                    icon: userPet.pet.icon,
                    name: userPet.pet.name,
                    rarity: userPet.pet.rarity,
                    hunger: userPet.hunger,
                })}`
            )
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: await t(interaction, 'pet_feed_footer', { hunger: userPet.hunger }) });

        return interaction.editReply({ embeds: [embed] });
    },
};
