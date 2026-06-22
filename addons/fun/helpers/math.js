/**
 * @namespace: addons/fun/helpers/math.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder,
} = require('discord.js');
function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}
function generateQuestion(score) {
	// Scale difficulty based on score brackets
	const tier = Math.floor(score / 5); // 0-4: easy, 5-9: medium, 10-14: hard, 15+: extreme

	let a, b, op, answer, display;
	if (tier === 0) {
		// Easy: add/sub with small numbers
		a = rand(1, 20);
		b = rand(1, 20);
		op = pick(['+', '-']);
	} else if (tier === 1) {
		// Medium: add/sub bigger, multiply small
		a = rand(10, 50);
		b = rand(2, 12);
		op = pick(['+', '-', '×']);
	} else if (tier === 2) {
		// Hard: multiply/divide, bigger numbers
		a = rand(10, 99);
		b = rand(2, 12);
		op = pick(['×', '+', '-']);
	} else {
		// Extreme: multiply two-digit, divide with exact result
		a = rand(10, 99);
		b = rand(2, 15);
		op = pick(['×', '+', '-', '÷']);
	}
	switch (op) {
		case '+':
			answer = a + b;
			display = `${a} + ${b}`;
			break;
		case '-':
			// ensure non-negative result
			if (a < b) [a, b] = [b, a];
			answer = a - b;
			display = `${a} - ${b}`;
			break;
		case '×':
			answer = a * b;
			display = `${a} × ${b}`;
			break;
		case '÷': {
			// ensure exact division
			answer = b;
			a = b * rand(2, 12);
			display = `${a} ÷ ${b}`;
			break;
		}
	}
	return {
		question: display,
		answer,
	};
}
async function buildMathContainer(interaction, { body, footer, accentColor }) {
	const { helpers, kythiaConfig, t } = interaction.client.container;
	const { convertColor } = helpers.color;
	return new ContainerBuilder()
		.setAccentColor(
			convertColor(accentColor ?? kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			}),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`${await t(interaction, 'fun.helpers.math.title')}\n\n${body}`,
			),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`-# ${footer}`),
		);
}
function buildAnswerRow(disabled = false) {
	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('math_answer')
			.setLabel('✏️ Answer')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(disabled),
	);
}
async function buildLeaderboard(interaction, container) {
	const { models, t } = container;
	const { MathScore } = models;
	const top = await MathScore.getAllCache({
		order: [['bestScore', 'DESC']],
		limit: 10,
	});
	const title = await t(interaction, 'fun.helpers.math.leaderboard.title');
	if (!top || top.length === 0) {
		const empty = await t(interaction, 'fun.helpers.math.leaderboard.empty');
		return new ContainerBuilder()
			.setAccentColor(0xf1c40f)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(`${title}\n\n${empty}`),
			);
	}
	const lines = await Promise.all(
		top.map((entry, i) =>
			t(interaction, 'fun.helpers.math.leaderboard.entry', {
				rank: i + 1,
				user: entry.username ?? `<@${entry.userId}>`,
				score: entry.bestScore,
			}),
		),
	);
	return new ContainerBuilder()
		.setAccentColor(0xf1c40f)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`${title}\n\n${lines.join('\n')}`),
		);
}
async function saveScore(container, userId, username, score) {
	const { models } = container;
	const { MathScore } = models;
	const [record] = await MathScore.getOrCreateCache(
		{
			userId,
		},
		{
			userId,
			username,
			bestScore: score,
			totalGames: 1,
		},
	);
	record.totalGames = (record.totalGames ?? 0) + 1;
	if (score > (record.bestScore ?? 0)) {
		record.bestScore = score;
	}
	record.username = username;
	await record.save();
	return record;
}
module.exports = {
	generateQuestion,
	buildMathContainer,
	buildAnswerRow,
	buildLeaderboard,
	saveScore,
};
