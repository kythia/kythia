/**
 * @namespace: addons/checklist/commands/_command.js
 * @type: Command Group Definition
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const { SlashCommandBuilder, InteractionContextType } = require('discord.js');

module.exports = {
    guildOnly: true,
    data: new SlashCommandBuilder()
        .setName('checklist')
        .setDescription('📝 Create checklists for you or your server to make life easier')
        .setContexts(InteractionContextType.Guild),
};
