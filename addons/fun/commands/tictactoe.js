/**
 * @namespace: addons/fun/commands/tictactoe.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    EmbedBuilder,
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
        symbols: { [playerX.id]: 'X', [playerO.id]: 'O' },
        isGameOver: false,
        statusMessage: null,
    };
}

// Helper terpusat untuk membuat SEMUA komponen UI
async function buildGameUI(game) {
    const { board, currentPlayer, isGameOver, statusMessage, playerX, playerO, interaction } = game;
    const client = interaction.client;
    const container = interaction.client.container;
    const { t, helpers } = container;
    const { convertColor } = helpers.color;

    const turnText = isGameOver
        ? `**${statusMessage}**`
        : await t(interaction, 'fun.tictactoe.turn', {
              mention: currentPlayer.toString(),
              symbol: game.symbols[currentPlayer.id] === 'X' ? '❌' : '⭕',
          });

    const gameContainer = new ContainerBuilder()
        .setAccentColor(convertColor(isGameOver ? '#2ecc71' : '#3498db', { from: 'hex', to: 'decimal' }))
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `${await t(interaction, 'fun.tictactoe.title')}\n\`❌\` ${playerX.username}\n\`⭕\` ${playerO.username}`
            )
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
                    .setDisabled(cell !== null || isGameOver)
            );
        }
        gameContainer.addActionRowComponents(row);
    }

    gameContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(turnText));
    gameContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    gameContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(await t(interaction, 'common.container.footer', { username: client.user.username }))
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
    return winPatterns.some((pattern) => pattern.every((index) => board[index] === playerSymbol));
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
        bestMove = findWinningMove(board, 'O') ?? findWinningMove(board, 'X') ?? getRandomMove(board);
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
    const emptyCells = board.map((cell, i) => (cell === null ? i : null)).filter((i) => i !== null);
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function minimax(game, newBoard, playerSymbol) {
    const emptyCells = newBoard.map((cell, i) => (cell === null ? i : null)).filter((i) => i !== null);

    if (checkWinBoard(newBoard, 'X')) return { score: -10 };
    if (checkWinBoard(newBoard, 'O')) return { score: 10 };
    if (emptyCells.length === 0) return { score: 0 };

    const moves = [];
    for (const index of emptyCells) {
        let move = { index };
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
    return winPatterns.some((pattern) => pattern.every((index) => board[index] === playerSymbol));
}

// =================================================================
// COMMAND EXPORT
// =================================================================

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tictactoe')
        .setDescription('⭕ Play Tic Tac Toe with a friend or bot.')
        .addUserOption((option) =>
            option.setName('opponent').setDescription('Select an opponent to play with. you can play with me too!').setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('difficulty')
                .setDescription('Select the difficulty level of the bot (if playing against a bot).')
                .setRequired(false)
                .addChoices(
                    { name: 'Easy', value: 'bot_easy' },
                    { name: 'Medium', value: 'bot_medium' },
                    { name: 'Hard (Unbeatable)', value: 'bot_hard' }
                )
        ),

    async execute(interaction, container) {
        const { t, helpers } = container;
        const { convertColor } = helpers.color;

        const opponent = interaction.options.getUser('opponent');
        let mode = 'player';

        if (opponent.bot) {
            mode = interaction.options.getString('difficulty') || 'bot_hard';
        } else if (opponent.id === interaction.user.id) {
            // Tidak bisa lawan diri sendiri
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setDescription(
                            `${await t(interaction, 'fun.tictactoe.error.title')}\n${await t(interaction, 'fun.tictactoe.error.self')}`
                        ),
                ],
                ephemeral: true,
            });
        }

        const runGame = async (gameInstance, currentInteraction) => {
            const initialComponents = await buildGameUI(gameInstance);
            if (currentInteraction.deferred || currentInteraction.replied) {
                await currentInteraction.editReply({
                    components: initialComponents,
                    flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                });
            } else {
                await currentInteraction.reply({
                    components: initialComponents,
                    flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                    fetchReply: true,
                });
            }

            const message = await currentInteraction.fetchReply();
            const collector = message.createMessageComponentCollector({ componentType: ComponentType.Button, time: 120_000 });

            collector.on('collect', async (i) => {
                if (i.customId === 'tictactoe_rematch') {
                    if (i.user.id !== gameInstance.playerX.id && i.user.id !== gameInstance.playerO.id) {
                        return i.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Yellow')
                                    .setDescription(
                                        `${await t(i, 'fun.tictactoe.error.title')}\n${await t(i, 'fun.tictactoe.error.rematch')}`
                                    ),
                            ],
                            ephemeral: true,
                        });
                    }
                    await i.deferUpdate();
                    collector.stop('rematch');
                    const newGame = createGame(i, opponent, mode);
                    await runGame(newGame, i);
                    return;
                }

                if (i.user.id !== gameInstance.currentPlayer.id) {
                    return i.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Yellow')
                                .setDescription(`${await t(i, 'fun.tictactoe.error.title')}\n${await t(i, 'fun.tictactoe.error.turn')}`),
                        ],
                        ephemeral: true,
                    });
                }

                await i.deferUpdate();

                const index = parseInt(i.customId.split('_')[1]);
                const playerSymbol = gameInstance.symbols[i.user.id];
                gameInstance.board[index] = playerSymbol;

                if (checkWin(gameInstance.board, playerSymbol)) {
                    gameInstance.isGameOver = true;
                    gameInstance.statusMessage = await t(i, 'fun.tictactoe.win', { user: i.user.toString() });
                    collector.stop('win');
                    const updatedComponents = await buildGameUI(gameInstance);
                    await interaction.editReply({
                        components: updatedComponents,
                    });
                    return;
                }
                if (checkDraw(gameInstance.board)) {
                    gameInstance.isGameOver = true;
                    gameInstance.statusMessage = await t(i, 'fun.tictactoe.draw');
                    collector.stop('draw');
                    const updatedComponents = await buildGameUI(gameInstance);
                    await interaction.editReply({
                        components: updatedComponents,
                    });
                    return;
                }

                gameInstance.currentPlayer =
                    gameInstance.currentPlayer.id === gameInstance.playerX.id ? gameInstance.playerO : gameInstance.playerX;

                if (gameInstance.botDifficulty) {
                    botMove(gameInstance);
                    if (checkWin(gameInstance.board, 'O')) {
                        gameInstance.isGameOver = true;
                        gameInstance.statusMessage = await t(i, 'fun.tictactoe.lose');
                        collector.stop('lose');
                        const updatedComponents = await buildGameUI(gameInstance);
                        await interaction.editReply({
                            components: updatedComponents,
                        });
                        return;
                    }
                    if (checkDraw(gameInstance.board)) {
                        gameInstance.isGameOver = true;
                        gameInstance.statusMessage = await t(i, 'fun.tictactoe.draw');
                        collector.stop('draw');
                        const updatedComponents = await buildGameUI(gameInstance);
                        await interaction.editReply({
                            components: updatedComponents,
                        });
                        return;
                    }
                    gameInstance.currentPlayer = gameInstance.playerX;
                }

                const updatedComponents = await buildGameUI(gameInstance);
                await interaction.editReply({ components: updatedComponents, embeds: [] });
            });

            collector.on('end', async (collected, reason) => {
                if (reason === 'rematch') return;

                if (!gameInstance.isGameOver) {
                    gameInstance.isGameOver = true;
                    if (reason === 'time') {
                        gameInstance.statusMessage = await t(interaction, 'fun.tictactoe.timeout');
                    }
                }

                const finalComponents = await buildGameUI(gameInstance);
                await interaction.editReply({
                    components: finalComponents,
                });
            });
        };

        await interaction.deferReply();
        const game = createGame(interaction, opponent, mode);
        runGame(game, interaction);
    },
};
