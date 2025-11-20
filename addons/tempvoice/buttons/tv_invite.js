/**
 * @namespace: addons/tempvoice/buttons/tv_invite.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { ActionRowBuilder, UserSelectMenuBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { models, t, helpers, kythiaConfig } = container;
        const { TempVoiceChannel } = models;
        const { convertColor } = helpers.color;
        const { simpleContainer } = helpers.discord;

        const activeChannel = await TempVoiceChannel.getCache({
            ownerId: interaction.user.id,
            guildId: interaction.guild.id,
        });

        if (!activeChannel) {
            return interaction.reply({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.invite.no_active_channel'), {
                    color: 'Red',
                }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const selectMenu = new UserSelectMenuBuilder()
            .setCustomId(`tv_invite_menu:${activeChannel.channelId}`)
            .setPlaceholder(await t(interaction, 'tempvoice.invite.menu.placeholder'))
            .setMinValues(1)
            .setMaxValues(10);

        const row = new ActionRowBuilder().addComponents(selectMenu);
        const accentColor = convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' });

        const containerComponent = new ContainerBuilder()
            .setAccentColor(accentColor)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'tempvoice.invite.menu.content')))
            .addActionRowComponents(row);

        await interaction.reply({
            components: [containerComponent],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
    },
};
