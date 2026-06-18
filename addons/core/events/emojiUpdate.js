/**
 * @namespace: addons/core/events/emojiUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { AuditLogEvent, MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
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
class EmojiUpdateEvent extends BaseEvent {
	async execute(_oldEmoji, newEmoji) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		if (!newEmoji.guild) return;
		const { kythiaConfig, models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const { convertColor } = helpers.color;
		const guildId = newEmoji.guild.id;
		try {
			const settings = await ServerSetting.getCache({
				guildId,
			});
			if (!settings?.auditLogChannelId) return;
			const logChannel = await helpers.discord.getChannelSafe(
				newEmoji.guild,
				settings.auditLogChannelId,
			);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;
			if (!newEmoji.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await newEmoji.guild
				.fetchAuditLogs({
					type: AuditLogEvent.EmojiUpdate,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;
			const entry = audit.entries.find(
				(e) =>
					e.target?.id === newEmoji.id &&
					e.createdTimestamp > Date.now() - 5000,
			);
			if (!entry) return;
			const executor = entry.executor;
			const components = await simpleContainer(
				{
					client: this.client,
					guildId: guildId,
				},
				`**Emoji Updated** by <@${executor?.id || 'Unknown'}>\n\n` +
					`**Emoji:** <:${newEmoji.name}:${newEmoji.id}>\n\n` +
					`**Changes:**\n${formatChanges(entry.changes)}` +
					(entry.reason ? `\n\n**Reason:** ${entry.reason}` : '') +
					'\n\n' +
					(`**Executor:** ${executor?.tag || 'Unknown'} (${executor?.id || 'Unknown'})\n` +
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
		} catch (err) {
			logger.error(`Error: ${err.message || err}`, {
				label: 'emojiUpdate',
			});
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = EmojiUpdateEvent;
