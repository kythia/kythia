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
const { getOptionType, formatChoices } = require('.');

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

				const categoryMap = client.container?.addons?.commandCategoryMap;
				const categoryName =
					categoryMap?.get(commandJSON.name) || 'uncategorized';

				const parsedCommand = {
					name: commandJSON.name,
					description: commandJSON.description || 'No description provided.',
					category: categoryName,
					options: [],
					subcommands: [],
					aliases: aliases,
					type: 'slash',
					isContextMenu: false,
					premiumLocked: command.premiumLocked || command.isPremium || false,
					voteLocked: command.voteLocked || false,
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

									const cmdKey = `${commandJSON.name} ${sub.name} ${subInGroup.name}`;
									const subModule = client.commands.get(cmdKey);

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
										premiumLocked:
											subModule?.premiumLocked || subModule?.isPremium || false,
										voteLocked: subModule?.voteLocked || false,
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

								const cmdKey = `${commandJSON.name} ${sub.name}`;
								const subModule = client.commands.get(cmdKey);

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
									premiumLocked:
										subModule?.premiumLocked || subModule?.isPremium || false,
									voteLocked: subModule?.voteLocked || false,
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

				const categoryMap = client.container?.addons?.commandCategoryMap;
				const categoryName =
					categoryMap?.get(commandJSON.name) || 'uncategorized';

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
						premiumLocked: command.premiumLocked || command.isPremium || false,
						voteLocked: command.voteLocked || false,
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
	getCommandsData,
};
