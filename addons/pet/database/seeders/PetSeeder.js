/**
 * @namespace: addons/pet/database/seeders/PetSeeder.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Seeder } = require('kythia-core');

class PetSeeder extends Seeder {
	async run() {
		const { Pet } = this.container.models;

		await Pet.bulkCreate([
			{
				name: 'Cat',
				icon: '🐱',
				rarity: 'common',
				bonusType: 'coin',
				bonusValue: 150,
			},
			{
				name: 'Dog',
				icon: '🐶',
				rarity: 'common',
				bonusType: 'coin',
				bonusValue: 100,
			},
			{
				name: 'Rabbit',
				icon: '🐇',
				rarity: 'common',
				bonusType: 'coin',
				bonusValue: 150,
			},
			{
				name: 'Hamster',
				icon: '🐹',
				rarity: 'common',
				bonusType: 'coin',
				bonusValue: 150,
			},
			{
				name: 'Parrot',
				icon: '🦜',
				rarity: 'common',
				bonusType: 'coin',
				bonusValue: 100,
			},

			// Rare Pets
			{
				name: 'Fox',
				icon: '🦊',
				rarity: 'rare',
				bonusType: 'coin',
				bonusValue: 200,
			},
			{
				name: 'Raccoon',
				icon: '🦝',
				rarity: 'rare',
				bonusType: 'coin',
				bonusValue: 270,
			},
			{
				name: 'Eagle',
				icon: '🦅',
				rarity: 'rare',
				bonusType: 'coin',
				bonusValue: 200,
			},
			{
				name: 'Koala',
				icon: '🐨',
				rarity: 'rare',
				bonusType: 'coin',
				bonusValue: 270,
			},
			{
				name: 'Penguin',
				icon: '🐧',
				rarity: 'rare',
				bonusType: 'coin',
				bonusValue: 200,
			},

			// Epic Pets
			{
				name: 'Wolf',
				icon: '🐺',
				rarity: 'epic',
				bonusType: 'coin',
				bonusValue: 290,
			},
			{
				name: 'Panda',
				icon: '🐼',
				rarity: 'epic',
				bonusType: 'coin',
				bonusValue: 290,
			},
			{
				name: 'Flamingo',
				icon: '🦩',
				rarity: 'epic',
				bonusType: 'coin',
				bonusValue: 290,
			},
			{
				name: 'Komodo Dragon',
				icon: '🦎',
				rarity: 'epic',
				bonusType: 'ruby',
				bonusValue: 300,
			},
			{
				name: 'Lion',
				icon: '🦁',
				rarity: 'epic',
				bonusType: 'ruby',
				bonusValue: 290,
			},

			// Legendary Pets
			{
				name: 'Phoenix',
				icon: '🐦‍🔥',
				rarity: 'legendary',
				bonusType: 'ruby',
				bonusValue: 400,
			},
			{
				name: 'Dragon',
				icon: '🐉',
				rarity: 'legendary',
				bonusType: 'ruby',
				bonusValue: 400,
			},
			{
				name: 'Unicorn',
				icon: '🦄',
				rarity: 'legendary',
				bonusType: 'ruby',
				bonusValue: 400,
			},
			{
				name: 'Cerberus',
				icon: '🐕‍🦺',
				rarity: 'legendary',
				bonusType: 'ruby',
				bonusValue: 400,
			},
		]);
	}
}

module.exports = PetSeeder;
