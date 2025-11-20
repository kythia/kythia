/**
 * @namespace: addons/economy/commands/slots.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { EmbedBuilder } = require('discord.js');

const symbols = {
    '🍒': { weight: 25, payout: { two: 1.5, three: 5 } },
    '🍋': { weight: 25, payout: { two: 1.5, three: 5 } },
    '🍊': { weight: 20, payout: { two: 2, three: 10 } },
    '🍉': { weight: 15, payout: { two: 2.5, three: 15 } },
    '🔔': { weight: 10, payout: { two: 3, three: 25 } },
    '⭐': { weight: 4, payout: { two: 5, three: 50 } },
    '💎': { weight: 2, payout: { two: 10, three: 100 } },
    '💰': { weight: 1, payout: { two: 20, three: 250 } },
    '🌸': { weight: 0.5, payout: { two: 40, three: 550 } },
};

function getRandomSymbol() {
    const totalWeight = Object.values(symbols).reduce((sum, { weight }) => sum + weight, 0);
    let randomNum = Math.random() * totalWeight;

    for (const symbol in symbols) {
        if (randomNum < symbols[symbol].weight) {
            return { emoji: symbol, ...symbols[symbol] };
        }
        randomNum -= symbols[symbol].weight;
    }
}

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('slots')
            .setDescription(`🎰 Play the Las Vegas Kythia slot machine! (Warning: Addictive!)`)
            .addIntegerOption((option) =>
                option.setName('bet').setDescription('The amount of money to bet').setRequired(true).setMinValue(10)
            ),
    cooldown: 20,
    async execute(interaction, container) {
        const { t, models, kythiaConfig, helpers } = container;
        const { KythiaUser } = models;
        const { embedFooter } = helpers.discord;

        const bet = interaction.options.getInteger('bet');
        const user = await KythiaUser.getCache({ userId: interaction.user.id });

        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'economy.withdraw.no.account.desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        if (user.kythiaCoin < bet) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    await t(interaction, 'economy.slots.slots.not.enough.cash', {
                        bet: bet.toLocaleString(),
                        cash: user.kythiaCoin.toLocaleString(),
                    })
                )
                .setFooter(await embedFooter(interaction));
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        const spinningEmbed = new EmbedBuilder()
            .setColor('Yellow')
            .setDescription(
                `## ${await t(interaction, 'economy.slots.slots.spinning.title')}\n${await t(interaction, 'economy.slots.slots.spinning.desc')}\n\n🎰 | 🎰 | 🎰`
            )
            .setFooter(await embedFooter(interaction));

        await interaction.reply({ embeds: [spinningEmbed], fetchReply: true });

        await new Promise((resolve) => setTimeout(resolve, 2000));

        user.kythiaCoin = BigInt(user.kythiaCoin) - BigInt(bet);

        const reels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
        const [r1, r2, r3] = reels;

        let resultKey = 'eco.slots.lose.title';
        let resultColor = 'Red';
        let winnings = 0;
        let payoutMultiplier = 0;

        if (r1.emoji === r2.emoji && r2.emoji === r3.emoji) {
            payoutMultiplier = r1.payout.three;
            winnings = Math.floor(bet * payoutMultiplier);
            resultKey = 'eco.slots.jackpot.title';
            resultColor = 'Gold';
        } else if (r1.emoji === r2.emoji || r1.emoji === r3.emoji || r2.emoji === r3.emoji) {
            let pairSymbol;
            if (r1.emoji === r2.emoji) pairSymbol = r1;
            else if (r1.emoji === r3.emoji) pairSymbol = r1;
            else pairSymbol = r2;
            payoutMultiplier = pairSymbol.payout.two;
            winnings = Math.floor(bet * payoutMultiplier);
            resultKey = 'eco.slots.bigwin.title';
            resultColor = 'Green';
        } else if (reels.some((r) => r.emoji === '💰')) {
            winnings = bet;
            payoutMultiplier = 1;
            resultKey = 'eco.slots.lucky.title';
            resultColor = 'Blue';
        }

        if (winnings > 0) {
            user.kythiaCoin = BigInt(user.kythiaCoin) + BigInt(winnings);
        }

        user.changed('kythiaCoin', true);

        await user.saveAndUpdateCache();

        const fakeRow = () => `${getRandomSymbol().emoji}  |  ${getRandomSymbol().emoji}  |  ${getRandomSymbol().emoji}`;
        const slotDisplay = [
            '```',
            `  ${fakeRow()}`,
            '-----------------',
            `► ${r1.emoji} | ${r2.emoji} | ${r3.emoji} ◄`,
            '-----------------',
            `  ${fakeRow()}`,
            '```',
        ].join('\n');

        const finalEmbed = new EmbedBuilder()
            .setColor(resultColor)
            .setAuthor({
                name: await t(interaction, 'economy.slots.slots.author', { username: interaction.user.username }),
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(`## ${await t(interaction, resultKey)}\n${slotDisplay}`)
            .addFields(
                {
                    name: await t(interaction, 'economy.slots.slots.bet.field'),
                    value: `🪙 ${bet.toLocaleString()}`,
                    inline: true,
                },
                {
                    name: await t(interaction, 'economy.slots.slots.win.field'),
                    value: `🪙 ${winnings.toLocaleString()} (${payoutMultiplier}x)`,
                    inline: true,
                },
                {
                    name: await t(interaction, 'economy.slots.slots.cash.field'),
                    value: `💰 ${user.kythiaCoin.toLocaleString()}`,
                    inline: true,
                }
            )
            .setFooter(await embedFooter(interaction));

        await interaction.editReply({ embeds: [finalEmbed] });
    },
};
