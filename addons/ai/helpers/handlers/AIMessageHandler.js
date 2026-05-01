/**
 * @namespace: addons/ai/helpers/handlers/AIMessageHandler.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 2.0.0-rc
 */

const {
	GoogleGenAI,
	HarmCategory,
	HarmBlockThreshold,
} = require('@google/genai');
const { ChannelType } = require('discord.js');
const { utils } = require('kythia-core');
const { buildSystemInstruction } = require('../prompt-builder');
const { getAndUseNextAvailableToken } = require('../gemini');

/** Minimum supported model for tool context circulation. */
const MINIMUM_MODEL = 'gemini-3-flash-preview';

/** Safety settings applied to every request. */
const SAFETY_SETTINGS = [
	HarmCategory.HARM_CATEGORY_HARASSMENT,
	HarmCategory.HARM_CATEGORY_HATE_SPEECH,
	HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
	HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
].map((category) => ({ category, threshold: HarmBlockThreshold.BLOCK_NONE }));

/**
 * save_memory function declaration — always present alongside command tools.
 * The model decides when to call it; no regex pre-checks needed.
 */
const SAVE_MEMORY_DECLARATION = {
	name: 'save_memory',
	description:
		'MANDATORY: ONLY execute this tool if the user EXPLICITLY types words like "remember", "save", or "note" regarding their own personal identity. ' +
		'Example: "remember my birthday is June 1st" or "my name is Andi". ' +
		'If the user does not explicitly ask you to remember/save a personal fact, IGNORE THIS TOOL.',
	parameters: {
		type: 'object',
		properties: {
			fact: {
				type: 'string',
				description:
					'The personal identity fact to store. E.g., "User loves cats", "User is a programmer".',
			},
		},
		required: ['fact'],
	},
};
class AIMessageHandler {
	/** @param {Object} container - Full DI container */
	constructor(container) {
		this.container = container;
		this.logger = container.logger;
		this.t = container.t;
		this.ServerSetting = container.sequelize.models.ServerSetting;
		this.isOwner = container.helpers.discord.isOwner;
		this.config = container.kythiaConfig;
		this.aiConfig = this.config.addons.ai;

		const AIResponseFilter = require('../AIResponseFilter');
		const UserFactsManager = require('../UserFactsManager');
		const ConversationManager = require('../ConversationManager');
		const MediaProcessor = require('../MediaProcessor');
		const path = require('node:path');

		this.responseFilter = new AIResponseFilter();
		this.factsManager = new UserFactsManager({
			UserFact: container.sequelize.models.UserFact,
			logger: this.logger,
			config: this.config,
		});
		this.conversationManager = new ConversationManager({
			cacheTimeout: 30 * 60 * 1000,
			cleanupInterval: 5 * 60 * 1000,
			maxHistoryLength: 12,
		});
		this.mediaProcessor = new MediaProcessor({
			tempDir: path.join(__dirname, '..', 'temp'),
			logger: this.logger,
			geminiApiKey: this.aiConfig.geminiApiKeys.split(',')[0],
		});

		this.userCooldowns = new Map();
	}

	// ─── Helpers ──────────────────────────────────────────────────────────────

	safeReply(message, payload) {
		const options =
			typeof payload === 'string' ? { content: payload } : { ...payload };
		options.failIfNotExists = false;
		return message.reply(options).catch((err) => {
			this.logger.warn(`SafeReply fallback: ${err.message}`, {
				label: 'AIMessageHandler',
			});
			return message.channel.send(options).catch(() => {});
		});
	}

	/**
	 * Extract text string from a Gemini response object (handles both
	 * function-style and string-style `.text` across SDK versions).
	 */
	_extractText(response) {
		if (!response) return '';
		const raw =
			typeof response.text === 'function'
				? response.text()
				: (response.text ?? '');
		return typeof raw === 'string' ? raw.trim() : '';
	}

	/** Build the unified tools array for every request. */
	_buildTools(_bot) {
		return [
			{ googleSearch: {} },
			{ functionDeclarations: [SAVE_MEMORY_DECLARATION] },
		];
	}

	// ─── Entry point ──────────────────────────────────────────────────────────

