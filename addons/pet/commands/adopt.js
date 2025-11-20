/**
 * @namespace: addons/pet/commands/adopt.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const { t } = require('@coreHelpers/translator');
const { embedFooter } = require('@coreHelpers/discord');
const KythiaUser = require('@coreModels/KythiaUser');
const UserPet = require('../database/models/UserPet');
const Pet = require('../database/models/Pet');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('adopt')
            .setDescription('Adopt a random pet')
            .addStringOption((option) => option.setName('name').setDescription('Pet name').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();

        const user = await KythiaUser.getCache({ userId: interaction.user.id });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const existingPet = await UserPet.getCache({
            where: { userId: interaction.user.id, isDead: false },
        });
        if (existingPet) {
            const title = await t(interaction, 'pet.adopt.already.title');
            const desc = await t(interaction, 'pet.adopt.already.desc');
            const embed = new EmbedBuilder()
                .setDescription(`## ${title}\n${desc}`)
                .setColor(kythia.bot.color)
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({
                embeds: [embed],
            });
        }

        const deadPet = await UserPet.getCache({
            where: { userId: interaction.user.id, isDead: true },
        });
        if (deadPet) {
            await deadPet.destroy();
        }

        const pets = await Pet.getAllCache({ cacheTags: ['Pet:all'] });
        const rarities = {
            common: 50,
            rare: 25,
            epic: 20,
            legendary: 5,
        };
        const weightedPets = pets.flatMap((pet) => Array(rarities[pet.rarity]).fill(pet));
        const selectedPet = weightedPets[Math.floor(Math.random() * weightedPets.length)];

        const name = interaction.options.getString('name');

        await UserPet.create({
            userId: interaction.user.id,
            petId: selectedPet.id,
            petName: name,
        });

        const title = await t(interaction, 'pet.adopt.success.title', {
            name: selectedPet.name,
            icon: selectedPet.icon ?? '',
            rarity: selectedPet.rarity,
        });
        const desc = await t(interaction, 'pet.adopt.success.simple', {
            name: selectedPet.name,
            icon: selectedPet.icon ?? '',
            rarity: selectedPet.rarity,
        });

        const embed = new EmbedBuilder()
            .setDescription(`## ${title}\n${desc}`)
            .setColor(kythia.bot.color)
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({
            embeds: [embed],
        });
    },
};
