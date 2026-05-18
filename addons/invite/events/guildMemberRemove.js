/**
 * @namespace: addons/invite/events/guildMemberRemove.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { MessageFlags } = require('discord.js');
const { applyTemplate } = require('../helpers');

module.exports = async (bot, member) => {
	if (!member?.guild) return;
	const { guild, id: memberId } = member;

	const container = bot.client.container;
	const { t, models, helpers, logger } = container;
	const { Invite, InviteHistory, ServerSetting, InviteSetting } = models;
	const { simpleContainer } = helpers.discord;

	let inviteChannelId = null;
	let inviteSetting = null;

	try {
		const [setting, iSetting] = await Promise.all([
			ServerSetting.getCache({ guildId: guild.id }),
			InviteSetting.findOne({ where: { guildId: guild.id } }).catch(() => null),
		]);
		if (!setting?.invitesOn) return;
		inviteChannelId = setting.inviteChannelId;
		inviteSetting = iSetting;
	} catch (_e) {}

	const history = await InviteHistory.getCache({
		guildId: guild.id,
		memberId: memberId,
		status: 'active',
	});

	let logMessage = '';

	if (history?.inviterId) {
		history.status = 'left';
		await history.save();

		const [inviterStats] = await Invite.findOrCreateWithCache({
			where: { guildId: guild.id, userId: history.inviterId },
			defaults: { guildId: guild.id, userId: history.inviterId },
		});

		if (inviterStats) {
			const wasFake = history.isFake;

			if (wasFake) {
				inviterStats.fake = Math.max(0, (inviterStats.fake || 0) - 1);
			} else {
				inviterStats.invites = Math.max(0, (inviterStats.invites || 0) - 1);
			}

			inviterStats.leaves = (inviterStats.leaves || 0) + 1;

			inviterStats.changed('invites', true);
			inviterStats.changed('fake', true);

			await inviterStats.save();

			logger.info(
				`${member?.user?.username} left. Deducted ${wasFake ? 'fake' : 'real'} invite from ${history.inviterId}.`,
				{ label: 'Invite Tracker' },
			);

			// ── Template variables ──
			const inviterTotalInvites =
				(inviterStats.invites || 0) + (inviterStats.bonus || 0);

			const templateVars = {
				user: `<@${member?.id}>`,
				username: member?.user?.username,
				inviter: `<@${history?.inviterId}>`,
				inviterTag: history.inviterId,
				invites: inviterTotalInvites,
				code: history.inviteCode || 'unknown',
				type: wasFake ? 'fake' : 'real',
			};

			// ── Use custom leaveMessage if set, otherwise standard text ──
			if (inviteSetting?.leaveMessage?.trim()) {
				logMessage = applyTemplate(inviteSetting.leaveMessage, templateVars);
			} else {
				const title = await t(
					guild,
					'invite.events.guildMemberRemove.tracker.title',
				);
				const leftMsg = await t(
					guild,
					'invite.events.guildMemberRemove.tracker.left',
					{
						user: templateVars?.user,
						username: templateVars?.username,
						inviter: templateVars?.inviter,
					},
				);
				const typeMsg = wasFake ? '(Fake)' : '(Real)';
				logMessage = `## ${title}\n${leftMsg} ${typeMsg}`;
			}
		}
	} else {
		logger.info(
			`${member?.user?.username} left, but no active invite history found.`,
			{ label: 'Invite Tracker' },
		);

		if (inviteSetting?.leaveMessage?.trim()) {
			// Use custom message even for unknown-inviter leaves
			const templateVars = {
				user: `<@${member?.id}>`,
				username: member?.user?.username,
				inviter: 'Unknown',
				inviterTag: 'Unknown',
				invites: '?',
				code: 'unknown',
				type: 'unknown',
			};
			logMessage = applyTemplate(inviteSetting.leaveMessage, templateVars);
		} else {
			const title = await t(
				guild,
				'invite.events.guildMemberRemove.tracker.title',
			);
			const leftUnknown = await t(
				guild,
				'invite.events.guildMemberRemove.tracker.unknown',
				{
					user: `<@${member?.id}>`,
					username: member?.user?.username,
				},
			);
			logMessage = `## ${title}\n${leftUnknown}`;
		}
	}

	if (inviteChannelId && logMessage) {
		const channel = await guild.channels
			.fetch(inviteChannelId)
			.catch(() => null);
		if (channel?.isTextBased && channel.viewable) {
			try {
				const components = await simpleContainer(member, logMessage, {
					color: 'Red',
				});
				await channel.send({
					components,
					allowedMentions: { parse: [] },
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (error) {
				logger.error(
					`Error sending invite log to channel ${inviteChannelId} in ${guild?.name}: ${error.message || error}`,
					{ label: 'Invite Tracker' },
				);
			}
		} else {
			logger.warn(
				`Invite channel ${inviteChannelId} not found in ${guild?.name}`,
				{ label: 'Invite Tracker' },
			);
		}
	}
};
