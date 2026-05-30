/**
 * @namespace: addons/invite/commands/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Remove invites from a user (Admin only)')
			.addUserOption((option) =>
				option.setName('user').setDescription('User').setRequired(true),
			)
			.addIntegerOption((option) =>
				option.setName('number').setDescription('Amount').setRequired(true),
			),
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

		const target = interaction.options.getUser('user');
		const number = interaction.options.getInteger('number');
		const amountToRemove = Math.abs(number);

		const [row] = await Invite.findOrCreateWithCache({
			where: { guildId, userId: target.id },
			defaults: { invites: 0, guildId, userId: target.id },
		});

		row.invites = (row.invites || 0) - amountToRemove;

		await row.save();

		const title = await t(interaction, 'invite.invite.command.title');
		const successMsg = await t(interaction, 'invite.command.remove.success', {
			amount: amountToRemove,
			user: `<@${target.id}>`,
			total: row.invites,
		});

		const msg = `## ${title}\n${successMsg}`;
		const components = await simpleContainer(interaction, msg, {
			color: 'Green',
		});

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