	async handleMessage(bot, message) {
		const client = bot.client;
		if (message.author?.bot || message.system) return;

		const content =
			typeof message.content === 'string' ? message.content.trim() : '';
		if (
			Array.isArray(this.config?.bot?.prefixes) &&
			this.config.bot.prefixes.some((p) => p && content.startsWith(p))
		)
			return;

		const isDm =
			message.channel.type === ChannelType.DM || message.channel.type === 1;
		const isMentioned =
			message.mentions.users.has(client.user.id) &&
			!message.mentions.everyone &&
			(!message.mentions.roles || message.mentions.roles.size === 0);

		if (isDm) {
			const activeDMs = client.modmailActiveDMs;
			if (activeDMs instanceof Set && activeDMs.has(message.author.id)) return;
		}

		let isAiChannel = false;
		if (message.guild) {
			try {
				const ss = await this.ServerSetting.getCache({
					guildId: message.guild.id,
				});
				if (ss?.aiChannelIds?.includes(message.channel.id)) isAiChannel = true;
			} catch (e) {
				this.logger.error(`Error getting ServerSetting: ${e.message}`, {
					label: 'ai',
				});
			}
		}

		if (!(isAiChannel || isDm || isMentioned)) return;

		const isOwnerUser = this.isOwner(message.author.id);
		if (!isOwnerUser || !this.aiConfig.ownerBypassFilter) {
			const cooldown = this.checkUserCooldown(message.author.id);
			if (cooldown.limited) {
				const secs = Math.ceil(cooldown.resetIn / 1000);
				const msg = (
					await this.t(message, 'ai.events.messageCreate.cooldown')
				).replace('{seconds}', secs);
				this.safeReply(message, msg).catch(() => {});
				return;
			}
		}

		await this.processAIRequest(bot, message, client);
	}

	// ─── Cooldown ─────────────────────────────────────────────────────────────

	checkUserCooldown(userId) {
		const maxRequests = this.aiConfig.userCooldownRequests ?? 2;
		const windowMs = (this.aiConfig.userCooldownWindowSec ?? 60) * 1000;
		const now = Date.now();
		const timestamps = (this.userCooldowns.get(userId) || []).filter(
			(ts) => now - ts < windowMs,
		);
		if (timestamps.length >= maxRequests) {
			this.userCooldowns.set(userId, timestamps);
			return { limited: true, resetIn: windowMs - (now - timestamps[0]) };
		}
		timestamps.push(now);
		this.userCooldowns.set(userId, timestamps);
		return { limited: false };
	}

	// ─── Pre-flight ───────────────────────────────────────────────────────────

	async processAIRequest(bot, message, client) {
		let typingInterval;
		try {
			await message.channel.sendTyping();
			typingInterval = setInterval(() => {
				message.channel.sendTyping().catch((err) => {
					this.logger.warn(`Typing indicator error: ${err.message}`, {
						label: 'AIMessageHandler',
					});
					clearInterval(typingInterval);
				});
			}, 8000);

			const context = await this.buildContext(message, client);
			const cleanContent = this.cleanMessageContent(message.content);
			const mediaParts = await this.mediaProcessor.processAttachments(message);
			mediaParts.push(
				...this.mediaProcessor.extractYouTubeUrls(message.content),
			);

			if (!cleanContent && mediaParts.length === 0) {
				if (message.mentions.users.has(client.user.id)) {
					this.safeReply(
						message,
						await this.t(message, 'ai.events.messageCreate.mention'),
					);
				}
				clearInterval(typingInterval);
				return;
			}

			// Restore or seed conversation history
			const historyId = message.channel.id;
			const channelConv = this.conversationManager.getConversation(historyId);
			if (channelConv.history.length === 0) {
				await this.loadConversationHistory(message, client, channelConv);
			}
			this.conversationManager.updateActivity(historyId);

			// Build the initial user turn (with optional media)
			const prefix = `[${message.author.username}]: `;
			const userParts =
				mediaParts.length > 0
					? [
							...mediaParts,
							{ text: prefix + (cleanContent || 'Describe this.') },
						]
					: [{ text: prefix + cleanContent }];

			const success = await this.executeAIRequest(
				message,
				context,
				userParts,
				bot,
				client,
			);

			clearInterval(typingInterval);

			if (!success) {
				this.logger.error('❌ All AI tokens exhausted.', { label: 'ai' });
				this.safeReply(
					message,
					await this.t(message, 'ai.events.messageCreate.memory.token.limit'),
				).catch(() => {});
			}
		} catch (err) {
			this.logger.error(`AI Pre-flight Error: ${err.message}`, {
				label: 'AIMessageHandler',
			});
			await message.channel
				.send(await this.t(message, 'ai.events.messageCreate.error'))
				.catch(() => {});
			if (typingInterval) clearInterval(typingInterval);
		}
	}

