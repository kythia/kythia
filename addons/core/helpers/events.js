/**
 * @namespace: addons/core/helpers/events.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { Collection, Events } = require('discord.js');

/**
 * Map of events to their available test scenarios/types
 * @type {Object<string, string[]>}
 */
const EVENT_SCENARIOS = {
	[Events.GuildMemberUpdate]: ['boost', 'unboost', 'nickname', 'role-change'],
	[Events.MessageUpdate]: ['content-change', 'embed-add'],
	[Events.GuildUpdate]: ['name-change', 'icon-change', 'owner-change'],
	[Events.ChannelUpdate]: ['name-change', 'topic-change', 'nsfw-toggle'],
	[Events.VoiceStateUpdate]: ['join', 'leave', 'mute', 'unmute', 'deafen'],
	[Events.PresenceUpdate]: ['online', 'idle', 'dnd', 'offline'],
	// Add more as needed
};

/**
 * Get available scenarios for a given event
 * @param {string} eventName - The event name
 * @returns {string[]} Array of available scenario names
 */
function getEventScenarios(eventName) {
	return EVENT_SCENARIOS[eventName] || ['default'];
}

/**
 * Creates mock event arguments for testing with client.emit().
 * Leverages actual Discord.js structures and classes where possible.
 * @param {string} eventName - The name of the event to mock.
 * @param {import('discord.js').Interaction} interaction - The interaction to source base data from.
 * @param {string} type - The specific scenario type (e.g., 'boost', 'unboost', 'default').
 * @returns {Promise<Array<any>>} An array of arguments for the event.
 */
