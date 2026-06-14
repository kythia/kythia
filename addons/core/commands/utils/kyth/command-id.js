/**
 * @namespace: addons/core/commands/utils/kyth/command-id.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class CommandIdCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('command-id')
			.setDescription("🔍 Find a command's ID and generate its mention.")
			.addStringOption((option) =>
				option
					.setName('name')
					.setDescription('The name of the command to look up')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, helpers } = container;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const input = interaction.options.getString('name');
		const parts = input.trim().split(/\s+/);
		const commandName = parts[0];

		await interaction.client.application.commands.fetch();
		const cmd = interaction.client.application.commands.cache.find(
			(c) => c.name === commandName,
		);

		if (!cmd) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.utils.commandid.not.found', {
					commandName,
				}),
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const mention = `</${parts.join(' ')}:${cmd.id}>`;
		return interaction.editReply({
			content: await t(interaction, 'core.utils.commandid.success', {
				commandId: cmd.id,
				mention,
			}),
		});
	}
}

exports.default = CommandIdCommand;
