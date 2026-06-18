/**
 * @namespace: addons/economy/commands/coin.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class CoinCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('coin')
			.setDescription('Check your kythia coin balance.');
	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		const user = await KythiaUser.getCache({
			userId: interaction.user.id,
		});
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
		const msg = await t(interaction, 'economy.cash.cash.balance', {
			username: interaction.user.username,
			cash: user.kythiaCoin.toLocaleString(),
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
exports.default = CoinCommand;
