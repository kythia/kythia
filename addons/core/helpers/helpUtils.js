/**
 * @namespace: addons/core/helpers/helpUtils.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	SeparatorSpacingSize,
	MediaGalleryItemBuilder,
	StringSelectMenuBuilder,
	ApplicationCommandOptionType,
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const EXCLUDED_ADDONS = ['api', 'license'];
const EXCLUDED_CORE_CATEGORIES = ['premium']; // has no public commands
const CATEGORIES_PER_PAGE = 25;
const CATEGORY_DOC_ALIAS = {
	premium: 'pro',
};
function countTotalCommands(commands) {
	let totalCount = 0;
	const processedCommands = new Set();
	commands.forEach((command) => {
		if (command.ownerOnly === true) return;
		const slashData = command.slashCommand || command.data;
		let commandJSON;
		if (slashData) {
			commandJSON =
				typeof slashData.toJSON === 'function' ? slashData.toJSON() : slashData;
		} else {
			return;
		}
		const uniqueKey = `slash-${commandJSON.name}`;
		if (processedCommands.has(uniqueKey)) return;
		processedCommands.add(uniqueKey);
		if (Array.isArray(commandJSON.options) && commandJSON.options.length > 0) {
			const subcommands = commandJSON.options.filter(
				(opt) =>
					opt.type === ApplicationCommandOptionType.Subcommand ||
					opt.type === ApplicationCommandOptionType.SubcommandGroup,
			);
			if (subcommands.length > 0) {
				subcommands.forEach((sub) => {
					if (sub.type === ApplicationCommandOptionType.SubcommandGroup) {
						totalCount += sub.options?.length || 0;
					} else {
						totalCount += 1;
					}
				});
				return;
			}
		}
		totalCount += 1;
		if (command.contextMenuCommand) {
			const cmJSON =
				typeof command.contextMenuCommand.toJSON === 'function'
					? command.contextMenuCommand.toJSON()
					: command.contextMenuCommand;
			const contextKey = `context-${cmJSON.name}`;
			if (!processedCommands.has(contextKey)) {
				processedCommands.add(contextKey);
				totalCount += 1;
			}
		}
	});
	return totalCount;
}
function smartSplit(content, maxLength = 3500) {
	const chunks = [];
	let currentChunk = '';
	const lines = content.split('\n');
	for (const line of lines) {
		if (line.length + 1 > maxLength) {
			if (currentChunk.length > 0) {
				chunks.push(currentChunk);
				currentChunk = '';
			}
			let start = 0;
			while (start < line.length) {
				const part = line.slice(start, start + maxLength - 1);
				chunks.push(`${part}\n`);
				start += maxLength - 1;
			}
			continue;
		}
		if (currentChunk.length + line.length + 1 > maxLength) {
			chunks.push(currentChunk);
			currentChunk = '';
		}
		currentChunk += `${line}\n`;
	}
	if (currentChunk.length > 0) chunks.push(currentChunk);
	return chunks;
}
async function parseCompactMarkdown(content, container, interaction) {
	const { t } = container;
	let categoryName = 'Category';
	const catMatch = content.match(/## Command Category:\s*(.+)/i);
	if (catMatch) {
		categoryName = catMatch[1].trim();
	}
	const lines = content.split('\n');
	const commandsTitle = await t(
		interaction,
		'core.helpers.helpUtils.utils.help.compact.title',
		{
			category: categoryName,
		},
	);
	const compactLines = [`## ${commandsTitle}`];
	let hasCommands = false;
	let baseCommand = null;
	const noInfoText = await t(
		interaction,
		'core.helpers.helpUtils.utils.help.compact.no_info',
	);
	let baseDesc = noInfoText;
	let baseHasSubcommands = false;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i].trim();
		if (
			line.startsWith('### `/') &&
			!line.includes('Usage') &&
			!line.includes('Subcommands') &&
			!line.includes('Options') &&
			!line.includes('Details')
		) {
			if (baseCommand && !baseHasSubcommands) {
				compactLines.push(`> **${baseCommand}** - ${baseDesc}`);
				hasCommands = true;
			}
			const cmdMatch = line.match(/### `(\/[^`]+)`/);
			if (cmdMatch) {
				baseCommand = cmdMatch[1];
				baseDesc = noInfoText;
				baseHasSubcommands = false;
				for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
					if (lines[j].startsWith('**Description:**')) {
						baseDesc = lines[j].replace('**Description:**', '').trim();
						break;
					}
				}
			}
		} else if (line.startsWith('### Subcommands')) {
			baseHasSubcommands = true;
		} else if (
			line.startsWith('**`/') &&
			line.endsWith('`**') &&
			!line.includes('Options for this subcommand:')
		) {
			const subMatch = line.match(/\*\*`(\/[^`]+)`\*\*/);
			if (subMatch) {
				let nameWithArgs = subMatch[1];
				nameWithArgs = nameWithArgs.replace(/\[(<[^>]+>)\]/g, '$1');
				nameWithArgs = nameWithArgs.replace(/\[([a-zA-Z0-9_-]+)\]/g, '<$1>');
				let desc = noInfoText;
				for (let j = i + 1; j < Math.min(i + 3, lines.length); j++) {
					if (lines[j].trim().startsWith('> ')) {
						desc = lines[j].trim().substring(2).trim();
						break;
					}
				}
				compactLines.push(`> **${nameWithArgs}** - ${desc}`);
				hasCommands = true;
			}
		}
	}
	if (baseCommand && !baseHasSubcommands) {
		compactLines.push(`> **${baseCommand}** - ${baseDesc}`);
		hasCommands = true;
	}
	if (!hasCommands)
		return await t(
			interaction,
			'core.helpers.helpUtils.utils.help.compact.no_commands',
		);
	return compactLines.join('\n');
}
async function getMarkdownContent(
	category,
	rootDir,
	mode = 'detailed',
	container = null,
	interaction = null,
) {
	const docName = CATEGORY_DOC_ALIAS[category] ?? category;
	const filePath = path.join(rootDir, 'docs', 'commands', `${docName}.md`);
	if (!fs.existsSync(filePath)) return [null];
	const content = fs.readFileSync(filePath, 'utf-8');
	if (!content || content.trim() === '') return [null];
	if (mode === 'compact' && container && interaction) {
		const compactContent = await parseCompactMarkdown(
			content,
			container,
			interaction,
		);
		return smartSplit(compactContent);
	}
	return smartSplit(content);
}
module.exports = {
	getHelpData: async (container, interaction, mode = 'detailed') => {
		const { kythiaConfig, t } = container;
		const rootDir = path.join(__dirname, '..', '..', '..');
		const addonsDir = path.join(rootDir, 'addons');
		const allCategories = [];
		const pages = {};
		const configAddons = kythiaConfig?.addons || {};
		function isAddonActive(addonName) {
			if (configAddons.all?.active === false) return false;
			if (configAddons[addonName]?.active === false) return false;
			return true;
		}
		function isCoreCategoryActive(categoryName) {
			if (
				configAddons.core?.categories &&
				typeof configAddons.core.categories === 'object'
			) {
				if (configAddons.core.categories[categoryName]?.active === false)
					return false;
			}
			return true;
		}
		const addonFolders = fs.readdirSync(addonsDir, {
			withFileTypes: true,
		});
		for (const addon of addonFolders) {
			if (
				!addon.isDirectory() ||
				EXCLUDED_ADDONS.includes(addon.name) ||
				addon.name.startsWith('_')
			)
				continue;
			const addonName = addon.name;
			if (!isAddonActive(addonName)) continue;
			if (addonName === 'core') {
				const coreCommandsPath = path.join(addonsDir, 'core', 'commands');
				if (fs.existsSync(coreCommandsPath)) {
					const coreCategories = fs.readdirSync(coreCommandsPath, {
						withFileTypes: true,
					});
					for (const categoryFolder of coreCategories) {
						if (
							!categoryFolder.isDirectory() ||
							EXCLUDED_CORE_CATEGORIES.includes(categoryFolder.name)
						)
							continue;
						const categoryName = categoryFolder.name;
						if (!isCoreCategoryActive(categoryName)) continue;
						const categoryPages = await getMarkdownContent(
							categoryName,
							rootDir,
							mode,
							container,
							interaction,
						);
						if (categoryPages[0] === null) continue;
						allCategories.push({
							label:
								categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
							value: categoryName,
							description: await t(
								interaction,
								'core.helpers.helpUtils.utils.help.category.desc',
								{
									category: categoryName,
								},
							),
						});
						pages[categoryName] = categoryPages;
					}
				}
			} else {
				const manifestPath = path.join(addonsDir, addonName, 'addon.json');
				if (fs.existsSync(manifestPath)) {
					const categoryPages = await getMarkdownContent(
						addonName,
						rootDir,
						mode,
						container,
						interaction,
					);
					if (categoryPages[0] === null) continue;
					const manifest = require(manifestPath);
					allCategories.push({
						label: manifest.name,
						value: addonName,
						description: manifest.description.substring(0, 100),
					});
					pages[addonName] = categoryPages;
				}
			}
		}
		allCategories.sort((a, b) => a.label.localeCompare(b.label));
		return {
			totalCommands: countTotalCommands(interaction.client.commands),
			allCategories,
			pages,
			CATEGORIES_PER_PAGE,
		};
	},
	buildHelpReply: async (containerContext, interaction, state, helpData) => {
		const { kythiaConfig, t, helpers } = containerContext;
		const { convertColor } = helpers.color;
		const { categoryPage, selectedCategory, docPage, userId } = state;
		const { allCategories, pages, totalCommands, CATEGORIES_PER_PAGE } =
			helpData;
		const container = new ContainerBuilder().setAccentColor(
			convertColor(kythiaConfig.bot.color, {
				from: 'hex',
				to: 'decimal',
			}),
		);
		if (!selectedCategory || selectedCategory === '-') {
			const desc = await t(
				interaction,
				'core.helpers.helpUtils.utils.help.main.embed.desc',
				{
					username: interaction.client.user.username,
					category_count: allCategories.length,
					command_count: totalCommands,
					supportServer: kythiaConfig.settings.supportServer,
					botWebsite: kythiaConfig.settings.kythiaWeb,
				},
			);
			if (kythiaConfig?.settings?.helpBannerImage) {
				container
					.addMediaGalleryComponents(
						new MediaGalleryBuilder().addItems([
							new MediaGalleryItemBuilder().setURL(
								kythiaConfig.settings.helpBannerImage,
							),
						]),
					)
					.addSeparatorComponents(
						new SeparatorBuilder()
							.setSpacing(SeparatorSpacingSize.Small)
							.setDivider(true),
					);
			}
			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(desc),
			);
		} else {
			const docPages = pages[selectedCategory];
			let docContent = docPages?.[docPage];
			if (docContent === null)
				docContent = await t(
					interaction,
					'core.helpers.helpUtils.utils.help.docs.unavailable',
				);
			if (!docContent)
				docContent = await t(
					interaction,
					'core.helpers.helpUtils.utils.help.content.not.found',
				);
			let finalContent = docContent.trim();
			if (finalContent.length === 0) {
				finalContent = '\u200B';
			}
			if (finalContent.length > 4000) {
				finalContent = `${finalContent.slice(0, 3997)}...`;
			}
			container.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(finalContent),
			);
		}
		container.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);
		const start = categoryPage * CATEGORIES_PER_PAGE;
		const end = start + CATEGORIES_PER_PAGE;
		const categoriesOnPage = allCategories.slice(start, end);
		const selectMenu = new StringSelectMenuBuilder()
			// Custom ID format: help-menu:userId:categoryPage:docPage:mode
			.setCustomId(
				`help-menu:${userId}:${categoryPage}:${docPage}:${state.mode || 'detailed'}`,
			)
			.setPlaceholder(
				(
					await t(
						interaction,
						'core.helpers.helpUtils.utils.help.select.menu.placeholder',
						{
							username: interaction.client.user.username,
						},
					)
				).replace(/^./, (c) => c.toUpperCase()),
			)
			.addOptions(categoriesOnPage);
		container.addActionRowComponents(
			new ActionRowBuilder().addComponents(selectMenu),
		);
		const rowButtons = new ActionRowBuilder();
		const totalCategoryPages = Math.ceil(
			allCategories.length / CATEGORIES_PER_PAGE,
		);

		// Button ID format: help-btn:<action>:<userId>:<categoryPage>:<selectedCategory>:<docPage>:<mode>
		function makeBtnId(action) {
			return `help-btn:${action}:${userId}:${categoryPage}:${selectedCategory || '-'}:${docPage}:${state.mode || 'detailed'}`;
		}
		if (selectedCategory && selectedCategory !== '-') {
			const homeButtonLabel =
				(await t(
					interaction,
					'core.helpers.helpUtils.utils.help.button.go.home',
				)) || '🏠 Home';
			rowButtons.addComponents(
				new ButtonBuilder()
					.setCustomId(makeBtnId('home'))
					.setLabel(homeButtonLabel)
					.setStyle(ButtonStyle.Success)
					.setDisabled(false),
			);
			const totalDocPages = pages[selectedCategory]?.length || 1;
			rowButtons.addComponents(
				new ButtonBuilder()
					.setCustomId(makeBtnId('dp')) // doc prev
					.setLabel(
						await t(
							interaction,
							'core.helpers.helpUtils.utils.help.button.doc.prev',
						),
					)
					.setStyle(ButtonStyle.Primary)
					.setDisabled(docPage === 0),
				new ButtonBuilder()
					.setCustomId(makeBtnId('dn')) // doc next
					.setLabel(
						await t(
							interaction,
							'core.helpers.helpUtils.utils.help.button.doc.next',
						),
					)
					.setStyle(ButtonStyle.Primary)
					.setDisabled(docPage >= totalDocPages - 1),
				new ButtonBuilder()
					.setCustomId(makeBtnId('cp')) // cat prev
					.setLabel(
						await t(
							interaction,
							'core.helpers.index.utils.help.button.cat.prev',
						),
					)
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(categoryPage === 0),
				new ButtonBuilder()
					.setCustomId(makeBtnId('cn')) // cat next
					.setLabel(
						await t(
							interaction,
							'core.helpers.index.utils.help.button.cat.next',
						),
					)
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(categoryPage >= totalCategoryPages - 1),
			);
		} else if (totalCategoryPages > 1) {
			rowButtons.addComponents(
				new ButtonBuilder()
					.setCustomId(makeBtnId('cp'))
					.setLabel(
						await t(
							interaction,
							'core.helpers.index.utils.help.button.cat.prev',
						),
					)
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(categoryPage === 0),
				new ButtonBuilder()
					.setCustomId(makeBtnId('cn'))
					.setLabel(
						await t(
							interaction,
							'core.helpers.index.utils.help.button.cat.next',
						),
					)
					.setStyle(ButtonStyle.Secondary)
					.setDisabled(categoryPage >= totalCategoryPages - 1),
			);
		}
		if (rowButtons.components.length > 0) {
			container.addActionRowComponents(rowButtons);
		}
		container.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);
		container.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'common.container.footer', {
					username: interaction.client.user.username,
				}),
			),
		);
		return {
			components: [container],
			flags: MessageFlags.IsComponentsV2,
		};
	},
};
