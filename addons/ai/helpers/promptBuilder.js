/**
 * @namespace: addons/ai/helpers/promptBuilder.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

let _isOwner = () => false;
let _personaPrompt = 'Default Persona: You are a helpful AI assistant.';
let _ownerInteractionPrompt = '';

const toolRulesPrompt = `
--- TOOL USAGE RULES (MANDATORY) ---
1. You have access to several Discord commands. If a user's request can be fulfilled with a command (e.g., "play a song", "check ping"), DO NOT answer "I can't do that", but instead call the appropriate command.
2. Extract all required arguments from the user's message.
3. After receiving the result from the command (in JSON format), compose it into a natural response.
4. Never mention "command", "tool", or "JSON" to the user. For them, you do it magically.
5. If the command result contains special values like -1 or an error, explain it politely (e.g., "the connection is not stable yet").
6. If you are told to search the internet, use google search (yes, you can search).
`;

const discordRulesPrompt = `
--- DISCORD PLATFORM RULES (VERY IMPORTANT) ---
1. Every message you send on Discord has a maximum limit of 2000 characters.
2. YOUR RESPONSE MUST ALWAYS BE UNDER 2000 CHARACTERS. Make your answer concise.
3. If you MUST provide a very long answer (more than 2000 characters), you MUST split it into several messages.
4. To split messages, use the special separator '[SPLIT]' between each part of the message.
    Example: "This is the first part of my answer.[SPLIT]And this is the second part that will be sent as a separate message."
5. NEVER generate a single answer longer than 2000 characters. Always use '[SPLIT]' if needed.
6. DO NOT USE '[SPLIT]' if the message is not close to 2000 characters.
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
        console.error('PromptBuilder init requires isOwner function and config.');

        return;
    }
    _isOwner = isOwner;
    const aiConfig = config.addons?.ai || {};
    _personaPrompt = aiConfig.personaPrompt || _personaPrompt;
    _ownerInteractionPrompt = aiConfig.ownerInteractionPrompt || _ownerInteractionPrompt;
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
 * @returns {string} The fully constructed system instruction prompt.
 */
function buildSystemInstruction(context) {
    const isOwnerUser = _isOwner(context.userId);

    const instructionParts = [_personaPrompt, toolRulesPrompt, discordRulesPrompt];

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
   ${context.userFactsString ? `\nFacts you already remember about this user:\n${context.userFactsString}` : ''}
   `;

    instruction += userContext;
    return instruction;
}

module.exports = {
    init,
    buildSystemInstruction,
};
