/**
 * @namespace: addons/core/commands/utils/ping.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
} = require('discord.js');
const { t } = require('@utils/translator');
const convertColor = require('@utils/color');

// Try to get sequelize instance from global or client
function getSequelizeInstance(client) {
    // Try global first, then client property
    if (global.sequelize) return global.sequelize;
    if (client && client.sequelize) return client.sequelize;
    if (client && client.db && client.db.sequelize) return client.db.sequelize;
    return null;
}

/**
 * Get Lavalink nodes ping/latency information
 * @param {object} client - Discord client instance
 * @returns {Promise<Array>} Array of node information with ping
 */
async function getLavalinkNodesPing(client) {
    const nodes = [];

    // Check if music addon is enabled and poru client exists
    if (!client.poru || !kythia.addons.music) {
        return nodes;
    }

    // Get all connected nodes
    for (const [name, node] of client.poru.nodes) {
        try {
            // Get node stats if available
            const stats = node.stats || {};
            const ping = stats.ping || -1;
            const players = stats.players || 0;
            const isConnected = node.isConnected || false;

            nodes.push({
                name: name,
                host: node.host || 'Unknown',
                port: node.port || 2333,
                ping: ping,
                players: players,
                connected: isConnected,
                status: isConnected ? (ping > 0 ? 'operational' : 'unknown') : 'disconnected',
            });
        } catch (error) {
            nodes.push({
                name: name,
                host: node.host || 'Unknown',
                port: node.port || 2333,
                ping: -1,
                players: 0,
                connected: false,
                status: 'error',
            });
        }
    }

    return nodes;
}

/**
 * Get Sequelize DB ping/latency information
 * @param {object} client - Discord client instance
 * @returns {Promise<{ping: number, status: string, error?: string}>}
 */
async function getDbPing(client) {
    const sequelize = getSequelizeInstance(client);
    if (!sequelize) {
        return { ping: -1, status: 'not_configured' };
    }
    let ping = -1;
    let status = 'unknown';
    let errorMsg = undefined;
    try {
        const start = Date.now();
        // Use a lightweight query for ping
        await sequelize.authenticate();
        ping = Date.now() - start;
        status = 'connected';
    } catch (err) {
        status = 'error';
        errorMsg = err.message || String(err);
    }
    return { ping, status, error: errorMsg };
}

async function buildPingEmbed(interaction) {
    const botLatency = Date.now() - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    // Get Lavalink nodes ping information
    const lavalinkNodes = await getLavalinkNodesPing(interaction.client);

    // Get DB ping
    const dbPingInfo = await getDbPing(interaction.client);

    const container = new ContainerBuilder().setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }));
    container.addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'core_utils_ping_embed_title')));
    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${await t(interaction, 'core_utils_ping_field_bot_latency')}**\n\`\`\`${botLatency}ms\`\`\``)
    );
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${await t(interaction, 'core_utils_ping_field_api_latency')}**\n\`\`\`${apiLatency}ms\`\`\``)
    );

    // Add DB ping info
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `**${await t(interaction, 'core_utils_ping_field_db_latency', { defaultValue: 'Database Connection' })}**\n\`\`\`${dbPingInfo.status === 'connected' ? dbPingInfo.ping + 'ms' : dbPingInfo.status === 'not_configured' ? 'Not Configured' : dbPingInfo.status === 'error' ? 'Error' : 'Unknown'}\`\`\`` +
                (dbPingInfo.status === 'error' && dbPingInfo.error ? `\n\`\`\`Error: ${dbPingInfo.error}\`\`\`` : '')
        )
    );

    // Add Lavalink nodes information if available
    if (lavalinkNodes.length > 0) {
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**${await t(interaction, 'core_utils_ping_field_lavalink_nodes')}**`)
        );

        for (const node of lavalinkNodes) {
            const statusEmoji =
                node.status === 'operational' ? '🟢' : node.status === 'disconnected' ? '🔴' : node.status === 'error' ? '❌' : '🟡';
            const pingText = node.ping > 0 ? `${node.ping}ms` : node.connected ? '---ms' : 'Disconnected';
            const playersText = node.players > 0 ? ` (${node.players} players)` : '';

            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${statusEmoji} **${node.name}**\n\`\`\`${pingText}${playersText}\`\`\``)
            );
        }
    }

    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    container.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ping_refresh')
                .setLabel(await t(interaction, 'core_utils_ping_button_refresh'))
                .setStyle(ButtonStyle.Secondary)
        )
    );

    container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    container.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(await t(interaction, 'common_container_footer', { username: interaction.client.user.username }))
    );

    return { container, botLatency, apiLatency, lavalinkNodes, dbPingInfo };
}

module.exports = {
    data: new SlashCommandBuilder().setName('ping').setDescription("🔍 Checks the bot's, Discord API's, and database connection speed."),
    aliases: ['p', 'pong'],
    async execute(interaction) {
        // Initial reply
        // const sent = await interaction.reply({ content: await t(interaction, 'core_utils_ping_fetching'), fetchReply: true });
        // const sent = await interaction.deferReply({ fetchReply: true });

        // Build and send the embed with refresh button
        const { container, botLatency, apiLatency, lavalinkNodes, dbPingInfo } = await buildPingEmbed(interaction);

        const sent = await interaction.reply({
            content: ' ',
            components: [container],
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
        });

        // Set up collector for refresh button
        const collector = sent.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) => i.customId === 'ping_refresh',
        });

        collector.on('collect', async (i) => {
            // Recalculate latency
            const refreshed = await buildPingEmbed(i);
            await i.update({
                components: [refreshed.container],
                content: ' ',
                flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            });
        });

        return { botLatency, apiLatency, lavalinkNodes, dbPingInfo };
    },
};
