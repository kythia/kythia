/**
 * @namespace: addons/pet/commands/gacha.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { EmbedBuilder } = require('discord.js');
const ServerSetting = require('@coreModels/ServerSetting');
const { UserPet, Pet } = require('../database/models');
const { checkCooldown } = require('@utils/time');
const { t } = require('@utils/translator');
const User = require('@coreModels/User');
const { Op } = require('sequelize');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('gacha').setDescription('Gacha your pet!'),
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const setting = await ServerSetting.getCache({ guildId: guildId });
        const user = await User.getCache({ userId, guildId: interaction.guild.id });
        const userPet = await UserPet.getCache({ userId: userId, include: [{ model: Pet, as: 'pet' }] });

        if (!userPet) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet_gacha_no_pet_title')}\n${await t(interaction, 'pet_gacha_no_pet')}`)
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }

        const cooldown = checkCooldown(userPet.lastGacha, setting.petGachaCooldown);
        if (cooldown.remaining) {
            const embed = new EmbedBuilder()
                .setDescription(
                    `## ${await t(interaction, 'pet_gacha_cooldown_title')}\n${await t(interaction, 'pet_gacha_cooldown', { time: cooldown.time })}`
                )
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }

        const pet = await Pet.getCache({ id: userPet.petId });
        const rarity = pet.rarity;

        const rarityChance = {
            common: 0.9, // 90% chance for same rarity
            rare: 0.75, // 75% chance for same rarity
            epic: 0.5, // 50% chance for same rarity
            legendary: 0.1, // 10% chance for same rarity
        };
        const random = Math.random();
        // Determine the rarity of the new pet
        const selectedRarity =
            random < rarityChance[rarity] ? rarity : random < rarityChance[rarity] + 0.1 ? getHigherRarity(rarity) : rarity;

        // Get the new pet based on the rarity
        const selectedPet = await Pet.getCache({
            rarity: selectedRarity,
            id: { [Op.ne]: userPet.petId }, // Exclude current pet
            order: User.sequelize.random(), // Randomize to select one from the rarity pool
        });

        // Calculate the new pet level as 40% of the previous pet's level
        const newLevel = Math.floor(userPet.level * 0.4);

        // Delete the old pet and create the new one
        const petName = `${userPet.petName}`;
        await userPet.destroy();
        await UserPet.create({ userId, petId: selectedPet.id, petName: petName, level: newLevel });

        const embed = new EmbedBuilder()
            .setDescription(
                `## ${await t(interaction, 'pet_gacha_success_title')}\n${await t(interaction, 'pet_gacha_success', {
                    icon: selectedPet.icon,
                    name: selectedPet.name,
                    rarity: selectedPet.rarity,
                    level: newLevel,
                })}`
            )
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: await t(interaction, 'pet_gacha_footer', { level: newLevel }) });

        return await interaction.editReply({ embeds: [embed] });

        // Helper function to get a higher rarity
        function getHigherRarity(currentRarity) {
            switch (currentRarity) {
                case 'common':
                    return 'rare';
                case 'rare':
                    return 'epic';
                case 'epic':
                    return 'legendary';
                default:
                    return currentRarity;
            }
        }
    },
};
