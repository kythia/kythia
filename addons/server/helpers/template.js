/**
 * @namespace: addons/server/helpers/template.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

// templates.js
const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

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
    for (const [k, v] of Object.entries(embedded)) {
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

function buildEmbeds(embedArray = []) {
    const embeds = [];
    for (const e of embedArray) {
        const embed = new EmbedBuilder();
        if (e.title) embed.setTitle(e.title);
        if (e.description) embed.setDescription(e.description);
        if (e.color) embed.setColor(e.color);
        if (e.footer) embed.setFooter(typeof e.footer === 'string' ? { text: e.footer } : e.footer);
        if (e.thumbnail?.url) embed.setThumbnail(e.thumbnail.url);
        if (e.image?.url) embed.setImage(e.image.url);
        if (e.fields) embed.setFields(e.fields);

        embeds.push(embed);
    }
    return embeds;
}

module.exports = { loadTemplates, buildEmbeds };
