const { ChannelType, ApplicationCommandOptionType } = require('discord.js');

const BLACKLIST_COMMANDS = [
	'mod',
	'testall', // Prevent recursion
	'giveaway',
	'ascii',
	'convert',
	'kyth',
	'server',
	'set',
];

/**
 * A mock Discord Message that is returned from reply/editReply/followUp.
 * Implements every method that commands typically call on a sent message.
 */
function createMockMessage(channel) {
	const noop = () => {};
	const asyncNoop = async () => {};

	const collectorEvents = {};

	const mockCollector = {
		on(event, fn) {
			collectorEvents[event] = fn;
			return mockCollector;
		},
		off: () => mockCollector,
		once: () => mockCollector,
		stop: noop,
		resetTimer: noop,
		// Never fire 'collect' or 'end' automatically — this is a dry run.
	};

	const mockMessage = {
		id: '000000000000000000',
		content: '',
		embeds: [],
		components: [],
		attachments: new Map(),
		channel: channel,
		author: channel?.guild?.members?.me?.user ?? {
			id: '0',
			username: 'MockBot',
			bot: true,
		},
		guild: channel?.guild ?? null,
		createdTimestamp: Date.now(),
		url: 'https://discord.com/channels/0/0/0',
		flags: { has: () => false },

		// Core message methods
		edit: async () => mockMessage,
		delete: asyncNoop,
		reply: async () => mockMessage,
		react: asyncNoop,
		pin: asyncNoop,
		unpin: asyncNoop,
		fetch: async () => mockMessage,
		crosspost: async () => mockMessage,
		suppressEmbeds: async () => mockMessage,
		removeAttachments: async () => mockMessage,
		startThread: async () => ({
			id: '000000000000000001',
			send: async () => mockMessage,
			join: asyncNoop,
		}),

		// Collectors — the most commonly missing thing
		createMessageComponentCollector: (options) => {
			void options;
			return mockCollector;
		},
		createReactionCollector: (options) => {
			void options;
			return mockCollector;
		},
		awaitMessageComponent: async () => ({
			customId: 'mock_custom_id',
			componentType: 2,
			deferUpdate: async () => {},
			update: async () => {},
			reply: async () => mockMessage,
			editReply: async () => mockMessage,
			followUp: async () => mockMessage,
			isButton: () => true,
			isStringSelectMenu: () => true,
			values: ['mock_value'],
			channel: channel,
			message: mockMessage,
		}),
		awaitReactions: async () => new Map(),

		// Permissions / misc
		inGuild: () => true,
		inCachedGuild: () => true,
		toString: () => '[Mock Message]',
	};

	return mockMessage;
}

// ─── Mock Interaction ─────────────────────────────────────────────────────────
/**
 * Creates a mock ChatInputCommandInteraction that looks exactly like what
 * Discord.js hands to a command's execute() function.
 *
 * @param {import('discord.js').ChatInputCommandInteraction} originalInteraction
 * @param {string} commandName
 * @param {Record<string,*>} optionsData - pre-populated option values
 */
