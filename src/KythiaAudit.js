// src/systems/AuditLogger.js
const { Events, EmbedBuilder, AuditLogEvent, ChannelType } = require('discord.js');
const ServerSetting = require('@coreModels/ServerSetting');
const convertColor = require('./utils/color');

// Kamus untuk mengubah angka AuditLogEvent menjadi nama (string)
const auditLogEventNames = Object.fromEntries(Object.entries(AuditLogEvent).map(([key, value]) => [value, key]));

// Human readable channel types
const channelTypeNames = {
    [ChannelType.GuildText]: 'Text Channel',
    [ChannelType.GuildVoice]: 'Voice Channel',
    [ChannelType.GuildCategory]: 'Category',
    [ChannelType.GuildAnnouncement]: 'Announcement Channel',
    [ChannelType.AnnouncementThread]: 'Announcement Thread',
    [ChannelType.PublicThread]: 'Public Thread',
    [ChannelType.PrivateThread]: 'Private Thread',
    [ChannelType.GuildStageVoice]: 'Stage Channel',
    [ChannelType.GuildForum]: 'Forum Channel',
    [ChannelType.GuildMedia]: 'Media Channel',
    [ChannelType.GuildDirectory]: 'Directory Channel',
    [ChannelType.GuildStore]: 'Store Channel',
    [ChannelType.DM]: 'Direct Message',
    [ChannelType.GroupDM]: 'Group DM',
};

function humanChannelType(type) {
    if (typeof type === 'string' && channelTypeNames[type]) return channelTypeNames[type];
    if (typeof type === 'number' && channelTypeNames[type]) return channelTypeNames[type];
    if (typeof type === 'string') return type;
    if (typeof type === 'number') return `Unknown (${type})`;
    return 'Unknown';
}

// Human readable role permissions (for future use)
// const permissionNames = require("discord.js").PermissionFlagsBits;

function formatCache(obj) {
    // For now, just make it more human readable for known types
    if (!obj) return 'None';
    if (Array.isArray(obj)) {
        if (obj.length === 0) return 'None';
        return obj.map(formatCache).join(', ');
    }
    if (typeof obj === 'object') {
        // Channel
        if (obj.type !== undefined && obj.name) {
            return `${obj.name} (${humanChannelType(obj.type)})`;
        }
        // Role
        if (obj.name && obj.id && obj.color !== undefined) {
            return `${obj.name} (Role)`;
        }
        // User
        if (obj.username && obj.discriminator) {
            return `${obj.username}#${obj.discriminator}`;
        }
        // Invite
        if (obj.code && obj.inviter) {
            return `Invite: ${obj.code} (by ${formatCache(obj.inviter)})`;
        }
        // Emoji
        if (obj.name && obj.id && obj.animated !== undefined) {
            return `${obj.animated ? 'Animated' : ''} Emoji: ${obj.name}`;
        }
        // Fallback: show id or JSON
        if (obj.id) return `ID: ${obj.id}`;
        try {
            return '```json\n' + JSON.stringify(obj, null, 2) + '\n```';
        } catch {
            return String(obj);
        }
    }
    return String(obj);
}

class AuditLogger {
    /**
     * @param {import("../Kythia")} bot Instance dari class utama Kythia
     */
    constructor(bot) {
        this.bot = bot;
        this.client = bot.client;
    }

    /**
     * Mendaftarkan listener utama ke event Discord.
     */
    initialize() {
        this.client.on(Events.GuildAuditLogEntryCreate, this.onAuditLogEntryCreate.bind(this));
        this.bot.container.logger.info('✔️  Audit Logger System is now listening.');
    }

