/**
 * @namespace: addons/core/helpers/system.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const ModLog = require('@coreModels/ModLog');
const convertColor = require('kythia-core').utils.color;
const { t } = require('@coreHelpers/translator');

async function sendLogsWarning(message, reason, originalContent = null, setting, userId = message.author.id) {
    // Send warning message in channel
    const warningMessage = await t(message, 'core.helpers.system.warning.public', {
        userId,
        reason,
    });
    const warning = await message.channel.send(warningMessage);
    setTimeout(() => warning.delete(), 10000);

    // Attempt to send a direct message warning to the user
    try {
        const dmEmbed = {
            color: convertColor('Red', { from: 'discord', to: 'decimal' }),
            description: await t(message, 'core.helpers.system.warning.dm.description', {
                guildName: message.guild.name,
                reason,
            }),
            footer: {
                text: await t(message, 'common.embed.footer', {
                    username: message.client.user.username,
                }),
                icon_url: message.client.user.displayAvatarURL({ dynamic: true }) || undefined,
            },
        };
        await message.author.send({ embeds: [dmEmbed] }).catch(() => {
            // Optionally log DM failure
            console.warn(`Failed to send DM to ${message.author.tag}. DMs may be disabled.`);
        });
    } catch (dmError) {
        console.error(`Failed to send DM to ${message.author.tag}:`, dmError);
    }

    // Log the action to the moderation log database
    try {
        await ModLog.create({
            guildId: message.guild.id,
            moderatorId: message.client.user.id,
            moderatorTag: message.client.user.tag,
            targetId: message.author.id,
            targetTag: message.author.tag,
            action: 'Automod Warning',
            reason: reason,
            channelId: message.channel.id,
        });
        console.log(`[DB LOG] Automod log for user ${message.author.tag} saved successfully.`);
    } catch (dbError) {
        console.error('Failed to save moderation log to database:', dbError);
    }

    // Send a log embed to the moderation log channel, if configured
    const logChannel = message.guild.channels.cache.get(setting.modLogChannelId);
    if (logChannel) {
        const embed = {
            color: convertColor('Red', { from: 'discord', to: 'decimal' }),
            description: await t(message, 'core.helpers.system.warning.log.description', {
                userId: message.author.id,
                userTag: message.author.tag,
                channelId: message.channel.id,
                channelName: message.channel.name,
                reason,
                originalContent: originalContent
                    ? originalContent.slice(0, 1000) + (originalContent.length > 1000 ? '... (truncated)' : '')
                    : null,
            }),
            fields: [
                {
                    name: await t(message, 'core.helpers.system.warning.log.field.sentat'),
                    value: `<t:${Math.floor(message.createdTimestamp / 1000)}:F>`,
                },
            ],
            footer: {
                text: await t(message, 'common.embed.footer', {
                    username: message.client.user.username,
                }),
                icon_url: message.client.user.displayAvatarURL({ dynamic: true }) || undefined,
            },
        };

        logChannel.send({ embeds: [embed] }).catch(console.error);
    }
}

module.exports = { sendLogsWarning };
