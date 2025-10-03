/**
 * @namespace: addons/economy/commands/profile.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('@coreModels/User');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('profile')
            .setDescription("🗃️ View a user's full profile, including level, bank, cash, and more.")
            .addUserOption((option) => option.setName('user').setDescription('The user whose profile you want to view').setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply();

        // Get target user or self
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const userId = targetUser.id;
        const guildId = interaction.guild.id;

        let member;
        try {
            member = await interaction.guild.members.fetch(targetUser.id);
        } catch (e) {
            // fallback if user not in guild
            member = null;
        }

        // Fetch user data
        const userData = await User.getCache({ userId: userId, guildId: guildId });
        if (!userData) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy_withdraw_no_account_desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        // Level & XP (if available)
        let level = userData.level || 1;
        let xp = userData.xp || 0;
        let nextLevelXp = level * 100 || 100;

        // Bank & cash
        let bank = userData.bank || 0;
        let cash = userData.cash || 0;
        let bankType = userData.bankType ? userData.bankType.toUpperCase() : '-';

        // Build embed using t for all text
        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setDescription(
                [
                    `## ${await t(interaction, 'economy_profile_profile_title')}`,
                    await t(interaction, 'economy_profile_profile_user_line', {
                        username: targetUser.username,
                        userId: targetUser.id,
                    }),
                    '',
                    await t(interaction, 'economy_profile_profile_tag_id_line', {
                        tag: targetUser.discriminator,
                        id: targetUser.id,
                    }),
                    await t(interaction, 'economy_profile_profile_created_line', {
                        created: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`,
                    }),
                    await t(interaction, 'economy_profile_profile_joined_line', {
                        joined:
                            member && member.joinedTimestamp
                                ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`
                                : await t(interaction, 'economy_profile_profile_joined_unknown'),
                    }),
                    await t(interaction, 'economy_profile_profile_bot_status_line', {
                        isBot: targetUser.bot
                            ? await t(interaction, 'economy_profile_profile_bot_yes')
                            : await t(interaction, 'economy_profile_profile_bot_no'),
                        status:
                            member && member.presence && member.presence.status
                                ? member.presence.status
                                : await t(interaction, 'economy_profile_profile_status_unknown'),
                    }),
                    '',
                    `### ${await t(interaction, 'economy_profile_profile_level_xp_title')}`,
                    await t(interaction, 'economy_profile_profile_level_xp_line', {
                        level,
                        xp,
                        nextLevelXp,
                    }),
                    '',
                    `### ${await t(interaction, 'economy_profile_profile_finance_title')}`,
                    await t(interaction, 'economy_profile_profile_bank_line', {
                        bank: bank.toLocaleString(),
                        bankType: bankType !== '-' ? `(${bankType})` : '',
                    }),
                    await t(interaction, 'economy_profile_profile_cash_line', {
                        cash: cash.toLocaleString(),
                    }),
                ].join('\n')
            )
            .setFooter(await embedFooter(interaction));
        // .setTimestamp();

        return interaction.editReply({ embeds: [embed] });
    },
};
