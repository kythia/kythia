/**
 * @namespace: addons/core/helpers/stats.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { ChannelType } = require('discord.js');
const { t } = require('@utils/translator');
const logger = require('@utils/logger');

// Cache untuk terjemahan agar tidak dipanggil berulang kali
const timeLocaleCache = {};

/**
 * Mengambil dan men-cache nama hari & bulan yang sudah diterjemahkan.
 */
async function getLocalizedTime(locale) {
    if (timeLocaleCache[locale]) return timeLocaleCache[locale];

    const days = await Promise.all([
        t({ locale }, 'core_helpers_stats_days_sunday'),
        t({ locale }, 'core_helpers_stats_days_monday'),
        t({ locale }, 'core_helpers_stats_days_tuesday'),
        t({ locale }, 'core_helpers_stats_days_wednesday'),
        t({ locale }, 'core_helpers_stats_days_thursday'),
        t({ locale }, 'core_helpers_stats_days_friday'),
        t({ locale }, 'core_helpers_stats_days_saturday'),
    ]);
    const months = await Promise.all([
        t({ locale }, 'core_helpers_stats_months_january'),
        t({ locale }, 'core_helpers_stats_months_february'),
        t({ locale }, 'core_helpers_stats_months_march'),
        t({ locale }, 'core_helpers_stats_months_april'),
        t({ locale }, 'core_helpers_stats_months_may'),
        t({ locale }, 'core_helpers_stats_months_june'),
        t({ locale }, 'core_helpers_stats_months_july'),
        t({ locale }, 'core_helpers_stats_months_august'),
        t({ locale }, 'core_helpers_stats_months_september'),
        t({ locale }, 'core_helpers_stats_months_october'),
        t({ locale }, 'core_helpers_stats_months_november'),
        t({ locale }, 'core_helpers_stats_months_december'),
    ]);

    timeLocaleCache[locale] = { days, months };
    return timeLocaleCache[locale];
}

/**
 * Resolve placeholders in a string using provided data and locale.
 * This version merges the full placeholder set and translation caching.
 */
