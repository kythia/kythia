/**
 * @namespace: addons/core/commands/utils/ping.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
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

/**
 * Get Lavalink nodes ping/latency information
 * @param {object} client - Discord client instance
 * @returns {Promise<Array>} Array of node information with ping
 */
async function getLavalinkNodesPings(client) {
    const nodes = [];

    if (!client.poru) {
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

/**
 * Get Redis ping/latency information (HA-Aware)
 * @param {object} container - The bot's container
 * @returns {Promise<Array>} Array of node information with ping
 */
async function getRedisPings(container) {
    const { models } = container;

    const anyModelKey = models ? Object.keys(models)[0] : undefined;
    const KythiaModel = anyModelKey ? Object.getPrototypeOf(models[anyModelKey]) : null;

    if (!KythiaModel || !KythiaModel._redisFallbackURLs || KythiaModel._redisFallbackURLs.length === 0) {
        return [];
    }

    const redis = KythiaModel.redis;
    const urls = KythiaModel._redisFallbackURLs;
    const currentIndex = KythiaModel._redisCurrentIndex;
    const isConnected = KythiaModel.isRedisConnected;
    const failedIndexes = KythiaModel._redisFailedIndexes || new Set();

    let activePing = -1;
    if (isConnected && redis && typeof redis.ping === 'function') {
        try {
            const start = Date.now();
            await redis.ping();
            activePing = Date.now() - start;
        } catch (e) {
            activePing = -2;
        }
    }

    const nodes = [];
    for (const [index, url] of urls.entries()) {
        let name = `Kythia Redis #${index + 1}`;

        if (index === currentIndex) {
            if (isConnected) {
                nodes.push({ name: name, status: 'active', ping: activePing });
            } else {
                nodes.push({ name: name, status: 'failed', ping: -1 });
            }
        } else if (failedIndexes.has(index)) {
            nodes.push({ name: name, status: 'failed', ping: -1 });
        } else {
            nodes.push({ name: name, status: 'standby', ping: -1 });
        }
    }
    return nodes;
}

async function buildPingEmbed(interaction, container, initialLatencies = null) {
    const { t, kythiaConfig, helpers } = container;
    const { convertColor } = helpers.color;

    const botLatency = initialLatencies ? initialLatencies.bot : Math.max(0, Date.now() - interaction.createdTimestamp);
    const apiLatency = initialLatencies ? initialLatencies.api : Math.round(interaction.client.ws.ping);

    const [lavalinkNodes, dbPingInfo, redisNodes] = await Promise.all([
        getLavalinkNodesPings(interaction.client),
        getDbPing(container),
        getRedisPings(container),
    ]);

    const embedContainer = new ContainerBuilder().setAccentColor(convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }));

    embedContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'core.utils.ping.embed.title')));
    embedContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

    embedContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${await t(interaction, 'core.utils.ping.field.bot.latency')}**\n\`\`\`${botLatency}ms\`\`\``)
    );
    embedContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(`**${await t(interaction, 'core.utils.ping.field.api.latency')}**\n\`\`\`${apiLatency}ms\`\`\``)
    );
    embedContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            `**${await t(interaction, 'core.utils.ping.field.db.latency')}**\n\`\`\`${
                dbPingInfo.status === 'connected'
                    ? dbPingInfo.ping + 'ms'
                    : dbPingInfo.status === 'not_configured'
                      ? 'Not Configured'
                      : dbPingInfo.status === 'error'
                        ? 'Error'
                        : 'Unknown'
            }\`\`\`` + (dbPingInfo.status === 'error' && dbPingInfo.error ? `\n\`\`\`Error: ${dbPingInfo.error}\`\`\`` : '')
        )
    );

    if (redisNodes.length > 0) {
        embedContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**${await t(interaction, 'core.utils.ping.field.redis.nodes')}**`)
        );
        for (const node of redisNodes) {
            let statusEmoji = '❓';
            let pingText = 'N/A';
            if (node.status === 'active') {
                statusEmoji = '`✅`';
                if (node.ping === -2) pingText = 'Ping Failed';
                else if (node.ping === -1) pingText = 'Pinging...';
                else pingText = `${node.ping}ms`;
            } else if (node.status === 'standby') {
                statusEmoji = '`⚪`';
                pingText = 'Standby';
            } else if (node.status === 'failed') {
                statusEmoji = '`❌`';
                pingText = 'Failed';
            }
            embedContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${statusEmoji} **${node.name}**\n\`\`\`${pingText}\`\`\``)
            );
        }
    }

    if (lavalinkNodes.length > 0) {
        embedContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
        embedContainer.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`**${await t(interaction, 'core.utils.ping.field.lavalink.nodes')}**`)
        );
        for (const node of lavalinkNodes) {
            let statusEmoji = '❓';
            let pingText = 'N/A';
            if (node.status === 'operational') {
                statusEmoji = '`🟢`';
                pingText = `${node.ping}ms`;
            } else if (node.status === 'no_stats') {
                statusEmoji = '`🟡`';
                pingText = 'Stats OK, Ping Data Missing';
            } else if (node.status === 'disconnected') {
                statusEmoji = '`🔴`';
                pingText = 'Disconnected';
            } else if (node.status === 'error') {
                statusEmoji = '`❌`';
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
                .setLabel(await t(interaction, 'core.utils.ping.button.refresh'))
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(false)
        )
    );
    embedContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
    embedContainer.addTextDisplayComponents(
        new TextDisplayBuilder().setContent(
            await t(interaction, 'common.container.footer', {
                username: interaction.client.user.username,
            })
        )
    );

    return { embedContainer, botLatency, apiLatency, lavalinkNodes, dbPingInfo, redisNodes };
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription("🔍 Checks the bot's, Discord API's, database and cache/redis connection speed."),
    aliases: ['p', 'pong', '🏓'],
    async execute(interaction, container) {
        const { t, kythiaConfig, helpers } = container;
        const { convertColor } = helpers.color;

        const botLatency = Math.max(0, Date.now() - interaction.createdTimestamp);
        const apiLatency = Math.round(interaction.client.ws.ping);

        const loadingEmbed = new ContainerBuilder()
            .setAccentColor(convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'core.utils.ping.embed.title')))
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `**${await t(interaction, 'core.utils.ping.field.bot.latency')}**\n\`\`\`${botLatency}ms\`\`\``
                )
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `**${await t(interaction, 'core.utils.ping.field.api.latency')}**\n\`\`\`${apiLatency}ms\`\`\``
                )
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'core.utils.ping.loading')))
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addActionRowComponents(
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId('ping_refresh')
                        .setLabel(await t(interaction, 'core.utils.ping.button.refresh'))
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(true)
                )
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    await t(interaction, 'common.container.footer', {
                        username: interaction.client.user.username,
                    })
                )
            );

        const sent = await interaction.reply({
            content: ' ',
            components: [loadingEmbed],
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            fetchReply: true,
        });

        const { embedContainer } = await buildPingEmbed(interaction, container, {
            bot: botLatency,
            api: apiLatency,
        });

        await interaction.editReply({
            components: [embedContainer],
        });

        const collector = sent.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) => i.customId === 'ping_refresh',
        });

        collector.on('collect', async (i) => {
            const botLatency = Math.max(0, Date.now() - i.createdTimestamp);
            const apiLatency = Math.round(i.client.ws.ping);

            await i.deferUpdate();

            const refreshed = await buildPingEmbed(i, container, {
                bot: botLatency,
                api: apiLatency,
            });

            await i.editReply({
                components: [refreshed.embedContainer],
            });
        });

        return { botLatency, apiLatency };
    },
};
