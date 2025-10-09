/**
 * @namespace: addons/core/buttons/reactrole.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const Embed = require('@coreModels/Embed');
const { t } = require('@utils/translator');

module.exports = {
    execute: async (interaction) => {
        const [_, embedId, buttonIndex] = interaction.customId.split('-');
        const embedData = await Embed.findByPk(embedId);
        if (!embedData) return;

        const buttonData = embedData.buttons[buttonIndex];
        if (!buttonData) return;

        const role = interaction.guild.roles.cache.get(buttonData.roleId);
        const member = interaction.member;

        if (!role) {
            return interaction.reply({
                content: await t(interaction, 'core_buttons_reactrole_found'),
                ephemeral: true,
            });
        }

        if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
            await interaction.reply({
                content: await t(interaction, 'core_buttons_reactrole_removed', { roleName: role.name }),
                ephemeral: true,
            });
        } else {
            await member.roles.add(role);
            await interaction.reply({
                content: await t(interaction, 'core_buttons_reactrole_added', { roleName: role.name }),
                ephemeral: true,
            });
        }
    },
};
