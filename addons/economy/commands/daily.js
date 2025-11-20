/**
 * @namespace: addons/economy/commands/daily.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');
const banks = require('../helpers/banks');

module.exports = {
    subcommand: true,
    aliases: ['daily'],
    data: (subcommand) => subcommand.setName('daily').setDescription('💰 Collect your daily kythia coin.'),
    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser } = models;
        const { embedFooter } = helpers.discord;
        const { checkCooldown } = helpers.time;

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

        const cooldown = checkCooldown(user.lastDaily, kythiaConfig.addons.economy.dailyCooldown || 86400, interaction);
        if (cooldown.remaining) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(await t(interaction, 'economy.daily.daily.cooldown', { time: cooldown.time }))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const avgDaily = 3677 / 30;
        const minDaily = avgDaily * 0.9;
        const maxDaily = avgDaily * 1.1;
        const baseCoin = Math.floor(Math.random() * (maxDaily - minDaily + 1)) + Math.floor(minDaily);

        const userBank = banks.getBank(user.bankType);
        const incomeBonusPercent = userBank.incomeBonusPercent;
        const bankBonus = Math.floor(baseCoin * (incomeBonusPercent / 100));
        const randomCoin = baseCoin + bankBonus;

        user.kythiaCoin = BigInt(user.kythiaCoin) + BigInt(randomCoin);
        user.lastDaily = Date.now();

        user.changed('kythiaCoin', true);
        user.changed('lastDaily', true);

        await user.saveAndUpdateCache('userId');

        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(await t(interaction, 'economy.daily.daily.success', { amount: randomCoin }))
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    },
};