async function resolvePlaceholders(str, data, locale) {
    // Defensive: If str is not a string, return empty string
    if (typeof str !== 'string') return '';

    const now = new Date();
    const { days, months } = await getLocalizedTime(locale);

    // Calculate server age
    let guildAge = 'Unknown';
    if (data.createdAt) {
        const created = new Date(data.createdAt);
        const diff = now - created;
        const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
        const monthsDiff = Math.floor((diff % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
        const daysDiff = Math.floor((diff % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
        // Use translation for "years", "months", "days" if available
        let yearsLabel = years > 0 ? await t({ locale }, 'core_helpers_stats_years') : '';
        let monthsLabel = await t({ locale }, 'core_helpers_stats_months');
        let daysLabel = await t({ locale }, 'core_helpers_stats_days');
        guildAge =
            years > 0
                ? `${years} ${yearsLabel} ${monthsDiff} ${monthsLabel} ${daysDiff} ${daysLabel}`
                : `${monthsDiff} ${monthsLabel} ${daysDiff} ${daysLabel}`;
    }

    // For booleans with translation
    const verifiedStr = data.verified
        ? await t({ locale }, 'core_helpers_stats_verified_yes')
        : await t({ locale }, 'core_helpers_stats_verified_no');
    const partneredStr = data.partnered
        ? await t({ locale }, 'core_helpers_stats_partnered_yes')
        : await t({ locale }, 'core_helpers_stats_partnered_no');

    // Date/time formatting
    const formatDate = (d) => {
        if (!(d instanceof Date) || isNaN(d)) return 'Unknown';
        return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
    };
    const formatTime = (d) => {
        if (!(d instanceof Date) || isNaN(d)) return 'Unknown';
        return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    };
    /**
     * {user}
     * {user_id}
     * {tag}
     * {username}
     * {memberstotal}
     * {members}
     * {online}
     * {idle}
     * {dnd}
     * {offline}
     * {bots}
     * {humans}
     * {online_bots}
     * {online_humans}
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
        // user info
        '{user}': data.userId ? `<@${data.userId}>` : 'Unknown',
        '{user_id}': data.userId || '0',
        '{tag}': data.tag ? `#${data.tag}` : 'Unknown',
        '{username}': data.username || 'Unknown',

        // Member statistics
        '{memberstotal}': data.members ?? 0,
        '{members}': data.members ?? 0,
        '{online}': data.online ?? 0,
        '{idle}': data.idle ?? 0,
        '{dnd}': data.dnd ?? 0,
        '{offline}': data.offline ?? 0,
        '{bots}': data.bots ?? 0,
        '{humans}': data.humans ?? 0,
        '{online_bots}': data.onlineBots ?? 0,
        '{online_humans}': data.onlineHumans ?? 0,

        // Server statistics
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

        // Server information
        '{guild}': data.guildName || 'Server',
        '{guild_id}': data.guildId || '0',
        '{owner}': data.ownerName || 'Owner',
        '{owner_id}': data.ownerId || '0',
        '{region}': data.region || 'ID',
        '{verified}': verifiedStr,
        '{partnered}': partneredStr,

        // Waktu dinamis
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

        // Dynamic server information
        '{created_date}': data.createdAt ? formatDate(new Date(data.createdAt)) : 'Unknown',
        '{created_time}': data.createdAt ? formatTime(new Date(data.createdAt)) : 'Unknown',
        '{guild_age}': guildAge,
        '{member_join}': data.memberJoin ? formatDate(new Date(data.memberJoin)) : 'Unknown',
    };

    let result = str;
    // Defensive: Only call .replace if result is a string
    for (const [key, val] of Object.entries(placeholders)) {
        if (typeof result === 'string') {
            result = result.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), val?.toString() ?? '');
        }
    }
    // Defensive: If result is not a string after replacement, fallback to empty string
    if (typeof result !== 'string') return '';
    return result;
}

/**
 * Update server stats channels for all guilds/settings.
 * - Uses translation cache for day/month names.
 * - Only updates voice/stage channels and checks for manageability.
 * - Adds logging and rate limit handling.
 */
async function updateStats(client, activeSettings) {
    logger.info('Starting stats update for all guilds...');
    const updates = [];

    for (const setting of activeSettings) {
        if (!setting.serverStatsOn || !setting.serverStats || !Array.isArray(setting.serverStats)) continue;

        const guild = client.guilds.cache.get(setting.guildId);
        if (!guild) continue;

        try {
            // Assume members and channels are already cached/fetched at clientReady
            const members = guild.members.cache;
            const bots = members.filter((m) => m.user.bot).size;
            const online = members.filter((m) => m.presence && m.presence.status !== 'offline').size;
            const idle = members.filter((m) => m.presence && m.presence.status === 'idle').size;
            const dnd = members.filter((m) => m.presence && m.presence.status === 'dnd').size;
            const offline = members.filter((m) => !m.presence || m.presence.status === 'offline').size;
            const onlineBots = members.filter((m) => m.user.bot && m.presence && m.presence.status !== 'offline').size;
            const onlineHumans = members.filter((m) => !m.user.bot && m.presence && m.presence.status !== 'offline').size;

            // Channel type counts
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

            // Data lengkap untuk placeholder
            const data = {
                members: guild.memberCount,
                online: online,
                idle: idle,
                dnd: dnd,
                offline: offline,
                bots: bots,
                humans: guild.memberCount - bots,
                onlineBots: onlineBots,
                onlineHumans: onlineHumans,
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
                ownerName: guild.ownerId ? guild.members.cache.get(guild.ownerId)?.user?.tag : 'Unknown',
                ownerId: guild.ownerId || '0',
                region: guild.preferredLocale,
                verified: guild.verified,
                partnered: guild.partnered,
                createdAt: guild.createdAt ? guild.createdAt.toISOString() : null,
                memberJoin: setting.memberJoin || null,
            };

            for (const stat of setting.serverStats) {
                if (!stat.enabled || !stat.channelId || !stat.format) continue;

                const channel = guild.channels.cache.get(stat.channelId);
                // Only update if channel is voice/stage and manageable
                if (!channel || ![ChannelType.GuildVoice, ChannelType.GuildStageVoice].includes(channel.type) || !channel.manageable) {
                    continue;
                }

                const newName = await resolvePlaceholders(stat.format, data, guild.preferredLocale);
                if (channel.name !== newName) {
                    // Kumpulkan promise sebagai fungsi untuk dieksekusi nanti
                    updates.push(() => channel.setName(newName.substring(0, 100), 'Server Stats Update'));
                }
            }
        } catch (err) {
            logger.error(`[STATS HELPER ERROR] Failed to process guild ${guild.name} (${setting.guildId}):`, err);
        }
    }

    // Eksekusi update satu per satu dengan jeda untuk menghindari rate limit
    logger.info(`Found ${updates.length} channel(s) to update.`);
    for (const updateFunc of updates) {
        try {
            await updateFunc();
            await new Promise((resolve) => setTimeout(resolve, 3000)); // Jeda 3 detik antar update
        } catch (err) {
            logger.warn(`Could not update a channel name (likely a temp Discord issue): ${err.message}`);
        }
    }
    logger.info('Finished processing all channel updates.');
}

module.exports = { updateStats, resolvePlaceholders };
