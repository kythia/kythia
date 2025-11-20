/**
 * @namespace: addons/ticket/commands/add.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { MessageFlags } = require('discord.js');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Add a user to the ticket channel')
            .addUserOption((option) => option.setName('user').setDescription('User to add').setRequired(true)),

    async execute(interaction, container) {
        const { models, t, kythiaConfig, redis, helpers } = container;
        const { Ticket, TicketConfig, TicketPanel } = models;
        const { convertColor } = helpers.color;
        const { simpleContainer } = helpers.discord;

        const user = interaction.options.getUser('user');
        await interaction.channel.permissionOverwrites.edit(user.id, { ViewChannel: true });

        try {
            const dmDesc = await t(interaction, 'ticket.ticket.dm', {
                channel: `<#${interaction.channel.id}>`,
                guild: interaction.guild.name,
            });
            await user.send({
                components: await simpleContainer(interaction, dmDesc, { color: 'Blurple' }),
                flags: MessageFlags.IsComponentsV2,
            });
        } catch (err) {}

        const desc = await t(interaction, 'ticket.util.add_success', {
            userTag: user.tag,
        });
        return await interaction.reply({
            components: await simpleContainer(interaction, desc, { color: 'Green' }),
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
    },
};
