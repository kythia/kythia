/**
 * @namespace: addons/pet/commands/sell.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class SellCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand.setName('sell').setDescription('Sell your pet!');
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { User, UserPet, Pet } = models;
		await interaction.deferReply();
		const userId = interaction.user.id;
		const user = await User.getCache({
			userId,
			guildId: interaction.guild.id,
		});
		const userPet = await UserPet.getCache({
			where: {
				userId: userId,
			},
			include: [
				{
					model: Pet,
					as: 'pet',
				},
			],
		});
		if (!userPet) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'pet.commands.sell.no.pet.title_md'),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const rarity = userPet.pet.rarity;
		const rarityValue = {
			common: 80,
			rare: 150,
			epic: 250,
			legendary: 400,
		};
		const petValue = rarityValue[rarity] * userPet.level;
		user.cash += petValue;
		await userPet.destroy();
		user.changed('cash', true);
		await user.save();
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'pet.commands.sell.success.title_md', {
				value: petValue,
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
exports.default = SellCommand;
