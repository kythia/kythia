/**
 * @namespace: addons/core/commands/utils/stats.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { EmbedBuilder, version } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const { t } = require('@utils/translator');
const { formatDuration } = require('@utils/time');
const { embedFooter } = require('@utils/discord');

const os = require('os');
module.exports = {
    data: new SlashCommandBuilder().setName('stats').setDescription(`📊 Displays ${kythia.bot.name} statistics.`),
    async execute(interaction) {
        try {
            const sent = await interaction.reply({ content: await t(interaction, 'core_utils_stats_fetching'), fetchReply: true });

            const { client } = interaction;

            const username = interaction.client.user.username;
            const uptime = await formatDuration(client.uptime, interaction);
            const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
            const guilds = client.guilds.cache.size;
            const users = client.users.cache.size;
            const node = process.version;
            const djs = version;
            const cpu = os.cpus()[0].model;
            const botLatency = sent.createdTimestamp - interaction.createdTimestamp - 100;
            const apiLatency = Math.round(client.ws.ping);
            const owner = `${kythia.owner.names} (${kythia.owner.ids})`;
            const kythiaVersion = kythia.version;

            const desc = await t(interaction, 'core_utils_stats_embed_desc', {
                username,
                uptime,
                memory,
                guilds,
                users,
                node,
                djs,
                cpu,
                botLatency,
                apiLatency,
                owner,
                kythiaVersion,
            });

            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(desc)
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter(await embedFooter(interaction));

            await interaction.editReply({ content: null, embeds: [embed], ephemeral: true });
        } catch (error) {
            console.error('Error during stats command execution:', error);
            // Optionally, you can add error reporting here if needed
            await interaction.editReply({ content: await t(interaction, 'core_utils_stats_error'), embeds: [], ephemeral: true });
        }
    },
};
