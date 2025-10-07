/**
 * @namespace: addons/economy/commands/beg.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ServerSetting = require('@coreModels/ServerSetting');
const { embedFooter } = require('@utils/discord');
const { checkCooldown } = require('@utils/time');
const User = require('@coreModels/User');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('beg').setDescription('💰 Ask for money from server.'),
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

        // Cooldown check
        const cooldown = checkCooldown(user.lastBeg, serverSetting.begCooldown);
        if (cooldown.remaining) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy_beg_beg_cooldown', { time: cooldown.time }))
                .setThumbnail(interaction.user.displayAvatarURL())
                // .setTimestamp()
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        // Randomize beg amount between 10 and 50
        const randomCash = Math.floor(Math.random() * 41) + 10;
        user.cash += randomCash;
        user.lastBeg = Date.now();
        user.changed('cash', true);
        user.changed('lastBeg', true);
        await user.saveAndUpdateCache('userId');

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(await t(interaction, 'economy_beg_beg_success', { amount: randomCash }))
            // .setTimestamp()
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    },
};
