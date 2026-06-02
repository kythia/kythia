/**
 * @namespace: addons/tempvoice/events/voiceStateUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ChannelType,
	PermissionsBitField,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	TextDisplayBuilder,
	MessageFlags,
} = require('discord.js');

module.exports = async (bot, oldState, newState) => {
	const container = bot.client.container;
	const { models, logger, client, t } = container;
	const { TempVoiceConfig, TempVoiceChannel } = models;

	const member = newState.member || oldState.member;
	if (!member?.guild) return;

	const guild = member.guild;
	const newChannelId = newState.channelId;
	const oldChannelId = oldState.channelId;

	const config = await TempVoiceConfig.getCache({ guildId: guild.id });
	if (!config) return;

	if (newChannelId === config.triggerChannelId && !member.user?.bot) {
		// Prevent spam: if the user already owns an active temp voice channel,
		// move them back to it instead of creating a new one.
		const existingChannel = await TempVoiceChannel.getCache({
			ownerId: member.id,
			guildId: guild.id,
		});
		if (existingChannel) {
			const alreadyOwnedChannel = guild.channels.cache.get(
				existingChannel.channelId,
			);
			if (alreadyOwnedChannel) {
				await member.voice.setChannel(alreadyOwnedChannel).catch(() => {});
			}
			return;
		}

		try {
			const newChannel = await guild.channels.create({
				name: `🎧┃${member.displayName}'s Room`,
				type: ChannelType.GuildVoice,
				parent: config.categoryId,
				permissionOverwrites: [
					{
						id: member.id,
						allow: [
							PermissionsBitField.Flags.ManageChannels,
							PermissionsBitField.Flags.MoveMembers,
							PermissionsBitField.Flags.ViewChannel,
							PermissionsBitField.Flags.Connect,
							PermissionsBitField.Flags.Speak,
						],
					},
					{
						id: guild.roles.everyone,
						allow: [
							PermissionsBitField.Flags.ViewChannel,
							PermissionsBitField.Flags.Connect,
						],
					},
					{
						id: client.user.id,
						allow: [
							PermissionsBitField.Flags.ManageChannels,
							PermissionsBitField.Flags.MoveMembers,
							PermissionsBitField.Flags.ViewChannel,
							PermissionsBitField.Flags.SendMessages,
							PermissionsBitField.Flags.MuteMembers,
							PermissionsBitField.Flags.Speak,
						],
					},
				],
			});

			await member.voice.setChannel(newChannel);

			await TempVoiceChannel.create({
				channelId: newChannel.id,
				guildId: guild.id,
				ownerId: member.id,
			});
		} catch (error) {
			logger.error(
				`Failed to create channel for ${member.user.tag}: ${error.message || error}`,
				{ label: 'tempvoice' },
			);
		}
	}

	if (
		newChannelId &&
		newChannelId !== config.triggerChannelId &&
		!member.user?.bot
	) {
		const mainChannel = await TempVoiceChannel.getCache({
			waitingRoomChannelId: newChannelId,
			guildId: guild.id,
		});

		if (mainChannel) {
			try {
				const owner = await guild.members
					.fetch(mainChannel.ownerId)
					.catch(() => null);
				const ownerChannel = await client.channels
					.fetch(mainChannel.channelId, { force: true })
					.catch(() => null);

				if (owner && ownerChannel) {
					const fakeInteraction = { guild, user: owner.user, client };

					const msgContent = await t(
						fakeInteraction,
						'tempvoice.waiting.join_request',
						{
							owner: `<@${owner.id}>`,
							user: `<@${member.id}>`,
						},
					);

					const containerComponent = new ContainerBuilder()
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(msgContent),
						)
						.addSeparatorComponents(
							new SeparatorBuilder()
								.setSpacing(SeparatorSpacingSize.Small)
								.setDivider(true),
						)
						.addActionRowComponents(
							new ActionRowBuilder().addComponents(
								new ButtonBuilder()
									.setCustomId(
										`tv_waiting_allow:${mainChannel.channelId}:${member.id}`,
									)
									.setLabel(
										await t(fakeInteraction, 'tempvoice.waiting.allow_btn'),
									)
									.setStyle(ButtonStyle.Success)
									.setEmoji('✅'),
								new ButtonBuilder()
									.setCustomId(
										`tv_waiting_deny:${mainChannel.channelId}:${member.id}`,
									)
									.setLabel(
										await t(fakeInteraction, 'tempvoice.waiting.deny_btn'),
									)
									.setStyle(ButtonStyle.Danger)
									.setEmoji('❌'),
							),
						);

					const reqMsg = await ownerChannel.send({
						components: [containerComponent],
						flags: MessageFlags.IsComponentsV2,
					});

					const requests = mainChannel.pendingJoinRequests || {};
					requests[member.id] = reqMsg.id;
					mainChannel.pendingJoinRequests = requests;
					await mainChannel.save();
				}
			} catch (e) {
				logger.error(`Failed to send waiting room notification: ${e.message}`, {
					label: 'tempvoice',
				});
			}
		}
	}

	if (oldChannelId && oldChannelId !== config.triggerChannelId) {
		const activeMainChannel = await TempVoiceChannel.getCache({
			channelId: oldChannelId,
		});

		if (activeMainChannel) {
			const channel = await client.channels
				.fetch(oldChannelId, { force: true })
				.catch(() => null);

			if (channel && channel.members.size === 0) {
				logger.info(
					`[TempVoice] Main channel ${oldChannelId} is now empty, deleting...`,
					{ label: 'tempvoice' },
				);
				await channel.delete('Temp channel empty.');

				if (activeMainChannel.waitingRoomChannelId) {
					const wr = await client.channels
						.fetch(activeMainChannel.waitingRoomChannelId, { force: true })
						.catch(() => null);
					if (wr) await wr.delete('Main temp channel deleted.');
				}

				await activeMainChannel.destroy();
			}
		}

		// Clean up pending join requests on leave
		const mainChannel = await TempVoiceChannel.getCache({
			waitingRoomChannelId: oldChannelId,
			guildId: guild.id,
		});
		if (mainChannel) {
			const requests = mainChannel.pendingJoinRequests || {};
			const messageId = requests[member.id];

			if (messageId) {
				const ownerChannel = await client.channels
					.fetch(mainChannel.channelId, { force: true })
					.catch(() => null);
				if (ownerChannel) {
					const msg = await ownerChannel.messages
						.fetch(messageId)
						.catch(() => null);
					if (msg) await msg.delete().catch(() => {});
				}

				delete requests[member.id];
				mainChannel.pendingJoinRequests = requests;
				await mainChannel.save();
			}
		}
	}
};
