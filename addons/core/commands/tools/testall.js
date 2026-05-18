/**
 * @namespace: addons/core/commands/tools/testall.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const {
	SlashCommandBuilder,
	MessageFlags,
	PermissionFlagsBits,
	ApplicationCommandOptionType,
	ChannelType,
	ContainerBuilder,
	TextDisplayBuilder,
} = require('discord.js');

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

// ─── Mock Message ─────────────────────────────────────────────────────────────
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
		bonus_type: 'xp',
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
	slashCommand: new SlashCommandBuilder()
		.setName('testall')
		.setDescription(
			'🛠️ Developer Tool: Test all registered commands (DRY RUN-ish).',
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	ownerOnly: true,
	mainGuildOnly: true,
	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { logger } = container;

		// Acknowledge immediately so the interaction token stays alive
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const results = {
			success: [],
			failed: [],
			skipped: [],
		};

		const schema = interaction.client.applicationCommandsData;
		if (!schema || schema.length === 0) {
			return interaction.editReply('❌ No command schema found to test.');
		}

		let totalCommands = 0;
		// Count all testable endpoints
		const countEndpoints = (cmd) => {
			if (cmd.type === 2 || cmd.type === 3) return 1; // context menu
			if (!cmd.options || cmd.options.length === 0) return 1;

			const hasSubcommands = cmd.options.some(
				(opt) => opt.type === 1 || opt.type === 2,
			);
			if (!hasSubcommands) return 1;

			let count = 0;
			for (const opt of cmd.options) {
				if (opt.type === 1) count++; // subcommand
				if (opt.type === 2 && opt.options) {
					// group
					count += opt.options.filter((o) => o.type === 1).length;
				}
			}
			return count;
		};

		totalCommands = schema.reduce((acc, cmd) => acc + countEndpoints(cmd), 0);
		let processed = 0;

		// Patch KythiaModel to prevent testall tight-loop pendingQueries race conditions
		const KythiaModel = Object.getPrototypeOf(container.models.ServerSetting);
		const origFindOrCreate = KythiaModel.findOrCreateWithCache;
		if (origFindOrCreate) {
			KythiaModel.findOrCreateWithCache = async function (options) {
				const res = await origFindOrCreate.call(this, options);
				// If a race causes it to return just the instance instead of [instance, created]
				if (res && typeof res === 'object' && !Array.isArray(res)) {
					return [res, false];
				}
				return res;
			};
		}

		await interaction.editReply(
			`🔄 Starting test of ${totalCommands} commands...`,
		);

		// Recursive testing function
		const testCommandNode = async (
			cmdNode,
			rootName,
			groupName = null,
			subcommandName = null,
		) => {
			processed++;

			const fullPath = [rootName, groupName, subcommandName]
				.filter(Boolean)
				.join(' ');

			if (
				BLACKLIST_COMMANDS.some((blacklisted) =>
					fullPath.startsWith(blacklisted),
				)
			) {
				results.skipped.push(fullPath);
				return;
			}

			// Retrieve the actual command handler from the client collection
			let commandModule = interaction.client.commands.get(fullPath);

			if (!commandModule && (groupName || subcommandName)) {
				commandModule = interaction.client.commands.get(rootName);
			}

			if (!commandModule?.execute) {
				results.skipped.push(`${fullPath} (no handler/execute)`);
				return;
			}

			// Build option data exactly as the schema dictates
			const optionsData = {};
			if (cmdNode.options) {
				for (const opt of cmdNode.options) {
					const optName = opt.name;
					const optType = opt.type;
					const guild = interaction.guild;

					if (optType === ApplicationCommandOptionType.Role) {
						optionsData[optName] =
							guild?.roles?.cache
								?.filter((r) => !r.managed && r.id !== guild.id)
								?.random() ??
							guild?.roles?.cache?.first() ??
							null;
					} else if (optType === ApplicationCommandOptionType.User) {
						const member = guild?.members?.cache?.random();
						optionsData[optName] = member?.user ?? interaction.user;
					} else if (optType === ApplicationCommandOptionType.Member) {
						optionsData[optName] =
							guild?.members?.cache?.random() ?? interaction.member;
					} else if (optType === ApplicationCommandOptionType.Channel) {
						const allowedTypes = opt.channel_types ?? [];
						const wantsCategory = allowedTypes.includes(
							ChannelType.GuildCategory,
						);
						if (wantsCategory) {
							optionsData[optName] =
								guild?.channels?.cache
									?.filter((c) => c.type === ChannelType.GuildCategory)
									?.first() ?? null;
						} else if (allowedTypes.length > 0) {
							optionsData[optName] =
								guild?.channels?.cache
									?.filter((c) => allowedTypes.includes(c.type))
									?.random() ?? interaction.channel;
						} else {
							optionsData[optName] =
								guild?.channels?.cache
									?.filter((c) => c.type === ChannelType.GuildText)
									?.random() ?? interaction.channel;
						}
					} else if (optType === ApplicationCommandOptionType.Mentionable) {
						optionsData[optName] =
							guild?.members?.cache?.random() ??
							guild?.roles?.cache?.first() ??
							interaction.member;
					}
				}
			}

			try {
				const mock = createForwardingMockInteraction(
					interaction,
					rootName,
					optionsData,
					groupName,
					subcommandName,
				);
				logger.info(`🧪 Testing command: ${fullPath}`, { label: 'core' });

				await commandModule.execute(mock, container);

				if (mock._hasReplied() || mock._isDeferred()) {
					results.success.push(fullPath);
				} else {
					results.failed.push({ name: fullPath, reason: 'no reply' });
				}
			} catch (err) {
				logger.error(`Test failed for ${fullPath}: ${err.message || err}`, {
					label: 'testall',
				});
				results.failed.push({ name: fullPath, reason: err.message });
			}

			await new Promise((r) => setTimeout(r, 100));
		};

		for (const cmd of schema) {
			// Traverse context menus and simple slash commands
			if (cmd.type === 2 || cmd.type === 3) {
				await testCommandNode(cmd, cmd.name);
				continue;
			}

			const hasSubcommands = cmd.options?.some(
				(opt) => opt.type === 1 || opt.type === 2,
			);
			if (!hasSubcommands) {
				await testCommandNode(cmd, cmd.name);
				continue;
			}

			// Traverse subcommands and groups
			for (const opt of cmd.options || []) {
				if (opt.type === 1) {
					// subcommand
					await testCommandNode(opt, cmd.name, null, opt.name);
				} else if (opt.type === 2) {
					// group
					for (const sub of opt.options || []) {
						if (sub.type === 1) {
							// subcommand in group
							await testCommandNode(sub, cmd.name, opt.name, sub.name);
						}
					}
				}
			}
		}

		// Restore KythiaModel
		if (origFindOrCreate) {
			KythiaModel.findOrCreateWithCache = origFindOrCreate;
		}

		// ── Build a beautiful Components V2 report ────────────────────────────
		const { helpers, kythiaConfig: cfg } = container;
		const { convertColor } = helpers.color;
		const accentColor = convertColor(cfg.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		// Chunk long lists into segments that each fit in one TextDisplay (~1800 chars)
		const chunk = (arr) => {
			if (arr.length === 0) return [`*None*`];
			const lines = [];
			let current = '';
			for (const item of arr) {
				const next = current ? `${current}, ${item}` : item;
				if (next.length > 1800) {
					lines.push(current);
					current = item;
				} else current = next;
			}
			if (current) lines.push(current);
			return lines;
		};

		// Helper: send a ContainerBuilder and swallow errors
		const sendContainer = async (container) => {
			try {
				await interaction.channel.send({
					components: [container],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (err) {
				logger.error(
					`testall: failed to send report chunk: ${err.message || err}`,
					{
						label: 'testall',
					},
				);
			}
		};

		const successRate =
			totalCommands > 0
				? Math.round(
						(results.success.length /
							(results.success.length + results.failed.length || 1)) *
							100,
					)
				: 100;
		const statusLine =
			results.failed.length === 0
				? '✅ **All commands passed!**'
				: `⚠️ **${results.failed.length} command(s) need attention**`;

		// ── Message 1: Header ─────────────────────────────────────────────────
		const headerContainer = new ContainerBuilder().setAccentColor(accentColor);
		headerContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## 🧪 Command Test Results\n${statusLine}\n-# Tested **${processed}/${totalCommands}** commands · Pass rate **${successRate}%** · <t:${Math.floor(Date.now() / 1000)}:R>`,
			),
		);
		await sendContainer(headerContainer);

		// ── Message 2: Success section ────────────────────────────────────────
		const successHeaderContainer = new ContainerBuilder().setAccentColor(
			accentColor,
		);
		successHeaderContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`### ✅ Passed (${results.success.length})`,
			),
		);
		await sendContainer(successHeaderContainer);

		for (const line of chunk(results.success)) {
			const successContainer = new ContainerBuilder().setAccentColor(
				accentColor,
			);
			successContainer.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(`\`\`\`${line}\`\`\``),
			);
			await sendContainer(successContainer);
		}

		// ── Message 3: Failures section ───────────────────────────────────────
		if (results.failed.length > 0) {
			// Render each failure as its own line: `name` — truncated reason
			// Cap reason at 120 chars so nothing wraps out of control
			const MAX_REASON = 120;
			const failedLines = results.failed.map(({ name: n, reason }) => {
				const short =
					reason.length > MAX_REASON
						? `${reason.slice(0, MAX_REASON)}…`
						: reason;
				return `\`${n}\` — ${short}`;
			});

			// Split into containers of ≤1800 chars each
			const failedChunks = [];
			let buf = '';
			for (const line of failedLines) {
				const next = buf ? `${buf}\n${line}` : line;
				if (next.length > 1800) {
					failedChunks.push(buf);
					buf = line;
				} else buf = next;
			}
			if (buf) failedChunks.push(buf);

			// Send the header, then each chunk as a separate container to avoid the 4000 char per component max
			const headerContainer = new ContainerBuilder().setAccentColor(
				accentColor,
			);
			headerContainer.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`### ❌ Failed (${results.failed.length})`,
				),
			);
			await sendContainer(headerContainer);

			for (const chunk of failedChunks) {
				const failedContainer = new ContainerBuilder().setAccentColor(
					accentColor,
				);
				failedContainer.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(chunk),
				);
				await sendContainer(failedContainer);
			}
		}

		// ── Message 4: Skipped section ────────────────────────────────────────
		if (results.skipped.length > 0) {
			const skippedHeaderContainer = new ContainerBuilder().setAccentColor(
				accentColor,
			);
			skippedHeaderContainer.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`### ⏭️ Skipped (${results.skipped.length})`,
				),
			);
			await sendContainer(skippedHeaderContainer);

			for (const line of chunk(results.skipped)) {
				const skippedContainer = new ContainerBuilder().setAccentColor(
					accentColor,
				);
				skippedContainer.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(`-# ${line}`),
				);
				await sendContainer(skippedContainer);
			}
		}

		// ── Message 5: Footer ─────────────────────────────────────────────────
		const footerContainer = new ContainerBuilder().setAccentColor(accentColor);
		footerContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`-# 🛠️ ${interaction.client.user.username} · Developer Dry-Run`,
			),
		);
		await sendContainer(footerContainer);

		await interaction
			.editReply({ content: '✅ Done! Results posted above.' })
			.catch((err) =>
				logger.warn(`testall editReply failed: ${err.message || err}`, {
					label: 'core',
				}),
			);
	},
};
