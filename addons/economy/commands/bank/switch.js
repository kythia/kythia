/**
 * @namespace: addons/economy/commands/bank/switch.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	MessageFlags,
	ActionRowBuilder,
	StringSelectMenuBuilder,
} = require('discord.js');
const banks = require('../../helpers/banks');
const { toBigIntSafe } = require('../../helpers/bigint');
const { BaseCommand } = require('kythia-core');
class SwitchCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('switch')
			.setDescription('Switch to a different bank type (Costs money!).');
	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer, createContainer } = helpers.discord;
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
		const SWITCH_COST = 250000;
		if (user.kythiaCoin < SWITCH_COST) {
			const msg = await t(
				interaction,
				'economy.commands.bank.switch.error.insufficient_funds.desc',
				{
					cost: SWITCH_COST.toLocaleString(),
				},
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const allBanks = banks.getAllBanks();
		const options = allBanks.map((bank) => ({
			label: bank.name,
			description: bank.description.substring(0, 100),
			value: bank.id,
			emoji: bank.emoji,
			default: user.bankType === bank.id,
		}));
		const row = new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder()
				.setCustomId('select_bank')
				.setPlaceholder(
					await interaction.client.container.t(
						interaction,
						'economy.ui.ph_bank',
					),
				)
				.addOptions(options),
		);
		const switchContainer = await createContainer(interaction, {
			description: await t(
				interaction,
				'economy.commands.bank.switch.prompt.desc',
				{
					cost: SWITCH_COST.toLocaleString(),
					currentBank: banks.getBank(user.bankType).name,
				},
			),
			components: [row],
		});
		const message = await interaction.editReply({
			components: switchContainer,
			flags: MessageFlags.IsComponentsV2,
		});
		const filter = (i) => i.user.id === interaction.user.id;
		const collector = message.createMessageComponentCollector({
			filter,
			time: 30000,
		});
		collector.on('collect', async (i) => {
			if (i.customId === 'select_bank') {
				const selectedBankId = i.values[0];
				if (user.bankType === selectedBankId) {
					const msg = await t(
						i,
						'economy.commands.bank.switch.error.already_using.desc',
						{
							bank: banks.getBank(selectedBankId).name,
						},
					);
					const components = await simpleContainer(i, msg, {
						color: 'Yellow',
					});
					return i.update({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				const selectedBank = banks.getBank(selectedBankId);
				const maxCap =
					selectedBank.maxBalance === Infinity
						? Infinity
						: selectedBank.maxBalance + (user.extraBankCapacity || 0);
				if (user.kythiaBank > maxCap) {
					const msg = await t(
						i,
						'economy.commands.bank.switch.error.over_capacity.desc',
						{
							bank: selectedBank.name,
						},
					);
					const components = await simpleContainer(i, msg, {
						color: 'Red',
					});
					return i.update({
						components,
						flags: MessageFlags.IsComponentsV2,
					});
				}
				user.kythiaCoin =
					toBigIntSafe(user.kythiaCoin) - toBigIntSafe(SWITCH_COST);
				user.bankType = selectedBankId;
				user.changed('kythiaCoin', true);
				user.changed('bankType', true);
				await user.save();
				const msg = await t(i, 'economy.commands.bank.switch.success.desc', {
					cost: SWITCH_COST.toLocaleString(),
					bank: selectedBank.name,
				});
				const components = await simpleContainer(i, msg, {
					color: 'Green',
				});
				await i.update({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		});
		collector.on('end', async (collected) => {
			if (collected.size === 0) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'economy.commands.bank.switch.timeout.desc'),
					{
						color: kythiaConfig.bot.color,
					},
				);
				await interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		});
	}
}
exports.default = SwitchCommand;
