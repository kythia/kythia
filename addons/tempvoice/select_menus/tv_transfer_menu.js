/**
 * @namespace: addons/tempvoice/select_menus/tv_transfer_menu.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { models, client, t, helpers, logger } = container;
        const { simpleContainer } = helpers.discord;
        const { TempVoiceChannel } = models;

        const channelId = interaction.customId.split(':')[1];

        if (!channelId)
            return interaction.update({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.common.no_channel_id'), { color: 'Red' }),
            });
        const activeChannel = await TempVoiceChannel.getCache({
            channelId: channelId,
            ownerId: interaction.user.id,
        });
        if (!activeChannel)
            return interaction.update({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.common.not_owner'), { color: 'Red' }),
            });

        const channel = await client.channels.fetch(channelId, { force: true }).catch(() => null);
        if (!channel)
            return interaction.update({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.common.channel_not_found'), {
                    color: 'Red',
                }),
            });

        const newOwnerId = interaction.values[0];
        const oldOwnerId = interaction.user.id;

        if (newOwnerId === oldOwnerId) {
            return interaction.update({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.transfer.transfer_to_self'), {
                    color: 'Yellow',
                }),
            });
        }

        const newOwnerMember = await interaction.guild.members.fetch(newOwnerId).catch(() => null);
        if (!newOwnerMember)
            return interaction.update({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.transfer.user_not_found'), { color: 'Red' }),
            });

        try {
            await channel.permissionOverwrites.delete(interaction.member);

            await channel.permissionOverwrites.edit(newOwnerMember, {
                [PermissionsBitField.Flags.ManageChannels]: true,
                [PermissionsBitField.Flags.MoveMembers]: true,
                [PermissionsBitField.Flags.ViewChannel]: true,
                [PermissionsBitField.Flags.Connect]: true,
            });

            activeChannel.ownerId = newOwnerId;
            await activeChannel.saveAndUpdateCache();

            // This message informs the previous owner (interaction.user) the transfer was successful.
            await interaction.update({
                components: await simpleContainer(
                    interaction,
                    await t(interaction, 'tempvoice.transfer.success', {
                        user: newOwnerMember.displayName,
                    }),
                    { color: 'Green' }
                ),
            });
            try {
                const newOwnerMsgContent = await t(interaction, 'tempvoice.transfer.newowner', {
                    user: `<@${newOwnerId}>`,
                });

                await channel.send({
                    components: await simpleContainer(interaction, newOwnerMsgContent, { color: 'Green' }),
                    flags: MessageFlags.IsComponentsV2, // Pastiin pake V2
                });
            } catch (sendErr) {
                logger.error(`[TempVoice] Gagal kirim notif transfer ke channel: ${sendErr.message}`);
            }
        } catch (err) {
            await interaction.update({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.common.fail'), { color: 'Red' }),
            });
        }
    },
};
