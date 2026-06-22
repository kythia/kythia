/**
 * @namespace: addons/economy/commands/market/history.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class HistoryCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('history')
			.setDescription('View your transaction history.');
	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers, logger } = container;
		const { KythiaUser, MarketTransaction } = models;
		const { simpleContainer } = helpers.discord;
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
		try {
			const transactions = await MarketTransaction.getAllCache({
				where: {
					userId: interaction.user.id,
				},
				order: [['createdAt', 'DESC']],
				limit: 10,
				cacheTags: [`MarketTransaction:byUser:${interaction.user.id}`],
			});
			if (transactions.length === 0) {
				const msg = await t(
					interaction,
					'economy.commands.market.history.empty.desc',
				);
				const components = await simpleContainer(interaction, msg, {
					color: kythiaConfig.bot.color,
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			const description = transactions
				.map((tx) => {
					const side = tx.type.charAt(0).toUpperCase() + tx.type.slice(1);
					const emoji = tx.type === 'buy' ? '🟢' : '🔴';
					return `${emoji} **${side} ${tx.quantity.toFixed(6)} ${tx.assetId.toUpperCase()}** at $${tx.price.toLocaleString()} each\n*${new Date(tx.createdAt).toLocaleString()}*`;
				})
				.join('\n\n');
			const msg = await t(
				interaction,
				'economy.commands.market.history.title_md',
				{
					title: await t(interaction, 'economy.commands.market.history.title', {
						username: interaction.user.username,
					}),
					desc: description,
				},
			);
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Error in history command: ${error.message || error}`, {
				label: 'core:commands:economy:market:history',
			});
			const msg = await t(
				interaction,
				'economy.commands.market.history.error.desc',
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = HistoryCommand;
