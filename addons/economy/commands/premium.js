/**
 * @namespace: addons/economy/commands/premium.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	StringSelectMenuBuilder,
} = require('discord.js');
const { toBigIntSafe } = require('../helpers/bigint');
const banks = require('../helpers/banks');

const TIERS = require('../helpers/premium-tiers');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('premium')
			.setDescription('💎 Enter the Premium Shop to buy Kythia Tiers.'),

	async execute(interaction, container) {
		const { helpers, kythiaConfig, models, redis } = container;
		const { simpleContainer } = helpers.discord;
		const { formatNumber } = helpers.economy;
		const { KythiaUser } = models;
		const { TransactionLog } = require('../helpers/transactions');

		await interaction.deferReply();

		// Fetch user
		const [kythiaUser] = await KythiaUser.findOrCreateWithCache({
			where: { userId: interaction.user.id },
			defaults: {
				userId: interaction.user.id,
			},
		});

		// Initial Panel
		const getMainMenu = async () => {
			let currentPremiumText = 'No active premium.';
			if (kythiaUser.isPremium !== 'none') {
				const expireDate = kythiaUser.premiumExpiresAt
					? `<t:${Math.floor(kythiaUser.premiumExpiresAt.getTime() / 1000)}:R>`
					: 'Permanent';
				currentPremiumText = `Active Tier: **${kythiaUser.isPremium.toUpperCase()}** (Expires: ${expireDate})`;
			}

			const contentText = `💎 **Kythia Premium Shop**\n\nUpgrade your Kythia experience by purchasing Premium Tiers using KythiaCoins! Select a tier below to see its perks and pricing.\n\n${currentPremiumText}`;

			const components = await simpleContainer(interaction, contentText, {
				color: kythiaConfig.bot.color,
				footer: { text: 'Kythia Ecosystem • Premium' },
			});

			const row = new ActionRowBuilder().addComponents(
				new ButtonBuilder()
					.setCustomId('tier_cute')
					.setLabel('Cute Tier')
					.setEmoji('🎀')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('tier_powerful')
					.setLabel('Powerful Tier')
					.setEmoji('⚔️')
					.setStyle(ButtonStyle.Secondary),
				new ButtonBuilder()
					.setCustomId('tier_yours')
					.setLabel('Yours Tier')
					.setEmoji('👑')
					.setStyle(ButtonStyle.Secondary),
			);

			components.push(row);
			return components;
		};

		const message = await interaction.editReply({
			components: await getMainMenu(),
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
				const contentText = `**${tierData.name}**\n\n${tierData.desc}\n\nSelect a duration below to see the price.`;

				const components = await simpleContainer(i, contentText, {
					color: tierData.color,
				});

				const durationSelect = new StringSelectMenuBuilder()
					.setCustomId('premium_duration')
					.setPlaceholder('Select Subscription Duration...')
					.addOptions([
						{
							label: '7 Days',
							description: `${formatNumber(tierData.prices[7])} KC`,
							value: '7',
						},
						{
							label: '30 Days',
							description: `${formatNumber(tierData.prices[30])} KC`,
							value: '30',
						},
						{
							label: '1 Year',
							description: `${formatNumber(tierData.prices[365])} KC`,
							value: '365',
						},
					]);

				const row1 = new ActionRowBuilder().addComponents(durationSelect);
				const row2 = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('back_main')
						.setLabel('Back')
						.setStyle(ButtonStyle.Secondary),
				);

				components.push(row1, row2);
				await i.update({ components, flags: MessageFlags.IsComponentsV2 });
			} else if (i.customId === 'premium_duration') {
				selectedDuration = Number(i.values[0]);
				const tierData = TIERS[selectedTier];
				const price = tierData.prices[selectedDuration];

				const contentText = `**${tierData.name} (${selectedDuration} Days)**\n\nPrice: **${formatNumber(price)} KC**\n\nAre you sure you want to purchase this?`;

				const components = await simpleContainer(i, contentText, {
					color: tierData.color,
				});

				const row = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setCustomId('confirm_buy')
						.setLabel(`Buy for ${formatNumber(price)} KC`)
						.setStyle(ButtonStyle.Success),
					new ButtonBuilder()
						.setCustomId('back_main')
						.setLabel('Cancel')
						.setStyle(ButtonStyle.Danger),
				);

				components.push(row);
				await i.update({ components, flags: MessageFlags.IsComponentsV2 });
			} else if (i.customId === 'confirm_buy') {
				const tierData = TIERS[selectedTier];
				const price = tierData.prices[selectedDuration];

				// Process Purchase
				const balance = await banks.getBalance(kythiaUser);
				if (balance.wallet < price && balance.bank < price) {
					const total = balance.wallet + balance.bank;
					if (total < price) {
						const components = await simpleContainer(
							i,
							`You don't have enough KythiaCoins! You need **${formatNumber(price)} KC** but only have **${formatNumber(total)} KC** in total.`,
							{ color: 'Red' },
						);
						return i.update({
							components,
							flags: MessageFlags.IsComponentsV2,
						});
					}
				}

				try {
					// Deduct funds (prefer wallet, then bank)
					let amountLeft = price;
					if (balance.wallet >= amountLeft) {
						kythiaUser.kythiaCoinWallet = (
							toBigIntSafe(kythiaUser.kythiaCoinWallet) - amountLeft
						).toString();
					} else {
						amountLeft -= balance.wallet;
						kythiaUser.kythiaCoinWallet = '0';
						kythiaUser.kythiaCoinBank = (
							toBigIntSafe(kythiaUser.kythiaCoinBank) - amountLeft
						).toString();
					}

					// Update Premium
					kythiaUser.isPremium = selectedTier;
					const now = kythiaUser.premiumExpiresAt
						? new Date(
								Math.max(Date.now(), kythiaUser.premiumExpiresAt.getTime()),
							)
						: new Date();
					now.setDate(now.getDate() + selectedDuration);
					kythiaUser.premiumExpiresAt = now;

					await kythiaUser.save();

					// Invalidate Cache
					await redis.del(`kythia:premium:user:${interaction.user.id}`);

					// Log Transaction
					const tLogger = new TransactionLog(container);
					await tLogger.log({
						userId: interaction.user.id,
						type: 'PREMIUM_PURCHASE',
						amount: price,
						balanceAfter:
							toBigIntSafe(kythiaUser.kythiaCoinWallet) +
							toBigIntSafe(kythiaUser.kythiaCoinBank),
						context: `Purchased ${tierData.name} for ${selectedDuration} days`,
					});

					const components = await simpleContainer(
						i,
						`🎉 **Payment Successful!**\n\nYou are now subscribed to **${tierData.name}** for **${selectedDuration} Days**!\nYour Premium features have been unlocked globally.`,
						{ color: '#57F287' },
					);
					await i.update({ components, flags: MessageFlags.IsComponentsV2 });
					collector.stop('bought');
				} catch (err) {
					container.logger.error(`Premium purchase error: ${err.message}`, {
						label: 'economy',
					});
					const components = await simpleContainer(
						i,
						'An error occurred during your transaction. Please try again or contact support.',
						{ color: 'Red' },
					);
					await i.update({ components, flags: MessageFlags.IsComponentsV2 });
				}
			} else if (i.customId === 'back_main') {
				selectedTier = null;
				selectedDuration = null;
				await i.update({
					components: await getMainMenu(),
					flags: MessageFlags.IsComponentsV2,
				});
			}
		});

		collector.on('end', (_, reason) => {
			if (reason !== 'bought' && message.editable) {
				message.edit({ components: [] }).catch(() => {});
			}
		});
	},
};
