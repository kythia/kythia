/**
 * @namespace: addons/pet/helpers/status.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const _UserPet = require('../database/models/UserPet');

function updatePetStatus(pet) {
	const now = Date.now();
	// Jika pet baru dibuat, lastUpdatedAt mungkin null, jadi kita anggap 'now'
	const lastUpdated = pet.lastUpdatedAt
		? new Date(pet.lastUpdatedAt).getTime()
		: now;

	// Hitung selisih dalam jam, tapi pakai desimal biar lebih akurat
	const hoursPassed = (now - lastUpdated) / (1000 * 60 * 60);
	if (hoursPassed <= 0) {
		// Kembalikan pet tanpa perubahan jika belum ada waktu berlalu
		return { pet, justDied: false };
	}

	// Kalkulasi status baru
	pet.hunger = Math.max(pet.hunger - 5 * hoursPassed, 0);
	pet.happiness = Math.max(pet.happiness - 10 * hoursPassed, 0);

	let justDied = false;
	// Cek apakah pet mati di pembaruan kali ini
	if (pet.hunger <= 0 && pet.happiness <= 0 && !pet.isDead) {
		pet.isDead = true;
		justDied = true; // Set flag bahwa pet BARU SAJA mati
	}

	pet.lastUpdatedAt = new Date(now);

	// Kembalikan hasilnya, jangan di-save di sini
	return { pet, justDied };
}

module.exports = { updatePetStatus };
