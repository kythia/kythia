/**
 * @namespace: addons/fun/commands/_guessnumber.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedFooter } = require('@coreHelpers/discord');
const { t } = require('@coreHelpers/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guessnumber')
        .setDescription('Guess the number the bot is thinking of 😋')
        .addStringOption((option) =>
            option
                .setName('mode')
                .setDescription('Choose difficulty level')
                .setRequired(true)
                .addChoices(
                    { name: 'Easy (1 - 50)', value: 'easy' },
                    { name: 'Medium (1 - 100)', value: 'medium' },
                    { name: 'Hard (1 - 500)', value: 'hard' }
                )
        ),

    async execute(interaction) {
        const mode = interaction.options.getString('mode');
        let maxNumber = 100;

        if (mode === 'easy') maxNumber = 50;
        if (mode === 'medium') maxNumber = 100;
        if (mode === 'hard') maxNumber = 500;

        const number = Math.floor(Math.random() * maxNumber) + 1;
        let attempts = 0;

        const duration = 60; // seconds
        const endTime = Math.floor((Date.now() + duration * 1000) / 1000);

        const embed = new EmbedBuilder()
            .setDescription(
                (await t(interaction, 'fun.guessnumber.desc', { maxNumber })) + '\n\n-# ' + (await t(interaction, 'fun.guessnumber.hint'))
            )
            .addFields(
                { name: await t(interaction, 'fun.guessnumber.mode.field'), value: `${mode.toUpperCase()}`, inline: true },
                { name: await t(interaction, 'fun.guessnumber.timeleft.field'), value: `<t:${endTime}:R>`, inline: true }
            )
            .setColor('Blue')
            .setFooter(await embedFooter(interaction))
            .setTimestamp();

        // DM support: interaction.channel can be null in DM, so fallback to DM if needed
        if (!interaction.channel) {
            const dm = await interaction.user.createDM();
            await dm.send({ embeds: [embed] });
            const dmEmbed = new EmbedBuilder()
                .setDescription(await t(interaction, 'fun.guessnumber.dm.sent.desc'))
                .setColor('Blue')
                .setFooter(await embedFooter(interaction))
                .setTimestamp();
            return interaction.reply({ embeds: [dmEmbed], ephemeral: true });
        }

        const gameMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

        const filter = (m) => m.author.id === interaction.user.id && !isNaN(m.content);
        const collector = interaction.channel.createMessageCollector({ filter, time: duration * 1000 });

        let lastUserMessage;
        let lastBotReply;

        collector.on('collect', async (m) => {
            const guess = parseInt(m.content);
            attempts++;

            // Delete previous user/bot messages if exist
            if (lastUserMessage) {
                try {
                    await lastUserMessage.delete();
                } catch {}
            }
            if (lastBotReply) {
                try {
                    await lastBotReply.delete();
                } catch {}
            }

            lastUserMessage = m;

            if (guess === number) {
                collector.stop('guessed');

                const winEmbed = new EmbedBuilder()
                    .setDescription(await t(interaction, 'fun.guessnumber.win.desc', { number, attempts }))
                    .setColor('Green')
                    .setFooter(await embedFooter(interaction))
                    .setTimestamp();

                try {
                    await gameMessage.edit({ embeds: [winEmbed] });
                } catch {
                    try {
                        await interaction.channel.send({ embeds: [winEmbed] });
                    } catch {}
                }
                return;
            }

            const distance = Math.abs(guess - number);
            let feedbackKey = '';
            let feedback;

            if (distance <= 5) {
                feedbackKey = guess < number ? 'fun_guessnumber_feedback_almost_low' : 'fun_guessnumber_feedback_almost_high';
            } else {
                feedbackKey = guess < number ? 'fun_guessnumber_feedback_low' : 'fun_guessnumber_feedback_high';
            }

            feedback = await t(interaction, feedbackKey);

            // Send feedback as embed
            const feedbackEmbed = new EmbedBuilder()
                .setDescription(feedback)
                .setColor('Yellow')
                .setFooter(await embedFooter(interaction))
                .setTimestamp();

            lastBotReply = await interaction.channel.send({ embeds: [feedbackEmbed] });
        });

        collector.on('end', async (_, reason) => {
            if (reason !== 'guessed') {
                const loseEmbed = new EmbedBuilder()
                    .setDescription(await t(interaction, 'fun.guessnumber.lose.desc', { number }))
                    .setColor('Red')
                    .setFooter(await embedFooter(interaction))
                    .setTimestamp();

                try {
                    await gameMessage.edit({ embeds: [loseEmbed] });
                } catch {
                    try {
                        await interaction.channel.send({ embeds: [loseEmbed] });
                    } catch {}
                }
            }
        });
    },
};
