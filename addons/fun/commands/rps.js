/**
 * @namespace: addons/fun/commands/rps.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ComponentType,
	ActionRowBuilder,
	SlashCommandBuilder,
} = require('discord.js');
const { BaseCommand } = require('kythia-core');
const rpsHelper = require('../helpers/rps');

// Helpers extracted to addons/fun/helpers/rps.js

class RpsCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('rps')
		.setDescription('✂️ Play Rock Paper Scissors — against the bot or a friend!')
		.addUserOption((o) =>
			o
				.setName('opponent')
				.setDescription('Challenge a friend (leave empty to play vs bot)')
				.setRequired(false),
		);
	async execute(interaction) {
		const container = this.container;
		const { t } = container;
		const rpsHelpers = rpsHelper;
		const { CHOICES, EMOJI } = rpsHelpers;
		const challenger = interaction.user;
		const opponent = interaction.options.getUser('opponent');
		const vsBot = !opponent || opponent.bot;

		// ─────────────────────────────────────────────
		// vs BOT
		// ─────────────────────────────────────────────
		if (vsBot) {
			const playGame = async (iCtx, isUpdate = false) => {
				const botChoice = CHOICES[Math.floor(Math.random() * 3)];
				const title = await t(iCtx, 'fun.rps.title');
				const questionContainer = await rpsHelpers.buildRPSContainer(iCtx, {
					title,
					body: await t(iCtx, 'fun.rps.choose'),
					footer: await t(iCtx, 'fun.rps.footer.play'),
					row: rpsHelpers.buildChoiceRow(false),
				});
				let message;
				if (isUpdate) {
					await iCtx.update({
						components: [questionContainer],
						flags: MessageFlags.IsComponentsV2,
					});
					message = await iCtx.fetchReply();
				} else {
					message = await iCtx.reply({
						components: [questionContainer],
						flags: MessageFlags.IsComponentsV2,
						fetchReply: true,
					});
				}
				const collector = message.createMessageComponentCollector({
					componentType: ComponentType.Button,
					time: 60_000,
					filter: (i) =>
						i.user.id === challenger.id &&
						['rps_rock', 'rps_paper', 'rps_scissors'].includes(i.customId),
				});
				collector.on('collect', async (i) => {
					const playerChoice = i.customId.replace('rps_', '');
					const result = rpsHelpers.getResult(playerChoice, botChoice);
					const botName = interaction.client.user.username;
					let body;
					let accentColor;
					if (result === 'draw') {
						body = await t(i, 'fun.rps.result.draw', {
							choice: `${EMOJI[playerChoice]} **${playerChoice}**`,
						});
						accentColor = '#95a5a6';
					} else if (result === 'win') {
						body = await t(i, 'fun.rps.result.win', {
							winner: challenger.toString(),
							winnerChoice: `${EMOJI[playerChoice]} **${playerChoice}**`,
							loserChoice: `${EMOJI[botChoice]} **${botChoice}**`,
						});
						accentColor = '#2ecc71';
					} else {
						body = await t(i, 'fun.rps.result.win', {
							winner: botName,
							winnerChoice: `${EMOJI[botChoice]} **${botChoice}**`,
							loserChoice: `${EMOJI[playerChoice]} **${playerChoice}**`,
						});
						accentColor = '#e74c3c';
					}
					const resultContainer = await rpsHelpers.buildRPSContainer(i, {
						title: `${title}\n> ${challenger.toString()} ${EMOJI[playerChoice]} vs ${EMOJI[botChoice]} ${botName}`,
						body,
						footer: await t(i, 'fun.rps.footer.end'),
						accentColor,
						row: rpsHelpers.buildRematchRow(await t(i, 'fun.rps.rematch')),
					});
					await i.update({
						components: [resultContainer],
						flags: MessageFlags.IsComponentsV2,
					});
					collector.stop('picked');
				});
				collector.on('end', async (collected, reason) => {
					if (reason === 'time' && collected.size === 0) {
						const disabledContainer = await rpsHelpers.buildRPSContainer(
							isUpdate ? iCtx : interaction,
							{
								title: await t(interaction, 'fun.rps.title'),
								body: await t(interaction, 'fun.rps.choose'),
								footer: await t(interaction, 'fun.rps.footer.play'),
								row: rpsHelpers.buildChoiceRow(true),
							},
						);
						await interaction
							.editReply({
								components: [disabledContainer],
								flags: MessageFlags.IsComponentsV2,
							})
							.catch(() => {});
					}
				});

				// Rematch listener on the same message
				const rematchCollector = message.createMessageComponentCollector({
					componentType: ComponentType.Button,
					filter: (i) =>
						i.customId === 'rps_rematch_bot' && i.user.id === challenger.id,
					time: 300_000,
				});
				rematchCollector.on('collect', async (i) => {
					rematchCollector.stop();
					await playGame(i, true);
				});
			};
			return playGame(interaction, false);
		}

		// ─────────────────────────────────────────────
		// vs FRIEND
		// ─────────────────────────────────────────────
		if (opponent.id === challenger.id) {
			const { simpleContainer } = container.helpers.discord;
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					"❌ You can't challenge yourself!",
					{
						color: '#e74c3c',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const title = await t(interaction, 'fun.rps.title');
		const pickRow = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('rps_duel_pick')
				.setLabel('⚔️ Make Your Pick!')
				.setStyle(ButtonStyle.Primary),
		);
		const waitingContainer = await rpsHelpers.buildRPSContainer(interaction, {
			title: `${title}\n> ⚔️ ${challenger.toString()} vs ${opponent.toString()}`,
			body: await t(interaction, 'fun.rps.waiting', {
				opponent: opponent.toString(),
			}),
			footer: await t(interaction, 'fun.rps.footer.play'),
			row: pickRow,
		});
		const message = await interaction.reply({
			components: [waitingContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});
		const picks = {};
		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 60_000,
			filter: (i) =>
				i.customId === 'rps_duel_pick' &&
				(i.user.id === challenger.id || i.user.id === opponent.id),
		});
		collector.on('collect', async (i) => {
			if (picks[i.user.id]) {
				return i.reply({
					content: await t(interaction, 'fun.rps.duel.already_locked'),
					flags: MessageFlags.Ephemeral,
				});
			}
			const epRow = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('rps_duel_rock')
					.setLabel('🪨 Rock')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('rps_duel_paper')
					.setLabel('📄 Paper')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('rps_duel_scissors')
					.setLabel('✂️ Scissors')
					.setStyle(ButtonStyle.Secondary),
			);
			await i.reply({
				content: await t(interaction, 'fun.rps.duel.pick_weapon'),
				components: [epRow],
				flags: MessageFlags.Ephemeral,
			});
			const epCollector = i.channel.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 60_000,
				max: 1,
				filter: (b) =>
					b.user.id === i.user.id &&
					['rps_duel_rock', 'rps_duel_paper', 'rps_duel_scissors'].includes(
						b.customId,
					),
			});
			epCollector.on('collect', async (b) => {
				picks[b.user.id] = b.customId.replace('rps_duel_', '');
				await b.update({
					content: await t(interaction, 'fun.rps.duel.locked_in', {
						emoji: EMOJI[picks[b.user.id]],
					}),
					components: [],
				});
				if (picks[challenger.id] && picks[opponent.id]) {
					collector.stop('both_picked');
				}
			});
		});
		collector.on('end', async (_, reason) => {
			const cPick = picks[challenger.id];
			const oPick = picks[opponent.id];
			const headerTitle = `${title}\n> ⚔️ ${challenger.toString()} vs ${opponent.toString()}`;
			if (reason === 'time' && (!cPick || !oPick)) {
				const missing = !cPick ? challenger.toString() : opponent.toString();
				const timedOutContainer = await rpsHelpers.buildRPSContainer(
					interaction,
					{
						title: headerTitle,
						body: await t(interaction, 'fun.rps.result.timeout', {
							opponent: missing,
						}),
						footer: await t(interaction, 'fun.rps.footer.end'),
						accentColor: '#95a5a6',
					},
				);
				return interaction
					.editReply({
						components: [timedOutContainer],
						flags: MessageFlags.IsComponentsV2,
					})
					.catch(() => {});
			}
			const result = rpsHelpers.getResult(cPick, oPick);
			const revealText =
				`\n> ${challenger.toString()}: ${EMOJI[cPick]} **${cPick}**` +
				`\n> ${opponent.toString()}: ${EMOJI[oPick]} **${oPick}**`;
			let body;
			let accentColor;
			if (result === 'draw') {
				body = await t(interaction, 'fun.rps.result.draw', {
					choice: `${EMOJI[cPick]} **${cPick}**`,
				});
				accentColor = '#95a5a6';
			} else {
				const [winner, winnerPick, loserPick] =
					result === 'win'
						? [challenger, cPick, oPick]
						: [opponent, oPick, cPick];
				body = await t(interaction, 'fun.rps.result.win', {
					winner: winner.toString(),
					winnerChoice: `${EMOJI[winnerPick]} **${winnerPick}**`,
					loserChoice: `${EMOJI[loserPick]} **${loserPick}**`,
				});
				accentColor = result === 'win' ? '#2ecc71' : '#e74c3c';
			}
			const resultContainer = await rpsHelpers.buildRPSContainer(interaction, {
				title: headerTitle + revealText,
				body,
				footer: await t(interaction, 'fun.rps.footer.end'),
				accentColor,
			});
			await interaction
				.editReply({
					components: [resultContainer],
					flags: MessageFlags.IsComponentsV2,
				})
				.catch(() => {});
		});
	}
}

exports.default = RpsCommand;
