/**
 * @namespace: addons/economy/commands/lootbox.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const banks = require('../helpers/banks');
const { toBigIntSafe } = require('../helpers/bigint');

const { BaseCommand } = require('kythia-core');

class LootboxCommand extends BaseCommand {
	subcommand = true;
	aliases = ['lootbox'];

	slashCommand = (subcommand) =>
		subcommand
			.setName('lootbox')
			.setDescription('🎁 Open a lootbox to get a random reward.');

	async execute(interaction) {
		const container = this.container;
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
			user.lastLootbox,
			kythiaConfig.addons.economy.lootboxCooldown || 43200,
			interaction,
		);
		if (cooldown.remaining) {
			const msg = await t(interaction, 'economy.lootbox.lootbox.cooldown', {
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

		const minHourly = 5;
		const maxHourly = 15;
		const baseReward =
			Math.floor(Math.random() * (maxHourly - minHourly + 1)) +
			Math.floor(minHourly);

		const userBank = banks.getBank(user.bankType);
		const incomeBonusPercent = userBank.incomeBonusPercent;
		const bankBonus = Math.floor(baseReward * (incomeBonusPercent / 100));
		const randomReward = baseReward + bankBonus;

		user.kythiaCoin =
			toBigIntSafe(user.kythiaCoin) + toBigIntSafe(randomReward);
		user.lastLootbox = Date.now();

		user.changed('kythiaCoin', true);
		user.changed('lastLootbox', true);

		await user.save();

		const msg = `## ${await t(interaction, 'economy.lootbox.lootbox.title')}\n${await t(
			interaction,
			'economy.lootbox.lootbox.success',
			{
				amount: randomReward,
			},
		)}`;
		const components = await simpleContainer(interaction, msg, {
			color: kythiaConfig.bot.color,
		});
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = LootboxCommand;
