/**
 * @namespace: addons/core/helpers/stats.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { ChannelType } = require('discord.js');
const { t } = require('@coreHelpers/translator');
const logger = require('@coreHelpers/logger');
const Sentry = require('@sentry/node');

const timeLocaleCache = {};
async function getLocalizedTime(locale) {
    if (timeLocaleCache[locale]) return timeLocaleCache[locale];

    const days = await Promise.all([
        t({ locale }, 'core.helpers.stats.days.sunday'),
        t({ locale }, 'core.helpers.stats.days.monday'),
        t({ locale }, 'core.helpers.stats.days.tuesday'),
        t({ locale }, 'core.helpers.stats.days.wednesday'),
        t({ locale }, 'core.helpers.stats.days.thursday'),
        t({ locale }, 'core.helpers.stats.days.friday'),
        t({ locale }, 'core.helpers.stats.days.saturday'),
    ]);
    const months = await Promise.all([
        t({ locale }, 'core.helpers.stats.months.january'),
        t({ locale }, 'core.helpers.stats.months.february'),
        t({ locale }, 'core.helpers.stats.months.march'),
        t({ locale }, 'core.helpers.stats.months.april'),
        t({ locale }, 'core.helpers.stats.months.may'),
        t({ locale }, 'core.helpers.stats.months.june'),
        t({ locale }, 'core.helpers.stats.months.july'),
        t({ locale }, 'core.helpers.stats.months.august'),
        t({ locale }, 'core.helpers.stats.months.september'),
        t({ locale }, 'core.helpers.stats.months.october'),
        t({ locale }, 'core.helpers.stats.months.november'),
        t({ locale }, 'core.helpers.stats.months.december'),
    ]);

    timeLocaleCache[locale] = { days, months };
    return timeLocaleCache[locale];
}

/**
 * Resolve placeholders in a string using provided data and locale.
 */
