/**
 * @namespace: addons/economy/commands/rob.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const { embedFooter } = require('@utils/discord');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('@coreModels/User');
const Inventory = require('@coreModels/Inventory');
const ServerSetting = require('@coreModels/ServerSetting');
const { checkCooldown } = require('@utils/time');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('rob')
            .setDescription('💵 Try to rob money from another user.')
            .addUserOption((option) => option.setName('target').setDescription('The user you want to rob').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();

        const targetUser = interaction.options.getUser('target');
        if (targetUser.id === interaction.user.id) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'economy_rob_rob_cannot_rob_self'))
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy_withdraw_no_account_desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const target = await User.getCache({ userId: targetUser.id, guildId: interaction.guild.id });
        if (!target) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy_rob_rob_target_no_account_desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const serverSetting = await ServerSetting.getCache({ guildId: interaction.guild.id });
        const cooldown = checkCooldown(user.lastRob, serverSetting.robCooldown);

        if (cooldown.remaining) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(await t(interaction, 'economy_rob_rob_cooldown', { time: cooldown.time }))
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const guard = await Inventory.findOne({ where: { userId: target.userId, itemName: '🚓 Guard' } });
        let poison = null;
        if (!guard) {
            poison = await Inventory.findOne({ where: { userId: target.userId, itemName: '🧪 Poison' } });
        }

        // Randomize the success chance
        let success = false;
        if (guard) {
            success = false;
            await guard.destroy(); // Destroy the guard item after use
        } else if (poison) {
            success = Math.random() < 0.1; // 10% chance of success
        } else {
            success = Math.random() < 0.3; // 30% chance of success
        }

        const robAmount = Math.floor(Math.random() * 201) + 50;

        if (success) {
            // Successful rob
            if (target.cash < robAmount) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(await t(interaction, 'economy_rob_rob_target_not_enough_money'))
                    .setThumbnail(interaction.user.displayAvatarURL())
                    // .setTimestamp()
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            }

            user.cash += robAmount;
            target.cash -= robAmount;
            user.lastRob = new Date();
            user.changed('cash', true);
            target.changed('cash', true);
            await user.saveAndUpdateCache('userId');
            await target.saveAndUpdateCache('userId');

            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(
                    await t(interaction, 'economy_rob_rob_success', {
                        amount: robAmount,
                        target: targetUser.username,
                    })
                )
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            await interaction.editReply({ embeds: [embed] });

            const embedToTarget = new EmbedBuilder()
                .setColor('Red')
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(
                    await t(interaction, 'economy_rob_rob_success_dm', {
                        robber: interaction.user.username,
                        amount: robAmount,
                    })
                )
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            await targetUser.send({ embeds: [embedToTarget] });
        } else {
            // Failed rob, pay the target
            if (user.cash < robAmount) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(await t(interaction, 'economy_rob_rob_user_not_enough_money_fail'))
                    .setThumbnail(interaction.user.displayAvatarURL())
                    // .setTimestamp()
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            }
            let penalty = robAmount;
            if (poison) {
                penalty = user.cash;
                user.cash -= penalty;
                target.cash += penalty;
                await poison.destroy(); // Destroy poison item after use
            } else {
                user.cash -= robAmount;
                target.cash += robAmount;
            }

            user.lastRob = new Date();
            user.changed('cash', true);
            target.changed('cash', true);
            await user.saveAndUpdateCache('userId');
            await target.saveAndUpdateCache('userId');

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(
                    await t(interaction, 'economy_rob_rob_fail', {
                        target: targetUser.username,
                        penalty: poison ? await t(interaction, 'economy_rob_rob_fail_penalty_all') : `${robAmount} cash`,
                        guard: guard ? await t(interaction, 'economy_rob_rob_fail_guard') : '',
                        poison: poison ? await t(interaction, 'economy_rob_rob_fail_poison') : '',
                    })
                )
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            await interaction.editReply({ embeds: [embed] });

            const embedToTarget = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(
                    await t(interaction, 'economy_rob_rob_fail_dm', {
                        robber: interaction.user.username,
                        amount: robAmount,
                        penalty: poison ? penalty : robAmount,
                        guard: guard ? await t(interaction, 'economy_rob_rob_fail_guard_dm') : '',
                        poison: poison ? await t(interaction, 'economy_rob_rob_fail_poison_dm') : '',
                    })
                )
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            await targetUser.send({ embeds: [embedToTarget] });
        }
    },
};
