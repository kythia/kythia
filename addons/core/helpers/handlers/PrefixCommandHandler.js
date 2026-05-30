/**
 * @namespace: addons/core/helpers/handlers/PrefixCommandHandler.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { utils } = require('kythia-core');
const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	SeparatorBuilder,
	SeparatorSpacingSize,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Collection,
} = require('discord.js');

class PrefixCommandHandler {
	/**
	 * Handle prefix command execution
	 * @param {Message} message - Discord message
	 * @param {KythiaDI.Container} container - Kythia container
	 * @returns {Promise<boolean>} - true if command was handled
	 */
	async handle(message, container) {
		const { kythiaConfig, models } = container;
		const { ServerSetting } = models;

		const contentLower = message.content.toLowerCase();
		const serverSetting = message.guild
			? await ServerSetting.getCache({ guildId: message.guild.id })
			: null;
		const customPrefix = serverSetting?.prefix;

		const allPrefixes = [...kythiaConfig.bot.prefixes];
		if (customPrefix) {
			allPrefixes.push(customPrefix);
		}

		const matchedPrefix = this.findMatchedPrefix(contentLower, allPrefixes);
		if (!matchedPrefix) return false;

		if (message.author?.bot) return false;

		const contentAfterPrefix = message.content
			.slice(matchedPrefix.length)
			.trim();
		const args = contentAfterPrefix.split(/ +/);
		const commandName = args.shift().toLowerCase();

		const baseCommand = this.findCommand(commandName, message.client);
		if (!baseCommand) return false;

		const remainingArgsString = args.join(' ');
		const fakeInteraction = utils.InteractionFactory.create(
			message,
			commandName,
			remainingArgsString,
		);

		// Override reply methods so responses quote/ping the original message
		// (InteractionFactory uses channel.send() which sends without a reply reference)
		let _replied = false;
		let _replyMessage = null;

		fakeInteraction.reply = async (opts) => {
			if (_replied) {
				// Already replied — edit the existing reply message
				const payload = typeof opts === 'string' ? { content: opts } : opts;

				// Strip interaction-only flags for prefix commands
				if (payload.flags) {
					payload.flags &= ~MessageFlags.Ephemeral;
				}

				if (_replyMessage) {
					_replyMessage = await _replyMessage.edit(payload);
				} else {
					_replyMessage = await message.reply(payload);
				}
				return _replyMessage;
			}
			_replied = true;
			const payload = typeof opts === 'string' ? { content: opts } : opts;

			// Strip interaction-only flags for prefix commands
			if (payload.flags) {
				payload.flags &= ~MessageFlags.Ephemeral;
			}

			_replyMessage = await message.reply(payload);
			return _replyMessage;
		};

		fakeInteraction.editReply = async (opts) => {
			const payload = typeof opts === 'string' ? { content: opts } : opts;

			// Strip interaction-only flags for prefix commands
			if (payload.flags) {
				payload.flags &= ~MessageFlags.Ephemeral;
			}

			if (_replyMessage) {
				_replyMessage = await _replyMessage.edit(payload);
			} else {
				_replyMessage = await message.reply(payload);
			}
			_replied = true;
			return _replyMessage;
		};

		fakeInteraction.followUp = (opts) => {
			const payload = typeof opts === 'string' ? { content: opts } : opts;
			return message.reply(payload).catch(() => null);
		};

		fakeInteraction.deferReply = () => {
			_replied = true;
			// No visible typing indicator needed for prefix; just mark as deferred
			return Promise.resolve(null);
		};

		const subcommand = fakeInteraction.options.getSubcommand();
		const subcommandGroup = fakeInteraction.options.getSubcommandGroup();

		let finalCommandKey = commandName;
		if (subcommandGroup)
			finalCommandKey = `${commandName} ${subcommandGroup} ${subcommand}`;
		else if (subcommand) finalCommandKey = `${commandName} ${subcommand}`;

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

		// Validate permissions
		const permissionCheck = await this.validatePermissions(
			finalCommand,
			message,
			container,
		);
		if (!permissionCheck.allowed) {
			if (permissionCheck.response) {
				await message.reply(permissionCheck.response);
			}
			return true;
		}

		// Check cooldown
		const cooldownCheck = await this.checkCooldown(
			finalCommand,
			finalCommandKey,
			message,
			container,
		);
		if (!cooldownCheck.allowed) {
			if (cooldownCheck.response) {
				await cooldownCheck.response;
			}
			return true;
		}

		// Execute command
		await this.executeCommand(
			finalCommand,
			fakeInteraction,
			finalCommandKey,
			commandName,
			container,
		);

		return true;
	}

	findMatchedPrefix(contentLower, allPrefixes) {
		return allPrefixes.find((prefix) =>
			contentLower.startsWith(prefix.toLowerCase()),
		);
	}

	findCommand(commandName, client) {
		return (
			client.commands.get(commandName) ||
			[...client.commands.values()].find(
				(cmd) =>
					Array.isArray(cmd.aliases) &&
					cmd.aliases.map((a) => a.toLowerCase()).includes(commandName),
			)
		);
	}

	async validatePermissions(command, message, container) {
		const { kythiaConfig, helpers, t, logger, models } = container;
		const { isOwner } = helpers.discord;
		const { convertColor } = helpers.color;
		const { KythiaVoter } = models;

		// Guild-only check
		if (command.guildOnly && !message.guild) {
			return { allowed: false };
		}

		// Owner-only check
		if (command.ownerOnly && !isOwner(message.author.id)) {
			return { allowed: false };
		}

		// User permissions
		if (command.permissions && message.member) {
			if (message.member.permissions.missing(command.permissions).length > 0) {
				return { allowed: false };
			}
		}

		// Bot permissions
		if (command.botPermissions && message.guild) {
			if (
				message.guild.members.me.permissions.missing(command.botPermissions)
					.length > 0
			) {
				return { allowed: false };
			}
		}

		// Main guild check
		if (command.isInMainGuild) {
			const mainGuildId = kythiaConfig.bot.mainGuildId;
			if (!mainGuildId) {
				logger.error(`mainGuildId not set in config.`, {
					label: 'PrefixCommandHandler',
				});
			}

			let isMember = false;
			let mainGuildName = 'Support Server';

			try {
				if (message.client.shard) {
					const results = await message.client.shard.broadcastEval(
						async (c, { gId, uId }) => {
							const g = c.guilds.cache.get(gId);
							if (!g) return null;
							try {
								await g.members.fetch(uId);
								return { isMember: true, name: g.name };
							} catch {
								return { isMember: false, name: g.name };
							}
						},
						{ context: { gId: mainGuildId, uId: message.author.id } },
					);
					const hit = results.find((r) => r !== null);
					if (hit) {
						isMember = hit.isMember;
						mainGuildName = hit.name;
					} else {
						return { allowed: true };
					} // fail open if guild not found on any shard
				} else {
					const mainGuild = message.client.guilds.cache.get(mainGuildId);
					if (!mainGuild) {
						logger.error(`Bot is not a member of main guild: ${mainGuildId}`, {
							label: 'PrefixCommandHandler',
						});
						return { allowed: true }; // fail open
					}
					mainGuildName = mainGuild.name;
					try {
						await mainGuild.members.fetch(message.author.id);
						isMember = true;
					} catch {
						isMember = false;
					}
				}
			} catch (err) {
				logger.error(`isInMainGuild check failed: ${err.message}`, {
					label: 'PrefixCommandHandler',
				});
				return { allowed: true }; // fail open
			}

			if (!isMember) {
				const errorContainer = new ContainerBuilder()
					.setAccentColor(
						convertColor(kythiaConfig.bot.color, {
							from: 'hex',
							to: 'decimal',
						}),
					)
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

		// Vote lock check
		if (command.voteLocked && !isOwner(message.author.id)) {
			const voter = await KythiaVoter.getCache({ userId: message.author.id });
			const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);

			if (!voter || voter.votedAt < twelveHoursAgo) {
				const container = new ContainerBuilder()
					.setAccentColor(
						convertColor(kythiaConfig.bot.color, {
							from: 'hex',
							to: 'decimal',
						}),
					)
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
										botName: message.client.user.username,
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
						components: [container],
						flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
					},
				};
			}
		}

		return { allowed: true };
	}

	async checkCooldown(command, commandKey, message, container) {
		const { kythiaConfig, helpers, t } = container;
		const { isOwner } = helpers.discord;

		const cooldownDuration =
			command.cooldown ?? kythiaConfig.bot.globalCommandCooldown ?? 0;
		if (cooldownDuration <= 0 || isOwner(message.author.id)) {
			return { allowed: true };
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

		return { allowed: true };
	}

	async executeCommand(
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
				const helpMessage = await t(
					fakeInteraction,
					'core.events.messageCreate.subcommand.required',
					{ command: commandName },
				);
				await fakeInteraction.reply(helpMessage);
			}
		} catch (err) {
			logger.error(
				`Error executing prefix command '${commandKey}': ${err.message}`,
				{ label: 'PrefixCommandHandler' },
			);
			await fakeInteraction
				.reply(
					await t(fakeInteraction, 'core.events.messageCreate.error', {
						command: commandKey,
					}),
				)
				.catch(() => {});
		}
	}
}

module.exports = PrefixCommandHandler;