	// ─── Core AI execution (stateful chat + unified tools) ────────────────────

	/**
	 * Executes the AI request using a stateful chat session.
	 * Tools are always combined: googleSearch + functionDeclarations.
	 * includeServerSideToolInvocations enables tool context circulation.
	 */
	async executeAIRequest(message, context, userParts, bot, client) {
		const systemInstruction = buildSystemInstruction(context);
		const GEMINI_MODEL = this.aiConfig.model || MINIMUM_MODEL;
		const tools = this._buildTools(bot);
		const historyId = message.channel.id;

		// History for chat initialization (exclude the current user turn —
		// we'll send it via chat.sendMessage so the chat tracks it internally)
		const priorHistory = this.conversationManager
			.buildContentsArray(historyId)
			.slice(0, -1); // drop the last entry if it was speculatively added

		const totalTokens = (this.aiConfig.geminiApiKeys || '')
			.split(',')
			.map((k) => k.trim())
			.filter(Boolean).length;

		for (let attempt = 0; attempt < totalTokens; attempt++) {
			this.logger.info(`🧠 AI attempt ${attempt + 1}/${totalTokens}...`, {
				label: 'ai',
			});

			const tokenIdx = await getAndUseNextAvailableToken();
			if (tokenIdx === -1) {
				this.logger.warn('⚠️ All tokens rate-limited.', { label: 'ai' });
				break;
			}

			const apiKey = this.aiConfig.geminiApiKeys.split(',')[tokenIdx]?.trim();
			if (!apiKey) continue;

			const genAI = new GoogleGenAI({ apiKey });

			try {
				// Create a stateful chat seeded with conversation history
				const chat = genAI.chats.create({
					model: GEMINI_MODEL,
					history: priorHistory,
					config: {
						systemInstruction: { parts: [{ text: systemInstruction }] },
						tools,
						toolConfig: { includeServerSideToolInvocations: true },
						safetySettings: SAFETY_SETTINGS,
					},
				});

				// Send the current user message
				const response = await chat.sendMessage({ message: userParts });

				this.logger.info(`✅ AI request successful on attempt ${attempt + 1}`, {
					label: 'ai',
				});

				// Store user turn in our history cache
				this.conversationManager.addToHistory(
					historyId,
					'user',
					userParts
						.map((p) => p.text || '')
						.join(' ')
						.trim(),
				);

				await this.handleAIResponse(response, chat, message, bot, client);
				return true;
			} catch (err) {
				const is429 =
					err.message?.includes('429') ||
					err.toString().includes('RESOURCE_EXHAUSTED');
				if (is429) {
					this.logger.warn(
						`Token ${tokenIdx} hit 429. Retrying with next token...`,
						{ label: 'AIMessageHandler' },
					);
				} else {
					this.logger.error(`AI Error (non-429): ${err.message}`, {
						label: 'AIMessageHandler',
					});
					await message.channel
						.send(await this.t(message, 'ai.events.messageCreate.error'))
						.catch(() => {});
					return false;
				}
			}
		}

		return false;
	}

	// ─── Response routing ─────────────────────────────────────────────────────

