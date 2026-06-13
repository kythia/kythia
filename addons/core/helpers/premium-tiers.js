/**
 * @namespace: addons/core/helpers/premium-tiers.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const TIERS = {
	cute: {
		name: '🎀 Cute Tier',
		desc: 'Perfect for casual players and profile flexers.\n- Double Dailies Rewards\n- 20% Cooldown Reduction\n- Exclusive Supporter Badge\n- 6 Daily Quest Slots',
		color: '#ffb6c1',
		prices: {
			7: 125000n,
			30: 500000n,
			365: 5000000n,
		},
	},
	powerful: {
		name: '⚔️ Powerful Tier',
		desc: 'The ultimate package for hardcore grinders and gacha hunters.\n- Everything in Cute Tier\n- 12-Hour Autohunt Duration\n- +5% Gacha Luck Modifier\n- Custom Profile Wallpapers\n- Zero Market Tax Fees',
		color: '#ff4500',
		prices: {
			7: 375000n,
			30: 1500000n,
			365: 15000000n,
		},
	},
	yours: {
		name: '👑 Yours Tier',
		desc: 'Designed for Server Admins to boost one entire community.\n- All Individual Powerful Perks\n- Global +20% Server XP Buff\n- Custom Economy Naming\n- VIP Shard Priority (Zero Lag)\n- Bypass Vote Requirements',
		color: '#ffd700',
		prices: {
			7: 125000n * 10n,
			30: 500000n * 10n,
			365: 5000000n * 10n,
		},
	},
	ecosystem: {
		name: '🌌 Ecosystem Tier',
		desc: 'Network Admins, Multi-Guild Owners, and True VIPs.\n- All Individual Powerful Perks\n- Apply "Yours" Tier benefit to up to 3 seperate Discord Servers!\n- Maximized Priority',
		color: '#00ffff',
		prices: {
			7: 125000n * 25n,
			30: 500000n * 25n,
			365: 5000000n * 25n,
		},
	},
};

module.exports = TIERS;
