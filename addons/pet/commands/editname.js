/**
 * @namespace: addons/pet/commands/editname.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const UserPet = require('../database/models/UserPet');
const Pet = require('../database/models/Pet');
const { t } = require('@coreHelpers/translator');
const User = require('@coreModels/User');
const { embedFooter } = require('@coreHelpers/discord');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('editname')
            .setDescription('Edit your pet name!')
            .addStringOption((option) => option.setName('name').setDescription('New pet name').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const userPet = await UserPet.getCache({ userId: userId, include: [{ model: Pet, as: 'pet' }] });
        const newName = interaction.options.getString('name');
        userPet.petName = newName;
        userPet.changed('petName', true);
        await userPet.saveAndUpdateCache('userId');
        const embed = new EmbedBuilder()
            .setDescription(
                `## ${await t(interaction, 'pet.editname.success.title')}\n${await t(interaction, 'pet.editname.success.desc', {
                    icon: userPet.pet.icon,
                    name: userPet.pet.name,
                    rarity: userPet.pet.rarity,
                    petName: userPet.petName,
                })}`
            )
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter(await embedFooter(interaction))
            .setTimestamp();
        return await interaction.editReply({ embeds: [embed] });
    },
};
