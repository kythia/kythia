/**
 * @namespace: addons/economy/commands/rob.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { EmbedBuilder } = require('discord.js');
const banks = require('../helpers/banks');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('rob')
            .setDescription('💵 Try to rob money from another user.')
            .addUserOption((option) => option.setName('target').setDescription('The user you want to rob').setRequired(true)),
    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser, Inventory } = models;
        const { embedFooter } = helpers.discord;
        const { checkCooldown } = helpers.time;

        await interaction.deferReply();

        const targetUser = interaction.options.getUser('target');
        if (targetUser.id === interaction.user.id) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'economy.rob.rob.cannot.rob.self'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const user = await KythiaUser.getCache({ userId: interaction.user.id });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const target = await KythiaUser.getCache({ userId: targetUser.id });
        if (!target) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy.rob.rob.target.no.account.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const cooldown = checkCooldown(user.lastRob, kythia.addons.economy.robCooldown || 10800, interaction);

        if (cooldown.remaining) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(await t(interaction, 'economy.rob.rob.cooldown', { time: cooldown.time }))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const guard = await Inventory.getCache({ userId: target.userId, itemName: '🚓 Guard' });
        let poison = null;
        if (!guard) {
            poison = await Inventory.getCache({ userId: target.userId, itemName: '🧪 Poison' });
        }

        const userBank = banks.getBank(user.bankType);
        let success = false;
        if (guard) {
            success = false;
            await guard.destroy();
        } else if (poison) {
            success = Math.random() < 0.1;
        } else {
            let baseSuccessChance = 0.3;

            const successBonus = userBank.robSuccessBonusPercent / 100;
            baseSuccessChance += successBonus;
            success = Math.random() < baseSuccessChance;
        }

        const baseRobAmount = Math.floor(Math.random() * 201) + 50;

        const robSuccessBonusPercent = userBank.robSuccessBonusPercent;
        const robBonus = Math.floor(baseRobAmount * (robSuccessBonusPercent / 100));
        const robAmount = baseRobAmount + robBonus;

        if (success) {
            if (target.kythiaCoin < robAmount) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(await t(interaction, 'economy.rob.rob.target.not.enough.money'))
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            }

            user.kythiaCoin = BigInt(user.kythiaCoin) + BigInt(robAmount);
            target.kythiaCoin = BigInt(target.kythiaCoin) - BigInt(robAmount);
            user.lastRob = new Date();

            user.changed('kythiaCoin', true);
            target.changed('kythiaCoin', true);

            await user.saveAndUpdateCache('userId');
            await target.saveAndUpdateCache('userId');

            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(
                    await t(interaction, 'economy.rob.rob.success.text', {
                        amount: robAmount,
                        target: targetUser.username,
                    })
                )
                .setFooter(await embedFooter(interaction));
            await interaction.editReply({ embeds: [embed] });

            const embedToTarget = new EmbedBuilder()
                .setColor('Red')
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(
                    await t(interaction, 'economy.rob.rob.success.dm', {
                        robber: interaction.user.username,
                        amount: robAmount,
                    })
                )
                .setFooter(await embedFooter(interaction));
            await targetUser.send({ embeds: [embedToTarget] });
        } else {
            const robPenaltyMultiplier = userBank ? userBank.robPenaltyMultiplier : 1;
            const basePenalty = Math.floor(robAmount * robPenaltyMultiplier);

            if (user.kythiaCoin < basePenalty && !poison) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(await t(interaction, 'economy.rob.rob.user.not.enough.money.fail'))
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            }
            let penalty = basePenalty;
            if (poison) {
                penalty = user.kythiaCoin;

                user.kythiaCoin = BigInt(user.kythiaCoin) - BigInt(penalty);
                target.kythiaCoin = BigInt(target.kythiaCoin) + BigInt(penalty);
                await poison.destroy();
            } else {
                user.kythiaCoin = BigInt(user.kythiaCoin) - BigInt(basePenalty);
                target.kythiaCoin = BigInt(target.kythiaCoin) + BigInt(basePenalty);
            }

            user.lastRob = new Date();

            user.changed('kythiaCoin', true);
            target.changed('kythiaCoin', true);

            await user.saveAndUpdateCache('userId');
            await target.saveAndUpdateCache('userId');

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(
                    await t(interaction, 'economy.rob.rob.fail.text', {
                        target: targetUser.username,
                        penalty: poison ? await t(interaction, 'economy.rob.rob.fail.penalty.all') : `${robAmount} kythia coin`,
                        guard: guard ? await t(interaction, 'economy.rob.rob.fail.guard.text') : '',
                        poison: poison ? await t(interaction, 'economy.rob.rob.fail.poison') : '',
                    })
                )
                .setFooter(await embedFooter(interaction));
            await interaction.editReply({ embeds: [embed] });

            const embedToTarget = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(
                    await t(interaction, 'economy.rob.rob.fail.dm', {
                        robber: interaction.user.username,
                        amount: robAmount,
                        penalty: poison ? penalty : robAmount,
                        guard: guard ? await t(interaction, 'economy.rob.rob.fail.guard.dm') : '',
                        poison: poison ? await t(interaction, 'economy.rob.rob.fail.poison.dm') : '',
                    })
                )
                .setFooter(await embedFooter(interaction));
            await targetUser.send({ embeds: [embedToTarget] });
        }
    },
};
