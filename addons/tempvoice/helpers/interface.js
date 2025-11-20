/**
 * @namespace: addons/tempvoice/helpers/interface.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const {
    ContainerBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SeparatorBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
} = require('discord.js');

/**
 * Generate TempVoice control interface components (component v2).
 * @param {object} container - Container dependensi (dari container.client)
 * @returns {{ components: any[] }}
 */
async function buildInterface(interaction) {
    const container = interaction.client.container;
    const { kythiaConfig, helpers, t } = container;
    const { convertColor } = helpers.color;

    const bannerUrl = kythiaConfig?.settings?.tempvoiceBannerImage;

    const header = new TextDisplayBuilder().setContent(`${await t(interaction, 'tempvoice.interface.header')}`);
    const banner = new MediaGalleryBuilder().addItems([new MediaGalleryItemBuilder().setURL(bannerUrl)]);
    const ctrlInfo = new TextDisplayBuilder().setContent(await t(interaction, 'tempvoice.interface.ctrlInfo'));
    const divider = new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true);

    const row1_static = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('tv_rename')
            .setLabel(await t(interaction, 'tempvoice.interface.buttons.rename'))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⌨️'),
        new ButtonBuilder()
            .setCustomId('tv_limit')
            .setLabel(await t(interaction, 'tempvoice.interface.buttons.limit'))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('👥'),
        new ButtonBuilder()
            .setCustomId('tv_privacy')
            .setLabel(await t(interaction, 'tempvoice.interface.buttons.privacy'))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🛡️'),
        new ButtonBuilder()
            .setCustomId('tv_waiting')
            .setLabel(await t(interaction, 'tempvoice.interface.buttons.waiting'))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('⏲️'),
        new ButtonBuilder()
            .setCustomId('tv_stage')
            .setLabel(await t(interaction, 'tempvoice.interface.buttons.stage'))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🎙️')
    );

    const row2_static = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('tv_trust')
            .setLabel(await t(interaction, 'tempvoice.interface.buttons.trust'))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🤝'),
        new ButtonBuilder()
            .setCustomId('tv_untrust')
            .setLabel(await t(interaction, 'tempvoice.interface.buttons.untrust'))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('✂️'),
        new ButtonBuilder()
            .setCustomId('tv_invite')
            .setLabel(await t(interaction, 'tempvoice.interface.buttons.invite'))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('📞'),
        new ButtonBuilder()
            .setCustomId('tv_kick')
            .setLabel(await t(interaction, 'tempvoice.interface.buttons.kick'))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('👢'),
        new ButtonBuilder()
            .setCustomId('tv_region')
            .setLabel(await t(interaction, 'tempvoice.interface.buttons.region'))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🌐')
    );

    const row3_static = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('tv_block')
            .setLabel(await t(interaction, 'tempvoice.interface.buttons.block'))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🚫'),
        new ButtonBuilder()
            .setCustomId('tv_unblock')
            .setLabel(await t(interaction, 'tempvoice.interface.buttons.unblock'))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🟢'),
        new ButtonBuilder()
            .setCustomId('tv_claim')
            .setLabel(await t(interaction, 'tempvoice.interface.buttons.claim'))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('👑'),
        new ButtonBuilder()
            .setCustomId('tv_transfer')
            .setLabel(await t(interaction, 'tempvoice.interface.buttons.transfer'))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🔁'),
        new ButtonBuilder()
            .setCustomId('tv_delete')
            .setLabel(await t(interaction, 'tempvoice.interface.buttons.delete'))
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🗑️')
    );

    const footer = new TextDisplayBuilder().setContent(
        await t(interaction, 'common.container.footer', { username: interaction.client.user.username })
    );

    const containerComponent = new ContainerBuilder()
        .setAccentColor(convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }))
        .addTextDisplayComponents(header)
        .addSeparatorComponents(divider)
        .addMediaGalleryComponents(banner)
        .addSeparatorComponents(divider)
        .addTextDisplayComponents(ctrlInfo)
        .addSeparatorComponents(divider)
        .addActionRowComponents(row1_static, row2_static, row3_static)
        .addSeparatorComponents(divider)
        .addTextDisplayComponents(footer);

    return {
        components: [containerComponent],
        flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
    };
}

module.exports = {
    buildInterface,
};
