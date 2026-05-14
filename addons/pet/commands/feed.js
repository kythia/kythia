/**
 * @namespace: addons/pet/commands/feed.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */
const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand.setName('feed').setDescription('Feed your pet!'),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { Pet, UserPet, Inventory } = models;

		await interaction.deferReply();

		const userId = interaction.user.id;
		const userPet = await UserPet.getCache({
			where: {
				userId: userId,
			},
			include: [{ model: Pet, as: 'pet' }],
		});

		if (!userPet) {
			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'pet.feed.no.pet.title')}\n${await t(interaction, 'pet.feed.no.pet.desc')}`,
				{ color: 'Red' }, // 0xed4245 is Red
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (userPet.isDead) {
			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'pet.feed.dead.title')}\n${await t(interaction, 'pet.feed.dead.desc')}`,
				{ color: 'Red' }, // 0xed4245 is Red
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const petFood = await Inventory.getCache({
			userId: userId,
			itemName: '🍪 Pet Food',
		});
		if (!petFood) {
			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'pet.feed.no.food.title')}\n${await t(interaction, 'pet.feed.no.food.desc')}`,
				{ color: 'Red' }, // 0xed4245 is Red
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		await petFood.destroy();
		userPet.hunger = Math.min(userPet.hunger + 20, 100);
		userPet.changed('hunger', true);
		await userPet.save();

		// Check if hunger exceeds the maximum limit
		if (userPet.hunger >= 100) {
			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'pet.feed.full.title')}\n${await t(interaction, 'pet.feed.full.desc')}`,
				{ color: '#57f287' }, // 0x57f287
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const components = await simpleContainer(
			interaction,
			`## ${await t(interaction, 'pet.feed.success.title')}\n${await t(
				interaction,
				'pet.feed.success.desc',
				{
					icon: userPet.pet.icon,
					name: userPet.pet.name,
					rarity: userPet.pet.rarity,
					hunger: userPet.hunger,
				},
			)}`,
			{ color: kythiaConfig.bot.color },
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
