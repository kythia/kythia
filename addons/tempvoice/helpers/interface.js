/**
 * @namespace: addons/tempvoice/helpers/interface.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	SeparatorSpacingSize,
	MediaGalleryItemBuilder,
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
	const accentColor = convertColor(kythiaConfig.bot.color, {
		from: 'hex',
		to: 'decimal',
	});
	const bannerUrl = kythiaConfig?.settings?.tempvoiceBannerImage;
	const header = new TextDisplayBuilder().setContent(
		`${await t(interaction, 'tempvoice.helpers.interface.header', { bot: interaction.client.user.username })}`,
	);
	const banner = new MediaGalleryBuilder().addItems([
		new MediaGalleryItemBuilder().setURL(bannerUrl),
	]);
	const ctrlInfo = new TextDisplayBuilder().setContent(
		await t(interaction, 'tempvoice.helpers.interface.ctrlInfo'),
	);
	const divider = new SeparatorBuilder()
		.setSpacing(SeparatorSpacingSize.Small)
		.setDivider(true);
	const row1_static = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('tv_rename')
			.setLabel(
				await t(interaction, 'tempvoice.helpers.interface.buttons.rename'),
			)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji(kythiaConfig.emojis?.tempvoice?.rename || '⌨️'),
		new ButtonBuilder()
			.setCustomId('tv_limit')
			.setLabel(
				await t(interaction, 'tempvoice.helpers.interface.buttons.limit'),
			)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji(kythiaConfig.emojis?.tempvoice?.limit || '👥'),
		new ButtonBuilder()
			.setCustomId('tv_privacy')
			.setLabel(
				await t(interaction, 'tempvoice.helpers.interface.buttons.privacy'),
			)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji(kythiaConfig.emojis?.tempvoice?.privacy || '🛡️'),
		new ButtonBuilder()
			.setCustomId('tv_waiting')
			.setLabel(
				await t(interaction, 'tempvoice.helpers.interface.buttons.waiting'),
			)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji(kythiaConfig.emojis?.tempvoice?.waiting || '⏲️'),
		new ButtonBuilder()
			.setCustomId('tv_stage')
			.setLabel(
				await t(interaction, 'tempvoice.helpers.interface.buttons.stage'),
			)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji(kythiaConfig.emojis?.tempvoice?.stage || '🎙️'),
	);
	const row2_static = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('tv_trust')
			.setLabel(
				await t(interaction, 'tempvoice.helpers.interface.buttons.trust'),
			)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji(kythiaConfig.emojis?.tempvoice?.trust || '🤝'),
		new ButtonBuilder()
			.setCustomId('tv_untrust')
			.setLabel(
				await t(interaction, 'tempvoice.helpers.interface.buttons.untrust'),
			)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji(kythiaConfig.emojis?.tempvoice?.untrust || '✂️'),
		new ButtonBuilder()
			.setCustomId('tv_invite')
			.setLabel(
				await t(interaction, 'tempvoice.helpers.interface.buttons.invite'),
			)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji(kythiaConfig.emojis?.tempvoice?.invite || '📞'),
		new ButtonBuilder()
			.setCustomId('tv_kick')
			.setLabel(
				await t(interaction, 'tempvoice.helpers.interface.buttons.kick'),
			)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji(kythiaConfig.emojis?.tempvoice?.kick || '👢'),
		new ButtonBuilder()
			.setCustomId('tv_region')
			.setLabel(
				await t(interaction, 'tempvoice.helpers.interface.buttons.region'),
			)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji(kythiaConfig.emojis?.tempvoice?.region || '🌐'),
	);
	const row3_static = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('tv_block')
			.setLabel(
				await t(interaction, 'tempvoice.helpers.interface.buttons.block'),
			)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji(kythiaConfig.emojis?.tempvoice?.block || '🚫'),
		new ButtonBuilder()
			.setCustomId('tv_unblock')
			.setLabel(
				await t(interaction, 'tempvoice.helpers.interface.buttons.unblock'),
			)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji(kythiaConfig.emojis?.tempvoice?.unblock || '🟢'),
		new ButtonBuilder()
			.setCustomId('tv_claim')
			.setLabel(
				await t(interaction, 'tempvoice.helpers.interface.buttons.claim'),
			)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji(kythiaConfig.emojis?.tempvoice?.claim || '👑'),
		new ButtonBuilder()
			.setCustomId('tv_transfer')
			.setLabel(
				await t(interaction, 'tempvoice.helpers.interface.buttons.transfer'),
			)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji(kythiaConfig.emojis?.tempvoice?.transfer || '🔁'),
		new ButtonBuilder()
			.setCustomId('tv_delete')
			.setLabel(
				await t(interaction, 'tempvoice.helpers.interface.buttons.delete'),
			)
			.setStyle(ButtonStyle.Secondary)
			.setEmoji(kythiaConfig.emojis?.tempvoice?.delete || '🗑️'),
	);
	const footer = new TextDisplayBuilder().setContent(
		await t(interaction, 'common.container.footer', {
			username: interaction.client.user.username,
		}),
	);
	const containerComponent = new ContainerBuilder()
		.setAccentColor(accentColor)
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
		flags: MessageFlags.IsComponentsV2,
	};
}
module.exports = {
	buildInterface,
};
