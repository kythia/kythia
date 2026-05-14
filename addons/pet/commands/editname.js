/**
 * @namespace: addons/pet/commands/editname.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('editname')
			.setDescription('Edit your pet name!')
			.addStringOption((option) =>
				option.setName('name').setDescription('New pet name').setRequired(true),
			),

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
		const newName = interaction.options.getString('name');
		userPet.petName = newName;
		userPet.changed('petName', true);
		await userPet.save();

		const components = await simpleContainer(
			interaction,
			`## ${await t(interaction, 'pet.editname.success.title')}\n${await t(
				interaction,
				'pet.editname.success.desc',
				{
					icon: userPet.pet.icon,
					name: userPet.pet.name,
					rarity: userPet.pet.rarity,
					petName: userPet.petName,
				},
			)}`,
			{ color: kythiaConfig.bot.color },
		);

		return await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
