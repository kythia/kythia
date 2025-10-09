/**
 * @namespace: addons/pet/commands/info.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const { EmbedBuilder } = require('discord.js');
const { UserPet, Pet } = require('../database/models');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('info').setDescription('View your pet info!'),
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const userPet = await UserPet.getCache({ userId: userId, include: [{ model: Pet, as: 'pet' }] });
        if (!userPet) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet_info_no_pet_title')}\n${await t(interaction, 'pet_info_no_pet')}`)
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }
        if (userPet.isDead) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet_info_dead_title')}\n${await t(interaction, 'pet_info_dead')}`)
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }
        const embed = new EmbedBuilder()
            .setDescription(
                `## ${await t(interaction, 'pet_info_title')}\n${await t(interaction, 'pet_info_info', {
                    icon: userPet.pet.icon,
                    name: userPet.pet.name,
                    rarity: userPet.pet.rarity,
                    petName: userPet.petName,
                    bonusType: userPet.pet.bonusType,
                    bonusValue: userPet.pet.bonusValue,
                    happiness: userPet.happiness,
                    hunger: userPet.hunger,
                    level: userPet.level,
                })}`
            )
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({
                text: await t(interaction, 'pet_info_footer', { bonusType: userPet.pet.bonusType, bonusValue: userPet.pet.bonusValue }),
            });

        return interaction.editReply({ embeds: [embed] });
    },
};
