/**
 * @namespace: addons/economy/commands/market/history.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { EmbedBuilder } = require('discord.js');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('history').setDescription('View your transaction history.'),

    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser, MarketPortfolio, MarketTransaction } = models;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply();

        let user = await KythiaUser.getCache({ userId: interaction.user.id });
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed] });
        }

        try {
            const transactions = await MarketTransaction.getAllCache({
                where: { userId: interaction.user.id },
                order: [['createdAt', 'DESC']],
                limit: 10,
                cacheTags: [`MarketTransaction:byUser:${interaction.user.id}`],
            });

            if (transactions.length === 0) {
                const emptyEmbed = new EmbedBuilder()
                    .setColor(kythia.bot.color)
                    .setDescription(
                        `## ${await t(interaction, 'economy.market.history.empty.title')}\n${await t(interaction, 'economy.market.history.empty.desc')}`
                    )
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [emptyEmbed] });
            }

            const description = transactions
                .map((tx) => {
                    const side = tx.type.charAt(0).toUpperCase() + tx.type.slice(1);
                    const emoji = tx.type === 'buy' ? '🟢' : '🔴';
                    return `${emoji} **${side} ${tx.quantity.toFixed(6)} ${tx.assetId.toUpperCase()}** at $${tx.price.toLocaleString()} each\n*${new Date(tx.createdAt).toLocaleString()}*`;
                })
                .join('\n\n');

            const historyEmbed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setTitle(await t(interaction, 'economy.market.history.title', { username: interaction.user.username }))
                .setDescription(description)
                .setFooter(await embedFooter(interaction));

            await interaction.editReply({ embeds: [historyEmbed] });
        } catch (error) {
            console.error('Error in history command:', error);
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    `## ${await t(interaction, 'economy.market.history.error.title')}\n${await t(interaction, 'economy.market.history.error.desc')}`
                );
            await interaction.editReply({ embeds: [errorEmbed] });
        }
    },
};
