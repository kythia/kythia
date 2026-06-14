/**
 * @namespace: addons/economy/commands/premium.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const TIERS = require('@coreHelpers/premium-tiers');

const { BaseCommand } = require('kythia-core');

class PremiumCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('premium')
			.setDescription('💎 Enter the Premium Shop to buy Kythia Tiers.');

	async execute(interaction) {
		const container = this.container;
		const { models } = container;
		const { KythiaUser } = models;
		const { premium } = container.helpers.economy;

		await interaction.deferReply();

		// Fetch user
		const [kythiaUser] = await KythiaUser.findOrCreateWithCache({
			where: { userId: interaction.user.id },
			defaults: {
				userId: interaction.user.id,
			},
		});

		const message = await interaction.editReply({
			components: await premium.buildPremiumMainMenu(
				container,
				interaction,
				kythiaUser,
			),
			flags: MessageFlags.IsComponentsV2,
		});

		const collector = message.createMessageComponentCollector({
			filter: (i) => i.user.id === interaction.user.id,
			time: 120_000,
		});

		let selectedTier = null;
		let selectedDuration = null;

		collector.on('collect', async (i) => {
			if (i.customId.startsWith('tier_')) {
				selectedTier = i.customId.replace('tier_', '');
				selectedDuration = null; // Reset duration

				const tierData = TIERS[selectedTier];
				const components = await premium.buildPremiumDurationMenu(
					container,
					i,
					selectedTier,
					tierData,
				);

				await i.update({ components, flags: MessageFlags.IsComponentsV2 });
			} else if (i.customId === 'premium_duration') {
				selectedDuration = Number(i.values[0]);
				const tierData = TIERS[selectedTier];
				const price = tierData.prices[selectedDuration];

				const components = await premium.buildPremiumConfirmMenu(
					container,
					i,
					tierData,
					selectedDuration,
					price,
				);

				await i.update({ components, flags: MessageFlags.IsComponentsV2 });
			} else if (i.customId === 'confirm_buy') {
				const success = await premium.handlePremiumPurchase(
					container,
					i,
					kythiaUser,
					selectedTier,
					selectedDuration,
				);
				if (success) {
					collector.stop('bought');
				}
			} else if (i.customId === 'back_main') {
				selectedTier = null;
				selectedDuration = null;
				await i.update({
					components: await premium.buildPremiumMainMenu(
						container,
						i,
						kythiaUser,
					),
					flags: MessageFlags.IsComponentsV2,
				});
			}
		});

		collector.on('end', (_, reason) => {
			if (reason !== 'bought' && message.editable) {
				message.edit({ components: [] }).catch(() => {});
			}
		});
	}
}

exports.default = PremiumCommand;
