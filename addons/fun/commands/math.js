/**
 * @namespace: addons/fun/commands/math.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ActionRowBuilder,
	ComponentType,
	MessageFlags,
	ModalBuilder,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

// Helpers extracted to addons/fun/helpers/math.js

class MathCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('math')
		.setDescription(
			'🔢 Speed math quiz — answer streaks build your leaderboard score!',
		)
		.addSubcommand((sub) =>
			sub.setName('play').setDescription('▶️ Start a math quiz'),
		)
		.addSubcommand((sub) =>
			sub
				.setName('leaderboard')
				.setDescription('🏆 View the global math leaderboard'),
		);

	async execute(interaction) {
		const container = this.container;
		const { t } = container;
		const sub = interaction.options.getSubcommand();

		const { helpers } = container;
		const mathHelpers = helpers.fun.math;

		// ── Leaderboard ──────────────────────────────────────────────────────
		if (sub === 'leaderboard') {
			const lbContainer = await mathHelpers.buildLeaderboard(
				interaction,
				container,
			);
			return interaction.reply({
				components: [lbContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// ── Play ─────────────────────────────────────────────────────────────
		const userId = interaction.user.id;
		let score = 0;
		let { question, answer } = mathHelpers.generateQuestion(score);

		const footer = await t(interaction, 'fun.math.footer.play');
		const questionText = await t(interaction, 'fun.math.question', {
			question,
			score,
		});

		const questionContainer = await mathHelpers.buildMathContainer(
			interaction,
			{
				body: questionText,
				footer,
			},
		);

		const row = mathHelpers.buildAnswerRow(false);

		const message = await interaction.reply({
			components: [questionContainer, row],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});

		// ─────────────────────────────────────────────────────────────────────
		// Game loop via button collector + modal
		// ─────────────────────────────────────────────────────────────────────

		const runRound = () => {
			return new Promise((resolve) => {
				const collector = message.createMessageComponentCollector({
					componentType: ComponentType.Button,
					time: 35_000,
					max: 1,
					filter: (i) => i.user.id === userId && i.customId === 'math_answer',
				});

				collector.on('collect', async (i) => {
					const modal = new ModalBuilder()
						.setCustomId(`math_modal_${userId}`)
						.setTitle(await t(i, 'fun.math.modal.title'));

					modal.addComponents(
						new ActionRowBuilder().addComponents(
							new TextInputBuilder()
								.setCustomId('math_input')
								.setLabel(await t(i, 'fun.math.modal.label'))
								.setStyle(TextInputStyle.Short)
								.setRequired(true)
								.setMaxLength(12),
						),
					);

					await i.showModal(modal);

					try {
						const submitted = await i.awaitModalSubmit({ time: 30_000 });
						const raw = submitted.fields.getTextInputValue('math_input').trim();
						const parsed = Number(raw);

						if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
							await submitted.reply({
								content: '❌ Please enter a valid number.',
								flags: MessageFlags.Ephemeral,
							});
							resolve({
								correct: false,
								timedOut: false,
								forcedAnswer: answer,
							});
							return;
						}

						const correct = Math.round(parsed) === answer;
						await submitted.deferUpdate();
						resolve({ correct, timedOut: false, forcedAnswer: answer });
					} catch {
						// Modal timed out
						resolve({ correct: false, timedOut: true, forcedAnswer: answer });
					}
				});

				collector.on('end', (collected, reason) => {
					if (reason === 'time' && collected.size === 0) {
						resolve({ correct: false, timedOut: true, forcedAnswer: answer });
					}
				});
			});
		};

		// Main loop
		let running = true;
		while (running) {
			const { correct, timedOut, forcedAnswer } = await runRound();

			if (correct) {
				score++;

				// Generate a new, harder question
				const next = mathHelpers.generateQuestion(score);
				question = next.question;
				answer = next.answer;

				const nextText = await t(interaction, 'fun.math.question', {
					question,
					score,
				});
				const correctFeedback = await t(interaction, 'fun.math.correct');
				const nextContainer = await mathHelpers.buildMathContainer(
					interaction,
					{
						body: `${correctFeedback}\n\n${nextText}`,
						footer,
						accentColor: '#2ecc71',
					},
				);

				await interaction.editReply({
					components: [nextContainer, mathHelpers.buildAnswerRow(false)],
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				// Game over
				running = false;

				const record = await mathHelpers.saveScore(
					container,
					userId,
					interaction.user.username,
					score,
				);

				const isNewBest = score > 0 && score >= (record.bestScore ?? 0);
				const endReason = timedOut
					? await t(interaction, 'fun.math.timeout', {
							answer: forcedAnswer,
							score,
						})
					: await t(interaction, 'fun.math.wrong', {
							answer: forcedAnswer,
							score,
						});

				const bonusLine = isNewBest
					? `\n${await t(interaction, 'fun.math.new_best', { score })}`
					: '';

				const endContainer = await mathHelpers.buildMathContainer(interaction, {
					body: `${endReason}${bonusLine}`,
					footer: await t(interaction, 'fun.math.footer.end'),
					accentColor: '#e74c3c',
				});

				await interaction.editReply({
					components: [endContainer, mathHelpers.buildAnswerRow(true)],
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}
	}
}

exports.default = MathCommand;
