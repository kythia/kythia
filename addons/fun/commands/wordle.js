/**
 * @namespace: addons/fun/commands/wordle.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ButtonStyle,
	MessageFlags,
	ModalBuilder,
	ButtonBuilder,
	ComponentType,
	TextInputStyle,
	ActionRowBuilder,
	TextInputBuilder,
	SlashCommandBuilder,
} = require('discord.js');
const { BaseCommand } = require('kythia-core');
const wordleHelper = require('../helpers/wordle');

const games = {};
class WordleCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('wordle')
		.setDescription('🔡 Play Wordle! Guess the 5-letter word in 6 tries.');
	async execute(interaction) {
		const container = this.container;
		const { t } = container;
		const wordleHelpers = wordleHelper;
		const userId = interaction.user.id;
		if (games[userId] && !games[userId].isOver) {
			const { simpleContainer } = container.helpers.discord;
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'fun.wordle.already.playing'),
					{
						color: '#e67e22',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const answer = wordleHelpers.pickRandomWord();
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
		const gameContainer = await wordleHelpers.buildGameEmbed(
			interaction,
			game,
			row,
		);
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
						{
							color: '#e67e22',
						},
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
				const modalSubmit = await i.awaitModalSubmit({
					time: 60_000,
				});
				const guess = modalSubmit.fields
					.getTextInputValue('wordle_input')
					.toLowerCase();
				if (!wordleHelpers.isValidWord(guess)) {
					const { simpleContainer } = container.helpers.discord;
					return modalSubmit.reply({
						components: await simpleContainer(
							modalSubmit,
							await t(modalSubmit, 'fun.wordle.invalid.word', {
								word: guess,
							}),
							{
								color: '#e74c3c',
							},
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
							{
								color: '#e67e22',
							},
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
				const updatedContainer = await wordleHelpers.buildGameEmbed(
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
			const finalContainer = await wordleHelpers.buildGameEmbed(
				interaction,
				game,
				finalRow,
			);
			await interaction.editReply({
				components: [finalContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		});
	}
}

exports.default = WordleCommand;
