/**
 * @namespace: addons/pet/commands/adopt.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */
const { EmbedBuilder } = require('discord.js');
const { UserPet, Pet } = require('../database/models');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('adopt')
            .setDescription('Adopt a random pet')
            .addStringOption((option) => option.setName('name').setDescription('Pet name').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const userId = interaction.user.id;
        const name = interaction.options.getString('name');
        const existingPet = await UserPet.getCache({ userId, isDead: false, include: [{ model: Pet, as: 'pet' }] });
        if (existingPet) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet_adopt_already_title')}\n${await t(interaction, 'pet_adopt_already')}`)
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }

        const deadPet = await UserPet.getCache({ userId, isDead: true });
        if (deadPet) {
            await deadPet.destroy();
        }
        const pets = await Pet.findAll();

        const rarities = {
            common: 50,
            rare: 25,
            epic: 20,
            legendary: 5,
        };

        const weightedPets = pets.flatMap((pet) => Array(rarities[pet.rarity]).fill(pet));

        const randomPet = weightedPets[Math.floor(Math.random() * weightedPets.length)];

        // Create user pet
        await UserPet.create({ userId, petId: randomPet.id, petName: name });

        // Create embed
        const embed = new EmbedBuilder()
            .setDescription(
                `## ${await t(interaction, 'pet_adopt_success_title')}\n${await t(interaction, 'pet_adopt_success', {
                    icon: randomPet.icon,
                    name: randomPet.name,
                    rarity: randomPet.rarity,
                    bonusType: randomPet.bonusType,
                    bonusValue: randomPet.bonusValue,
                })}`
            )
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: await t(interaction, 'pet_adopt_footer') });

        return interaction.editReply({ embeds: [embed] });
    },
};
