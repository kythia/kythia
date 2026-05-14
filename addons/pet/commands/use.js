/**
 * @namespace: addons/pet/commands/use.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */
const { MessageFlags } = require('discord.js');
const { checkCooldown } = require('@coreHelpers/time');
const { updatePetStatus } = require('../helpers/status');
const { toBigIntSafe } = require('@addons/economy/helpers/bigint');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand.setName('use').setDescription('Use your pet and get a bonus!'),
	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { KythiaUser, UserPet, Pet } = models;

		await interaction.deferReply();

		const userId = interaction.user.id;

		const kythiaUser = await KythiaUser.getCache({ userId });
		const userPet = await UserPet.getCache({
			where: { userId: userId, isDead: false },
			include: [{ model: Pet, as: 'pet' }],
		});

		if (!userPet) {
			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'pet.use.no.pet.title')}\n${await t(interaction, 'pet.use.no.pet.desc')}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const { pet: updatedPet, justDied } = updatePetStatus(userPet);
		await updatedPet.save();

		if (justDied) {
			try {
				await interaction.user.send(
					'Pesan duka: Pet-mu telah mati karena tidak terurus! 💀',
				);
			} catch (_e) {
				/* abaikan jika DM gagal */
			}
			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'pet.use.dead.title')}\n${await t(interaction, 'pet.use.dead.desc')}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const cooldown = checkCooldown(
			updatedPet.lastUse,
			kythiaConfig.addons.pet.useCooldown || 14400,
			interaction,
		);
		if (cooldown.remaining) {
			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'pet.use.cooldown.title')}\n${await t(interaction, 'pet.use.cooldown.desc', { time: cooldown.time })}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		updatedPet.level += 1;

		let multiplier = 1;
		if (updatedPet.level >= 30) multiplier = 5;
		else if (updatedPet.level >= 20) multiplier = 4;
		else if (updatedPet.level >= 10) multiplier = 3;
		else if (updatedPet.level >= 5) multiplier = 2;

		const bonusValue = updatedPet.pet.bonusValue * multiplier;
		let bonusTypeDisplay = '';

		if (updatedPet.pet.bonusType === 'coin') {
			kythiaUser.kythiaCoin =
				(toBigIntSafe(kythiaUser.kythiaCoin) || 0n) + toBigIntSafe(bonusValue);
			bonusTypeDisplay = 'KythiaCoin';

			kythiaUser.changed('kythiaCoin', true);
		} else if (updatedPet.pet.bonusType === 'ruby') {
			kythiaUser.kythiaRuby =
				(toBigIntSafe(kythiaUser.kythiaRuby) || 0n) + toBigIntSafe(bonusValue);
			bonusTypeDisplay = 'KythiaRuby';

			kythiaUser.changed('kythiaRuby', true);
		}

		updatedPet.lastUse = new Date();
		await updatedPet.save();

		await kythiaUser.save();

		const components = await simpleContainer(
			interaction,
			`## ${await t(interaction, 'pet.use.success.title')}\n${await t(
				interaction,
				'pet.use.success.desc',
				{
					icon: updatedPet.pet.icon,
					name: updatedPet.pet.name,
					rarity: updatedPet.pet.rarity,
					bonusType: bonusTypeDisplay,
					bonusValue: bonusValue,
					level: updatedPet.level,
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
