/**
 * @namespace: addons/pet/commands/use.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const { EmbedBuilder } = require('discord.js');
const ServerSetting = require('@coreModels/ServerSetting');
const { UserPet, Pet } = require('../database/models');
const { checkCooldown } = require('@utils/time');
const { t } = require('@utils/translator');
const User = require('@coreModels/User');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('use').setDescription('Use your pet and get a bonus!'),
    async execute(interaction) {
        await interaction.deferReply();

        // Cooldown check
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;
        const setting = await ServerSetting.getCache({ guildId: guildId });
        const user = await User.getCache({ userId, guildId: interaction.guild.id });
        const userPet = await UserPet.getCache({ userId: userId, include: [{ model: Pet, as: 'pet' }] });
        if (!userPet) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet_use_no_pet_title')}\n${await t(interaction, 'pet_use_no_pet')}`)
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }
        const cooldown = checkCooldown(userPet.lastUse, setting.petCooldown);
        if (cooldown.remaining) {
            const embed = new EmbedBuilder()
                .setDescription(
                    `## ${await t(interaction, 'pet_use_cooldown_title')}\n${await t(interaction, 'pet_use_cooldown', { time: cooldown.time })}`
                )
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }
        if (userPet.isDead) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet_use_dead_title')}\n${await t(interaction, 'pet_use_dead')}`)
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }
        userPet.level += 1;
        let multiplier = 1;
        if (userPet.level >= 30) multiplier = 5;
        else if (userPet.level >= 20) multiplier = 4;
        else if (userPet.level >= 10) multiplier = 3;
        else if (userPet.level >= 5) multiplier = 2;
        user.xp += userPet.pet.bonusValue * multiplier;

        userPet.lastUse = new Date();
        userPet.changed('lastUse', true);
        await userPet.saveAndUpdateCache('userId');

        if (userPet.pet.bonusType === 'xp') {
            user.xp += userPet.pet.bonusValue * multiplier;
        } else if (userPet.pet.bonusType === 'money') {
            user.cash += userPet.pet.bonusValue * multiplier;
        }

        user.changed('xp', true);
        await user.saveAndUpdateCache('userId');
        const embed = new EmbedBuilder()
            .setDescription(
                `## ${await t(interaction, 'pet_use_success_title')}\n${await t(interaction, 'pet_use_success', {
                    icon: userPet.pet.icon,
                    name: userPet.pet.name,
                    rarity: userPet.pet.rarity,
                    bonusType: userPet.pet.bonusType,
                    bonusValue: userPet.pet.bonusValue * multiplier,
                    level: userPet.level,
                })}`
            )
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: await t(interaction, 'pet_use_footer', { level: userPet.level }) });

        return interaction.editReply({ embeds: [embed] });
    },
};
