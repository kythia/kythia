/**
 * @namespace: addons/pet/commands/sell.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { EmbedBuilder } = require('discord.js');
const { UserPet, Pet } = require('../database/models');
const { t } = require('@utils/translator');
const User = require('@coreModels/User');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('sell').setDescription('Sell your pet!'),
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const user = await User.getCache({ userId, guildId: interaction.guild.id });
        const userPet = await UserPet.getCache({ userId: userId, include: [{ model: Pet, as: 'pet' }] });
        if (!userPet) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet_sell_no_pet_title')}\n${await t(interaction, 'pet_sell_no_pet')}`)
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }
        const rarity = userPet.pet.rarity;
        const rarityValue = {
            common: 80,
            rare: 150,
            epic: 250,
            legendary: 400,
        };

        const petValue = rarityValue[rarity] * userPet.level;
        user.cash += petValue;
        await userPet.destroy();
        user.changed('cash', true);
        await user.saveAndUpdateCache('userId');
        const embed = new EmbedBuilder()
            .setDescription(
                `## ${await t(interaction, 'pet_sell_success_title')}\n${await t(interaction, 'pet_sell_success', { value: petValue })}`
            )
            .setColor(0x57f287);
        return interaction.editReply({ embeds: [embed] });
    },
};
