/**
 * @namespace: addons/fun/commands/8ball.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('🔮 Ask the magic 8 ball anything')
        .addStringOption((option) => option.setName('question').setDescription('What do you want to ask?').setRequired(true)),

    async execute(interaction) {
        const question = interaction.options.getString('question');

        // All answers are now keys for translation
        const answerKeys = [
            'fun_8ball_answer_yes',
            'fun_8ball_answer_maybe_yes',
            'fun_8ball_answer_no',
            'fun_8ball_answer_maybe_no',
            'fun_8ball_answer_idk',
            'fun_8ball_answer_definitely_yes',
            'fun_8ball_answer_definitely_no',
            'fun_8ball_answer_secret',
            'fun_8ball_answer_ask_later',
        ];

        const randomIndex = Math.floor(Math.random() * answerKeys.length);
        const answer = await t(interaction, answerKeys[randomIndex]);

        const thinkingEmbed = new EmbedBuilder()
            .setDescription(await t(interaction, 'fun_8ball_thinking_desc'))
            .setColor(kythia.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter(await embedFooter(interaction))
            .setTimestamp();

        await interaction.reply({ embeds: [thinkingEmbed] });

        setTimeout(async () => {
            const resultEmbed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setDescription(await t(interaction, 'fun_8ball_result_desc', { question, answer }))
                .setFooter(await embedFooter(interaction))
                .setTimestamp();

            await interaction.editReply({ embeds: [resultEmbed] });
        }, 2000);
    },
};
