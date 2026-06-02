/**
 * @namespace: addons/modmail/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ActionRowBuilder,
	StringSelectMenuBuilder,
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
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
// Messages starting with this are staff-only notes — NOT relayed to user.
const NOTE_PREFIX = '>';

module.exports = async (bot, message) => {
	const container = bot.client.container;
	const client = bot.client;

	if (!(client.modmailActiveDMs instanceof Set)) {
		client.modmailActiveDMs = new Set();
	}

	if (!message.author || message.author.bot) return;

	// ─── CASE 1: User DM ──────────────────────────────────────────────────────
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

	// ─── CASE 2: Guild message in a modmail thread ────────────────────────────
	await handleGuildMessage(message, container, client);
};

// ─────────────────────────────────────────────────────────────────────────────
// handleGuildMessage
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handles messages typed by staff inside a modmail thread.
 * - Prefix '>' → internal note, left in thread as-is (just add a 📝 reaction)
 * - All others → delete message, Components V2 relay to thread + DM user
 */
async function handleGuildMessage(message, container, client) {
	const { models, logger } = container;
	const { Modmail } = models;

	try {
		// Only act on private threads (modmail threads are PrivateThread, type 12)
		if (message.channel.type !== 12 /* PrivateThread */) return;

		// Check if this thread is an active modmail
		const modmail = await Modmail.getCache({
			threadChannelId: message.channel.id,
			status: 'open',
		});

		if (!modmail) return;

		const content = message.content?.trim() || '';
		const hasAttachments = message.attachments.size > 0;

		// ── Internal note: prefix > ──────────────────────────────────────────
		if (content.startsWith(NOTE_PREFIX)) {
			// Add a 👁 reaction to confirm it's an internal note, don't relay
			try {
				await message.react('👁️');
			} catch (_e) {}
			return;
		}

		// ── Must have some content or attachments ─────────────────────────────
		if (!content && !hasAttachments) return;

		// ── Delete original message, relay to user ────────────────────────────
		// Delete first (gracefully) so the thread stays clean
		try {
			await message.delete();
		} catch (_e) {
			// No MANAGE_MESSAGES — skip deletion, still relay
		}

		await relayGuildReply(message, modmail, false, content, container, client);
	} catch (error) {
		logger.error(`handleGuildMessage failed: ${error.message || error}`, {
			label: 'modmail',
		});
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// handleUserDM
// ─────────────────────────────────────────────────────────────────────────────

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

		// ── Creation lock ─────────────────────────────────────────────────────
		if (pendingCreations.has(userId)) return;

		// ── Fast path: relay to existing open modmail ─────────────────────────
		const existingModmails = await Modmail.getAllCache({
			userId,
			status: 'open',
		});
		if (existingModmails && existingModmails.length > 0) {
			client.modmailActiveDMs.add(userId);
			await relayUserMessage(message, existingModmails[0], container);
			return;
		}

		// ── Drop if in server-picker flow ─────────────────────────────────────
		if (pendingSelections.has(userId)) return;

		// ── Reopen cooldown ───────────────────────────────────────────────────
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
					const msg = await t(fakeInteraction, 'modmail.dm.cooldown', {
						minutes: remaining,
					});
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

		// ── Find eligible guilds ──────────────────────────────────────────────
		const allConfigs = await ModmailConfig.getAllCache({});
		if (!allConfigs || allConfigs.length === 0) return;

		const eligibleConfigs = [];
		for (const cfg of allConfigs) {
			try {
				const guild = await client.guilds.fetch(cfg.guildId).catch(() => null);
				if (!guild) continue;
				const member = await guild.members.fetch(userId).catch(() => null);
				if (!member) continue;
				const blocked = Array.isArray(cfg.blockedUserIds)
					? cfg.blockedUserIds
					: [];
				if (blocked.includes(userId)) continue;
				eligibleConfigs.push({ cfg, guild });
			} catch (_e) {}
		}

		if (eligibleConfigs.length === 0) return;

		const fakeInteraction = {
			client,
			locale: kythiaConfig.bot.locale || 'en-US',
		};

		// ── Single guild → create ─────────────────────────────────────────────
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

		// ── Multiple guilds → server picker ───────────────────────────────────
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
					convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						await t(fakeInteraction, 'modmail.server_select.prompt'),
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
								await t(fakeInteraction, 'modmail.server_select.placeholder'),
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
				components: components,
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

module.exports.pendingCreations = pendingCreations;
module.exports.pendingSelections = pendingSelections;
