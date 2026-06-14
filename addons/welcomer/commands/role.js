/**
 * @namespace: addons/welcomer/commands/role.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class RoleCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('role')
			.setDescription('👋 Set auto-role given to new members on join')
			.addRoleOption((option) =>
				option
					.setName('role')
					.setDescription('Role to assign on join')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { WelcomeSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [welcomeSetting] = await WelcomeSetting.getOrCreateCache({
			guildId: interaction.guild.id,
		});

		const role = interaction.options.getRole('role');
		welcomeSetting.welcomeRoleId = role.id;
		await welcomeSetting.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'welcomer.welcomer.role.set', { roleId: role.id }),
			{ color: 'Green' },
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = RoleCommand;
