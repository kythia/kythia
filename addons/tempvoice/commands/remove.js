/**
 * @namespace: addons/tempvoice/commands/remove.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { MessageFlags, ChannelType } = require('discord.js');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('remove').setDescription('Disable the tempvoice system and remove the panel.'),

    async execute(interaction, container) {
        const { models, logger, client, helpers, t } = container;
        const { TempVoiceConfig, TempVoiceChannel } = models;
        const { simpleContainer } = helpers.discord;
        const guildId = interaction.guild.id;

        await interaction.deferReply({ ephemeral: true });

        const config = await TempVoiceConfig.getCache({ guildId: guildId });
        if (!config) {
            return interaction.editReply({
                components: await simpleContainer(interaction, await t(interaction, 'tempvoice.unset.not_setup'), { color: 'Yellow' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }

        const deleteReason = await t(interaction, 'tempvoice.unset.delete_reason');
        const deleteReasonPanel = await t(interaction, 'tempvoice.unset.delete_reason_panel');
        const deleteReasonTrigger = await t(interaction, 'tempvoice.unset.delete_reason_trigger');
        const deleteReasonCategory = await t(interaction, 'tempvoice.unset.delete_reason_category');

        const activeChannels = await TempVoiceChannel.getAllCache({ where: { guildId: guildId } });
        let tempvoiceChannelIds = new Set(activeChannels.map((ac) => ac.channelId));

        if (config.triggerChannelId) tempvoiceChannelIds.add(config.triggerChannelId);
        if (config.controlPanelChannelId) tempvoiceChannelIds.add(config.controlPanelChannelId);

        let shouldDeleteCategory = false;
        let category = null;
        let triggerChannel = null;
        let controlPanelChannel = null;

        if (config.categoryId) {
            try {
                category = await client.channels.fetch(config.categoryId, { force: true }).catch(() => null);

                if (category && category.type === ChannelType.GuildCategory) {
                    let channelsInCategory = (await interaction.guild.channels.fetch()).filter((c) => c.parentId === category.id);

                    let nonTempvoiceChannels = [];
                    for (const ch of channelsInCategory.values()) {
                        if (!tempvoiceChannelIds.has(ch.id)) {
                            nonTempvoiceChannels.push(ch);
                        }
                    }

                    if (nonTempvoiceChannels.length === 0) {
                        shouldDeleteCategory = true;
                        logger.info(`[TempVoice] Category will be deleted (no foreign channels found).`);
                    } else {
                        logger.info(`[TempVoice] Category NOT deleted: ${nonTempvoiceChannels.length} foreign channel(s) found.`);
                    }
                }
            } catch (e) {
                logger.warn(`[TempVoice] Failed while checking category: ${e.message}`);
            }
        }

        for (const ac of activeChannels) {
            const tempChannel = await client.channels.fetch(ac.channelId, { force: true }).catch(() => null);
            if (tempChannel)
                await tempChannel.delete(deleteReason).catch((e) => logger.warn(`[TempVoice] Failed to delete temp channel: ${e.message}`));
            await ac.destroy();
        }

        if (config.controlPanelChannelId) {
            controlPanelChannel = await client.channels.fetch(config.controlPanelChannelId, { force: true }).catch(() => null);
            if (controlPanelChannel) {
                if (!shouldDeleteCategory || (category && controlPanelChannel.parentId !== category.id)) {
                    await controlPanelChannel
                        .delete(deleteReasonPanel)
                        .catch((e) => logger.warn(`[TempVoice] Failed to delete control panel: ${e.message}`));
                }
            }
        }

        if (config.triggerChannelId) {
            triggerChannel = await client.channels.fetch(config.triggerChannelId, { force: true }).catch(() => null);
            if (triggerChannel) {
                if (!shouldDeleteCategory || (category && triggerChannel.parentId !== category.id)) {
                    await triggerChannel
                        .delete(deleteReasonTrigger)
                        .catch((e) => logger.warn(`[TempVoice] Failed to delete trigger: ${e.message}`));
                }
            }
        }

        if (category && shouldDeleteCategory) {
            await category.delete(deleteReasonCategory).catch((e) => logger.warn(`[TempVoice] Failed to delete category: ${e.message}`));
        }

        await config.destroy();

        return interaction.editReply({
            components: await simpleContainer(interaction, await t(interaction, 'tempvoice.unset.success_content'), { color: 'Red' }),
            flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
        });
    },
};
