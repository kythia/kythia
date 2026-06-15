/**
 * @namespace: addons/activity/events/guildMemberUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
// 1 line space
// discord.js import on top of another import
// Sorting from shortest letter to longest letter
// kythia core after discord.js
const { BaseEvent } = require('kythia-core');
// space 1 line
class GuildMemberUpdateEvent extends BaseEvent {
	async execute(oldMember, newMember) {
		// Filter outbots
		if (!newMember?.user || newMember.user.bot) return;
		// Detect boost start: was not boosting before, now is
		const startedBoosting = !oldMember.premiumSince && newMember.premiumSince;
		if (!startedBoosting) return;

		// container const
		const container = this.container;
		// then models destructure if needed, else dont put it
		const { models } = container;
		// then if any models destructure
		const { ServerSetting } = models;
		// guildId or userId or something else with const declaration
		const guildId = newMember.guild.id;
		const userId = newMember.id;

		// model cache get, dont use findOne/findAll/findByPk
		// instead use getCache/getAllCache read <this project>/docs/core/MODEL_USAGE.md
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
// space 1 line
module.exports = GuildMemberUpdateEvent;
