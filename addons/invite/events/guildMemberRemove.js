/**
 * @namespace: addons/invite/events/guildMemberRemove.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const Invite = require('../database/models/Invite');
const InviteHistory = require('../database/models/InviteHistory');

module.exports = async (bot, member) => {
    if (!member || !member.guild) return;
    const { guild, id: memberId } = member;

    const history = await InviteHistory.getCache({
        guildId: guild.id,
        memberId: memberId,
        status: 'active',
    });

    if (history && history.inviterId) {
        history.status = 'left';
        await history.save();

        const inviterStats = await Invite.getCache({
            guildId: guild.id,
            userId: history.inviterId,
        });

        if (inviterStats) {
            const accountAgeDays = (Date.now() - member.user.createdTimestamp) / (1000 * 60 * 60 * 24);
            const wasFake = accountAgeDays < 7;

            if (wasFake) {
                await inviterStats.decrement('fake');
            } else {
                await inviterStats.decrement('invites');
            }
            await inviterStats.increment('leaves');

            console.log(`[INVITE TRACKER] ${member.user.tag} left. Updated stats for inviter ${history.inviterId}.`);
        }
    } else {
        console.log(`[INVITE TRACKER] ${member.user.tag} left, but couldn't find their inviter history.`);
    }
};
