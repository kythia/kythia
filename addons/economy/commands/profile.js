/**
 * @namespace: addons/economy/commands/profile.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const banks = require('../helpers/banks');

const { BaseCommand } = require('kythia-core');

class ProfileCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('profile')
			.setDescription(
				"🗃️ View a user's full profile, including level, bank, cash, and more.",
			)
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('The user whose profile you want to view')
					.setRequired(false),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		// Get target user or self
		const targetUser = interaction.options.getUser('user') || interaction.user;
		const userId = targetUser.id;

		// Fetch user data
		const userData = await KythiaUser.getCache({ userId: userId });
		if (!userData) {
			const msg = await t(interaction, 'economy.withdraw.no.account.desc');
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Bank & coin
		const bank = userData.kythiaBank || 0;
		const coin = userData.kythiaCoin || 0;
		const bankType = userData.bankType ? userData.bankType.toUpperCase() : '-';
		const userBank = banks.getBank(bankType);
		const bankDisplay = `(${userBank.emoji} ${userBank.name})`;

		// Build message
		const msg = [
			await t(interaction, 'economy.profile.profile.title'),
			await t(interaction, 'economy.profile.profile.user.line', {
				username: targetUser.username,
				userId: targetUser.id,
			}),
			await t(interaction, 'economy.profile.profile.finance.title'),
			await t(interaction, 'economy.profile.profile.bank.line', {
				bank: bank.toLocaleString(),
				bankType: bankDisplay || '',
			}),
			await t(interaction, 'economy.profile.profile.cash.line', {
				cash: coin.toLocaleString(),
			}),
		].join('\n');

		const components = await simpleContainer(interaction, msg, {
			color: kythiaConfig.bot.color,
		});

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = ProfileCommand;
