/**
 * @namespace: addons/pet/commands/use.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const ServerSetting = require('@coreModels/ServerSetting');
const UserPet = require('../database/models/UserPet');
const Pet = require('../database/models/Pet');
const { embedFooter } = require('@coreHelpers/discord');
const { checkCooldown } = require('@coreHelpers/time');
const { t } = require('@coreHelpers/translator');
const KythiaUser = require('@coreModels/KythiaUser');
const { updatePetStatus } = require('../helpers/status');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('use').setDescription('Use your pet and get a bonus!'),
    async execute(interaction) {
        await interaction.deferReply();

        const userId = interaction.user.id;

        const kythiaUser = await KythiaUser.getCache({ userId });
        let userPet = await UserPet.getCache({
            where: { userId: userId, isDead: false },
            include: [{ model: Pet, as: 'pet' }],
        });

        if (!userPet) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet.use.no.pet.title')}\n${await t(interaction, 'pet.use.no.pet.desc')}`)
                .setColor('Red')
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const { pet: updatedPet, justDied } = updatePetStatus(userPet);
        await updatedPet.saveAndUpdateCache();

        if (justDied) {
            try {
                await interaction.user.send('Pesan duka: Pet-mu telah mati karena tidak terurus! 💀');
            } catch (e) {
                /* abaikan jika DM gagal */
            }
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet.use.dead.title')}\n${await t(interaction, 'pet.use.dead.desc')}`)
                .setColor('Red')
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const cooldown = checkCooldown(updatedPet.lastUse, kythia.addons.pet.useCooldown || 14400, interaction);
        if (cooldown.remaining) {
            const embed = new EmbedBuilder()
                .setDescription(
                    `## ${await t(interaction, 'pet.use.cooldown.title')}\n${await t(interaction, 'pet.use.cooldown.desc', { time: cooldown.time })}`
                )
                .setColor('Red')
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        updatedPet.level += 1;

        let multiplier = 1;
        if (updatedPet.level >= 30) multiplier = 5;
        else if (updatedPet.level >= 20) multiplier = 4;
        else if (updatedPet.level >= 10) multiplier = 3;
        else if (updatedPet.level >= 5) multiplier = 2;

        let bonusValue = updatedPet.pet.bonusValue * multiplier;
        let bonusTypeDisplay = '';

        if (updatedPet.pet.bonusType === 'coin') {
            kythiaUser.kythiaCoin = (BigInt(kythiaUser.kythiaCoin) || 0n) + BigInt(bonusValue);
            bonusTypeDisplay = 'KythiaCoin';

            kythiaUser.changed('kythiaCoin', true);
        } else if (updatedPet.pet.bonusType === 'ruby') {
            kythiaUser.kythiaRuby = (BigInt(kythiaUser.kythiaRuby) || 0n) + BigInt(bonusValue);
            bonusTypeDisplay = 'KythiaRuby';

            kythiaUser.changed('kythiaRuby', true);
        }

        updatedPet.lastUse = new Date();
        await updatedPet.saveAndUpdateCache();

        await kythiaUser.saveAndUpdateCache();

        const embed = new EmbedBuilder()
            .setDescription(
                `## ${await t(interaction, 'pet.use.success.title')}\n${await t(interaction, 'pet.use.success.desc', {
                    icon: updatedPet.pet.icon,
                    name: updatedPet.pet.name,
                    rarity: updatedPet.pet.rarity,
                    bonusType: bonusTypeDisplay,
                    bonusValue: bonusValue,
                    level: updatedPet.level,
                })}`
            )
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
