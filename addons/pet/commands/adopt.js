/**
 * @namespace: addons/pet/commands/adopt.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class AdoptCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('adopt')
			.setDescription('Adopt a random pet')
			.addStringOption((option) =>
				option.setName('name').setDescription('Pet name').setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { KythiaUser, UserPet, Pet } = models;
		await interaction.deferReply();
		const user = await KythiaUser.getCache({
			userId: interaction.user.id,
		});
		if (!user) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'economy.shared.withdraw.no.account.desc'),
				{
					color: kythiaConfig.bot.color,
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const existingPet = await UserPet.getCache({
			where: {
				userId: interaction.user.id,
				isDead: false,
			},
		});
		if (existingPet) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'pet.commands.adopt.already.msg_md'),
				{
					color: kythiaConfig.bot.color,
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const deadPet = await UserPet.getCache({
			where: {
				userId: interaction.user.id,
				isDead: true,
			},
		});
		if (deadPet) {
			await deadPet.destroy();
		}
		const pets = await Pet.getAllCache({
			cacheTags: ['Pet:all'],
		});
		const rarities = {
			common: 50,
			rare: 25,
			epic: 20,
			legendary: 5,
		};
		const weightedPets = pets.flatMap((pet) =>
			Array(rarities[pet.rarity]).fill(pet),
		);
		const selectedPet =
			weightedPets[Math.floor(Math.random() * weightedPets.length)];
		if (!selectedPet) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'pet.commands.adopt.no.pets.msg_md'),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const name = interaction.options.getString('name');
		await UserPet.create({
			userId: interaction.user.id,
			petId: selectedPet.id,
			petName: name,
		});
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'pet.commands.adopt.success.msg_md', {
				name: selectedPet.name,
				icon: selectedPet.icon ?? '',
				rarity: selectedPet.rarity,
			}),
			{
				color: kythiaConfig.bot.color,
			},
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = AdoptCommand;
