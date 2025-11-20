/**
 * @namespace: addons/core/events/messageCreate.js
 * @type: Event Handler
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
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
    WebhookClient,
} = require('discord.js');
const { automodSystem } = require('../helpers/automod');

const moment = require('moment');

module.exports = async (bot, message) => {
    const client = bot.client;
    const container = client.container;
    const { logger, helpers, t, models, kythiaConfig } = container;
    const { UserAFK, StickyMessage } = models;
    const { isOwner } = helpers.discord;
    const { formatDuration } = helpers.time;
    const { convertColor } = helpers.color;

    // Only wrap the core logic; do not wrap imports or object declarations
    try {
        const contentLower = message.content.toLowerCase();
        const matchedPrefix = kythiaConfig.bot.prefixes.find((prefix) => contentLower.startsWith(prefix.toLowerCase()));
        if (matchedPrefix) {
            if (message.author?.bot) return;

            const contentAfterPrefix = message.content.slice(matchedPrefix.length).trim();
            const args = contentAfterPrefix.split(/ +/);
            const commandName = args.shift().toLowerCase();

            // Command lookup: main, then alias.
            let baseCommand =
                client.commands.get(commandName) ||
                [...client.commands.values()].find(
                    (cmd) => Array.isArray(cmd.aliases) && cmd.aliases.map((a) => a.toLowerCase()).includes(commandName)
                );

            if (!baseCommand) return;

            const remainingArgsString = args.join(' ');
            const fakeInteraction = kythiaInteraction(message, commandName, remainingArgsString);

            const subcommand = fakeInteraction.options.getSubcommand();
            const subcommandGroup = fakeInteraction.options.getSubcommandGroup();

            // Final command key: look for subcommand/subgroup form first (in case mapped as an explicit key)
            let finalCommandKey = commandName;
            if (subcommandGroup) finalCommandKey = `${commandName} ${subcommandGroup} ${subcommand}`;
            else if (subcommand) finalCommandKey = `${commandName} ${subcommand}`;

            // Try the key directly, or fall back to baseCommand
            let finalCommand =
                client.commands.get(finalCommandKey) ||
                // Try to resolve the alias form as well for subcommands
                [...client.commands.values()].find(
                    (cmd) =>
                        Array.isArray(cmd.aliases) &&
                        (cmd.aliases.map((a) => a.toLowerCase()).includes(finalCommandKey) ||
                            cmd.aliases.map((a) => a.toLowerCase()).includes(commandName))
                ) ||
                baseCommand;

            if (!finalCommand) return;

            if (finalCommand.guildOnly && !message.guild) return;

            if (finalCommand.ownerOnly && !isOwner(message.author.id)) return;

            if (finalCommand.permissions && message.member) {
                if (message.member.permissions.missing(finalCommand.permissions).length > 0) return;
            }
            if (finalCommand.botPermissions && message.guild) {
                if (message.guild.members.me.permissions.missing(finalCommand.botPermissions).length > 0) return;
            }
            if (finalCommand.isInMainGuild) {
                const mainGuild = client.guilds.cache.get(kythiaConfig.bot.mainGuildId);
                if (!mainGuild) {
                    logger.error(
                        `[isInMainGuild Check] Error: Bot is not a member of the main guild specified in config: ${kythiaConfig.bot.mainGuildId}`
                    );
                }
                try {
                    await mainGuild.members.fetch(message.author.id);
                } catch (error) {
                    const container = new ContainerBuilder().setAccentColor(
                        convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' })
                    );
                    container.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            await t(message, 'common.error.not.in.main.guild.text', { name: mainGuild.name })
                        )
                    );
                    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
                    container.addActionRowComponents(
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setLabel(await t(message, 'common.error.not.in.main.guild.button.join'))
                                .setStyle(ButtonStyle.Link)
                                .setURL(kythiaConfig.settings.supportServer)
                        )
                    );
                    container.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(
                            await t(message, 'common.container.footer', { username: message.client.user.username })
                        )
                    );
                    return message.reply({ components: [container], flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2 });
                }
            }
            if (finalCommand.voteLocked && !isOwner(message.author.id)) {
                const voter = await KythiaVoter.getCache({ userId: message.author.id });

                const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

                if (!voter || voter.votedAt < twelveHoursAgo) {
                    const container = new ContainerBuilder().setAccentColor(
                        convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' })
                    );
                    container.addTextDisplayComponents(
                        new TextDisplayBuilder().setContent(await t(message, 'common.error.vote.locked.text'))
                    );
                    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
                    container.addActionRowComponents(
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setLabel(
                                    await t(message, 'common.error.vote.locked.button', {
                                        botName: message.client.user.username,
                                    })
                                )
                                .setStyle(ButtonStyle.Link)
                                .setURL(`https://top.gg/bot/${kythiaConfig.bot.clientId}/vote`)
                        )
                    );
                    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
                    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(message, 'common.container.footer')));
                    return message.reply({
                        components: [container],
                        ephemeral: true,
                        flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                    });
                }
            }

            const cooldownDuration = finalCommand.cooldown ?? kythiaConfig.bot.globalCommandCooldown ?? 0;
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
                        const reply = await t(message, 'common.error.cooldown', { time: timeLeft.toFixed(1) });
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
                    const helpMessage = await t(message, 'core.events.messageCreate.subcommand.required', { command: commandName });
                    await message.reply(helpMessage);
                }
            } catch (err) {
                logger.error(`❌ Error executing prefix command '${finalCommandKey}':`, err);
                await message.reply(await t(message, 'core.events.messageCreate.error', { command: finalCommandKey })).catch(() => {});
            }
            return;
        }

        if (message.guild) {
            if (isOwner(message.author.id) || message.member?.permissions.has(['Administrator', 'ManageGuild'])) {
                const isFlagged = await automodSystem(message, client);
                if (isFlagged) return true;
            }

            const afkData = await UserAFK.getCache({
                userId: message.author.id,
            });

            try {
                if (message.author?.bot) return;

                if (afkData) {
                    const afkSince = afkData.timestamp;

                    const duration = await formatDuration(Date.now() - afkSince.getTime(), message);
                    const welcomeBackMessage = await t(message, 'core.events.messageCreate.back', {
                        user: message.author.toString(),
                        duration: duration,
                    });

                    const embed = new EmbedBuilder()
                        .setColor(kythiaConfig.bot.color)
                        .setDescription(welcomeBackMessage)
                        .setFooter({ text: await t(message, 'common.embed.footer', { username: client.user.username }) });

                    if (message.channel && message.channel.type !== ChannelType.DM) {
                        const reply = await message.reply({ embeds: [embed] }).catch(() => null);
                        if (reply) setTimeout(() => reply.delete().catch(() => {}), 5000);
                    } else {
                        const dm = await message.author.send({ embeds: [embed] }).catch(() => null);
                        if (dm) setTimeout(() => {
                            dm.delete && dm.delete().catch(() => {});
                        }, 5000);
                    }
                    await afkData.destroy({ individualHooks: true });
                }
            } catch (error) {
                logger.error('Error when user returned from UserAFK:', error);

                try {
                    const errorMessage = await t(message, 'core.events.messageCreate.error');
                    const embed = new EmbedBuilder()
                        .setColor(kythiaConfig.bot.color)
                        .setDescription(errorMessage)
                        .setFooter({ text: await t(message, 'common.embed.footer', { username: message.author.toString() }) });
                    await message.author.send({ embeds: [embed] });
                } catch (dmError) {
                    logger.error('Failed to send DM error from UserAFK to user:', dmError);
                }

                if (afkData) {
                    await afkData.destroy().catch((e) => logger.error('Failed to delete UserAFK data after error:', e));
                }
            }

            const mentionedUsers = message.mentions.users;
            if (mentionedUsers.size > 0 && !afkData) {
                if (message.author?.bot) return;

                const afkReplies = [];

                for (const user of mentionedUsers.values()) {
                    if (user.id === message.author.id) continue;

                    try {
                        const mentionedAfkData = await UserAFK.getCache({ userId: user.id });

                        if (mentionedAfkData) {
                            const afkSince = moment(mentionedAfkData.timestamp).fromNow();
                            const reason = mentionedAfkData.reason;
                            const afkReplyLine = await t(message, 'core.events.messageCreate.line', {
                                user: user.tag,
                                reason: reason,
                                time: afkSince,
                            });
                            afkReplies.push(afkReplyLine);
                        }
                    } catch (error) {
                        logger.error("Error checking mentioned user's UserAFK status:", error);
                    }
                }

                if (afkReplies.length > 0) {
                    const combinedReply = afkReplies.join('\n');
                    const embed = new EmbedBuilder()
                        .setColor(kythiaConfig.bot.color)
                        .setDescription(combinedReply)
                        .setFooter({ text: await t(message, 'common.embed.footer', { username: client.user.username }) });
                    const reply = await message.reply({ embeds: [embed] });
                    setTimeout(() => reply.delete().catch(logger.error), 30000);
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
                        .setTitle(await t(message, 'core.events.messageCreate.sticky.title'))
                        .setDescription(sticky.message)
                        .setColor(kythiaConfig.bot.color)
                        .setFooter({ text: await t(message, 'common.embed.footer', { username: client.user.username }) });

                    const sent = await message.channel.send({ embeds: [stickyEmbed] });
                    sticky.messageId = sent.id;
                    sticky.changed('messageId', true);
                    await sticky.saveAndUpdateCache('channelId');
                }
            } catch (err) {
                logger.error('❌ Error loading sticky:', err);
            }
        }
    } catch (error) {
        // Begin enhanced error formatting and reporting
        logger.error(`Error in messageCreate handler for ${message.author ? message.author.tag : '???'}:`, error);

        // Sentry report (if available)
        if (kythiaConfig.sentry && kythiaConfig.sentry.dsn && typeof Sentry !== 'undefined' && Sentry.withScope) {
            try {
                Sentry.withScope((scope) => {
                    if (message.author) {
                        scope.setUser({ id: message.author.id, username: message.author.tag });
                    }
                    if (message.content) {
                        scope.setTag('content', message.content);
                    }
                    if (message.guild) {
                        scope.setContext('guild', {
                            id: message.guild.id,
                            name: message.guild.name,
                        });
                    }
                    Sentry.captureException(error);
                });
            } catch (err) {
                logger.error('Failed to send error to Sentry from messageCreate:', err);
            }
        }

        // Container Builder user error message
        try {
            const ownerFirstId = kythiaConfig.owner && kythiaConfig.owner.ids ? kythiaConfig.owner.ids.split(',')[0].trim() : '';

            const components = [
                new ContainerBuilder()
                    .setAccentColor(convertColor('Red', { from: 'discord', to: 'decimal' }))
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(message, 'common.error.generic')))
                    .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                    .addActionRowComponents(
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Link)
                                .setLabel(await t(message, 'common.error.button.join.support.server'))
                                .setURL(kythiaConfig.settings.supportServer),
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Link)
                                .setLabel(await t(message, 'common.error.button.contact.owner'))
                                .setURL(`discord://-/users/${ownerFirstId}`)
                        )
                    ),
            ];

            if (message.channel && typeof message.reply === 'function') {
                await message
                    .reply({
                        components,
                        flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                    })
                    .catch(() => {});
            } else if (message.author && typeof message.author.send === 'function') {
                await message.author
                    .send({
                        components,
                        flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                    })
                    .catch(() => {});
            }
        } catch (e) {
            logger.error('Failed to send messageCreate error message to user:', e);
        }

        // Webhook logging
        try {
            if (
                kythiaConfig.api &&
                kythiaConfig.api.webhookErrorLogs &&
                kythiaConfig.settings &&
                kythiaConfig.settings.webhookErrorLogs === true
            ) {
                const webhookClient = new WebhookClient({ url: kythiaConfig.api.webhookErrorLogs });
                const errorEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(
                        `## ❌ Error at ${message.author ? message.author.tag : '???'}\n` +
                            `\`\`\`${error && error.stack ? error.stack : `${error}`}\`\`\``
                    )
                    .setFooter({
                        text: message.guild ? `Error from server ${message.guild.name}` : 'Error from DM',
                    })
                    .setTimestamp();
                await webhookClient.send({ embeds: [errorEmbed] });
            }
        } catch (webhookErr) {
            logger.error('Error sending messageCreate error webhook:', webhookErr);
        }
    }
};
