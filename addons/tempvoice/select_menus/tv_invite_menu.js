/**
 * @namespace: addons/tempvoice/select_menus/tv_invite_menu.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { MessageFlags } = require('discord.js');

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

        const userIdsToInvite = interaction.values;
        const successNames = [];
        const failNames = [];
        let inviteUrl = '';

        try {
            const inviteReason = await t(interaction, 'tempvoice.invite.invite_reason');
            const invite = await channel.createInvite({
                maxAge: 3600,
                maxUses: userIdsToInvite.length + 1,
                reason: inviteReason,
            });
            inviteUrl = invite.url;
        } catch (err) {
            logger.error(`[TempVoice] Gagal bikin invite: ${err.message}`);
            return interaction.update({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.invite.fail'), { color: 'Red' }),
            });
        }

        const dmContent = await t(interaction, 'tempvoice.invite.dm_message', {
            user: interaction.user.globalName || interaction.user.username,
            guild: interaction.guild.name,
            channel: channel.name,
            inviteUrl: inviteUrl,
        });

        for (const userId of userIdsToInvite) {
            const user = await client.users.fetch(userId).catch(() => null);
            if (user) {
                try {
                    await user.send({
                        components: await simpleContainer(interaction, dmContent),
                        flags: MessageFlags.IsComponentsV2,
                    });
                    successNames.push(user.globalName || user.username);
                } catch (dmError) {
                    logger.warn(`[TempVoice] Gagal DM user ${user.tag}: ${dmError.message}`);
                    failNames.push(user.globalName || user.username);
                }
            }
        }

        let summaryContent = '';
        if (successNames.length > 0) {
            summaryContent += (await t(interaction, 'tempvoice.invite.success_dm', { users: successNames.join(', ') })) + '\n';
        }
        if (failNames.length > 0) {
            summaryContent += await t(interaction, 'tempvoice.invite.fail_dm', { users: failNames.join(', ') });
        }

        await interaction.update({
            components: await simpleContainer(interaction, summaryContent, { color: 'Green' }),
        });
    },
};
