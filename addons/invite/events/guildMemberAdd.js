/**
 * @namespace: addons/invite/events/guildMemberAdd.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const InviteModel = require('../database/models/Invite');
const { getGuildInviteCache, refreshGuildInvites } = require('../helpers');
const ServerSetting = require('@coreModels/ServerSetting');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const { t } = require('@coreHelpers/translator');

const FAKE_ACCOUNT_AGE_DAYS = 7;

module.exports = async (bot, member) => {
    if (!member || !member.guild) return;
    const guild = member.guild;

    let inviteChannelId = null;
    let setting;
    try {
        setting = await ServerSetting.getCache({ guildId: guild.id });
        inviteChannelId = setting?.inviteChannelId;
    } catch (e) {}

    if (!setting.inviteChannelId || !setting.invitesOn) return;

    const me = guild.members.me || (await guild.members.fetchMe());
    if (!me.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        console.warn(`[INVITE TRACKER] Missing 'Manage Guild' permission in ${guild.name}`);
    }

    const cacheBefore = getGuildInviteCache(guild.id);

    let inviterId = null;
    let inviterUser = null;
    let inviteType = 'unknown';
    let inviteCode = null;

    try {
        const invitesNow = await guild.invites.fetch();

        // 1. Try to detect which invite was used
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

        // 2. If not found, check for vanity
        if (!inviterId) {
            if (guild.vanityURLCode) {
                try {
                    const vanity = await guild.fetchVanityData();
                    if (vanity && vanity.uses > (cacheBefore.get('VANITY')?.uses ?? 0)) {
                        inviteType = 'vanity';
                        inviteCode = guild.vanityURLCode;
                    }
                } catch (e) {}
            }
        }

        // 3. If still not found, check if it's a bot join (oauth) or unknown
        if (!inviterId && inviteType === 'unknown') {
            inviteType = member.user.bot ? 'oauth' : 'unknown';
        }

        // 4. Update invite stats in DB
        let isFake = false;
        let accountAgeDays = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
        if (inviterId) {
            isFake = accountAgeDays < FAKE_ACCOUNT_AGE_DAYS;
            const [inviteData] = await InviteModel.findOrCreate({
                where: { guildId: guild.id, userId: inviterId },
            });

            if (isFake) {
                await inviteData.increment('fake');
                console.log(`[INVITE TRACKER] ${member.user.tag} joined (FAKE), invited by user ${inviterId}`);
            } else {
                await inviteData.increment('invites');
                console.log(`[INVITE TRACKER] ${member.user.tag} joined (real), invited by user ${inviterId}`);
            }
        }

        // 5. Send professional embed to invite channel if set
        if (inviteChannelId) {
            const channel = guild.channels.cache.get(inviteChannelId);
            if (channel && channel.isTextBased && channel.viewable) {
                let embedDesc = '';
                let title = await t(guild, 'invite.events.guildMemberAdd.tracker.title');
                let accountAgeStr = await t(guild, 'invite.events.guildMemberAdd.tracker.account.age', {
                    days: Math.floor(accountAgeDays),
                });

                if (inviterId) {
                    // Normal invite
                    let inviteTypeStr = isFake
                        ? await t(guild, 'invite.events.guildMemberAdd.tracker.type.fake')
                        : await t(guild, 'invite.events.guildMemberAdd.tracker.type.real');
                    embedDesc =
                        `## ${title}\n` +
                        (await t(guild, 'invite.events.guildMemberAdd.tracker.joined.by', {
                            user: `<@${member.id}>`,
                            username: member.user.username,
                            inviter: `<@${inviterId}>`,
                            inviterTag: inviterUser?.tag || inviterId,
                            inviteType: inviteTypeStr,
                        })) +
                        '\n' +
                        (await t(guild, 'invite.events.guildMemberAdd.tracker.code', { code: inviteCode })) +
                        '\n' +
                        accountAgeStr;
                } else if (inviteType === 'vanity') {
                    embedDesc =
                        `## ${title}\n` +
                        (await t(guild, 'invite.events.guildMemberAdd.tracker.joined.vanity', {
                            user: `<@${member.id}>`,
                            username: member.user.username,
                            code: inviteCode,
                        })) +
                        '\n' +
                        accountAgeStr;
                } else if (inviteType === 'oauth') {
                    embedDesc =
                        `## ${title}\n` +
                        (await t(guild, 'invite.events.guildMemberAdd.tracker.joined.oauth', {
                            user: `<@${member.id}>`,
                            username: member.user.username,
                        })) +
                        '\n' +
                        accountAgeStr;
                } else {
                    embedDesc =
                        `## ${title}\n` +
                        (await t(guild, 'invite.events.guildMemberAdd.tracker.joined.unknown', {
                            user: `<@${member.id}>`,
                            username: member.user.username,
                        })) +
                        '\n' +
                        accountAgeStr;
                }

                const embed = new EmbedBuilder()
                    .setColor(kythia?.bot?.color || 0x2b2d31)
                    .setAuthor({ name: member.user.tag, iconURL: member.user.displayAvatarURL() })
                    .setDescription(embedDesc)
                    .setTimestamp();

                channel.send({ embeds: [embed] }).catch(() => {});
            }
        }
    } catch (err) {
        // Professional error embed to invite channel if possible
        if (inviteChannelId) {
            try {
                const channel = guild.channels.cache.get(inviteChannelId);
                if (channel && channel.isTextBased && channel.viewable) {
                    const embed = new EmbedBuilder()
                        .setColor(0xed4245)
                        .setDescription(
                            `## ${await t(guild, 'invite.events.guildMemberAdd.tracker.error.title')}\n` +
                                (await t(guild, 'invite.events.guildMemberAdd.tracker.error.desc'))
                        )
                        .setTimestamp();
                    channel.send({ embeds: [embed] }).catch(() => {});
                }
            } catch {}
        }
        console.error(`[INVITE TRACKER] Error on guildMemberAdd for ${guild.name}:`, err);
    } finally {
        await refreshGuildInvites(guild);
    }
};
