/**
 * @namespace: addons/automod/events/guildMemberAdd.js
 * @type: Event Handler
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { AuditLogEvent } = require('discord.js');
const {
	getConfig,
	executeAction,
	sendAlert,
	_track,
	_resetCount,
} = require('../helpers/antinuke');

function isGibberish(username) {
	// A simple heuristic for "ngawur" usernames:
	// 1. Contains 5 or more consecutive digits (e.g., jhondoe12345)
	if (/\d{5,}/.test(username)) return true;
	// 2. Contains 5 or more consecutive consonants (e.g., jklmzq)
	if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(username)) return true;

	return false;
}

module.exports = {
	name: 'guildMemberAdd',
	async execute(member, bot) {
		const container = bot.client.container;
		const { ServerSetting } = container.models;
		const { logger } = container;

		try {
			const settings = await ServerSetting.getCache({
				guildId: member.guild.id,
			});
			if (!settings) return;

			const config = getConfig(settings);
			if (!config.enabled) return;

			// ==========================================
			// 1. Anti Bot Add (botAdd)
			// ==========================================
			if (member.user.bot) {
				const botMod = config.modules.botAdd;
				if (botMod?.enabled) {
					// Kick the bot immediately
					if (member.kickable)
						await member.kick('AntiNuke: botAdd module triggered');

					// Try to find who added the bot
					try {
						// Wait a tiny bit to ensure audit logs are ready
						await new Promise((r) => setTimeout(r, 1500));
						const logs = await member.guild.fetchAuditLogs({
							type: AuditLogEvent.BotAdd,
							limit: 1,
						});
						const entry = logs.entries.first();

						if (
							entry &&
							entry.target?.id === member.user.id &&
							entry.executor
						) {
							// Found the executor! Punish them
							const executor = entry.executor;
							const isWhitelisted = config.whitelistedUsers?.includes(
								executor.id,
							);

							if (!isWhitelisted && executor.id !== bot.user.id) {
								const executorMember = await member.guild.members
									.fetch(executor.id)
									.catch(() => null);
								const reason = `[AntiNuke] botAdd: Unauthorized bot addition (${member.user.tag})`;
								const actioned = await executeAction(
									member.guild,
									executorMember,
									botMod.action,
									reason,
								);

								if (actioned) {
									await sendAlert(member.guild, config, settings, {
										moduleName: 'botAdd',
										executor,
										action: botMod.action,
										detail: `Added bot: ${member.user.tag} (${member.user.id})`,
									});
								}
							}
						}
					} catch (e) {
						logger.error(`Failed to punish executor for botAdd: ${e.message}`);
					}
				}
				return; // Stop processing further for bots
			}

			// ==========================================
			// 2. Mass Join / Raid Lockdown (massJoin)
			// ==========================================
			const massMod = config.modules.massJoin;
			if (massMod?.enabled) {
				const count = _track(
					member.guild.id,
					'massJoin',
					'global',
					massMod.window,
				);
				if (count >= massMod.threshold) {
					_resetCount(member.guild.id, 'massJoin', 'global');
					const reason = `[AntiNuke] massJoin: ${count} joins in ${massMod.window / 1000}s`;
					const actioned = await executeAction(
						member.guild,
						null,
						massMod.action,
						reason,
					);

					if (actioned) {
						await sendAlert(member.guild, config, settings, {
							moduleName: 'massJoin',
							executor: bot.user, // System executed
							action: massMod.action,
							detail: `Triggered by ${count} joins within ${massMod.window / 1000}s. Server Verification Level is now Highest.`,
						});
					}
				}
			}

			// ==========================================
			// 3. Fake Account (fakeAccount)
			// ==========================================
			const mod = config.modules.fakeAccount;
			if (!mod?.enabled) return;

			// Ensure user data is fully fetched (especially banner)
			await member.user.fetch(true).catch(() => null);

			// Criteria 1: Account Age
			const ageMs = Date.now() - member.user.createdTimestamp;
			const minAgeMs = (mod.minAgeDays || 7) * 24 * 60 * 60 * 1000;
			const isTooNew = ageMs < minAgeMs;

			// Criteria 2: No Profile Picture & No Banner (if configured)
			const hasNoAvatar = !member.user.avatar;
			const hasNoBanner = !member.user.banner;
			const avatarMatch = mod.requireNoAvatar ? hasNoAvatar : true;
			const bannerMatch = mod.requireNoBanner ? hasNoBanner : true;

			// Criteria 3: Gibberish/Random Username (if configured)
			const usernameNgawur = isGibberish(member.user.username);
			const gibberishMatch = mod.detectGibberish ? usernameNgawur : true;

			if (isTooNew && avatarMatch && bannerMatch && gibberishMatch) {
				const reason = `[AntiNuke] fakeAccount: Account detected as fake on join.`;

				// Execute configured action
				const actioned = await executeAction(
					member.guild,
					member,
					mod.action,
					reason,
				);

				if (actioned) {
					// Log the action
					const detail = `User joined with age ${Math.floor(ageMs / (1000 * 60 * 60 * 24))} days, no avatar/banner, and username "${member.user.username}".`;
					await sendAlert(member.guild, config, settings, {
						moduleName: 'fakeAccount',
						executor: member.user,
						action: mod.action,
						detail,
					});
				}
			}
		} catch (err) {
			logger.error(
				`Error in fakeAccount check (guildMemberAdd): ${err.message || err}`,
				{
					label: 'automod',
				},
			);
		}
	},
};
