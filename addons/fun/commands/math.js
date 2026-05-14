/**
 * @namespace: addons/fun/commands/math.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
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

// ─────────────────────────────────────────────────────────────────────────────
// Question generator — scales with streak
// ─────────────────────────────────────────────────────────────────────────────

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

	return { question: display, answer };
}

function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
	return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// UI helpers
// ─────────────────────────────────────────────────────────────────────────────

async function buildMathContainer(interaction, { body, footer, accentColor }) {
	const { helpers, kythiaConfig } = interaction.client.container;
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
				`${await interaction.client.container.t(interaction, 'fun.math.title')}\n\n${body}`,
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

// ─────────────────────────────────────────────────────────────────────────────
// Leaderboard helper
// ─────────────────────────────────────────────────────────────────────────────

async function buildLeaderboard(interaction, container) {
	const { models, t } = container;
	const { MathScore } = models;

	const top = await MathScore.getAllCache({
		order: [['bestScore', 'DESC']],
		limit: 10,
	});

	const title = await t(interaction, 'fun.math.leaderboard.title');

	if (!top || top.length === 0) {
		const empty = await t(interaction, 'fun.math.leaderboard.empty');
		return new ContainerBuilder()
			.setAccentColor(0xf1c40f)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(`${title}\n\n${empty}`),
			);
	}

	const lines = await Promise.all(
		top.map((entry, i) =>
			t(interaction, 'fun.math.leaderboard.entry', {
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

// ─────────────────────────────────────────────────────────────────────────────
// Score save helper
// ─────────────────────────────────────────────────────────────────────────────

async function saveScore(container, userId, username, score) {
	const { models } = container;
	const { MathScore } = models;

	let record = await MathScore.getCache({ userId });

	if (!record) {
		record = await MathScore.create({
			userId,
			username,
			bestScore: score,
			totalGames: 1,
		});
	} else {
		record.totalGames = (record.totalGames ?? 0) + 1;
		if (score > (record.bestScore ?? 0)) {
			record.bestScore = score;
		}
		record.username = username;
		await record.save();
	}

	return record;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMMAND
// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
	slashCommand: new SlashCommandBuilder()
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
		),

	async execute(interaction, container) {
		const { t } = container;
		const sub = interaction.options.getSubcommand();

		// ── Leaderboard ──────────────────────────────────────────────────────
		if (sub === 'leaderboard') {
			const lbContainer = await buildLeaderboard(interaction, container);
			return interaction.reply({
				components: [lbContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// ── Play ─────────────────────────────────────────────────────────────
		const userId = interaction.user.id;
		let score = 0;
		let { question, answer } = generateQuestion(score);

		const footer = await t(interaction, 'fun.math.footer.play');
		const questionText = await t(interaction, 'fun.math.question', {
			question,
			score,
		});

		const questionContainer = await buildMathContainer(interaction, {
			body: questionText,
			footer,
		});

		const row = buildAnswerRow(false);

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
				const next = generateQuestion(score);
				question = next.question;
				answer = next.answer;

				const nextText = await t(interaction, 'fun.math.question', {
					question,
					score,
				});
				const correctFeedback = await t(interaction, 'fun.math.correct');
				const nextContainer = await buildMathContainer(interaction, {
					body: `${correctFeedback}\n\n${nextText}`,
					footer,
					accentColor: '#2ecc71',
				});

				await interaction.editReply({
					components: [nextContainer, buildAnswerRow(false)],
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				// Game over
				running = false;

				const record = await saveScore(
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

				const endContainer = await buildMathContainer(interaction, {
					body: `${endReason}${bonusLine}`,
					footer: await t(interaction, 'fun.math.footer.end'),
					accentColor: '#e74c3c',
				});

				await interaction.editReply({
					components: [endContainer, buildAnswerRow(true)],
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}
	},
};
