/**
 * @namespace: addons/core/helpers/grab.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

function parseCustomEmoji(str) {
	const match = str.match(/<?a?:?(\w+):(\d+)>?/);
	if (!match) return null;
	const [, name, id] = match;
	const isAnimated = str.startsWith('<a:');
	return { name, id, isAnimated };
}

module.exports = {
	parseCustomEmoji,
};
