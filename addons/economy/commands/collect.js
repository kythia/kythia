/**
 * @namespace: addons/economy/commands/collect.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { toBigIntSafe } = require('../helpers/bigint');
const { BaseCommand } = require('kythia-core');
class CollectCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('collect')
			.setDescription('Collect daily passive income from your assets');
	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser, Inventory } = models;
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

		// Check cooldown (24 hours)
		const cooldown = checkCooldown(
			user.lastCollect,
			86400,
			// 24 hours
			interaction,
		);
		if (cooldown.remaining) {
			const msg = await t(interaction, 'economy.commands.collect.cooldown', {
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

		// Check for assets
		const house = await Inventory.getCache({
			userId: interaction.user.id,
			itemName: '🏠 Luxury House',
		});
		const company = await Inventory.getCache({
			userId: interaction.user.id,
			itemName: '🏢 Company',
		});
		if (!house && !company) {
			const msg = await t(interaction, 'economy.commands.collect.no_assets');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		let passiveIncome = 0;
		const assetMsgs = [];
		if (house && house.quantity > 0) {
			passiveIncome += 1500;
			assetMsgs.push('🏠 Luxury House (+🪙 1,500)');
		}
		if (company && company.quantity > 0) {
			passiveIncome += 5000;
			assetMsgs.push('🏢 Company (+🪙 5,000)');
		}
		user.kythiaCoin =
			toBigIntSafe(user.kythiaCoin) + toBigIntSafe(passiveIncome);
		user.lastCollect = Date.now();
		user.changed('kythiaCoin', true);
		user.changed('lastCollect', true);
		await user.save();
		const msg = await t(interaction, 'economy.commands.collect.success', {
			amount: passiveIncome,
			assets: assetMsgs.join('\n> '),
		});
		const components = await simpleContainer(interaction, msg, {
			color: 'Green',
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = CollectCommand;
