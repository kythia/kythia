/**
 * @namespace: addons/invite/helpers/index.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const invitesCache = new Map();
function getGuildInviteCache(guildId) {
	if (!invitesCache.has(guildId)) invitesCache.set(guildId, new Map());
	return invitesCache.get(guildId);
}
async function refreshGuildInvites(guild) {
	try {
		const { getAllInvitesSafe } = guild.client.container.helpers.discord;
		const invites = await getAllInvitesSafe(guild);
		if (!invites) return;
		const cache = getGuildInviteCache(guild.id);
		cache.clear();
		for (const invite of invites.values()) {
			cache.set(invite.code, {
				uses: invite.uses || 0,
				inviterId: invite.inviter?.id || null,
			});
		}

		// Also refresh vanity
		if (guild.vanityURLCode) {
			try {
				const vanity = await guild.fetchVanityData();
				cache.set('VANITY', {
					uses: vanity?.uses || 0,
					inviterId: null,
				});
			} catch (_e) {}
		}
	} catch (_e) {}
}

/**
 * Compare before/after invite caches to determine which invite code was used.
 * @param {{ cacheBefore: Map, invitesNow: import('discord.js').Collection, vanityUsesBefore: number, vanityUsesNow: number, guild: import('discord.js').Guild, member: import('discord.js').GuildMember }} opts
 * @returns {{ inviterId: string|null, inviteCode: string|null, inviteType: string }}
 */
function resolveInviter({
	cacheBefore,
	invitesNow,
	vanityUsesBefore,
	vanityUsesNow,
	member,
}) {
	let inviterId = null;
	let inviteCode = null;
	let inviteType = 'unknown';
	for (const invite of invitesNow.values()) {
		const before = cacheBefore.get(invite.code);
		const beforeUses = before?.uses ?? 0;
		if (invite.uses > beforeUses) {
			inviterId = invite.inviter?.id || before?.inviterId || null;
			inviteCode = invite.code;
			inviteType = 'invite';
			break;
		}
	}
	if (!inviteCode && vanityUsesNow > vanityUsesBefore) {
		inviteType = 'vanity';
		inviteCode = null;
	}
	if (!inviteCode && inviteType === 'unknown') {
		inviteType = member.user.bot ? 'oauth' : 'unknown';
	}
	return {
		inviterId,
		inviteCode,
		inviteType,
	};
}

/**
 * Resolve the effective joinType based on whether the member has joined before.
 * @param {string} baseType - 'invite' | 'vanity' | 'oauth' | 'unknown'
 * @param {boolean} isRejoin
 * @param {boolean} isFake
 * @returns {'new'|'rejoin'|'fake'|'vanity'|'oauth'|'unknown'}
 */
function resolveJoinType(baseType, isRejoin, isFake) {
	if (baseType === 'vanity') return 'vanity';
	if (baseType === 'oauth') return 'oauth';
	if (baseType === 'unknown') return 'unknown';
	if (isFake) return 'fake';
	if (isRejoin) return 'rejoin';
	return 'new';
}

/**
 * Apply guild milestone roles to a member based on inviter's current invite count.
 * @param {import('discord.js').GuildMember} member - the inviter
 * @param {object} inviteData - the Invite model row
 * @param {object} inviteSetting - the InviteSetting row
 */
async function applyMilestoneRoles(member, inviteData, inviteSetting) {
	if (!inviteSetting?.milestoneRoles?.length) return;
	const totalInvites = (inviteData.invites || 0) + (inviteData.bonus || 0);
	const milestones = [...inviteSetting.milestoneRoles].sort(
		(a, b) => b.invites - a.invites,
	);
	if (inviteSetting.roleStack) {
		// Stack all earned roles
		for (const m of milestones) {
			if (totalInvites >= m.invites) {
				try {
					if (!member.roles.cache.has(m.roleId)) {
						await member.roles.add(m.roleId);
					}
				} catch (_e) {}
			}
		}
	} else {
		// Only highest earned role
		const highest = milestones.find((m) => totalInvites >= m.invites);
		if (highest) {
			// Add highest
			try {
				if (!member.roles.cache.has(highest.roleId)) {
					await member.roles.add(highest.roleId);
				}
			} catch (_e) {}
			// Remove lower ones
			for (const m of milestones) {
				if (m.roleId !== highest.roleId && member.roles.cache.has(m.roleId)) {
					try {
						await member.roles.remove(m.roleId);
					} catch (_e) {}
				}
			}
		}
	}
}

/**
 * Remove milestone roles when a user's invite count drops (on member leave).
 * @param {import('discord.js').Guild} guild
 * @param {string} inviterId
 * @param {object} inviteData
 * @param {object} inviteSetting
 */
async function revokeMilestoneRoles(
	guild,
	inviterId,
	inviteData,
	inviteSetting,
) {
	if (!inviteSetting?.milestoneRoles?.length) return;
	const totalInvites = (inviteData.invites || 0) + (inviteData.bonus || 0);
	const milestones = [...inviteSetting.milestoneRoles].sort(
		(a, b) => b.invites - a.invites,
	);
	let inviterMember;
	try {
		inviterMember = await guild.client.container.helpers.discord.getMemberSafe(
			guild,
			inviterId,
		);
	} catch (_e) {
		return;
	}
	if (inviteSetting.roleStack) {
		for (const m of milestones) {
			if (totalInvites < m.invites && inviterMember.roles.cache.has(m.roleId)) {
				try {
					await inviterMember.roles.remove(m.roleId);
				} catch (_e) {}
			}
		}
	} else {
		const highest = milestones.find((m) => totalInvites >= m.invites) || null;
		for (const m of milestones) {
			const shouldHave = highest && m.roleId === highest.roleId;
			if (!shouldHave && inviterMember.roles.cache.has(m.roleId)) {
				try {
					await inviterMember.roles.remove(m.roleId);
				} catch (_e) {}
			}
		}
	}
}

/**
 * Apply a custom message template, replacing placeholders.
 * Available: {user}, {username}, {inviter}, {inviterTag}, {invites}, {code}, {type}
 */
function applyTemplate(template, vars) {
	return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}
module.exports = {
	getGuildInviteCache,
	refreshGuildInvites,
	resolveInviter,
	resolveJoinType,
	applyMilestoneRoles,
	revokeMilestoneRoles,
	applyTemplate,
	invitesCache,
};
