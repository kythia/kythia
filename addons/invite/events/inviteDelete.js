/**
 * @namespace: addons/invite/events/inviteDelete.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { getGuildInviteCache } = require('../helpers');

const { BaseEvent } = require('kythia-core');

class InviteDeleteEvent extends BaseEvent {
	async execute(invite) {
		const container = this.container;

		try {
			const cache = getGuildInviteCache(invite.guild.id);
			cache.delete(invite.code);
		} catch {}
	}
}

module.exports = InviteDeleteEvent;
