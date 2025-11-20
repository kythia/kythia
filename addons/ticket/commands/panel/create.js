/**
 * @namespace: addons/ticket/commands/panel/create.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
} = require('discord.js');

module.exports = {
    data: (subcommand) => subcommand.setName('create').setDescription('Creates a new ticket panel (interactive setup)'),

    async execute(interaction, container) {
        const { models, t, kythiaConfig, redis, helpers } = container;
        const { Ticket, TicketConfig, TicketPanel } = models;
        const { convertColor } = helpers.color;
        const { simpleContainer } = helpers.discord;

        const accentColor = convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' });

        const startButton = new ButtonBuilder()
            .setCustomId('tkt-panel-modal-show')
            .setLabel(await t(interaction, 'ticket.panel.start_button'))
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎟️');

        const components = [
            new ContainerBuilder()
                .setAccentColor(accentColor)
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems([new MediaGalleryItemBuilder().setURL(kythiaConfig.settings.ticketBannerImage)])
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'ticket.panel.start_title')))
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'ticket.panel.start_desc')))
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addActionRowComponents(new ActionRowBuilder().addComponents(startButton))
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        await t(interaction, 'common.container.footer', { username: interaction.client.user.username })
                    )
                ),
        ];

        await interaction.reply({
            components: components,
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
        });

        return;
    },
};
