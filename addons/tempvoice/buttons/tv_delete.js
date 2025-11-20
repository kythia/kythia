/**
 * @namespace: addons/tempvoice/buttons/tv_delete.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, MessageFlags } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { models, client, t, helpers } = container;
        const { TempVoiceChannel } = models;
        const { simpleContainer } = helpers.discord;

        const ownerId = interaction.user.id;
        const activeChannel = await TempVoiceChannel.getCache({
            ownerId: ownerId,
            guildId: interaction.guild.id,
        });

        if (!activeChannel) {
            return interaction.reply({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.tv_delete.no_active'), { color: 'Red' }),
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            });
        }

        const channelId = activeChannel.channelId;
        const channel = await client.channels.fetch(channelId, { force: true }).catch(() => null);

        if (!channel) {
            return interaction.reply({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.tv_delete.not_found'), { color: 'Red' }),
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            });
        }

        const rowBtns = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('tv_delete_confirm')
                .setLabel(await t(interaction, 'tempvoice.tv_delete.delete_btn'))
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️'),
            new ButtonBuilder()
                .setCustomId('tv_delete_cancel')
                .setLabel(await t(interaction, 'tempvoice.tv_delete.cancel_btn'))
                .setStyle(ButtonStyle.Secondary)
        );

        const confirmText = await t(interaction, 'tempvoice.tv_delete.confirm');

        let confirmComponents = await simpleContainer(interaction, confirmText);

        if (Array.isArray(confirmComponents) && confirmComponents[0]?.addActionRowComponents) {
            confirmComponents[0].addActionRowComponents(rowBtns);
        }

        await interaction.reply({
            components: confirmComponents,
            flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
        });

        const msg = await interaction.fetchReply();
        const filter = (i) =>
            i.user.id === interaction.user.id && (i.customId === 'tv_delete_confirm' || i.customId === 'tv_delete_cancel');

        const collector = msg.createMessageComponentCollector({
            filter,
            componentType: ComponentType.Button,
            time: 15_000,
            max: 1,
        });

        collector.on('collect', async (btnInteraction) => {
            let message, color;

            if (btnInteraction.customId === 'tv_delete_confirm') {
                await channel.delete(await t(btnInteraction, 'tempvoice.tv_delete.deleted_reason'));
                message = await t(btnInteraction, 'tempvoice.tv_delete.deleted');
                color = 'Green';
            } else {
                message = await t(btnInteraction, 'tempvoice.tv_delete.cancelled');
                color = 'Red';
            }

            await btnInteraction.update({
                components: await simpleContainer(btnInteraction, message, { color }),
                flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
            });
        });

        collector.on('end', async (_collected, reason) => {
            if (reason === 'time' && msg.editable) {
                const expiredMsg = await t(interaction, 'tempvoice.tv_delete.expired');
                await msg
                    .edit({
                        components: await simpleContainer(interaction, expiredMsg, { color: 'Grey' }),
                        flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
                        embeds: [],
                    })
                    .catch(() => {});
            }
        });
    },
};
