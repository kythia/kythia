/**
 * @namespace: addons/checklist/helpers/index.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const Checklist = require('../database/models/Checklist');
const convertColor = require('kythia-core').utils.color;
/**
 * Helper: Get checklist (with cache) and parse items array safely.
 */
async function getChecklistAndItems({ guildId, userId, createIfNotExist = false }) {
    let checklist;
    if (createIfNotExist) {
        [checklist] = await Checklist.findOrCreateWithCache({
            where: { guildId, userId },
            defaults: { items: '[]' },
        });
    } else {
        checklist = await Checklist.getCache({ guildId, userId });
    }
    let items = [];
    if (checklist) {
        try {
            if (Array.isArray(checklist.items)) {
                items = checklist.items;
            } else if (typeof checklist.items === 'string') {
                items = JSON.parse(checklist.items);
            } else if (typeof checklist.items === 'object' && checklist.items !== null) {
                items = checklist.items;
            }
        } catch (e) {
            items = [];
        }
    }
    if (!Array.isArray(items)) items = [];
    return { checklist, items };
}

/**
 * Helper: Get scope key, color, and ephemeral flag based on userId/group.
 */
function getScopeMeta(userId, group, items = null) {
    const isPersonal = !!userId;
    return {
        scopeKey: isPersonal ? 'checklist.scope.personal' : 'checklist.scope.server',
        color: isPersonal
            ? items && items.checked !== undefined
                ? items.checked
                    ? convertColor('Green', { from: 'discord', to: 'decimal' })
                    : convertColor('Yellow', { from: 'discord', to: 'decimal' })
                : convertColor('Blue', { from: 'discord', to: 'decimal' })
            : convertColor('Green', { from: 'discord', to: 'decimal' }),
        colorName: isPersonal ? 'Blue' : 'Green',
        ephemeral: group === 'personal',
    };
}

/**
 * Helper: Reply with embed (catch error if already replied).
 */
async function safeReply(interaction, options) {
    try {
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(options);
        } else {
            await interaction.reply(options);
        }
    } catch (e) {
        // fallback: ignore
    }
}

module.exports = {
    getChecklistAndItems,
    getScopeMeta,
    safeReply,
};
