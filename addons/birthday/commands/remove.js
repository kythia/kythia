/**
 * @namespace: addons/birthday/commands/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class RemoveCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('🗑️ Remove your birthday information.');

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { UserBirthday } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const birthDay = await UserBirthday.getCache({
			guildId: interaction.guild.id,
			userId: interaction.user.id,
		});

		if (!birthDay) {
			const msg = await t(interaction, 'birthday.remove.error.not_found');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		await birthDay.destroy();
		const msg = await t(interaction, 'birthday.remove.success');
		const components = await simpleContainer(interaction, msg);
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = RemoveCommand;
