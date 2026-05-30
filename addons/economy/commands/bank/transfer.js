/**
 * @namespace: addons/economy/commands/transfer.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
} = require('discord.js');
const banks = require('../../helpers/banks');
const { toBigIntSafe } = require('../../helpers/bigint');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('transfer')
			.setDescription('Transfer your money to another user.')
			.addUserOption((option) =>
				option
					.setName('target')
					.setDescription('User to transfer money to')
					.setRequired(true),
			)
			.addIntegerOption((option) =>
				option
					.setName('amount')
					.setDescription('Amount of money to transfer')
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers, logger } = container;
		const { KythiaUser } = models;
		const { simpleContainer, createContainer } = helpers.discord;

		await interaction.deferReply();
		try {
			const target = interaction.options.getUser('target');
			const amount = interaction.options.getInteger('amount');

			const giver = await KythiaUser.getCache({ userId: interaction.user.id });
			const receiver = await KythiaUser.getCache({ userId: target.id });

			if (!giver) {
				const msg = await t(interaction, 'economy.withdraw.no.account.desc');
				const components = await simpleContainer(interaction, msg, {
					color: kythiaConfig.bot.color,
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			if (giver.kythiaBank < amount) {
				const msg = await t(
					interaction,
					'economy.transfer.transfer.not.enough.bank.text',
				);
				const components = await simpleContainer(interaction, msg, {
					color: kythiaConfig.bot.color,
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (!receiver) {
				const msg = await t(
					interaction,
					'economy.transfer.transfer.target.no.account',
				);
				const components = await simpleContainer(interaction, msg, {
					color: kythiaConfig.bot.color,
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			if (giver.userId === receiver.userId) {
				const msg = await t(interaction, 'economy.transfer.transfer.self');
				const components = await simpleContainer(interaction, msg, {
					color: kythiaConfig.bot.color,
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const giverBank = banks.getBank(giver.bankType);
			const transferFeePercent = giverBank.transferFeePercent;
			const fee = Math.floor(amount * (transferFeePercent / 100));
			if (giver.kythiaBank < amount + fee) {
				const msg = await t(
					interaction,
					'economy.transfer.transfer.not.enough.bank.fee',
					{ fee },
				);
				const components = await simpleContainer(interaction, msg, {
					color: kythiaConfig.bot.color,
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			const row = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('confirm')
					.setLabel(
						await t(interaction, 'economy.transfer.transfer.btn.confirm'),
					)
					.setStyle(ButtonStyle.Success),
				new ButtonBuilder()
					.setCustomId('cancel')
					.setLabel(
						await t(interaction, 'economy.transfer.transfer.btn.cancel'),
					)
					.setStyle(ButtonStyle.Danger),
			);

			const confirmComponents = await createContainer(interaction, {
				description: await t(interaction, 'economy.transfer.transfer.confirm', {
					amount,
					target: target.username,
					fee,
				}),
				components: [row],
			});

			await interaction.editReply({
				components: confirmComponents,
				flags: MessageFlags.IsComponentsV2,
			});

			const filter = (i) => i.user.id === interaction.user.id;
			const collector = interaction.channel.createMessageComponentCollector({
				filter,
				time: 15000,
			});

			collector.on('collect', async (i) => {
				if (i.customId === 'confirm') {
					giver.kythiaBank =
						toBigIntSafe(giver.kythiaBank) - toBigIntSafe(amount + fee);
					receiver.kythiaBank =
						toBigIntSafe(receiver.kythiaBank) + toBigIntSafe(amount);

					giver.changed('kythiaBank', true);
					receiver.changed('kythiaBank', true);

					await giver.save();
					await receiver.save();

					const msg = await t(i, 'economy.transfer.transfer.success', {
						amount,
						target: target.username,
						fee,
					});
					const components = await simpleContainer(i, msg, {
						color: kythiaConfig.bot.color,
					});
					await i.update({ components, flags: MessageFlags.IsComponentsV2 });

					// Send DM to receiver
					const receiverMsg = await t(i, 'economy.transfer.transfer.received', {
						amount,
						from: interaction.user.username,
					});
					const receiverComponents = await simpleContainer(i, receiverMsg, {
						color: kythiaConfig.bot.color,
					});
					try {
						await target.send({
							components: receiverComponents,
							flags: MessageFlags.IsComponentsV2,
						});
					} catch (_e) {}
				} else if (i.customId === 'cancel') {
					const msg = await t(i, 'economy.transfer.transfer.cancelled');
					const components = await simpleContainer(i, msg, {
						color: kythiaConfig.bot.color,
					});
					await i.update({ components, flags: MessageFlags.IsComponentsV2 });
				}
			});

			collector.on('end', async (collected) => {
				if (collected.size === 0) {
					const msg = await t(interaction, 'economy.transfer.transfer.timeout');
					const components = await simpleContainer(interaction, msg, {
						color: kythiaConfig.bot.color,
					});
					await interaction.editReply({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
			});
		} catch (error) {
			logger.error(
				`Error during transfer command execution: ${error.message || error}`,
				{
					label: 'economy:transfer',
				},
			);
			const msg = await t(interaction, 'economy.transfer.transfer.error');
			const components = await simpleContainer(interaction, msg, {
				color: kythiaConfig.bot.color,
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
