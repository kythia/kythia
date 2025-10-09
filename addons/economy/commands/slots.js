/**
 * @namespace: addons/economy/commands/slots.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('@coreModels/User');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

const symbols = {
    '🍒': { weight: 25, payout: { two: 1.5, three: 5 } },
    '🍋': { weight: 25, payout: { two: 1.5, three: 5 } },
    '🍊': { weight: 20, payout: { two: 2, three: 10 } },
    '🍉': { weight: 15, payout: { two: 2.5, three: 15 } },
    '🔔': { weight: 10, payout: { two: 3, three: 25 } },
    '⭐': { weight: 4, payout: { two: 5, three: 50 } },
    '💎': { weight: 2, payout: { two: 10, three: 100 } },
    '💰': { weight: 1, payout: { two: 20, three: 250 } }, // Jackpot!
};

// Helper function untuk mendapatkan simbol acak berdasarkan bobot
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
            .setDescription(`🎰 Play the Las ${kythia.bot.name} slot machine! (Warning: Addictive!)`)
            .addIntegerOption((option) =>
                option.setName('bet').setDescription('The amount of money to bet').setRequired(true).setMinValue(10)
            ),
    cooldown: 20,
    async execute(interaction, container) {
        const { t } = container || {};
        const bet = interaction.options.getInteger('bet');
        const user = await User.getCache({ userId: interaction.user.id, guildId: interaction.guild.id });

        // No account
        if (!user) {
            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'economy_withdraw_no_account_desc'))
                .setThumbnail(interaction.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // Not enough cash
        if (user.cash < bet) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    await t(interaction, 'economy_slots_slots_not_enough_cash', {
                        bet: bet.toLocaleString(),
                        cash: user.cash.toLocaleString(),
                    })
                )
                .setFooter(await embedFooter(interaction));
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        // --- SPINNING EFFECT ---
        const spinningEmbed = new EmbedBuilder()
            .setColor('Yellow')
            .setDescription(
                `## ${await t(interaction, 'economy_slots_slots_spinning_title')}\n${await t(interaction, 'economy_slots_slots_spinning_desc')}\n\n🎰 | 🎰 | 🎰`
            )
            .setFooter(await embedFooter(interaction));

        await interaction.reply({ embeds: [spinningEmbed], fetchReply: true });

        // Dramatic pause
        await new Promise((resolve) => setTimeout(resolve, 2000));

        user.cash -= bet; // Deduct bet immediately

        const reels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
        const [r1, r2, r3] = reels;

        let resultKey = 'eco_slots_lose_title';
        let resultColor = 'Red';
        let winnings = 0;
        let payoutMultiplier = 0;

        // --- WIN LOGIC ---

        // 1. Three of a Kind (Jackpot / 3 same)
        if (r1.emoji === r2.emoji && r2.emoji === r3.emoji) {
            payoutMultiplier = r1.payout.three;
            winnings = Math.floor(bet * payoutMultiplier);
            resultKey = 'eco_slots_jackpot_title';
            resultColor = 'Gold';
        }
        // 2. Two of a Kind (2 same)
        else if (r1.emoji === r2.emoji || r1.emoji === r3.emoji || r2.emoji === r3.emoji) {
            // Find the symbol that appears twice
            let pairSymbol;
            if (r1.emoji === r2.emoji) pairSymbol = r1;
            else if (r1.emoji === r3.emoji) pairSymbol = r1;
            else pairSymbol = r2;
            payoutMultiplier = pairSymbol.payout.two;
            winnings = Math.floor(bet * payoutMultiplier);
            resultKey = 'eco_slots_bigwin_title';
            resultColor = 'Green';
        }
        // 3. There is a jackpot symbol (💰) but not a win
        else if (reels.some((r) => r.emoji === '💰')) {
            winnings = bet; // Break even
            payoutMultiplier = 1;
            resultKey = 'eco_slots_lucky_title';
            resultColor = 'Blue';
        }

        if (winnings > 0) {
            user.cash += winnings;
        }

        await user.saveAndUpdateCache();

        // --- FINAL RESULT EMBED ---
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
                name: await t(interaction, 'economy_slots_slots_author', { username: interaction.user.username }),
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setDescription(`## ${await t(interaction, resultKey)}\n${slotDisplay}`)
            .addFields(
                {
                    name: await t(interaction, 'economy_slots_slots_bet_field'),
                    value: `🪙 ${bet.toLocaleString()}`,
                    inline: true,
                },
                {
                    name: await t(interaction, 'economy_slots_slots_win_field'),
                    value: `🪙 ${winnings.toLocaleString()} (${payoutMultiplier}x)`,
                    inline: true,
                },
                {
                    name: await t(interaction, 'economy_slots_slots_cash_field'),
                    value: `💰 ${user.cash.toLocaleString()}`,
                    inline: true,
                }
            )
            .setFooter(await embedFooter(interaction));

        await interaction.editReply({ embeds: [finalEmbed] });
    },
};
