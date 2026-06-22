/**
 * @namespace: addons/ticket/commands/add.js
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
			.setDescription('Add a user to the ticket channel')
			.addUserOption((option) =>
				option.setName('user').setDescription('User to add').setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;
		const user = interaction.options.getUser('user');
		await interaction.channel.permissionOverwrites.edit(user.id, {
			ViewChannel: true,
		});
		try {
			const dmDesc = await t(interaction, 'ticket.commands.add.ticket.dm', {
				channel: `<#${interaction.channel.id}>`,
				guild: interaction.guild.name,
			});
			await user.send({
				components: await simpleContainer(interaction, dmDesc, {
					color: 'Blurple',
				}),
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (_err) {}
		const desc = await t(interaction, 'ticket.commands.add.util.add_success', {
			userTag: user.tag,
		});
		return await interaction.reply({
			components: await simpleContainer(interaction, desc, {
				color: 'Green',
			}),
			flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
		});
	}
}
exports.default = AddCommand;
