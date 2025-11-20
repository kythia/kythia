/**
 * @namespace: addons/economy/commands/withdraw.js
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
            .setName('withdraw')
            .setDescription('Withdraw your kythia coin from kythia bank.')
            .addIntegerOption((option) => option.setName('amount').setDescription('Amount to withdraw').setRequired(true)),
    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();
        try {
            const amount = interaction.options.getInteger('amount');
            const user = await KythiaUser.getCache({ userId: interaction.user.id });

            if (!user) {
                const embed = new EmbedBuilder()
                    .setColor(kythiaConfig.bot.color)
                    .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setTimestamp()
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            }

            const userBank = banks.getBank(user.bankType);
            const withdrawFeePercent = userBank.withdrawFeePercent;
            const fee = Math.floor(amount * (withdrawFeePercent / 100));
            const totalRequired = amount + fee;

            if (user.kythiaBank < totalRequired) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(await t(interaction, 'economy.withdraw.withdraw.not.enough.bank'))
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setTimestamp()
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            }

            user.kythiaBank = BigInt(user.kythiaBank) - BigInt(totalRequired);
            user.kythiaCoin = BigInt(user.kythiaCoin) + BigInt(amount);

            user.changed('kythiaBank', true);
            user.changed('kythiaCoin', true);

            await user.saveAndUpdateCache('userId');

            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setThumbnail(interaction.user.displayAvatarURL())
                .setDescription(
                    await t(interaction, 'economy.withdraw.withdraw.success', {
                        user: interaction.user.username,
                        amount,
                    })
                )
                .setTimestamp()
                .setFooter(await embedFooter(interaction));
            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error during withdraw command execution:', error);
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'economy.withdraw.withdraw.error'))
                .setTimestamp();
            return interaction.editReply({ embeds: [embed] });
        }
    },
};
