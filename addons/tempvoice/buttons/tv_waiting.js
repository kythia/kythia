/**
 * @namespace: addons/tempvoice/buttons/tv_waiting.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { PermissionsBitField, ChannelType, MessageFlags } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { models, client, t, helpers } = container;
        const { simpleContainer } = helpers.discord;
        const { TempVoiceChannel } = models;

        // 1. Cek kepemilikan
        const activeChannel = await TempVoiceChannel.getCache({
            ownerId: interaction.user.id,
            guildId: interaction.guild.id,
        });
        if (!activeChannel) {
            return interaction.reply({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.waiting.no_active_channel'), {
                    color: 'Red',
                }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const mainChannel = await client.channels.fetch(activeChannel.channelId, { force: true }).catch(() => null);
        if (!mainChannel)
            return interaction.reply({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.common.channel_not_found'), {
                    color: 'Red',
                }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });

        try {
            if (activeChannel.waitingRoomChannelId) {
                // --- LOGIKA DISABLE WAITING ROOM ---
                const waitingRoom = await client.channels.fetch(activeChannel.waitingRoomChannelId, { force: true }).catch(() => null);
                if (waitingRoom) {
                    // Kick semua user di waiting room
                    for (const [_, member] of waitingRoom.members) {
                        await member.voice.disconnect(await t(interaction, 'tempvoice.waiting.wr_closed_reason'));
                    }
                    await waitingRoom.delete('Waiting room disabled by owner.');
                }

                // Buka lagi channel utamanya
                await mainChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    Connect: true, // Balikin ke default
                });

                activeChannel.waitingRoomChannelId = null;
                await activeChannel.saveAndUpdateCache();

                await interaction.reply({
                    components: await simpleContainer(interaction, await t(interaction, 'tempvoice.waiting.disabled'), { color: 'Green' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            } else {
                // --- LOGIKA ENABLE WAITING ROOM ---
                const wrName = await t(interaction, 'tempvoice.waiting.wr_channel_name', { name: mainChannel.name });
                const waitingRoom = await interaction.guild.channels.create({
                    name: wrName,
                    type: ChannelType.GuildVoice,
                    parent: mainChannel.parentId, // Taruh di kategori yang sama
                    permissionOverwrites: [
                        {
                            // @everyone: Boleh liat, boleh join
                            id: interaction.guild.roles.everyone,
                            allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.Connect],
                        },
                        {
                            // Owner: Boleh manage
                            id: interaction.user.id,
                            allow: [PermissionsBitField.Flags.ManageChannels, PermissionsBitField.Flags.MoveMembers],
                        },
                    ],
                });

                // Kunci channel utamanya
                await mainChannel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                    Connect: false,
                });

                activeChannel.waitingRoomChannelId = waitingRoom.id;
                await activeChannel.saveAndUpdateCache();

                await interaction.reply({
                    components: await simpleContainer(
                        interaction,
                        await t(interaction, 'tempvoice.waiting.enabled', { channel: waitingRoom.id }),
                        { color: 'Green' }
                    ),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }
        } catch (err) {
            logger.error(`[TempVoice] Gagal toggle waiting room: ${err.message}`);
            await interaction.reply({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.common.fail'), { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }
    },
};
