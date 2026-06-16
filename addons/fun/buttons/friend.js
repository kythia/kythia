/**
 * @namespace: addons/fun/buttons/friend.js
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
const Friend = require('../database/models/Friend');
const { convertColor } = require('kythia-core').utils;
const { BaseButton } = require('kythia-core');
class FriendButton extends BaseButton {
	button = {};
	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig } = container;
		const [prefix, actionType, friendReqId] = interaction.customId.split(':');
		if (prefix !== 'friend' || !actionType || !friendReqId) return;
		const friendReq = await Friend.getCache({
			id: friendReqId,
		});
		if (actionType === 'accept') {
			if (friendReq?.status !== 'pending') {
				const cont = new ContainerBuilder()
					.setAccentColor(
						convertColor(kythiaConfig.bot.color, {
							from: 'hex',
							to: 'decimal',
						}),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(interaction, 'fun.friend.request.expired'),
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
					components: [cont],
				});
			}
			if (interaction.user.id !== friendReq.user2Id) {
				return interaction.reply({
					content: await t(interaction, 'fun.friend.not.found'),
					// re-use or standard unauthorized error
					flags: MessageFlags.Ephemeral,
				});
			}
			await friendReq.update({
				status: 'accepted',
			});
			let user1Display, user2Display;
			try {
				const user1 = await container.helpers.discord.getUserSafe(
					interaction.client,
					friendReq.user1Id,
				);
				user1Display = user1 ? user1.toString() : 'Unknown';
			} catch {
				user1Display = 'Unknown';
			}
			user2Display = interaction.user.toString();
			const congratsTitle = await t(interaction, 'fun.friend.congrats.title');
			const congratsDesc = await t(
				interaction,
				'fun.friend.congrats.description',
				{
					user1: user1Display,
					user2: user2Display,
				},
			);
			const footer = await t(interaction, 'common.container.footer', {
				username: interaction.client.user.username,
			});
			const cont = new ContainerBuilder()
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
				components: [cont],
			});
		} else if (actionType === 'reject') {
			if (friendReq?.status !== 'pending') {
				const cont = new ContainerBuilder()
					.setAccentColor(
						convertColor(kythiaConfig.bot.color, {
							from: 'hex',
							to: 'decimal',
						}),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(interaction, 'fun.friend.request.expired'),
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
					components: [cont],
				});
			}
			if (interaction.user.id !== friendReq.user2Id) {
				return interaction.reply({
					content: await t(interaction, 'fun.friend.not.found'),
					flags: MessageFlags.Ephemeral,
				});
			}
			await friendReq.update({
				status: 'rejected',
			});
			const rejectedText = await t(interaction, 'fun.friend.request.rejected', {
				user1: `<@${friendReq.user1Id}>`,
				user2: `<@${friendReq.user2Id}>`,
			});
			const footer = await t(interaction, 'common.container.footer', {
				username: interaction.client.user.username,
			});
			const cont = new ContainerBuilder()
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
				components: [cont],
			});
		}
	}
}
exports.default = FriendButton;
