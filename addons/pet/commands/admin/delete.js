/**
 * @namespace: addons/pet/commands/admin/delete.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class DeleteCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('delete')
			.setDescription('Delete a pet from the system')
			.addStringOption((option) =>
				option
					.setName('name')
					.setDescription('Name of the pet to delete')
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
		const deleted = await Pet.destroy({ where: { name } });
		if (deleted) {
			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'pet.admin.delete.delete.success.title')}\n${await t(interaction, 'pet.admin.delete.delete.success.desc', { name })}`,
				{ color: kythiaConfig.bot.color },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			const components = await simpleContainer(
				interaction,
				`## ${await t(interaction, 'pet.admin.delete.delete.notfound.title')}\n${await t(interaction, 'pet.admin.delete.delete.notfound.desc')}`,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = DeleteCommand;
