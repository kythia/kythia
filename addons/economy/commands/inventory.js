/**
 * @namespace: addons/economy/commands/inventory.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class InventoryCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('inventory')
			.setDescription('🛄 View all items in your inventory.');

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

		const inventoryItems = await Inventory.getAllCache({ userId: user.userId });

		if (inventoryItems.length === 0) {
			const msg = await t(interaction, 'economy.inventory.inventory.empty');
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const itemCounts = inventoryItems.reduce((acc, item) => {
			acc[item.itemName] = (acc[item.itemName] || 0) + 1;
			return acc;
		}, {});

		const itemEntries = Object.entries(itemCounts);
		const itemList = [];
		for (const [itemName, count] of itemEntries) {
			const name = await t(
				interaction,
				'economy.inventory.inventory.item.field.name',
				{ itemName, count },
			);
			const value = await t(
				interaction,
				'economy.inventory.inventory.item.field.value',
				{ count },
			);
			itemList.push(`**${name}:** ${value}`);
		}

		const msg = `## ${await t(interaction, 'economy.inventory.inventory.title')}\n\n${itemList.join('\n')}`;
		const components = await simpleContainer(interaction, msg, {
			color: kythiaConfig.bot.color,
		});

		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = InventoryCommand;
