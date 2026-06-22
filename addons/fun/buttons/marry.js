/**
 * @namespace: addons/fun/buttons/marry.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	MessageFlags,
} = require('discord.js');
const Marriage = require('../database/models/Marriage');
const { convertColor } = require('kythia-core').utils;
const { BaseButton } = require('kythia-core');
class MarryButton extends BaseButton {
	button = {};
	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig } = container;
		const [prefix, actionType, marriageId] = interaction.customId.split(':');
		if (prefix !== 'marry' || !actionType || !marriageId) return;
		const marriage = await Marriage.getCache({
			id: marriageId,
		});
		if (actionType === 'accept') {
			if (marriage?.status !== 'pending') {
				const container = new ContainerBuilder()
					.setAccentColor(
						convertColor(kythiaConfig.bot.color, {
							from: 'hex',
							to: 'decimal',
						}),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(interaction, 'fun.shared.marry.proposal.expired'),
						),
					)
					.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(interaction, 'common.container.footer', {
								username: interaction.client.user.username,
							}),
						),
					);
				return interaction.update({
					components: [container],
				});
			}
			if (interaction.user.id !== marriage.user2Id) {
				return interaction.reply({
					content: await t(interaction, 'fun.shared.marry.not.your.proposal'),
					flags: MessageFlags.Ephemeral,
				});
			}
			await marriage.update({
				status: 'married',
				marriedAt: new Date(),
				loveScore: 0,
			});
			let user1Display, user2Display;
			try {
				const user1 = await container.helpers.discord.getUserSafe(
					interaction.client,
					marriage.user1Id,
				);
				user1Display = user1 ? user1.toString() : 'Unknown';
			} catch {
				user1Display = 'Unknown';
			}
			user2Display = interaction.user.toString();
			const congratsTitle = await t(
				interaction,
				'fun.buttons.marry.congrats.title',
			);
			const congratsDesc = await t(
				interaction,
				'fun.buttons.marry.congrats.description',
				{
					user1: user1Display,
					user2: user2Display,
				},
			);
			const footer = await t(interaction, 'common.container.footer', {
				username: interaction.client.user.username,
			});
			const container = new ContainerBuilder()
				.setAccentColor(
					convertColor(kythiaConfig.bot.color, {
						from: 'hex',
						to: 'decimal',
					}),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(congratsTitle),
				)
				.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(congratsDesc),
				)
				.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
				.addTextDisplayComponents(new TextDisplayBuilder().setContent(footer));
			await interaction.update({
				components: [container],
			});
		} else if (actionType === 'reject') {
			if (marriage?.status !== 'pending') {
				const container = new ContainerBuilder()
					.setAccentColor(
						convertColor(kythiaConfig.bot.color, {
							from: 'hex',
							to: 'decimal',
						}),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(interaction, 'fun.shared.marry.proposal.expired'),
						),
					)
					.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(interaction, 'common.container.footer', {
								username: interaction.client.user.username,
							}),
						),
					);
				return interaction.update({
					components: [container],
				});
			}
			if (interaction.user.id !== marriage.user2Id) {
				return interaction.reply({
					content: await t(interaction, 'fun.shared.marry.not.your.proposal'),
					flags: MessageFlags.Ephemeral,
				});
			}
			await marriage.update({
				status: 'rejected',
			});
			const rejectedText = await t(
				interaction,
				'fun.buttons.marry.proposal.rejected',
				{
					user1: `<@${marriage.user1Id}>`,
					user2: `<@${marriage.user2Id}>`,
				},
			);
			const footer = await t(interaction, 'common.container.footer', {
				username: interaction.client.user.username,
			});
			const container = new ContainerBuilder()
				.setAccentColor(
					convertColor('Red', {
						from: 'discord',
						to: 'decimal',
					}),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(rejectedText),
				)
				.addSeparatorComponents(new SeparatorBuilder().setDivider(true))
				.addTextDisplayComponents(new TextDisplayBuilder().setContent(footer));
			await interaction.update({
				components: [container],
			});
		}
	}
}
exports.default = MarryButton;
