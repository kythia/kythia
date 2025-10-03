/**
 * @namespace: addons/economy/commands/hack.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { embedFooter, checkCooldown } = require('@utils/discord');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('@coreModels/User');
const Inventory = require('@coreModels/Inventory');
const ServerSetting = require('@coreModels/ServerSetting');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('hack')
            .setDescription('💵 Hack another user.')
            .addUserOption((option) => option.setName('target').setDescription('User you want to hack').setRequired(true)),
    guildOnly: true,

    async execute(interaction) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('target');
        const user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });
        const target = await User.getCache({ userId: targetUser.id, guildId: interaction.guild.id });

        let serverSetting = await ServerSetting.getCache({ guildId: interaction.guild.id });

        // Check if user exists
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy_withdraw_no_account_desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        // Cooldown check
        const cooldown = checkCooldown(user.lastHack, serverSetting.hackCooldown);
        if (cooldown.remaining) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(await t(interaction, 'economy_hack_hack_cooldown', { time: cooldown.time }))
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        // Validate user and target
        if (!user || !target) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'economy_hack_hack_user_or_target_not_found'))
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        // Prevent self-hack
        if (targetUser.id === interaction.user.id) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'economy_hack_hack_self'))
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        // Target must have money in bank
        if (target.bank <= 0) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'economy_hack_hack_target_no_bank'))
                .setThumbnail(targetUser.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        // User must have enough money in bank to hack
        if (user.bank <= 20) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'economy_hack_hack_user_no_bank'))
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        // Fake hack embed
        const embed = new EmbedBuilder()
            .setDescription(
                await t(interaction, 'economy_hack_hack_in_progress', {
                    user: interaction.user.username,
                    target: targetUser.username,
                    chance: user.hackMastered || 10,
                })
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setColor(kythia.bot.color);
        // .setTimestamp(new Date());

        await interaction.editReply({ embeds: [embed] });

        const desktop = await Inventory.findOne({ where: { userId: user.userId, itemName: '🖥️ Desktop' } });
        let successChance = 1;
        if (desktop) {
            successChance = 1.5;
        }

        setTimeout(async () => {
            const hackResult = Math.random() < ((user.hackMastered || 10) / 100) * successChance ? 'success' : 'failure';

            if (hackResult === 'success') {
                // Transfer all target's bank to user
                user.bank += target.bank;
                if (user.hackMastered < 100) {
                    user.hackMastered = (user.hackMastered || 10) + 1;
                }
                target.bank = 0;
                user.changed('bank', true);
                target.changed('bank', true);
                await user.saveAndUpdateCache('userId');
                await target.saveAndUpdateCache('userId');

                const successEmbed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setDescription(
                        await t(interaction, 'economy_hack_hack_success', {
                            target: targetUser.username,
                        })
                    )
                    // .setTimestamp()
                    .setFooter(await embedFooter(interaction));

                await interaction.editReply({ embeds: [successEmbed] });
            } else {
                // Penalty if failed
                const penalty = Math.floor(Math.random() * 20) + 1;
                if (user.bank >= penalty) {
                    user.bank -= penalty;
                    target.bank += penalty;
                    user.changed('bank', true);
                    target.changed('bank', true);
                    await user.saveAndUpdateCache('userId');
                    await target.saveAndUpdateCache('userId');
                }

                const failureEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setDescription(
                        await t(interaction, 'economy_hack_hack_failure', {
                            target: targetUser.username,
                            penalty,
                        })
                    )
                    // .setTimestamp()
                    .setFooter(await embedFooter(interaction));

                await interaction.editReply({ embeds: [failureEmbed] });
            }
        }, 5000);
    },
};
