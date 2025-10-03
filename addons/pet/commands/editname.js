/**
 * @namespace: addons/pet/commands/editname.js
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
    data: (subcommand) =>
        subcommand
            .setName('editname')
            .setDescription('Edit your pet name!')
            .addStringOption((option) => option.setName('name').setDescription('New pet name').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const user = await User.getCache({ userId, guildId: interaction.guild.id });
        const userPet = await UserPet.getCache({ userId: userId, include: [{ model: Pet, as: 'pet' }] });
        const newName = interaction.options.getString('name');
        userPet.petName = newName;
        userPet.changed('petName', true);
        await userPet.saveAndUpdateCache('userId');
        const embed = new EmbedBuilder()
            .setDescription(
                `## ${await t(interaction, 'pet_editname_success_title')}\n${await t(interaction, 'pet_editname_success', {
                    icon: userPet.pet.icon,
                    name: userPet.pet.name,
                    rarity: userPet.pet.rarity,
                    petName: userPet.petName,
                })}`
            )
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: await t(interaction, 'pet_editname_footer', { petName: userPet.petName }) })
            .setTimestamp();
        return await interaction.editReply({ embeds: [embed] });
    },
};
