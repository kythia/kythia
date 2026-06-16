const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');

/**
 * @namespace: addons/economy/commands/guild_stock/create.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

// Hardcoded listing requirements
const {
	LISTING_FEE_KYTH,
	REQUIRED_MEMBERS,
} = require('../../helpers/constants');

class CreateCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('create')
			.setDescription(
				"🚀 (Owner) Launch your server's local stock market via ICO.",
			)
			.addStringOption((option) =>
				option
					.setName('ticker')
					.setDescription('Max 4-letter symbol for your stock (e.g. MEME)')
					.setRequired(true),
			)
			.addNumberOption((option) =>
				option
					.setName('initial_kyth')
					.setDescription('Initial KYTH liquidity to deposit into the pool')
					.setRequired(true)
					.setMinValue(10),
			)
			.addNumberOption((option) =>
				option
					.setName('initial_supply')
					.setDescription('Initial supply of your Guild Token to deposit')
					.setRequired(true)
					.setMinValue(100),
			);

	userPermissions = ['Administrator'];

	async execute(interaction) {
		const container = this.container;
		await interaction.deferReply();
		const { t, models, helpers, kythiaConfig, logger } = container;
		const { KythiaUser, GuildTokenHolding, GuildLiquidityPool } = models;
		const { simpleContainer } = helpers.discord;
		const guildId = interaction.guild.id;
		const userId = interaction.user.id;

		// 1. Check requirements
		if (interaction.guild.memberCount < REQUIRED_MEMBERS) {
			const msg = await t(
				interaction,
				'economy.guild_stock.create.error.members',
				{ required: REQUIRED_MEMBERS, current: interaction.guild.memberCount },
			);
			const components = await simpleContainer(
				interaction,
				`## ❌ Listing Failed\n${msg}`,
				{ color: kythiaConfig.bot.color },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const ticker = interaction.options
			.getString('ticker')
			.toUpperCase()
			.replace(/[^A-Z]/g, '');
		if (ticker.length < 2 || ticker.length > 4) {
			const msg = await t(
				interaction,
				'economy.guild_stock.create.error.ticker',
			);
			const components = await simpleContainer(
				interaction,
				`## ❌ Invalid Ticker\n${msg}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// 2. Check if a pool already exists for this guild
		const existingPool = await GuildLiquidityPool.getCache({
			where: { guildId },
		});
		if (existingPool) {
			const msg = await t(
				interaction,
				'economy.guild_stock.create.error.exists',
				{ ticker: existingPool.ticker },
			);
			const components = await simpleContainer(
				interaction,
				`## ❌ Already Listed\n${msg}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// 3. Check if ticker is already taken globally
		const takenTicker = await GuildLiquidityPool.getCache({
			where: { ticker },
		});
		if (takenTicker) {
			const msg = await t(
				interaction,
				'economy.guild_stock.create.error.taken',
				{ ticker },
			);
			const components = await simpleContainer(
				interaction,
				`## ❌ Ticker Taken\n${msg}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const initialKyth = interaction.options.getNumber('initial_kyth');
		const initialSupply = interaction.options.getNumber('initial_supply');
		const totalCost = LISTING_FEE_KYTH + initialKyth;

		// 4. Check owner's KYTH balance
		const [userEco] = await KythiaUser.findOrCreateCache({
			where: { userId },
			defaults: { userId },
		});

		if ((userEco.kythHolding || 0) < totalCost) {
			const msg = await t(
				interaction,
				'economy.guild_stock.create.error.funds',
				{
					totalCost,
					fee: LISTING_FEE_KYTH,
					liquidity: initialKyth,
					balance: userEco.kythHolding || 0,
				},
			);
			const components = await simpleContainer(
				interaction,
				`## ❌ Insufficient Funds\n${msg}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// 5. Execute creation
		try {
			// Deduct cost
			userEco.kythHolding -= totalCost;
			await userEco.save();

			// Add a small amount of the token to the owner's balance as a founder reward (10% of initial supply)
			const founderReward = initialSupply * 0.1;

			// Create Pool
			await GuildLiquidityPool.create({
				guildId,
				ticker,
				kythReserve: initialKyth,
				tokenReserve: initialSupply,
				kConstant: initialKyth * initialSupply,
			});

			// Give owner the founder reward
			await GuildTokenHolding.create({
				userId,
				guildId,
				balance: founderReward,
			});

			const initialPrice = (initialKyth / initialSupply).toFixed(4);

			const title = await t(
				interaction,
				'economy.guild_stock.create.success.title',
				{ ticker },
			);
			const desc = await t(
				interaction,
				'economy.guild_stock.create.success.desc',
				{ guildName: interaction.guild.name },
			);
			const priceText = await t(
				interaction,
				'economy.guild_stock.create.success.price',
				{ ticker, price: initialPrice },
			);
			const liquidityText = await t(
				interaction,
				'economy.guild_stock.create.success.liquidity',
				{ liquidity: initialKyth },
			);
			const supplyText = await t(
				interaction,
				'economy.guild_stock.create.success.supply',
				{ supply: initialSupply, ticker },
			);
			const footer = await t(
				interaction,
				'economy.guild_stock.create.success.footer',
				{ fee: LISTING_FEE_KYTH, reward: founderReward, ticker },
			);

			const fullText = `## ${title}\n${desc}\n\n**Initial Price:** ${priceText}\n**Initial Liquidity:** ${liquidityText}\n**Initial Supply:** ${supplyText}\n\n> ${footer}`;
			const components = await simpleContainer(interaction, fullText, {
				color: 'Green',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Failed to create guild stock: ${error.message}`, {
				label: 'economy:guild_stock:create',
			});
			const msg = await t(interaction, 'economy.guild_stock.create.error.db');
			const components = await simpleContainer(
				interaction,
				`## ❌ Database Error\n${msg}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = CreateCommand;
