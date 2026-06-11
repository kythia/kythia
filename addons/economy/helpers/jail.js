/**
 * @namespace: addons/economy/helpers/jail.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	/**
	 * Checks if a user is currently in jail. If they are, it replies to the interaction.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {Object} user The KythiaUser database model
	 * @param {Object} container The DI container
	 * @returns {Promise<boolean>} true if the user is in jail (and interaction replied), false otherwise.
	 */
	async checkJail(interaction, user, container) {
		if (!user.jailTimeUntil) return false;

		const jailUntil = new Date(user.jailTimeUntil).getTime();
		const now = Date.now();

		if (now < jailUntil) {
			const { t, helpers } = container;
			const { simpleContainer } = helpers.discord;

			const timeLeftMs = jailUntil - now;
			const timeLeftMins = Math.ceil(timeLeftMs / 1000 / 60);

			const msg = await t(interaction, 'economy.crime.jail.locked', {
				time: timeLeftMins,
			});

			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});

			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});

			return true;
		}

		return false;
	},
};
