/**
 * @namespace: addons/core/helpers/index.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const rolePrefix = require('./role-prefix');
const roleUnprefix = require('./role-unprefix');
const figletFonts = require('./figlet-fonts');
const helpUtils = require('./help-utils');
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
