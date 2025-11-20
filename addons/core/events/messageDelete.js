/**
 * @namespace: addons/core/events/messageDelete.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

// addons/core/events/messageDelete.js

const { AuditLogEvent, EmbedBuilder } = require('discord.js');

module.exports = async (bot, message) => {
    if (!message.guild || !message.channelId) return;
    if (message.author?.bot) return;
    const container = bot.client.container;
    const { t, models, helpers, kythiaConfig } = container;
    const { ServerSetting } = models;
    const { convertColor } = helpers.color;

    try {
        const settings = await ServerSetting.getCache({ guildId: message.guild.id });
        const logChannelId = settings?.auditLogChannelId || settings?.modLogChannelId;
        if (!settings || !logChannelId) return;

        // Fetch channel log dulu (lebih efisien fetch sekali)
        const logChannel = await message.guild.channels.fetch(logChannelId).catch(() => null);
        if (!logChannel || !logChannel.isTextBased()) return;

        // --- Fetch Audit Log Langsung (TANPA JEDA) ---
        let executor = null;
        let reason = null;
        let auditEntryTimestamp = null;

        const audit = await message.guild
            .fetchAuditLogs({
                type: AuditLogEvent.MessageDelete,
                limit: 1, // Tetap limit 1
            })
            .catch((err) => {
                console.error(`[AuditLog Fetch Error] Guild ${message.guild.id}:`, err);
                return null;
            });

        const entry = audit?.entries?.first();

        // Validasi: Entry ada, channel cocok, waktu sangat dekat (misal 5 detik), DAN Executor BUKAN Author (jika author ada)
        // Ini fokus untuk nangkep aksi moderasi, bukan self-delete
        if (
            entry &&
            entry.extra?.channel?.id === message.channelId &&
            entry.createdTimestamp > Date.now() - 10000 && // Jendela waktu lebih sempit lagi
            message.author && // Kita perlu author untuk cek ini
            entry.executor?.id !== message.author.id // Pastikan BUKAN self-delete
        ) {
            executor = entry.executor;
            reason = entry.reason;
            auditEntryTimestamp = entry.createdAt;
            console.log(`[AuditLog Debug] Found MODERATOR delete entry ${entry.id} by ${executor?.tag}`);
        } else if (entry && entry.extra?.channel?.id === message.channelId && entry.createdTimestamp > Date.now() - 5000) {
            // Kalau entry cocok channel & waktu, TAPI executor = author (atau author undefined), anggap self-delete/unknown
            console.log(
                `[AuditLog Debug] Found recent entry ${entry.id} in channel, but likely self-delete or author unknown. Logging without executor.`
            );
        } else {
            // Kalau nggak ada entry baru yang cocok sama sekali
            console.log(
                `[AuditLog Debug] No recent matching MessageDelete entry found for channel ${message.channelId}. Logging without executor.`
            );
        }

        // --- Buat Embed (Lebih Tahan Error) ---
        const embed = new EmbedBuilder()
            // Warna Orange jika executor tidak diketahui, Merah jika diketahui
            .setColor(
                executor
                    ? convertColor('Red', { from: 'discord', to: 'decimal' })
                    : convertColor('Orange', { from: 'discord', to: 'decimal' })
            )
            // Pakai timestamp audit log jika ada, fallback ke waktu pesan dibuat (jika ada), atau waktu sekarang
            .setTimestamp(auditEntryTimestamp || message.createdTimestamp || Date.now());

        // Author embed = Pelaku (jika diketahui)
        if (executor) {
            embed.setAuthor({
                name: `${executor.tag} (${executor.id})`,
                iconURL: executor.displayAvatarURL(),
            });
            embed.setDescription(`🗑️ **Message deleted in <#${message.channelId}>** by ${executor}`);
        } else {
            embed.setAuthor({ name: 'Message Deleted' }); // Judul generik
            embed.setDescription(`🗑️ **Message deleted in <#${message.channelId}>** (Executor unknown)`);
        }

        embed.addFields(
            // Field Author asli pesan (handle jika tidak ada)
            {
                name: 'Author',
                value: message.author ? `${message.author.tag} (${message.author.id})` : 'Unknown (Not Cached)',
                inline: true,
            },
            { name: 'Channel', value: `<#${message.channelId}>`, inline: true },
            // Field Executor (hanya jika diketahui & BEDA dari author asli)
            executor && (!message.author || executor.id !== message.author.id)
                ? { name: 'Deleted By', value: `${executor.tag} (${executor.id})`, inline: true }
                : { name: '\u200B', value: '\u200B', inline: true }, // Field kosong untuk layout
            { name: 'Message ID', value: message.id || 'Unknown (Not Cached)', inline: true },
            // Konten (handle jika tidak ada & potong jika panjang)
            {
                name: 'Content',
                value: (message.content?.substring(0, 1020) || '(No Content / Not Cached)') + (message.content?.length > 1020 ? '...' : ''),
                inline: false,
            }
        );

        // Attachments (handle jika partial)
        if (message.attachments && message.attachments.size > 0) {
            embed.addFields({
                name: 'Attachments',
                value: message.attachments.map((a) => a.name || 'Unknown Attachment').join(', ') || 'None',
            });
        } else if (message.partial || typeof message.attachments === 'undefined') {
            // Cek eksplisit undefined kalau-kalau bukan partial tapi attachment hilang
            embed.addFields({ name: 'Attachments', value: '(Could not fetch attachments)' });
        }

        // Reason (jika ada dari audit log)
        if (reason) {
            embed.addFields({ name: 'Reason (from Audit Log)', value: reason });
        }

        embed.setFooter({ text: `Author ID: ${message.author?.id || 'Unknown'}` });

        await logChannel.send({ embeds: [embed] });
    } catch (err) {
        const logger = bot.container?.logger || console;
        logger.error(`Error in messageDelete handler for guild ${message.guild?.id}:`, err);
    }
};
