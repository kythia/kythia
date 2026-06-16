/**
 * @namespace: addons/ai/register.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseRegister } = require('kythia-core');

// const { generateCommandSchema } = require('./helpers/command-schema');
const promptBuilder = require('./helpers/promptBuilder');
const geminiHelper = require('./helpers/gemini');

class AiRegister extends BaseRegister {
	register() {
		const bot = this.kythia;
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
	}
}

exports.default = AiRegister;
