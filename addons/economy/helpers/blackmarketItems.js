/**
 * @namespace: addons/economy/helpers/blackmarketItems.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const BLACKMARKET_ITEMS = [
	// ─── Premium Identity ─────────────────────────────────────────────────────
	{
		id: 'bm_fabled_ring',
		emoji: '💍',
		name: 'Fabled Marriage Ring',
		description:
			'The rarest ring in existence. Propose to anyone with unparalleled style.',
		priceKyth: 500,
		stock: null,
		effect: 'premium_proposal',
	},
	{
		id: 'bm_custom_pet_ticket',
		emoji: '🎟️',
		name: 'Custom Pet Ticket',
		description:
			'Claim a custom-designed pet exclusively for you. Contact an admin after purchase.',
		priceKyth: 2500,
		stock: 10, // Limited stock
		effect: 'custom_pet_claim',
	},

	// ─── Power Items ──────────────────────────────────────────────────────────
	{
		id: 'bm_ghost_mode',
		emoji: '👻',
		name: 'Ghost Mode',
		description:
			'Disappear from the Wanted List for 24 hours. No bounty hunter can find you.',
		priceKyth: 150,
		stock: null,
		effect: 'ghost_mode_24h',
	},
	{
		id: 'bm_cooldown_reset',
		emoji: '⏱️',
		name: 'Cooldown Eraser',
		description:
			'Instantly reset ALL your economy cooldowns (work, rob, hack).',
		priceKyth: 300,
		stock: null,
		effect: 'reset_all_cooldowns',
	},
	{
		id: 'bm_double_pay',
		emoji: '💰',
		name: 'Double Shift',
		description: 'Your next /eco work earns double the normal amount.',
		priceKyth: 80,
		stock: null,
		effect: 'double_work_pay',
	},

	// ─── Crime Tools ──────────────────────────────────────────────────────────
	{
		id: 'bm_master_key',
		emoji: '🗝️',
		name: 'Master Key',
		description:
			'Bypass a Padlock when robbing. Works even against a locked target.',
		priceKyth: 120,
		stock: null,
		effect: 'bypass_padlock',
	},
	{
		id: 'bm_emp_device',
		emoji: '⚡',
		name: 'EMP Device',
		description:
			"Disables a target's Antivirus before you hack. Increases hack success dramatically.",
		priceKyth: 200,
		stock: null,
		effect: 'disable_antivirus',
	},
	{
		id: 'bm_bounty_wipe',
		emoji: '🧹',
		name: 'Bounty Wipe',
		description: 'Immediately clear your own bounty. No questions asked.',
		priceKyth: 400,
		stock: null,
		effect: 'clear_own_bounty',
	},

	// ─── Flex / Cosmetic ─────────────────────────────────────────────────────
	{
		id: 'bm_kyth_whale_badge',
		emoji: '🐳',
		name: 'KYTH Whale Badge',
		description:
			"A cosmetic badge showing you've spent over 1000 KYTH. Pure status symbol.",
		priceKyth: 1000,
		stock: null,
		effect: 'cosmetic_badge',
	},
];

module.exports = {
	BLACKMARKET_ITEMS,
	getItem(id) {
		return BLACKMARKET_ITEMS.find((item) => item.id === id) || null;
	},
	getAllItems() {
		return BLACKMARKET_ITEMS;
	},
};