function createMockInteraction(
	originalInteraction,
	commandName,
	optionsData,
	groupName = null,
	subcommandName = null,
) {
	let _replied = false;
	let _deferred = false;
	const _mockMessage = createMockMessage(originalInteraction.channel);

	// ── Options proxy ─────────────────────────────────────────────────────
	const guild = originalInteraction.guild;
	const firstRole = guild?.roles?.cache?.first() ?? null;
	const firstChannel =
		guild?.channels?.cache
			?.filter((c) => c.type === ChannelType.GuildText)
			?.first() ?? originalInteraction.channel;
	const firstMember =
		guild?.members?.cache?.first() ?? originalInteraction.member;
	const firstUser = firstMember?.user ?? originalInteraction.user;
	// const firstCategoryChannel = // Unused
	// 	guild?.channels?.cache
	// 		?.filter((c) => c.type === ChannelType.GuildCategory)
	// 		?.first() ?? null;

	// Mock attachment with a valid contentType (image/png)
	const mockAttachment = {
		id: '000000000000000000',
		url: 'https://cdn.discordapp.com/attachments/0/0/mock.png',
		proxyURL: 'https://media.discordapp.net/attachments/0/0/mock.png',
		name: 'mock.png',
		filename: 'mock.png',
		contentType: 'image/png',
		size: 1024,
		height: 100,
		width: 100,
		ephemeral: false,
		duration: null,
		waveform: null,
		description: null,
		title: null,
	};

	// Sensible defaults per option type
	const TYPE_DEFAULTS = {
		[ApplicationCommandOptionType.String]: 'test_string',
		[ApplicationCommandOptionType.Integer]: 1,
		[ApplicationCommandOptionType.Number]: 1.0,
		[ApplicationCommandOptionType.Boolean]: true,
		[ApplicationCommandOptionType.User]: firstUser,
		[ApplicationCommandOptionType.Member]: firstMember,
		[ApplicationCommandOptionType.Role]: firstRole,
		[ApplicationCommandOptionType.Channel]: firstChannel,
		[ApplicationCommandOptionType.Mentionable]: firstMember ?? firstRole,
		[ApplicationCommandOptionType.Attachment]: mockAttachment,
	};

	// Smart string defaults based on option name — avoids DB/validation errors
	const STRING_NAME_DEFAULTS = {
		color: '#FFFFFF',
		embed_color: '#FFFFFF',
		embed_colour: '#FFFFFF',
		rarity: 'common',
		status: 'active',
		type: 'text',
		mode: 'default',
		hex: '#FFFFFF',
		url: 'https://example.com',
		image: 'https://example.com/image.png',
		banner: 'https://example.com/banner.png',
		emoji: '😀',
		link: 'https://example.com',
		message: 'Test message',
		reason: 'Testing',
		description: 'Test description',
		code: 'TESTCODE',
		id: '1',
		order_id: '1',
		message_id: '000000000000000000',
		bonus_type: 'coin',
		trigger: 'test_trigger',
		ip: '127.0.0.1',
		port: '25565',
	};

	const resolveString = (name) => {
		const key = name?.toLowerCase().replace(/-/g, '_');
		return (
			STRING_NAME_DEFAULTS[key] ??
			TYPE_DEFAULTS[ApplicationCommandOptionType.String]
		);
	};

	const mockOptions = {
		// Subcommands
		getSubcommand: (required = false) => {
			void required;
			return subcommandName;
		},
		getSubcommandGroup: (required = false) => {
			void required;
			return groupName;
		},

		// Typed getters — all follow the same pattern
		getString: (name, required = false) => {
			void required;
			return optionsData[name] ?? resolveString(name);
		},
		getInteger: (name, required = false) => {
			void required;
			return (
				optionsData[name] ?? TYPE_DEFAULTS[ApplicationCommandOptionType.Integer]
			);
		},
		getNumber: (name, required = false) => {
			void required;
			return (
				optionsData[name] ?? TYPE_DEFAULTS[ApplicationCommandOptionType.Number]
			);
		},
		getBoolean: (name, required = false) => {
			void required;
			return (
				optionsData[name] ?? TYPE_DEFAULTS[ApplicationCommandOptionType.Boolean]
			);
		},
		getUser: (name, required = false) => {
			void required;
			return optionsData[name] ?? firstUser;
		},
		getMember: (name, required = false) => {
			void required;
			return optionsData[name] ?? firstMember;
		},
		getRole: (name, required = false) => {
			void required;
			return optionsData[name] ?? firstRole;
		},
		getChannel: (name, required = false) => {
			void required;
			return optionsData[name] ?? firstChannel;
		},
		getMentionable: (name, required = false) => {
			void required;
			return optionsData[name] ?? firstMember ?? firstRole;
		},
		getAttachment: (name, required = false) => {
			void required;
			return optionsData[name] ?? mockAttachment;
		},

		// Focused option (autocomplete)
		getFocused: (full = false) => {
			void full;
			return full
				? {
						name: 'query',
						value: 'test',
						focused: true,
						type: ApplicationCommandOptionType.String,
					}
				: 'test';
		},

		// Generic resolved getter
		get: (name, required = false) => {
			void required;
			return optionsData[name] ?? null;
		},

		// Resolved data (users, members, roles, channels, attachments)
		resolved: {
			users: new Map(),
			members: new Map(),
			roles: new Map(),
			channels: new Map(),
			attachments: new Map([[mockAttachment.id, mockAttachment]]),
			messages: new Map(),
		},

		data: [],
		_group: null,
		_subcommand: null,
		_hoistedOptions: [],
	};

	// ── Interaction object ────────────────────────────────────────────────
	return {
		// ── Identity ──────────────────────────────────────────────────────
		id: '000000000000000000',
		applicationId: originalInteraction.applicationId,
		token: 'mock_token',
		version: 1,
		type: 2, // APPLICATION_COMMAND
		commandType: 1, // CHAT_INPUT
		commandName: commandName,
		commandId: '000000000000000000',
		commandGuildId: guild?.id ?? null,
		appPermissions: originalInteraction.appPermissions ?? null,
		locale: originalInteraction.locale ?? 'en-US',
		guildLocale: originalInteraction.guildLocale ?? 'en-US',
		createdTimestamp: Date.now(),
		deferred: false,
		replied: false,
		ephemeral: null,

		// ── Context ───────────────────────────────────────────────────────
		client: originalInteraction.client,
		guild: guild,
		channel: originalInteraction.channel,
		channelId: originalInteraction.channelId,
		guildId: guild?.id ?? null,
		user: originalInteraction.user,
		member: originalInteraction.member,
		memberPermissions: originalInteraction.memberPermissions ?? null,

		// ── Options ───────────────────────────────────────────────────────
		options: mockOptions,

		// ── Reply methods — all resolve with a MockMessage ────────────────
		deferReply: (options) => {
			void options;
			_deferred = true;
			return _mockMessage;
		},
		reply: (options) => {
			void options;
			_replied = true;
			return _mockMessage;
		},
		editReply: (options) => {
			void options;
			_replied = true;
			return _mockMessage;
		},
		followUp: (options) => {
			void options;
			return _mockMessage;
		},
		deleteReply: async () => {},
		fetchReply: async () => _mockMessage,
		deferUpdate: async () => {},
		update: async () => _mockMessage,
		showModal: async () => {},
		awaitModalSubmit: async () => ({
			customId: 'mock_modal_id',
			deferUpdate: async () => {},
			deferReply: async () => _mockMessage,
			update: async () => {},
			reply: async () => _mockMessage,
			editReply: async () => _mockMessage,
			followUp: async () => _mockMessage,
			user: firstUser,
			member: firstMember,
			guild: guild,
			channel: firstChannel,
			fields: {
				getTextInputValue: () => 'mock_text_input_value',
			},
			isModalSubmit: () => true,
		}),

		// ── Utility ───────────────────────────────────────────────────────
		isCommand: () => true,
		isChatInputCommand: () => true,
		isContextMenuCommand: () => false,
		isUserContextMenuCommand: () => false,
		isMessageContextMenuCommand: () => false,
		isAutocomplete: () => false,
		isButton: () => false,
		isSelectMenu: () => false,
		isStringSelectMenu: () => false,
		isModalSubmit: () => false,
		isRepliable: () => true,
		inGuild: () => !!guild,
		inCachedGuild: () => !!guild,
		toString: () => `[MockInteraction: ${commandName}]`,

		// ── Internal helpers (testall introspection) ──────────────────────
		_hasReplied: () => _replied,
		_isDeferred: () => _deferred,
	};
}

