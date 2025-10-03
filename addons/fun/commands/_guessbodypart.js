/**
 * @namespace: addons/fun/commands/_guessbodypart.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */
const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const axios = require('axios');
const answers = require('../helpers/bodypartAnswers');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder().setName('guessbodypart').setDescription('Guess the censored NSFW body part! 😋🥵'),

    async execute(interaction) {
        await interaction.deferReply();

        // NSFW channel check
        if (interaction.channel.type !== ChannelType.DM && !interaction.channel.nsfw) {
            const embed = new EmbedBuilder()
                .setDescription(
                    `## ${await t(interaction, 'fun__guessbodypart_guessbodypart_nsfw_title')}\n${await t(interaction, 'fun__guessbodypart_guessbodypart_nsfw_desc')}`
                )
                .setColor('Red')
                .setFooter({ text: await t(interaction, 'fun__guessbodypart_guessbodypart_footer') })
                .setTimestamp();
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        // Pick random category
        const categories = Object.keys(answers);
        const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
        const answerData = answers[selectedCategory];

        // Fetch image from API
        let imageUrl;
        try {
            const res = await axios.get(`https://nekobot.xyz/api/image?type=${selectedCategory}`);
            if (!res.data || !res.data.message) throw new Error('API response invalid');
            imageUrl = res.data.message;
        } catch (err) {
            console.error(err);
            const embed = new EmbedBuilder()
                .setDescription(
                    `## ${await t(interaction, 'fun__guessbodypart_guessbodypart_api_fail_title')}\n${await t(interaction, 'fun__guessbodypart_guessbodypart_api_fail_desc')}`
                )
                .setColor('Red')
                .setFooter({ text: await t(interaction, 'fun__guessbodypart_guessbodypart_footer') })
                .setTimestamp();
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        // --- Gameplay Start ---
        let lives = 3;
        const duration = 60;
        const endTime = Math.floor((Date.now() + duration * 1000) / 1000);
        let hints = [];

        // Generate blurred grid
        const generateBlurredGrid = () => {
            let grid = '';
            for (let i = 0; i < 5; i++) {
                for (let j = 0; j < 5; j++) {
                    grid += '||❓||';
                }
                grid += '\n';
            }
            return grid;
        };

        const embed = new EmbedBuilder()
            .setDescription(`## ${await t(interaction, 'fun__guessbodypart_guessbodypart_title')}\n` + generateBlurredGrid())
            .addFields(
                { name: await t(interaction, 'fun__guessbodypart_guessbodypart_lives_field'), value: '❤️ ❤️ ❤️', inline: true },
                { name: await t(interaction, 'fun__guessbodypart_guessbodypart_timeleft_field'), value: `<t:${endTime}:R>`, inline: true }
            )
            .setColor('Red')
            .setFooter({ text: await t(interaction, 'fun__guessbodypart_guessbodypart_footer') })
            .setTimestamp();

        const gameMessage = await interaction.editReply({ embeds: [embed], fetchReply: true });

        const filter = (m) => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: duration * 1000 });

        collector.on('collect', async (m) => {
            const guess = m.content.toLowerCase().trim();
            try {
                await m.delete();
            } catch {}

            // Check answer
            if (answerData.aliases.includes(guess)) {
                collector.stop('guessed');
                const winEmbed = new EmbedBuilder()
                    .setDescription(
                        `## ${await t(interaction, 'fun__guessbodypart_guessbodypart_win_title')}\n` +
                            (await t(interaction, 'fun__guessbodypart_guessbodypart_win_desc', { answer: answerData.name.toUpperCase() }))
                    )
                    .setImage(imageUrl)
                    .setColor('Green')
                    .setFooter({ text: await t(interaction, 'fun__guessbodypart_guessbodypart_footer') })
                    .setTimestamp();
                return gameMessage.edit({ embeds: [winEmbed] });
            } else {
                lives--;
                hints.push(await t(interaction, 'fun__guessbodypart_guessbodypart_wrong_hint', { guess }));

                // Give hints based on lives
                if (lives === 2) {
                    hints.push(await t(interaction, 'fun__guessbodypart_guessbodypart_hint_length', { length: answerData.name.length }));
                } else if (lives === 1) {
                    hints.push(await t(interaction, 'fun__guessbodypart_guessbodypart_hint_first', { first: answerData.name[0].toUpperCase() }));
                }

                // Update embed
                const updatedEmbed = new EmbedBuilder(embed.toJSON()).setFields(
                    {
                        name: await t(interaction, 'fun__guessbodypart_guessbodypart_lives_field'),
                        value: '❤️ '.repeat(lives) + '💔 '.repeat(3 - lives),
                        inline: true,
                    },
                    { name: await t(interaction, 'fun__guessbodypart_guessbodypart_timeleft_field'), value: `<t:${endTime}:R>`, inline: true }
                );

                if (hints.length > 0) {
                    updatedEmbed.addFields({ name: await t(interaction, 'fun__guessbodypart_guessbodypart_hints_field'), value: hints.join('\n') });
                }

                await gameMessage.edit({ embeds: [updatedEmbed] });

                if (lives <= 0) {
                    collector.stop('no_lives');
                }
            }
        });

        collector.on('end', async (_, reason) => {
            if (reason !== 'guessed') {
                const finalReason =
                    reason === 'no_lives'
                        ? await t(interaction, 'fun__guessbodypart_guessbodypart_lose_lives')
                        : await t(interaction, 'fun__guessbodypart_guessbodypart_lose_time');

                const loseEmbed = new EmbedBuilder()
                    .setDescription(
                        `## ${await t(interaction, 'fun__guessbodypart_guessbodypart_lose_title')}\n` +
                            `${finalReason}\n` +
                            (await t(interaction, 'fun__guessbodypart_guessbodypart_lose_answer', { answer: answerData.name.toUpperCase() }))
                    )
                    .setImage(imageUrl)
                    .setColor('DarkRed')
                    .setFooter({ text: await t(interaction, 'fun__guessbodypart_guessbodypart_footer') })
                    .setTimestamp();

                try {
                    await gameMessage.edit({ embeds: [loseEmbed] });
                } catch {}
            }
        });
    },
};
