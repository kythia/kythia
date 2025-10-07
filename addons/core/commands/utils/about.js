/**
 * @namespace: addons/core/commands/utils/about.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
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
const { t } = require('@utils/translator');
const convertColor = require('@utils/color');

module.exports = {
    data: new SlashCommandBuilder().setName('about').setDescription(`😋 A brief introduction about ${kythia.bot.name}`),
    async execute(interaction) {
        const components = [
            new ContainerBuilder()
                .setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }))

                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        await t(interaction, 'core_utils_about_embed_title', { username: interaction.client.user.username })
                    )
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        await t(interaction, 'core_utils_about_embed_desc', { username: interaction.client.user.username })
                    )
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addActionRowComponents(
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setLabel(await t(interaction, 'core_utils_about_button_invite'))
                            .setURL(
                                `https://discord.com/oauth2/authorize?client_id=${interaction.client.user.id}&permissions=8&scope=bot+applications.commands`
                            ),
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setLabel(await t(interaction, 'core_utils_about_button_website'))
                            .setURL(kythia.settings.kythiaWeb),
                        new ButtonBuilder()
                            .setStyle(ButtonStyle.Link)
                            .setLabel(await t(interaction, 'core_utils_about_button_owner_web'))
                            .setURL(kythia.settings.ownerWeb)
                    )
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems([new MediaGalleryItemBuilder().setURL(kythia.settings.bannerImage)])
                )
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'core_utils_about_embed_footer'))),
        ];

        await interaction.reply({
            components: components,
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
        });
    },
};
