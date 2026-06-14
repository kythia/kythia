/**
 * @namespace: addons/automod/events/messageUpdate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { automodSystem } = require('../helpers/automod');

const { BaseEvent } = require('kythia-core');

class MessageUpdateEvent extends BaseEvent {
	async execute(_oldMessage, newMessage) {
		const container = this.container;
		const bot = { client: this.client, container: this.container };

		const client = this.client;
		const { helpers } = container;
		const { isOwner } = helpers.discord;

		if (!newMessage?.author || !newMessage.guild) return;
		if (!newMessage.author || newMessage.author.bot) return;

		if (
			isOwner(newMessage.author.id) ||
			newMessage.member?.permissions.has(['Administrator', 'ManageGuild'])
		) {
			return;
		}

		try {
			await automodSystem(newMessage, client);
		} catch (error) {
			container.logger.error(
				`Error in messageUpdate handler:${error.message || error}`,
				{
					label: 'Automod',
				},
			);
		}
	}
}

module.exports = MessageUpdateEvent;
