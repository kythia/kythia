/**
 * @namespace: addons/core/events/threadMembersUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class ThreadMembersUpdateEvent extends BaseEvent {
	async execute(oldMembers, newMembers, thread) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const { kythiaConfig, helpers, models, logger, t } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		if (!thread.guild) return;
		const guildId = thread.guild.id;
		try {
			// This event works with collections of members added/removed.
			const addedMembers = newMembers.filter((m) => !oldMembers.has(m.id));
			const removedMembers = oldMembers.filter((m) => !newMembers.has(m.id));
			if (addedMembers.size === 0 && removedMembers.size === 0) return;
			const settings = await ServerSetting.getCache({
				guildId: thread.guild.id,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				thread.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			let description = `**Thread Members Updated** in <#${thread.id}>\n\n`;
			if (addedMembers.size > 0) {
				const addedList = addedMembers.map((m) => `<@${m.id}>`).join(', ');
				description += `**Added (${addedMembers.size}):** ${addedList.length > 500 ? `${addedList.substring(0, 500)}...` : addedList}\n`;
			}
			if (removedMembers.size > 0) {
				const removedList = removedMembers.map((m) => `<@${m.id}>`).join(', ');
				description += `**Removed (${removedMembers.size}):** ${removedList.length > 500 ? `${removedList.substring(0, 500)}...` : removedList}\n`;
			}
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
					'core.events.threadMembersUpdate.log',
					{
						expr0: description,
						id: thread.id,
						var2: Math.floor(Date.now() / 1000),
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
				label: 'threadMembersUpdate',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = ThreadMembersUpdateEvent;
