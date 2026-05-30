/**
 * @namespace: addons/fun/commands/wordle.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ComponentType,
	ContainerBuilder,
	MessageFlags,
	ModalBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	SlashCommandBuilder,
	TextDisplayBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require('discord.js');

const kythiaConfig = require('../../../kythia.config');

const WORD_LIST = kythiaConfig.addons.fun.wordle.words;

const EMOJI_CORRECT = '🟩';
const EMOJI_PRESENT = '🟨';
const EMOJI_ABSENT = '⬛';
const games = {};

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
			description += `\n\n${await t(interaction, 'fun.wordle.win', { answer: game.answer.toUpperCase() })}`;
		} else {
			description += `\n\n${await t(interaction, 'fun.wordle.lose', { answer: game.answer.toUpperCase() })}`;
		}
	} else {
		description += `\n\n${await t(interaction, 'fun.wordle.remaining', { remaining: 6 - game.guesses.length })}`;
	}

	const footer = game.isOver
		? await t(interaction, 'fun.wordle.footer.end')
		: await t(interaction, 'fun.wordle.footer.play');

	const container = new ContainerBuilder()
		.setAccentColor(
			convertColor(
				game.isOver
					? game.win
						? '#2ecc71'
						: '#e74c3c'
					: kythiaConfig.bot.color,
				{ from: 'hex', to: 'decimal' },
			),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`${await t(interaction, 'fun.wordle.title')}\n${description}`,
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
	slashCommand: new SlashCommandBuilder()
		.setName('wordle')
		.setDescription('🔡 Play Wordle! Guess the 5-letter word in 6 tries.'),

	async execute(interaction, container) {
		const { t } = container;

		const userId = interaction.user.id;

		if (games[userId] && !games[userId].isOver) {
			const { simpleContainer } = container.helpers.discord;
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'fun.wordle.already.playing'),
					{ color: '#e67e22' },
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		const answer = pickRandomWord();
		games[userId] = {
			answer,
			guesses: [],
			isOver: false,
			win: false,
		};
		const game = games[userId];

		const row = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('wordle_guess_button')
				.setLabel(await t(interaction, 'fun.wordle.button.guess'))
				.setStyle(ButtonStyle.Primary),
		);

		const gameContainer = await buildGameEmbed(interaction, game, row);

		const message = await interaction.reply({
			components: [gameContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 300_000,
		});

		collector.on('collect', async (i) => {
			if (i.user.id !== userId) {
				const { simpleContainer } = container.helpers.discord;
				return i.reply({
					components: await simpleContainer(
						i,
						await t(i, 'fun.wordle.not.your.game'),
						{ color: '#e67e22' },
					),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}

			const modal = new ModalBuilder()
				.setCustomId(`wordle_modal_${userId}`)
				.setTitle(await t(i, 'fun.wordle.modal.title'));

			const wordInput = new TextInputBuilder()
				.setCustomId('wordle_input')
				.setLabel(await t(i, 'fun.wordle.modal.label'))
				.setStyle(TextInputStyle.Short)
				.setMinLength(5)
				.setMaxLength(5)
				.setRequired(true);

			modal.addComponents(new ActionRowBuilder().addComponents(wordInput));
			await i.showModal(modal);

			try {
				const modalSubmit = await i.awaitModalSubmit({ time: 60_000 });
				const guess = modalSubmit.fields
					.getTextInputValue('wordle_input')
					.toLowerCase();

				if (!isValidWord(guess)) {
					const { simpleContainer } = container.helpers.discord;
					return modalSubmit.reply({
						components: await simpleContainer(
							modalSubmit,
							await t(modalSubmit, 'fun.wordle.invalid.word', { word: guess }),
							{ color: '#e74c3c' },
						),
						flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
					});
				}
				if (game.guesses.includes(guess)) {
					const { simpleContainer } = container.helpers.discord;
					return modalSubmit.reply({
						components: await simpleContainer(
							modalSubmit,
							await t(modalSubmit, 'fun.wordle.already.guessed', {
								word: guess,
							}),
							{ color: '#e67e22' },
						),
						flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
					});
				}

				await modalSubmit.deferUpdate();
				game.guesses.push(guess);

				if (guess === game.answer) {
					game.isOver = true;
					game.win = true;
					collector.stop('win');
				} else if (game.guesses.length >= 6) {
					game.isOver = true;
					collector.stop('lose');
				}

				const updatedContainer = await buildGameEmbed(
					interaction,
					game,
					game.isOver ? null : row,
				);
				await interaction.editReply({
					components: [updatedContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (_err) {}
		});

		collector.on('end', async (_collected, _reason) => {
			if (!game.isOver) game.isOver = true;

			delete games[userId];

			const finalRow = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('wordle_guess_button')
					.setLabel(await t(interaction, 'fun.wordle.button.end'))
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(true),
			);
			const finalContainer = await buildGameEmbed(interaction, game, finalRow);
			await interaction.editReply({
				components: [finalContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		});
	},
};
