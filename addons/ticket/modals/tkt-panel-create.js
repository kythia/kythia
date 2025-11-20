/**
 * @namespace: addons/ticket/modals/tkt-panel-create.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const {
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    ChannelType,
} = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { t, helpers, models, kythiaConfig } = container;
        const { convertColor } = helpers.color;
        const { simpleContainer } = helpers.discord;
        const { TicketPanel } = models;

        await interaction.deferUpdate();

        try {
            const originalMessageId = interaction.customId.split(':')[1];
            if (!originalMessageId) {
                const desc = await t(interaction, 'ticket.errors.no_message_id');
                return interaction.followUp({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }

            const channelId = interaction.fields.getSelectedChannels('channelId').first()?.id;
            const title = interaction.fields.getTextInputValue('title');
            const description = interaction.fields.getTextInputValue('description');
            const image = interaction.fields.getTextInputValue('image');

            if (!channelId) {
                const desc = await t(interaction, 'ticket.errors.panel_channel_required');
                return interaction.followUp({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }

            const channel = await interaction.guild.channels.fetch(channelId).catch(() => null);
            if (!channel || channel.type !== ChannelType.GuildText) {
                const desc = await t(interaction, 'ticket.errors.panel_channel_invalid');
                return interaction.followUp({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }

            const accentColor = convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' });
            const panelContainer = new ContainerBuilder()
                .setAccentColor(accentColor)
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${title}`))
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

            if (description) {
                panelContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(description));
            }

            if (image && (image.startsWith('http://') || image.startsWith('https://'))) {
                panelContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false));
                panelContainer.addMediaGalleryComponents(new MediaGalleryBuilder().addItems([new MediaGalleryItemBuilder().setURL(image)]));
            }

            panelContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false));
            panelContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'ticket.panel.no_types')));

            const panelMessage = await channel.send({
                components: [panelContainer],
                flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            });

            await TicketPanel.create({
                guildId: interaction.guild.id,
                channelId: channelId,
                messageId: panelMessage.id,
                title: title,
                description: description || null,
                image: image || null,
            });

            const descSuccess = await t(interaction, 'ticket.panel.create_success', { channel: channel.toString() });
            const successContainer = await simpleContainer(interaction, `${descSuccess}`, { color: 'Green' });

            await interaction.channel.messages.edit(originalMessageId, {
                components: successContainer,
            });
        } catch (error) {
            console.error('Error in tkt-panel-create modal handler:', error);
            const desc = await t(interaction, 'ticket.errors.generic');

            await interaction.followUp({
                components: await simpleContainer(interaction, desc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }
    },
};
