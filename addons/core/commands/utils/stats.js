/**
 * @namespace: addons/core/commands/utils/stats.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const {
    version,
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    MediaGalleryItemBuilder,
    MediaGalleryBuilder,
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

function getKythiaCoreVersion() {
    try {
        const corePkgPath = require.resolve('kythia-core/package.json');
        const pkg = JSON.parse(fs.readFileSync(corePkgPath, 'utf8'));
        return pkg.version;
    } catch {
        try {
            const mainPkgPath = path.join(process.cwd(), 'package.json');
            if (fs.existsSync(mainPkgPath)) {
                const mainPkg = JSON.parse(fs.readFileSync(mainPkgPath, 'utf8'));
                return (
                    (mainPkg.dependencies && mainPkg.dependencies['kythia-core']) ||
                    (mainPkg.devDependencies && mainPkg.devDependencies['kythia-core']) ||
                    null
                );
            }
        } catch {}
    }
    return null;
}

function getGitCommitId() {
    if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.substring(0, 7);
    if (process.env.COMMIT_SHA) return process.env.COMMIT_SHA.substring(0, 7);

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
    } catch (e) {}
    return undefined;
}

module.exports = {
    aliases: ['s', '📊'],
    data: new SlashCommandBuilder().setName('stats').setDescription(`📊 Displays kythia statistics.`),
    async execute(interaction, container) {
        const { t, kythiaConfig, helpers, models } = container;
        const { formatDuration } = helpers.time;
        const { embedFooter } = helpers.discord;
        const { convertColor } = helpers.color;

        const anyModelKey = models ? Object.keys(models)[0] : undefined;
        const KythiaModel = anyModelKey ? Object.getPrototypeOf(models[anyModelKey]) : null;

        let cacheStatus = 'N/A';
        let cacheHits = 0;
        let cacheMisses = 0;

        if (KythiaModel) {
            const stats = KythiaModel.cacheStats;
            cacheHits = (stats.redisHits || 0) + (stats.mapHits || 0);
            cacheMisses = stats.misses || 0;

            const urls = KythiaModel._redisFallbackURLs || [];
            const currentIndex = KythiaModel._redisCurrentIndex || 0;

            if (KythiaModel.isRedisConnected) {
                if (urls.length > 1) {
                    let statusList = [];
                    urls.forEach((url, index) => {
                        let name = `Kythia Redis #${index + 1}`;

                        if (index === currentIndex) {
                            statusList.push(`✅ **${name} (Active)**`);
                        } else if (KythiaModel._redisFailedIndexes.has(index)) {
                            statusList.push(`❌ ${name} (Failed)`);
                        } else {
                            statusList.push(`⚪ ${name} (Standby)`);
                        }
                    });
                    cacheStatus = statusList.join('\n');
                } else {
                    cacheStatus = '> \`✅\` **Kythia Redis (Online)**';
                }
            } else if (!KythiaModel.isShardMode) {
                cacheStatus = '> \`⚠️\` **In-Memory (Fallback)**';
            } else {
                cacheStatus = '> \`❌\` **DISABLED (Sharding)**';
            }
        }

        const { client } = interaction;

        const username = interaction.client.user.username;
        const uptime = await formatDuration(client.uptime, interaction);
        const memory = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const guilds = client.guilds.cache.size;
        const users = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
        let runtimeDisplay;
        if (process.versions.bun) {
            runtimeDisplay = `**Bun:** \`${process.versions.bun}\``;
        } else if (process.versions.deno) {
            runtimeDisplay = `**Deno:** \`${process.versions.deno}\``;
        } else {
            runtimeDisplay = `**Node.js:** \`${process.version}\``;
        }
        const djs = version;
        const cpu = os.cpus()[0].model;

        const botLatency = Math.max(0, Date.now() - interaction.createdTimestamp);
        const apiLatency = Math.round(client.ws.ping);
        const owner = `${kythiaConfig.owner.names} (${kythiaConfig.owner.ids})`;
        const kythiaVersion = kythiaConfig.version;
        const kythiaCoreVersion = getKythiaCoreVersion() || 'N/A';
        const githubCommit = getGitCommitId();

        const desc = await t(interaction, 'core.utils.stats.embed.desc', {
            username,
            uptime,
            memory,
            guilds,
            users,
            runtime: runtimeDisplay,
            djs,
            cpu,
            botLatency,
            apiLatency,
            owner,
            kythiaVersion,
            kythiaCoreVersion,
            githubCommit: githubCommit || 'N/A',

            cacheStatus: cacheStatus,
            cacheHits: cacheHits,
            cacheMisses: cacheMisses,
        });

        const bannerUrl = kythiaConfig.settings.statsBannerImage;

        const mainContainer = new ContainerBuilder().setAccentColor(convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }));

        if (bannerUrl) {
            mainContainer.addMediaGalleryComponents(new MediaGalleryBuilder().addItems([new MediaGalleryItemBuilder().setURL(bannerUrl)]));

            mainContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
        }

        mainContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(desc));

        mainContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

        const footerText = await t(interaction, 'common.container.footer', { username: interaction.client.user.username });
        mainContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(`${footerText}`));

        await interaction.reply({
            components: [mainContainer],
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
        });
    },
};
