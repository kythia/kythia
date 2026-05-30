/**
 * @namespace: addons/invite/commands/reset.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { PermissionFlagsBits, MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('reset')
			.setDescription('Reset all invites for this server (Admin only)'),
	permissions: [
		PermissionFlagsBits.ManageGuild,
		PermissionFlagsBits.Administrator,
	],

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, helpers, t } = container;
		const { simpleContainer } = helpers.discord;
		const { Invite } = models;
		const guildId = interaction.guild.id;

		await interaction.deferReply();

		// 🛡️ Permission Check
		if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
			const title = await t(interaction, 'invite.invite.command.title');
			const msg = await t(interaction, 'invite.invite.command.no.permission');
			const components = await simpleContainer(
				interaction,
				`## ${title}\n${msg}`,
				{
					color: 'Red',
				},
			);
			return interaction.editReply({ components });
		}

		// Hapus dari DB
		await Invite.destroy({ where: { guildId } });

		// 🔥 Hapus Cache Manual karena destroy via where biasanya gak trigger hook single instance
		// atau gunakan method clearCache kamu
		if (Invite.isRedisConnected) {
			// Invalidate tag leaderboard guild ini
			await Invite.invalidateByTags([`Invite:leaderboard:${guildId}`]);
		} else {
			await Invite.clearCache(`Invite:leaderboard:${guildId}`);
		}

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
	},
};
