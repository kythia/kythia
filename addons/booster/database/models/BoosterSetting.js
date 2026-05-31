/**
 * @namespace: addons/booster/database/models/BoosterSetting.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class BoosterSetting extends KythiaModel {
	static cacheKeys = [['guildId']];

	static guarded = [];

	/**
	 * Returns true if the booster message should use Components V2 card.
	 * null layout → CV2 card (default). { style: 'plain-text' } → plain text.
	 */
	get isBoosterCV2() {
		return this.boosterLayout?.style !== 'plain-text';
	}
}

module.exports = BoosterSetting;
