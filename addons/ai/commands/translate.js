/**
 * @namespace: addons/ai/commands/translate.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');
const { getAndUseNextAvailableToken } = require('../helpers/gemini');
const { GoogleGenAI } = require('@google/genai');

module.exports = {
    slashCommand: new SlashCommandBuilder()
        .setName('translate')
        .setDescription('🌐 Translate text to another language using Gemini AI.')
        .addStringOption((option) => option.setName('text').setDescription('Text to translate').setRequired(true))
        .addStringOption((option) => option.setName('lang').setDescription('Target language (e.g. en, id, ja, etc)').setRequired(true)),

    contextMenuCommand: new ContextMenuCommandBuilder().setName('Translate Message').setType(ApplicationCommandType.Message),

    contextMenuDescription: '🌐 Translate message to another language using Gemini AI.',
    isInMainGuild: true,
    async execute(interaction, container) {
        // Dependency
        const { t, kythiaConfig, helpers, logger } = container;
        const { embedFooter } = helpers.discord;

        const text = interaction.options?.getString('text') || interaction.targetMessage?.content;
        const lang = interaction.options?.getString('lang') || 'en';

        await interaction.deferReply();

        const totalTokens = kythiaConfig.addons.ai.geminiApiKeys.split(',').length;
        let success = false;
        let finalResponse = null;
        let lastError = null;

        for (let attempt = 0; attempt < totalTokens; attempt++) {
            logger.debug(`🧠 AI translate attempt ${attempt + 1}/${totalTokens}...`);

            const tokenIdx = await getAndUseNextAvailableToken();
            if (tokenIdx === -1) {
                const embed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(await t(interaction, 'ai.translate.limit'))
                    .setFooter(await embedFooter(interaction));
                return interaction.editReply({ embeds: [embed] });
            }

            const GEMINI_API_KEY = kythiaConfig.addons.ai.geminiApiKeys.split(',')[tokenIdx];
            if (!GEMINI_API_KEY) {
                logger.warn(`Token index ${tokenIdx} is invalid. Skipping.`);
                continue;
            }

            const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

            const prompt = `Translate the following text to ${lang}:\n\n${text}\n\nOnly return the translated text, no explanation.`;

            try {
                const response = await ai.models.generateContent({
                    model: kythiaConfig.addons.ai.model,
                    contents: prompt,
                });

                let rawText = response.text || response.response?.text || '';
                rawText = rawText.replace(/[`]/g, '');
                finalResponse = { ...response, text: rawText };
                success = true;
                logger.debug(`✅ AI translate request successful on attempt ${attempt + 1}`);
                break;
            } catch (error) {
                lastError = error;
                if (error.message && (error.message.includes('429') || error.toString().includes('RESOURCE_EXHAUSTED'))) {
                    logger.warn(`Token index ${tokenIdx} hit 429 limit. Retrying with next token...`);
                    continue;
                } else {
                    logger.error('❌ Error in /translate (non-429):', error);
                    break;
                }
            }
        }

        if (success && finalResponse) {
            const translated = finalResponse.text || finalResponse.response?.text || (await t(interaction, 'ai.translate.no.result'));
            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setDescription(await t(interaction, 'ai.translate.success', { lang, text, translated }))
                .setFooter(await embedFooter(interaction));
            await interaction.editReply({
                embeds: [embed],
            });
        } else {
            logger.error('Error in /translate:', lastError);
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'ai.translate.error'))
                .setFooter(await embedFooter(interaction));
            await interaction.editReply({
                embeds: [embed],
            });
        }
    },
};
