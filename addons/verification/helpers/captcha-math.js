/**
 * @namespace: addons/verification/helpers/captcha-math.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const OPERATIONS = [
	{ sym: '+', fn: (a, b) => a + b },
	{ sym: '-', fn: (a, b) => a - b },
	{ sym: '×', fn: (a, b) => a * b },
];

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a math captcha.
 * @param {string} userId
 * @returns {{ question: string, answer: number, rows: ActionRowBuilder[] }}
 */
function generateMathCaptcha(userId) {
	const op = OPERATIONS[randomInt(0, OPERATIONS.length - 1)];
	let a, b, answer;

	if (op.sym === '×') {
		a = randomInt(2, 12);
		b = randomInt(2, 12);
	} else if (op.sym === '-') {
		a = randomInt(10, 50);
		b = randomInt(1, a);
	} else {
		a = randomInt(5, 50);
		b = randomInt(1, 50);
	}

	answer = op.fn(a, b);

	// Generate 3 unique decoy answers
	const decoys = new Set();
	while (decoys.size < 3) {
		const offset = randomInt(-15, 15);
		const decoy = answer + offset;
		if (decoy !== answer) decoys.add(decoy);
	}

	// Shuffle all 4 options
	const options = [answer, ...decoys].sort(() => Math.random() - 0.5);

	const buttons = options.map((val) => {
		const isCorrect = val === answer;
		return new ButtonBuilder()
			.setCustomId(
				`verify-math:${userId}:${isCorrect ? 'correct' : `wrong_${val}`}`,
			)
			.setLabel(String(val))
			.setStyle(ButtonStyle.Secondary);
	});

	const rows = [
		new ActionRowBuilder().addComponents(buttons.slice(0, 2)),
		new ActionRowBuilder().addComponents(buttons.slice(2, 4)),
	];

	return {
		question: `**${a} ${op.sym} ${b} = ?**`,
		answer,
		rows,
	};
}

module.exports = { generateMathCaptcha };
