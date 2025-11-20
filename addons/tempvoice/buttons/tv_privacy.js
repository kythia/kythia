/**
 * @namespace: addons/tempvoice/buttons/tv_privacy.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { ActionRowBuilder, StringSelectMenuBuilder, ContainerBuilder, TextDisplayBuilder, MessageFlags } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { client, models, t, helpers, kythiaConfig } = container;
        const { TempVoiceChannel } = models;
        const { simpleContainer } = helpers.discord;
        const { convertColor } = helpers.color;

        const activeChannel = await TempVoiceChannel.getCache({
            ownerId: interaction.user.id,
            guildId: interaction.guild.id,
        });
        if (!activeChannel) {
            return interaction.reply({ content: await t(interaction, 'tempvoice.privacy.no_active_channel'), ephemeral: true });
        }
        const channelId = activeChannel.channelId;
        const channel = await client.channels.fetch(channelId, { force: true }).catch(() => null);
        if (!channel) {
            return interaction.reply({ content: await t(interaction, 'tempvoice.privacy.channel_not_found'), ephemeral: true });
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId(`tv_privacy_menu:${channelId}`)
            .setPlaceholder(await t(interaction, 'tempvoice.privacy.menu.placeholder'))
            .addOptions([
                {
                    label: await t(interaction, 'tempvoice.privacy.menu.lock.label'),
                    description: await t(interaction, 'tempvoice.privacy.menu.lock.desc'),
                    value: 'lock_channel',
                    emoji: '🔒',
                },
                {
                    label: await t(interaction, 'tempvoice.privacy.menu.unlock.label'),
                    description: await t(interaction, 'tempvoice.privacy.menu.unlock.desc'),
                    value: 'unlock_channel',
                    emoji: '🔓',
                },
                {
                    label: await t(interaction, 'tempvoice.privacy.menu.invisible.label'),
                    description: await t(interaction, 'tempvoice.privacy.menu.invisible.desc'),
                    value: 'invisible_channel',
                    emoji: '❌',
                },
                {
                    label: await t(interaction, 'tempvoice.privacy.menu.visible.label'),
                    description: await t(interaction, 'tempvoice.privacy.menu.visible.desc'),
                    value: 'visible_channel',
                    emoji: '👁️',
                },
            ]);

        const row = new ActionRowBuilder().addComponents(menu);

        const containerComponent = new ContainerBuilder()
            .setAccentColor(typeof convertColor === 'function' ? convertColor('#ffb86c', { from: 'hex', to: 'decimal' }) : 0xffb86c)
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'tempvoice.privacy.menu.content')))
            .addActionRowComponents(row);

        await interaction.reply({
            components: [containerComponent],
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
    },
};