    /**
     * Handler utama yang dieksekusi setiap ada log baru.
     * @param {import("discord.js").GuildAuditLogsEntry} entry
     * @param {import("discord.js").Guild} guild
     */
    async onAuditLogEntryCreate(entry, guild) {
        try {
            const settings = await ServerSetting.getCache({ guildId: guild.id });
            if (!settings || !settings.modLogChannelId) return;

            const eventName = auditLogEventNames[entry.action];

            const logData = this._formatEntry(entry);
            if (!logData) return;

            const logChannel = await guild.channels.fetch(settings.modLogChannelId).catch(() => null);
            if (!logChannel || !logChannel.isTextBased()) return;

            // --- Fix: Ensure logData.fields is always a valid array of objects with name and value ---
            // Discord.js v14+ requires .addFields() to receive an array of objects with at least { name, value }
            // Defensive: filter out any fields that are missing name or value, and ensure value is a string
            let safeFields = Array.isArray(logData.fields)
                ? logData.fields
                      .filter((f) => f && typeof f.name === 'string' && typeof f.value !== 'undefined')
                      .map((f) => ({
                          name: String(f.name),
                          value: typeof f.value === 'string' ? f.value : f.value == null ? 'None' : String(f.value),
                          inline: !!f.inline,
                      }))
                : [];

            // If no fields, .addFields([]) is valid, but .addFields() with undefined or invalid is not
            const embed = new EmbedBuilder()
                .setColor(logData.color)
                .setAuthor({ name: entry.executor?.tag || 'Unknown', iconURL: entry.executor?.displayAvatarURL?.() })
                .setDescription(logData.description)
                .addFields(safeFields)
                .setFooter({ text: `User ID: ${entry.executor?.id || 'Unknown'}` })
                .setTimestamp();

            await logChannel.send({ embeds: [embed] });
        } catch (err) {
            this.bot.container.logger.error(`Error in AuditLogger for guild ${guild.name}:`, err);
        }
    }

