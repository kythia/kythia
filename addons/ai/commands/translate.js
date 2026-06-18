/**
 * @namespace: addons/ai/commands/translate.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	SlashCommandBuilder,
	ApplicationCommandType,
	ContextMenuCommandBuilder,
} = require('discord.js');
const { GoogleGenAI } = require('@google/genai');
const { BaseCommand } = require('kythia-core');
const { getAndUseNextAvailableToken } = require('../helpers/gemini');
class TranslateCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('translate')
		.setDescription('Translate text to another language using Gemini AI.')
		.addStringOption((option) =>
			option
				.setName('text')
				.setDescription('Text to translate')
				.setRequired(true),
		)
		.addStringOption((option) =>
			option
				.setName('lang')
				.setDescription('Target language (e.g. en, id, ja, etc)')
				.setRequired(true),
		);
	contextMenuCommand = new ContextMenuCommandBuilder()
		.setName('Translate Message')
		.setType(ApplicationCommandType.Message);
	contextMenuDescription =
		'🌐 Translate message to another language using Gemini AI.';
	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		const text =
			interaction.options?.getString('text') ||
			interaction.targetMessage?.content;
		const lang = interaction.options?.getString('lang') || 'en';
		await interaction.deferReply();
		const apiKeysStr = kythiaConfig.addons.ai.geminiApiKeys || '';
		const totalTokens = apiKeysStr ? apiKeysStr.split(',').length : 0;
		let success = false;
		let finalResponse = null;
		let lastError = null;
		for (let attempt = 0; attempt < totalTokens; attempt++) {
			logger.debug(`🧠 AI translate attempt ${attempt + 1}/${totalTokens}...`, {
				label: 'ai',
			});
			const tokenIdx = await getAndUseNextAvailableToken();
			if (tokenIdx === -1) {
				const msg = await t(interaction, 'ai.translate.limit');
				const components = await simpleContainer(interaction, msg, {
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			const GEMINI_API_KEY = apiKeysStr.split(',')[tokenIdx];
			if (!GEMINI_API_KEY) {
				logger.warn(`Token index ${tokenIdx} is invalid. Skipping.`, {
					label: 'ai',
				});
				continue;
			}
			const ai = new GoogleGenAI({
				apiKey: GEMINI_API_KEY,
			});
			const prompt = `Translate the following text to ${lang}:\n\n${text}\n\nOnly return the translated text, no explanation.`;
			try {
				const response = await ai.models.generateContent({
					model: kythiaConfig.addons.ai.model,
					contents: prompt,
				});
				let rawText = response.text || response.response?.text || '';
				rawText = rawText.replace(/[`]/g, '');
				finalResponse = {
					...response,
					text: rawText,
				};
				success = true;
				logger.debug(
					`✅ AI translate request successful on attempt ${attempt + 1}`,
					{
						label: 'ai',
					},
				);
				break;
			} catch (error) {
				lastError = error;
				if (
					error.message &&
					(error.message.includes('429') ||
						error.toString().includes('RESOURCE_EXHAUSTED'))
				) {
					logger.warn(
						`Token index ${tokenIdx} hit 429 limit. Retrying with next token...`,
						{
							label: 'ai',
						},
					);
				} else {
					logger.error(
						`Error in /translate (non-429): ${error.message || error}`,
						{
							label: 'translate',
						},
					);
					break;
				}
			}
		}
		if (success && finalResponse) {
			const translated =
				finalResponse.text ||
				finalResponse.response?.text ||
				(await t(interaction, 'ai.translate.no.result'));
			const msg = await t(interaction, 'ai.translate.success', {
				lang,
				text,
				translated,
			});
			const components = await simpleContainer(interaction, msg);
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		} else {
			logger.error(`Error in /translate: ${lastError.message || lastError}`, {
				label: 'ai',
			});
			const msg = await t(interaction, 'ai.translate.error');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}
exports.default = TranslateCommand;