	async handleAIResponse(response, chat, message, bot, client, depth = 0) {
		if (depth > 5) {
			this.logger.warn('⚠️ Max AI agent depth reached.', { label: 'ai' });
			return;
		}

		const replyText = this._extractText(response);
		let textToSend = replyText;
		const textToHistory = replyText;

		if (response.memorySaved) {
			textToSend = textToSend
				? `${textToSend}\n\n-# *this information is saved*`
				: '-# *this information is saved*';
		}

		if (textToSend) {
			const filterResult = this.responseFilter.filterResponse(
				textToSend,
				message.author?.id,
				this.isOwner,
				this.aiConfig,
			);
			if (!filterResult.allowed) {
				this.safeReply(
					message,
					await this.t(message, 'ai.events.messageCreate.filter.blocked'),
				);
				return;
			}
			await this.sendSplitMessage(message, textToSend);
		}

		if (textToHistory) {
			this.conversationManager.addToHistory(
				message.channel.id,
				'model',
				textToHistory,
			);
		}

		const functionCalls = response.functionCalls || [];

		if (functionCalls.length > 0) {
			this.logger.info(
				`🧠 Executing ${functionCalls.length} parallel functions: ${functionCalls.map((f) => f.name).join(', ')}`,
				{ label: 'ai' },
			);

			const functionResponses = [];
			let memorySaved = false;
			for (const call of functionCalls) {
				const result = await this.executeSingleFunction(
					call,
					message,
					bot,
					client,
				);
				if (result) {
					if (result.memorySaved) memorySaved = true;
					functionResponses.push({ functionResponse: result.functionResponse });
				}
			}

			if (functionResponses.length > 0) {
				try {
					const followUp = await chat.sendMessage({
						message: functionResponses,
					});
					if (memorySaved) followUp.memorySaved = true;
					await this.handleAIResponse(
						followUp,
						chat,
						message,
						bot,
						client,
						depth + 1,
					);
				} catch (err) {
					this.logger.error(
						`Error sending batch function responses: ${err.message}`,
						{ label: 'ai' },
					);
				}
			}
		}
	}

	// ─── Function call handler ────────────────────────────────────────────────

	async executeSingleFunction(call, message, _bot, client) {
		let { name: fnName, args: fnArgs, id: fnId } = call;

		fnName = fnName.replace(/^google:/, '').trim();

		const makeResponse = (payload) => ({
			functionResponse: {
				id: fnId,
				name: fnName,
				response: {
					content:
						typeof payload === 'string' ? payload : JSON.stringify(payload),
				},
			},
		});

		// ── save_memory ────────────────────────────────────────────────────────
		if (fnName === 'save_memory') {
			this.logger.info(
				`🧠 [DEBUG] AI triggered 'save_memory' args: ${JSON.stringify(fnArgs)}`,
				{ label: 'ai' },
			);
			const fact = typeof fnArgs?.fact === 'string' ? fnArgs.fact.trim() : '';

			if (!fact) return makeResponse({ status: 'error', reason: 'empty fact' });

			const status = await this.factsManager.appendFact(
				message.author.id,
				fact,
			);
			this.logger.info(`🧠 save_memory: "${fact}" → ${status}`, {
				label: 'ai',
			});

			return { ...makeResponse({ status, fact }), memorySaved: true };
		}

		// ── Discord command function calls ─────────────────────────────────────
		const baseCommandName = fnName.split('_')[0];
		const command = client.commands.get(baseCommandName);

		if (!command) {
			this.logger.warn(`🧠 Command not found: ${baseCommandName}`, {
				label: 'ai',
			});
			return makeResponse({ status: 'error', reason: 'Command not found' });
		}

		this.logger.info(
			`🧠 Executing /${baseCommandName} (from "${fnName}") args: ${JSON.stringify(fnArgs)}`,
			{ label: 'ai' },
		);
		let rawArgsString = '';
		if (fnArgs && typeof fnArgs === 'object') {
			rawArgsString = Object.values(fnArgs)
				.map((v) => {
					const str = String(v);
					return str.includes(' ') ? `"${str}"` : str;
				})
				.join(' ');
		}

		const fakeInteraction = utils.InteractionFactory.create(
			message,
			fnName,
			rawArgsString,
		);

		try {
			const executionResult = await command.execute(
				fakeInteraction,
				client.container,
			);

			let resultStr = JSON.stringify({
				success: true,
				result: executionResult,
			});
			if (resultStr.length > 80000) {
				resultStr = `${resultStr.substring(0, 80000)}... [TRUNCATED]`;
			}

			return makeResponse(resultStr);
		} catch (err) {
			this.logger.error(`Error running "${fnName}": ${err.message}`, {
				label: 'ai',
			});
			return makeResponse({ status: 'error', reason: err.message });
		}
	}

