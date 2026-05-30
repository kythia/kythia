/**
 * @namespace: addons/api/helpers/commands.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ApplicationCommandType,
	ApplicationCommandOptionType,
} = require('discord.js');
const { clearRequireCache, getOptionType, formatChoices } = require('.');
const path = require('node:path');
const fs = require('node:fs');

function buildCategoryMap() {
	const categoryMap = {};
	const rootAddonsDir = path.join(__dirname, '..', '..');
	const addonDirs = fs
		.readdirSync(rootAddonsDir, { withFileTypes: true })
		.filter((dirent) => dirent.isDirectory());

	for (const addon of addonDirs) {
		const commandsPath = path.join(rootAddonsDir, addon.name, 'commands');
		if (!fs.existsSync(commandsPath)) continue;

		const processFile = (filePath, categoryName) => {
			try {
				clearRequireCache(filePath);
				const command = require(filePath);
				const commandNames = [];

				if (command.slashCommand) {
					const name = command.slashCommand.name;
					if (name) commandNames.push(name);
				}

				if (command.contextMenuCommand) {
					const name = command.contextMenuCommand.name;
					if (name) commandNames.push(name);
				}

				if (command.data) {
					const name = command.data.name;
					if (name) commandNames.push(name);
				}

				if (typeof command.name === 'string') {
					commandNames.push(command.name);
				}

				[...new Set(commandNames.filter(Boolean))].forEach((cmdName) => {
					categoryMap[cmdName] = categoryName;
				});
			} catch (_e) {}
		};

		if (addon.name === 'core') {
			const coreCategories = fs
				.readdirSync(commandsPath, { withFileTypes: true })
				.filter((d) => d.isDirectory());
			for (const category of coreCategories) {
				const categoryPath = path.join(commandsPath, category.name);
				const walkDir = (dir) => {
					for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
						const fullPath = path.join(dir, entry.name);
						if (entry.isDirectory()) {
							walkDir(fullPath);
						} else if (entry.name.endsWith('.js')) {
							processFile(fullPath, category.name);
						}
					}
				};
				walkDir(categoryPath);
			}
		} else {
			const categoryName = addon.name;
			const walkDir = (dir) => {
				for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
					const fullPath = path.join(dir, entry.name);
					if (entry.isDirectory()) {
						walkDir(fullPath);
					} else if (entry.name.endsWith('.js')) {
						processFile(fullPath, categoryName);
					}
				}
			};
			walkDir(commandsPath);
		}
	}
	return categoryMap;
}

const categoryMap = buildCategoryMap();

// biome-ignore lint/suspicious/useAwait: important
async function getCommandsData(client) {
	const allCommands = [];
	const categories = new Set();
	let totalCommandCount = 0;
	const processedCommands = new Set();

	client.commands.forEach((command) => {
		if (command.ownerOnly === true) {
			return;
		}

		const slashData = command.slashCommand || command.data;
		if (
			slashData &&
			typeof slashData.name === 'string' &&
			slashData.name.toLowerCase() !== 'data' &&
			slashData.description?.trim() &&
			!/^no description( provided)?\.?$/i.test(slashData.description.trim())
		) {
			const commandJSON =
				typeof slashData.toJSON === 'function' ? slashData.toJSON() : slashData;

			const uniqueKey = `slash-${commandJSON.name}`;

			let aliases = [];
			if (Array.isArray(command.aliases)) {
				aliases = command.aliases.filter(
					(alias) => typeof alias === 'string' && alias.trim(),
				);
			} else if (
				typeof command.aliases === 'string' &&
				command.aliases.trim()
			) {
				aliases = [command.aliases.trim()];
			}

			if (!processedCommands.has(uniqueKey)) {
				processedCommands.add(uniqueKey);

				const categoryName = categoryMap[commandJSON.name] || 'uncategorized';
				const parsedCommand = {
					name: commandJSON.name,
					description: commandJSON.description || 'No description provided.',
					category: categoryName,
					options: [],
					subcommands: [],
					aliases: aliases,
					type: 'slash',
					isContextMenu: false,
				};

				if (
					Array.isArray(commandJSON.options) &&
					commandJSON.options.length > 0
				) {
					const subcommands = commandJSON.options.filter(
						(opt) =>
							opt.type === ApplicationCommandOptionType.Subcommand ||
							opt.type === ApplicationCommandOptionType.SubcommandGroup,
					);
					const regularOptions = commandJSON.options.filter(
						(opt) =>
							opt.type !== ApplicationCommandOptionType.Subcommand &&
							opt.type !== ApplicationCommandOptionType.SubcommandGroup,
					);

					if (subcommands.length > 0) {
						subcommands.forEach((sub) => {
							if (sub.type === ApplicationCommandOptionType.SubcommandGroup) {
								totalCommandCount += sub.options?.length || 0;
								(sub.options || []).forEach((subInGroup) => {
									let subAliases = [];
									if (Array.isArray(subInGroup.aliases)) {
										subAliases = subInGroup.aliases.filter(
											(alias) => typeof alias === 'string' && alias.trim(),
										);
									} else if (
										typeof subInGroup.aliases === 'string' &&
										subInGroup.aliases.trim()
									) {
										subAliases = [subInGroup.aliases.trim()];
									}
									parsedCommand.subcommands.push({
										name: `${sub.name} ${subInGroup.name}`,
										description: subInGroup.description,
										options: (subInGroup.options || []).map((opt) => ({
											name: opt.name,
											description: opt.description,
											type: getOptionType(opt.type),
											required: opt.required ?? false,
											choices: formatChoices(opt.choices),
										})),
										aliases: subAliases,
									});
								});
							} else {
								totalCommandCount += 1;
								let subAliases = [];
								if (Array.isArray(sub.aliases)) {
									subAliases = sub.aliases.filter(
										(alias) => typeof alias === 'string' && alias.trim(),
									);
								} else if (
									typeof sub.aliases === 'string' &&
									sub.aliases.trim()
								) {
									subAliases = [sub.aliases.trim()];
								}
								parsedCommand.subcommands.push({
									name: sub.name,
									description: sub.description,
									options: (sub.options || []).map((opt) => ({
										name: opt.name,
										description: opt.description,
										type: getOptionType(opt.type),
										required: opt.required ?? false,
										choices: formatChoices(opt.choices),
									})),
									aliases: subAliases,
								});
							}
						});
					} else {
						totalCommandCount += 1;
					}

					if (regularOptions.length > 0) {
						parsedCommand.options = regularOptions.map((opt) => ({
							name: opt.name,
							description: opt.description,
							type: getOptionType(opt.type),
							required: opt.required ?? false,
							choices: formatChoices(opt.choices),
						}));
					}
				} else {
					totalCommandCount += 1;
				}

				allCommands.push(parsedCommand);
				categories.add(categoryName);
			}
		}

		if (
			command.contextMenuCommand &&
			typeof command.contextMenuCommand.name === 'string' &&
			command.contextMenuCommand.name.toLowerCase() !== 'data'
		) {
			const commandJSON =
				typeof command.contextMenuCommand.toJSON === 'function'
					? command.contextMenuCommand.toJSON()
					: command.contextMenuCommand;
			const uniqueKey = `context-${commandJSON.name}`;

			if (!processedCommands.has(uniqueKey)) {
				processedCommands.add(uniqueKey);

				const categoryName = categoryMap[commandJSON.name] || 'uncategorized';

				let description;

				if (
					typeof command.contextMenuDescription === 'string' &&
					command.contextMenuDescription.trim()
				) {
					description = command.contextMenuDescription.trim();
				} else if (
					command.slashCommand &&
					typeof command.slashCommand.description === 'string' &&
					command.slashCommand.description?.trim() &&
					!/^no description( provided)?\.?$/i.test(
						command.slashCommand.description.trim(),
					)
				) {
					description = command.slashCommand.description.trim();
				} else {
					if (commandJSON.type === ApplicationCommandType.Message) {
						description = 'Right-click on a message to use this command.';
					} else {
						description = 'Right-click on a user to use this command.';
					}
				}

				let aliases = [];
				if (Array.isArray(command.aliases)) {
					aliases = command.aliases.filter(
						(alias) => typeof alias === 'string' && alias.trim(),
					);
				} else if (
					typeof command.aliases === 'string' &&
					command.aliases.trim()
				) {
					aliases = [command.aliases.trim()];
				}

				if (description?.trim()) {
					const parsedCommand = {
						name: commandJSON.name,
						description: description,
						category: categoryName,
						options: [],
						subcommands: [],
						aliases: aliases,
						type:
							commandJSON.type === ApplicationCommandType.User
								? 'user'
								: 'message',
						isContextMenu: true,
					};

					allCommands.push(parsedCommand);
					categories.add(categoryName);
					totalCommandCount += 1;
				}
			}
		}
	});

	return {
		commands: allCommands.sort((a, b) => a.name.localeCompare(b.name)),
		categories: Array.from(categories).sort(),
		totalCommands: totalCommandCount,
	};
}

module.exports = {
	buildCategoryMap,
	getCommandsData,
};
