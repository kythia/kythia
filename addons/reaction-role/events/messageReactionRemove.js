/**
 * @namespace: addons/reaction-role/events/messageReactionRemove.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseEvent } = require('kythia-core');

class MessageReactionRemoveEvent extends BaseEvent {
	async execute(reaction, user) {
		const container = this.container;
		const _bot = { client: this.client, container: this.container };

		const { models, logger } = container;
		const { ReactionRole } = models;

		try {
			if (!user || user.bot) return;

			// Handle partials
			if (reaction.partial) {
				try {
					await reaction.fetch();
				} catch (error) {
					logger.error(`Error: ${error.message || error}`, {
						label: 'reactionRole:fetchMessage',
					});
					return;
				}
			}

			if (reaction.message.partial) {
				try {
					await reaction.message.fetch();
				} catch (error) {
					logger.error(`Error: ${error.message || error}`, {
						label: 'reactionRole:fetchMessagePartial',
					});
					return;
				}
			}

			const { guildId, id: messageId } = reaction.message;
			if (!guildId) return;

			const emojiIdentifier = reaction.emoji.toString();

			const rr = await ReactionRole.getCache({
				where: {
					guildId,
					messageId,
					emoji: emojiIdentifier,
				},
			});

			if (rr) {
				const member = await reaction.message.guild.members.fetch(user.id);
				if (member) {
					await member.roles.remove(rr.roleId).catch((err) => {
						logger.warn(
							`Failed to remove role ${rr.roleId} from user ${user.id}: ${err.message}`,
							{ label: 'reactionRole:removeRole' },
						);
					});
				}
			}
		} catch (err) {
			logger.error(`Error: ${err.message || err}`, {
				label: 'reactionRole:messageReactionRemove',
			});
		}
	}
}

module.exports = MessageReactionRemoveEvent;
