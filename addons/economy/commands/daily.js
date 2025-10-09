/**
 * @namespace: addons/economy/commands/daily.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('@coreModels/User');
const { embedFooter } = require('@utils/discord');
const ServerSetting = require('@coreModels/ServerSetting');
const { checkCooldown } = require('@utils/time');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('daily').setDescription('💰 Collect your daily cash.'),
    async execute(interaction) {
        await interaction.deferReply();

        let user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy_withdraw_no_account_desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        const serverSetting = await ServerSetting.getCache({ guildId: interaction.guild.id });
        const cooldown = checkCooldown(user.lastDaily, serverSetting.dailyCooldown);
        if (cooldown.remaining) {
            const embed = new EmbedBuilder()
                .setColor('Yellow')
                .setDescription(await t(interaction, 'economy_daily_daily_cooldown', { time: cooldown.time }))
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        // Randomize the daily cash reward between 50 and 150
        const randomCash = Math.floor(Math.random() * 101) + 50;
        user.cash += randomCash;
        user.lastDaily = Date.now();
        user.changed('cash', true);
        user.changed('lastDaily', true);
        await user.saveAndUpdateCache('userId');

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(await t(interaction, 'economy_daily_daily_success', { amount: randomCash }))
            // .setTimestamp()
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    },
};
