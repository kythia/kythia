/**
 * @namespace: addons/fun/helpers/tictactoe.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
function createGame(interaction, opponent, mode) {
	const playerX = interaction.user;
	const playerO = opponent;
	return {
		interaction,
		playerX,
		playerO,
		mode,
		botDifficulty: mode.startsWith('bot_') ? mode : null,
		board: Array(9).fill(null),
		currentPlayer: playerX,
		symbols: {
			[playerX.id]: 'X',
			[playerO.id]: 'O',
		},
		isGameOver: false,
		statusMessage: null,
	};
}
async function buildGameUI(game) {
	const {
		board,
		currentPlayer,
		isGameOver,
		statusMessage,
		playerX,
		playerO,
		interaction,
	} = game;
	const client = interaction.client;
	const container = interaction.client.container;
	const { t, helpers } = container;
	const { convertColor } = helpers.color;
	const turnText = isGameOver
		? `**${statusMessage}**`
		: await t(interaction, 'fun.helpers.tictactoe.turn', {
				mention: currentPlayer.toString(),
				symbol: game.symbols[currentPlayer.id] === 'X' ? '❌' : '⭕',
			});
	const gameContainer = new ContainerBuilder()
		.setAccentColor(
			convertColor(isGameOver ? '#2ecc71' : '#3498db', {
				from: 'hex',
				to: 'decimal',
			}),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`${await t(interaction, 'fun.helpers.tictactoe.title')}\n\`❌\` ${playerX.username}\n\`⭕\` ${playerO.username}`,
			),
		);
	for (let i = 0; i < 3; i++) {
		const row = new ActionRowBuilder();
		for (let j = 0; j < 3; j++) {
			const index = i * 3 + j;
			const cell = board[index];
			let style = ButtonStyle.Secondary;
			let symbol = '\u200B';
			if (cell === 'X') {
				style = ButtonStyle.Danger;
				symbol = '❌';
			}
			if (cell === 'O') {
				style = ButtonStyle.Primary;
				symbol = '⭕';
			}
			row.addComponents(
				new ButtonBuilder()
					.setCustomId(`tictactoe_${index}`)
					.setLabel(symbol)
					.setStyle(style)
					.setDisabled(cell !== null || isGameOver),
			);
		}
		gameContainer.addActionRowComponents(row);
	}
	gameContainer.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(turnText),
	);
	gameContainer.addSeparatorComponents(
		new SeparatorBuilder()
			.setSpacing(SeparatorSpacingSize.Small)
			.setDivider(true),
	);
	gameContainer.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			await t(interaction, 'common.container.footer', {
				username: client.user.username,
			}),
		),
	);
	return [gameContainer];
}
function checkWin(board, playerSymbol) {
	const winPatterns = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	return winPatterns.some((pattern) =>
		pattern.every((index) => board[index] === playerSymbol),
	);
}
function checkDraw(board) {
	return board.every((cell) => cell !== null);
}
function botMove(game) {
	let bestMove;
	const board = game.board;
	if (game.botDifficulty === 'bot_easy') {
		bestMove = getRandomMove(board);
	} else if (game.botDifficulty === 'bot_medium') {
		bestMove =
			findWinningMove(board, 'O') ??
			findWinningMove(board, 'X') ??
			getRandomMove(board);
	} else if (game.botDifficulty === 'bot_hard') {
		bestMove = minimax(game, board.slice(), 'O').index;
	}
	if (typeof bestMove === 'number') {
		board[bestMove] = 'O';
	}
}
function findWinningMove(board, playerSymbol) {
	for (let i = 0; i < 9; i++) {
		if (board[i] === null) {
			board[i] = playerSymbol;
			if (checkWin(board, playerSymbol)) {
				board[i] = null;
				return i;
			}
			board[i] = null;
		}
	}
	return null;
}
function getRandomMove(board) {
	const emptyCells = board
		.map((cell, i) => (cell === null ? i : null))
		.filter((i) => i !== null);
	return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}
function minimax(game, newBoard, playerSymbol) {
	const emptyCells = newBoard
		.map((cell, i) => (cell === null ? i : null))
		.filter((i) => i !== null);
	if (checkWinBoard(newBoard, 'X'))
		return {
			score: -10,
		};
	if (checkWinBoard(newBoard, 'O'))
		return {
			score: 10,
		};
	if (emptyCells.length === 0)
		return {
			score: 0,
		};
	const moves = [];
	for (const index of emptyCells) {
		const move = {
			index,
		};
		newBoard[index] = playerSymbol;
		if (playerSymbol === 'O') {
			move.score = minimax(game, newBoard, 'X').score;
		} else {
			move.score = minimax(game, newBoard, 'O').score;
		}
		newBoard[index] = null;
		moves.push(move);
	}
	let bestMove;
	if (playerSymbol === 'O') {
		let bestScore = -Infinity;
		for (const move of moves) {
			if (move.score > bestScore) {
				bestScore = move.score;
				bestMove = move;
			}
		}
	} else {
		let bestScore = Infinity;
		for (const move of moves) {
			if (move.score < bestScore) {
				bestScore = move.score;
				bestMove = move;
			}
		}
	}
	return bestMove;
}
function checkWinBoard(board, playerSymbol) {
	const winPatterns = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	return winPatterns.some((pattern) =>
		pattern.every((index) => board[index] === playerSymbol),
	);
}
module.exports = {
	createGame,
	buildGameUI,
	checkWin,
	checkDraw,
	botMove,
	findWinningMove,
	getRandomMove,
	minimax,
	checkWinBoard,
};
