/**
 * @namespace: addons/economy/helpers/premium-tiers.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const TIERS = {
	cute: {
		name: '🎀 Cute Tier',
		desc: 'Perfect for casual players and profile flexers.\n- Double Dailies Rewards\n- 20% Cooldown Reduction\n- Exclusive Supporter Badge\n- Access to `/music utils 247` & `autoplay`',
		color: '#ffb6c1',
		prices: {
			7: 125000n,
			30: 500000n,
			365: 5000000n,
		},
	},
	powerful: {
		name: '⚔️ Powerful Tier',
		desc: 'The ultimate package for hardcore grinders.\n- Everything in Cute Tier\n- 12-Hour Autohunt Duration\n- +5% Gacha Luck Modifier\n- Tax-free transactions',
		color: '#ff4500',
		prices: {
			7: 375000n,
			30: 1500000n,
			365: 15000000n,
		},
	},
	yours: {
		name: '👑 Yours Tier',
		desc: 'For the absolute elite.\n- Everything in Powerful Tier\n- Custom command aliases\n- Access to exclusive Beta features',
		color: '#ffd700',
		prices: {
			7: 125000n * 10n,
			30: 500000n * 10n,
			365: 5000000n * 10n,
		},
	},
};

module.exports = TIERS;
