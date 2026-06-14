/**
 * @namespace: addons/automod/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { automodSystem } = require('../helpers/automod');

const { BaseEvent } = require('kythia-core');

class MessageCreateEvent extends BaseEvent {
	async execute(message) {
		const container = this.container;
		const _bot = { client: this.client, container: this.container };

		const client = this.client;
		const { helpers } = container;
		const { isOwner } = helpers.discord;

		if (!message.guild) return;
		if (message.author?.bot) return;

		// Skip automod for owners and members with admin/manage guild permissions
		if (
			isOwner(message.author.id) ||
			message.member?.permissions.has(['Administrator', 'ManageGuild'])
		) {
			return;
		}

		try {
			await automodSystem(message, client);
		} catch (error) {
			container.logger.error(
				`Error in messageCreate handler: ${error.message || error}`,
				{
					label: 'automod',
				},
			);
		}
	}
}

module.exports = MessageCreateEvent;
