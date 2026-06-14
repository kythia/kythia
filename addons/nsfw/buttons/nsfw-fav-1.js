/**
 * @namespace: addons/nsfw/buttons/nsfw_fav_1.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { handleFavorite } = require('../helpers/buttons.js');

const { BaseButton } = require('kythia-core');

class NsfwFav1Button extends BaseButton {
	button = {};

	async execute(interaction) {
		const container = this.container;

		await handleFavorite(interaction, container, 1);
	}
}

exports.default = NsfwFav1Button;
