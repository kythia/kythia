/**
 * @namespace: addons/core/events/voiceStateUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const Sentry = require('@sentry/node');
const { BaseEvent } = require('kythia-core');
class VoiceStateUpdateEvent extends BaseEvent {
	async execute(oldState, newState) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const { kythiaConfig, helpers, models, t, logger } = container;
		const { convertColor } = helpers.color;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		const guild = newState.guild || oldState.guild;
		const guildId = guild.id;
		try {
			if (!guild) return;

			// Get member (might be partial/null if left)
			const member = newState.member || oldState.member;
			if (!member) return;
			// If bot, usually we might want to log it, but sometimes ignored.
			// Let's keep bots for now unless user wants to ignore.
			if (!member.user || member.user.bot) return;

			// Determine the type of action
			// 1. Join: oldState.channelId is null, newState.channelId is set
			// 2. Leave: oldState.channelId is set, newState.channelId is null
			// 3. Switch: Both set, but different
			// 4. Update (mute/deafen/stream): channelId is same. Ignore for now or maybe log specifically?
			//    The prompt said "event that not logged yet". Usually refers to movement.

			let action = '';
			let description = '';
			let color = 'Blurple'; // Default
			// We'll track change type
			const isJoin = !oldState.channelId && newState.channelId;
			const isLeave = oldState.channelId && !newState.channelId;
			const isSwitch =
				oldState.channelId &&
				newState.channelId &&
				oldState.channelId !== newState.channelId;
			if (!isJoin && !isLeave && !isSwitch) return; // Ignore state updates like self-mute for now

			if (isJoin) {
				action = 'Voice Channel Joined';
				description = `**Joined:** <#${newState.channelId}>`;
				color = 'Green';
			} else if (isLeave) {
				action = 'Voice Channel Left';
				description = `**Left:** <#${oldState.channelId}>`;
				color = 'Red';
			} else if (isSwitch) {
				action = 'Voice Channel Switched';
				description = `**Moved:** <#${oldState.channelId}> <#${newState.channelId}>`;
				color = 'Yellow'; // Or Orange
			}

			// Get audit log settings
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
					'core.events.voiceStateUpdate.log',
					{
						action: action,
						id: member.id,
						description: description,
						tag: member.user.tag,
						id_1: member.id,
						var5: Math.floor(Date.now() / 1000),
					},
				),
				{
					color: convertColor(color, {
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
			logger.error(
				`Error in voiceStateUpdate event handler: ${err.message || err}`,
				{
					label: 'core:events:voiceStateUpdate',
				},
			);
			if (kythiaConfig?.sentry?.dsn) {
				Sentry.captureException(err);
			}
		}
	}
}
module.exports = VoiceStateUpdateEvent;
