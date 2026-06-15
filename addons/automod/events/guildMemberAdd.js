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
const { BaseEvent } = require('kythia-core');
function isGibberish(username) {
	if (/\d{5,}/.test(username)) return true;
	if (/[bcdfghjklmnpqrstvwxyz]{5,}/i.test(username)) return true;
	return false;
}
class GuildMemberAddEvent extends BaseEvent {
	async execute(member) {
		const container = this.container;
		const _bot = {
			client: this.client,
			container: this.container,
		};
		const { models, logger } = container;
		const { ServerSetting } = models;
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
					if (member.kickable)
						await member.kick('AntiNuke: botAdd module triggered');
					try {
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
							const executor = entry.executor;
							const isWhitelisted = config.whitelistedUsers?.includes(
								executor.id,
							);
							if (!isWhitelisted && executor.id !== this.client.user.id) {
								const executorMember =
									await container.helpers.discord.getMemberSafe(
										member.guild,
										executor.id,
									);
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
				return;
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
							executor: this.client.user,
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
			await container.helpers.discord.refreshObjectSafe(member.user, true);
			const ageMs = Date.now() - member.user.createdTimestamp;
			const minAgeMs = (mod.minAgeDays || 7) * 24 * 60 * 60 * 1000;
			const isTooNew = ageMs < minAgeMs;
			const hasNoAvatar = !member.user.avatar;
			const hasNoBanner = !member.user.banner;
			const avatarMatch = mod.requireNoAvatar ? hasNoAvatar : true;
			const bannerMatch = mod.requireNoBanner ? hasNoBanner : true;
			const usernameNgawur = isGibberish(member.user.username);
			const gibberishMatch = mod.detectGibberish ? usernameNgawur : true;
			if (isTooNew && avatarMatch && bannerMatch && gibberishMatch) {
				const reason = `[AntiNuke] fakeAccount: Account detected as fake on join.`;
				const actioned = await executeAction(
					member.guild,
					member,
					mod.action,
					reason,
				);
				if (actioned) {
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
	}
}
module.exports = GuildMemberAddEvent;
