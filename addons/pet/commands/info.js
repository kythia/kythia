/**
 * @namespace: addons/pet/commands/info.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const { embedFooter } = require('@coreHelpers/discord');
const { t } = require('@coreHelpers/translator');
const UserPet = require('../database/models/UserPet');
const Pet = require('../database/models/Pet');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('info').setDescription('View your pet info!'),
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;
        const userPet = await UserPet.getCache({ userId: userId, include: [{ model: Pet, as: 'pet' }] });
        if (!userPet) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet.info.no.pet.title')}\n${await t(interaction, 'pet.info.no.pet.desc')}`)
                .setColor(kythia.bot.color)
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }
        if (userPet.isDead) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet.info.dead.title')}\n${await t(interaction, 'pet.info.dead.desc')}`)
                .setColor(kythia.bot.color)
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }
        const embed = new EmbedBuilder()
            .setDescription(
                `## ${await t(interaction, 'pet.info.title')}\n${await t(interaction, 'pet.info.desc', {
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
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
