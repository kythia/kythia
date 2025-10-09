/**
 * @namespace: addons/streak/commands/streak.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { getOrCreateStreak, updateNickname, getTodayDateString, getYesterdayDateString, giveStreakRoleReward } = require('../helpers');
const { SlashCommandBuilder, EmbedBuilder, InteractionContextType } = require('discord.js');
const ServerSetting = require('@coreModels/ServerSetting');
const Streak = require('../database/models/Streak');
const { t } = require('@utils/translator');
const { Op } = require('sequelize');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('streak')
        .setDescription('Check and claim your daily streak!')
        .addSubcommand((sub) => sub.setName('claim').setDescription('Klaim streak harianmu untuk hari ini!'))
        .addSubcommand((sub) => sub.setName('me').setDescription('Lihat status streak harianmu saat ini.'))
        .addSubcommand((sub) => sub.setName('leaderboard').setDescription('Lihat leaderboard streak di server ini.'))
        .addSubcommand((sub) => sub.setName('reset').setDescription('Reset streak kamu ke 0 (hati-hati, tidak bisa dibatalkan).'))
        .addSubcommand((sub) => sub.setName('stats').setDescription('Lihat statistik streak server ini.'))
        .addSubcommand((sub) =>
            sub
                .setName('user')
                .setDescription('Lihat streak user lain.')
                .addUserOption((opt) => opt.setName('target').setDescription('User yang ingin dicek streak-nya').setRequired(true))
        )
        .setContexts(InteractionContextType.Guild),
    guildOnly: true,
    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const guildId = interaction.guild.id;

        const serverSetting = await ServerSetting.getCache({ guildId });
        const streakEmoji = serverSetting.streakEmoji || '🔥';
        const streakMinimum = typeof serverSetting.streakMinimum === 'number' ? serverSetting.streakMinimum : 3;
        const streakRoleReward = Array.isArray(serverSetting.streakRoleReward) ? serverSetting.streakRoleReward : [];
        const streakFreezeDailyLimit = typeof serverSetting.streakFreezeDailyLimit === 'number' ? serverSetting.streakFreezeDailyLimit : 1;
        const streakFreezeInitial = typeof serverSetting.streakFreezeInitial === 'number' ? serverSetting.streakFreezeInitial : 1;

        try {
            if (sub === 'claim') {
                await interaction.deferReply();

                const streak = await getOrCreateStreak(userId, guildId);
                const today = getTodayDateString();

                if (streak.lastClaimTimestamp && streak.lastClaimTimestamp.toISOString().slice(0, 10) === today) {
                    const embed = new EmbedBuilder()
                        .setColor(kythia.bot.color)
                        .setDescription(
                            `## ${await t(interaction, 'streak_streak_claim_already_title')}\n` +
                                (await t(interaction, 'streak_streak_claim_already_desc', {
                                    streak: streak.currentStreak,
                                    emoji: streakEmoji,
                                }))
                        )
                        .setThumbnail(interaction.user.displayAvatarURL());
                    return interaction.editReply({ embeds: [embed] });
                }

                const yesterday = getYesterdayDateString();
                let message;
                let lastClaimDateStr = streak.lastClaimTimestamp ? streak.lastClaimTimestamp.toISOString().slice(0, 10) : null;

                if (lastClaimDateStr !== yesterday && lastClaimDateStr !== today && streak.currentStreak > 0) {
                    if (streak.streakFreezes > 0) {
                        streak.streakFreezes -= 1;
                        streak.currentStreak += 1;
                        message = await t(interaction, 'streak_streak_claim_freeze_used', {
                            streakFreezes: streak.streakFreezes,
                        });
                    } else {
                        streak.currentStreak = 1;
                        message = await t(interaction, 'streak_streak_claim_new_streak');
                    }
                } else if (lastClaimDateStr === yesterday) {
                    streak.currentStreak += 1;
                    message = await t(interaction, 'streak_streak_claim_continue');
                } else {
                    streak.currentStreak = 1;
                    message = await t(interaction, 'streak_streak_claim_new_streak');
                }

                if (streak.currentStreak > streak.highestStreak) {
                    streak.highestStreak = streak.currentStreak;
                }

                streak.lastClaimTimestamp = new Date(today);
                await streak.save();
                await updateNickname(interaction.member, streak.currentStreak, streakEmoji, streakMinimum);

                let rewardRolesGiven = [];
                if (streakRoleReward.length > 0) {
                    rewardRolesGiven = await giveStreakRoleReward(interaction.member, streak.currentStreak, streakRoleReward);
                }

                let rewardMsg = '';
                if (rewardRolesGiven.length > 0) {
                    const roleMentions = rewardRolesGiven.map((roleId) => {
                        const role = interaction.guild.roles.cache.get(roleId);
                        return role ? `<@&${role.id}>` : `Role ID: ${roleId}`;
                    });
                    rewardMsg = '\n\n' + (await t(interaction, 'streak_streak_claim_reward', { roles: roleMentions.join(', ') }));
                }

                const successEmbed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(`## ${await t(interaction, 'streak_streak_claim_success_title')}\n` + message + rewardMsg)
                    .addFields(
                        {
                            name: await t(interaction, 'streak_streak_field_current', { emoji: streakEmoji }),
                            value: `**${streak.currentStreak}** ${await t(interaction, 'streak_streak_unit_day')}`,
                            inline: true,
                        },
                        {
                            name: await t(interaction, 'streak_streak_field_highest'),
                            value: `**${streak.highestStreak}** ${await t(interaction, 'streak_streak_unit_day')}`,
                            inline: true,
                        },
                        {
                            name: await t(interaction, 'streak_streak_field_freeze'),
                            value: `**${streak.streakFreezes}**`,
                            inline: true,
                        }
                    )
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter({ text: await t(interaction, 'streak_streak_claim_footer') });

                return interaction.editReply({ embeds: [successEmbed], ephemeral: false });
            }

            if (sub === 'me') {
                await interaction.deferReply();
                const streak = await getOrCreateStreak(userId, guildId);
                const today = getTodayDateString();
                const lastClaimDateStr = streak.lastClaimTimestamp ? streak.lastClaimTimestamp.toISOString().slice(0, 10) : null;
                const status =
                    lastClaimDateStr === today
                        ? await t(interaction, 'streak_streak_me_status_claimed')
                        : await t(interaction, 'streak_streak_me_status_not_claimed');

                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(
                        `## ${await t(interaction, 'streak_streak_me_title', { username: interaction.user.username })}\n` + status
                    )
                    .addFields(
                        {
                            name: await t(interaction, 'streak_streak_field_current', { emoji: streakEmoji }),
                            value: `**${streak.currentStreak}** ${await t(interaction, 'streak_streak_unit_day')}`,
                            inline: true,
                        },
                        {
                            name: await t(interaction, 'streak_streak_field_highest'),
                            value: `**${streak.highestStreak}** ${await t(interaction, 'streak_streak_unit_day')}`,
                            inline: true,
                        },
                        {
                            name: await t(interaction, 'streak_streak_field_freeze'),
                            value: `**${streak.streakFreezes ?? 0}**`,
                            inline: true,
                        }
                    )
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter({
                        text: await t(interaction, 'streak_streak_footer_requested_by', { username: interaction.user.username }),
                        iconURL: interaction.user.displayAvatarURL(),
                    });

                return interaction.editReply({ embeds: [embed] });
            }

            if (sub === 'leaderboard') {
                await interaction.deferReply();
                const topStreaks = await Streak.findAll({
                    where: { guildId },
                    order: [
                        ['currentStreak', 'DESC'],
                        ['highestStreak', 'DESC'],
                    ],
                    limit: 10,
                });

                if (topStreaks.length === 0) {
                    const embed = new EmbedBuilder()
                        .setColor(kythia.bot.color)
                        .setDescription(
                            `## ${await t(interaction, 'streak_streak_leaderboard_title')}\n` +
                                (await t(interaction, 'streak_streak_leaderboard_empty'))
                        );
                    return interaction.editReply({ embeds: [embed] });
                }

                const userIds = topStreaks.map((s) => s.userId);
                let members;
                try {
                    members = await interaction.guild.members.fetch({ user: userIds });
                } catch {
                    members = new Map();
                }

                const leaderboardDesc = await Promise.all(
                    topStreaks.map(async (streak, index) => {
                        const member = members.get(streak.userId);
                        const username = member
                            ? member.displayName
                            : await t(interaction, 'streak_streak_leaderboard_unknown_user', { id: streak.userId.slice(0, 6) });
                        const medal = ['🥇', '🥈', '🥉'][index] || `**${index + 1}.**`;
                        return await t(interaction, 'streak_streak_leaderboard_entry', {
                            medal,
                            username,
                            emoji: streakEmoji,
                            current: streak.currentStreak,
                            highest: streak.highestStreak,
                            freeze: streak.streakFreezes ?? 0,
                        });
                    })
                );

                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(`## ${await t(interaction, 'streak_streak_leaderboard_title')}\n` + leaderboardDesc.join('\n'))
                    .setFooter({ text: await t(interaction, 'streak_streak_leaderboard_footer', { server: interaction.guild.name }) })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            if (sub === 'reset') {
                await interaction.deferReply({ ephemeral: true });
                const streak = await getOrCreateStreak(userId, guildId);

                if (streak.currentStreak === 0) {
                    const embed = new EmbedBuilder()
                        .setColor(kythia.bot.color)
                        .setDescription(
                            `## ${await t(interaction, 'streak_streak_reset_title')}\n` +
                                (await t(interaction, 'streak_streak_reset_already_zero'))
                        );
                    return interaction.editReply({ embeds: [embed], ephemeral: true });
                }

                streak.currentStreak = 0;
                streak.lastClaimTimestamp = null;

                await streak.save();
                await updateNickname(interaction.member, 0, streakEmoji, streakMinimum);

                if (streakRoleReward.length > 0 && interaction.member.manageable) {
                    for (const reward of streakRoleReward) {
                        try {
                            if (interaction.member.roles.cache.has(reward.role)) {
                                await interaction.member.roles.remove(reward.role, 'Reset streak, hapus role reward');
                            }
                        } catch (e) {}
                    }
                }

                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(
                        `## ${await t(interaction, 'streak_streak_reset_title')}\n` + (await t(interaction, 'streak_streak_reset_success'))
                    );
                return interaction.editReply({ embeds: [embed], ephemeral: true });
            }

            if (sub === 'stats') {
                await interaction.deferReply();

                const total = await Streak.count({ where: { guildId } });
                const maxStreak = (await Streak.max('highestStreak', { where: { guildId } })) || 0;

                const avgStreak = await Streak.findAll({
                    where: { guildId },
                    attributes: [[Streak.sequelize.fn('AVG', Streak.sequelize.col('currentStreak')), 'avgStreak']],
                    raw: true,
                });
                const avg = avgStreak[0] && avgStreak[0].avgStreak ? Number(avgStreak[0].avgStreak).toFixed(2) : '0';

                const activeStreaks = await Streak.count({
                    where: {
                        guildId,
                        currentStreak: { [Op.gt]: 0 },
                    },
                });

                const topUser = await Streak.findOne({
                    where: { guildId },
                    order: [
                        ['highestStreak', 'DESC'],
                        ['currentStreak', 'DESC'],
                    ],
                });

                let topUserDisplay = '-';
                if (topUser) {
                    try {
                        const member = await interaction.guild.members.fetch(topUser.userId);
                        topUserDisplay = await t(interaction, 'streak_streak_stats_topuser', {
                            username: member.displayName,
                            highest: topUser.highestStreak,
                        });
                    } catch {
                        topUserDisplay = await t(interaction, 'streak_streak_stats_topuser_unknown', {
                            id: topUser.userId.slice(0, 8),
                            highest: topUser.highestStreak,
                        });
                    }
                }

                const lastClaim = await Streak.findOne({
                    where: { guildId },
                    order: [['lastClaimTimestamp', 'DESC']],
                });
                let lastClaimInfo = '-';
                if (lastClaim && lastClaim.lastClaimTimestamp) {
                    const date = new Date(lastClaim.lastClaimTimestamp);
                    lastClaimInfo = `<t:${Math.floor(date.getTime() / 1000)}:F>`;
                }

                const activePercent = total > 0 ? ((activeStreaks / total) * 100).toFixed(1) : '0';

                const totalFreeze = (await Streak.sum('streakFreezes', { where: { guildId } })) || 0;

                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(
                        `## ${await t(interaction, 'streak_streak_stats_title')}\n` +
                            [
                                await t(interaction, 'streak_streak_stats_server', { server: interaction.guild.name }),
                                await t(interaction, 'streak_streak_stats_last_claim', { lastClaim: lastClaimInfo }),
                                await t(interaction, 'streak_streak_stats_topuser_field', { topUser: topUserDisplay }),
                                await t(interaction, 'streak_streak_stats_total_freeze', { totalFreeze }),
                                `\u200B`,
                            ].join('\n')
                    )
                    .addFields(
                        {
                            name: await t(interaction, 'streak_streak_stats_field_total'),
                            value: `${total}`,
                            inline: true,
                        },
                        {
                            name: await t(interaction, 'streak_streak_stats_field_active', { emoji: streakEmoji }),
                            value: `${activeStreaks} (${activePercent}%)`,
                            inline: true,
                        },
                        {
                            name: await t(interaction, 'streak_streak_stats_field_avg'),
                            value: `${avg}`,
                            inline: true,
                        },
                        {
                            name: await t(interaction, 'streak_streak_stats_field_max'),
                            value: `${maxStreak} ${await t(interaction, 'streak_streak_unit_day')}`,
                            inline: true,
                        }
                    )
                    .setFooter({ text: await t(interaction, 'streak_streak_stats_footer', { server: interaction.guild.name }) })
                    .setTimestamp();

                return interaction.editReply({ embeds: [embed] });
            }

            if (sub === 'user') {
                await interaction.deferReply();
                const target = interaction.options.getUser('target');
                if (!target) {
                    const embed = new EmbedBuilder()
                        .setColor(kythia.bot.color)
                        .setDescription(
                            `## ${await t(interaction, 'streak_streak_user_title')}\n` +
                                (await t(interaction, 'streak_streak_user_not_found'))
                        );
                    return interaction.editReply({ embeds: [embed], ephemeral: true });
                }
                const targetId = target.id;
                const streak = await getOrCreateStreak(targetId, guildId);
                const today = getTodayDateString();
                const lastClaimDateStr = streak.lastClaimTimestamp ? streak.lastClaimTimestamp.toISOString().slice(0, 10) : null;
                const status =
                    lastClaimDateStr === today
                        ? await t(interaction, 'streak_streak_me_status_claimed')
                        : await t(interaction, 'streak_streak_me_status_not_claimed');

                let member;
                try {
                    member = await interaction.guild.members.fetch(targetId);
                } catch {
                    member = null;
                }
                const displayName = member ? member.displayName : target.username;

                const embed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(`## ${await t(interaction, 'streak_streak_user_title_user', { username: displayName })}\n` + status)
                    .addFields(
                        {
                            name: await t(interaction, 'streak_streak_field_current', { emoji: streakEmoji }),
                            value: `**${streak.currentStreak}** ${await t(interaction, 'streak_streak_unit_day')}`,
                            inline: true,
                        },
                        {
                            name: await t(interaction, 'streak_streak_field_highest'),
                            value: `**${streak.highestStreak}** ${await t(interaction, 'streak_streak_unit_day')}`,
                            inline: true,
                        },
                        {
                            name: await t(interaction, 'streak_streak_field_freeze'),
                            value: `**${streak.streakFreezes ?? 0}**`,
                            inline: true,
                        }
                    )
                    .setThumbnail(target.displayAvatarURL())
                    .setFooter({
                        text: await t(interaction, 'streak_streak_footer_requested_by', { username: interaction.user.username }),
                        iconURL: interaction.user.displayAvatarURL(),
                    });

                return interaction.editReply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error executing streak command:', error);
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(
                    `## ${await t(interaction, 'streak_streak_error_title')}\n` + (await t(interaction, 'streak_streak_error_generic'))
                );
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.reply({ embeds: [embed], ephemeral: true });
            }
        }
    },
};
