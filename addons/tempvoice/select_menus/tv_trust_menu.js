/**
 * @namespace: addons/tempvoice/select_menus/tv_trust_menu.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { PermissionsBitField } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { models, client, t, helpers } = container;
        const { simpleContainer } = helpers.discord;
        const channelId = interaction.customId.split(':')[1];
        const { TempVoiceChannel } = models;

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

        const userIdsToTrust = interaction.values;
        const trustedNames = [];

        try {
            for (const userId of userIdsToTrust) {
                const member = await interaction.guild.members.fetch(userId).catch(() => null);
                if (member) {
                    await channel.permissionOverwrites.edit(member, {
                        [PermissionsBitField.Flags.ViewChannel]: true,
                        [PermissionsBitField.Flags.Connect]: true,
                        [PermissionsBitField.Flags.Speak]: true,
                    });
                    trustedNames.push(member.displayName);
                }
            }

            await interaction.update({
                components: await simpleContainer(
                    interaction,
                    await t(interaction, 'tempvoice.trust.success', {
                        users: trustedNames.join(', '),
                    }),
                    { color: 'Green' }
                ),
            });
        } catch (err) {
            await interaction.update({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.common.fail'), { color: 'Red' }),
            });
        }
    },
};
