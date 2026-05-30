/**
 * @namespace: addons/economy/commands/wanted.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */
const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
} = require('discord.js');
const { toBigIntSafe } = require('../../helpers/bigint');
const { Op } = require('sequelize');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('wanted')
			.setDescription('🤠 View the most wanted criminals or claim a bounty.')
			.addUserOption((option) =>
				option
					.setName('target')
					.setDescription('The user you want to capture')
					.setRequired(false),
			),

	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
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

		const targetOpt = interaction.options.getUser('target');

		if (!targetOpt) {
			const wantedUsers = await KythiaUser.findAll({
				where: { bountyAmount: { [Op.gt]: 0 } },
				order: [['bountyAmount', 'DESC']],
				limit: 10,
			});

			if (wantedUsers.length === 0) {
				const components = await simpleContainer(
					interaction,
					'## 🤠 Most Wanted\nThe town is peaceful. No bounties currently active.',
					{ color: 'Green' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			let listText = '## 🤠 Most Wanted Criminals\n\n';
			for (let i = 0; i < wantedUsers.length; i++) {
				const wUser = wantedUsers[i];
				listText += `**#${i + 1}** <@${wUser.userId}> — 💰 **🪙 ${wUser.bountyAmount.toLocaleString()}**\n`;
			}

			const replyContainer = new ContainerBuilder()
				.setAccentColor(parseInt(kythiaConfig.bot.color.replace('#', ''), 16))
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
				'You cannot capture yourself!',
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const target = await KythiaUser.getCache({ userId: targetOpt.id });
		if (!target?.bountyAmount || target.bountyAmount <= 0) {
			const components = await simpleContainer(
				interaction,
				'This user does not have an active bounty.',
				{ color: 'Yellow' },
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
				'You need a **🕵️ Bounty License** from the shop to capture bounties!',
				{ color: 'Red' },
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

			const msg = `## 🤠 Bounty Claimed!\nYou successfully captured ${targetOpt.username} and claimed the bounty of **🪙 ${reward.toLocaleString()}**!`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Green',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			const msg = `## 💥 Capture Failed!\n${targetOpt.username} managed to escape! Better luck next time.`;
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
