/**
 * @namespace: addons/verification/helpers/constants.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const CAPTCHA_TYPES = [
	{ name: 'Math (multiple choice buttons)', value: 'math' },
	{ name: 'Emoji click (buttons)', value: 'emoji' },
	{ name: 'Image text (type the code)', value: 'image' },
];

const MAX_RECENT_LOGS = 10;

module.exports = {
	CAPTCHA_TYPES,
	MAX_RECENT_LOGS,
};
