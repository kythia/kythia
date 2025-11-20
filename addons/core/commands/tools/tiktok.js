/**
 * @namespace: addons/core/commands/tools/tiktok.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
    slashCommand: new SlashCommandBuilder()
        .setName('tiktok')
        .setDescription('🎬 Get and play a TikTok video by link.')
        .addStringOption((option) => option.setName('link').setDescription('The TikTok video link').setRequired(true)),

    async execute(interaction, container) {
        const t = container.t;
        const tiktokUrl = interaction.options.getString('link');

        const invalidUrlTitle = await t(interaction, 'core.tools.tiktok.error.invalid_url_title');
        const invalidUrlDesc = await t(interaction, 'core.tools.tiktok.error.invalid_url_desc');

        if (!/^https?:\/\/(www\.)?tiktok\.com\/.+/.test(tiktokUrl) && !/^https?:\/\/vt\.tiktok\.com\/.+/.test(tiktokUrl)) {
            await interaction.reply({
                embeds: [new EmbedBuilder().setDescription(`## ${invalidUrlTitle}\n${invalidUrlDesc}`)],
                ephemeral: true,
            });
            return;
        }

        await interaction.deferReply();

        try {
            const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(tiktokUrl)}`;
            const response = await fetch(apiUrl);
            const data = await response.json();

            if (!data || !data.data || !data.data.play) {
                throw new Error(data.msg || 'No video found');
            }

            const videoUrl = data.data.play;
            const rawTitle = data.data.title || (await t(interaction, 'core.tools.tiktok.default_title'));
            const title = rawTitle.length > 256 ? rawTitle.substring(0, 253) + '...' : rawTitle;

            try {
                await interaction.editReply({
                    files: [
                        {
                            attachment: videoUrl,
                            name: 'tiktok.mp4',
                            description: title,
                        },
                    ],
                });
            } catch (fileError) {
                const tooLargeTitle = await t(interaction, 'core.tools.tiktok.error.too.large.title');
                const tooLargeDesc = await t(interaction, 'core.tools.tiktok.error.too.large.desc', { url: videoUrl });
                if (fileError.code === 40005 || (fileError.message && fileError.message.includes('Request entity too large'))) {
                    await interaction.editReply({
                        embeds: [new EmbedBuilder().setDescription(`## ${tooLargeTitle}\n${tooLargeDesc}`)],
                        files: [],
                    });
                } else {
                    throw fileError;
                }
            }
        } catch (err) {
            console.error('TikTok fetch error:', err);
            let title, desc;
            if (err.message && err.message.includes('No video found')) {
                title = await t(interaction, 'core.tools.tiktok.error.no.video.title');
                desc = await t(interaction, 'core.tools.tiktok.error.no.video.desc');
            } else {
                title = await t(interaction, 'core.tools.tiktok.error.unknown.title');
                desc = await t(interaction, 'core.tools.tiktok.error.unknown.desc');
            }

            await interaction.editReply({
                embeds: [new EmbedBuilder().setDescription(`## ${title}\n${desc}`)],
            });
        }
    },
};
