/**
 * @namespace: addons/economy/commands/beg.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const banks = require('../helpers/banks');
const { toBigIntSafe } = require('../helpers/bigint');
const { BaseCommand } = require('kythia-core');
class BegCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand.setName('beg').setDescription('Ask for money from server.');
	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;
		const { checkCooldown } = helpers.time;
		await interaction.deferReply();
		const user = await KythiaUser.getCache({
			userId: interaction.user.id,
		});
		if (!user) {
			const msg = await t(
				interaction,
				'economy.shared.withdraw.no.account.desc',
			);
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (
			helpers.jail &&
			(await helpers.jail.checkJail(interaction, user, container))
		) {
			return;
		}
		const cooldown = checkCooldown(
			user.lastBeg,
			kythiaConfig.addons.economy.begCooldown || 3600,
			interaction,
		);
		if (cooldown.remaining) {
			const msg = await t(interaction, 'economy.commands.beg.beg.cooldown', {
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
		const baseCoin = Math.floor(Math.random() * 5) + 1; // 1 to 5 kythiaCoin

		const userBank = banks.getBank(user.bankType);
		const incomeBonusPercent = userBank.incomeBonusPercent;
		const bankBonus = Math.floor(baseCoin * (incomeBonusPercent / 100));
		const randomCoin = baseCoin + bankBonus;
		user.kythiaCoin = toBigIntSafe(user.kythiaCoin) + toBigIntSafe(randomCoin);
		user.lastBeg = Date.now();
		user.changed('kythiaCoin', true);
		user.changed('lastBeg', true);
		await user.save();
		const msg = await t(interaction, 'economy.commands.beg.beg.success', {
			amount: randomCoin,
		});
		const components = await simpleContainer(interaction, msg, {
			color: kythiaConfig.bot.color,
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = BegCommand;
