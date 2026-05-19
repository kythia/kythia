/**
 * @namespace: addons/ai/helpers/AIResponseFilter.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

/**
 * AIResponseFilter
 * Handles filtering of AI responses to prevent unwanted mentions.
 */
class AIResponseFilter {
	/**
	 * Filter AI response for unwanted tags like @everyone/@here.
	 * Owner bypass: if user is owner and ownerBypassFilter is true, allow all content.
	 * @param {string} responseText - The AI response text to filter
	 * @param {string} [userId] - User ID who triggered the AI
	 * @param {Function} isOwner - Function to check if user is owner
	 * @param {Object} aiConfig - AI configuration object
	 * @returns {{allowed: boolean, reason?: string}} Filter result
	 */
	filterResponse(responseText, userId, isOwner, aiConfig) {
		// Owner bypass
		if (
			typeof userId !== 'undefined' &&
			aiConfig?.ownerBypassFilter &&
			typeof isOwner === 'function' &&
			isOwner(userId)
		) {
			return { allowed: true };
		}

		// Check for @everyone, @here, User mentions (<@id> / <@!id>), and Role mentions (<@&id>)
		if (/@everyone|@here|<@!?&?\d+>/i.test(responseText)) {
			return {
				allowed: false,
				reason: 'ai_events_messageCreate_filter_mentions',
			};
		}

		return { allowed: true };
	}
}

module.exports = AIResponseFilter;
