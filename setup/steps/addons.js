/**
 * @file setup/steps/addons.js
 * @description Setup Step 5 - Dynamic addon scanner
 * Scans /addons directory, shows enable/disable toggles for each,
 * then for enabled addons that have a setup/steps/addons/<name>.js, runs it.
 * @copyright © 2026 kenndeclouv
 */

/** biome-ignore-all lint/suspicious/noConsole: not the bot log, ignore console warn */

const fs = require('node:fs');
const path = require('node:path');
const { confirm, header, hint, warn } = require('../prompt');

// Addons that are always required — never show as a toggle
const ALWAYS_ON = new Set(['core', 'license']);

// Human-readable labels for known addons
const ADDON_LABELS = {
	activity: 'Activity Tracker',
	adventure: 'Adventure / RPG',
	ai: 'AI Chat (Google Gemini)',
	api: 'Dashboard & API',
	automod: 'Auto Moderation',
	autoreact: 'Auto React',
	autoreply: 'Auto Reply',
	birthday: 'Birthday Tracker',
	booster: 'Boost Banner',
	checklist: 'Checklist',
	economy: 'Economy System',
	'embed-builder': 'Embed Builder',
	fun: 'Fun Commands',
	giveaway: 'Giveaway',
	globalchat: 'Global Chat (internal only)',
	globalvoice: 'Global Voice (internal only)',
	image: 'Image Storage (needs Cloudflare R2)',
	invite: 'Invite Tracker',
	leveling: 'Leveling / XP',
	minecraft: 'Minecraft Stats',
	modmail: 'Modmail',
	music: 'Music Player (Lavalink)',
	nsfw: 'NSFW Content (18+)',
	pet: 'Virtual Pets',
	pro: 'Pro (Custom Subdomains)',
	quest: 'Discord Quest Notifier (internal)',
	'reaction-role': 'Reaction Roles',
	server: 'Server Backup',
	'server-stats': 'Server Stats Channels',
	'social-alerts': 'Social Alerts (YouTube / TikTok)',
	streak: 'Streak System',
	tempvoice: 'Temp Voice Channels',
	ticket: 'Ticket System',
	verification: 'Verification System',
	welcomer: 'Welcomer / Farewell',
};

// Addons that default to disabled
const DEFAULT_OFF = new Set([
	'nsfw',
	'globalchat',
	'globalvoice',
	'pro',
	'quest',
	'image',
	'embed-builder',
]);

module.exports = async (totalSteps = 6) => {
	header(`Step 5 / ${totalSteps}`, '⚙️  Addons');

	// ── Scan /addons directory ──────────────────────────────────────────────
	const addonsDir = path.join(__dirname, '../../addons');
	let discovered = [];
	try {
		discovered = fs
			.readdirSync(addonsDir)
			.filter((name) => {
				const addonPath = path.join(addonsDir, name);
				return fs.statSync(addonPath).isDirectory() && !ALWAYS_ON.has(name);
			})
			.sort();
	} catch {
		warn('Could not scan /addons directory. Skipping addon configuration.');
		return {};
	}

	hint(`Found ${pc.bold(discovered.length)} configurable addons.`);
	console.log('');

	// ── Pass 1: enable/disable toggles ─────────────────────────────────────
	const results = {};
	for (const addonName of discovered) {
		const label = ADDON_LABELS[addonName] || addonName;
		const defaultEnabled = !DEFAULT_OFF.has(addonName);
		results[addonName] = {
			enabled: await confirm(`Enable ${label}?`, defaultEnabled),
		};
	}

	// ── Pass 2: per-addon deeper config ────────────────────────────────────
	const stepsDir = path.join(__dirname, 'addons');
	for (const addonName of discovered) {
		if (!results[addonName].enabled) continue;

		const stepFile = path.join(stepsDir, `${addonName}.js`);
		if (!fs.existsSync(stepFile)) continue;

		try {
			const addonStep = require(stepFile);
			const addonConfig = await addonStep(addonName);
			results[addonName] = { ...results[addonName], ...addonConfig };
		} catch (e) {
			warn(`Could not load addon config step for "${addonName}": ${e.message}`);
		}
	}

	return results;
};

// picocolors is used inline above — require here so it's available
const pc = require('picocolors');
