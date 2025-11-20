/**
 * @namespace: addons/pet/commands/feed.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const UserPet = require('../database/models/UserPet');
const Pet = require('../database/models/Pet');
const Inventory = require('@coreModels/Inventory');
const { t } = require('@coreHelpers/translator');
const { embedFooter } = require('@coreHelpers/discord');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('feed').setDescription('Feed your pet!'),
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const userPet = await UserPet.getCache({ userId: userId, include: [{ model: Pet, as: 'pet' }] });

        if (!userPet) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet.feed.no.pet.title')}\n${await t(interaction, 'pet.feed.no.pet.desc')}`)
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }
        if (userPet.isDead) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet.feed.dead.title')}\n${await t(interaction, 'pet.feed.dead.desc')}`)
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }

        const petFood = await Inventory.getCache({ userId: userId, itemName: '🍪 Pet Food' });
        if (!petFood) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet.feed.no.food.title')}\n${await t(interaction, 'pet.feed.no.food.desc')}`)
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
                .setDescription(`## ${await t(interaction, 'pet.feed.full.title')}\n${await t(interaction, 'pet.feed.full.desc')}`)
                .setColor(0x57f287);
            return interaction.editReply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setDescription(
                `## ${await t(interaction, 'pet.feed.success.title')}\n${await t(interaction, 'pet.feed.success.desc', {
                    icon: userPet.pet.icon,
                    name: userPet.pet.name,
                    rarity: userPet.pet.rarity,
                    hunger: userPet.hunger,
                })}`
            )
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
