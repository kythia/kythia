/**
 * @namespace: addons/core/events/channelUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
function formatChanges(changes) {
	if (!changes || changes.length === 0) return 'No changes detected.';
	return changes
		.map((change) => {
			const key = change.key
				.replace(/_/g, ' ')
				.replace(/\b\w/g, (l) => l.toUpperCase());
			const oldValue = change.old ?? 'Nothing';
			const newValue = change.new ?? 'Nothing';
			return `**${key}**: \`${oldValue}\` \`${newValue}\``;
		})
		.join('\n');
}
const { BaseEvent } = require('kythia-core');
class ChannelUpdateEvent extends BaseEvent {
	async execute(_oldChannel, newChannel) {
		const container = this.container;
		if (!newChannel.guild) return;
		const { models, helpers, t, logger } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = newChannel.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				newChannel.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (!newChannel.guild.members.me?.permissions?.has('ViewAuditLog'))
				return;
			const audit = await newChannel.guild
				.fetchAuditLogs({
					type: AuditLogEvent.ChannelUpdate,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === newChannel.id &&
					e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry) return;
			const executor = entry.executor;
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
					'core.events.channelUpdate.log',
					{
						var0: executor?.id || 'Unknown',
						id: newChannel.id,
						var2: formatChanges(entry.changes),
						conditional3: entry.reason
							? await t(
									{
										client: this.client,
										guildId: guildId,
									},
									'core.events.common.reason',
									{
										reason: entry.reason,
									},
								)
							: '',
						var4: executor?.tag || 'Unknown',
						var5: executor?.id || 'Unknown',
						var6: Math.floor(Date.now() / 1000),
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
				label: 'channelUpdate',
			});
		}
	}
}
module.exports = ChannelUpdateEvent;
