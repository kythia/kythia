/**
 * @namespace: addons/economy/helpers/bigint.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

/**
 * Safely convert a value to BigInt.
 * - Floors decimal numbers
 * - Handles strings, numbers, and bigint
 * - Falls back to 0n for invalid values
 *
 * @param {number|string|bigint} value
 * @returns {bigint}
 */
function toBigIntSafe(value) {
	if (typeof value === 'bigint') return value;

	const n = Number(value);
	if (!Number.isFinite(n)) return BigInt(0);

	return BigInt(Math.floor(n));
}

module.exports = {
	toBigIntSafe,
};
