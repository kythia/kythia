/**
 * @namespace: addons/core/events/inviteDelete.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	AuditLogEvent,
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const Sentry = require('@sentry/node');

const { BaseEvent } = require('kythia-core');

class InviteDeleteEvent extends BaseEvent {
	async execute(invite) {
		const container = this.container;
		const bot = { client: this.client, container: this.container };

		if (!invite.guild) return;
		const { models, helpers, logger, t } = container;
		const { ServerSetting } = models;
		const { convertColor } = helpers.color;
		const guildId = invite.guild.id;

		try {
			const settings = await ServerSetting.getCache({
				guildId: invite.guild.id,
			});
			if (!settings?.auditLogChannelId) return;

			const logChannel = await invite.guild.channels
				.fetch(settings.auditLogChannelId)
				.catch(() => null);
			if (!logChannel?.isTextBased()) return;
			if (
				!logChannel
					.permissionsFor(this.client.user)
					?.has(['ViewChannel', 'SendMessages'])
			)
				return;

			if (!invite.guild.members.me?.permissions?.has('ViewAuditLog')) return;
			const audit = await invite.guild
				.fetchAuditLogs({
					type: AuditLogEvent.InviteDelete,
					limit: 1,
				})
				.catch(() => null);
			if (!audit) return;

			const entry = audit.entries.find(
				(e) =>
					e.target?.code === invite.code &&
					e.createdTimestamp > Date.now() - 5000,
			);

			if (!entry) return;

			const executor = entry.executor;
			const components = [
				new ContainerBuilder()
					.setAccentColor(
						convertColor('Red', { from: 'discord', to: 'decimal' }),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`🔗 **Invite Deleted** by <@${executor?.id || 'Unknown'}>\n\n` +
								`**Invite Code:** ${invite.code}\n` +
								`**Channel:** ${invite.channel ? `<#${invite.channel.id}>` : 'Unknown'}\n` +
								`**Uses:** ${invite.uses || 0}\n` +
								`**Max Uses:** ${invite.maxUses ? invite.maxUses.toString() : 'Unlimited'}\n` +
								`**Max Age:** ${invite.maxAge ? `${invite.maxAge} seconds` : 'Never expires'}\n` +
								`**Temporary:** ${invite.temporary ? 'Yes' : 'No'}` +
								(entry.reason ? `\n\n**Reason:** ${entry.reason}` : ''),
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							`👤 **Executor:** ${executor?.tag || 'Unknown'} (${executor?.id || 'Unknown'})\n` +
								`🕒 **Timestamp:** <t:${Math.floor(Date.now() / 1000)}:F>`,
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t({ guildId }, 'common.container.footer', {
								username: this.client.user.username,
							}),
						),
					),
			];

			await logChannel.send({
				components,
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		} catch (err) {
			logger.error(`Error: ${err.message || err}`, {
				label: 'inviteDelete',
			});
			if (bot.config?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}

module.exports = InviteDeleteEvent;
