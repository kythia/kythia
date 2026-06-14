/**
 * @namespace: addons/core/commands/utils/kyth/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	PermissionFlagsBits,
	SlashCommandBuilder,
	InteractionContextType,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class UtilsCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('kyth')
		.setDescription('🛠️ Manage All Kythia related config')
		.setContexts(InteractionContextType.Guild)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

	ownerOnly = true;
	mainGuildOnly = true;

	async autocomplete(interaction) {
		const focusedOption = interaction.options.getFocused(true);
		if (focusedOption.name === 'guild_id') {
			const focusedValue = focusedOption.value;
			let guildList = [];

			if (interaction.client.shard) {
				const results = await interaction.client.shard.broadcastEval((c) =>
					c.guilds.cache.map((g) => ({ id: g.id, name: g.name })),
				);
				guildList = results.flat();
			} else {
				guildList = interaction.client.guilds.cache.map((g) => ({
					id: g.id,
					name: g.name,
				}));
			}

			const choices = guildList
				.filter(
					(guild) =>
						guild.name.toLowerCase().includes(focusedValue.toLowerCase()) ||
						guild.id.includes(focusedValue),
				)
				.map((guild) => ({
					name: `${guild.name} (${guild.id})`.slice(0, 100),
					value: guild.id,
				}))
				.slice(0, 25);

			await interaction.respond(choices);
		}
	}
}

exports.default = UtilsCommand;