async function resolvePlaceholders(str, data, locale) {
    if (typeof str !== 'string') return '';

    const now = new Date();
    const { days, months } = await getLocalizedTime(locale);

    let guildAge = 'Unknown';
    if (data.createdAt) {
        const created = new Date(data.createdAt);
        const diff = now - created;
        const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
        const monthsDiff = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
        const daysDiff = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        let yearsLabel = years > 0 ? await t({ locale }, 'core.helpers.stats.years') : '';
        let monthsLabel = await t({ locale }, 'core.helpers.stats.months.months');
        let daysLabel = await t({ locale }, 'core.helpers.stats.days.days');
        guildAge =
            years > 0
                ? `${years} ${yearsLabel} ${monthsDiff} ${monthsLabel} ${daysDiff} ${daysLabel}`
                : `${monthsDiff} ${monthsLabel} ${daysDiff} ${daysLabel}`;
    }

    const verifiedStr = data.verified
        ? await t({ locale }, 'core.helpers.stats.verified.yes')
        : await t({ locale }, 'core.helpers.stats.verified.no');
    const partneredStr = data.partnered
        ? await t({ locale }, 'core.helpers.stats.partnered.yes')
        : await t({ locale }, 'core.helpers.stats.partnered.no');

    const formatDate = (d) => {
        if (!(d instanceof Date) || isNaN(d)) return 'Unknown';
        return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const formatTime = (d) => {
        if (!(d instanceof Date) || isNaN(d)) return 'Unknown';
        return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    };

    /**
     * ===== INI YANG DIRAPIIN =====
     *
     * Placeholder yang TIDAK didukung (karena hemat RAM):
     * {online}, {idle}, {dnd}, {offline}, {bots}, {humans},
     * {online_bots}, {online_humans}
     *
     * Placeholder yang DIDUKUNG:
     * {user}
     * {user_id}
     * {tag}
     * {username}
     * {memberstotal}
     * {members}
     * {boosts}
     * {boost_level}
     * {channels}
     * {text_channels}
     * {voice_channels}
     * {categories}
     * {announcement_channels}
     * {stage_channels}
     * {roles}
     * {emojis}
     * {stickers}
     * {guild}
     * {guild_id}
     * {owner}
     * {owner_id}
     * {region}
     * {verified}
     * {partnered}
     * {date}
     * {time}
     * {datetime}
     * {day}
     * {month}
     * {year}
     * {hour}
     * {minute}
     * {second}
     * {timestamp}
     * {created_date}
     * {created_time}
     * {guild_age}
     * {member_join}
     */
    const placeholders = {
        '{user}': data.userId ? `<@${data.userId}>` : 'Unknown',
        '{user_id}': data.userId || '0',
        '{tag}': data.tag ? `#${data.tag}` : 'Unknown',
        '{username}': data.username || 'Unknown',

        '{memberstotal}': data.members ?? 0,
        '{members}': data.members ?? 0,

        '{boosts}': data.boosts ?? 0,
        '{boost_level}': data.boostLevel ?? 0,
        '{channels}': data.channels ?? 0,
        '{text_channels}': data.textChannels ?? 0,
        '{voice_channels}': data.voiceChannels ?? 0,
        '{categories}': data.categories ?? 0,
        '{announcement_channels}': data.announcementChannels ?? 0,
        '{stage_channels}': data.stageChannels ?? 0,
        '{roles}': data.roles ?? 0,
        '{emojis}': data.emojis ?? 0,
        '{stickers}': data.stickers ?? 0,

        '{guild}': data.guildName || 'Server',
        '{guild_id}': data.guildId || '0',
        '{owner}': data.ownerName || 'Owner',
        '{owner_id}': data.ownerId || '0',
        '{region}': data.region || 'ID',
        '{verified}': verifiedStr,
        '{partnered}': partneredStr,

        '{date}': formatDate(now),
        '{time}': formatTime(now),

        '{datetime}': `${formatDate(now)} ${formatTime(now)}`,
        '{day}': days[now.getDay()],
        '{month}': months[now.getMonth()],
        '{year}': now.getFullYear().toString(),
        '{hour}': now.getHours().toString().padStart(2, '0'),
        '{minute}': now.getMinutes().toString().padStart(2, '0'),
        '{second}': now.getSeconds().toString().padStart(2, '0'),
        '{timestamp}': now.getTime().toString(),

        '{created_date}': data.createdAt ? formatDate(new Date(data.createdAt)) : 'Unknown',
        '{created_time}': data.createdAt ? formatTime(new Date(data.createdAt)) : 'Unknown',
        '{guild_age}': guildAge,
        '{member_join}': data.memberJoin ? formatDate(new Date(data.memberJoin)) : 'Unknown',
    };

    let result = str;
    for (const [key, val] of Object.entries(placeholders)) {
        if (typeof result === 'string') {
            result = result.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), val?.toString() ?? '');
        }
    }
    if (typeof result !== 'string') return '';
    return result;
}

/**
 * Update server stats channels for all guilds/settings.
 * (Fungsi ini udah 100% bener dari kodemu tadi, gak aku ubah)
 */
