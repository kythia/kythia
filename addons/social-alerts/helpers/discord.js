/**
 * @namespace: addons/social-alerts/helpers/discord.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	SectionBuilder,
	SeparatorBuilder,
	ThumbnailBuilder,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');

function buildSuccessContainer({
	accentColor,
	description,
	footer,
	thumbnailUrl,
	thumbnailAlt,
}) {
	return new ContainerBuilder()
		.setAccentColor(accentColor)
		.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(description),
				)
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(thumbnailUrl || 'https://www.youtube.com/favicon.ico')
						.setDescription(thumbnailAlt || 'Alert'),
				),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(footer));
}

module.exports = { buildSuccessContainer };
