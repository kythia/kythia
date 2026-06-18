/**
 * @namespace: addons/minecraft/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandBuilder } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class MinecraftCommand extends BaseCommand {
	guildOnly = false;
	slashCommand = new SlashCommandBuilder()
		.setName('minecraft')
		.setDescription('Minecraft: Java Edition player lookup commands');
}
exports.default = MinecraftCommand;
