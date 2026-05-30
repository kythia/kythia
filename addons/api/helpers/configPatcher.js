/**
 * @namespace: addons/api/helpers/configPatcher.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

/**
 * @file addons/api/helpers/configPatcher.js
 * @description Safely patches live .env and kythia.config.js files via API.
 */

const fs = require('node:fs');
const path = require('node:path');

// ── Regex Helpers ────────────────────────────────────────────────────────────

function setEnvKey(content, key, value) {
	if (value === undefined || value === null) return content;
	const escaped = String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
	const re = new RegExp(`^(${key}=)("?)[^"\\n]*\\2([^\\n]*)`, 'm');
	if (re.test(content)) {
		return content.replace(re, `$1"${escaped}"$3`);
	}
	return `${content}\n${key}="${escaped}"`;
}

function setJsStringKey(content, key, newValue) {
	if (newValue === undefined || newValue === null) return content;
	const re = new RegExp(
		`(\\b${key}:\\s*)('(?:[^'\\\\]|\\\\.)*'|"(?:[^"\\\\]|\\\\.)*"|true|false|\\d+)`,
		'',
	);
	const replacement =
		typeof newValue === 'string'
			? `$1'${newValue.replace(/'/g, "\\'")}'`
			: `$1${newValue}`;
	return content.replace(re, replacement);
}

function setJsBool(content, key, bool) {
	if (bool === undefined || bool === null) return content;
	const re = new RegExp(`(\\b${key}:\\s*)(true|false)`);
	return content.replace(re, `$1${bool}`);
}

function setJsArray(content, key, items) {
	if (!items) return content;
	const re = new RegExp(`(\\b${key}:\\s*)\\[[^\\]]*\\]`);
	const arr = `[${items.map((i) => `'${i.replace(/'/g, "\\'")}'`).join(', ')}]`;
	return content.replace(re, `$1${arr}`);
}

// ── Patching Functions ───────────────────────────────────────────────────────

function patchEnv(payload, currentEnvStr) {
	let env = currentEnvStr;
	const { license = {}, bot = {}, db = {}, redis = {} } = payload;

	if (license.licenseKey !== undefined)
		env = setEnvKey(env, 'LICENSE_KEY', license.licenseKey);
	if (bot.token !== undefined)
		env = setEnvKey(env, 'DISCORD_BOT_TOKEN', bot.token);
	if (bot.clientId !== undefined)
		env = setEnvKey(env, 'DISCORD_BOT_CLIENT_ID', bot.clientId);
	if (bot.clientSecret !== undefined)
		env = setEnvKey(env, 'DISCORD_BOT_CLIENT_SECRET', bot.clientSecret);

	if (db.driver !== undefined) env = setEnvKey(env, 'DB_DRIVER', db.driver);
	if (db.dbHost !== undefined) env = setEnvKey(env, 'DB_HOST', db.dbHost);
	if (db.dbPort !== undefined) env = setEnvKey(env, 'DB_PORT', db.dbPort);
	if (db.dbName !== undefined) env = setEnvKey(env, 'DB_NAME', db.dbName);
	if (db.dbUser !== undefined) env = setEnvKey(env, 'DB_USER', db.dbUser);
	if (db.dbPass !== undefined) env = setEnvKey(env, 'DB_PASSWORD', db.dbPass);

	if (redis.redisUrls !== undefined)
		env = setEnvKey(env, 'REDIS_URLS', redis.redisUrls);

	return env;
}

function patchConfig(payload, currentConfigStr) {
	let cfg = currentConfigStr;
	const { license = {}, bot = {}, redis = {}, addons = {} } = payload;

	if (license.acceptTOS !== undefined)
		cfg = setJsBool(cfg, 'acceptTOS', license.acceptTOS);
	if (license.dataCollection !== undefined)
		cfg = setJsBool(cfg, 'dataCollection', license.dataCollection);

	if (bot.ownerIds !== undefined)
		cfg = setJsStringKey(cfg, 'ids', bot.ownerIds);
	if (bot.ownerNames !== undefined)
		cfg = setJsStringKey(cfg, 'names', bot.ownerNames);
	if (bot.botName !== undefined) cfg = setJsStringKey(cfg, 'name', bot.botName);
	if (bot.color !== undefined) cfg = setJsStringKey(cfg, 'color', bot.color);
	if (bot.status !== undefined) cfg = setJsStringKey(cfg, 'status', bot.status);
	if (bot.activityType !== undefined)
		cfg = setJsStringKey(cfg, 'activityType', bot.activityType);
	if (bot.activity !== undefined)
		cfg = setJsStringKey(cfg, 'activity', bot.activity);
	if (bot.timezone !== undefined)
		cfg = setJsStringKey(cfg, 'timezone', bot.timezone);

	if (bot.prefixes !== undefined) {
		const prefixList = bot.prefixes
			.split(',')
			.map((p) => p.trim())
			.filter(Boolean);
		cfg = setJsArray(cfg, 'prefixes', prefixList);
	}

	if (redis.useRedis !== undefined)
		cfg = setJsBool(cfg, 'useRedis', redis.useRedis);

	const addonMap = {
		activity: 'activity',
		adventure: 'adventure',
		ai: 'ai',
		api: 'api',
		automod: 'automod',
		autoreact: 'autoreact',
		autoreply: 'autoreply',
		birthday: 'birthday',
		booster: 'booster',
		checklist: 'checklist',
		economy: 'economy',
		'embed-builder': 'embedBuilder',
		fun: 'fun',
		giveaway: 'giveaway',
		globalchat: 'globalchat',
		globalvoice: 'globalvoice',
		image: 'image',
		invite: 'invite',
		leveling: 'leveling',
		minecraft: 'minecraft',
		modmail: 'modmail',
		music: 'music',
		nsfw: 'nsfw',
		pet: 'pet',
		pro: 'pro',
		quest: 'quest',
		'reaction-role': 'reactionRole',
		server: 'server',
		'social-alerts': 'socialAlerts',
		streak: 'streak',
		tempvoice: 'tempvoice',
		ticket: 'ticket',
		verification: 'verification',
		welcomer: 'welcomer',
	};

	for (const [rawName, camelName] of Object.entries(addonMap)) {
		const result = addons[rawName] ?? addons[camelName];
		if (result && result.enabled !== undefined) {
			const addonKeyRe = new RegExp(
				`(\\b${camelName}:\\s*\\{[^}]*?active:\\s*)(true|false)`,
				's',
			);
			cfg = cfg.replace(addonKeyRe, `$1${result.enabled}`);
		}
	}

	return cfg;
}

function writePatchedFiles(payload) {
	const root = process.cwd();
	const envPath = path.join(root, '.env');
	const configPath = path.join(root, 'kythia.config.js');

	const envBackup = `${envPath}.backup`;
	const configBackup = `${configPath}.backup`;

	if (!fs.existsSync(envPath) || !fs.existsSync(configPath)) {
		throw new Error('Config files not found. Setup must be completed first.');
	}

	const currentEnv = fs.readFileSync(envPath, 'utf8');
	const currentConfig = fs.readFileSync(configPath, 'utf8');

	const newEnv = patchEnv(payload, currentEnv);
	const newConfig = patchConfig(payload, currentConfig);

	fs.copyFileSync(envPath, envBackup);
	fs.copyFileSync(configPath, configBackup);

	fs.writeFileSync(envPath, newEnv, 'utf8');
	fs.writeFileSync(configPath, newConfig, 'utf8');

	return { envPath, configPath, envBackup, configBackup };
}

module.exports = { patchEnv, patchConfig, writePatchedFiles };
