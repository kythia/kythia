/**
 * @namespace: addons/birthday/tasks/announcer.js
 * @type: Scheduled Task
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	AttachmentBuilder,
	SeparatorBuilder,
	ContainerBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
	SeparatorSpacingSize,
	ShardClientUtil,
} = require('discord.js');
// kythia-arts is now imported in the sandboxed queue processor
const { DateTime } = require('luxon');
const { BaseTask } = require('kythia-core');
class AnnouncerTask extends BaseTask {
	task = {
		taskName: 'birthday-announcer',
		schedule: '0 * * * *',
		active: true,
	};
	async execute(container) {
		const { client } = container || this.container;
		const { models, helpers, logger } = container || this.container;
		const { UserBirthday } = models;
		const { t } = container || this.container;
		const { getGuildSafe } = helpers.discord;
		logger.info('🎂 Running birthday announcer...', {
			label: 'birthday',
		});
		const now = DateTime.now();
		const currentDay = now.day;
		const currentMonth = now.month;
		const currentYear = now.year;
		try {
			const birthdays = await UserBirthday.getAllCache({
				where: {
					day: currentDay,
					month: currentMonth,
				},
			});
			if (birthdays.length === 0) return;
			for (const record of birthdays) {
				if (client.shard) {
					const expectedShardId = ShardClientUtil.shardIdForGuildId(
						record.guildId,
						client.shard.count,
					);
					if (!client.shard.ids.includes(expectedShardId)) continue;
				}
				if (record.lastCelebratedYear === currentYear) continue;
				const guild = await getGuildSafe(client, record.guildId);
				if (!guild) continue;
				const { BirthdaySetting } = models;
				let channel = null;
				const setting = await BirthdaySetting.getCache({
					guildId: guild.id,
				});
				if (setting?.channelId) {
					channel = await container.helpers.discord.getChannelSafe(
						guild,
						setting.channelId,
					);
				}
				if (!channel) {
					channel = guild.systemChannel;
				}
				if (!channel) continue;
				try {
					const user = await client.container.helpers.discord.getUserSafe(
						client,
						record.userId,
					);
					if (!user) continue;

					// const roleId = setting?.roleId;
					const pingRoleId = setting?.pingRoleId;
					const showAge = setting?.showAge ?? true;
					let contentMsg = setting?.message;
					const getZodiac = (d, m) => {
						const z = [
							{
								sign: '♑ Capricorn',
								lastDay: 19,
							},
							{
								sign: '♒ Aquarius',
								lastDay: 18,
							},
							{
								sign: '♓ Pisces',
								lastDay: 20,
							},
							{
								sign: '♈ Aries',
								lastDay: 19,
							},
							{
								sign: '♉ Taurus',
								lastDay: 20,
							},
							{
								sign: '♊ Gemini',
								lastDay: 20,
							},
							{
								sign: '♋ Cancer',
								lastDay: 22,
							},
							{
								sign: '♌ Leo',
								lastDay: 22,
							},
							{
								sign: '♍ Virgo',
								lastDay: 22,
							},
							{
								sign: '♎ Libra',
								lastDay: 22,
							},
							{
								sign: '♏ Scorpio',
								lastDay: 21,
							},
							{
								sign: '♐ Sagittarius',
								lastDay: 21,
							},
							{
								sign: '♑ Capricorn',
								lastDay: 31,
							},
						];
						return d > z[m - 1].lastDay ? z[m].sign : z[m - 1].sign;
					};
					let age = '';
					if (record.year && showAge) {
						age = (currentYear - record.year).toString();
					}
					const zodiac = getZodiac(currentDay, currentMonth);
					const ageInfo = age ? `Age: ${age}` : '';
					const zodiacInfo = zodiac ? `Zodiac: ${zodiac}` : '';
					const pingInfo = pingRoleId ? `<@&${pingRoleId}>` : '';
					if (!contentMsg) {
						contentMsg = await t(
							guild,
							'birthday.tasks.announcer.announcement',
							{
								user: user.toString(),
								ageInfo,
								zodiacInfo,
								pingInfo,
							},
						);
					} else {
						contentMsg = contentMsg
							.replace(/{user}/g, user.toString())
							.replace(/{age}/g, age || '')
							.replace(/{zodiac}/g, zodiac);
					}
					let bannerBuffer = null;
					try {
						const job = await container.queueManager.dispatch(
							'kythia-birthday-queue',
							'birthdayBanner',
							{
								userId: user.id,
								options: {
									customUsername: user.username,
									botToken: client.token,
									customBackground: setting?.bgUrl || null,
									welcomeText: 'HAPPY BIRTHDAY',
									welcomeColor: setting?.embedColor || '#FFD700',
									usernameColor: '#FFFFFF',
									avatarBorder: {
										width: 6,
										color: setting?.embedColor || '#FFD700',
									},
									type: 'welcome',
								},
							},
						);
						const result = await container.queueManager.waitFor(
							job,
							'kythia-birthday-queue',
						);
						bannerBuffer = Buffer.from(result.data);
					} catch (e) {
						logger?.error(
							`❌ [Birthday] Failed to generate arts: ${e.message || e}`,
						);
					}
					const files = [];
					let imageUrl = null;
					if (Buffer.isBuffer(bannerBuffer)) {
						const attachment = new AttachmentBuilder(bannerBuffer, {
							name: 'birthday.png',
						});
						files.push(attachment);
						imageUrl = 'attachment://birthday.png';
					}
					const { convertColor } = helpers.color;
					const colorInput = setting?.embedColor || '#FFD700';
					const accentColor = convertColor(colorInput, {
						from: 'hex',
						to: 'decimal',
					});
					const builder = new ContainerBuilder()
						.setAccentColor(accentColor)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								`# 🎂 Happy Birthday!\n${contentMsg}`,
							),
						);
					if (imageUrl) {
						builder.addSeparatorComponents(
							new SeparatorBuilder()
								.setSpacing(SeparatorSpacingSize.Small)
								.setDivider(true),
						);
						builder.addMediaGalleryComponents(
							new MediaGalleryBuilder().addItems([
								new MediaGalleryItemBuilder().setURL(imageUrl),
							]),
						);
					} else if (setting?.bgUrl) {
						builder.addSeparatorComponents(
							new SeparatorBuilder()
								.setSpacing(SeparatorSpacingSize.Small)
								.setDivider(true),
						);
						builder.addMediaGalleryComponents(
							new MediaGalleryBuilder().addItems([
								new MediaGalleryItemBuilder().setURL(setting.bgUrl),
							]),
						);
					}
					builder
						.addSeparatorComponents(
							new SeparatorBuilder()
								.setSpacing(SeparatorSpacingSize.Small)
								.setDivider(true),
						)
						.addTextDisplayComponents(
							new TextDisplayBuilder().setContent(
								await t(guild, 'common.container.footer', {
									username: client.user.username,
								}),
							),
						);
					await channel.send({
						components: [builder],
						files: files,
						flags: MessageFlags.IsComponentsV2,
					});
					record.lastCelebratedYear = currentYear;
					await record.save();
				} catch (err) {
					if (logger)
						logger.error(
							`❌ [Birthday] Failed to announce for user ${record.userId} in guild ${record.guildId}: ${err.message || err}`,
							{
								label: 'birthday',
							},
						);
				}
			}
		} catch (error) {
			if (logger)
				logger.error(`Error fetching birthdays: ${error.message || error}`, {
					label: 'birthday',
				});
		}
	}
}
exports.default = AnnouncerTask;
