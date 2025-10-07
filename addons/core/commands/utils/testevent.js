/**
 * @namespace: addons/core/commands/utils/testevent.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */
const { createMockEventArgs } = require('@coreHelpers/events');
const { SlashCommandBuilder } = require('discord.js');
const logger = require('@utils/logger');

const ALL_EVENTS = [
    'messageCreate',
    'guildMemberAdd',
    'guildMemberRemove',
    'guildCreate',
    'guildDelete',
    'interactionCreate',
    'clientReady',
    'channelCreate',
    'channelDelete',
    'roleCreate',
    'roleDelete',
    'guildBanAdd',
    'guildBanRemove',
    'guildUpdate',
    'guildMemberUpdate',
    'messageUpdate',
    'messageDelete',
    'voiceStateUpdate',
    'presenceUpdate',
    'userUpdate',
    'inviteCreate',
    'inviteDelete',
    // Add more events as needed
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('testevent')
        .setDescription('🧪 Trigger a Discord event for testing purposes')
        .addStringOption((option) =>
            option
                .setName('event')
                .setDescription('The event to trigger')
                .setRequired(true)
                .addChoices(...ALL_EVENTS.map((ev) => ({ name: ev, value: ev })))
        ),
    ownerOnly: true,
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const eventName = interaction.options.getString('event');
        const { client, user } = interaction;

        logger.info(`[TEST COMMAND] Attempting to trigger '${eventName}' for ${user.tag}`);

        try {
            // 1. Minta "Tim Dapur" untuk siapkan argumennya
            const args = await createMockEventArgs(eventName, interaction);

            // 2. "Koki Utama" tinggal berteriak
            client.emit(eventName, ...args);

            await interaction.editReply({ content: `✅ Event \`${eventName}\` emitted successfully!` });
        } catch (err) {
            logger.error(`[TEST COMMAND] Error during event simulation '${eventName}':`, err);
            await interaction.editReply({ content: `❌ Failed to emit event \`${eventName}\`: ${err.message}` });
        }
    },
};
