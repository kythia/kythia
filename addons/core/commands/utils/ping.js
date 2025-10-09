/**
 * @namespace: addons/core/commands/utils/ping.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
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

/**
 * Get Lavalink nodes ping/latency information
 * @param {object} client - Discord client instance
 * @returns {Promise<Array>} Array of node information with ping
 */
async function getLavalinkNodesPing(client) {
    const nodes = [];

    if (!client.poru || !kythia.addons.music) {
        return nodes;
    }

    for (const [name, node] of client.poru.nodes.entries()) {
        try {
            const stats = node.stats || {};
            const isConnected = node.isConnected || false;
            let ping = isConnected ? (stats.ping ?? -1) : -1;
            const players = stats.players || 0;

            if (isConnected && ping === -1) {
                const host = node.options?.host;
                const port = node.options?.port;
                const password = node.options?.password;
                const secure = node.options?.secure;

                if (host && port && password) {
                    try {
                        const url = `http${secure ? 's' : ''}://${host}:${port}/version`;
                        const startTime = Date.now();

                        const res = await fetch(url, {
                            headers: { Authorization: password },
                        });

                        if (res.ok) {
                            ping = Date.now() - startTime;
                        }
                    } catch (fetchError) {}
                }
            }

            nodes.push({
                name: name,
                host: node.options?.host || 'Unknown',
                port: node.options?.port || 2333,
                ping: ping,
                players: players,
                connected: isConnected,
                status: isConnected ? (ping !== -1 ? 'operational' : 'no_stats') : 'disconnected',
            });
        } catch (error) {
            nodes.push({
                name: name,
                host: node.options?.host || 'Unknown',
                port: node.options?.port || 2333,
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
 * @param {object} container - The bot's container
 * @returns {Promise<{ping: number, status: string, error?: string}>}
 */
async function getDbPing(container) {
    const { sequelize } = container;
    if (!sequelize) {
        return { ping: -1, status: 'not_configured' };
    }
    let ping = -1;
    let status = 'unknown';
    let errorMsg = undefined;
    try {
        const start = Date.now();
        await sequelize.authenticate();
        ping = Date.now() - start;
        status = 'connected';
    } catch (err) {
        status = 'error';
        errorMsg = err.message || String(err);
    }
    return { ping, status, error: errorMsg };
}

async function buildPingEmbed(interaction, container) {
    const botLatency = Math.max(0, Date.now() - interaction.createdTimestamp);
    const apiLatency = Math.round(interaction.client.ws.ping);
    const lavalinkNodes = await getLavalinkNodesPing(interaction.client);
    const dbPingInfo = await getDbPing(container);

    const embedContainer = new ContainerBuilder().setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }));

    embedContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'core_utils_ping_embed_title')));
    embedContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

    embedContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${await t(interaction, 'core_utils_ping_field_bot_latency')}**\n\`\`\`${botLatency}ms\`\`\``)
    );
    embedContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${await t(interaction, 'core_utils_ping_field_api_latency')}**\n\`\`\`${apiLatency}ms\`\`\``)
    );
    embedContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `**${await t(interaction, 'core_utils_ping_field_db_latency')}**\n\`\`\`${dbPingInfo.status === 'connected' ? dbPingInfo.ping + 'ms' : dbPingInfo.status === 'not_configured' ? 'Not Configured' : dbPingInfo.status === 'error' ? 'Error' : 'Unknown'}\`\`\`` +
                (dbPingInfo.status === 'error' && dbPingInfo.error ? `\n\`\`\`Error: ${dbPingInfo.error}\`\`\`` : '')
        )
    );

    if (lavalinkNodes.length > 0) {
        embedContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
        embedContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**${await t(interaction, 'core_utils_ping_field_lavalink_nodes')}**`)
        );

        for (const node of lavalinkNodes) {
            let statusEmoji = '❓';
            let pingText = 'N/A';

            if (node.status === 'operational') {
                statusEmoji = '🟢';
                pingText = `${node.ping}ms`;
            } else if (node.status === 'no_stats') {
                statusEmoji = '🟡';
                pingText = 'Stats OK, Ping Data Missing';
            } else if (node.status === 'disconnected') {
                statusEmoji = '🔴';
                pingText = 'Disconnected';
            } else if (node.status === 'error') {
                statusEmoji = '❌';
                pingText = 'Error';
            }

            const playersText = node.players > 0 ? ` (${node.players} players)` : '';

            embedContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${statusEmoji} **${node.name}**\n\`\`\`${pingText}${playersText}\`\`\``)
            );
        }
    }

    embedContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    embedContainer.addActionRowComponents(
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('ping_refresh')
                .setLabel(await t(interaction, 'core_utils_ping_button_refresh'))
                .setStyle(ButtonStyle.Secondary)
        )
    );
    embedContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    embedContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(await t(interaction, 'common_container_footer', { username: interaction.client.user.username }))
    );

    return { embedContainer, botLatency, apiLatency, lavalinkNodes, dbPingInfo };
}

module.exports = {
    data: new SlashCommandBuilder().setName('ping').setDescription("🔍 Checks the bot's, Discord API's, and database connection speed."),
    aliases: ['p', 'pong'],
    async execute(interaction, container) {
        const { embedContainer, botLatency, apiLatency } = await buildPingEmbed(interaction, container);

        const sent = await interaction.reply({
            content: ' ',
            components: [embedContainer],
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            fetchReply: true,
        });

        const collector = sent.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) => i.customId === 'ping_refresh',
        });

        collector.on('collect', async (i) => {
            const refreshed = await buildPingEmbed(i, container);
            await i.update({
                components: [refreshed.embedContainer],
                content: ' ',
                flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            });
        });

        return { botLatency, apiLatency };
    },
};
