/**
 * @namespace: addons/economy/commands/bank.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const User = require('@coreModels/User');
const { t } = require('@utils/translator');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('bank').setDescription('💰 Check your bank balance.'),
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

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL())
            .setDescription(
                await t(interaction, 'economy_bank_bank_balance_desc', {
                    username: interaction.user.username,
                    cash: user.cash,
                    bank: user.bank,
                    bankType: user.bankType,
                    total: user.cash + user.bank,
                })
            )
            // .setTimestamp()
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    },
};
