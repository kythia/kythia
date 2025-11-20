/**
 * @namespace: addons/ticket/commands/type/create.js
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
} = require('discord.js');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('create').setDescription('Creates a new ticket type (interactive setup)'),

    async execute(interaction, container) {
        const { t, kythiaConfig, helpers } = container;
        const { convertColor } = helpers.color;

        const accentColor = convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' });

        const startButton = new ButtonBuilder()
            .setCustomId('tkt-type-step1-show')
            .setLabel(await t(interaction, 'ticket.type.start_button'))
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎟️');

        const components = [
            new ContainerBuilder()
                .setAccentColor(accentColor)
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'ticket.type.start_title')))
                // .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'ticket.type.start_desc')))
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
