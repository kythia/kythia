/**
 * @namespace: addons/pet/commands/sell.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const UserPet = require('../database/models/UserPet');
const Pet = require('../database/models/Pet');
const { embedFooter } = require('@coreHelpers/discord');
const { t } = require('@coreHelpers/translator');
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
                .setDescription(`## ${await t(interaction, 'pet.sell.no.pet.title')}\n${await t(interaction, 'pet.sell.no.pet.desc')}`)
                .setColor('Red')
                .setFooter(await embedFooter(interaction));
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
                `## ${await t(interaction, 'pet.sell.success.title')}\n${await t(interaction, 'pet.sell.success.desc', { value: petValue })}`
            )
            .setColor(kythia.bot.color)
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    },
};
