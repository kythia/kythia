/**
 * @namespace: addons/economy/commands/deposit.js
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
            .setName('deposit')
            .setDescription('💰 Deposit your kythia coin into kythia bank.')
            .addStringOption((option) =>
                option
                    .setName('type')
                    .setDescription('Choose deposit type: all or partial')
                    .setRequired(true)
                    .addChoices({ name: 'Deposit All', value: 'all' }, { name: 'Deposit Partial', value: 'partial' })
            )
            .addIntegerOption((option) => option.setName('amount').setDescription('Amount to deposit').setRequired(false).setMinValue(1)),
    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();
        const type = interaction.options.getString('type');
        let amount = interaction.options.getInteger('amount');

        let user = await KythiaUser.getCache({ userId: interaction.user.id });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        if (type === 'all') {
            amount = user.kythiaCoin;
        } else if (type === 'partial') {
            if (amount === null) {
                const embed = new EmbedBuilder()
                    .setColor('Yellow')
                    .setDescription(await t(interaction, 'economy.deposit.deposit.amount.required'))
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            }
        }

        if (amount <= 0) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(await t(interaction, 'economy.deposit.deposit.invalid.amount'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        if (user.kythiaCoin < amount) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'economy.deposit.deposit.not.enough.cash'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        if (amount === 0) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(await t(interaction, 'economy.deposit.deposit.zero.cash'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const userBank = banks.getBank(user.bankType);
        const maxBalance = userBank.maxBalance;

        if (user.kythiaBank + amount > maxBalance) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'economy.deposit.deposit.max.balance', { max: maxBalance.toLocaleString() }))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        user.kythiaCoin = BigInt(user.kythiaCoin) - BigInt(amount);
        user.kythiaBank = BigInt(user.kythiaBank) + BigInt(amount);

        user.changed('kythiaCoin', true);
        user.changed('kythiaBank', true);

        await user.saveAndUpdateCache();

        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(await t(interaction, 'economy.deposit.deposit.success', { amount }))
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