	// ─── Context builders ─────────────────────────────────────────────────────

	async buildContext(message, client) {
		const userDisplayName =
			message.member?.displayName || message.author.username;
		const userTag =
			message.author.tag ||
			`${message.author.username}#${message.author.discriminator}`;
		const userFactsString = await this.factsManager.getFactsString(
			message.author.id,
		);
		const userBio = await this.getUserBio(message.author.id, client);
		const guildName = message.guild?.name || 'Direct Message';
		const channelName = message.channel.name || 'Direct Message';

		const { KythiaUser } = this.container.sequelize.models;
		const user = await KythiaUser.getCache({ userId: message.author.id });
		const userPersonality =
			user?.aiPersonality || this.aiConfig.defaultPersonality || 'friendly';

		const preferredLocale = message.guild?.preferredLocale || 'en';

		return {
			userId: message.author.id,
			userDisplayName,
			userFactsString,
			userTag,
			userBio,
			guildName,
			channelName,
			userPersonality,
			preferredLocale,
		};
	}

	async getUserBio(userId, client) {
		try {
			const user = await client.users.fetch(userId, { force: true });
			return user.bio || 'Not set';
		} catch {
			return 'Cannot get bio';
		}
	}

	cleanMessageContent(content) {
		return typeof content === 'string'
			? content
					.replace(/<@!?\d+>/g, '')
					.trim()
					.slice(0, 1500)
			: '';
	}

	async loadConversationHistory(message, client, _userConv) {
		this.logger.info(
			`🧠 Cache miss for channel ${message.channel.name || message.channel.id}. Reconstructing history...`,
			{ label: 'ai' },
		);

		const limit = this.aiConfig.getMessageHistoryLength || 10;
		const lastMessages = await message.channel.messages.fetch({ limit });
		const relevantMessages = Array.from(lastMessages.values())
			.filter((msg) => !msg.author.bot || msg.author.id === client.user.id)
			.reverse();

		for (const msg of relevantMessages) {
			const c =
				typeof msg.content === 'string'
					? msg.content.replace(/<@!?\d+>/g, '').trim()
					: '';
			if (!c && msg.attachments.size === 0) continue;

			const isModel = msg.author.id === client.user.id;
			const content = isModel ? c : `[${msg.author.username}]: ${c}`;

			this.conversationManager.addToHistory(
				message.channel.id,
				isModel ? 'model' : 'user',
				content,
			);
		}
	}

	// ─── Message splitter ─────────────────────────────────────────────────────

	async sendSplitMessage(message, text) {
		const CHUNK_SIZE = 2000;
		text = typeof text === 'string' ? text : '';
		const parts = text.split('[SPLIT]');
		let hasReplied = false;

		for (const part of parts) {
			const chunk = part.trim();
			if (!chunk) continue;

			const filterResult = this.responseFilter.filterResponse(
				chunk,
				message.author?.id,
				this.isOwner,
				this.aiConfig,
			);
			if (!filterResult.allowed) {
				this.safeReply(
					message,
					await this.t(message, 'ai.events.messageCreate.filter.blocked'),
				);
				return;
			}

			if (chunk.length > CHUNK_SIZE) {
				const subChunks =
					chunk.match(new RegExp(`.{1,${CHUNK_SIZE}}`, 'gs')) || [];
				for (const sub of subChunks) {
					const f = this.responseFilter.filterResponse(
						sub,
						message.author?.id,
						this.isOwner,
						this.aiConfig,
					);
					if (!f.allowed) {
						this.safeReply(
							message,
							await this.t(message, 'ai.events.messageCreate.filter.blocked'),
						);
						return;
					}
					if (!hasReplied) {
						this.safeReply(message, { content: sub });
						hasReplied = true;
					} else {
						await message.channel.send(sub);
					}
				}
			} else {
				if (!hasReplied) {
					this.safeReply(message, { content: chunk });
					hasReplied = true;
				} else {
					await message.channel.send(chunk);
				}
			}
		}
	}
}

module.exports = AIMessageHandler;
