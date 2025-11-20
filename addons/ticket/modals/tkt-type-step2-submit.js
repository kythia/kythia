/**
 * @namespace: addons/ticket/modals/tkt-type-step2-submit.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags, SeparatorSpacingSize } = require('discord.js');
const { refreshTicketPanel } = require('../helpers');

module.exports = {
    execute: async (interaction, container) => {
        const { redis, kythiaConfig, t, helpers, models } = container;
        const { convertColor } = helpers.color;
        const { simpleContainer } = helpers.discord;
        const { TicketConfig } = models;

        await interaction.deferUpdate();
        const cacheKey = `ticket:type-create:${interaction.user.id}`;

        try {
            const messageId = interaction.customId.split(':')[1];
            if (!messageId) throw new Error('Missing messageId in modal customId');

            const step1DataString = await redis.get(cacheKey);
            if (!step1DataString) {
                const desc = await t(interaction, 'ticket.errors.setup_expired');
                return interaction.followUp({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }
            const step1Data = JSON.parse(step1DataString);

            const staffRoleId = interaction.fields.getSelectedRoles('staffRoleId')?.first()?.id;
            const logsChannelId = interaction.fields.getSelectedChannels('logsChannelId')?.first()?.id;
            const transcriptChannelId = interaction.fields.getSelectedChannels('transcriptChannelId')?.first()?.id;
            const ticketCategoryId = interaction.fields.getSelectedChannels('ticketCategoryId')?.first()?.id;
            const askReason = interaction.fields.getTextInputValue('askReason') || null;

            if (!staffRoleId || !logsChannelId || !transcriptChannelId) {
                const desc = await t(interaction, 'ticket.errors.mega_modal_missing');
                return interaction.followUp({
                    components: await simpleContainer(interaction, desc, { color: 'Red' }),
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
                });
            }

            await TicketConfig.create({
                ...step1Data,
                guildId: interaction.guild.id,
                staffRoleId: staffRoleId,
                logsChannelId: logsChannelId,
                transcriptChannelId: transcriptChannelId,
                ticketCategoryId: ticketCategoryId || null,
                askReason: askReason,
            });

            await refreshTicketPanel(step1Data.panelMessageId, container);

            await redis.del(cacheKey);

            const accentColor = convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' });
            const descSuccess = await t(interaction, 'ticket.type_create.success', { typeName: step1Data.typeName });
            const successContainer = [
                new ContainerBuilder()
                    .setAccentColor(convertColor('Green', { from: 'discord', to: 'decimal' }))
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(`${descSuccess}`))
                    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            await t(interaction, 'common.container.footer', { username: interaction.client.user.username })
                        )
                    ),
            ];

            await interaction.channel.messages.edit(messageId, {
                components: successContainer,
            });
        } catch (error) {
            console.error('Error in tkt-type-step2-submit (Final) handler:', error);
            const errDesc = await t(interaction, 'ticket.errors.generic');
            await interaction.followUp({
                components: await simpleContainer(interaction, errDesc, { color: 'Red' }),
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
            });
        }
    },
};
