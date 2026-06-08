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
	const { licenseKey, bot = {}, db = {} } = payload;

	if (licenseKey !== undefined) env = setEnvKey(env, 'LICENSE_KEY', licenseKey);
	if (bot.token !== undefined)
		env = setEnvKey(env, 'DISCORD_BOT_TOKEN', bot.token);
	if (bot.clientId !== undefined)
		env = setEnvKey(env, 'DISCORD_BOT_CLIENT_ID', bot.clientId);
	if (bot.clientSecret !== undefined)
		env = setEnvKey(env, 'DISCORD_BOT_CLIENT_SECRET', bot.clientSecret);

	if (db.driver !== undefined) env = setEnvKey(env, 'DB_DRIVER', db.driver);
	if (db.host !== undefined) env = setEnvKey(env, 'DB_HOST', db.host);
	if (db.port !== undefined) env = setEnvKey(env, 'DB_PORT', db.port);
	if (db.name !== undefined) env = setEnvKey(env, 'DB_NAME', db.name);
	if (db.user !== undefined) env = setEnvKey(env, 'DB_USER', db.user);
	if (db.pass !== undefined) env = setEnvKey(env, 'DB_PASSWORD', db.pass);
	if (db.redis !== undefined) env = setEnvKey(env, 'REDIS_URLS', db.redis);

	return env;
}

function isObject(item) {
	return item && typeof item === 'object' && !Array.isArray(item);
}

function mergeDeep(target, ...sources) {
	if (!sources.length) return target;
	const source = sources.shift();

	if (isObject(target) && isObject(source)) {
		for (const key in source) {
			if (isObject(source[key])) {
				if (!target[key]) Object.assign(target, { [key]: {} });
				mergeDeep(target[key], source[key]);
			} else {
				Object.assign(target, { [key]: source[key] });
			}
		}
	}

	return mergeDeep(target, ...sources);
}

function writePatchedFiles(payload) {
	const root = process.cwd();
	const envPath = path.join(root, '.env');
	const dynamicPath = path.join(root, 'kythia.dynamic.json');

	const envBackup = `${envPath}.backup`;

	if (!fs.existsSync(envPath)) {
		throw new Error('Config files not found. Setup must be completed first.');
	}

	const currentEnv = fs.readFileSync(envPath, 'utf8');
	const newEnv = patchEnv(payload, currentEnv);

	fs.copyFileSync(envPath, envBackup);
	fs.writeFileSync(envPath, newEnv, 'utf8');

	let dynamicConfig = {};
	if (fs.existsSync(dynamicPath)) {
		try {
			dynamicConfig = JSON.parse(fs.readFileSync(dynamicPath, 'utf8'));
		} catch (e) {
			console.error('Failed to parse kythia.dynamic.json', e);
		}
	}

	// Remove fields from payload that are specifically tracked in .env to prevent duplicates
	const cleanPayload = JSON.parse(JSON.stringify(payload));
	delete cleanPayload.licenseKey;
	if (cleanPayload.bot) {
		delete cleanPayload.bot.token;
		delete cleanPayload.bot.clientId;
		delete cleanPayload.bot.clientSecret;
	}
	if (cleanPayload.db) {
		delete cleanPayload.db.driver;
		delete cleanPayload.db.host;
		delete cleanPayload.db.port;
		delete cleanPayload.db.name;
		delete cleanPayload.db.user;
		delete cleanPayload.db.pass;
		delete cleanPayload.db.redis;
	}

	const newDynamicConfig = mergeDeep(dynamicConfig, cleanPayload);
	fs.writeFileSync(
		dynamicPath,
		JSON.stringify(newDynamicConfig, null, 4),
		'utf8',
	);

	return { envPath, configPath: dynamicPath, envBackup, configBackup: '' };
}

module.exports = { patchEnv, writePatchedFiles };
