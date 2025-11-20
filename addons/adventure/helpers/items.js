/**
 * @namespace: addons/adventure/helpers/items.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const items = {
    equipment: [
        {
            id: 'shield',
            emoji: '🛡️',
            nameKey: 'adventure.shop.items.shield.name',
            descKey: 'adventure.shop.items.shield.desc',
            price: 10,
            buyable: true,
            sellPrice: 5,
            type: 'equipment',
            stats: {
                defense: 5,
            },
        },
        {
            id: 'sword',
            emoji: '⚔️',
            nameKey: 'adventure.shop.items.sword.name',
            descKey: 'adventure.shop.items.sword.desc',
            price: 15,
            buyable: true,
            sellPrice: 8,
            type: 'equipment',
            stats: {
                attack: 7,
            },
        },
        {
            id: 'armor',
            emoji: '🥋',
            nameKey: 'adventure.shop.items.armor.name',
            descKey: 'adventure.shop.items.armor.desc',
            price: 30,
            buyable: true,
            sellPrice: 15,
            type: 'equipment',
            stats: {
                defense: 10,
                health: 20,
            },
        },
    ],
    consumables: [
        {
            id: 'revival',
            emoji: '🍶',
            nameKey: 'adventure.shop.items.revival.name',
            descKey: 'adventure.shop.items.revival.desc',
            price: 35,
            buyable: true,
            sellPrice: 15,
            type: 'consumable',
            effect: 'revive',
            uses: 1,
        },
        {
            id: 'health_potion',
            emoji: '❤️',
            nameKey: 'adventure.shop.items.health.potion.name',
            descKey: 'adventure.shop.items.health.potion.desc',
            price: 20,
            buyable: true,
            sellPrice: 8,
            type: 'consumable',
            effect: 'heal',
            amount: 50,
            uses: 1,
        },
    ],
};
/**
 * Retrieves the item definition object from its display name (as stored in inventory).
 * Supports both equipment and consumables.
 * @param {string} itemName - The display name of the item (may include emoji).
 * @returns {object|null} Item object if found, else null.
 */
function getItem(itemName) {
    const categories = ['equipment', 'consumables'];
    for (const cat of categories) {
        for (const item of items[cat]) {
            const localizedName = item.emoji + ' ' + getLocalizedItemName(item);
            if (itemName === localizedName || itemName === getLocalizedItemName(item)) {
                return {
                    ...item,
                    name: localizedName,
                    description: getLocalizedItemDesc(item),
                };
            }
        }
    }
    return null;
}

/**
 * Helper to get the localized item name.
 * Replace this with translation lookup as needed.
 */
function getLocalizedItemName(item) {
    if (item.nameKey) {
        return item.emoji + ' ' + item.id.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    }
    return item.emoji + ' ' + item.id;
}

/**
 * Helper to get the localized item description.
 * Replace this with translation lookup as needed.
 */
function getLocalizedItemDesc(item) {
    if (item.descKey) {
        return 'No description.';
    }
    return '';
}

module.exports = {
    items,
    getItem,
};
