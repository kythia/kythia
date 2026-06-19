/**
 * @namespace: addons/core/events/threadMemberUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class ThreadMemberUpdateEvent extends BaseEvent {
	async execute(oldMember, newMember) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const { kythiaConfig, helpers, models, logger, t } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;

		// This event fires when a thread member is updated (flags, etc).
		// Often fires when they join/leave too? No, usually threadMembersUpdate covers the list changing.
		// threadMemberUpdate is for specific member properties changing.
		// But sometimes it's used for tracking.

		// We need the guild. ThreadMember has .thread which has .guild
		const { simpleContainer } = helpers.discord;
		const thread = newMember.thread || oldMember.thread;
		if (!thread?.guild) return;
		const guild = thread.guild;
		const guildId = guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId: guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;

			// We can check what changed. Flags?
			const changes = [];
			if (oldMember.flags.bitfield !== newMember.flags.bitfield) {
				changes.push(
					`**Flags:** ${oldMember.flags.bitfield} ${newMember.flags.bitfield}`,
				);
			}
			if (changes.length === 0) return; // Ignore if no visible changes

			const components = await simpleContainer(
				{
					client: this.client,
					guildId: guildId,
				},
				await t(
					{
						client: this.client,
						guildId: guildId,
					},
					'core.events.threadMemberUpdate.log',
					{
						id: newMember.id,
						id_1: thread.id,
						var2: changes.join('\n'),
						id_2: newMember.id,
						var4: Math.floor(Date.now() / 1000),
					},
				),
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
		} catch (err) {
			logger.error(`Error: ${err.message || err}`, {
				label: 'threadMemberUpdate',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = ThreadMemberUpdateEvent;
