/**
 * @namespace: addons/image/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ImageCommand extends BaseCommand {
	guildOnly = false;

	voteLocked = true;

	slashCommand = new SlashCommandBuilder()
		.setName('image')
		.setDescription('Manage images in the storage');
}

exports.default = ImageCommand;
