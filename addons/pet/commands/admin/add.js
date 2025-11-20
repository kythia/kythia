/**
 * @namespace: addons/pet/commands/admin/add.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const UserPet = require('../../database/models/UserPet');
const Pet = require('../../database/models/Pet');
const { embedFooter } = require('@coreHelpers/discord');
const { t } = require('@coreHelpers/translator');

module.exports = {
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
                    .setDescription('Bonus type (Coin or Ruby)')
                    .addChoices({ name: 'Coin', value: 'coin' }, { name: 'Ruby', value: 'ruby' })
                    .setRequired(true)
            )
            .addIntegerOption((option) => option.setName('bonus_value').setDescription('Bonus value').setRequired(true)),
    subcommand: true,
    teamOnly: true,
    async execute(interaction) {
        await interaction.deferReply();

        const name = interaction.options.getString('name');
        const icon = interaction.options.getString('icon');
        const rarity = interaction.options.getString('rarity');
        const bonusType = interaction.options.getString('bonus_type');
        const bonusValue = interaction.options.getInteger('bonus_value');

        await Pet.create({ name, icon, rarity, bonusType, bonusValue });
        const embed = new EmbedBuilder()
            .setDescription(
                `## ${await t(interaction, 'pet.admin.add.add.success.title')}\n${await t(interaction, 'pet.admin.add.add.success.desc', { name })}`
            )
            .setColor(kythia.bot.color)
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    },
};
