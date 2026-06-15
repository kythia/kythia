/**
 * @namespace: addons/verification/events/guildMemberAdd.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { sendCaptcha } = require('../helpers/verify');

const { BaseEvent } = require('kythia-core');

class GuildMemberAddEvent extends BaseEvent {
	async execute(member) {
		const container = this.container;
		const _bot = { client: this.client, container: this.container };

		if (!member?.guild || !member.user || member.user.bot) return;

		const { models, logger } = container;
		const { VerificationConfig, ServerSetting } = models;

		try {
			// Check verificationOn flag
			const settings = await ServerSetting.getCache({
				guildId: member.guild.id,
			});
			if (!settings?.verificationOn) return;

			// Load verification config
			const config = await VerificationConfig.getCache({
				where: { guildId: member.guild.id },
			});
			if (!config?.verifiedRoleId) return;

			if (config.unverifiedRoleId) {
				const role = await container.helpers.discord.getRoleSafe(
					member.guild,
					config.unverifiedRoleId,
				);
				if (role) await member.roles.add(role).catch(() => null);
			}

			// If channelId is present, we rely on the static panel button, do NOT DM
			if (config.channelId) {
				return;
			}

			// Otherwise, DM them automatically
			await sendCaptcha(member, config);
		} catch (err) {
			logger.error(`guildMemberAdd error: ${err.message || err}`, {
				label: 'verification',
			});
		}
	}
}

module.exports = GuildMemberAddEvent;
