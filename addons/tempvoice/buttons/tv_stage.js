/**
 * @namespace: addons/tempvoice/buttons/tv_stage.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { models, client, t, helpers } = container;
        const { simpleContainer } = helpers.discord;
        const { TempVoiceChannel } = models;

        const activeChannel = await TempVoiceChannel.getCache({
            ownerId: interaction.user.id,
            guildId: interaction.guild.id,
        });
        if (!activeChannel) {
            return interaction.reply({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.stage.no_active_channel'), { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const channel = await client.channels.fetch(activeChannel.channelId, { force: true }).catch(() => null);
        if (!channel) {
            return interaction.reply({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.common.channel_not_found'), {
                    color: 'Red',
                }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const everyoneRole = interaction.guild.roles.everyone;
        const perms = channel.permissionsFor(everyoneRole);
        const canEveryoneSpeak = perms.has(PermissionsBitField.Flags.Speak);

        try {
            if (canEveryoneSpeak) {
                await channel.permissionOverwrites.edit(everyoneRole, {
                    [PermissionsBitField.Flags.Speak]: false,
                });
                await interaction.reply({
                    components: await simpleContainer(interaction, await t(interaction, 'tempvoice.stage.enabled'), { color: 'Green' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            } else {
                await channel.permissionOverwrites.edit(everyoneRole, {
                    [PermissionsBitField.Flags.Speak]: true,
                });
                await interaction.reply({
                    components: await simpleContainer(interaction, await t(interaction, 'tempvoice.stage.disabled'), { color: 'Green' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }
        } catch (err) {
            await interaction.reply({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.common.fail'), { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }
    },
};