async function updateStats(client, activeSettings) {
    logger.info(`Processing stats for ${activeSettings.length} guild(s)...`);

    for (const setting of activeSettings) {
        if (!setting.serverStatsOn || !setting.serverStats || !Array.isArray(setting.serverStats)) continue;

        const guild = client.guilds.cache.get(setting.guildId);
        if (!guild) continue;

        try {
            const owner = await guild.fetchOwner().catch(() => null);

            const channelTypes = {
                text: 0,
                voice: 0,
                category: 0,
                announcement: 0,
                stage: 0,
            };
            guild.channels.cache.forEach((channel) => {
                switch (channel.type) {
                    case ChannelType.GuildText:
                        channelTypes.text++;
                        break;
                    case ChannelType.GuildVoice:
                        channelTypes.voice++;
                        break;
                    case ChannelType.GuildCategory:
                        channelTypes.category++;
                        break;
                    case ChannelType.GuildAnnouncement:
                        channelTypes.announcement++;
                        break;
                    case ChannelType.GuildStageVoice:
                        channelTypes.stage++;
                        break;
                }
            });

            const data = {
                members: guild.memberCount,
                boosts: guild.premiumSubscriptionCount || 0,
                boostLevel: guild.premiumTier,
                channels: guild.channels.cache.size,
                textChannels: channelTypes.text,
                voiceChannels: channelTypes.voice,
                categories: channelTypes.category,
                announcementChannels: channelTypes.announcement,
                stageChannels: channelTypes.stage,
                roles: guild.roles.cache.size,
                emojis: guild.emojis.cache.size,
                stickers: guild.stickers.cache.size,
                guildName: guild.name,
                guildId: guild.id,
                ownerName: owner ? owner.user.tag : 'Unknown',
                ownerId: guild.ownerId || '0',
                region: guild.preferredLocale,
                verified: guild.verified,
                partnered: guild.partnered,
                createdAt: guild.createdAt ? guild.createdAt.toISOString() : null,
                memberJoin: setting.memberJoin || null,
            };

            const guildUpdatePromises = [];

            for (const stat of setting.serverStats) {
                if (!stat.enabled || !stat.channelId || !stat.format) continue;

                const channel = guild.channels.cache.get(stat.channelId);
                if (!channel || ![ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(channel.type) || !channel.manageable) {
                    continue;
                }

                const newName = await resolvePlaceholders(stat.format, data, guild.preferredLocale);

                if (channel.name !== newName) {
                    guildUpdatePromises.push(
                        channel.setName(newName.substring(0, 100), 'Server Stats Update').catch((err) => {
                            logger.warn(`Failed to update channel ${channel.id} in ${guild.name}: ${err.message}`);
                        })
                    );
                }
            }

            if (guildUpdatePromises.length > 0) {
                await Promise.allSettled(guildUpdatePromises);
                logger.info(`Updated ${guildUpdatePromises.length} channel(s) for guild: ${guild.name}`);
            }
        } catch (err) {
            logger.error(`[STATS HELPER ERROR] Failed to process guild ${guild.name} (${setting.guildId}):`, err);
            Sentry.captureException(err, { extra: { guildId: guild.id } });
        }
    }

    logger.info('Finished processing all channel updates.');
}

async function safeResolvePlaceholder(member, text, statsData, fallback = '') {
    if (typeof text !== 'string' || !text.trim()) return fallback;
    try {
        let result = await resolvePlaceholders(text, statsData, member.guild.preferredLocale);
        if (typeof result === 'string') {
            result = result.replace(/\\n/g, '\n');
        }
        if (result == null) return fallback;
        return result;
    } catch (err) {
        console.error('Error in resolvePlaceholders for banner text:', err);
        return fallback;
    }
}

async function runStatsUpdater(client) {
    const { models, kythiaConfig, logger } = client.container;
    const { ServerSetting } = models;
    logger.info('📊 Starting server stats update cycle...');
    try {
        const allSettings = await ServerSetting.getAllCache();
        const guildsCache = client.guilds.cache;

        if (!guildsCache) {
            logger.error('❌ client.guilds.cache is unavailable during stats update.');
            return;
        }

        const activeSettings = allSettings.filter((s) => guildsCache.has(s.guildId) && s.serverStatsOn);

        if (activeSettings.length === 0) {
            logger.info('📊 No guilds with active server stats. Skipping update cycle.');
            return;
        }

        logger.info(`📊 Found ${activeSettings.length} guild(s) to update stats for.`);

        await updateStats(client, activeSettings);
        logger.info('📊 Server stats update cycle finished.');
    } catch (err) {
        logger.error('❌ A critical error occurred in runStatsUpdater:', err);
        if (kythiaConfig && kythiaConfig.sentry && kythiaConfig.sentry.dsn) {
            Sentry.captureException(err);
        }
    }
}

module.exports = { updateStats, resolvePlaceholders, safeResolvePlaceholder, runStatsUpdater };
