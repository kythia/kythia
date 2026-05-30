/**
 * @namespace: addons/adventure/helpers/characters.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const CHARACTERS = {
	shadow_blade: {
		id: 'shadow_blade',
		name: 'Elara',
		nameKey: 'adventure.characters.shadow_blade.name',
		emoji: '🗡️',
		description: 'Glass cannon assassin. High damage, low defense.',
		descKey: 'adventure.characters.shadow_blade.desc',
		strengthBonus: 7,
		defenseBonus: -2,
		hpBonusPercent: 0,
		goldBonusPercent: 0,
		xpBonusPercent: 5,
	},

	iron_guardian: {
		id: 'iron_guardian',
		name: 'Kaelen',
		nameKey: 'adventure.characters.iron_guardian.name',
		emoji: '🛡️',
		description: 'Immovable sentinel. High defense and survivability.',
		descKey: 'adventure.characters.iron_guardian.desc',
		strengthBonus: 0,
		defenseBonus: 8,
		hpBonusPercent: 15,
		goldBonusPercent: 0,
		xpBonusPercent: 0,
	},

	stormcaller: {
		id: 'stormcaller',
		name: 'Lyra',
		nameKey: 'adventure.characters.stormcaller.name',
		emoji: '⚡',
		description: 'Elemental adept. Balanced power with extra experience.',
		descKey: 'adventure.characters.stormcaller.desc',
		strengthBonus: 3,
		defenseBonus: 2,
		hpBonusPercent: 5,
		goldBonusPercent: 0,
		xpBonusPercent: 10,
	},

	gilded_ranger: {
		id: 'gilded_ranger',
		name: 'Arion',
		nameKey: 'adventure.characters.gilded_ranger.name',
		emoji: '🏹',
		description: 'Treasure seeker. Earns extra gold from victories.',
		descKey: 'adventure.characters.gilded_ranger.desc',
		strengthBonus: 2,
		defenseBonus: 2,
		hpBonusPercent: 0,
		goldBonusPercent: 20,
		xpBonusPercent: 0,
	},

	aurora_monk: {
		id: 'aurora_monk',
		name: 'Sora',
		nameKey: 'adventure.characters.aurora_monk.name',
		emoji: '🧘',
		description: 'Disciplined fighter. Extra HP and steady growth.',
		descKey: 'adventure.characters.aurora_monk.desc',
		strengthBonus: 2,
		defenseBonus: 3,
		hpBonusPercent: 10,
		goldBonusPercent: 5,
		xpBonusPercent: 5,
	},
};

module.exports = {
	getChar(charId) {
		return CHARACTERS[charId] || CHARACTERS.aurora_monk;
	},
	getAllCharacters() {
		return Object.values(CHARACTERS);
	},
};
