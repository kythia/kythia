/**
 * @namespace: addons/pet/commands/play.js
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
    data: (subcommand) => subcommand.setName('play').setDescription('Play with your pet!'),
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        // Get user's pet
        const userPet = await UserPet.getCache({ userId: userId, include: [{ model: Pet, as: 'pet' }] });
        if (!userPet) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet_play_no_pet_title')}\n${await t(interaction, 'pet_play_no_pet')}`)
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }
        if (userPet.isDead) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet_play_dead_title')}\n${await t(interaction, 'pet_play_dead')}`)
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }
        // Update happiness level
        userPet.happiness = Math.min(userPet.happiness + 20, 100);
        userPet.changed('happiness', true);
        await userPet.saveAndUpdateCache('userId');

        const embed = new EmbedBuilder()
            .setDescription(
                `## ${await t(interaction, 'pet_play_success_title')}\n${await t(interaction, 'pet_play_success', {
                    icon: userPet.pet.icon,
                    name: userPet.pet.name,
                    rarity: userPet.pet.rarity,
                    happiness: userPet.happiness,
                })}`
            )
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: await t(interaction, 'pet_play_footer', { happiness: userPet.happiness }) });

        return interaction.editReply({ embeds: [embed] });
    },
};
