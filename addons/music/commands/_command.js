/**
 * @namespace: addons/music/commands/_command.js
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

class MusicCommand extends BaseCommand {
	permissions = [
		PermissionFlagsBits.Speak,
		PermissionFlagsBits.Connect,
		PermissionFlagsBits.ViewChannel,
		PermissionFlagsBits.SendMessages,
	];
	botPermissions = [
		PermissionFlagsBits.Speak,
		PermissionFlagsBits.Connect,
		PermissionFlagsBits.SendMessages,
	];
	aliases = ['m'];

	slashCommand = new SlashCommandBuilder()
		.setName('music')
		.setDescription('🎵 Full music command suite using Lavalink')
		.setContexts(InteractionContextType.Guild);

	cooldown = 15;

	defaultArgument = 'play:search';
}

exports.default = MusicCommand;
