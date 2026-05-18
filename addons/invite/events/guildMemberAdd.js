/**
 * @namespace: addons/invite/events/guildMemberAdd.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	getGuildInviteCache,
	refreshGuildInvites,
	applyTemplate,
} = require('../helpers');
const { PermissionsBitField, MessageFlags } = require('discord.js');

module.exports = async (bot, member) => {
	if (!member?.guild) return;
	const guild = member.guild;

	const container = bot.client.container;
	const { models, helpers, t, logger, kythiaConfig } = container;
	const { ServerSetting, Invite, InviteHistory, InviteSetting } = models;
	const { simpleContainer } = helpers.discord;
	const { convertColor } = helpers.color;

	let inviteChannelId = null;
	let setting;
	let inviteSetting;

	try {
		[setting, inviteSetting] = await Promise.all([
			ServerSetting.getCache({ guildId: guild.id }),
			InviteSetting.findOne({ where: { guildId: guild.id } }).catch(() => null),
		]);
		inviteChannelId = setting?.inviteChannelId;
	} catch (e) {
		logger.error(`Error fetching server setting: ${e.message}`, {
			label: 'Invite Tracker',
		});
	}

	if (!setting?.invitesOn) {
		return;
	}

	const fakeThreshold = inviteSetting?.fakeThreshold ?? 7;

	const me = guild.members.me || (await guild.members.fetchMe());
	if (!me.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
		logger.warn(`Missing 'Manage Guild' permission in ${guild.name}`, {
			label: 'invite tracker',
		});
	}

	const cacheBefore = getGuildInviteCache(guild.id);

	let inviterId = null;
	let inviterUser = null;
	let inviteType = 'unknown';
	let inviteCode = null;

	try {
		const invitesNow = await guild.invites.fetch();

		for (const invite of invitesNow.values()) {
			const before = cacheBefore.get(invite.code);
			const beforeUses = before?.uses ?? 0;

			if (invite.uses > beforeUses) {
				inviterId = invite.inviter?.id || before?.inviterId || null;
				inviterUser = invite.inviter || null;
				inviteType = 'invite';
				inviteCode = invite.code;
				break;
			}
		}

		if (!inviterId && guild.vanityURLCode) {
			try {
				const vanity = await guild.fetchVanityData();
				if (vanity && vanity.uses > (cacheBefore.get('VANITY')?.uses ?? 0)) {
					inviteType = 'vanity';
					inviteCode = guild.vanityURLCode;
				}
			} catch (_e) {}
		}

		if (!inviterId && inviteType === 'unknown') {
			inviteType = member.user.bot ? 'oauth' : 'unknown';
		}

		const accountAgeDays =
			(Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
		let isFake = false;

		if (inviterId) {
			isFake = accountAgeDays < fakeThreshold;

			try {
				const [inviteData] = await Invite.findOrCreateWithCache({
					where: { guildId: guild.id, userId: inviterId },
					defaults: {
						guildId: guild.id,
						userId: inviterId,
					},
				});

				if (isFake) {
					inviteData.fake = (inviteData.fake || 0) + 1;
				} else {
					inviteData.invites = (inviteData.invites || 0) + 1;
				}

				if (inviteData.changed && typeof inviteData.changed === 'function') {
					inviteData.changed('invites', true);
					inviteData.changed('fake', true);
				}

				await inviteData.save();

				await InviteHistory.create({
					guildId: guild.id,
					inviterId: inviterId,
					memberId: member.id,
					inviteCode: inviteCode || null,
					joinType: isFake ? 'fake' : 'new',
					status: 'active',
					isFake: isFake,
				});
			} catch (dbErr) {
				logger.error(`DB CRASH: ${dbErr.message || dbErr}`, {
					label: 'Invite Tracker',
				});
			}
		} else {
			logger.warn(`No Inviter ID found, skipping DB operations.`, {
				label: 'Invite Tracker',
			});
		}

		if (inviteChannelId) {
			const channel = await guild.channels
				.fetch(inviteChannelId)
				.catch(() => null);
			if (channel?.isTextBased && channel.viewable) {
				// ── Resolve inviter's total invites (for {invites} placeholder) ──
				let inviterTotalInvites = 0;
				if (inviterId) {
					try {
						const inviterRow = await Invite.getCache({
							guildId: guild.id,
							userId: inviterId,
						});
						inviterTotalInvites =
							(inviterRow?.invites || 0) + (inviterRow?.bonus || 0);
					} catch (_e) {}
				}

				// ── Template variables ──
				const inviteTypeLabel = isFake
					? await t(guild, 'invite.events.guildMemberAdd.tracker.type.fake')
					: inviteType === 'vanity'
						? 'vanity'
						: inviteType === 'oauth'
							? 'oauth'
							: inviteType === 'unknown'
								? 'unknown'
								: await t(
										guild,
										'invite.events.guildMemberAdd.tracker.type.real',
									);

				const templateVars = {
					user: `<@${member?.id}>`,
					username: member?.user?.username,
					inviter: inviterId ? `<@${inviterId}>` : 'Unknown',
					inviterTag:
						inviterUser?.username || inviterUser?.tag || inviterId || 'Unknown',
					invites: inviterTotalInvites,
					code: inviteCode || 'unknown',
					type: inviteTypeLabel,
				};

				let finalContent;

				// ── Use custom joinMessage if set, otherwise fall back to standard text ──
				if (inviteSetting?.joinMessage?.trim()) {
					finalContent = applyTemplate(inviteSetting.joinMessage, templateVars);
				} else {
					// Standard text (i18n)
					const title = await t(
						guild,
						'invite.events.guildMemberAdd.tracker.title',
					);
					const accountAgeStr = await t(
						guild,
						'invite.events.guildMemberAdd.tracker.account.age',
						{ days: Math.floor(accountAgeDays) },
					);

					let embedDesc = '';
					if (inviterId) {
						const joinedBy = await t(
							guild,
							'invite.events.guildMemberAdd.tracker.joined.by',
							{
								user: templateVars.user,
								username: templateVars.username,
								inviter: templateVars.inviter,
								inviterTag: templateVars.inviterTag,
								inviteType: inviteTypeLabel,
							},
						);
						const codeUsed = await t(
							guild,
							'invite.events.guildMemberAdd.tracker.code',
							{ code: inviteCode },
						);
						embedDesc = `${joinedBy}\n${codeUsed}\n${accountAgeStr}`;
					} else if (inviteType === 'vanity') {
						const joinedVanity = await t(
							guild,
							'invite.events.guildMemberAdd.tracker.joined.vanity',
							{
								user: templateVars.user,
								username: templateVars.username,
								code: inviteCode,
							},
						);
						embedDesc = `${joinedVanity}\n${accountAgeStr}`;
					} else if (inviteType === 'oauth') {
						const joinedOauth = await t(
							guild,
							'invite.events.guildMemberAdd.tracker.joined.oauth',
							{ user: templateVars.user, username: templateVars.username },
						);
						embedDesc = `${joinedOauth}\n${accountAgeStr}`;
					} else {
						const joinedUnknown = await t(
							guild,
							'invite.events.guildMemberAdd.tracker.joined.unknown',
							{ user: templateVars.user, username: templateVars.username },
						);
						embedDesc = `${joinedUnknown}\n${accountAgeStr}`;
					}

					finalContent = `## ${title}\n${embedDesc}`;
				}

				const components = await simpleContainer(member, finalContent, {
					color: convertColor(kythiaConfig.bot.color, {
						from: 'hex',
						to: 'decimal',
					}),
				});

				channel.send({
					components: components,
					allowedMentions: {
						parse: [],
					},
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				logger.warn(
					`Invite channel ${inviteChannelId} not found in ${guild?.name}`,
					{ label: 'Invite Tracker' },
				);
			}
		}
	} catch (err) {
		logger.error(`Error guildMemberAdd: ${err.message || err}`, {
			label: 'Invite Tracker',
		});
	} finally {
		await refreshGuildInvites(guild);
		logger.info(`Invite Cache Refreshed.`, { label: 'Invite Tracker' });
	}
};
