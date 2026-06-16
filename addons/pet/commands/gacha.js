/**
 * @namespace: addons/pet/commands/gacha.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { checkCooldown } = require('@coreHelpers/time');
const { MessageFlags } = require('discord.js');
const { Op } = require('sequelize');

const { BaseCommand } = require('kythia-core');

class GachaCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand.setName('gacha').setDescription('Gacha your pet!');

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { User, UserPet, Pet } = models;

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
				await t(interaction, 'pet.gacha.no.pet.msg_md'),
				{ color: kythiaConfig.bot.color },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const cooldown = checkCooldown(
			userPet.lastGacha,
			kythiaConfig.addons.pet.gachaCooldown || 86400,
			interaction,
		); // Default to 24 hours
		if (cooldown.remaining) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'pet.gacha.cooldown.msg_md', {
					time: cooldown.time,
				}),
				{ color: kythiaConfig.bot.color },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const pet = await Pet.getCache({ id: userPet.petId });
		const rarity = pet.rarity;

		const rarityChance = {
			common: 0.9, // 90% chance for same rarity
			rare: 0.75, // 75% chance for same rarity
			epic: 0.5, // 50% chance for same rarity
			legendary: 0.1, // 10% chance for same rarity
		};
		const random = Math.random();
		// Determine the rarity of the new pet
		const selectedRarity =
			random < rarityChance[rarity]
				? rarity
				: random < rarityChance[rarity] + 0.1
					? getHigherRarity(rarity)
					: rarity;

		// Get the new pet based on the rarity
		const selectedPet = await Pet.getCache({
			rarity: selectedRarity,
			id: { [Op.ne]: userPet.petId }, // Exclude current pet
			order: User.sequelize.random(), // Randomize to select one from the rarity pool
		});

		// Calculate the new pet level as 40% of the previous pet's level
		const newLevel = Math.floor(userPet.level * 0.4);

		// Set lastGacha to now
		const now = new Date();

		// Delete the old pet and create the new one (register lastGacha)
		const petName = `${userPet.petName}`;
		await userPet.destroy();
		await UserPet.create({
			userId,
			petId: selectedPet.id,
			petName: petName,
			level: newLevel,
			lastGacha: now,
		});

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'pet.gacha.success.msg_md', {
				icon: selectedPet.icon,
				name: selectedPet.name,
				rarity: selectedPet.rarity,
				level: newLevel,
			}),
			{ color: kythiaConfig.bot.color },
		);

		return await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});

		// Helper function to get a higher rarity
		function getHigherRarity(currentRarity) {
			switch (currentRarity) {
				case 'common':
					return 'rare';
				case 'rare':
					return 'epic';
				case 'epic':
					return 'legendary';
				default:
					return currentRarity;
			}
		}
	}
}

exports.default = GachaCommand;
