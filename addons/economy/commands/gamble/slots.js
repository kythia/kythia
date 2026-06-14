/**
 * @namespace: addons/economy/commands/gamble/slots.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { toBigIntSafe } = require('../../helpers/bigint');

const { BaseCommand } = require('kythia-core');

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
	const totalWeight = Object.values(symbols).reduce(
		(sum, { weight }) => sum + weight,
		0,
	);
	let randomNum = Math.random() * totalWeight;

	for (const symbol in symbols) {
		if (randomNum < symbols[symbol].weight) {
			return { emoji: symbol, ...symbols[symbol] };
		}
		randomNum -= symbols[symbol].weight;
	}
}

class SlotsCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('slots')
			.setDescription(
				`🎰 Play the Las Vegas Kythia slot machine! (Warning: Addictive!)`,
			)
			.addIntegerOption((option) =>
				option
					.setName('bet')
					.setDescription('The amount of money to bet')
					.setRequired(true)
					.setMinValue(10),
			);

	cooldown = 20;

	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer, createContainer } = helpers.discord;

		const bet = interaction.options.getInteger('bet');
		const user = await KythiaUser.getCache({ userId: interaction.user.id });

		if (!user) {
			const msg = await t(interaction, 'economy.withdraw.no.account.desc');
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		if (user.kythiaCoin < bet) {
			const msg = await t(interaction, 'economy.slots.slots.not.enough.cash', {
				bet: bet.toLocaleString(),
				cash: user.kythiaCoin.toLocaleString(),
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.reply({
				components,
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		const spinningMsg = await t(
			interaction,
			'economy.slots.slots.spinning.desc',
		);
		const spinningComponents = await simpleContainer(interaction, spinningMsg, {
			color: 'Yellow',
		});

		await interaction.reply({
			components: spinningComponents,
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});

		await new Promise((resolve) => setTimeout(resolve, 2000));

		user.kythiaCoin = toBigIntSafe(user.kythiaCoin) - toBigIntSafe(bet);

		const reels = [getRandomSymbol(), getRandomSymbol(), getRandomSymbol()];
		const [r1, r2, r3] = reels;

		let resultColor = 'Red';
		let winnings = 0;
		let payoutMultiplier = 0;
		let resultTitle;

		if (r1.emoji === r2.emoji && r2.emoji === r3.emoji) {
			payoutMultiplier = r1.payout.three;
			winnings = Math.floor(bet * payoutMultiplier);
			resultTitle = await t(interaction, 'economy.slots.slots.jackpot.title');
			resultColor = 'Gold';
		} else if (
			r1.emoji === r2.emoji ||
			r1.emoji === r3.emoji ||
			r2.emoji === r3.emoji
		) {
			let pairSymbol;
			if (r1.emoji === r2.emoji) pairSymbol = r1;
			else if (r1.emoji === r3.emoji) pairSymbol = r1;
			else pairSymbol = r2;
			payoutMultiplier = pairSymbol.payout.two;
			winnings = Math.floor(bet * payoutMultiplier);
			resultTitle = await t(interaction, 'economy.slots.slots.bigwin.title');
			resultColor = 'Green';
		} else if (reels.some((r) => r.emoji === '💰')) {
			winnings = bet;
			payoutMultiplier = 1;
			resultTitle = await t(interaction, 'economy.slots.slots.lucky.title');
			resultColor = 'Blue';
		} else {
			resultTitle = await t(interaction, 'economy.slots.slots.lose.title');
		}

		if (winnings > 0) {
			user.kythiaCoin = toBigIntSafe(user.kythiaCoin) + toBigIntSafe(winnings);
		}

		user.changed('kythiaCoin', true);

		await user.save();

		const fakeRow = () =>
			`${getRandomSymbol().emoji}  |  ${getRandomSymbol().emoji}  |  ${getRandomSymbol().emoji}`;
		const slotDisplay = [
			'```',
			`  ${fakeRow()}`,
			'-----------------',
			`► ${r1.emoji} | ${r2.emoji} | ${r3.emoji} ◄`,
			'-----------------',
			`  ${fakeRow()}`,
			'```',
		].join('\n');

		const resultMsg = [
			`## ${resultTitle}`,
			slotDisplay,
			'',
			`**${await t(interaction, 'economy.slots.slots.bet.field')}:** 🪙 ${bet.toLocaleString()}`,
			`**${await t(interaction, 'economy.slots.slots.win.field')}:** 🪙 ${winnings.toLocaleString()} (${payoutMultiplier}x)`,
			`**${await t(interaction, 'economy.slots.slots.cash.field')}:** 💰 ${user.kythiaCoin.toLocaleString()}`,
		].join('\n');

		const resultComponents = await createContainer(interaction, {
			description: resultMsg,
			color: resultColor,
		});

		await interaction.editReply({
			components: resultComponents,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = SlotsCommand;
