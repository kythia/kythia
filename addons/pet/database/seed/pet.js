/**
 * @namespace: addons/pet/database/seed/pet.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

// addons/pet/database/seed/pet.js

const sequelize = require('@src/database/KythiaSequelize');
const Pet = require('../models/Pet');

const pets = [
    // Common Pets
    { name: 'Cat', icon: '🐱', rarity: 'common', bonusType: 'coin', bonusValue: 150 },
    { name: 'Dog', icon: '🐶', rarity: 'common', bonusType: 'coin', bonusValue: 100 },
    { name: 'Rabbit', icon: '🐇', rarity: 'common', bonusType: 'coin', bonusValue: 150 },
    { name: 'Hamster', icon: '🐹', rarity: 'common', bonusType: 'coin', bonusValue: 150 },
    { name: 'Parrot', icon: '🦜', rarity: 'common', bonusType: 'coin', bonusValue: 100 },

    // Rare Pets
    { name: 'Fox', icon: '🦊', rarity: 'rare', bonusType: 'coin', bonusValue: 200 },
    { name: 'Raccoon', icon: '🦝', rarity: 'rare', bonusType: 'coin', bonusValue: 270 },
    { name: 'Eagle', icon: '🦅', rarity: 'rare', bonusType: 'coin', bonusValue: 200 },
    { name: 'Koala', icon: '🐨', rarity: 'rare', bonusType: 'coin', bonusValue: 270 },
    { name: 'Penguin', icon: '🐧', rarity: 'rare', bonusType: 'coin', bonusValue: 200 },

    // Epic Pets
    { name: 'Wolf', icon: '🐺', rarity: 'epic', bonusType: 'coin', bonusValue: 290 },
    { name: 'Panda', icon: '🐼', rarity: 'epic', bonusType: 'coin', bonusValue: 290 },
    { name: 'Flamingo', icon: '🦩', rarity: 'epic', bonusType: 'coin', bonusValue: 290 },
    { name: 'Komodo Dragon', icon: '🦎', rarity: 'epic', bonusType: 'ruby', bonusValue: 300 },
    { name: 'Lion', icon: '🦁', rarity: 'epic', bonusType: 'ruby', bonusValue: 290 },

    // Legendary Pets
    { name: 'Phoenix', icon: '🐦‍🔥', rarity: 'legendary', bonusType: 'ruby', bonusValue: 400 },
    { name: 'Dragon', icon: '🐉', rarity: 'legendary', bonusType: 'ruby', bonusValue: 400 },
    { name: 'Unicorn', icon: '🦄', rarity: 'legendary', bonusType: 'ruby', bonusValue: 400 },
    { name: 'Cerberus', icon: '🐕‍🦺', rarity: 'legendary', bonusType: 'ruby', bonusValue: 400 },
];
// Seeder sekarang mengekspor sebuah objek
module.exports = {
    // Deskripsi untuk logging yang lebih jelas
    description: 'Seeds the Pet table with a default list of common to legendary pets.',

    // Logika utama seeding sekarang ada di dalam properti 'seed'
    seed: async () => {
        try {
            await sequelize.query('SET foreign_key_checks = 0;');
            await Pet.destroy({ truncate: true, cascade: true });
            await Pet.bulkCreate(pets);
            await sequelize.query('SET foreign_key_checks = 1;');

            // Kembalikan pesan sukses
            return `✅ Successfully seeded ${pets.length} pets.`;
        } catch (error) {
            // Lemparkan error agar bisa ditangkap oleh runner
            console.error('❌ Error seeding pets:', error);
            throw error;
        }
    },
};
