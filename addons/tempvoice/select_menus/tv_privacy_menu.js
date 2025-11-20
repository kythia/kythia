/**
 * @namespace: addons/tempvoice/select_menus/tv_privacy_menu.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = {
    execute: async (interaction) => {
        const container = interaction.client.container;
        const { models, client, logger, t, helpers } = container;
        const { simpleContainer } = helpers.discord;
        const { TempVoiceChannel } = models;

        const selectedOp = interaction.values[0];
        const channelId = interaction.customId.split(':')[1];
        if (!channelId) {
            return interaction.update({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.privacy.menu.no_channel_id'), {
                    color: 'Red',
                }),
            });
        }

        const activeChannel = await TempVoiceChannel.getCache({
            channelId: channelId,
            ownerId: interaction.user.id,
        });
        if (!activeChannel) {
            return interaction.update({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.privacy.menu.not_owner'), { color: 'Red' }),
            });
        }

        const channel = await client.channels.fetch(channelId, { force: true }).catch(() => null);
        if (!channel) {
            return interaction.update({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.privacy.menu.channel_not_found'), {
                    color: 'Red',
                }),
            });
        }

        const everyoneRole = interaction.guild.roles.everyone;
        let resultKey = '';

        const currentPerms = channel.permissionsFor(everyoneRole);
        let newPerms = {
            ViewChannel: currentPerms.has(PermissionsBitField.Flags.ViewChannel),
            Connect: currentPerms.has(PermissionsBitField.Flags.Connect),
        };

        if (selectedOp === 'lock_channel') {
            newPerms.Connect = false;
            resultKey = 'tempvoice.privacy.menu.lock_success';
        } else if (selectedOp === 'unlock_channel') {
            newPerms.Connect = true;
            resultKey = 'tempvoice.privacy.menu.unlock_success';
        } else if (selectedOp === 'invisible_channel') {
            newPerms.ViewChannel = false;
            newPerms.Connect = false;
            resultKey = 'tempvoice.privacy.menu.invisible_success';
        } else if (selectedOp === 'visible_channel') {
            newPerms.ViewChannel = true;
            newPerms.Connect = true;
            resultKey = 'tempvoice.privacy.menu.visible_success';
        }

        try {
            await channel.permissionOverwrites.edit(everyoneRole, {
                [PermissionsBitField.Flags.ViewChannel]: newPerms.ViewChannel,
                [PermissionsBitField.Flags.Connect]: newPerms.Connect,
            });

            await interaction.update({
                components: await simpleContainer(interaction, await t(interaction, resultKey), { color: 'Green' }),
            });
        } catch (err) {
            logger.error(`[TempVoice] Gagal ubah privasi: ${err.message}`);

            await interaction.update({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.privacy.menu.fail'), { color: 'Red' }),
            });
        }
    },
};
