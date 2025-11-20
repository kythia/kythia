/**
 * @namespace: addons/pet/commands/play.js
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
                .setDescription(`## ${await t(interaction, 'pet.play.no.pet.title')}\n${await t(interaction, 'pet.play.no.pet.desc')}`)
                .setColor(kythia.bot.color)
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }
        if (userPet.isDead) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet.play.dead.title')}\n${await t(interaction, 'pet.play.dead.desc')}`)
                .setColor(kythia.bot.color)
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }
        // Update happiness level
        userPet.happiness = Math.min(userPet.happiness + 20, 100);
        userPet.changed('happiness', true);
        await userPet.saveAndUpdateCache('userId');

        const embed = new EmbedBuilder()
            .setDescription(
                `## ${await t(interaction, 'pet.play.success.title')}\n${await t(interaction, 'pet.play.success.desc', {
                    icon: userPet.pet.icon,
                    name: userPet.pet.name,
                    rarity: userPet.pet.rarity,
                    happiness: userPet.happiness,
                })}`
            )
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
