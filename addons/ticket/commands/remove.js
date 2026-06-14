/**
 * @namespace: addons/ticket/commands/remove.js
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
			.setDescription('Remove a user from the ticket channel')
			.addUserOption((option) =>
				option
					.setName('user')
					.setDescription('User to remove')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
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
	}
}

exports.default = RemoveCommand;
