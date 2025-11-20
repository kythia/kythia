/**
 * @namespace: addons/core/commands/utils/testevent.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { createMockEventArgs } = require('@coreHelpers/events');
const { SlashCommandBuilder } = require('discord.js');

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
        )
        .addStringOption((option) =>
            option
                .setName('type')
                .setDescription('The specific scenario to test for the event (e.g., boost)')
                .setRequired(false)
                .addChoices(
                    { name: 'boost', value: 'boost' },
                    { name: 'unboost', value: 'unboost' },
                    { name: 'nickname', value: 'nickname' }
                )
        ),
    ownerOnly: true,
    async execute(interaction, container) {
        const { logger } = container;

        await interaction.deferReply({ ephemeral: true });

        const eventName = interaction.options.getString('event');
        const type = interaction.options.getString('type') || 'default';
        const { client, user } = interaction;

        logger.info(`[TEST COMMAND] Attempting to trigger '${eventName}' (type: ${type}) for ${user.tag}`);

        try {
            // 1. Minta "Tim Dapur" untuk siapkan argumennya
            const args = await createMockEventArgs(eventName, interaction, type);

            // 2. "Koki Utama" tinggal berteriak
            client.emit(eventName, ...args);

            await interaction.editReply({ content: `✅ Event \`${eventName}\` (type: \`${type}\`) emitted successfully!` });
        } catch (err) {
            logger.error(`[TEST COMMAND] Error during event simulation '${eventName}':`, err);
            await interaction.editReply({ content: `❌ Failed to emit event \`${eventName}\`: ${err.message}` });
        }
    },
};
