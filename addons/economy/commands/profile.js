/**
 * @namespace: addons/economy/commands/profile.js
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
            .setName('profile')
            .setDescription("🗃️ View a user's full profile, including level, bank, cash, and more.")
            .addUserOption((option) => option.setName('user').setDescription('The user whose profile you want to view').setRequired(false)),
    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();

        // Get target user or self
        const targetUser = interaction.options.getUser('user') || interaction.user;
        const userId = targetUser.id;

        // Fetch user data
        const userData = await KythiaUser.getCache({ userId: userId });
        if (!userData) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        // Bank & coin
        let bank = userData.kythiaBank || 0;
        let coin = userData.kythiaCoin || 0;
        let bankType = userData.bankType ? userData.bankType.toUpperCase() : '-';
        let userBank = banks.getBank(bankType);
        const bankDisplay = `(${userBank.emoji} ${userBank.name})`;
        // Build embed using t for all text
        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
            .setDescription(
                [
                    `## ${await t(interaction, 'economy.profile.profile.title')}`,
                    await t(interaction, 'economy.profile.profile.user.line', {
                        username: targetUser.username,
                        userId: targetUser.id,
                    }),
                    `### ${await t(interaction, 'economy.profile.profile.finance.title')}`,
                    await t(interaction, 'economy.profile.profile.bank.line', {
                        bank: bank.toLocaleString(),
                        bankType: bankDisplay || '',
                    }),
                    await t(interaction, 'economy.profile.profile.cash.line', {
                        cash: coin.toLocaleString(),
                    }),
                ].join('\n')
            )
            .setFooter(await embedFooter(interaction));

        return interaction.editReply({ embeds: [embed] });
    },
};
