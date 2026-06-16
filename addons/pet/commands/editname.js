/**
 * @namespace: addons/pet/commands/editname.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class EditnameCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('editname')
			.setDescription('Edit your pet name!')
			.addStringOption((option) =>
				option.setName('name').setDescription('New pet name').setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
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
				await t(interaction, 'pet.error.not_found', {
					user: interaction.user.id,
				}),
				{ color: 'Red' },
			);
			return await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const newName = interaction.options.getString('name');
		userPet.petName = newName;
		userPet.changed('petName', true);
		await userPet.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'pet.editname.success.msg_md', {
				icon: userPet.pet.icon,
				name: userPet.pet.name,
				rarity: userPet.pet.rarity,
				petName: userPet.petName,
			}),
			{ color: kythiaConfig.bot.color },
		);

		return await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = EditnameCommand;
