/**
 * @namespace: addons/core/helpers/handlers/PrefixCommandHandler.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { utils } = require('kythia-core');
const {
	Collection,
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');

// Flags that must be stripped when forwarding to a real Message reply.
// Ephemeral is interaction-only; IsComponentsV2 must be removed when no
// components are present (we keep it when components exist, since Discord.js
// message.reply() accepts it on newer library versions).
const STRIP_FLAGS = MessageFlags.Ephemeral | (MessageFlags.SuppressEmbeds ?? 0);
class PrefixCommandHandler {
	/**
	 * Primary entry-point. Called from the messageCreate event.
	 * @param {import('discord.js').Message} message
	 * @param {KythiaDI.Container} container
	 * @returns {Promise<boolean>} true if the message was consumed as a command
	 */
	async handle(message, container) {
		// ── 1. Resolve active prefix set ──────────────────────────────────
		const { kythiaConfig, models, logger } = container;
		const { ServerSetting } = models;
		if (message.author?.bot) return false;
		const contentLower = message.content.toLowerCase();
		const serverSetting = message.guild
			? await ServerSetting.getCache({
					guildId: message.guild.id,
				}).catch(() => null)
			: null;
		const customPrefix = serverSetting?.prefix;
		const allPrefixes = [...kythiaConfig.bot.prefixes];
		if (customPrefix) allPrefixes.push(customPrefix);
		const matchedPrefix = this._findMatchedPrefix(contentLower, allPrefixes);
		if (!matchedPrefix) return false;

		// ── 2. Parse command name & raw arguments ──────────────────────────
		const contentAfterPrefix = message.content
			.slice(matchedPrefix.length)
			.trim();
		if (!contentAfterPrefix) return false; // bare prefix, ignore

		const args = contentAfterPrefix.split(/ +/);
		const commandName = args.shift().toLowerCase();
		if (!commandName) return false;

		// ── 3. Locate the base command (by name or alias) ──────────────────
		const baseCommand = this._findCommand(commandName, message.client);
		if (!baseCommand) return false;

		// Allow commands to opt-out of prefix mode entirely
		if (baseCommand.prefixDisabled === true) return false;

		// Resolve the actual registered slash command name.
		// This is CRITICAL when an alias is used (e.g. !m → 'music').
		// InteractionFactory looks up client.commands.get(name) internally to
		// parse subcommands — it won't find anything if we pass the alias.
		const actualCommandName =
			baseCommand.slashCommand?.name ?? baseCommand.data?.name ?? commandName;
		const slashData = baseCommand.slashCommand ?? baseCommand.data;
		const topOptions = slashData?.options ?? [];

		// ── 4. Handle defaultArgument shortcut ─────────────────────────────
		// Format: 'subcommand:optionName'  e.g. 'play:search'
		// If the first word isn't a known subcommand/group, inject the default
		// subcommand directly into the `args` array BEFORE parsing.
		if (baseCommand.defaultArgument && args.length > 0) {
			const defaultSub = baseCommand.defaultArgument;
			const colonIdx = defaultSub.indexOf(':');
			if (colonIdx !== -1) {
				const subName = defaultSub.slice(0, colonIdx);
				const topLevelNames = topOptions.map((o) => o.name);
				const firstWord = args[0]?.toLowerCase();
				if (!topLevelNames.includes(firstWord)) {
					// e.g. ['jennie', 'solo'] → ['play', 'jennie', 'solo']
					args.unshift(subName);
				}
			}
		}

		// ── 5. Smart args string builder ──────────────────────────────────
		// Problem: InteractionFactory splits args by whitespace, so
		// "play jennie solo" → ['play','jennie','solo'] and only the first
		// word maps to the `search` option — "solo" is silently dropped.
		//
		// Fix: detect structural args (subcommand / group names) from the
		// slash schema, then quote any multi-word positional remainder so
		// the factory treats it as a single token.
		//
		// Examples:
		//  !m play jennie solo     → 'play "jennie solo"'        ✓
		//  !music playback loop queue → 'playback loop queue'     ✓  (single word)
		//  !m play https://...     → 'play "https://..."'         ✓  (URL, single token)
		//  !m jennie solo          → 'play "jennie solo"'        ✓  (via defaultArgument)

		/** True for a named arg like `search:value` but NOT a URL like `https://…` */
		const isNamedArg = (token) => {
			const ci = token.indexOf(':');
			if (ci <= 0) return false;
			const key = token.slice(0, ci);
			const val = token.slice(ci + 1);
			return (
				/^[a-zA-Z_]\w*$/.test(key) && val.length > 0 && !val.startsWith('//')
			);
		};
		let remainingArgsString;
		{
			let cursor = 0; // how many leading args are structural

			const first = args[0]?.toLowerCase();
			const firstOpt = first && topOptions.find((o) => o.name === first);
			if (firstOpt) {
				cursor = 1; // first arg is a known sub or group name

				// If it's a subcommand group, peek at the second arg for the sub name
				const isGroup =
					firstOpt.type === 2 ||
					firstOpt.constructor?.name === 'SlashCommandSubcommandGroupBuilder';
				if (isGroup && args[1]) {
					const second = args[1].toLowerCase();
					const groupSubs = firstOpt.options ?? [];
					if (groupSubs.some((o) => o.name === second)) cursor = 2;
				}
			}
			const structuralParts = args.slice(0, cursor);
			const valueParts = args.slice(cursor);
			const named = valueParts.filter(isNamedArg);
			const positional = valueParts.filter((a) => !isNamedArg(a));
			const out = [...structuralParts];
			if (positional.length > 1) {
				// Multi-word value → wrap in quotes so factory treats it as one token
				out.push(`"${positional.join(' ')}"`);
			} else {
				out.push(...positional);
			}
			out.push(...named);
			remainingArgsString = out.join(' ');
		}

		// ── 6. Build the fakeInteraction via InteractionFactory ────────────
		//    Pass actualCommandName (e.g. 'music') NOT the alias ('m') so that
		//    InteractionFactory can resolve the slash command's option schema.
		const fakeInteraction = utils.InteractionFactory.create(
			message,
			actualCommandName,
			remainingArgsString,
		);

		// ── 6. Override reply/edit/followUp to use message.reply() ─────────
		//    InteractionFactory defaults to channel.send() (no reply reference).
		//    We also normalise payloads here so command code stays clean.
		let _replied = false;
		let _replyMessage = null;

		/**
		 * Normalise a reply payload for prefix-command context:
		 *  - Coerce string → object
		 *  - Strip interaction-only flags
		 *  - Inject zero-width space when payload only contains components
		 *    (Discord API rejects truly empty messages)
		 * @param {string|object} opts
		 * @returns {object}
		 */
		const _buildPayload = (opts) => {
			const payload =
				typeof opts === 'string'
					? {
							content: opts,
						}
					: {
							...opts,
						};

			const hasText = Boolean(payload.content);
			const hasEmbeds =
				Array.isArray(payload.embeds) && payload.embeds.length > 0;
			const hasFiles = Array.isArray(payload.files) && payload.files.length > 0;
			const hasComponents =
				Array.isArray(payload.components) && payload.components.length > 0;

			// Strip Ephemeral and other interaction-only flags
			if (payload.flags != null) {
				payload.flags &= ~STRIP_FLAGS;
				// Also strip IsComponentsV2 if there are actually no components
				if (!hasComponents) {
					payload.flags &= ~(MessageFlags.IsComponentsV2 || 0);
				}
				// If flags is now 0, remove the key entirely to avoid API errors
				if (payload.flags === 0) delete payload.flags;
			}

			if (!hasText && !hasEmbeds && !hasFiles && !hasComponents) {
				// Completely empty payload!
				payload.content = '\u200b';
			} else if (!hasText && !hasEmbeds && !hasFiles && hasComponents) {
				// When IS_COMPONENTS_V2 flag is set, Discord FORBIDS the 'content' field —
				// components alone satisfy the non-empty requirement in that mode.
				// For regular components (no V2 flag), inject a zero-width space.
				const isComponentsV2Mode =
					payload.flags != null &&
					Boolean(payload.flags & MessageFlags.IsComponentsV2);
				if (!isComponentsV2Mode) {
					payload.content = '\u200b';
				}
			}

			return payload;
		};
		fakeInteraction.reply = async (opts) => {
			const payload = _buildPayload(opts);
			if (_replied) {
				// Already replied → edit the existing message instead
				if (_replyMessage) {
					_replyMessage = await _replyMessage.edit(payload);
				} else {
					_replyMessage = await message.reply(payload);
				}
				return _replyMessage;
			}
			_replied = true;
			_replyMessage = await message.reply(payload);
			return _replyMessage;
		};
		fakeInteraction.editReply = async (opts) => {
			const payload = _buildPayload(opts);
			try {
				if (_replyMessage) {
					_replyMessage = await _replyMessage.edit(payload);
				} else {
					// No prior reply yet — send fresh
					_replyMessage = await message.reply(payload);
				}
				_replied = true;
				return _replyMessage;
			} catch (err) {
				logger.error(
					'Raw editReply API error payload:',
					JSON.stringify(err.rawError),
				);
				throw err;
			}
		};
		fakeInteraction.followUp = (opts) => {
			const payload = _buildPayload(opts);
			return message.reply(payload);
		};
		fakeInteraction.deferReply = () => {
			// Mark as deferred so editReply() sends a fresh reply instead of throwing.
			// No typing indicator — prefix commands respond instantly.
			_replied = true;
			return Promise.resolve(null);
		};
		fakeInteraction.fetchReply = () => Promise.resolve(_replyMessage);
		fakeInteraction.deleteReply = async () => {
			if (_replyMessage) {
				await _replyMessage.delete().catch(() => {});
				_replyMessage = null;
			}
		};

		// ── 7. Resolve final command (with subcommand key) ──────────────────
		const subcommand = fakeInteraction.options.getSubcommand(false);
		const subcommandGroup = fakeInteraction.options.getSubcommandGroup(false);

		// Build the lookup key using the REAL command name (not alias)
		let finalCommandKey = actualCommandName;
		if (subcommandGroup && subcommand)
			finalCommandKey = `${actualCommandName} ${subcommandGroup} ${subcommand}`;
		else if (subcommand) finalCommandKey = `${actualCommandName} ${subcommand}`;
		const finalCommand =
			message.client.commands.get(finalCommandKey) ||
			[...message.client.commands.values()].find(
				(cmd) =>
					Array.isArray(cmd.aliases) &&
					(cmd.aliases.map((a) => a.toLowerCase()).includes(finalCommandKey) ||
						cmd.aliases.map((a) => a.toLowerCase()).includes(commandName)),
			) ||
			baseCommand;
		if (!finalCommand) return false;

		// ── 8. Permission gate ─────────────────────────────────────────────
		const permissionCheck = await this._validatePermissions(
			finalCommand,
			message,
			container,
		);
		if (!permissionCheck.allowed) {
			if (permissionCheck.response) {
				const permPayload = _buildPayload(permissionCheck.response);
				await message.reply(permPayload).catch(() => {});
			}
			return true;
		}

		// ── 9. Cooldown gate ───────────────────────────────────────────────
		const cooldownCheck = await this._checkCooldown(
			finalCommand,
			finalCommandKey,
			message,
			container,
		);
		if (!cooldownCheck.allowed) {
			if (cooldownCheck.response) await cooldownCheck.response;
			return true;
		}

		// ── 10. Execute ────────────────────────────────────────────────────
		if (serverSetting?.deleteCommandMessages && message.deletable) {
			message.delete().catch(() => {});
		}
		await this._executeCommand(
			finalCommand,
			fakeInteraction,
			finalCommandKey,
			commandName,
			container,
		);
		return true;
	}

	// ─── Private helpers ─────────────────────────────────────────────────────

	/**
	 * Find the first prefix that matches the start of the lowercased content.
	 * Longer prefixes take priority over shorter ones to avoid false matches.
	 * @param {string} contentLower
	 * @param {string[]} allPrefixes
	 * @returns {string|undefined}
	 */
	_findMatchedPrefix(contentLower, allPrefixes) {
		// Sort descending by length so "!!" matches before "!"
		return [...allPrefixes]
			.sort((a, b) => b.length - a.length)
			.find((prefix) => contentLower.startsWith(prefix.toLowerCase()));
	}

	/**
	 * Locate a command by its registered name or one of its aliases.
	 * @param {string} commandName
	 * @param {import('discord.js').Client} client
	 * @returns {object|undefined}
	 */
	_findCommand(commandName, client) {
		return (
			client.commands.get(commandName) ||
			[...client.commands.values()].find(
				(cmd) =>
					Array.isArray(cmd.aliases) &&
					cmd.aliases.map((a) => a.toLowerCase()).includes(commandName),
			)
		);
	}

	/**
	 * Full permission validation:
	 *  guildOnly → ownerOnly → userPerms → botPerms → isInMainGuild → voteLocked
	 */
	async _validatePermissions(command, message, container) {
		const { kythiaConfig, helpers, t, logger, models } = container;
		const { isOwner } = helpers.discord;
		const { convertColor } = helpers.color;
		const { KythiaVoter } = models;

		// Guild-only
		if (command.guildOnly && !message.guild)
			return {
				allowed: false,
			};

		// Owner-only
		if (command.ownerOnly && !isOwner(message.author.id))
			return {
				allowed: false,
			};

		// User permissions
		if (command.permissions && message.member) {
			if (message.member.permissions.missing(command.permissions).length > 0) {
				return {
					allowed: false,
				};
			}
		}

		// Bot permissions
		if (command.botPermissions && message.guild) {
			if (
				message.guild.members.me?.permissions.missing(command.botPermissions)
					.length > 0
			) {
				return {
					allowed: false,
				};
			}
		}

		// Main-guild membership check (sharded + non-sharded)
		if (command.isInMainGuild) {
			const mainGuildId = kythiaConfig.bot.mainGuildId;
			if (!mainGuildId) {
				logger.error('mainGuildId not set in config.', {
					label: 'PrefixCommandHandler',
				});
			}
			let isMember = false;
			let mainGuildName = 'Support Server';
			try {
				if (message.client.shard) {
					const results = await message.client.shard.broadcastEval(
						async (c, { gId, uId }) => {
							const shardId =
								require('discord.js').ShardClientUtil.shardIdForGuildId(
									gId,
									c.shard.count,
								);
							if (!c.shard.ids.includes(shardId)) return null;
							const g = await c.container.helpers.discord.getGuildSafe(c, gId);
							if (!g) return null;
							try {
								await helpers.discord.getMemberSafe(g, uId);
								return {
									isMember: true,
									name: g.name,
								};
							} catch {
								return {
									isMember: false,
									name: g.name,
								};
							}
						},
						{
							context: {
								gId: mainGuildId,
								uId: message.author.id,
							},
						},
					);
					const hit = results.find((r) => r !== null);
					if (hit) {
						isMember = hit.isMember;
						mainGuildName = hit.name;
					} else {
						return {
							allowed: true,
						}; // guild not found on any shard → fail open
					}
				} else {
					const mainGuild = await this.container.helpers.discord.getGuildSafe(
						message.client,
						mainGuildId,
					);
					if (!mainGuild) {
						logger.error(`Bot is not a member of main guild: ${mainGuildId}`, {
							label: 'PrefixCommandHandler',
						});
						return {
							allowed: true,
						}; // fail open
					}
					mainGuildName = mainGuild.name;
					try {
						await helpers.discord.getMemberSafe(mainGuild, message.author.id);
						isMember = true;
					} catch {
						isMember = false;
					}
				}
			} catch (err) {
				logger.error(`isInMainGuild check failed: ${err.message}`, {
					label: 'PrefixCommandHandler',
				});
				return {
					allowed: true,
				}; // fail open
			}
			if (!isMember) {
				const accent = convertColor(kythiaConfig.bot.color, {
					from: 'hex',
					to: 'decimal',
				});
				const errorContainer = new ContainerBuilder()
					.setAccentColor(accent)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(message, 'common.error.not.in.main.guild.text', {
								name: mainGuildName,
							}),
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addActionRowComponents(
						new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setLabel(
									await t(
										message,
										'common.error.not.in.main.guild.button.join',
									),
								)
								.setStyle(ButtonStyle.Link)
								.setURL(kythiaConfig.settings.supportServer),
						),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(message, 'common.container.footer', {
								username: message.client.user.username,
							}),
						),
					);
				return {
					allowed: false,
					response: {
						components: [errorContainer],
						flags: MessageFlags.IsComponentsV2,
					},
				};
			}
		}

		// Vote-locked
		if (command.voteLocked && !isOwner(message.author.id)) {
			const voter = await KythiaVoter.getCache({
				userId: message.author.id,
			}).catch(() => null);
			const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
			if (!voter || voter.votedAt < twelveHoursAgo) {
				const accent = convertColor(kythiaConfig.bot.color, {
					from: 'hex',
					to: 'decimal',
				});
				const voteContainer = new ContainerBuilder()
					.setAccentColor(accent)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(message, 'common.error.vote.locked.text'),
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addActionRowComponents(
						new ActionRowBuilder().addComponents(
							new ButtonBuilder()
								.setLabel(
									await t(message, 'common.error.vote.locked.button', {
										username: message.client.user.username,
									}),
								)
								.setStyle(ButtonStyle.Link)
								.setURL(`https://top.gg/bot/${kythiaConfig.bot.clientId}/vote`),
						),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					)
					.addTextDisplayComponents(
						new TextDisplayBuilder().setContent(
							await t(message, 'common.container.footer'),
						),
					);
				return {
					allowed: false,
					response: {
						components: [voteContainer],
						flags: MessageFlags.IsComponentsV2,
					},
				};
			}
		}
		return {
			allowed: true,
		};
	}

	/**
	 * Per-user cooldown check. Owners are always exempt.
	 */
	async _checkCooldown(command, commandKey, message, container) {
		const { kythiaConfig, helpers, t } = container;
		const { isOwner } = helpers.discord;
		const cooldownDuration =
			command.cooldown ?? kythiaConfig.bot.globalCommandCooldown ?? 0;
		if (cooldownDuration <= 0 || isOwner(message.author.id)) {
			return {
				allowed: true,
			};
		}
		const { cooldowns } = message.client;
		if (!cooldowns.has(commandKey)) {
			cooldowns.set(commandKey, new Collection());
		}
		const now = Date.now();
		const timestamps = cooldowns.get(commandKey);
		const cooldownAmount = cooldownDuration * 1000;
		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				const reply = await t(message, 'common.error.cooldown', {
					time: timeLeft.toFixed(1),
				});
				return {
					allowed: false,
					response: message
						.reply(reply)
						.then((msg) => setTimeout(() => msg.delete().catch(() => {}), 5000))
						.catch(() => {}),
				};
			}
		}
		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
		return {
			allowed: true,
		};
	}

	/**
	 * Execute the resolved command. Falls back to a helpful "use /command"
	 * hint when the matched object has no `execute` function (e.g. group root).
	 */
	async _executeCommand(
		command,
		fakeInteraction,
		commandKey,
		commandName,
		container,
	) {
		const { t, logger } = container;
		try {
			if (typeof command.execute === 'function') {
				await command.execute(fakeInteraction, container);
			} else {
				// Command object has no execute — likely a parent command without a handler.
				// Guide the user toward a valid subcommand.
				const helpMessage = await t(
					fakeInteraction,
					'core.helpers.handlers.PrefixCommandHandler.events.messageCreate.subcommand.required',
					{
						command: commandName,
					},
				);
				await fakeInteraction.reply({
					content: helpMessage,
				});
			}
		} catch (err) {
			if (err.message?.startsWith('Execute method not implemented for')) {
				// Command object inherited BaseCommand's placeholder execute — likely a parent command without a handler.
				// We silently ignore this to avoid wasting Discord API limits on invalid user inputs.
				return;
			}
			logger.error(
				`Error executing prefix command '${commandKey}': ${err.message}\nFull Error: ${JSON.stringify(err, Object.getOwnPropertyNames(err), 2)}`,
				{
					label: 'PrefixCommandHandler',
				},
			);
			await fakeInteraction
				.reply(
					await t(
						fakeInteraction,
						'core.helpers.index.events.messageCreate.error',
					),
				)
				.catch(() => {});
		}
	}

	// ─── Legacy aliases (kept for backward compatibility) ────────────────────
	findMatchedPrefix(...args) {
		return this._findMatchedPrefix(...args);
	}
	findCommand(...args) {
		return this._findCommand(...args);
	}
	validatePermissions(...args) {
		return this._validatePermissions(...args);
	}
	checkCooldown(...args) {
		return this._checkCooldown(...args);
	}
	executeCommand(...args) {
		return this._executeCommand(...args);
	}
}
module.exports = PrefixCommandHandler;
