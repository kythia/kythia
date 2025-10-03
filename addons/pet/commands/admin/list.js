/**
 * @namespace: addons/pet/commands/admin/list.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { EmbedBuilder } = require('discord.js');
const { Pet } = require('../../database/models');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('list').setDescription('Show all pets in the system'),
    async execute(interaction) {
        await interaction.deferReply();

        const pets = await Pet.findAll();
        if (!pets.length) {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet_admin_list_list_empty_title')}\n${await t(interaction, 'pet_admin_list_list_empty')}`)
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setDescription(`## ${await t(interaction, 'pet_admin_list_list_title')}\n${await t(interaction, 'pet_admin_list_list_desc')}`)
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: await t(interaction, 'pet_admin_list_list_footer') });

        // Use for...of with await to ensure all fields are added before sending
        for (const pet of pets) {
            embed.addFields({
                name: `> ${pet.icon} ${pet.name}`,
                value: await t(interaction, 'pet_admin_list_list_field', {
                    rarity: pet.rarity,
                    bonusType: pet.bonusType.toUpperCase(),
                    bonusValue: pet.bonusValue,
                }),
            });
        }

        // console.log(pets) // Optionally keep or remove
        return await interaction.editReply({ embeds: [embed] });
    },
};
