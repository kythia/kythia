/**
 * @namespace: addons/fun/commands/tictactoe.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ComponentType,
	SlashCommandBuilder,
} = require('discord.js');
const { BaseCommand } = require('kythia-core');
const tictactoeHelper = require('../helpers/tictactoe');

// Helpers extracted to addons/fun/helpers/tictactoe.js

class TictactoeCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('tictactoe')
		.setDescription('Play Tic Tac Toe with a friend or bot.')
		.addUserOption((option) =>
			option
				.setName('opponent')
				.setDescription(
					'Select an opponent to play with. you can play with me too!',
				)
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('difficulty')
				.setDescription(
					'Select the difficulty level of the bot (if playing against a bot).',
				)
				.setRequired(false)
				.addChoices(
					{
						name: 'Easy',
						value: 'bot_easy',
					},
					{
						name: 'Medium',
						value: 'bot_medium',
					},
					{
						name: 'Hard (Unbeatable)',
						value: 'bot_hard',
					},
				),
		);
	async execute(interaction) {
		const container = this.container;
		const { t } = container;
		const tttHelpers = tictactoeHelper;
		const opponent = interaction.options.getUser('opponent');
		let mode = 'player';
		if (opponent.bot) {
			mode = interaction.options.getString('difficulty') || 'bot_hard';
		} else if (opponent.id === interaction.user.id) {
			const { simpleContainer } = container.helpers.discord;
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					`${await t(interaction, 'fun.shared.tictactoe.error.title')}\n${await t(interaction, 'fun.commands.tictactoe.error.self')}`,
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const runGame = async (gameInstance, currentInteraction) => {
			const initialComponents = await tttHelpers.buildGameUI(gameInstance);
			if (currentInteraction.deferred || currentInteraction.replied) {
				await currentInteraction.editReply({
					components: initialComponents,
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				await currentInteraction.reply({
					components: initialComponents,
					flags: MessageFlags.IsComponentsV2,
					fetchReply: true,
				});
			}
			const message = await currentInteraction.fetchReply();
			const collector = message.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 120_000,
			});
			collector.on('collect', async (i) => {
				if (i.customId === 'tictactoe_rematch') {
					if (
						i.user.id !== gameInstance.playerX.id &&
						i.user.id !== gameInstance.playerO.id
					) {
						const { simpleContainer } = container.helpers.discord;
						return i.reply({
							components: await simpleContainer(
								i,
								`${await t(i, 'fun.shared.tictactoe.error.title')}\n${await t(i, 'fun.commands.tictactoe.error.rematch')}`,
								{
									color: 'Yellow',
								},
							),
							flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
						});
					}
					await i.deferUpdate();
					collector.stop('rematch');
					const newGame = tttHelpers.createGame(i, opponent, mode);
					await runGame(newGame, i);
					return;
				}
				if (i.user.id !== gameInstance.currentPlayer.id) {
					const { simpleContainer } = container.helpers.discord;
					return i.reply({
						components: await simpleContainer(
							i,
							`${await t(i, 'fun.shared.tictactoe.error.title')}\n${await t(i, 'fun.commands.tictactoe.error.turn')}`,
							{
								color: 'Yellow',
							},
						),
						flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
					});
				}
				await i.deferUpdate();
				const index = parseInt(i.customId.split('_')[1], 10);
				const playerSymbol = gameInstance.symbols[i.user.id];
				gameInstance.board[index] = playerSymbol;
				if (tttHelpers.checkWin(gameInstance.board, playerSymbol)) {
					gameInstance.isGameOver = true;
					gameInstance.statusMessage = await t(
						i,
						'fun.commands.tictactoe.win',
						{
							user: i.user.toString(),
						},
					);
					collector.stop('win');
					const updatedComponents = await tttHelpers.buildGameUI(gameInstance);
					await interaction.editReply({
						components: updatedComponents,
					});
					return;
				}
				if (tttHelpers.checkDraw(gameInstance.board)) {
					gameInstance.isGameOver = true;
					gameInstance.statusMessage = await t(i, 'fun.shared.tictactoe.draw');
					collector.stop('draw');
					const updatedComponents = await tttHelpers.buildGameUI(gameInstance);
					await interaction.editReply({
						components: updatedComponents,
					});
					return;
				}
				gameInstance.currentPlayer =
					gameInstance.currentPlayer.id === gameInstance.playerX.id
						? gameInstance.playerO
						: gameInstance.playerX;
				if (gameInstance.botDifficulty) {
					tttHelpers.botMove(gameInstance);
					if (tttHelpers.checkWin(gameInstance.board, 'O')) {
						gameInstance.isGameOver = true;
						gameInstance.statusMessage = await t(
							i,
							'fun.commands.tictactoe.lose',
						);
						collector.stop('lose');
						const updatedComponents =
							await tttHelpers.buildGameUI(gameInstance);
						await interaction.editReply({
							components: updatedComponents,
						});
						return;
					}
					if (tttHelpers.checkDraw(gameInstance.board)) {
						gameInstance.isGameOver = true;
						gameInstance.statusMessage = await t(
							i,
							'fun.shared.tictactoe.draw',
						);
						collector.stop('draw');
						const updatedComponents =
							await tttHelpers.buildGameUI(gameInstance);
						await interaction.editReply({
							components: updatedComponents,
						});
						return;
					}
					gameInstance.currentPlayer = gameInstance.playerX;
				}
				const updatedComponents = await tttHelpers.buildGameUI(gameInstance);
				await interaction.editReply({
					components: updatedComponents,
					embeds: [],
				});
			});
			collector.on('end', async (_collected, reason) => {
				if (reason === 'rematch') return;
				if (!gameInstance.isGameOver) {
					gameInstance.isGameOver = true;
					if (reason === 'time') {
						gameInstance.statusMessage = await t(
							interaction,
							'fun.commands.tictactoe.timeout',
						);
					}
				}
				const finalComponents = await tttHelpers.buildGameUI(gameInstance);
				await interaction.editReply({
					components: finalComponents,
				});
			});
		};
		await interaction.deferReply();
		const game = tttHelpers.createGame(interaction, opponent, mode);
		runGame(game, interaction);
	}
}
exports.default = TictactoeCommand;
