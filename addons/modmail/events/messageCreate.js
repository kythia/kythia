/**
 * @namespace: addons/modmail/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	SeparatorBuilder,
	ContainerBuilder,
	ActionRowBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
	StringSelectMenuBuilder,
} = require('discord.js');
const { BaseEvent } = require('kythia-core');
const {
	createModmailThread,
	relayUserMessage,
	relayGuildReply,
} = require('../helpers');

// ─── Spam guards ──────────────────────────────────────────────────────────────
const pendingCreations = new Set();
const pendingSelections = new Map();
const DEFAULT_COOLDOWN_MS = 5 * 60 * 1000;

// ─── Note prefix ──────────────────────────────────────────────────────────────
const NOTE_PREFIX = '>';
async function handleGuildMessage(message, container, client) {
	const { models, logger } = container;
	const { Modmail } = models;
	try {
		if (message.channel.type !== 12 /* PrivateThread */) return;
		const modmail = await Modmail.getCache({
			threadChannelId: message.channel.id,
			status: 'open',
		});
		if (!modmail) return;
		const content = message.content?.trim() || '';
		const hasAttachments = message.attachments.size > 0;
		if (content.startsWith(NOTE_PREFIX)) {
			try {
				await message.react('👁️');
			} catch (_e) {}
			return;
		}
		if (!content && !hasAttachments) return;
		try {
			await message.delete();
		} catch (_e) {}
		await relayGuildReply(message, modmail, false, content, container, client);
	} catch (error) {
		logger.error(`handleGuildMessage failed: ${error.message || error}`, {
			label: 'modmail',
		});
	}
}
async function handleUserDM(
	message,
	container,
	client,
	pendingCreations,
	pendingSelections,
) {
	const { models, t, helpers, logger, kythiaConfig } = container;
	const { Modmail, ModmailConfig } = models;
	const { simpleContainer, isOwner } = helpers.discord;
	const { convertColor } = helpers.color;
	try {
		const content = message.content?.trim() || '';
		const hasAttachments = message.attachments.size > 0;
		if (!content && !hasAttachments) return;
		const userId = message.author.id;
		if (pendingCreations.has(userId)) return;
		const existingModmails = await Modmail.getAllCache({
			userId,
			status: 'open',
		});
		if (existingModmails && existingModmails.length > 0) {
			client.modmailActiveDMs.add(userId);
			await relayUserMessage(message, existingModmails[0], container);
			return;
		}
		if (pendingSelections.has(userId)) return;
		const cooldownMs =
			kythiaConfig.addons?.modmail?.reopenCooldownMs ?? DEFAULT_COOLDOWN_MS;
		if (cooldownMs > 0 && !isOwner(userId)) {
			const recentClosed = await Modmail.getAllCache({
				userId,
				status: 'closed',
			});
			if (recentClosed && recentClosed.length > 0) {
				const latest = recentClosed.sort(
					(a, b) => (Number(b.closedAt) || 0) - (Number(a.closedAt) || 0),
				)[0];
				const elapsed = Date.now() - (Number(latest.closedAt) || 0);
				if (elapsed < cooldownMs) {
					const remaining = Math.ceil((cooldownMs - elapsed) / 1000 / 60);
					const fakeInteraction = {
						client,
						locale: kythiaConfig.bot.locale || 'en-US',
					};
					const msg = await t(
						fakeInteraction,
						'modmail.events.messageCreate.dm.cooldown',
						{
							minutes: remaining,
						},
					);
					try {
						await message.author.send({
							components: await simpleContainer(fakeInteraction, msg, {
								color: 'Yellow',
							}),
							flags: MessageFlags.IsComponentsV2,
						});
					} catch (_e) {}
					return;
				}
			}
		}
		const allConfigs = await ModmailConfig.getAllCache({});
		if (!allConfigs || allConfigs.length === 0) return;
		const eligibleConfigs = [];
		for (const cfg of allConfigs) {
			try {
				const guild = await helpers.discord.getGuildSafe(client, cfg.guildId);
				if (!guild) continue;
				const member = await helpers.discord.getMemberSafe(guild, userId);
				if (!member) continue;
				const blocked = Array.isArray(cfg.blockedUserIds)
					? cfg.blockedUserIds
					: [];
				if (blocked.includes(userId)) continue;
				eligibleConfigs.push({
					cfg,
					guild,
				});
			} catch (_e) {}
		}
		if (eligibleConfigs.length === 0) return;
		const fakeInteraction = {
			client,
			locale: kythiaConfig.bot.locale || 'en-US',
		};
		if (eligibleConfigs.length === 1) {
			pendingCreations.add(userId);
			client.modmailActiveDMs.add(userId);
			try {
				await createModmailThread(
					message.author,
					eligibleConfigs[0].cfg.guildId,
					content,
					message.attachments,
					container,
				);
			} finally {
				pendingCreations.delete(userId);
			}
			return;
		}
		client.modmailActiveDMs.add(userId);
		pendingSelections.set(userId, {
			content,
			attachments: message.attachments,
		});
		const options = eligibleConfigs.slice(0, 25).map(({ cfg, guild }) => ({
			label: guild.name.slice(0, 100),
			description: 'Click to open a modmail ticket',
			value: cfg.guildId,
		}));
		const components = [
			new ContainerBuilder()
				.setAccentColor(
					convertColor(kythiaConfig.bot.color, {
						from: 'hex',
						to: 'decimal',
					}),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(
							fakeInteraction,
							'modmail.events.messageCreate.server_select.prompt',
						),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addActionRowComponents(
					new ActionRowBuilder().addComponents(
						new StringSelectMenuBuilder()
							.setCustomId('mm-server-select')
							.setPlaceholder(
								await t(
									fakeInteraction,
									'modmail.events.messageCreate.server_select.placeholder',
								),
							)
							.addOptions(options),
					),
				)
				.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(fakeInteraction, 'common.container.footer', {
							username: client.user.username,
						}),
					),
				),
		];
		await message.author
			.send({
				components,
				flags: MessageFlags.IsComponentsV2,
			})
			.catch(() => null);
		client.modmailPendingSelections = pendingSelections;
		setTimeout(
			() => {
				if (pendingSelections.has(userId)) {
					pendingSelections.delete(userId);
					client.modmailActiveDMs.delete(userId);
				}
			},
			5 * 60 * 1000,
		);
	} catch (error) {
		pendingCreations.delete(message.author.id);
		logger.error(`messageCreate DM handler failed: ${error.message || error}`, {
			label: 'modmail',
		});
	}
}
class MessageCreateEvent extends BaseEvent {
	async execute(message) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const client = this.client;
		if (!(client.modmailActiveDMs instanceof Set)) {
			client.modmailActiveDMs = new Set();
		}
		if (!message.author || message.author.bot) return;
		if (!message.guild) {
			await handleUserDM(
				message,
				container,
				client,
				pendingCreations,
				pendingSelections,
			);
			return;
		}
		await handleGuildMessage(message, container, client);
	}
}
module.exports = MessageCreateEvent;
module.exports.pendingCreations = pendingCreations;
module.exports.pendingSelections = pendingSelections;
