/**
 * @namespace: addons/modmail/select_menus/mm-server-select.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const { createModmailThread } = require('../helpers');
const { BaseSelectMenu } = require('kythia-core');
class MmServerSelectSelectMenu extends BaseSelectMenu {
	selectMenu = {
		/**
		 * @param {import('discord.js').ChatInputCommandInteraction} interaction
		 * @param {KythiaDI.Container} container
		 */
	};
	async execute(interaction) {
		const container = this.container;
		const { models, t, helpers, logger, kythiaConfig, client } = container;
		const { ModmailConfig } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = interaction.values[0];
		const userId = interaction.user.id;
		try {
			// ── Load config & resolve guild name early (for the confirmation card) ─
			const config = await ModmailConfig.getCache({
				guildId,
			});
			const fakeInteraction = {
				client,
				locale: kythiaConfig.bot.locale || 'en-US',
			};
			const accentColor = convertColor(kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			});
			const footerText = await t(fakeInteraction, 'common.container.footer', {
				username: kythiaConfig.bot.name,
			});
			if (!config) {
				const desc = await t(fakeInteraction, 'modmail.errors.not_configured');
				await interaction
					.update({
						components: await simpleContainer(fakeInteraction, desc, {
							color: 'Red',
						}),
						flags: MessageFlags.IsComponentsV2,
					})
					.catch(() => null);
				client.modmailActiveDMs?.delete(userId);
				return;
			}

			// ── Block check ────────────────────────────────────────────────────────
			const blocked = Array.isArray(config.blockedUserIds)
				? config.blockedUserIds
				: [];
			if (blocked.includes(userId)) {
				const blockedMsg = await t(fakeInteraction, 'modmail.dm.blocked');
				await interaction
					.update({
						components: await simpleContainer(fakeInteraction, blockedMsg, {
							color: 'Red',
						}),
						flags: MessageFlags.IsComponentsV2,
					})
					.catch(() => null);
				client.modmailActiveDMs?.delete(userId);
				return;
			}

			// ── Fetch the guild name for the confirmation card ─────────────────────
			const guild = await client.container.helpers.discord.getGuildSafe(
				client,
				guildId,
			);
			const guildName = guild?.name || 'Unknown Server';

			// ── Replace the picker with a "Now chatting with…" Components V2 card ──
			const nowChattingText = await t(
				fakeInteraction,
				'modmail.server_select.confirmed',
				{
					server: guildName,
				},
			);
			const confirmCard = new ContainerBuilder()
				.setAccentColor(accentColor)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(nowChattingText),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(footerText),
				);

			// Update the original picker message — dropdown gone, card shown
			await interaction
				.update({
					components: [confirmCard],
					flags: MessageFlags.IsComponentsV2,
				})
				.catch(() => null);

			// ── Retrieve pending first message data ────────────────────────────────
			const pending = client.modmailPendingSelections?.get(userId);
			const content = pending?.content || '';
			const attachments = pending?.attachments || new Map();
			if (client.modmailPendingSelections) {
				client.modmailPendingSelections.delete(userId);
			}

			// ── Open the modmail thread ────────────────────────────────────────────
			await createModmailThread(
				interaction.user,
				guildId,
				content,
				attachments,
				container,
			);
		} catch (error) {
			logger.error(
				`mm-server-select handler failed: ${error.message || error}`,
				{
					label: 'modmail',
				},
			);
			client.modmailActiveDMs?.delete(userId);
		}
	}
}
module.exports = MmServerSelectSelectMenu;
