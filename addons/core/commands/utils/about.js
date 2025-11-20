/**
 * @namespace: addons/core/commands/utils/about.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    SeparatorSpacingSize,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MessageFlags,
    MediaGalleryItemBuilder,
    MediaGalleryBuilder,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('about').setDescription(`😋 A brief introduction about kythia`),
    aliases: ['abt', '🌸'],
    async execute(interaction, container) {
        const { t, kythiaConfig, helpers } = container;
        const { convertColor } = helpers.color;

        const components = [
            new ContainerBuilder()
                .setAccentColor(convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }))

                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        await t(interaction, 'core.utils.about.embed.title', { username: interaction.client.user.username })
                    )
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems([new MediaGalleryItemBuilder().setURL(kythiaConfig.settings.aboutBannerImage)])
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        await t(interaction, 'core.utils.about.embed.desc', { username: interaction.client.user.username })
                    )
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addActionRowComponents(
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setLabel(await t(interaction, 'core.utils.about.button.invite'))
                            .setURL(kythiaConfig.settings.inviteLink),
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setLabel(await t(interaction, 'core.utils.about.button.website'))
                            .setURL(kythiaConfig.settings.kythiaWeb),
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setLabel(await t(interaction, 'core.utils.about.button.owner.web'))
                            .setURL(kythiaConfig.settings.ownerWeb)
                    )
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'core.utils.about.embed.footer'))),
        ];

        await interaction.reply({
            components: components,
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
        });
    },
};
