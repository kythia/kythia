/**
 * @namespace: addons/core/commands/utils/cache.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('cache').setDescription('Shows cache statistics.'),

    async execute(interaction, container) {
        const { t, kythiaConfig, helpers, models } = container;
        const { embedFooter } = helpers.discord;

        const anyModelKey = models ? Object.keys(models)[0] : undefined;
        const KythiaModel = anyModelKey ? Object.getPrototypeOf(models[anyModelKey]) : null;

        if (!KythiaModel || !KythiaModel.cacheStats) {
            await interaction.reply({
                content: '❌ No cache stats are available for this model.',
                ephemeral: true,
            });
            return;
        }

        const stats = KythiaModel.cacheStats;
        const urls = KythiaModel._redisFallbackURLs || [];
        const currentIndex = KythiaModel._redisCurrentIndex || 0;

        let cacheStatus;
        if (KythiaModel.isRedisConnected) {
            if (urls.length > 1) {
                let statusList = [];
                urls.forEach((url, index) => {
                    let name = `Kythia Redis #${index + 1}`;
                    if (index === currentIndex) {
                        statusList.push(`✅ **${name} (Active)**`);
                    } else if (KythiaModel._redisFailedIndexes && KythiaModel._redisFailedIndexes.has(index)) {
                        statusList.push(`❌ ${name} (Failed)`);
                    } else {
                        statusList.push(`⚪ ${name} (Standby)`);
                    }
                });
                cacheStatus = statusList.join('\n');
            } else {
                cacheStatus = '### `✅` **Kythia Redis (Online)**';
            }
        } else if (!KythiaModel.isShardMode) {
            cacheStatus = '### `⚠️` **In-Memory (Fallback)**';
        } else {
            cacheStatus = '### `❌` **DISABLED (Sharding)**';
        }

        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setDescription(`## 📊 Cache Engine Statistics\n` + cacheStatus)
            .addFields(
                { name: 'Redis Hits', value: `\`\`\`\n${String(stats.redisHits || 0)}\n\`\`\``, inline: false },
                { name: 'In-Memory Hits', value: `\`\`\`\n${String(stats.mapHits || 0)}\n\`\`\``, inline: false },
                { name: 'Cache Misses', value: `\`\`\`\n${String(stats.misses || 0)}\n\`\`\``, inline: false },
                { name: 'Cache Sets', value: `\`\`\`\n${String(stats.sets || 0)}\n\`\`\``, inline: false },
                { name: 'Cache Clears', value: `\`\`\`\n${String(stats.clears || 0)}\n\`\`\``, inline: false }
            )
            .setFooter(await embedFooter(interaction));

        await interaction.reply({ embeds: [embed] });
    },
};
