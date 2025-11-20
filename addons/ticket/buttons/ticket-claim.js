/**
 * @namespace: addons/ticket/buttons/ticket-claim.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const {
    MessageFlags,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    PermissionsBitField,
} = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        const { models, t, helpers, kythiaConfig } = container;
        const { Ticket, TicketConfig } = models;
        const { simpleContainer } = helpers.discord;
        const { convertColor } = helpers.color;

        await interaction.deferUpdate();

        try {
            const ticket = await Ticket.getCache({ channelId: interaction.channel.id, status: 'open' });
            if (!ticket) {
                const desc = await t(interaction, 'ticket.errors.not_a_ticket');
                return interaction.followUp({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }

            const ticketConfig = await TicketConfig.getCache({ id: ticket.ticketConfigId });
            if (!ticketConfig) {
                const desc = await t(interaction, 'ticket.errors.config_missing');
                return interaction.followUp({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }

            const isStaff = interaction.member.roles.cache.has(ticketConfig.staffRoleId);
            const isAdmin = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

            if (!isStaff && !isAdmin) {
                const desc = await t(interaction, 'ticket.errors.only_staff');
                return interaction.followUp({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }

            if (ticket.claimedByUserId) {
                const desc = await t(interaction, 'ticket.claim.already_claimed', { userId: ticket.claimedByUserId });
                return interaction.followUp({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }

            ticket.claimedByUserId = interaction.user.id;
            await ticket.saveAndUpdateCache();

            const message = interaction.message;

            const defaultMessage = await t(interaction, 'ticket.v2.open_message_default', {
                user: `<@${ticket.userId}>`,
                staffRoleId: ticketConfig.staffRoleId,
            });
            const openMessageRaw = ticketConfig.ticketOpenMessage || defaultMessage;
            const openMessage = openMessageRaw
                .replace('{user}', `<@${ticket.userId}>`)
                .replace('{staffRole}', `<@&${ticketConfig.staffRoleId}>`);

            const accentColor = convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' });

            const mainContainer = new ContainerBuilder()
                .setAccentColor(accentColor)
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## ${ticketConfig.typeName}`))
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

            if (ticketConfig.ticketOpenImage) {
                mainContainer.addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems(new MediaGalleryItemBuilder().setURL(ticketConfig.ticketOpenImage))
                );
                mainContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            }

            const updatedRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket-close')
                    .setLabel(await t(interaction, 'ticket.v2.close_button'))
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🔒'),
                new ButtonBuilder()
                    .setCustomId('ticket-claim')
                    .setLabel(await t(interaction, 'ticket.v2.claim_button'))
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('🛄')
                    .setDisabled(true)
            );

            const footerText = await t(interaction, 'common.container.footer', {
                username: interaction.client.user.username,
            });

            mainContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(openMessage));
            mainContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
            mainContainer.addActionRowComponents(updatedRow);
            mainContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small));
            mainContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(footerText));

            await message.edit({ components: [mainContainer] });

            const desc = await t(interaction, 'ticket.claim.success', { user: interaction.user.toString() });
            await interaction.channel.send({
                components: await simpleContainer(interaction, desc, { color: 'Green' }),
                flags: MessageFlags.IsComponentsV2,
            });
        } catch (error) {
            console.error('Error claiming ticket:', error);
            const descError = await t(interaction, 'ticket.errors.generic');
            await interaction.followUp({
                components: await simpleContainer(interaction, descError, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }
    },
};
