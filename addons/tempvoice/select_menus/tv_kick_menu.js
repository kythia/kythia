/**
 * @namespace: addons/tempvoice/select_menus/tv_kick_menu.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { MessageFlags } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { models, client, t, helpers } = container;
        const { simpleContainer } = helpers.discord;
        const { TempVoiceChannel } = models;

        const userIdToKick = interaction.values[0];
        const channelId = interaction.customId.split(':')[1];

        if (!channelId) {
            return interaction.update({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.common.no_channel_id'), { color: 'Red' }),
            });
        }

        const activeChannel = await TempVoiceChannel.getCache({
            channelId: channelId,
            ownerId: interaction.user.id,
        });
        if (!activeChannel) {
            return interaction.update({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.common.not_owner'), { color: 'Red' }),
            });
        }

        const channel = await client.channels.fetch(channelId, { force: true }).catch(() => null);
        if (!channel) {
            return interaction.update({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.common.channel_not_found'), {
                    color: 'Red',
                }),
            });
        }

        const memberToKick = await interaction.guild.members.fetch(userIdToKick).catch(() => null);
        if (!memberToKick) {
            return interaction.update({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.kick.menu.user_not_found'), {
                    color: 'Red',
                }),
            });
        }

        if (memberToKick.voice.channelId !== channelId) {
            return interaction.update({
                components: await simpleContainer(
                    interaction,
                    await t(interaction, 'tempvoice.kick.menu.not_in_channel', { user: memberToKick.displayName }),
                    { color: 'Red' }
                ),
            });
        }

        try {
            await memberToKick.voice.disconnect(await t(interaction, 'tempvoice.kick.menu.kick_reason'));

            await interaction.update({
                components: await simpleContainer(
                    interaction,
                    await t(interaction, 'tempvoice.kick.menu.success', { user: memberToKick.displayName }),
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
