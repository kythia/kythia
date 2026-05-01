/**
 * @namespace: addons/ai/helpers/prompt-builder.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

let _isOwner = () => false;
let _personaPrompt = 'Default Persona: You are a helpful AI assistant.';
let _ownerInteractionPrompt = '';

const discordRulesPrompt = `
--- DISCORD PLATFORM RULES (VERY IMPORTANT) ---
1. Every message you send on Discord has a maximum limit of 2000 characters.
2. YOUR RESPONSE MUST ALWAYS BE UNDER 2000 CHARACTERS. Make your answer concise.
3. If you MUST provide a very long answer (more than 2000 characters), you MUST split it into several messages.
4. To split messages, use the special separator '[SPLIT]' between each part of the message.
    Example: "This is the first part of my answer.[SPLIT]And this is the second part that will be sent as a separate message."
5. NEVER generate a single answer longer than 2000 characters. Always use '[SPLIT]' if needed.
6. DO NOT USE '[SPLIT]' if the message is not close to 2000 characters.
7. If user ask something that location specific, answer with the user's language as the location preference, example: "what time is it?" (if you dont know user location, just answer the time based on US).
`;

/**
 * 💉 Injects dependencies needed by the prompt builder.
 * MUST be called once during application startup.
 * @param {object} deps - Dependencies object
 * @param {Function} deps.isOwner - The isOwner helper function
 * @param {object} deps.config - The main application config object
 */
function init({ isOwner, config }) {
	if (typeof isOwner !== 'function' || !config) {
		return;
	}
	_isOwner = isOwner;
	const aiConfig = config.addons?.ai || {};
	_personaPrompt = aiConfig.personaPrompt || _personaPrompt;
	_ownerInteractionPrompt =
		aiConfig.ownerInteractionPrompt || _ownerInteractionPrompt;
}

/**
 * Builds the complete system instruction prompt for the AI.
 * @param {object} context - Contextual information about the user and conversation.
 * @param {string} context.userId - The Discord User ID.
 * @param {string} context.userDisplayName - User's display name or username.
 * @param {string} context.userTag - User's full Discord tag (username#discriminator).
 * @param {string} context.userBio - User's Discord bio.
 * @param {string} context.guildName - Name of the server (or 'Direct Message').
 * @param {string} context.channelName - Name of the channel (or 'Direct Message').
 * @param {string} [context.userFactsString] - Optional string of remembered facts about the user.
 * @param {string} [context.userPersonality] - Optional personality/conversation style.
 * @returns {string} The fully constructed system instruction prompt.
 */
function buildSystemInstruction(context) {
	const isOwnerUser = _isOwner(context.userId);

	const instructionParts = [];

	// Add personality prompt if specified
	if (context.userPersonality) {
		const personalityPrompts = {
			friendly:
				'Be warm, friendly, and approachable. Use casual language and show empathy. Be encouraging and supportive.',
			professional:
				'Be professional, formal, and to the point. Use proper grammar and maintain a business-like tone.',
			humorous:
				'Be witty, playful, and entertaining. Use humor appropriately and make conversations fun.',
			technical:
				'Be detailed, precise, and technical. Provide in-depth information and explanations.',
			casual:
				'Be relaxed, casual, and laid-back. Use informal language and keep things chill.',
		};

		const personalityPrompt = personalityPrompts[context.userPersonality];
		if (personalityPrompt) {
			instructionParts.push(`--- PERSONALITY ---\n${personalityPrompt}\n`);
		}
	}

	instructionParts.push(_personaPrompt, discordRulesPrompt);

	if (isOwnerUser && _ownerInteractionPrompt) {
		instructionParts.push(_ownerInteractionPrompt);
	}

	let instruction = instructionParts.join('\n');

	const userContext = `
   --- CURRENT INFORMATION ---
   IMPORTANT: The chat history below may contain messages from other users, marked with the format "Name: Message Content". Always focus and personalize your answer ONLY for the "Current Speaker".
   Current Speaker:
   - Name: ${context.userDisplayName}
   - ID: ${context.userId}
   - Username: ${context.userTag}
   - Bio: ${context.userBio}
   
   Conversation Context:
   - Server: ${context.guildName}
   - Channel: #${context.channelName}
   - Preferred Locale: ${context.preferredLocale}
   ${context.userFactsString ? `\nFacts you already remember about this user:\n${context.userFactsString}` : ''}
   `;

	instruction += userContext;
	return instruction;
}

module.exports = {
	init,
	buildSystemInstruction,
};
