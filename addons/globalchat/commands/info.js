/**
 * @namespace: addons/globalchat/commands/info.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { MessageFlags, ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, SeparatorSpacingSize, MediaGalleryBuilder, MediaGalleryItemBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    subcommand: true,
    data: (subcommand) => subcommand.setName('info').setDescription('Show stats and information for the Kythia Global Chat network!'),
    async execute(interaction, container) {
        const { kythiaConfig, helpers, logger } = container;
        const { convertColor } = helpers.color;
        const apiUrl = kythiaConfig?.addons?.globalchat?.apiUrl;

        await interaction.deferReply();

        let apiStats;
        try {
            const res = await fetch(`${apiUrl}/list`, {
                headers: {
                    Authorization: `Bearer ${kythiaConfig.addons.globalchat.apiKey}`,
                },
            });
            if (!res.ok) throw new Error('API returned not ok');
            const resJson = await res.json();
            apiStats = resJson?.data;
        } catch (err) {
            logger.error('Failed to fetch globalchat stats from API:', err);

            const errorContainer = [
                new ContainerBuilder()
                    .setAccentColor(convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }))
                    .addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('❌ Gagal mengambil data statistik Global Chat dari API.')
                    ),
            ];
            return interaction.editReply({
                components: errorContainer,
                flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            });
        }

        const { count, timestamp, guildsWithWebhook, guildsWithoutWebhook } = apiStats || {};

        const components = [
            new ContainerBuilder()
                .setAccentColor(convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }))
                .addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems([new MediaGalleryItemBuilder().setURL(kythiaConfig.settings.gcBannerImage)])
                )
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 🌏 **Kythia Global Chat Information**`))
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `Connect and chat with users from different servers in real time! Kythia's Global Chat lets your community interact beyond your own server walls, making Discord even more lively and social.
・ Chat with users worldwide
・ Safe & moderated environment
・ Made possible by Tronix Development`
                    )
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`**Total Guilds:**\n\`\`\`ansi\n[1;36m${count ?? 'N/A'}[0m[1;34m joined[0m\n\`\`\``)
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `**Webhooks:**\n${guildsWithWebhook ?? 'N/A'} guilds with webhook\n${guildsWithoutWebhook ?? 'N/A'} guilds w/o webhook`
                    )
                )
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `**Last Update:**\n${timestamp ? `<t:${Math.floor(new Date(timestamp).getTime() / 1000)}:R>` : 'N/A'}`
                    )
                )
                .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`-# Kythia by kenndeclouv • Global Chat powered by Tronix Dev`)),
        ];

        return interaction.editReply({
            components: components,
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
        });
    },
};
