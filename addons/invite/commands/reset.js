/**
 * @namespace: addons/invite/commands/reset.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ResetCommand extends BaseCommand {
	subcommand = true;
	permissions = [
		PermissionFlagsBits.ManageGuild,
		PermissionFlagsBits.Administrator,
	];

	slashCommand = (subcommand) =>
		subcommand
			.setName('reset')
			.setDescription('Reset all invites for this server (Admin only)');

	async execute(interaction) {
		const container = this.container;
		const { models, helpers, t } = container;
		const { simpleContainer } = helpers.discord;
		const { Invite } = models;
		const guildId = interaction.guild.id;

		await interaction.deferReply();

		// Hapus dari DB
		await Invite.destroy({ where: { guildId } });

		const title = await t(interaction, 'invite.invite.command.title');
		const successMsg = await t(
			interaction,
			'invite.invite.command.reset.success',
		);

		const msg = `## ${title}\n${successMsg}`;
		const components = await simpleContainer(interaction, msg, {
			color: 'Red',
		});

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = ResetCommand;
