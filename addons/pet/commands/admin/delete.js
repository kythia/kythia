/**
 * @namespace: addons/pet/commands/admin/delete.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const { EmbedBuilder } = require('discord.js');
const { Pet } = require('../../database/models');
const { t } = require('@utils/translator');

module.exports = {
    data: (subcommand) =>
        subcommand
    .setName('delete')
    .setDescription('Delete a pet from the system')
    .addStringOption((option) => option.setName('name').setDescription('Name of the pet to delete').setRequired(true)),
    subcommand: true,
    teamOnly: true,
    async execute(interaction) {
        await interaction.deferReply();

        const name = interaction.options.getString('name');
        const deleted = await Pet.destroy({ where: { name } });
        if (deleted) {
            const embed = new EmbedBuilder()
                .setDescription(
                    `## ${await t(interaction, 'pet_admin_delete_delete_success_title')}\n${await t(interaction, 'pet_admin_delete_delete_success', { name })}`
                )
                .setColor(0x57f287);
            return interaction.editReply({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setDescription(`## ${await t(interaction, 'pet_admin_delete_delete_notfound_title')}\n${await t(interaction, 'pet_admin_delete_delete_notfound')}`)
                .setColor(0xed4245);
            return interaction.editReply({ embeds: [embed] });
        }
    },
};
