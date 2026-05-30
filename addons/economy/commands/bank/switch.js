/**
 * @namespace: addons/economy/commands/bank_switch.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */
const {
	MessageFlags,
	ActionRowBuilder,
	StringSelectMenuBuilder,
} = require('discord.js');
const banks = require('../../helpers/banks');
const { toBigIntSafe } = require('../../helpers/bigint');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('switch')
			.setDescription('🏦 Switch to a different bank type (Costs money!).'),

	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { KythiaUser } = models;
		const { simpleContainer, createContainer } = helpers.discord;

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

		const SWITCH_COST = 250000;

		if (user.kythiaCoin < SWITCH_COST) {
			const msg = `## 🏦 Bank Switch Failed\nYou need at least **🪙 ${SWITCH_COST.toLocaleString()}** cash to switch your bank.`;
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
				.setPlaceholder('Select a new bank...')
				.addOptions(options),
		);

		const switchContainer = await createContainer(interaction, {
			description: `## 🏦 Switch Bank Type\nChoose a new bank to switch to. Warning: This will cost you **🪙 ${SWITCH_COST.toLocaleString()}** cash immediately!\n\nYour current bank: **${banks.getBank(user.bankType).name}**`,
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
					const msg = `You are already using **${banks.getBank(selectedBankId).name}**.`;
					const components = await simpleContainer(i, msg, { color: 'Yellow' });
					return i.update({ components, flags: MessageFlags.IsComponentsV2 });
				}

				const selectedBank = banks.getBank(selectedBankId);
				const maxCap =
					selectedBank.maxBalance === Infinity
						? Infinity
						: selectedBank.maxBalance + (user.extraBankCapacity || 0);

				if (user.kythiaBank > maxCap) {
					const msg = `## 🏦 Bank Switch Failed\nYou have too much money in your bank to switch to **${selectedBank.name}**. Please withdraw some first.`;
					const components = await simpleContainer(i, msg, { color: 'Red' });
					return i.update({ components, flags: MessageFlags.IsComponentsV2 });
				}

				user.kythiaCoin =
					toBigIntSafe(user.kythiaCoin) - toBigIntSafe(SWITCH_COST);
				user.bankType = selectedBankId;

				user.changed('kythiaCoin', true);
				user.changed('bankType', true);
				await user.save();

				const msg = `## 🏦 Bank Switched!\nYou paid **🪙 ${SWITCH_COST.toLocaleString()}** and successfully switched to **${selectedBank.name}**.\nEnjoy your new perks!`;
				const components = await simpleContainer(i, msg, { color: 'Green' });
				await i.update({ components, flags: MessageFlags.IsComponentsV2 });
			}
		});

		collector.on('end', async (collected) => {
			if (collected.size === 0) {
				const components = await simpleContainer(
					interaction,
					'Bank switch timed out.',
					{ color: kythiaConfig.bot.color },
				);
				await interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		});
	},
};
