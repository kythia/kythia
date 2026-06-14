/**
 * @namespace: addons/core/commands/utils/kyth/premium/list.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { Op } = require('sequelize');
const { BaseCommand } = require('kythia-core');
const premiumlistuiHelper = require('../../../../helpers/premiumListUi');

// Helpers extracted to addons/core/helpers/premium-list-ui.js

class ListCommand extends BaseCommand {
	slashCommand = (subcommand) =>
		subcommand.setName('list').setDescription('View list of premium users');
	async execute(interaction) {
		const container = this.container;
		const { t, models } = container;
		const { KythiaUser } = models;
		await interaction.deferReply();
		const now = new Date();
		const allPremiumUsers = await KythiaUser.getAllCache({
			where: {
				isPremium: true,
				premiumExpiresAt: {
					[Op.gt]: now,
				},
			},
			order: [['premiumExpiresAt', 'ASC']],
			cacheTags: ['KythiaUser:premium:list'],
		});
		const totalUsers = allPremiumUsers.length;
		let currentPage = 1;
		if (totalUsers === 0) {
			const { premiumListContainer } =
				await premiumlistuiHelper.generatePremiumListContainer(
					interaction,
					1,
					[],
					0,
					/*navDisabled*/ true,
				);
			return interaction.editReply({
				components: [premiumListContainer],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		}
		const { premiumListContainer, totalPages } =
			await premiumlistuiHelper.generatePremiumListContainer(
				interaction,
				currentPage,
				allPremiumUsers,
				totalUsers,
			);
		const message = await interaction.editReply({
			components: [premiumListContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
			allowedMentions: {
				parse: [],
			},
		});
		if (totalPages <= 1) return;
		const collector = message.createMessageComponentCollector({
			time: 300000,
		});
		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: await t(i, 'core.premium.premium.list.not.your.interaction'),
					flags: MessageFlags.Ephemeral,
				});
			}
			if (i.customId === 'premium_list_first') {
				currentPage = 1;
			} else if (i.customId === 'premium_list_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'premium_list_next') {
				currentPage = Math.min(totalPages, currentPage + 1);
			} else if (i.customId === 'premium_list_last') {
				currentPage = totalPages;
			}
			const { premiumListContainer: newPremiumListContainer } =
				await premiumlistuiHelper.generatePremiumListContainer(
					i,
					currentPage,
					allPremiumUsers,
					totalUsers,
				);
			await i.update({
				components: [newPremiumListContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		});
		collector.on('end', async () => {
			try {
				const { premiumListContainer: finalContainer } =
					await premiumlistuiHelper.generatePremiumListContainer(
						interaction,
						currentPage,
						allPremiumUsers,
						totalUsers,
						true,
					);
				await message.edit({
					components: [finalContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (_e) {}
		});
	}
}

exports.default = ListCommand;
