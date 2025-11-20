/**
 * @namespace: addons/adventure/helpers/characters.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const CHARACTERS = {
    shadow_blade: {
        id: 'shadow_blade',
        name: 'Elara',
        emoji: '🗡️',
        description: 'Glass cannon assassin. High damage, low defense.',
        strengthBonus: 7,
        defenseBonus: -2,
        hpBonusPercent: 0,
        goldBonusPercent: 0,
        xpBonusPercent: 5,
    },

    iron_guardian: {
        id: 'iron_guardian',
        name: 'Kaelen',
        emoji: '🛡️',
        description: 'Immovable sentinel. High defense and survivability.',
        strengthBonus: 0,
        defenseBonus: 8,
        hpBonusPercent: 15,
        goldBonusPercent: 0,
        xpBonusPercent: 0,
    },

    stormcaller: {
        id: 'stormcaller',
        name: 'Lyra',
        emoji: '⚡',
        description: 'Elemental adept. Balanced power with extra experience.',
        strengthBonus: 3,
        defenseBonus: 2,
        hpBonusPercent: 5,
        goldBonusPercent: 0,
        xpBonusPercent: 10,
    },

    gilded_ranger: {
        id: 'gilded_ranger',
        name: 'Arion',
        emoji: '🏹',
        description: 'Treasure seeker. Earns extra gold from victories.',
        strengthBonus: 2,
        defenseBonus: 2,
        hpBonusPercent: 0,
        goldBonusPercent: 20,
        xpBonusPercent: 0,
    },

    aurora_monk: {
        id: 'aurora_monk',
        name: 'Sora',
        emoji: '🧘',
        description: 'Disciplined fighter. Extra HP and steady growth.',
        strengthBonus: 2,
        defenseBonus: 3,
        hpBonusPercent: 10,
        goldBonusPercent: 5,
        xpBonusPercent: 5,
    },
};

module.exports = {
    getChar(charId) {
        return CHARACTERS[charId] || CHARACTERS['aurora_monk'];
    },
    getAllCharacters() {
        return Object.values(CHARACTERS);
    },
};
