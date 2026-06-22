/**
 * @namespace: addons/economy/helpers/premium.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	StringSelectMenuBuilder,
	MessageFlags,
} = require('discord.js');
const { toBigIntSafe } = require('./bigint');
const banks = require('./banks');
const TIERS = require('@coreHelpers/premiumTiers');
async function buildPremiumMainMenu(container, interaction, kythiaUser) {
	const { simpleContainer } = container.helpers.discord;
	const { kythiaConfig } = container;
	let currentPremiumText = 'No active premium.';
	if (kythiaUser.premiumTier !== 'none') {
		const expireDateVal = kythiaUser.premiumExpiresAt;
		const expireDate = expireDateVal
			? `<t:${Math.floor(new Date(expireDateVal).getTime() / 1000)}:R>`
			: 'Permanent';
		currentPremiumText = `Active Tier: **${kythiaUser.premiumTier}** (Expires: ${expireDate})`;
	}
	const contentText = `💎 **Kythia Premium Shop**\n\nUpgrade your Kythia experience by purchasing Premium Tiers using KythiaCoins! Select a tier below to see its perks and pricing.\n\n${currentPremiumText}`;
	const components = await simpleContainer(interaction, contentText, {
		color: kythiaConfig.bot.color,
		footer: {
			text: 'Kythia Ecosystem • Premium',
		},
	});
	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('tier_cute')
			.setLabel(
				await interaction.client.container.t(
					interaction,
					'economy.ui.premium.cute',
				),
			)
			.setEmoji('🎀')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('tier_powerful')
			.setLabel(
				await interaction.client.container.t(
					interaction,
					'economy.ui.premium.powerful',
				),
			)
			.setEmoji('⚔️')
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId('tier_yours')
			.setLabel(
				await interaction.client.container.t(
					interaction,
					'economy.ui.premium.yours',
				),
			)
			.setEmoji('👑')
			.setStyle(ButtonStyle.Secondary),
	);
	components.push(row);
	return components;
}
async function buildPremiumDurationMenu(
	container,
	interaction,
	_selectedTier,
	tierData,
) {
	const { simpleContainer } = container.helpers.discord;
	const { formatNumber } = require('kythia-core').utils;
	const { t } = container;
	const contentText = `**${tierData.name}**\n\n${tierData.desc}\n\nSelect a duration below to see the price.`;
	const components = await simpleContainer(interaction, contentText, {
		color: tierData.color,
	});
	const durationSelect = new StringSelectMenuBuilder()
		.setCustomId('premium_duration')
		.setPlaceholder(
			await interaction.client.container.t(
				interaction,
				'economy.ui.ph_duration',
			),
		)
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
			.setLabel(await t(interaction, 'economy.helpers.premium.ui.back'))
			.setStyle(ButtonStyle.Secondary),
	);
	components.push(row1, row2);
	return components;
}
async function buildPremiumConfirmMenu(
	container,
	interaction,
	tierData,
	selectedDuration,
	price,
) {
	const { simpleContainer } = container.helpers.discord;
	const { formatNumber } = require('kythia-core').utils;
	const { t } = container;
	const contentText = `**${tierData.name} (${selectedDuration} Days)**\n\nPrice: **${formatNumber(price)} KC**\n\nAre you sure you want to purchase this?`;
	const components = await simpleContainer(interaction, contentText, {
		color: tierData.color,
	});
	const row = new ActionRowBuilder().addComponents(
		new ButtonBuilder()
			.setCustomId('confirm_buy')
			.setLabel(`Buy for ${formatNumber(price)} KC`)
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId('back_main')
			.setLabel(await t(interaction, 'economy.helpers.premium.ui.cancel'))
			.setStyle(ButtonStyle.Danger),
	);
	components.push(row);
	return components;
}
async function handlePremiumPurchase(
	container,
	interaction,
	kythiaUser,
	selectedTier,
	selectedDuration,
) {
	const { simpleContainer } = container.helpers.discord;
	const { formatNumber } = require('kythia-core').utils;
	const tierData = TIERS[selectedTier];
	const price = tierData.prices[selectedDuration];

	// Process Purchase
	const balance = await banks.getBalance(kythiaUser);
	if (balance.wallet < price && balance.bank < price) {
		const total = balance.wallet + balance.bank;
		if (total < price) {
			const components = await simpleContainer(
				interaction,
				`You don't have enough KythiaCoins! You need **${formatNumber(price)} KC** but only have **${formatNumber(total)} KC** in total.`,
				{
					color: 'Red',
				},
			);
			return interaction.update({
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
		kythiaUser.premiumTier = selectedTier;
		const expireDateVal = kythiaUser.premiumExpiresAt;
		const now = expireDateVal
			? new Date(Math.max(Date.now(), new Date(expireDateVal).getTime()))
			: new Date();
		now.setDate(now.getDate() + selectedDuration);
		kythiaUser.premiumExpiresAt = now;
		await kythiaUser.save();

		// Log Transaction
		container.logger.info(
			`[PREMIUM_PURCHASE] User ${interaction.user.id} purchased ${tierData.name} for ${selectedDuration} days for ${price} KC. Balance after: ${toBigIntSafe(kythiaUser.kythiaCoinWallet) + toBigIntSafe(kythiaUser.kythiaCoinBank)}`,
			{
				label: 'economy',
			},
		);
		const components = await simpleContainer(
			interaction,
			`🎉 **Payment Successful!**\n\nYou are now subscribed to **${tierData.name}** for **${selectedDuration} Days**!\nYour Premium features have been unlocked globally.`,
			{
				color: '#57F287',
			},
		);
		await interaction.update({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
		return true;
	} catch (err) {
		container.logger.error(`Premium purchase error: ${err.message}`, {
			label: 'economy',
		});
		const components = await simpleContainer(
			interaction,
			'An error occurred during your transaction. Please try again or contact support.',
			{
				color: 'Red',
			},
		);
		await interaction.update({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
		return false;
	}
}
module.exports = {
	buildPremiumMainMenu,
	buildPremiumDurationMenu,
	buildPremiumConfirmMenu,
	handlePremiumPurchase,
};
