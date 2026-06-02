/**
 * @namespace: addons/automod/helpers/antinuke.js
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

// ---------------------------------------------------------------------------
// Default config
// ---------------------------------------------------------------------------
const DEFAULT_MODULE = (threshold = 3, window = 10000, action = 'kick') => ({
	enabled: true,
	threshold,
	window,
	action,
});

const DEFAULT_CONFIG = () => ({
	enabled: false,
	modules: {
		massBan: DEFAULT_MODULE(3, 10000, 'kick'),
		massKick: DEFAULT_MODULE(3, 10000, 'kick'),
		channelCreate: DEFAULT_MODULE(3, 10000, 'kick'),
		channelDelete: DEFAULT_MODULE(3, 10000, 'kick'),
		roleDelete: DEFAULT_MODULE(3, 10000, 'kick'),
		webhookCreate: DEFAULT_MODULE(5, 10000, 'kick'),
		adminGrant: { enabled: true, action: 'kick' },
	},
	whitelistedRoles: [],
	whitelistedUsers: [],
	logChannelId: null,
});

// ---------------------------------------------------------------------------
// In-memory action tracker  { guildId → { module → { userId → { count, last } } } }
// ---------------------------------------------------------------------------
const _tracker = new Map();

function _track(guildId, moduleName, userId, windowMs) {
	if (!_tracker.has(guildId)) _tracker.set(guildId, new Map());
	const guildMap = _tracker.get(guildId);
	if (!guildMap.has(moduleName)) guildMap.set(moduleName, new Map());
	const modMap = guildMap.get(moduleName);

	const now = Date.now();
	const prev = modMap.get(userId) || { count: 0, last: 0 };
	const count = now - prev.last < windowMs ? prev.count + 1 : 1;
	modMap.set(userId, { count, last: now });
	return count;
}

function _resetCount(guildId, moduleName, userId) {
	_tracker.get(guildId)?.get(moduleName)?.set(userId, { count: 0, last: 0 });
}

// ---------------------------------------------------------------------------
// Load + parse antiNukeConfig from ServerSetting
// ---------------------------------------------------------------------------
function getConfig(setting) {
	if (!setting?.antiNukeConfig) return DEFAULT_CONFIG();
	try {
		const parsed =
			typeof setting.antiNukeConfig === 'string'
				? JSON.parse(setting.antiNukeConfig)
				: setting.antiNukeConfig;
		// Merge with defaults to fill missing modules
		const def = DEFAULT_CONFIG();
		return {
			...def,
			...parsed,
			modules: { ...def.modules, ...(parsed.modules || {}) },
		};
	} catch {
		return DEFAULT_CONFIG();
	}
}

// ---------------------------------------------------------------------------
// Check if a user/role is whitelisted
// ---------------------------------------------------------------------------
function isWhitelisted(member, config) {
	if (config.whitelistedUsers?.includes(member.id)) return true;
	for (const roleId of config.whitelistedRoles || []) {
		if (member.roles.cache.has(roleId)) return true;
	}
	return false;
}

// ---------------------------------------------------------------------------
// Execute the configured action against a member
// ---------------------------------------------------------------------------
async function executeAction(guild, member, action, reason) {
	if (!member) return false;

	switch (action) {
		case 'ban':
			if (!member.bannable) return false;
			try {
				await member.ban({ reason, deleteMessageSeconds: 0 });
				return true;
			} catch {
				return false;
			}

		case 'kick':
			if (!member.kickable) return false;
			try {
				await member.kick(reason);
				return true;
			} catch {
				return false;
			}

		case 'dehoistRole':
			// Strip ALL roles except @everyone AND managed roles
			try {
				const removable = member.roles.cache.filter(
					(r) => r.id !== guild.id && !r.managed,
				);
				if (removable.size > 0) await member.roles.remove(removable, reason);
				return true;
			} catch {
				return false;
			}

		default:
			return true; // log only
	}
}

// ---------------------------------------------------------------------------
// Send antinuke alert to the configured channel
// ---------------------------------------------------------------------------
async function sendAlert(
	guild,
	config,
	settings,
	{ moduleName, executor, action, detail },
) {
	const channelId = config.logChannelId || settings?.auditLogChannelId;
	if (!channelId) return;

	const logChannel = await guild.channels.fetch(channelId).catch(() => null);
	if (!logChannel?.isTextBased()) return;

	const actionEmoji =
		{
			ban: '🔨',
			kick: '👢',
			dehoistRole: '🎭',
			none: '👁️',
		}[action] || '⚠️';

	const components = [
		new ContainerBuilder()
			.setAccentColor(0xff4444)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`🛡️ **AntiNuke Triggered** — \`${moduleName}\`\n\n` +
						`**Executor:** ${executor.tag} (<@${executor.id}>)\n` +
						`**Action taken:** ${actionEmoji} ${action.toUpperCase()}\n` +
						(detail ? `**Detail:** ${detail}\n` : '') +
						`**Time:** <t:${Math.floor(Date.now() / 1000)}:F>`,
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`🤖 Kythia AntiNuke • Auto-protection active`,
				),
			),
	];

	await logChannel
		.send({
			components,
			flags: MessageFlags.IsComponentsV2,
			allowedMentions: { parse: [] },
		})
		.catch(() => null);
}

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

/**
 * Check a threshold-based event (massBan, channelDelete, etc.)
 *
 * @param {object} opts
 * @param {object} opts.bot
 * @param {object} opts.guild
 * @param {object} opts.executor  - Discord User object of the person who did the action
 * @param {string} opts.moduleName - e.g. 'channelDelete'
 * @param {string} [opts.detail]   - extra context for the log
 */
