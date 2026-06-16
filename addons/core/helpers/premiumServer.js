/**
 * @namespace: addons/core/helpers/premiumServer.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

/**
 * Gets the active premium tier for a guild, based on PremiumServerBind.
 * @param {string} guildId - The Discord Guild ID
 * @param {Object} models - Kythia models object
 * @returns {Promise<string|null>} The active premium tier ('yours' or 'ecosystem') or null if none.
 */
async function getGuildPremiumTier(guildId, models) {
	const { PremiumServerBind, KythiaUser } = models;

	if (!PremiumServerBind || !KythiaUser) return null;

	const bind = await PremiumServerBind.getCache({ guildId });
	if (!bind) return null;

	const user = await KythiaUser.getCache({ userId: bind.userId });
	if (!user) return null;

	// Check if user's premium is active and eligible
	const isActive =
		user.premiumTier &&
		['yours', 'ecosystem'].includes(user.premiumTier) &&
		user.premiumExpiresAt &&
		new Date(user.premiumExpiresAt) > new Date();

	if (!isActive) return null;

	return user.premiumTier;
}

module.exports = {
	getGuildPremiumTier,
};
