/**
 * @namespace: addons/core/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { kythiaInteraction } = require('../helpers/events');
const {
    EmbedBuilder,
    ChannelType,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    Collection,
} = require('discord.js');
const StickyMessage = require('@coreModels/StickyMessage');
const { automodSystem } = require('../helpers/automod');
const { formatDuration } = require('@src/utils/time');
const convertColor = require('@src/utils/color');
const { isOwner } = require('@utils/discord');
const AFK = require('@coreModels/UserAFK');
const { t } = require('@utils/translator');
const logger = require('@utils/logger');
const moment = require('moment');

module.exports = async (bot, message) => {
    const client = bot.client;

    const matchedPrefix = kythia.bot.prefixes.find((prefix) => message.content.startsWith(prefix));
    if (matchedPrefix) {
        if (message.author?.bot) return;

        const contentAfterPrefix = message.content.slice(matchedPrefix.length).trim();
        const args = contentAfterPrefix.split(/ +/);
        const commandName = args.shift().toLowerCase();

        const baseCommand = client.commands.get(commandName);
        if (!baseCommand) return;

        const remainingArgsString = args.join(' ');
        const fakeInteraction = kythiaInteraction(message, commandName, remainingArgsString);

        const subcommand = fakeInteraction.options.getSubcommand();
        const subcommandGroup = fakeInteraction.options.getSubcommandGroup();

        let finalCommandKey = commandName;
        if (subcommandGroup) finalCommandKey = `${commandName} ${subcommandGroup} ${subcommand}`;
        else if (subcommand) finalCommandKey = `${commandName} ${subcommand}`;

        const finalCommand = client.commands.get(finalCommandKey) || baseCommand;

        if (finalCommand.guildOnly && !message.guild) return;

        if (finalCommand.ownerOnly && !isOwner(message.author.id)) return;

        if (finalCommand.permissions && message.member) {
            if (message.member.permissions.missing(finalCommand.permissions).length > 0) return;
        }
        if (finalCommand.botPermissions && message.guild) {
            if (message.guild.members.me.permissions.missing(finalCommand.botPermissions).length > 0) return;
        }
        if (finalCommand.isInMainGuild) {
            const mainGuild = client.guilds.cache.get(kythia.bot.mainGuildId);
            if (!mainGuild) {
                logger.error(
                    `[isInMainGuild Check] Error: Bot is not a member of the main guild specified in config: ${kythia.bot.mainGuildId}`
                );
            }
            try {
                await mainGuild.members.fetch(message.author.id);
            } catch (error) {
                const container = new ContainerBuilder().setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }));
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(await t(message, 'common_error_not_in_main_guild', { name: mainGuild.name }))
                );
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
                container.addActionRowComponents(
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel(await t(message, 'common_error_not_in_main_guild_button_join'))
                            .setStyle(ButtonStyle.Link)
                            .setURL(kythia.settings.supportServer)
                    )
                );
                container.addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        await t(message, 'common_container_footer', { username: message.client.user.username })
                    )
                );
                return message.reply({ components: [container], flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2 });
            }
        }
        if (finalCommand.voteLocked && !isOwner(message.author.id)) {
            const voter = await KythiaVoter.getCache({ userId: interaction.user.id });

            const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

            if (!voter || voter.votedAt < twelveHoursAgo) {
                const container = new ContainerBuilder().setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }));
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'common_error_vote_locked')));
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
                container.addActionRowComponents(
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setLabel(
                                await t(interaction, 'common_error_vote_locked_button', {
                                    botName: interaction.client.user.username,
                                })
                            )
                            .setStyle(ButtonStyle.Link)
                            .setURL(`https://top.gg/bot/${kythia.bot.clientId}/vote`)
                    )
                );
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(message, 'common_container_footer')));
                return message.reply({
                    components: [container],
                    ephemeral: true,
                    flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                });
            }
        }

        const cooldownDuration = finalCommand.cooldown ?? kythia.bot.globalCommandCooldown ?? 0;
        if (cooldownDuration > 0 && !isOwner(message.author.id)) {
            const { cooldowns } = client;
            const cooldownKey = finalCommand.data?.name || finalCommandKey;
            if (!cooldowns.has(cooldownKey)) {
                cooldowns.set(cooldownKey, new Collection());
            }
            const now = Date.now();
            const timestamps = cooldowns.get(cooldownKey);
            const cooldownAmount = cooldownDuration * 1000;
            if (timestamps.has(message.author.id)) {
                const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
                if (now < expirationTime) {
                    const timeLeft = (expirationTime - now) / 1000;
                    const reply = await t(message, 'common_error_cooldown', { time: timeLeft.toFixed(1) });
                    return message
                        .reply(reply)
                        .then((msg) => setTimeout(() => msg.delete().catch(() => {}), 5000))
                        .catch(() => {});
                }
            }
            timestamps.set(message.author.id, now);
            setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
        }

        try {
            if (typeof finalCommand.execute === 'function') {
                await finalCommand.execute(fakeInteraction, client.container);
            } else {
                const helpMessage = await t(message, 'core_events_messageCreate_subcommand_required', { command: commandName });
                await message.reply(helpMessage);
            }
        } catch (err) {
            console.error(`❌ Error executing prefix command '${finalCommandKey}':`, err);
            await message.reply(await t(message, 'core_events_messageCreate_error', { command: finalCommandKey })).catch(() => {});
        }
        return;
    }

    if (message.guild) {
        if (!isOwner(message.author.id)) {
            const isFlagged = await automodSystem(message, client);
            if (isFlagged) return true;
        }

        const afkData = await AFK.getCache({
            userId: message.author.id,
            guildId: message.guild.id,
        });

        try {
            if (message.author?.bot) return;

            if (afkData) {
                const afkSince = afkData.timestamp;

                const duration = await formatDuration(Date.now() - afkSince.getTime(), message);
                const welcomeBackMessage = await t(message, 'core_events_messageCreate_back', {
                    user: message.author.toString(),
                    duration: duration,
                });

                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(welcomeBackMessage)
                    .setFooter({ text: await t(message, 'common_embed_footer', { username: client.user.username }) });

                if (message.channel && message.channel.type !== ChannelType.DM) {
                    const reply = await message.reply({ embeds: [embed] }).catch(() => null);
                } else {
                    await message.author.send({ embeds: [embed] }).catch(() => {});
                }
                await afkData.destroy({ individualHooks: true });
            }
        } catch (error) {
            console.error('Error saat user kembali dari AFK:', error);

            try {
                const errorMessage = await t(message, 'core_events_messageCreate_error');
                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(errorMessage)
                    .setFooter({ text: await t(message, 'common_embed_footer', { username: message.author.toString() }) });
                await message.author.send({ embeds: [embed] });
            } catch (dmError) {
                console.error('Gagal mengirim DM error AFK ke user:', dmError);
            }

            if (afkData) {
                await afkData.destroy().catch((e) => console.error('Gagal menghapus data AFK setelah error:', e));
            }
        }

        const mentionedUsers = message.mentions.users;
        if (mentionedUsers.size > 0 && !afkData) {
            if (message.author?.bot) return;

            const afkReplies = [];

            for (const user of mentionedUsers.values()) {
                if (user.id === message.author.id) continue;

                try {
                    const mentionedAfkData = await AFK.getCache({ userId: user.id, guildId: message.guild.id });

                    if (mentionedAfkData) {
                        const afkSince = moment(mentionedAfkData.timestamp).fromNow();
                        const reason = mentionedAfkData.reason;
                        const afkReplyLine = await t(message, 'core_events_messageCreate_line', {
                            user: user.tag,
                            reason: reason,
                            time: afkSince,
                        });
                        afkReplies.push(afkReplyLine);
                    }
                } catch (error) {
                    console.error("Error checking mentioned user's AFK status:", error);
                }
            }

            if (afkReplies.length > 0) {
                const combinedReply = afkReplies.join('\n');
                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(combinedReply)
                    .setFooter({ text: await t(message, 'common_embed_footer', { username: client.user.username }) });
                const reply = await message.reply({ embeds: [embed] });
                setTimeout(() => reply.delete().catch(console.error), 30000);
            }
        }

        try {
            const sticky = await StickyMessage.getCache({ channelId: message.channel.id });
            if (sticky) {
                if (sticky.messageId) {
                    const oldMsg = await message.channel.messages.fetch(sticky.messageId).catch(() => null);
                    if (oldMsg) await oldMsg.delete().catch(() => {});
                }
                const stickyEmbed = new EmbedBuilder()
                    .setTitle(await t(message, 'core_events_messageCreate_sticky_title'))
                    .setDescription(sticky.message)
                    .setColor(kythia.bot.color)
                    .setFooter({ text: await t(message, 'common_embed_footer', { username: client.user.username }) });

                const sent = await message.channel.send({ embeds: [stickyEmbed] });
                sticky.messageId = sent.id;
                sticky.changed('messageId', true);
                await sticky.saveAndUpdateCache('channelId');
            }
        } catch (err) {
            console.error('❌ Error loading sticky:', err);
        }
    }
};
