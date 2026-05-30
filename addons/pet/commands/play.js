/**
 * @namespace: addons/pet/commands/play.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand.setName('play').setDescription('Play with your pet!'),
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
		// Get user's pet
		const userPet = await UserPet.getCache({
			where: {
				userId: userId,
			},
			include: [{ model: Pet, as: 'pet' }],
		});
		if (!userPet) {
			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'pet.play.no.pet.title')}\n${await t(interaction, 'pet.play.no.pet.desc')}`,
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
				`## ${await t(interaction, 'pet.play.dead.title')}\n${await t(interaction, 'pet.play.dead.desc')}`,
				{ color: kythiaConfig.bot.color },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		// Update happiness level
		userPet.happiness = Math.min(userPet.happiness + 20, 100);
		userPet.changed('happiness', true);
		await userPet.save();

		const components = await simpleContainer(
			interaction,
			`## ${await t(interaction, 'pet.play.success.title')}\n${await t(
				interaction,
				'pet.play.success.desc',
				{
					icon: userPet.pet.icon,
					name: userPet.pet.name,
					rarity: userPet.pet.rarity,
					happiness: userPet.happiness,
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
