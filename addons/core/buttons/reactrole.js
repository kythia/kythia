/**
 * @namespace: addons/core/buttons/reactrole.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

module.exports = {
    execute: async (interaction) => {
        const { t, models } = interaction.client.container;
        const { Embed } = models;

        const [_, embedId, buttonIndex] = interaction.customId.split('-');
        const embedData = await Embed.getCache({ messageId: embedId });
        if (!embedData) return;

        const buttonData = embedData.buttons[buttonIndex];
        if (!buttonData) return;

        const role = interaction.guild.roles.cache.get(buttonData.roleId);
        const member = interaction.member;

        if (!role) {
            return interaction.reply({
                content: await t(interaction, 'core.buttons.reactrole.found'),
                ephemeral: true,
            });
        }

        if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
            await interaction.reply({
                content: await t(interaction, 'core.buttons.reactrole.removed', { roleName: role.name }),
                ephemeral: true,
            });
        } else {
            await member.roles.add(role);
            await interaction.reply({
                content: await t(interaction, 'core.buttons.reactrole.added', { roleName: role.name }),
                ephemeral: true,
            });
        }
    },
};
