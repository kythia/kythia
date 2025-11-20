/**
 * @namespace: addons/pet/commands/admin/list.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const Pet = require('../../database/models/Pet');
const { embedFooter } = require('@coreHelpers/discord');
const { t } = require('@coreHelpers/translator');

module.exports = {
    data: (subcommand) => subcommand.setName('list').setDescription('Show all pets in the system'),
    subcommand: true,
    teamOnly: true,
    async execute(interaction) {
        await interaction.deferReply();

        const pets = await Pet.getAllCache({
            cacheTags: ['Pet:all'],
        });
        if (!pets.length) {
            const embed = new EmbedBuilder()
                .setDescription(
                    `## ${await t(interaction, 'pet.admin.list.list.empty.title')}\n${await t(interaction, 'pet.admin.list.list.empty.desc')}`
                )
                .setColor('Red')
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setDescription(`## ${await t(interaction, 'pet.admin.list.list.title')}\n${await t(interaction, 'pet.admin.list.list.desc')}`)
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true }))
            .setFooter(await embedFooter(interaction));

        // Use for...of with await to ensure all fields are added before sending
        for (const pet of pets) {
            embed.addFields({
                name: `> ${pet.icon} ${pet.name}`,
                value: await t(interaction, 'pet.admin.list.list.field', {
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
