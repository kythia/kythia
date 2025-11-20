/**
 * @namespace: addons/economy/commands/hack.js
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
            .setName('hack')
            .setDescription('💵 Hack another user.')
            .addUserOption((option) => option.setName('target').setDescription('User you want to hack').setRequired(true)),
    guildOnly: true,

    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser, Inventory } = models;
        const { embedFooter } = helpers.discord;
        const { checkCooldown } = helpers.time;

        await interaction.deferReply();

        const targetUser = interaction.options.getUser('target');
        const user = await KythiaUser.getCache({ userId: interaction.user.id });
        const target = await KythiaUser.getCache({ userId: targetUser.id });

        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const cooldown = checkCooldown(user.lastHack, kythiaConfig.addons.economy.hackCooldown || 7200, interaction);
        if (cooldown.remaining) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(await t(interaction, 'economy.hack.hack.cooldown', { time: cooldown.time }))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        if (!user || !target) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'economy.hack.hack.user.or.target.not.found'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        if (targetUser.id === interaction.user.id) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'economy.hack.hack.self'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        if (target.kythiaBank <= 0) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'economy.hack.hack.target.no.bank'))
                .setThumbnail(targetUser.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        if (user.kythiaBank <= 20) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'economy.hack.hack.user.no.bank'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const embed = new EmbedBuilder()
            .setDescription(
                await t(interaction, 'economy.hack.hack.in.progress', {
                    user: interaction.user.username,
                    target: targetUser.username,
                    chance: user.hackMastered || 10,
                })
            )
            .setThumbnail(interaction.user.displayAvatarURL())
            .setColor(kythiaConfig.bot.color);

        await interaction.editReply({ embeds: [embed] });

        const desktop = await Inventory.getCache({ userId: interaction.user.id, itemName: '🖥️ Desktop' });
        let successChance = 1;
        if (desktop) {
            successChance = 1.5;
        }

        setTimeout(async () => {
            const hackResult = Math.random() < ((user.hackMastered || 10) / 100) * successChance ? 'success' : 'failure';

            if (hackResult === 'success') {
                const userBank = banks.getBank(user.bankType);
                const robSuccessBonusPercent = userBank.robSuccessBonusPercent;
                const hackBonus = Math.floor(target.kythiaBank * (robSuccessBonusPercent / 100));
                const totalHacked = target.kythiaBank + hackBonus;

                user.kythiaBank = BigInt(user.kythiaBank) + BigInt(totalHacked);
                if (user.hackMastered < 100) {
                    user.hackMastered = (user.hackMastered || 10) + 1;
                }
                target.kythiaBank = 0;
                user.lastHack = Date.now();

                user.changed('kythiaBank', true);
                user.changed('lastHack', true);
                target.changed('kythiaBank', true);

                await user.saveAndUpdateCache('userId');
                await target.saveAndUpdateCache('userId');

                const embedToTarget = new EmbedBuilder()
                    .setColor('Red')
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setDescription(
                        await t(interaction, 'economy.hack.hack.success.dm', {
                            hacker: interaction.user.username,
                            amount: totalHacked,
                        })
                    )
                    .setFooter(await embedFooter(interaction));
                try {
                    await targetUser.send({ embeds: [embedToTarget] });
                } catch (err) {}

                const successEmbed = new EmbedBuilder()
                    .setColor(kythiaConfig.bot.color)
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setDescription(
                        await t(interaction, 'economy.hack.hack.success.text', {
                            target: targetUser.username,
                        })
                    )
                    .setFooter(await embedFooter(interaction));

                await interaction.editReply({ embeds: [successEmbed] });
            } else {
                const userBank = banks.getBank(user.bankType || 'solara_mutual');
                const robPenaltyMultiplier = userBank ? userBank.robPenaltyMultiplier : 1;
                const basePenalty = Math.floor(Math.random() * 20) + 1;
                const penalty = Math.floor(basePenalty * robPenaltyMultiplier);

                if (user.kythiaBank >= penalty) {
                    user.kythiaBank = BigInt(user.kythiaBank) - BigInt(penalty);
                    target.kythiaBank = BigInt(target.kythiaBank) + BigInt(penalty);

                    user.changed('kythiaBank', true);
                    target.changed('kythiaBank', true);

                    await user.saveAndUpdateCache('userId');
                    await target.saveAndUpdateCache('userId');
                }

                user.lastHack = Date.now();
                user.changed('lastHack', true);
                await user.saveAndUpdateCache('userId');

                const failureEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setDescription(
                        await t(interaction, 'economy.hack.hack.failure', {
                            target: targetUser.username,
                            penalty,
                        })
                    )
                    .setFooter(await embedFooter(interaction));

                await interaction.editReply({ embeds: [failureEmbed] });
            }
        }, 5000);
    },
};
