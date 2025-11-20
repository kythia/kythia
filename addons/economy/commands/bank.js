/**
 * @namespace: addons/economy/commands/bank.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const banks = require('../helpers/banks');

module.exports = {
    subcommand: true,
    aliases: ['bank'],
    data: (subcommand) => subcommand.setName('bank').setDescription('💰 Check your kythia bank balance and full bank info.'),
    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();
        let user = await KythiaUser.getCache({ userId: interaction.user.id });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const userBankType = user.bankType || 'solara_mutual';
        const bank = banks.getBank(userBankType);

        const stats = [
            {
                label: await t(interaction, 'economy.bank.stat.income.bonus'),
                val: (bank.incomeBonusPercent >= 0 ? '+' : '') + bank.incomeBonusPercent + '%',
            },
            {
                label: await t(interaction, 'economy.bank.stat.interest.rate'),
                val: bank.interestRatePercent + '%',
            },
            {
                label: await t(interaction, 'economy.bank.stat.transfer.fee'),
                val: bank.transferFeePercent + '%',
            },
            {
                label: await t(interaction, 'economy.bank.stat.withdraw.fee'),
                val: bank.withdrawFeePercent + '%',
            },
            {
                label: await t(interaction, 'economy.bank.stat.rob.bonus'),
                val: (bank.robSuccessBonusPercent >= 0 ? '+' : '') + bank.robSuccessBonusPercent + '%',
            },
            {
                label: await t(interaction, 'economy.bank.stat.rob.penalty'),
                val: await t(interaction, 'economy.bank.rob.penalty.times', { times: bank.robPenaltyMultiplier }),
            },
            {
                label: await t(interaction, 'economy.bank.stat.max.balance'),
                val:
                    bank.maxBalance === Infinity
                        ? await t(interaction, 'economy.bank.max.balance.unlimited')
                        : bank.maxBalance.toLocaleString(),
            },
        ];

        const defaultBank = banks.getBank('solara_mutual');

        const pros = [];
        const cons = [];

        if (bank.incomeBonusPercent > defaultBank.incomeBonusPercent) pros.push(await t(interaction, 'economy.bank.pro.income.bonus'));
        if (bank.incomeBonusPercent < defaultBank.incomeBonusPercent) cons.push(await t(interaction, 'economy.bank.con.income.penalty'));

        if (bank.interestRatePercent > defaultBank.interestRatePercent) pros.push(await t(interaction, 'economy.bank.pro.interest.high'));

        if (bank.transferFeePercent < defaultBank.transferFeePercent) pros.push(await t(interaction, 'economy.bank.pro.transfer.low'));
        if (bank.transferFeePercent > defaultBank.transferFeePercent) cons.push(await t(interaction, 'economy.bank.con.transfer.high'));

        if (bank.robSuccessBonusPercent > defaultBank.robSuccessBonusPercent) pros.push(await t(interaction, 'economy.bank.pro.rob.bonus'));
        if (bank.robSuccessBonusPercent < defaultBank.robSuccessBonusPercent)
            cons.push(await t(interaction, 'economy.bank.con.rob.penalty'));

        if (bank.maxBalance === Infinity) pros.push(await t(interaction, 'economy.bank.pro.max.unlimited'));

        const descriptionParts = [
            `## ${bank.emoji} ${bank.name}`,
            await t(interaction, 'economy.bank.bank.balance.desc', {
                username: interaction.user.username,
                cash: user.kythiaCoin.toLocaleString(),
                bank: user.kythiaBank.toLocaleString(),
                bankType: `${bank.emoji} ${bank.name}`,
                total: (BigInt(user.kythiaCoin) + BigInt(user.kythiaBank)).toLocaleString(),
            }),
            `### ${await t(interaction, 'economy.bank.bank.stats.title')}`,
            stats.map((s) => `> ${s.label}: **${s.val}**`).join('\n'),
        ];

        if (pros.length || cons.length) {
            descriptionParts.push('\n');
            if (pros.length) {
                descriptionParts.push(`> **${await t(interaction, 'economy.bank.bank.pros')}:** ${pros.map((p) => `+ ${p}`).join(', ')}`);
            }
            if (cons.length) {
                descriptionParts.push(`> **${await t(interaction, 'economy.bank.bank.cons')}:** ${cons.map((c) => `- ${c}`).join(', ')}`);
            }
        }

        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(descriptionParts.join('\n'))
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    },
};
