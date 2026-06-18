/**
 * @namespace: addons/core/events/userUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class UserUpdateEvent extends BaseEvent {
	async execute(oldUser, newUser) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const { kythiaConfig, helpers, models, logger, t } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;

		// Check if relevant changes occurred
		const { simpleContainer } = helpers.discord;
		const usernameChanged = oldUser.username !== newUser.username;
		const discriminatorChanged =
			oldUser.discriminator !== newUser.discriminator;
		const avatarChanged = oldUser.avatar !== newUser.avatar;
		if (!usernameChanged && !discriminatorChanged && !avatarChanged) return;
		try {
			// Prepare changes list
			const changes = [];
			if (usernameChanged) {
				changes.push(
					`**Username:** \`${oldUser.username}\` \`${newUser.username}\``,
				);
			}
			if (discriminatorChanged && newUser.discriminator !== '0') {
				// Ignore '0' for new system
				changes.push(
					`**Discriminator:** \`#${oldUser.discriminator}\` \`#${newUser.discriminator}\``,
				);
			}
			if (avatarChanged) {
				changes.push(
					`**Avatar:** [Old](${oldUser.displayAvatarURL()}) [New](${newUser.displayAvatarURL()})`,
				);
			}
			if (changes.length === 0) return;
			const description =
				`**User Updated Profile**\n\n` +
				`**User:** ${newUser.tag} (<@${newUser.id}>)\n\n` +
				`**Changes:**\n${changes.join('\n')}`;

			// Find mutual guilds where the user is a member.
			// Each shard iterates only its own guilds.cache — this is correct shard behavior:
			// the userUpdate event fires on every shard that has the user cached.
			for (const guild of this.client.guilds.cache.values()) {
				if (guild.members.cache.has(newUser.id)) {
					const guildId = guild.id;
					// User is in this guild. Check if logging is enabled.
					try {
						const settings = await ServerSetting.getCache({
							guildId: guild.id,
						});

						// Optional: Check if we should log user updates to this server?
						// Usually servers might find this spammy. But if audit log is set, we send it.
						// Ideally there would be a finer grain setting, but for now we follow general audit log.

						if (!settings?.auditLogChannelId) continue;
						const logChannel = await helpers.discord.getChannelSafe(
							guild,
							settings.auditLogChannelId,
						);
						if (!logChannel?.isTextBased()) continue;
						const components = await simpleContainer(
							{
								client: this.client,
								guildId: guildId,
							},
							description +
								'\n\n' +
								(`**User:** ${newUser.tag} (${newUser.id})\n` +
									`**Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`),
							{
								color: convertColor('Blurple', {
									from: 'discord',
									to: 'decimal',
								}),
								withFooter: true,
							},
						);
						await logChannel.send({
							components,
							flags: MessageFlags.IsComponentsV2,
							allowedMentions: {
								parse: [],
							},
						});
					} catch (_e) {
						// Ignore individual guild errors to keep loop running
						// continue;
					}
				}
			}
		} catch (err) {
			logger.error(`Error: ${err.message || err}`, {
				label: 'userUpdate',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = UserUpdateEvent;
