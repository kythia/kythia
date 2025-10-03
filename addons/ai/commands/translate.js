/**
 * @namespace: addons/ai/commands/translate.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');
const { getAndUseNextAvailableToken } = require('../helpers/gemini');
const { embedFooter } = require('@utils/discord');
const { GoogleGenAI } = require('@google/genai');
const { t } = require('@utils/translator');

module.exports = {
    slashCommand: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('🌐 Translate text to another language using Gemini AI.')
        .addStringOption((option) => option.setName('text').setDescription('Text to translate').setRequired(true))
        .addStringOption((option) => option.setName('lang').setDescription('Target language (e.g. en, id, ja, etc)').setRequired(true)),

    contextMenuCommand: new ContextMenuCommandBuilder().setName('Translate Message').setType(ApplicationCommandType.Message),

    contextMenuDescription: '🌐 Translate message to another language using Gemini AI.',
    isInMainGuild: true,
    async execute(interaction) {
        const text = interaction.options?.getString('text') || interaction.targetMessage?.content;
        const lang = interaction.options?.getString('lang') || 'en';

        await interaction.deferReply();

        const tokenIdx = await getAndUseNextAvailableToken();
        if (tokenIdx === -1) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'ai_translate_limit'))
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        const GEMINI_API_KEY = kythia.addons.ai.geminiApiKeys.split(',')[tokenIdx];
        if (!GEMINI_API_KEY) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'ai_translate_set'))
                .setFooter(await embedFooter(interaction));
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

        const prompt = `Translate the following text to ${lang}:\n\n${text}\n\nOnly return the translated text, no explanation.`;

        try {
            const response = await ai.models.generateContent({
                model: kythia.addons.ai.model,
                contents: prompt,
            });

            const translated = response.text || response.response?.text || (await t(interaction, 'ai_translate_no_result'));

            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'ai_translate_success', { lang, text, translated }))
                .setFooter(await embedFooter(interaction));
            await interaction.editReply({
                embeds: [embed],
            });
        } catch (error) {
            console.error('Error in /translate:', error);
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'ai_translate_error'))
                .setFooter(await embedFooter(interaction));
            await interaction.editReply({
                embeds: [embed],
                ephemeral: true,
            });
        }
    },
};
