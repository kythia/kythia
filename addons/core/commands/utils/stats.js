/**
 * @namespace: addons/core/commands/utils/stats.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */
const { EmbedBuilder, version, MessageFlags } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const { t } = require('@utils/translator');
const { formatDuration } = require('@utils/time');
const { embedFooter } = require('@utils/discord');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getGitCommitId() {
    // Try to get commit id from environment variable (e.g., set by CI/CD)
    if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.substring(0, 7);
    if (process.env.COMMIT_SHA) return process.env.COMMIT_SHA.substring(0, 7);
    // Try to read from .git/HEAD and refs
    try {
        const gitHeadPath = path.join(process.cwd(), '.git', 'HEAD');
        if (fs.existsSync(gitHeadPath)) {
            const head = fs.readFileSync(gitHeadPath, 'utf8').trim();
            if (head.startsWith('ref:')) {
                const refPath = head.split(' ')[1];
                const refFullPath = path.join(process.cwd(), '.git', refPath);
                if (fs.existsSync(refFullPath)) {
                    const commit = fs.readFileSync(refFullPath, 'utf8').trim();
                    return commit.substring(0, 7);
                }
            } else if (/^[0-9a-f]{40}$/i.test(head)) {
                return head.substring(0, 7);
            }
        }
    } catch (e) {
        // ignore errors, just return undefined
    }
    return undefined;
}

module.exports = {
    data: new SlashCommandBuilder().setName('stats').setDescription(`📊 Displays ${kythia.bot.name} statistics.`),
    async execute(interaction) {
        const { client } = interaction;

        const username = interaction.client.user.username;
        const uptime = await formatDuration(client.uptime, interaction);
        const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const guilds = client.guilds.cache.size;
        const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        const node = process.version;
        const djs = version;
        const cpu = os.cpus()[0].model;

        const botLatency = Math.max(0, Date.now() - interaction.createdTimestamp);
        const apiLatency = Math.round(client.ws.ping);
        const owner = `${kythia.owner.names} (${kythia.owner.ids})`;
        const kythiaVersion = kythia.version;
        const githubCommit = getGitCommitId();

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
            githubCommit: githubCommit || 'N/A',
        });

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(desc)
            .setThumbnail(client.user.displayAvatarURL())
            .setFooter(await embedFooter(interaction));

        await interaction.reply({ content: null, embeds: [embed] });
    },
};
