/**
 * @namespace: addons/fun/commands/8ball.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('🔮 Ask the magic 8 ball anything')
        .addStringOption((option) => option.setName('question').setDescription('What do you want to ask?').setRequired(true)),

    async execute(interaction, container) {
        const { t, kythiaConfig, helpers } = container;
        const { embedFooter } = helpers.discord;

        const question = interaction.options.getString('question');

        // All answers are now keys for translation
        const answerKeys = [
            'fun.8ball.answer.yes',
            'fun.8ball.answer.maybe.yes',
            'fun.8ball.answer.no',
            'fun.8ball.answer.maybe.no',
            'fun.8ball.answer.idk',
            'fun.8ball.answer.definitely.yes',
            'fun.8ball.answer.definitely.no',
            'fun.8ball.answer.secret',
            'fun.8ball.answer.ask.later',
        ];

        const randomIndex = Math.floor(Math.random() * answerKeys.length);
        const answer = await t(interaction, answerKeys[randomIndex]);

        const thinkingEmbed = new EmbedBuilder()
            .setDescription(await t(interaction, 'fun.8ball.thinking.desc'))
            .setColor(kythiaConfig.bot.color)
            .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
            .setFooter(await embedFooter(interaction))
            .setTimestamp();

        await interaction.reply({ embeds: [thinkingEmbed] });

        setTimeout(async () => {
            const resultEmbed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
                .setDescription(await t(interaction, 'fun.8ball.result.desc', { question, answer }))
                .setFooter(await embedFooter(interaction))
                .setTimestamp();

            await interaction.editReply({ embeds: [resultEmbed] });
        }, 2000);
    },
};