async function checkThreshold({ bot, guild, executor, moduleName, detail }) {
	if (!executor || executor.bot) return;

	const container = bot.client.container;
	const { ServerSetting } = container.models;
	const { logger } = container;

	try {
		const settings = await ServerSetting.getCache({ guildId: guild.id });
		const config = getConfig(settings);

		if (!config.enabled) return;

		const mod = config.modules[moduleName];
		if (!mod?.enabled) return;

		const member = await guild.members.fetch(executor.id).catch(() => null);
		if (!member) return;

		// Bot itself and whitelisted users are immune
		if (!member.user || member.user.bot) return;
		if (isWhitelisted(member, config)) return;

		const count = _track(guild.id, moduleName, executor.id, mod.window);
		if (count < mod.threshold) return;

		// Threshold exceeded — act
		_resetCount(guild.id, moduleName, executor.id);

		const reason = `[AntiNuke] ${moduleName}: ${count} actions in ${mod.window / 1000}s`;
		const actioned = await executeAction(guild, member, mod.action, reason);

		if (actioned) {
			await sendAlert(guild, config, settings, {
				moduleName,
				executor,
				action: mod.action,
				detail: detail || `${count} actions detected in ${mod.window / 1000}s`,
			});
		}
	} catch (err) {
		logger.error(
			`Error in checkThreshold (${moduleName}): ${err.message || err}`,
			{
				label: 'antinuke',
			},
		);
	}
}

/**
 * Check an instant-trigger event (adminGrant — no threshold, fires immediately).
 */
async function checkInstant({ bot, guild, executor, moduleName, detail }) {
	if (!executor || executor.bot) return;

	const container = bot.client.container;
	const { ServerSetting } = container.models;
	const { logger } = container;

	try {
		const settings = await ServerSetting.getCache({ guildId: guild.id });
		const config = getConfig(settings);

		if (!config.enabled) return;

		const mod = config.modules[moduleName];
		if (!mod?.enabled) return;

		const member = await guild.members.fetch(executor.id).catch(() => null);
		if (!member) return;
		if (!member.user || member.user.bot) return;
		if (isWhitelisted(member, config)) return;

		const reason = `[AntiNuke] ${moduleName}: unauthorized action`;
		const actioned = await executeAction(guild, member, mod.action, reason);

		if (actioned) {
			await sendAlert(guild, config, settings, {
				moduleName,
				executor,
				action: mod.action,
				detail,
			});
		}
	} catch (err) {
		logger.error(
			`Error in checkInstant (${moduleName}): ${err.message || err}`,
			{
				label: 'antinuke',
			},
		);
	}
}

/**
 * Get the config (parsed) for a guild. Used by settings command.
 */
function getAntiNukeConfig(setting) {
	return getConfig(setting);
}

/**
 * Serialize config back to JSON string for saving.
 */
function serializeConfig(config) {
	return JSON.stringify(config);
}

module.exports = {
	checkThreshold,
	checkInstant,
	getAntiNukeConfig,
	serializeConfig,
	DEFAULT_CONFIG,
};
