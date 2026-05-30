/**
 * @namespace: addons/nsfw/buttons/nsfw_fav_1.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { handleFavorite } = require('../helpers/buttons.js');

module.exports = {
	execute: async (interaction, container) => {
		await handleFavorite(interaction, container, 1);
	},
};
