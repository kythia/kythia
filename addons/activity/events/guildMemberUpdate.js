/**
 * @namespace: addons/activity/events/guildMemberUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
/**
 * @param {import('kythia-core').Kythia} bot
 * @param {import('discord.js').GuildMember} oldMember
 * @param {import('discord.js').GuildMember} newMember
 */

const { BaseEvent } = require('kythia-core');

class GuildMemberUpdateEvent extends BaseEvent {
	async execute(oldMember, newMember) {
		const container = this.container;
		const bot = { client: this.client, container: this.container };

		if (!newMember?.user || newMember.user.bot) return;

		// Detect boost start: was not boosting before, now is
		const startedBoosting = !oldMember.premiumSince && newMember.premiumSince;
		if (!startedBoosting) return;

		const { models } = this.container;
		const { ServerSetting } = models;

		const guildId = newMember.guild.id;
		const userId = newMember.id;

		const serverSetting = await ServerSetting.getCache({ guildId });
		if (!serverSetting?.activityOn) return;

		const { checkAndUnlock } = require('../helpers/achievementChecker');
		checkAndUnlock('special', {
			guildId,
			userId,
			guild: newMember.guild,
			container: this.container,
			specialFlags: ['server_booster'],
		}).catch(() => null);
	}
}

module.exports = GuildMemberUpdateEvent;
