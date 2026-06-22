/**
 * @namespace: addons/core/commands/utils/legal.js
 * @type: Command
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
	SlashCommandBuilder,
	SeparatorSpacingSize,
	MediaGalleryItemBuilder,
} = require('discord.js');
const axios = require('axios');
const fs = require('node:fs');
const path = require('node:path');
const { BaseCommand } = require('kythia-core');
const _x = {
	d: '\x64\x65\x66\x65\x72\x52\x65\x70\x6c\x79',
	e: '\x65\x64\x69\x74\x52\x65\x70\x6c\x79',
	c: '\x73\x65\x74\x43\x6f\x6e\x74\x65\x6e\x74',
	u: '\x73\x65\x74\x55\x52\x4c',
	l: '\x6c\x6f\x67\x67\x65\x72',
	err: '\x65\x72\x72\x6f\x72',
};
class LegalCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('legal')
		.setDescription('View the Terms of Service and Privacy Policy');
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, kythiaConfig } = container;
		const { convertColor } = helpers['\x63\x6f\x6c\x6f\x72'];
		await interaction[_x.d]();
		try {
			const _g1 =
				'\x68\x74\x74\x70\x73\x3a\x2f\x2f\x72\x61\x77\x2e\x67\x69\x74\x68\x75\x62';
			const _g2 =
				'\x75\x73\x65\x72\x63\x6f\x6e\x74\x65\x6e\x74\x2e\x63\x6f\x6d\x2f\x6b\x79\x74\x68\x69\x61';
			const _g3 =
				'\x2f\x6b\x79\x74\x68\x69\x61\x2f\x72\x65\x66\x73\x2f\x68\x65\x61\x64\x73\x2f\x6d\x61\x69\x6e\x2f\x44\x49\x53\x43\x4f\x52\x44\x5f\x54\x4f\x53\x2e\x6d\x64';
			const _pL =
				'\x68\x74\x74\x70\x73\x3a\x2f\x2f\x6b\x79\x74\x68\x69\x61\x2e\x78\x79\x7a\x2f\x70\x72\x69\x76\x61\x63\x79';
			const _tL =
				'\x68\x74\x74\x70\x73\x3a\x2f\x2f\x6b\x79\x74\x68\x69\x61\x2e\x78\x79\x7a\x2f\x74\x6f\x73';
			const _wL =
				'\x68\x74\x74\x70\x73\x3a\x2f\x2f\x6b\x79\x74\x68\x69\x61\x2e\x78\x79\x7a';
			let rawData;
			try {
				const response = await axios['\x67\x65\x74'](_g1 + _g2 + _g3);
				rawData = response.data;
			} catch {
				rawData = fs.readFileSync(
					path.join(__dirname, '../../../../TOS.md'),
					'utf-8',
				);
			}
			const contentData =
				rawData.length > 2000 ? `${rawData.substring(0, 3599)}...` : rawData;
			const _cr =
				'\x44\x65\x76\x65\x6c\x6f\x70\x65\x64\x20\x62\x79\x20\x4b\x65\x6e\x6e\x64\x65\x63\x6c\x6f\x75\x76';
			const components = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor(kythiaConfig.bot.color, {
							from: 'hex',
							to: 'decimal',
						}),
					)
					.addMediaGalleryComponents(
						new MediaGalleryBuilder().addItems([
							new MediaGalleryItemBuilder()[_x.u](
								kythiaConfig.settings.TOSBanner ||
									kythiaConfig.settings.bannerImage,
							),
						]),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder()[_x.c](
							await t(interaction, 'core.commands.utils.legal.embed.title'),
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(new TextDisplayBuilder()[_x.c](contentData))
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addActionRowComponents(
						new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setStyle(ButtonStyle.Link)
								.setLabel(
									await t(
										interaction,
										'core.commands.utils.legal.button.website',
									),
								)
								.setURL(_wL),
							new ButtonBuilder()
								.setStyle(ButtonStyle.Link)
								.setLabel(
									await t(interaction, 'core.commands.utils.legal.button.tos'),
								)
								.setURL(_tL),
							new ButtonBuilder()
								.setStyle(ButtonStyle.Link)
								.setLabel(
									await t(
										interaction,
										'core.commands.utils.legal.button.privacy',
									),
								)
								.setURL(_pL),
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder()[_x.c](`-# ${_cr}`),
					),
			];
			await interaction[_x.e]({
				components: components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			container[_x.l][_x.err](error);
			await interaction[_x.e]({
				content: await t(interaction, 'core.commands.utils.legal.error.fetch'),
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}
exports.default = LegalCommand;
