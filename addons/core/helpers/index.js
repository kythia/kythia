/**
 * @namespace: addons/core/helpers/index.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const rolePrefix = require('./rolePrefix');
const roleUnprefix = require('./roleUnprefix');
const figletFonts = require('./figletFonts');
const helpUtils = require('./helpUtils');
const {
	EVENT_SCENARIOS,
	createMockEventArgs,
	getEventScenarios,
} = require('./events');

const { checkCooldown, formatDuration, parseDuration } = require('./time');
const { resolvePreviewText } = require('./canvas');

module.exports = {
	rolePrefix,
	roleUnprefix,
	EVENT_SCENARIOS,
	createMockEventArgs,
	getEventScenarios,
	checkCooldown,
	formatDuration,
	parseDuration,
	figletFonts,
	helpUtils,
	resolvePreviewText,
};
