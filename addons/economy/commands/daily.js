/**
 * @namespace: addons/economy/commands/daily.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const banks = require('../helpers/banks');
const { toBigIntSafe } = require('../helpers/bigint');

module.exports = {
	subcommand: true,
	aliases: ['daily'],
	slashCommand: (subcommand) =>
		subcommand
			.setName('daily')
			.setDescription('💰 Collect your daily kythia coin.'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;
		const { checkCooldown } = helpers.time;

		await interaction.deferReply();

		const user = await KythiaUser.getCache({ userId: interaction.user.id });
		if (!user) {
			const msg = await t(interaction, 'economy.withdraw.no.account.desc');
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const cooldown = checkCooldown(
			user.lastDaily,
			kythiaConfig.addons.economy.dailyCooldown || 86400,
			interaction,
		);
		if (cooldown.remaining) {
			const msg = await t(interaction, 'economy.daily.daily.cooldown', {
				time: cooldown.time,
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Yellow',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const avgDaily = 3677 / 30;
		const minDaily = avgDaily * 0.9;
		const maxDaily = avgDaily * 1.1;
		const baseCoin =
			Math.floor(Math.random() * (maxDaily - minDaily + 1)) +
			Math.floor(minDaily);

		const userBank = banks.getBank(user.bankType);
		const incomeBonusPercent = userBank.incomeBonusPercent;
		const bankBonus = Math.floor(baseCoin * (incomeBonusPercent / 100));
		const randomCoin = baseCoin + bankBonus;

		user.kythiaCoin = toBigIntSafe(user.kythiaCoin) + toBigIntSafe(randomCoin);
		user.lastDaily = Date.now();

		user.changed('kythiaCoin', true);
		user.changed('lastDaily', true);

		await user.save();

		const msg = await t(interaction, 'economy.daily.daily.success', {
			amount: randomCoin,
		});
		const components = await simpleContainer(interaction, msg, {
			color: kythiaConfig.bot.color,
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
