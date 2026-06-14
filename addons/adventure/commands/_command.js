/**
 * @namespace: addons/adventure/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { SlashCommandBuilder } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class AdventureCommand extends BaseCommand {
	guildOnly = false;

	slashCommand = new SlashCommandBuilder()
		.setName('adventure')
		.setNameLocalizations({
			id: 'petualangan',
			fr: 'aventure',
			ja: 'アドベンチャー',
		})
		.setDescription('⚔️ Start your adventure in RPG dimension!')
		.setDescriptionLocalizations({
			id: '⚔️ Mulai petualanganmu di dimensi RPG!',
			fr: '⚔️ Commence ton aventure dans la dimension RPG !',
			ja: '⚔️ RPGの世界で冒険を始めよう！',
		});
}

exports.default = AdventureCommand;
