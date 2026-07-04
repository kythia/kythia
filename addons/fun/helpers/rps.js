/**
 * @namespace: addons/fun/helpers/rps.js
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

const CHOICES = ['rock', 'paper', 'scissors'];

const EMOJI = {
	rock: '🪨',
	paper: '📄',
	scissors: '✂️',
};

/**
 * Returns 'win' | 'lose' | 'draw' from player1's perspective.
 */
function getResult(p1, p2) {
	if (p1 === p2) return 'draw';
	if (
		(p1 === 'rock' && p2 === 'scissors') ||
		(p1 === 'scissors' && p2 === 'paper') ||
		(p1 === 'paper' && p2 === 'rock')
	)
		return 'win';
	return 'lose';
}

/**
 * Builds the game ContainerBuilder with the action row embedded inside it.
 * @param {object} options - { title, body, footer, accentColor, row }
 */
function buildRPSContainer(
	interaction,
	{ title, body, footer, accentColor, row = null },
) {
	const { helpers, kythiaConfig } = interaction.client.container;
	const { convertColor } = helpers.color;

	const container = new ContainerBuilder()
		.setAccentColor(
			convertColor(accentColor ?? kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			}),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`${title}\n\n${body}`),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`-# ${footer}`),
		);

	if (row) container.addActionRowComponents(row);
	return container;
}

function buildChoiceRow(disabled = false) {
	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('rps_rock')
			.setLabel('🪨 Rock')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(disabled),
		new ButtonBuilder()
			.setCustomId('rps_paper')
			.setLabel('📄 Paper')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(disabled),
		new ButtonBuilder()
			.setCustomId('rps_scissors')
			.setLabel('✂️ Scissors')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(disabled),
	);
}

function buildRematchRow(label) {
	return new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('rps_rematch_bot')
			.setLabel(label)
			.setStyle(ButtonStyle.Primary),
	);
}

module.exports = {
	CHOICES,
	EMOJI,
	getResult,
	buildRPSContainer,
	buildChoiceRow,
	buildRematchRow,
};
