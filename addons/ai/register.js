/**
 * @namespace: addons/ai/register.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

// const { generateCommandSchema } = require('./helpers/command-schema');
const promptBuilder = require('./helpers/prompt-builder');
const geminiHelper = require('./helpers/gemini');

module.exports = {
	initialize(bot) {
		const logger = bot.container.logger;
		const isOwner = bot.container.helpers.discord.isOwner;
		const summery = [];

		geminiHelper.init({ logger, config: bot.container.kythiaConfig });
		summery.push('   ╰┈➤ Gemini Helper initialized.');

		promptBuilder.init({ isOwner, config: bot.container.kythiaConfig });
		summery.push('   ╰┈➤ Prompt Builder initialized.');

		// bot.addClientReadyHook(() => {
		// 	bot.aiCommandSchema = generateCommandSchema(bot.client);
		// 	logger.info(
		// 		`✅ Successfully loaded ${bot.aiCommandSchema.length} command schema for AI.`,
		// 		{ label: 'ai' },
		// 	);
		// });

		return summery;
	},
};
