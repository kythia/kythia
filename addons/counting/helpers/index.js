/**
 * @namespace: addons/counting/helpers/index.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { evaluate } = require('mathjs');

const romanToInt = (s) => {
	const romanMap = {
		I: 1,
		V: 5,
		X: 10,
		L: 50,
		C: 100,
		D: 500,
		M: 1000,
	};
	let total = 0;
	let prevValue = 0;
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
			return parseInt(trimmed, 2);
		}

		if (mode === 'hex') {
			const validHexRegex = /^[0-9a-fA-F]+$/;
			if (!validHexRegex.test(trimmed)) return null;
			return parseInt(trimmed, 16);
		}

		if (mode === 'roman') {
			return romanToInt(trimmed);
		}

		// Decimal mode (default)
		if (mathEnabled) {
			const validCharsRegex = /^[0-9\s+\-*/().^%]+$/;
			if (!validCharsRegex.test(trimmed)) return null;

			const result = evaluate(trimmed);
			if (
				typeof result !== 'number' ||
				!Number.isFinite(result) ||
				!Number.isInteger(result)
			) {
				return null;
			}
			return result;
		} else {
			const validDecimalRegex = /^[0-9]+$/;
			if (!validDecimalRegex.test(trimmed)) return null;
			return parseInt(trimmed, 10);
		}
	} catch (_e) {
		return null;
	}
};

const intToRoman = (num) => {
	const val = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
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
		while (num >= val[i]) {
			num -= val[i];
			roman += syb[i];
		}
	}
	return roman;
};

const formatNumberByMode = (num, mode) => {
	if (mode === 'binary') return num.toString(2);
	if (mode === 'hex') return num.toString(16).toUpperCase();
	if (mode === 'roman') return intToRoman(num);
	return num.toString(10);
};

module.exports = {
	parseInputToNumber,
	formatNumberByMode,
};
