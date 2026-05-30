/**
 * @namespace: addons/server/helpers/template.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

// templates.js
const fs = require('node:fs');
const path = require('node:path');

const TYPE_MAP = { text: 0, voice: 2, forum: 15 }; // ChannelType enum minimal

function validateTemplate(tpl) {
	if (!tpl?.meta?.key) throw new Error('meta.key is required');
	if (!Array.isArray(tpl.roles)) tpl.roles = [];
	if (!Array.isArray(tpl.categories)) tpl.categories = [];
	// normalize type string -> number
	for (const cat of tpl.categories) {
		if (!Array.isArray(cat.channels)) {
			cat.channels = [];
			continue;
		}
		for (const ch of cat.channels) {
			if (typeof ch.type === 'string') {
				const mapped = TYPE_MAP[ch.type];
				if (mapped === undefined) throw new Error(`Unknown type: ${ch.type}`);
				ch.type = mapped;
			}
		}
	}
	return tpl;
}

function readJsonSafe(file) {
	const raw = fs.readFileSync(file, 'utf8');
	try {
		return JSON.parse(raw);
	} catch (e) {
		throw new Error(`Failed to parse ${path.basename(file)}: ${e.message}`);
	}
}

function loadTemplates(dir, embedded = {}) {
	const result = {};
	// 1) embedded (fallback)
	for (const [_k, v] of Object.entries(embedded)) {
		const val = validateTemplate(v);
		result[val.meta.key] = val;
	}
	// 2) from folder
	if (dir && fs.existsSync(dir)) {
		const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
		for (const f of files) {
			const tpl = validateTemplate(readJsonSafe(path.join(dir, f)));
			result[tpl.meta.key] = tpl; // override embedded if same key
		}
	}
	return result;
}

module.exports = { loadTemplates };
