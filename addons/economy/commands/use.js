/**
 * @namespace: addons/economy/commands/use.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { toBigIntSafe } = require('../helpers/bigint');

const { BaseCommand } = require('kythia-core');

class UseCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('use')
			.setDescription('🎒 Use a consumable item from your inventory.')
			.addStringOption((option) =>
				option
					.setName('item')
					.setDescription('The item you want to use')
					.setRequired(true)
					.addChoices(
						{ name: '☕ Coffee', value: 'coffee_item' },
						{ name: '🥫 Energy Drink', value: 'energydrink_item' },
						{ name: '🎫 Lottery Ticket', value: 'lotteryticket_item' },
					),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser, Inventory } = models;
		const { simpleContainer } = helpers.discord;

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

		const itemId = interaction.options.getString('item');

		let itemName = '';
		if (itemId === 'coffee_item') itemName = '☕ Coffee';
		if (itemId === 'energydrink_item') itemName = '🥫 Energy Drink';
		if (itemId === 'lotteryticket_item') itemName = '🎫 Lottery Ticket';

		const invItem = await Inventory.getCache({
			userId: interaction.user.id,
			itemName: itemName,
		});

		if (!invItem || invItem.quantity <= 0) {
			const msg = await t(interaction, 'economy.use.error.no_item', {
				item: itemName,
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		await invItem.destroy(); // Consumes the item

		let resultMsg = '';
		let color = kythiaConfig.bot.color;

		if (itemId === 'coffee_item') {
			user.lastWork = null;
			user.changed('lastWork', true);
			resultMsg = await t(interaction, 'economy.use.success.coffee');
		} else if (itemId === 'energydrink_item') {
			user.lastWork = null;
			user.lastDaily = null;
			user.lastLootbox = null;
			user.lastRob = null;
			user.lastBeg = null;
			user.changed('lastWork', true);
			user.changed('lastDaily', true);
			user.changed('lastLootbox', true);
			user.changed('lastRob', true);
			user.changed('lastBeg', true);
			resultMsg = await t(interaction, 'economy.use.success.energydrink');
		} else if (itemId === 'lotteryticket_item') {
			const isWin = Math.random() < 0.01; // 1% chance
			if (isWin) {
				user.kythiaCoin = toBigIntSafe(user.kythiaCoin) + toBigIntSafe(10000);
				user.changed('kythiaCoin', true);
				resultMsg = await t(interaction, 'economy.use.success.lottery_win');
				color = 'Green';
			} else {
				resultMsg = await t(interaction, 'economy.use.success.lottery_lose');
				color = 'Red';
			}
		}

		await user.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'economy.use.item.used', { msg: resultMsg }),
			{
				color,
			},
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = UseCommand;
