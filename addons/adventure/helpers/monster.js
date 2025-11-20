/**
 * @namespace: addons/adventure/helpers/monster.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const MONSTERS = [
    // Level 1-2 (increased HP and strength)
    { name: 'Wild Dog', hp: 42, strength: 12, goldDrop: 16, xpDrop: 13, minLevel: 2, maxLevel: 3 },
    { name: 'Rat', hp: 30, strength: 7, goldDrop: 10, xpDrop: 8, minLevel: 1, maxLevel: 2 },
    { name: 'Bat', hp: 28, strength: 6, goldDrop: 9, xpDrop: 7, minLevel: 1, maxLevel: 2 },
    { name: 'Slime', hp: 25, strength: 5, goldDrop: 7, xpDrop: 5, minLevel: 1, maxLevel: 2 },
    { name: 'Goblin', hp: 38, strength: 10, goldDrop: 14, xpDrop: 12, minLevel: 2, maxLevel: 3 },

    // Level 3-4 (increased HP and strength)
    { name: 'Orc', hp: 160, strength: 25, goldDrop: 40, xpDrop: 35, minLevel: 3, maxLevel: 4 },
    { name: 'Giant Spider', hp: 140, strength: 22, goldDrop: 35, xpDrop: 32, minLevel: 3, maxLevel: 4 },
    { name: 'Skeleton', hp: 120, strength: 20, goldDrop: 32, xpDrop: 28, minLevel: 3, maxLevel: 4 },
    { name: 'Zombie', hp: 150, strength: 24, goldDrop: 38, xpDrop: 31, minLevel: 3, maxLevel: 4 },
    { name: 'Bandit', hp: 130, strength: 27, goldDrop: 45, xpDrop: 34, minLevel: 4, maxLevel: 5 },

    // Level 5-6 (increased HP and strength)
    { name: 'Wyvern', hp: 400, strength: 70, goldDrop: 110, xpDrop: 100, minLevel: 5, maxLevel: 6 },
    { name: 'Vampire', hp: 220, strength: 45, goldDrop: 60, xpDrop: 55, minLevel: 5, maxLevel: 6 },
    { name: 'Troll', hp: 320, strength: 55, goldDrop: 90, xpDrop: 75, minLevel: 5, maxLevel: 6 },
    { name: 'Werewolf', hp: 260, strength: 50, goldDrop: 80, xpDrop: 65, minLevel: 5, maxLevel: 6 },
    { name: 'Dark Mage', hp: 200, strength: 65, goldDrop: 100, xpDrop: 90, minLevel: 6, maxLevel: 7 },

    // Level 7-8 (increased HP and strength)
    { name: 'Behemoth', hp: 700, strength: 120, goldDrop: 250, xpDrop: 200, minLevel: 7, maxLevel: 8 },
    { name: 'Phoenix', hp: 600, strength: 110, goldDrop: 230, xpDrop: 180, minLevel: 7, maxLevel: 8 },
    { name: 'Hydra', hp: 550, strength: 105, goldDrop: 220, xpDrop: 170, minLevel: 7, maxLevel: 8 },
    { name: 'Lich King', hp: 520, strength: 130, goldDrop: 270, xpDrop: 220, minLevel: 8, maxLevel: 9 },
    { name: 'Ancient Golem', hp: 650, strength: 120, goldDrop: 240, xpDrop: 190, minLevel: 8, maxLevel: 9 },

    // Level 9-10+ (increased HP and strength)
    { name: 'Dragon', hp: 900, strength: 170, goldDrop: 350, xpDrop: 320, minLevel: 9, maxLevel: 99 },
    { name: 'Demon Lord', hp: 1100, strength: 210, goldDrop: 420, xpDrop: 400, minLevel: 10, maxLevel: 99 },
    { name: 'Celestial Serpent', hp: 1000, strength: 190, goldDrop: 390, xpDrop: 360, minLevel: 10, maxLevel: 99 },
    { name: 'Shadow Reaper', hp: 880, strength: 180, goldDrop: 360, xpDrop: 300, minLevel: 9, maxLevel: 99 },
    { name: 'Titan', hp: 1400, strength: 240, goldDrop: 500, xpDrop: 480, minLevel: 12, maxLevel: 99 },
];

function getRandomMonster(level) {
    const available = MONSTERS.filter((m) => level >= m.minLevel && level <= m.maxLevel);
    if (available.length === 0) {
        return MONSTERS[Math.floor(Math.random() * MONSTERS.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
}

module.exports = {
    getRandomMonster,
};