    /**
     * "Penerjemah" yang mengubah entry audit log menjadi data yang bisa dibaca.
     * @private
     */
    _formatEntry(entry) {
        const { action, executor, target, reason, changes, extra } = entry;
        const logData = { color: 'Default', description: '', fields: [] };

        // Helper for role mentions
        const roleMention = (role) => (role && role.id ? `<@&${role.id}>` : formatCache(role));

        // Helper for channel mentions
        const channelMention = (ch) => (ch && ch.id ? `<#${ch.id}>` : formatCache(ch));

        // Helper for user mentions
        const userMention = (user) => (user && user.id ? `<@${user.id}>` : formatCache(user));

        // Helper for emoji
        const emojiMention = (emoji) => (emoji && emoji.id ? `<:${emoji.name}:${emoji.id}>` : formatCache(emoji));

        // Helper for color
        const colorMap = {
            create: convertColor('Green', { from: 'discord', to: 'decimal' }), // green
            update: convertColor('Blurple', { from: 'discord', to: 'decimal' }), // blurple
            delete: convertColor('Red', { from: 'discord', to: 'decimal' }), // red
            default: convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }),
        };

        // Helper for field array
        const addField = (name, value, inline = false) => {
            // Defensive: ensure name and value are strings, and value is not undefined/null
            logData.fields.push({
                name: String(name),
                value: typeof value === 'string' ? value : value == null ? 'None' : String(value),
                inline: !!inline,
            });
        };

        // Humanize changes for certain events
        const formatHumanChanges = (changes, eventType) => {
            if (!changes || changes.length === 0) return 'No changes detected.';
            return changes
                .map((change) => {
                    let key = change.key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
                    let oldValue = change.old ?? 'Nothing';
                    let newValue = change.new ?? 'Nothing';

                    // Humanize channel type
                    if (eventType === 'channel' && change.key === 'type') {
                        oldValue = humanChannelType(oldValue);
                        newValue = humanChannelType(newValue);
                    }
                    // Humanize role permissions (future: can add more)
                    // Humanize invite target type, etc.

                    return `**${key}**: \`${oldValue}\` ➔ \`${newValue}\``;
                })
                .join('\n');
        };

        // Helper: for delete events, do not mention, just show plain text
        const plainRole = (role) => (role && role.name ? `${role.name} (Role)` : formatCache(role));
        const plainChannel = (ch) => (ch && ch.name ? `${ch.name} (${humanChannelType(ch.type)})` : formatCache(ch));
        const plainUser = (user) =>
            user && user.username ? (user.discriminator ? `${user.username}#${user.discriminator}` : user.username) : formatCache(user);
        const plainEmoji = (emoji) => (emoji && emoji.name ? `${emoji.name}` : formatCache(emoji));

        // All Discord AuditLogEvent cases
        switch (action) {
            // Guild
            case AuditLogEvent.GuildUpdate:
                logData.color = colorMap.update;
                logData.description = `🛠️ **Guild Updated** by ${userMention(executor)}`;
                addField('Changes', formatCache(changes));
                break;

            // Channel
            case AuditLogEvent.ChannelCreate:
                logData.color = colorMap.create;
                logData.description = `✅ **Channel Created** by ${userMention(executor)}`;
                addField('Channel', channelMention(target));
                addField('Type', humanChannelType(target?.type));
                break;
            case AuditLogEvent.ChannelUpdate:
                logData.color = colorMap.update;
                logData.description = `📝 **Channel Updated** by ${userMention(executor)}`;
                addField('Channel', channelMention(target));
                addField('Changes', formatHumanChanges(changes, 'channel'));
                break;
            case AuditLogEvent.ChannelDelete:
                logData.color = colorMap.delete;
                logData.description = `❌ **Channel Deleted** by ${userMention(executor)}`;
                addField('Channel', plainChannel(target));
                addField('Type', humanChannelType(target?.type));
                break;
            case AuditLogEvent.ChannelOverwriteCreate:
                logData.color = colorMap.create;
                logData.description = `🔒 **Channel Permission Overwrite Created** by ${userMention(executor)}`;
                addField('Channel', channelMention(target));
                addField('Overwrite', formatCache(extra));
                break;
            case AuditLogEvent.ChannelOverwriteUpdate:
                logData.color = colorMap.update;
                logData.description = `🔒 **Channel Permission Overwrite Updated** by ${userMention(executor)}`;
                addField('Channel', channelMention(target));
                addField('Changes', formatCache(changes));
                break;
            case AuditLogEvent.ChannelOverwriteDelete:
                logData.color = colorMap.delete;
                logData.description = `🔓 **Channel Permission Overwrite Deleted** by ${userMention(executor)}`;
                addField('Channel', plainChannel(target));
                addField('Overwrite', formatCache(extra));
                break;

            // Member
            case AuditLogEvent.MemberKick:
                logData.color = colorMap.delete;
                logData.description = `👢 **Member Kicked** by ${userMention(executor)}`;
                addField('Member', plainUser(target));
                break;
            case AuditLogEvent.MemberPrune:
                logData.color = colorMap.delete;
                logData.description = `🧹 **Members Pruned** by ${userMention(executor)}`;
                addField('Pruned', extra?.members_removed || 'Unknown');
                break;
            case AuditLogEvent.MemberBanAdd:
                logData.color = colorMap.delete;
                logData.description = `🔨 **Member Banned** by ${userMention(executor)}`;
                addField('Member', plainUser(target));
                break;
            case AuditLogEvent.MemberBanRemove:
                logData.color = colorMap.create;
                logData.description = `⚖️ **Member Unbanned** by ${userMention(executor)}`;
                addField('Member', userMention(target));
                break;
            case AuditLogEvent.MemberUpdate:
                logData.color = colorMap.update;
                logData.description = `📝 **Member Updated** by ${userMention(executor)}`;
                addField('Member', userMention(target));
                addField('Changes', formatCache(changes));
                break;
            case AuditLogEvent.MemberRoleUpdate:
                logData.color = colorMap.update;
                logData.description = `🎭 **Member Roles Updated** by ${userMention(executor)}`;
                addField('Member', userMention(target));
                addField('Changes', formatCache(changes));
                break;
            case AuditLogEvent.MemberMove:
                logData.color = colorMap.update;
                logData.description = `🚚 **Members Moved** by ${userMention(executor)}`;
                addField('Count', extra?.count || 'Unknown');
                addField('Channel', channelMention(extra?.channel));
                break;
            case AuditLogEvent.MemberDisconnect:
                logData.color = colorMap.update;
                logData.description = `🔌 **Members Disconnected** by ${userMention(executor)}`;
                addField('Count', extra?.count || 'Unknown');
                addField('Channel', channelMention(extra?.channel));
                break;
            case AuditLogEvent.BotAdd:
                logData.color = colorMap.create;
                logData.description = `🤖 **Bot Added** by ${userMention(executor)}`;
                addField('Bot', userMention(target));
                break;

            // Role
            case AuditLogEvent.RoleCreate:
                logData.color = colorMap.create;
                logData.description = `➕ **Role Created** by ${userMention(executor)}`;
                addField('Role', roleMention(target));
                break;
            case AuditLogEvent.RoleUpdate:
                logData.color = colorMap.update;
                logData.description = `📝 **Role Updated** by ${userMention(executor)}`;
                addField('Role', roleMention(target));
                addField('Changes', formatCache(changes));
                break;
            case AuditLogEvent.RoleDelete:
                logData.color = colorMap.delete;
                logData.description = `➖ **Role Deleted** by ${userMention(executor)}`;
                addField('Role', plainRole(target));
                break;

            // Invite
            case AuditLogEvent.InviteCreate:
                logData.color = colorMap.create;
                logData.description = `🔗 **Invite Created** by ${userMention(executor)}`;
                addField('Invite', formatCache(target));
                break;
            case AuditLogEvent.InviteUpdate:
                logData.color = colorMap.update;
                logData.description = `🔗 **Invite Updated** by ${userMention(executor)}`;
                addField('Invite', formatCache(target));
                addField('Changes', formatCache(changes));
                break;
            case AuditLogEvent.InviteDelete:
                logData.color = colorMap.delete;
                logData.description = `🔗 **Invite Deleted** by ${userMention(executor)}`;
                addField('Invite', formatCache(target));
                break;

            // Webhook
            case AuditLogEvent.WebhookCreate:
                logData.color = colorMap.create;
                logData.description = `🪝 **Webhook Created** by ${userMention(executor)}`;
                addField('Webhook', formatCache(target));
                break;
            case AuditLogEvent.WebhookUpdate:
                logData.color = colorMap.update;
                logData.description = `🪝 **Webhook Updated** by ${userMention(executor)}`;
                addField('Webhook', formatCache(target));
                addField('Changes', formatCache(changes));
                break;
            case AuditLogEvent.WebhookDelete:
                logData.color = colorMap.delete;
                logData.description = `🪝 **Webhook Deleted** by ${userMention(executor)}`;
                addField('Webhook', formatCache(target));
                break;

            // Emoji
            case AuditLogEvent.EmojiCreate:
                logData.color = colorMap.create;
                logData.description = `😃 **Emoji Created** by ${userMention(executor)}`;
                addField('Emoji', emojiMention(target));
                break;
            case AuditLogEvent.EmojiUpdate:
                logData.color = colorMap.update;
                logData.description = `😃 **Emoji Updated** by ${userMention(executor)}`;
                addField('Emoji', emojiMention(target));
                addField('Changes', formatCache(changes));
                break;
            case AuditLogEvent.EmojiDelete:
                logData.color = colorMap.delete;
                logData.description = `😃 **Emoji Deleted** by ${userMention(executor)}`;
                addField('Emoji', plainEmoji(target));
                break;

            // Message
            case AuditLogEvent.MessageDelete:
                logData.color = colorMap.delete;
                logData.description = `🗑️ **Message Deleted** by ${userMention(executor)}`;
                addField('Channel', plainChannel(extra?.channel));
                addField('Count', extra?.count || '1');
                break;
            case AuditLogEvent.MessageBulkDelete:
                logData.color = colorMap.delete;
                logData.description = `🗑️ **Bulk Message Delete** by ${userMention(executor)}`;
                addField('Channel', plainChannel(extra?.channel));
                addField('Count', extra?.count || 'Unknown');
                break;
            case AuditLogEvent.MessagePin:
                logData.color = colorMap.create;
                logData.description = `📌 **Message Pinned** by ${userMention(executor)}`;
                addField('Channel', channelMention(extra?.channel));
                break;
            case AuditLogEvent.MessageUnpin:
                logData.color = colorMap.delete;
                logData.description = `📌 **Message Unpinned** by ${userMention(executor)}`;
                addField('Channel', plainChannel(extra?.channel));
                break;

            // Integration
            case AuditLogEvent.IntegrationCreate:
                logData.color = colorMap.create;
                logData.description = `🔌 **Integration Created** by ${userMention(executor)}`;
                addField('Integration', formatCache(target));
                break;
            case AuditLogEvent.IntegrationUpdate:
                logData.color = colorMap.update;
                logData.description = `🔌 **Integration Updated** by ${userMention(executor)}`;
                addField('Integration', formatCache(target));
                addField('Changes', formatCache(changes));
                break;
            case AuditLogEvent.IntegrationDelete:
                logData.color = colorMap.delete;
                logData.description = `🔌 **Integration Deleted** by ${userMention(executor)}`;
                addField('Integration', formatCache(target));
                break;

            // Stage Instance
            case AuditLogEvent.StageInstanceCreate:
                logData.color = colorMap.create;
                logData.description = `🎤 **Stage Instance Created** by ${userMention(executor)}`;
                addField('Stage', formatCache(target));
                break;
            case AuditLogEvent.StageInstanceUpdate:
                logData.color = colorMap.update;
                logData.description = `🎤 **Stage Instance Updated** by ${userMention(executor)}`;
                addField('Stage', formatCache(target));
                addField('Changes', formatCache(changes));
                break;
            case AuditLogEvent.StageInstanceDelete:
                logData.color = colorMap.delete;
                logData.description = `🎤 **Stage Instance Deleted** by ${userMention(executor)}`;
                addField('Stage', formatCache(target));
                break;

            // Sticker
            case AuditLogEvent.StickerCreate:
                logData.color = colorMap.create;
                logData.description = `🏷️ **Sticker Created** by ${userMention(executor)}`;
                addField('Sticker', formatCache(target));
                break;
            case AuditLogEvent.StickerUpdate:
                logData.color = colorMap.update;
                logData.description = `🏷️ **Sticker Updated** by ${userMention(executor)}`;
                addField('Sticker', formatCache(target));
                addField('Changes', formatCache(changes));
                break;
            case AuditLogEvent.StickerDelete:
                logData.color = colorMap.delete;
                logData.description = `🏷️ **Sticker Deleted** by ${userMention(executor)}`;
                addField('Sticker', formatCache(target));
                break;

            // Guild Scheduled Event
            case AuditLogEvent.GuildScheduledEventCreate:
                logData.color = colorMap.create;
                logData.description = `📅 **Guild Scheduled Event Created** by ${userMention(executor)}`;
                addField('Event', formatCache(target));
                break;
            case AuditLogEvent.GuildScheduledEventUpdate:
                logData.color = colorMap.update;
                logData.description = `📅 **Guild Scheduled Event Updated** by ${userMention(executor)}`;
                addField('Event', formatCache(target));
                addField('Changes', formatCache(changes));
                break;
            case AuditLogEvent.GuildScheduledEventDelete:
                logData.color = colorMap.delete;
                logData.description = `📅 **Guild Scheduled Event Deleted** by ${userMention(executor)}`;
                addField('Event', formatCache(target));
                break;

            // Thread
            case AuditLogEvent.ThreadCreate:
                logData.color = colorMap.create;
                logData.description = `🧵 **Thread Created** by ${userMention(executor)}`;
                addField('Thread', channelMention(target));
                addField('Type', humanChannelType(target?.type));
                break;
            case AuditLogEvent.ThreadUpdate:
                logData.color = colorMap.update;
                logData.description = `🧵 **Thread Updated** by ${userMention(executor)}`;
                addField('Thread', channelMention(target));
                addField('Changes', formatHumanChanges(changes, 'channel'));
                break;
            case AuditLogEvent.ThreadDelete:
                logData.color = colorMap.delete;
                logData.description = `🧵 **Thread Deleted** by ${userMention(executor)}`;
                addField('Thread', plainChannel(target));
                addField('Type', humanChannelType(target?.type));
                break;

            // Application Command Permission Update
            case AuditLogEvent.ApplicationCommandPermissionUpdate:
                logData.color = colorMap.update;
                logData.description = `⚙️ **Application Command Permission Updated** by ${userMention(executor)}`;
                addField('Command', formatCache(target));
                addField('Changes', formatCache(changes));
                break;

            // Soundboard Sound
            case AuditLogEvent.SoundboardSoundCreate:
                logData.color = colorMap.create;
                logData.description = `🔊 **Soundboard Sound Created** by ${userMention(executor)}`;
                addField('Sound', formatCache(target));
                break;
            case AuditLogEvent.SoundboardSoundUpdate:
                logData.color = colorMap.update;
                logData.description = `🔊 **Soundboard Sound Updated** by ${userMention(executor)}`;
                addField('Sound', formatCache(target));
                addField('Changes', formatCache(changes));
                break;
            case AuditLogEvent.SoundboardSoundDelete:
                logData.color = colorMap.delete;
                logData.description = `🔊 **Soundboard Sound Deleted** by ${userMention(executor)}`;
                addField('Sound', formatCache(target));
                break;

            // Auto Moderation
            case AuditLogEvent.AutoModerationRuleCreate:
                logData.color = colorMap.create;
                logData.description = `🛡️ **AutoMod Rule Created** by ${userMention(executor)}`;
                addField('Rule', formatCache(target));
                break;
            case AuditLogEvent.AutoModerationRuleUpdate:
                logData.color = colorMap.update;
                logData.description = `🛡️ **AutoMod Rule Updated** by ${userMention(executor)}`;
                addField('Rule', formatCache(target));
                addField('Changes', formatCache(changes));
                break;
            case AuditLogEvent.AutoModerationRuleDelete:
                logData.color = colorMap.delete;
                logData.description = `🛡️ **AutoMod Rule Deleted** by ${userMention(executor)}`;
                addField('Rule', formatCache(target));
                break;
            case AuditLogEvent.AutoModerationBlockMessage:
                logData.color = colorMap.delete;
                logData.description = `🛡️ **AutoMod Blocked Message** by ${userMention(executor)}`;
                addField('Rule', formatCache(extra?.auto_moderation_rule_name));
                addField('User', plainUser(target));
                break;
            case AuditLogEvent.AutoModerationFlagToChannel:
                logData.color = colorMap.update;
                logData.description = `🛡️ **AutoMod Flagged Message to Channel** by ${userMention(executor)}`;
                addField('Rule', formatCache(extra?.auto_moderation_rule_name));
                addField('User', plainUser(target));
                break;
            case AuditLogEvent.AutoModerationUserCommunicationDisabled:
                logData.color = colorMap.delete;
                logData.description = `🛡️ **AutoMod User Communication Disabled** by ${userMention(executor)}`;
                addField('Rule', formatCache(extra?.auto_moderation_rule_name));
                addField('User', plainUser(target));
                break;
            case AuditLogEvent.AutoModerationQuarantineUser:
                logData.color = colorMap.delete;
                logData.description = `🛡️ **AutoMod Quarantined User** by ${userMention(executor)}`;
                addField('Rule', formatCache(extra?.auto_moderation_rule_name));
                addField('User', plainUser(target));
                break;

            // Monetization
            case AuditLogEvent.CreatorMonetizationRequestCreated:
                logData.color = colorMap.create;
                logData.description = `💸 **Creator Monetization Request Created** by ${userMention(executor)}`;
                addField('User', userMention(target));
                break;
            case AuditLogEvent.CreatorMonetizationTermsAccepted:
                logData.color = colorMap.create;
                logData.description = `💸 **Creator Monetization Terms Accepted** by ${userMention(executor)}`;
                addField('User', userMention(target));
                break;

            // Onboarding
            case AuditLogEvent.OnboardingPromptCreate:
                logData.color = colorMap.create;
                logData.description = `📝 **Onboarding Prompt Created** by ${userMention(executor)}`;
                addField('Prompt', formatCache(target));
                break;
            case AuditLogEvent.OnboardingPromptUpdate:
                logData.color = colorMap.update;
                logData.description = `📝 **Onboarding Prompt Updated** by ${userMention(executor)}`;
                addField('Prompt', formatCache(target));
                addField('Changes', formatCache(changes));
                break;
            case AuditLogEvent.OnboardingPromptDelete:
                logData.color = colorMap.delete;
                logData.description = `📝 **Onboarding Prompt Deleted** by ${userMention(executor)}`;
                addField('Prompt', formatCache(target));
                break;
            case AuditLogEvent.OnboardingCreate:
                logData.color = colorMap.create;
                logData.description = `📝 **Onboarding Created** by ${userMention(executor)}`;
                addField('Onboarding', formatCache(target));
                break;
            case AuditLogEvent.OnboardingUpdate:
                logData.color = colorMap.update;
                logData.description = `📝 **Onboarding Updated** by ${userMention(executor)}`;
                addField('Onboarding', formatCache(target));
                addField('Changes', formatCache(changes));
                break;

            // Home Settings
            case AuditLogEvent.HomeSettingsCreate:
                logData.color = colorMap.create;
                logData.description = `🏠 **Home Settings Created** by ${userMention(executor)}`;
                addField('Settings', formatCache(target));
                break;
            case AuditLogEvent.HomeSettingsUpdate:
                logData.color = colorMap.update;
                logData.description = `🏠 **Home Settings Updated** by ${userMention(executor)}`;
                addField('Settings', formatCache(target));
                addField('Changes', formatCache(changes));
                break;
            case '192':
                logData.color = colorMap.update;
                logData.description = `🔊 Voice Channel Status Updated by ${userMention(executor)}`;
                addField('Settings', formatCache(target));
                addField('Changes', formatCache(changes));
                break;

            default:
                // Fallback for unknown/unsupported events
                logData.color = colorMap.default;
                logData.description = `❔ **Unknown/Unhandled Audit Event** (${action}) by ${userMention(executor)}`;
                addField('Target', formatCache(target));
                addField('Changes', formatCache(changes));
                addField('Extra', formatCache(extra));
                break;
        }

        if (reason) {
            logData.fields.push({ name: 'Reason', value: reason });
        }
        return logData;
    }
}

module.exports = AuditLogger;
