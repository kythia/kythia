/**
 * @namespace: addons/pet/commands/info.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */
const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand.setName('info').setDescription('View your pet info!'),
	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { UserPet, Pet } = models;
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
				`## ${await t(interaction, 'pet.info.no.pet.title')}\n${await t(interaction, 'pet.info.no.pet.desc')}`,
				{ color: kythiaConfig.bot.color },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (userPet.isDead) {
			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'pet.info.dead.title')}\n${await t(interaction, 'pet.info.dead.desc')}`,
				{ color: kythiaConfig.bot.color },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const components = await simpleContainer(
			interaction,
			`## ${await t(interaction, 'pet.info.title')}\n${await t(
				interaction,
				'pet.info.desc',
				{
					icon: userPet.pet.icon,
					name: userPet.pet.name,
					rarity: userPet.pet.rarity,
					petName: userPet.petName,
					bonusType: userPet.pet.bonusType,
					bonusValue: userPet.pet.bonusValue,
					happiness: userPet.happiness,
					hunger: userPet.hunger,
					level: userPet.level,
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
