/**
 * @namespace: addons/nsfw/buttons/nsfw_fav_2.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { handleFavorite } = require('../helpers/buttons.js');

const { BaseButton } = require('kythia-core');

class NsfwFav2Button extends BaseButton {
	button = {};

	async execute(interaction) {
		const container = this.container;

		await handleFavorite(interaction, container, 2);
	}
}

exports.default = NsfwFav2Button;
