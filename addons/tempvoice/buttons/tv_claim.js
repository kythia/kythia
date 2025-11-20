/**
 * @namespace: addons/tempvoice/buttons/tv_claim.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { models, client, t, helpers } = container;
        const { TempVoiceChannel } = models;
        const { simpleContainer } = helpers.discord;

        const userVoiceState = interaction.member.voice;
        if (!userVoiceState || !userVoiceState.channelId) {
            return interaction.reply({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.claim.not_in_channel'), { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const activeChannel = await TempVoiceChannel.getCache({
            channelId: userVoiceState.channelId,
            guildId: interaction.guild.id,
        });
        if (!activeChannel) {
            return interaction.reply({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.claim.not_temp_channel'), { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        if (activeChannel.ownerId === interaction.user.id) {
            return interaction.reply({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.claim.already_owner'), { color: 'Yellow' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const oldOwner = await interaction.guild.members.fetch(activeChannel.ownerId).catch(() => null);

        if (oldOwner) {
            return interaction.reply({
                components: await simpleContainer(
                    interaction,
                    await t(interaction, 'tempvoice.claim.owner_exists', { user: oldOwner.displayName }),
                    { color: 'Red' }
                ),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        try {
            const channel = await client.channels.fetch(activeChannel.channelId, { force: true });

            await channel.permissionOverwrites.delete(activeChannel.ownerId);

            await channel.permissionOverwrites.edit(interaction.member, {
                [PermissionsBitField.Flags.ManageChannels]: true,
                [PermissionsBitField.Flags.MoveMembers]: true,
                [PermissionsBitField.Flags.ViewChannel]: true,
                [PermissionsBitField.Flags.Connect]: true,
            });

            activeChannel.ownerId = interaction.user.id;
            await activeChannel.saveAndUpdateCache();

            return interaction.reply({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.claim.success'), { color: 'Green' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        } catch (err) {
            return interaction.reply({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.common.fail'), { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }
    },
};
