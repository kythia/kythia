/**
 * @namespace: addons/counting/helpers/index.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { create, all } = require('mathjs');
const math = create(all, { number: 'BigNumber' });

const romanToInt = (s) => {
	const romanMap = {
		I: 1n,
		V: 5n,
		X: 10n,
		L: 50n,
		C: 100n,
		D: 500n,
		M: 1000n,
	};
	let total = 0n;
	let prevValue = 0n;
	for (let i = s.length - 1; i >= 0; i--) {
		const char = s[i].toUpperCase();
		const currentValue = romanMap[char];
		if (!currentValue) return null;
		if (currentValue < prevValue) {
			total -= currentValue;
		} else {
			total += currentValue;
		}
		prevValue = currentValue;
	}
	return total;
};

const parseInputToNumber = (content, mode = 'decimal', mathEnabled = true) => {
	try {
		if (!content || content.length > 50) return null;
		const trimmed = content.trim();

		if (mode === 'binary') {
			const validBinaryRegex = /^[01]+$/;
			if (!validBinaryRegex.test(trimmed)) return null;
			return BigInt(`0b${trimmed}`);
		}

		if (mode === 'hex') {
			const validHexRegex = /^[0-9a-fA-F]+$/;
			if (!validHexRegex.test(trimmed)) return null;
			return BigInt(`0x${trimmed}`);
		}

		if (mode === 'roman') {
			return romanToInt(trimmed);
		}

		// Decimal mode (default)
		if (mathEnabled) {
			const validCharsRegex = /^[0-9\s+\-*/().^%]+$/;
			if (!validCharsRegex.test(trimmed)) return null;

			const result = math.evaluate(trimmed);
			// Check if result is a BigNumber and an integer
			if (
				!result ||
				typeof result.isInteger !== 'function' ||
				!result.isInteger()
			) {
				// Fallback if it evaluates to a primitive number for some reason
				if (typeof result === 'number' && Number.isInteger(result)) {
					return BigInt(result);
				}
				return null;
			}
			return BigInt(result.toString());
		} else {
			const validDecimalRegex = /^[0-9]+$/;
			if (!validDecimalRegex.test(trimmed)) return null;
			return BigInt(trimmed);
		}
	} catch (_e) {
		return null;
	}
};

const intToRoman = (num) => {
	let n = BigInt(num);
	const val = [
		1000n,
		900n,
		500n,
		400n,
		100n,
		90n,
		50n,
		40n,
		10n,
		9n,
		5n,
		4n,
		1n,
	];
	const syb = [
		'M',
		'CM',
		'D',
		'CD',
		'C',
		'XC',
		'L',
		'XL',
		'X',
		'IX',
		'V',
		'IV',
		'I',
	];
	let roman = '';
	for (let i = 0; i < val.length; i++) {
		while (n >= val[i]) {
			n -= val[i];
			roman += syb[i];
		}
	}
	return roman;
};

const formatNumberByMode = (num, mode) => {
	const n = BigInt(num);
	if (mode === 'binary') return n.toString(2);
	if (mode === 'hex') return n.toString(16).toUpperCase();
	if (mode === 'roman') return intToRoman(n);
	return n.toString(10);
};

module.exports = {
	parseInputToNumber,
	formatNumberByMode,
};
