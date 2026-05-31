/**
 * @namespace: addons/welcomer/database/models/WelcomeSetting.js
 * @type: Database Model
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { KythiaModel } = require('kythia-core');

class WelcomeSetting extends KythiaModel {
	static cacheKeys = [['guildId']];

	static guarded = [];

	/**
	 * Returns true if the welcome-in message should use Components V2 card.
	 * null layout → CV2 card (default). { style: 'plain-text' } → plain text.
	 */
	get isWelcomeInCV2() {
		return this.welcomeInLayout?.style !== 'plain-text';
	}

	/**
	 * Returns true if the welcome-out message should use Components V2 card.
	 */
	get isWelcomeOutCV2() {
		return this.welcomeOutLayout?.style !== 'plain-text';
	}
}

module.exports = WelcomeSetting;
