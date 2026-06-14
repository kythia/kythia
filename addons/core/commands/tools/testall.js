/**
 * @namespace: addons/core/commands/tools/testall.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ChannelType,
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	ApplicationCommandOptionType,
} = require('discord.js');
const { BaseCommand } = require('kythia-core');
const testallmockHelper = require('../../helpers/testallMock');

// Constants extracted to addons/core/helpers/testall-mock.js

// Helpers extracted to addons/core/helpers/testall-mock.js

class TestallCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('testall')
		.setDescription(
			'🛠️ Developer Tool: Test all registered commands (DRY RUN-ish).',
		)
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
	ownerOnly = true;
	mainGuildOnly = true;
	async execute(interaction) {
		const container = this.container;
		const { logger, helpers, kythiaConfig: cfg } = container;

		// Acknowledge immediately so the interaction token stays alive
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
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
		const origFindOrCreate = KythiaModel.findOrCreateCache;
		if (origFindOrCreate) {
			KythiaModel.findOrCreateCache = async function (options) {
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
				testallmockHelper.BLACKLIST_COMMANDS.some((blacklisted) =>
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
					if (opt.choices && opt.choices.length > 0) {
						optionsData[optName] = opt.choices[0].value;
					} else if (optType === ApplicationCommandOptionType.Role) {
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
				const mock = testallmockHelper.createForwardingMockInteraction(
					interaction,
					rootName,
					optionsData,
					groupName,
					subcommandName,
				);
				logger.info(`🧪 Testing command: ${fullPath}`, {
					label: 'core',
				});
				await commandModule.execute(mock, container);
				if (mock._hasReplied() || mock._isDeferred()) {
					results.success.push(fullPath);
				} else {
					results.failed.push({
						name: fullPath,
						reason: 'no reply',
					});
				}
			} catch (err) {
				logger.error(`Test failed for ${fullPath}: ${err.message || err}`, {
					label: 'testall',
				});
				results.failed.push({
					name: fullPath,
					reason: err.message,
				});
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
			KythiaModel.findOrCreateCache = origFindOrCreate;
		}

		// ── Build a beautiful Components V2 report ────────────────────────────
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
				await interaction.followUp({
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
			.editReply({
				content: '✅ Done! Results posted above.',
			})
			.catch((err) =>
				logger.warn(`testall editReply failed: ${err.message || err}`, {
					label: 'core',
				}),
			);
	}
}

exports.default = TestallCommand;
