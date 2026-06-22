/**
 * @namespace: addons/pet/commands/admin/add.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class AddCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('add')
			.setDescription('Add a new pet')
			.addStringOption((option) =>
				option.setName('name').setDescription('Pet name').setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('icon')
					.setDescription('Icon (emoji) for the pet')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('rarity')
					.setDescription('Rarity of the pet')
					.addChoices(
						{
							name: 'Common',
							value: 'common',
						},
						{
							name: 'Rare',
							value: 'rare',
						},
						{
							name: 'Epic',
							value: 'epic',
						},
						{
							name: 'Legendary',
							value: 'legendary',
						},
					)
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('bonus_type')
					.setDescription('Bonus type (Coin or Ruby)')
					.addChoices(
						{
							name: 'Coin',
							value: 'coin',
						},
						{
							name: 'Ruby',
							value: 'ruby',
						},
					)
					.setRequired(true),
			)
			.addIntegerOption((option) =>
				option
					.setName('bonus_value')
					.setDescription('Bonus value')
					.setRequired(true),
			);
	teamOnly = true;
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const { Pet } = models;
		await interaction.deferReply();
		const name = interaction.options.getString('name');
		const icon = interaction.options.getString('icon');
		const rarity = interaction.options.getString('rarity');
		const bonusType = interaction.options.getString('bonus_type');
		const bonusValue = interaction.options.getInteger('bonus_value');
		await Pet.create({
			name,
			icon,
			rarity,
			bonusType,
			bonusValue,
		});
		const msg = await t(
			interaction,
			'pet.commands.admin.add.add.success.msg_md',
			{
				name,
			},
		);
		const components = await simpleContainer(interaction, msg, {
			color: kythiaConfig.bot.color,
		});
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = AddCommand;