function createForwardingMockInteraction(
	originalInteraction,
	commandName,
	optionsData,
	groupName = null,
	subcommandName = null,
) {
	const realChannel = originalInteraction.channel;
	const mockBase = createMockInteraction(
		originalInteraction,
		commandName,
		optionsData,
		groupName,
		subcommandName,
	);

	// The collector on interaction.channel (some commands call this directly)
	const collectorEvents = {};
	const mockCollector = {
		on(event, fn) {
			collectorEvents[event] = fn;
			return mockCollector;
		},
		off: () => mockCollector,
		once: () => mockCollector,
		stop: () => {},
		resetTimer: () => {},
	};

	let _replied = false;
	let _deferred = false;

	// Forward any reply payload to the real channel so the user sees it
	const forward = async (payload) => {
		if (!payload) return createMockMessage(realChannel);
		try {
			// Strip ephemeral flag for forwarding so it actually shows
			const sent =
				payload.flags !== undefined
					? await realChannel.send({ ...payload, flags: payload.flags & ~64 })
					: await realChannel.send(payload);
			// Attach collector stubs onto real message
			return sent;
		} catch (_e) {
			return createMockMessage(realChannel);
		}
	};

	return {
		...mockBase,
		// Expose a real channel reference (used by eco give etc.)
		channel: Object.assign(Object.create(realChannel || {}), {
			createMessageComponentCollector: (_opts) => mockCollector,
			createReactionCollector: (_opts) => mockCollector,
			permissionOverwrites: {
				edit: async () => {},
				delete: async () => {},
				create: async () => {},
			},
			send: async () => createMockMessage(realChannel),
		}),
		deferReply: (options) => {
			void options;
			_deferred = true;
			return createMockMessage(realChannel);
		},
		reply: (payload) => {
			_replied = true;
			return forward(payload);
		},
		editReply: (payload) => {
			_replied = true;
			return forward(payload);
		},
		followUp: (payload) => {
			return forward(payload);
		},
		_hasReplied: () => _replied,
		_isDeferred: () => _deferred,
	};
}
module.exports = {
	createMockMessage,
	createMockInteraction,
	createForwardingMockInteraction,
	BLACKLIST_COMMANDS,
};
