/**
 * @namespace: addons/ai/helpers/ConversationManager.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

/**
 * ConversationManager
 * Manages conversation state and history caching.
 */
class ConversationManager {
	/**
	 * @param {Object} options
	 * @param {number} [options.cacheTimeout=1800000] - Cache timeout in ms (default 30 min)
	 * @param {number} [options.cleanupInterval=300000] - Cleanup interval in ms (default 5 min)
	 * @param {number} [options.maxHistoryLength=12] - Maximum history length
	 */
	constructor(options = {}) {
		this.cache = new Map();
		this.cacheTimeout = options.cacheTimeout || 30 * 60 * 1000; // 30 minutes
		this.cleanupInterval = options.cleanupInterval || 5 * 60 * 1000; // 5 minutes
		this.maxHistoryLength = options.maxHistoryLength || 12;

		// Start cleanup interval
		this._cleanupIntervalId = setInterval(() => {
			this._cleanup();
		}, this.cleanupInterval);
	}

	/**
	 * Get conversation for a user (or create new one)
	 * @param {string} userId - User ID
	 * @returns {{history: Array, lastActive: number}} Conversation object
	 */
	getConversation(userId) {
		let conversation = this.cache.get(userId);
		if (!conversation) {
			conversation = { history: [], lastActive: Date.now() };
			this.cache.set(userId, conversation);
		}
		return conversation;
	}

	/**
	 * Add message to conversation history
	 * @param {string} userId - User ID
	 * @param {string} role - Message role ('user' or 'model')
	 * @param {string} content - Message content
	 */
	addToHistory(userId, role, content) {
		const conversation = this.getConversation(userId);
		const lastMessage = conversation.history[conversation.history.length - 1];

		if (lastMessage && lastMessage.role === role) {
			lastMessage.content += `\n${content}`;
			if (lastMessage.content.length > 80000) {
				lastMessage.content = lastMessage.content.slice(-80000);
			}
		} else {
			conversation.history.push({ role, content });
		}

		// Trim history if too long
		if (conversation.history.length > this.maxHistoryLength) {
			conversation.history.splice(0, 2);
		}

		conversation.lastActive = Date.now();
	}

	/**
	 * Build contents array for Gemini API from conversation history
	 * @param {string} userId - User ID
	 * @returns {Array<{role: string, parts: Array}>} Formatted contents for Gemini
	 */
	buildContentsArray(userId) {
		const conversation = this.getConversation(userId);
		return conversation.history.map((msg) => {
			let text = typeof msg.content === 'string' ? msg.content : '';
			if (text.length > 80000) {
				text = `${text.substring(0, 80000)}... [TRUNCATED]`;
			}
			return {
				role: msg.role === 'model' ? 'model' : 'user',
				parts: [{ text }],
			};
		});
	}

	/**
	 * Update last active timestamp for a conversation
	 * @param {string} userId - User ID
	 */
	updateActivity(userId) {
		const conversation = this.cache.get(userId);
		if (conversation) {
			conversation.lastActive = Date.now();
		}
	}

	/**
	 * Get conversation history for summarization
	 * @param {string} userId - User ID
	 * @returns {Array<{role: string, content: string}>} History array
	 */
	getHistory(userId) {
		const conversation = this.cache.get(userId);
		return conversation ? [...conversation.history] : [];
	}

	/**
	 * Delete conversation from cache
	 * @param {string} userId - User ID
	 */
	deleteConversation(userId) {
		this.cache.delete(userId);
	}

	/**
	 * Private cleanup method to remove stale conversations
	 * @private
	 */
	_cleanup() {
		const now = Date.now();
		for (const [userId, conv] of this.cache.entries()) {
			if (now - conv.lastActive > this.cacheTimeout) {
				this.cache.delete(userId);
			}
		}
	}

	/**
	 * Stop cleanup interval (useful for cleanup)
	 */
	destroy() {
		if (this._cleanupIntervalId) {
			clearInterval(this._cleanupIntervalId);
			this._cleanupIntervalId = null;
		}
	}
}

module.exports = ConversationManager;
