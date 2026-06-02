/**
 * @namespace: addons/reaction-role/events/messageReactionAdd.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

module.exports = async (bot, reaction, user) => {
	const container = bot.client.container;
	const { models, logger } = container;
	const { ReactionRole, ReactionRolePanel } = models;

	try {
		// Ignore bots
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

		// Determine the emoji string used in DB
		// If it's a custom emoji, we might have stored it as <a:name:id> or <:name:id> or just id?
		// In the add command, we used `emojiInput` directly.
		// If the user input was an emoji char, it's that char.
		// If it was a custom emoji string, it's that string.
		// The reaction.emoji.toString() usually gives the formatted string for custom emojis, or the char for unicode.
		const emojiIdentifier = reaction.emoji.toString();

		const rr = await ReactionRole.getCache({
			where: {
				guildId,
				messageId,
				// We try to match leniently? Or strictly?
				// Let's assume strict match on what was stored.
				// But we need to handle the potential formats.
				emoji: emojiIdentifier, // Try exact match first
			},
		});

		if (rr) {
			const member = await reaction.message.guild.members
				.fetch(user.id)
				.catch(() => null);
			if (!member) return;

			// --- Panel whitelist / blacklist enforcement ---
			if (rr.panelId != null) {
				try {
					const panel = await ReactionRolePanel.findByPk(rr.panelId);
					if (panel) {
						const memberRoleIds = member.roles.cache.map((r) => r.id);

						// Blacklist check — if member has ANY blacklisted role, skip
						const blacklist = panel.blacklistRoles || [];
						if (
							blacklist.length > 0 &&
							memberRoleIds.some((id) => blacklist.includes(id))
						) {
							return;
						}

						// Whitelist check — if defined, member must have AT LEAST ONE whitelisted role
						const whitelist = panel.whitelistRoles || [];
						if (
							whitelist.length > 0 &&
							!memberRoleIds.some((id) => whitelist.includes(id))
						) {
							return;
						}
					}
				} catch (err) {
					logger.warn(`Error: ${err.message || err}`, {
						label: 'reactionRole:panelCheck',
					});
					// Non-blocking — fall through and assign role anyway
				}
			}

			await member.roles.add(rr.roleId).catch((err) => {
				logger.warn(
					`Failed to add role ${rr.roleId} to user ${user.id}: ${err.message}`,
					{ label: 'reactionRole:addRole' },
				);
			});
		}
	} catch (err) {
		logger.error(`Error: ${err.message || err}`, {
			label: 'reactionRole:messageReactionAdd',
		});
	}
};
