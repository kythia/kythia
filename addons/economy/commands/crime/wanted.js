/**
 * @namespace: addons/economy/commands/crime/wanted.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
} = require('discord.js');
const { toBigIntSafe } = require('../../helpers/bigint');
const { Op } = require('sequelize');
const { BaseCommand } = require('kythia-core');
class WantedCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('wanted')
			.setDescription('View the most wanted criminals or claim a bounty.')
			.addUserOption((option) =>
				option
					.setName('target')
					.setDescription('The user you want to capture')
					.setRequired(false),
			);
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
		const targetOpt = interaction.options.getUser('target');
		if (!targetOpt) {
			const wantedUsers = await KythiaUser.getAllCache({
				where: {
					bountyAmount: {
						[Op.gt]: 0,
					},
				},
				order: [['bountyAmount', 'DESC']],
				limit: 10,
			});
			if (wantedUsers.length === 0) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'economy.crime.wanted.empty.desc'),
					{
						color: 'Green',
					},
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			let listText = await t(interaction, 'economy.crime.wanted.list.title');
			for (let i = 0; i < wantedUsers.length; i++) {
				const wUser = wantedUsers[i];
				listText += await t(interaction, 'economy.crime.wanted.list.entry', {
					rank: i + 1,
					userId: wUser.userId,
					bounty: wUser.bountyAmount.toLocaleString(),
				});
			}
			const replyContainer = new ContainerBuilder()
				.setAccentColor(
					kythiaConfig.bot.color
						? parseInt(kythiaConfig.bot.color.replace('#', ''), 16)
						: undefined,
				)
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(listText),
				);
			return interaction.editReply({
				components: [replyContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (targetOpt.id === interaction.user.id) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'economy.crime.wanted.error.self.desc'),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const target = await KythiaUser.getCache({
			userId: targetOpt.id,
		});
		if (!target?.bountyAmount || target.bountyAmount <= 0) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'economy.crime.wanted.error.no_bounty.desc'),
				{
					color: 'Yellow',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const { Inventory } = models;
		const bountyLicense = await Inventory.getCache({
			userId: user.userId,
			itemName: '🕵️ Bounty License',
		});
		if (!bountyLicense) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'economy.crime.wanted.error.no_license.desc'),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const success = Math.random() < 0.3;
		if (success) {
			const reward = target.bountyAmount;
			user.kythiaCoin = toBigIntSafe(user.kythiaCoin) + toBigIntSafe(reward);
			target.bountyAmount = 0;
			if (target.kythiaBank >= reward) {
				target.kythiaBank =
					toBigIntSafe(target.kythiaBank) - toBigIntSafe(reward);
				target.changed('kythiaBank', true);
			} else {
				target.kythiaBank = 0;
				target.changed('kythiaBank', true);
			}
			user.changed('kythiaCoin', true);
			target.changed('bountyAmount', true);
			await user.save();
			await target.save();
			const msg = await t(interaction, 'economy.crime.wanted.success.desc', {
				username: targetOpt.username,
				reward: reward.toLocaleString(),
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Green',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			const msg = await t(interaction, 'economy.crime.wanted.fail.desc', {
				username: targetOpt.username,
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = WantedCommand;