async function createMockEventArgs(eventName, interaction, type = 'default') {
	const { member, guild, channel, user, client } = interaction;
	const container = client.container;
	const { logger } = container;

	switch (eventName) {
		// Message events
		case Events.MessageCreate:
		case Events.MessageDelete:
			return [
				await channel.send({
					content: 'This is a test message for event testing.',
				}),
			];

		case Events.MessageUpdate: {
			const oldMessage = await channel.send({
				content: 'Old message content.',
			});
			const newMessage = await channel.messages.fetch(oldMessage.id);

			if (type === 'embed-add') {
				// Simulate adding an embed
				Object.defineProperty(newMessage, 'embeds', {
					value: [{ title: 'New Embed', description: 'Test embed' }],
					writable: true,
				});
			} else {
				// Default: content change
				Object.defineProperty(newMessage, 'content', {
					value: 'Updated message content.',
					writable: true,
				});
			}
			return [oldMessage, newMessage];
		}

		case Events.MessageBulkDelete: {
			const messages = new Collection();
			const msg1 = await channel.send({ content: 'Message 1' });
			const msg2 = await channel.send({ content: 'Message 2' });
			messages.set(msg1.id, msg1);
			messages.set(msg2.id, msg2);
			return [messages, channel];
		}

		case Events.MessageReactionAdd:
		case Events.MessageReactionRemove: {
			const message = await channel.send({ content: 'React to this!' });
			const reaction = {
				emoji: { name: '👍', id: null },
				count: 1,
				me: false,
				message,
			};
			return [reaction, user];
		}

		case Events.MessageReactionRemoveAll:
		case Events.MessageReactionRemoveEmoji: {
			const message = await channel.send({ content: 'All reactions removed' });
			return [message];
		}

		// Guild Member events
		case Events.GuildMemberAdd:
		case Events.GuildMemberRemove:
			return [member];

		case Events.GuildMemberUpdate: {
			const oldMember = Object.assign(
				Object.create(Object.getPrototypeOf(member)),
				member,
			);
			const newMember = member;

			switch (type) {
				case 'boost':
					oldMember.premiumSinceTimestamp = null;
					newMember.premiumSinceTimestamp = Date.now();
					break;
				case 'unboost':
					oldMember.premiumSinceTimestamp =
						Date.now() - 1000 * 60 * 60 * 24 * 7;
					newMember.premiumSinceTimestamp = null;
					break;
				case 'nickname':
					oldMember.nickname = oldMember.nickname ? null : 'NewNickname';
					break;
				default:
					oldMember.roles = new Collection(member.roles.cache);
					break;
			}
			return [oldMember, newMember];
		}

		case Events.GuildMembersChunk: {
			const members = new Collection([[member.id, member]]);
			return [members, guild, { index: 0, count: 1, nonce: 'test' }];
		}

		// Guild events
		case Events.GuildCreate:
		case Events.GuildDelete:
		case Events.GuildUnavailable:
		case Events.GuildAvailable:
			return [guild];

		case Events.GuildUpdate: {
			const oldGuild = Object.assign(
				Object.create(Object.getPrototypeOf(guild)),
				guild,
			);

			switch (type) {
				case 'icon-change':
					oldGuild.icon = 'old_icon_hash';
					break;
				case 'owner-change':
					oldGuild.ownerId = '123456789';
					break;
				default:
					oldGuild.name = 'Old Guild Name';
					break;
			}
			return [oldGuild, guild];
		}

		case Events.GuildIntegrationsUpdate:
			return [guild];

		// Ban events
		case Events.GuildBanAdd:
		case Events.GuildBanRemove: {
			const ban = { guild, user, reason: 'Test ban from /testevent' };
			return [ban];
		}

		// Channel events
		case Events.ChannelCreate:
		case Events.ChannelDelete:
			return [channel];

		case Events.ChannelUpdate: {
			const oldChannel = Object.assign(
				Object.create(Object.getPrototypeOf(channel)),
				channel,
			);

			switch (type) {
				case 'topic-change':
					oldChannel.topic = 'Old topic';
					break;
				case 'nsfw-toggle':
					oldChannel.nsfw = !channel.nsfw;
					break;
				default:
					oldChannel.name = 'old-channel-name';
					break;
			}
			return [oldChannel, channel];
		}

		case Events.ChannelPinsUpdate: {
			return [channel, new Date()];
		}

		// Thread events
		case Events.ThreadCreate:
		case Events.ThreadDelete:
			return [channel.isThread() ? channel : { ...channel, type: 11 }];

		case Events.ThreadUpdate: {
			const oldThread = Object.assign(
				Object.create(Object.getPrototypeOf(channel)),
				channel,
			);
			return [oldThread, channel];
		}

		case Events.ThreadListSync:
		case Events.ThreadMembersUpdate:
			return [new Collection(), guild];

		// Role events
		case Events.GuildRoleCreate:
		case Events.GuildRoleDelete:
			return [guild.roles.cache.first() || guild.roles.everyone];

		case Events.GuildRoleUpdate: {
			const role = guild.roles.cache.first() || guild.roles.everyone;
			const oldRole = Object.assign(
				Object.create(Object.getPrototypeOf(role)),
				role,
			);
			oldRole.name = 'Old Role Name';
			return [oldRole, role];
		}

		// Emoji events
		case Events.GuildEmojiCreate:
		case Events.GuildEmojiDelete:
		case Events.GuildEmojiUpdate: {
			const emoji = guild.emojis.cache.first() || {
				id: '123456789',
				name: 'test_emoji',
				guild,
			};
			return eventName === Events.GuildEmojiUpdate ? [emoji, emoji] : [emoji];
		}

		// Sticker events
		case Events.GuildStickerCreate:
		case Events.GuildStickerDelete:
		case Events.GuildStickerUpdate: {
			const sticker = guild.stickers.cache.first() || {
				id: '123456789',
				name: 'test_sticker',
				guild,
			};
			return eventName === Events.GuildStickerUpdate
				? [sticker, sticker]
				: [sticker];
		}

		// Voice events
		case Events.VoiceStateUpdate: {
			const oldState = { ...member.voice };
			const newState = member.voice;

			switch (type) {
				case 'join':
					oldState.channel = null;
					oldState.channelId = null;
					break;
				case 'leave':
					newState.channel = null;
					newState.channelId = null;
					break;
				case 'mute':
					oldState.serverMute = false;
					newState.serverMute = true;
					break;
				case 'unmute':
					oldState.serverMute = true;
					newState.serverMute = false;
					break;
				case 'deafen':
					oldState.serverDeaf = false;
					newState.serverDeaf = true;
					break;
				default:
					oldState.channel = null;
					oldState.channelId = null;
					break;
			}
			return [oldState, newState];
		}

		// Invite events
		case Events.InviteCreate:
		case Events.InviteDelete: {
			const invite = {
				code: 'TEST123',
				guild,
				channel,
				inviter: user,
				uses: 0,
				maxUses: 0,
				maxAge: 86400,
				temporary: false,
			};
			return [invite];
		}

		// User/Presence events
		case Events.UserUpdate: {
			const oldUser = Object.assign(
				Object.create(Object.getPrototypeOf(user)),
				user,
			);
			oldUser.username = 'OldUsername';
			return [oldUser, user];
		}

		case Events.PresenceUpdate: {
			const oldPresence = member.presence || { status: 'offline', user };
			const newPresence = { ...oldPresence };

			switch (type) {
				case 'online':
					newPresence.status = 'online';
					break;
				case 'idle':
					newPresence.status = 'idle';
					break;
				case 'dnd':
					newPresence.status = 'dnd';
					break;
				case 'offline':
					newPresence.status = 'offline';
					break;
				default:
					newPresence.status = 'online';
					break;
			}
			return [oldPresence, newPresence];
		}

		// Interaction events
		case Events.InteractionCreate:
			return [interaction];

		// Client events
		case Events.ClientReady:
			return [client];

		case Events.Invalidated:
			return [];

		case Events.Error:
			return [new Error('Test error from /testevent')];

		case Events.Warn:
			return ['Test warning from /testevent'];

		case Events.Debug:
			return ['Test debug message from /testevent'];

		// Webhook events
		case Events.WebhooksUpdate:
			return [channel];

		// Typing event
		case Events.TypingStart:
			return [{ user, channel, timestamp: Date.now(), guild, member }];

		// Stage Instance events
		case Events.StageInstanceCreate:
		case Events.StageInstanceDelete:
		case Events.StageInstanceUpdate: {
			const stageInstance = {
				id: '123456789',
				guild,
				channelId: channel.id,
				topic: 'Test Stage',
			};
			return eventName === Events.StageInstanceUpdate
				? [stageInstance, stageInstance]
				: [stageInstance];
		}

		// Guild Scheduled Event
		case Events.GuildScheduledEventCreate:
		case Events.GuildScheduledEventDelete:
		case Events.GuildScheduledEventUpdate:
		case Events.GuildScheduledEventUserAdd:
		case Events.GuildScheduledEventUserRemove: {
			const event = {
				id: '123456789',
				guild,
				name: 'Test Event',
				scheduledStartTimestamp: Date.now() + 86400000,
			};
			return eventName.includes('User') ? [event, user] : [event];
		}

		// Auto Moderation events
		case Events.AutoModerationActionExecution:
		case Events.AutoModerationRuleCreate:
		case Events.AutoModerationRuleDelete:
		case Events.AutoModerationRuleUpdate: {
			const rule = { id: '123456789', guild, name: 'Test Rule' };
			return [rule];
		}

		// Audit Log
		case Events.GuildAuditLogEntryCreate: {
			const auditLog = {
				id: '123456789',
				guild,
				action: 'MEMBER_KICK',
				targetId: user.id,
				executorId: client.user.id,
			};
			return [auditLog, guild];
		}

		// Entitlements
		case Events.EntitlementCreate:
		case Events.EntitlementDelete:
		case Events.EntitlementUpdate: {
			const entitlement = {
				id: '123456789',
				guildId: guild.id,
				userId: user.id,
			};
			return eventName === Events.EntitlementUpdate
				? [entitlement, entitlement]
				: [entitlement];
		}

		// Soundboard
		case Events.GuildSoundboardSoundCreate:
		case Events.GuildSoundboardSoundDelete:
		case Events.GuildSoundboardSoundUpdate: {
			const sound = { id: '123456789', name: 'Test Sound', guildId: guild.id };
			return eventName === Events.GuildSoundboardSoundUpdate
				? [sound, sound]
				: [sound];
		}
		case Events.GuildSoundboardSoundsUpdate:
		case Events.SoundboardSounds:
			return [new Collection(), guild];

		// Poll Votes
		case Events.MessagePollVoteAdd:
		case Events.MessagePollVoteRemove: {
			const pollAnswer = { id: 1, text: 'Option 1' };
			return [pollAnswer, user.id];
		}

		// Shard Events
		case Events.ShardDisconnect:
			return [{ code: 1000, reason: 'Normal' }, 0];
		case Events.ShardError:
			return [new Error('Shard Error'), 0];
		case Events.ShardReady:
			return [0, new Set()];
		case Events.ShardReconnecting:
			return [0];
		case Events.ShardResume:
			return [0, 10];
		case Events.CacheSweep:
			return ['Swept cache for testing'];

		// Subscriptions
		case Events.SubscriptionCreate:
		case Events.SubscriptionDelete:
		case Events.SubscriptionUpdate: {
			const subscription = {
				id: '123456789',
				userId: user.id,
				skuId: '987654321',
			};
			return eventName === Events.SubscriptionUpdate
				? [subscription, subscription]
				: [subscription];
		}

		// Voice
		case Events.VoiceChannelEffectSend:
			return [
				{
					channelId: channel.id,
					guildId: guild.id,
					emoji: { name: '🎉' },
					userId: user.id,
				},
			];
		case Events.VoiceServerUpdate:
			return [
				{
					token: 'test_token',
					guildId: guild.id,
					endpoint: 'test.endpoint.discord.gg',
				},
			];

		// Other App / Integrations
		case Events.ApplicationCommandPermissionsUpdate:
			return [
				{
					id: '123456789',
					applicationId: client.user.id,
					guildId: guild.id,
					permissions: [],
				},
			];

		// Fallback for unsupported events
		default:
			logger.warn(
				`Event '${eventName}' not explicitly supported, using basic mock.`,
				{
					label: 'core:helpers:events',
				},
			);
			return [guild || channel || user || member || client];
	}
}

module.exports = { createMockEventArgs, getEventScenarios, EVENT_SCENARIOS };
