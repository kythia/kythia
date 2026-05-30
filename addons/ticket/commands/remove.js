/**
 * @namespace: addons/ticket/commands/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('Remove a user from the ticket channel')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('User to remove')
					.setRequired(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;

		const user = interaction.options.getUser('user');
		await interaction.channel.permissionOverwrites.edit(user.id, {
			ViewChannel: false,
		});

		const desc = await t(interaction, 'ticket.util.remove_success', {
			userTag: user.tag,
		});
		return await interaction.reply({
			components: await simpleContainer(interaction, desc, { color: 'Green' }),
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	},
};
