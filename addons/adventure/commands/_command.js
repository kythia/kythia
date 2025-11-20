/**
 * @namespace: addons/adventure/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    guildOnly: false,
    data: new SlashCommandBuilder()
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
        }),
};
