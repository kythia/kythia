/**
 * @namespace: addons/verification/helpers/verify.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	MessageFlags,
} = require('discord.js');
const { generateMathCaptcha } = require('./captchaMath');
const { generateEmojiCaptcha } = require('./captchaEmoji');
const { generateImageCaptcha } = require('./captchaImage');
const { createSession, clearSession } = require('./session');

// ---------------------------------------------------------------------------
// Send log
// ---------------------------------------------------------------------------
async function sendLog(guild, config, text) {
	if (!config.logChannelId) return;
	const ch = await guild.client.container.helpers.discord.getChannelSafe(
		guild,
		config.logChannelId,
	);
	if (ch?.isTextBased()) {
		try {
			const { simpleContainer } = require('kythia-core').helpers.discord;
			const comps = await simpleContainer(ch, text, {
				color: 'Green',
			});
			await ch
				.send({
					components: comps,
					flags: 1 << 16,
				})
				.catch(() => null);
		} catch {
			await ch.send(text).catch(() => null);
		}
	}
}

// ---------------------------------------------------------------------------
// Build the captcha message payload based on type
// ---------------------------------------------------------------------------
function buildCaptchaPayload(member, config) {
	const { captchaType } = config;
	const userId = member.id;
	const header = new ContainerBuilder()
		.setAccentColor(0x5865f2)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## 🛡️ Server Verification\n\n` +
					`Welcome to **${member.guild.name}**!\n` +
					`Please complete the captcha below to get access.\n\n` +
					`You have **${config.maxAttempts}** attempt(s) and **${config.timeoutSeconds}s** to complete this.\n`,
			),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);
	if (captchaType === 'math') {
		const { question, rows } = generateMathCaptcha(userId, member.guild.id);
		header.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`🔢 **Math Challenge**\n\n${question}\n\n*Click the correct answer:*`,
			),
		);
		return {
			components: [header, ...rows],
			flags: MessageFlags.IsComponentsV2,
			answer: null, // button-based
		};
	}
	if (captchaType === 'emoji') {
		const { prompt, rows } = generateEmojiCaptcha(userId, member.guild.id);
		header.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`😀 **Emoji Challenge**\n\n${prompt}`,
			),
		);
		return {
			components: [header, ...rows],
			flags: MessageFlags.IsComponentsV2,
			answer: null, // button-based
		};
	}

	// image
	const { code, attachment } = generateImageCaptcha();
	header.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			`🖼️ **Image Captcha**\n\nType the text shown in the image below.\n*(Case-insensitive, no spaces)*`,
		),
	);
	return {
		components: [header],
		flags: MessageFlags.IsComponentsV2,
		files: [attachment],
		answer: code,
	};
}

// ---------------------------------------------------------------------------
// sendCaptcha — dispatch the challenge to channel or DM
// ---------------------------------------------------------------------------
async function sendCaptcha(member, config, interaction = null) {
	const guild = member.guild;

	// Assign unverified role if configured
	if (config.unverifiedRoleId) {
		const role = await guild.client.container.helpers.discord.getRoleSafe(
			guild,
			config.unverifiedRoleId,
		);
		if (role) await member.roles.add(role).catch(() => null);
	}
	const payload = await buildCaptchaPayload(member, config);
	let sentMessage = null;
	let sentChannel = null;
	if (interaction) {
		payload.ephemeral = true;
		if (interaction.deferred || interaction.replied) {
			sentMessage = await interaction
				.followUp({
					...payload,
					fetchReply: true,
				})
				.catch(() => null);
		} else {
			sentMessage = await interaction
				.reply({
					...payload,
					fetchReply: true,
				})
				.catch(() => null);
		}
		if (sentMessage) sentChannel = interaction.channel;
	} else {
		// Try channel first (for non-interaction commands like /verify reset)
		if (config.channelId) {
			const ch =
				await interaction.client.container.helpers.discord.getChannelSafe(
					guild,
					config.channelId,
				);
			if (ch?.isTextBased()) {
				const msg = await ch.send(payload).catch(() => null);
				if (msg) {
					sentMessage = msg;
					sentChannel = ch;
				}
			}
		}

		// Fallback to DM
		if (!sentMessage && config.dmFallback) {
			const dm = await member.createDM().catch(() => null);
			if (dm) {
				const msg = await dm.send(payload).catch(() => null);
				if (msg) {
					sentMessage = msg;
					sentChannel = dm;
				}
			}
		}
	}
	if (!sentMessage) return; // Can't reach member

	// Register session
	createSession({
		guildId: guild.id,
		userId: member.id,
		answer: payload.answer,
		// null for button-based
		channelId: sentChannel.id,
		messageId: sentMessage.id,
		timeoutMs: config.timeoutSeconds * 1000,
		onTimeout: () => handleTimeout(guild, member.id, config),
	});
}

// ---------------------------------------------------------------------------
// handleSuccess — assign verified role, remove unverified, log, welcome dm
// ---------------------------------------------------------------------------
async function handleSuccess(member, config) {
	const guild = member.guild;
	clearSession(guild.id, member.id);

	// Assign verified role
	if (config.verifiedRoleId) {
		const role = await guild.client.container.helpers.discord.getRoleSafe(
			guild,
			config.verifiedRoleId,
		);
		if (role) await member.roles.add(role).catch(() => null);
	}

	// Remove unverified role
	if (config.unverifiedRoleId) {
		const role = await guild.client.container.helpers.discord.getRoleSafe(
			guild,
			config.unverifiedRoleId,
		);
		if (role) await member.roles.remove(role).catch(() => null);
	}
	await sendLog(
		guild,
		config,
		`✅ **Verified:** ${member.user.tag} (<@${member.id}>) passed captcha verification.`,
	);

	// Welcome DM
	if (config.welcomeMessage) {
		const dm = await member.createDM().catch(() => null);
		if (dm) {
			await dm
				.send({
					content: config.welcomeMessage,
					allowedMentions: {
						parse: [],
					},
				})
				.catch(() => null);
		}
	}
}

// ---------------------------------------------------------------------------
// handleFail — decrement, re-prompt or kick
// ---------------------------------------------------------------------------
async function handleFail(member, config, attempts, sendRetry) {
	const guild = member.guild;
	const remaining = config.maxAttempts - attempts;
	if (remaining <= 0) {
		clearSession(guild.id, member.id);
		await sendLog(
			guild,
			config,
			`❌ **Failed:** ${member.user.tag} (<@${member.id}>) exceeded max attempts (${config.maxAttempts}). ${config.kickOnFail ? 'Kicked.' : 'Not kicked.'}`,
		);
		if (config.kickOnFail && member.kickable) {
			await member.kick('Failed captcha verification').catch(() => null);
		}
		return false;
	}

	// Re-send a fresh captcha for button-based; text-based just reply
	if (typeof sendRetry === 'function') await sendRetry(remaining);
	return true;
}

// ---------------------------------------------------------------------------
// handleTimeout — called by session timer
// ---------------------------------------------------------------------------
async function handleTimeout(guild, userId, config) {
	const member = await guild.client.container.helpers.discord.getMemberSafe(
		guild,
		userId,
	);
	await sendLog(
		guild,
		config,
		`⏰ **Timeout:** <@${userId}> did not complete verification in time. ${config.kickOnTimeout ? 'Kicked.' : 'Not kicked.'}`,
	);
	if (config.kickOnTimeout && member?.kickable) {
		await member.kick('Captcha verification timed out').catch(() => null);
	}
}
module.exports = {
	sendCaptcha,
	handleSuccess,
	handleFail,
	handleTimeout,
	buildCaptchaPayload,
};
