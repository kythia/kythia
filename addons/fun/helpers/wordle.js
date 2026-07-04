/**
 * @namespace: addons/fun/helpers/wordle.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const kythiaConfig = require('../../../kythia.config');
const WORD_LIST = kythiaConfig.addons.fun.wordle.words;
const EMOJI_CORRECT = '🟩';
const EMOJI_PRESENT = '🟨';
const EMOJI_ABSENT = '⬛';
function pickRandomWord() {
	return WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
}
function isValidWord(word) {
	return WORD_LIST.includes(word);
}
function checkGuess(guess, answer) {
	const result = Array(5).fill('absent');
	const answerArr = answer.split('');
	const guessArr = guess.split('');
	const used = Array(5).fill(false);
	for (let i = 0; i < 5; i++) {
		if (guessArr[i] === answerArr[i]) {
			result[i] = 'correct';
			used[i] = true;
		}
	}
	for (let i = 0; i < 5; i++) {
		if (result[i] === 'correct') continue;
		for (let j = 0; j < 5; j++) {
			if (!used[j] && guessArr[i] === answerArr[j]) {
				result[i] = 'present';
				used[j] = true;
				break;
			}
		}
	}
	return result;
}
function renderGuessRow(guess, feedback) {
	let row = '';
	for (let i = 0; i < 5; i++) {
		if (feedback[i] === 'correct') row += EMOJI_CORRECT;
		else if (feedback[i] === 'present') row += EMOJI_PRESENT;
		else row += EMOJI_ABSENT;
	}
	row += `  \`${guess.toUpperCase()}\``;
	return row;
}
function renderBoard(guesses, answer) {
	const lines = [];
	for (const guess of guesses) {
		const feedback = checkGuess(guess, answer);
		lines.push(renderGuessRow(guess, feedback));
	}
	while (lines.length < 6) {
		lines.push(`${EMOJI_ABSENT.repeat(5)}  \`     \``);
	}
	return lines.join('\n');
}
async function buildGameEmbed(interaction, game, actionRow = null) {
	let description = renderBoard(game.guesses, game.answer);
	const { t, helpers, kythiaConfig } = interaction.client.container;
	const { convertColor } = helpers.color;
	if (game.isOver) {
		if (game.win) {
			description += `\n\n${await t(interaction, 'fun.helpers.wordle.win', {
				answer: game.answer.toUpperCase(),
			})}`;
		} else {
			description += `\n\n${await t(interaction, 'fun.helpers.wordle.lose', {
				answer: game.answer.toUpperCase(),
			})}`;
		}
	} else {
		description += `\n\n${await t(interaction, 'fun.helpers.wordle.remaining', {
			remaining: 6 - game.guesses.length,
		})}`;
	}
	const footer = game.isOver
		? await t(interaction, 'fun.helpers.wordle.footer.end')
		: await t(interaction, 'fun.helpers.wordle.footer.play');
	const container = new ContainerBuilder()
		.setAccentColor(
			convertColor(
				game.isOver
					? game.win
						? '#2ecc71'
						: '#e74c3c'
					: kythiaConfig.bot.color,
				{
					from: 'hex',
					to: 'decimal',
				},
			),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`${await t(interaction, 'fun.helpers.wordle.title')}\n${description}`,
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
	if (actionRow) container.addActionRowComponents(actionRow);
	return container;
}
module.exports = {
	pickRandomWord,
	isValidWord,
	checkGuess,
	renderGuessRow,
	renderBoard,
	buildGameEmbed,
};
