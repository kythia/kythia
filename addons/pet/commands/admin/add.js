/**
 * @namespace: addons/pet/commands/admin/add.js
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
    data: (subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Add a new pet')
            .addStringOption((option) => option.setName('name').setDescription('Pet name').setRequired(true))
            .addStringOption((option) => option.setName('icon').setDescription('Icon (emoji) for the pet').setRequired(true))
            .addStringOption((option) =>
                option
                    .setName('rarity')
                    .setDescription('Rarity of the pet')
                    .addChoices(
                        { name: 'Common', value: 'common' },
                        { name: 'Rare', value: 'rare' },
                        { name: 'Epic', value: 'epic' },
                        { name: 'Legendary', value: 'legendary' }
                    )
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('bonus_type')
                    .setDescription('Bonus type (XP or Money)')
                    .addChoices({ name: 'XP', value: 'xp' }, { name: 'Money', value: 'money' })
                    .setRequired(true)
            )
            .addIntegerOption((option) => option.setName('bonus_value').setDescription('Bonus value').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();

        const name = interaction.options.getString('name');
        const icon = interaction.options.getString('icon');
        const rarity = interaction.options.getString('rarity');
        const bonusType = interaction.options.getString('bonus_type');
        const bonusValue = interaction.options.getInteger('bonus_value');

        await Pet.create({ name, icon, rarity, bonusType, bonusValue });
        const embed = new EmbedBuilder()
            .setDescription(`## ${await t(interaction, 'pet_admin_add_add_success_title')}\n${await t(interaction, 'pet_admin_add_add_success', { name })}`)
            .setColor(0x57f287);
        return interaction.editReply({ embeds: [embed] });
    },
};
