/**
 * @namespace: addons/server/commands/server/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	InteractionContextType,
	PermissionFlagsBits,
	SlashCommandBuilder,
} = require('discord.js');

const { EMBEDDED } = require('../../helpers/server');

const { BaseCommand } = require('kythia-core');

class CommandsCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('server')
		.setDescription('⚙️ Discord server management tools')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

	aliases = ['srv'];
	guildOnly = true;
	voteLocked = true;
	permissions = PermissionFlagsBits.ManageGuild;

	botPermissions = [
		PermissionFlagsBits.ManageGuild,
		PermissionFlagsBits.ManageChannels,
		PermissionFlagsBits.ManageRoles,
	];

	autocomplete(interaction) {
		const sub = interaction.options.getSubcommand();
		const focused = interaction.options.getFocused();

		if (
			sub === 'autobuild' &&
			interaction.options.getFocused(true)?.name === 'template'
		) {
			const embeddedTemplates = Object.entries(EMBEDDED)
				.map(([key, tpl]) => {
					const name = tpl?.meta?.display
						? `${tpl.meta.display} (${key})`
						: key;
					return {
						name: name.slice(0, 100),
						value: key.slice(0, 100),
					};
				})
				.filter(
					(tpl) =>
						tpl.name.toLowerCase().includes(focused.toLowerCase()) ||
						tpl.value.toLowerCase().includes(focused.toLowerCase()),
				)
				.slice(0, 25);
			return interaction.respond(embeddedTemplates);
		}

		return interaction.respond([]);
	}
}

exports.default = CommandsCommand;
