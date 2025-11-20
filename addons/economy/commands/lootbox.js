/**
 * @namespace: addons/economy/commands/lootbox.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');

const banks = require('../helpers/banks');

module.exports = {
    subcommand: true,
    aliases: ['lootbox'],
    data: (subcommand) => subcommand.setName('lootbox').setDescription('🎁 Open a lootbox to get a random reward.'),
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

        const cooldown = checkCooldown(user.lastLootbox, kythiaConfig.addons.economy.lootboxCooldown || 43200, interaction);
        if (cooldown.remaining) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(await t(interaction, 'economy.lootbox.lootbox.cooldown', { time: cooldown.time }))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const avgHourly = 5677 / 160;
        const minHourly = avgHourly * 0.9;
        const maxHourly = avgHourly * 1.1;
        const baseReward = Math.floor(Math.random() * (maxHourly - minHourly + 1)) + Math.floor(minHourly);

        const userBank = banks.getBank(user.bankType);
        const incomeBonusPercent = userBank.incomeBonusPercent;
        const bankBonus = Math.floor(baseReward * (incomeBonusPercent / 100));
        const randomReward = baseReward + bankBonus;

        user.kythiaCoin = BigInt(user.kythiaCoin) + BigInt(randomReward);
        user.lastLootbox = Date.now();

        user.changed('kythiaCoin', true);
        user.changed('lastLootbox', true);

        await user.saveAndUpdateCache('userId');

        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setTitle(await t(interaction, 'economy.lootbox.lootbox.title'))
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(await t(interaction, 'economy.lootbox.lootbox.success', { amount: randomReward }))
            .setFooter(await embedFooter(interaction));
        await interaction.editReply({ embeds: [embed] });
    },
};
