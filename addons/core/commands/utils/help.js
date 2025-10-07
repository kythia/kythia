/**
 * @namespace: addons/core/commands/utils/help.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle,
    ApplicationCommandOptionType,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const { t } = require('@utils/translator');
const convertColor = require('@utils/color');

const EXCLUDED_ADDONS = [];
const EXCLUDED_CORE_CATEGORIES = [];
const CATEGORIES_PER_PAGE = 25;

module.exports = {
    data: new SlashCommandBuilder().setName('help').setDescription('💡 Displays a list of bot commands with complete details.'),

    async execute(interaction) {
        const rootDir = path.join(__dirname, '..', '..', '..', '..');
        const addonsDir = path.join(rootDir, 'addons');
        const allCategories = [];
        const pages = {};

        let kythiaConfig = kythia;
        const configAddons = kythiaConfig?.addons || {};

        function isAddonActive(addonName) {
            if (configAddons.all?.active === false) return false;
            if (configAddons[addonName]?.active === false) return false;
            return true;
        }
        function isCoreCategoryActive(categoryName) {
            if (configAddons.core?.categories && typeof configAddons.core.categories === 'object') {
                if (configAddons.core.categories[categoryName]?.active === false) return false;
            }
            return true;
        }

        function countTotalCommands(commands) {
            let total = 0;
            commands.each((command) => {
                let commandJSON;
                if (typeof command.data?.toJSON === 'function') {
                    commandJSON = command.data.toJSON();
                } else if (typeof command.data === 'object' && command.data !== null) {
                    commandJSON = command.data;
                } else {
                    return;
                }
                const SUBCOMMAND = ApplicationCommandOptionType.Subcommand;
                const SUBCOMMAND_GROUP = ApplicationCommandOptionType.SubcommandGroup;
                const options = Array.isArray(commandJSON.options) ? commandJSON.options : [];
                const subcommandOptions = options.filter((opt) => opt.type === SUBCOMMAND || opt.type === SUBCOMMAND_GROUP);
                if (subcommandOptions.length === 0) {
                    total += 1;
                } else {
                    for (const option of subcommandOptions) {
                        if (option.type === SUBCOMMAND_GROUP) {
                            total += Array.isArray(option.options) ? option.options.length : 0;
                        } else if (option.type === SUBCOMMAND) {
                            total += 1;
                        }
                    }
                }
            });
            return total;
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
                        chunks.push(part + '\n');
                        start += maxLength - 1;
                    }
                    continue;
                }
                if (currentChunk.length + line.length + 1 > maxLength) {
                    chunks.push(currentChunk);
                    currentChunk = '';
                }
                currentChunk += line + '\n';
            }
            if (currentChunk.length > 0) chunks.push(currentChunk);
            return chunks;
        }

        function getMarkdownContent(category) {
            const filePath = path.join(rootDir, 'docs', 'commands', `${category}.md`);
            if (!fs.existsSync(filePath)) return [null];
            let content = fs.readFileSync(filePath, 'utf-8');
            return smartSplit(content);
        }

        const addonFolders = fs.readdirSync(addonsDir, { withFileTypes: true });
        for (const addon of addonFolders) {
            if (!addon.isDirectory() || EXCLUDED_ADDONS.includes(addon.name)) continue;
            const addonName = addon.name;
            if (!isAddonActive(addonName)) continue;
            if (addonName === 'core') {
                const coreCommandsPath = path.join(addonsDir, 'core', 'commands');
                if (fs.existsSync(coreCommandsPath)) {
                    const coreCategories = fs.readdirSync(coreCommandsPath, { withFileTypes: true });
                    for (const categoryFolder of coreCategories) {
                        if (!categoryFolder.isDirectory() || EXCLUDED_CORE_CATEGORIES.includes(categoryFolder.name)) continue;
                        const categoryName = categoryFolder.name;
                        if (!isCoreCategoryActive(categoryName)) continue;
                        allCategories.push({
                            label: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
                            value: categoryName,
                            description: await t(interaction, 'core_utils_help_category_desc', { category: categoryName }),
                        });
                        pages[categoryName] = getMarkdownContent(categoryName);
                    }
                }
            } else {
                const manifestPath = path.join(addonsDir, addonName, 'addon.json');
                if (fs.existsSync(manifestPath)) {
                    const manifest = require(manifestPath);
                    allCategories.push({
                        label: manifest.name,
                        value: addonName,
                        description: manifest.description.substring(0, 100),
                    });
                    pages[addonName] = getMarkdownContent(addonName);
                }
            }
        }
        allCategories.sort((a, b) => a.label.localeCompare(b.label));

        const state = {
            userId: interaction.user.id,
            totalCommands: countTotalCommands(interaction.client.commands),
            allCategories: allCategories,
            pages: pages,
            categoryPage: 0,
            selectedCategory: null,
            docPage: 0,
        };

        const buildHelpReply = async (currentState) => {
            const { categoryPage, selectedCategory, docPage } = currentState;

            const container = new ContainerBuilder().setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }));

            if (!selectedCategory) {
                const desc = await t(interaction, 'core_utils_help_main_embed_desc', {
                    username: interaction.client.user.username,
                    category_count: currentState.allCategories.length,
                    command_count: currentState.totalCommands,
                });
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent(desc));
            } else {
                const categoryData = currentState.allCategories.find((c) => c.value === selectedCategory);
                const docPages = currentState.pages[selectedCategory];
                let docContent = docPages?.[docPage];

                if (docContent === null) docContent = await t(interaction, 'core_utils_help_docs_unavailable');
                if (!docContent) docContent = await t(interaction, 'core_utils_help_content_not_found');
                let finalContent = docContent.trim();

                if (finalContent.length === 0) {
                    finalContent = '\u200B';
                }

                if (finalContent.length > 4000) {
                    finalContent = finalContent.slice(0, 3997) + '...';
                }

                container.addTextDisplayComponents(new TextDisplayBuilder().setContent(finalContent));
            }

            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));

            const start = categoryPage * CATEGORIES_PER_PAGE;
            const end = start + CATEGORIES_PER_PAGE;
            const categoriesOnPage = currentState.allCategories.slice(start, end);

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('help-select-category')
                .setPlaceholder(
                    (
                        await t(interaction, 'core_utils_help_select_menu_placeholder', { username: interaction.client.user.username })
                    ).replace(/^./, (c) => c.toUpperCase())
                )
                .addOptions(categoriesOnPage);
            container.addActionRowComponents(new ActionRowBuilder().addComponents(selectMenu));

            const rowButtons = new ActionRowBuilder();
            const totalCategoryPages = Math.ceil(currentState.allCategories.length / CATEGORIES_PER_PAGE);

            const homeButtonLabel = (await t(interaction, 'core_utils_help_button_go_home')) || '🏠 Home';
            rowButtons.addComponents(
                new ButtonBuilder()
                    .setCustomId('help-go-home')
                    .setLabel(homeButtonLabel)
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(!selectedCategory)
            );

            if (selectedCategory) {
                const totalDocPages = currentState.pages[selectedCategory]?.length || 1;
                rowButtons.addComponents(
                    new ButtonBuilder()
                        .setCustomId('help-doc-prev')
                        .setLabel(await t(interaction, 'core_utils_help_button_doc_prev'))
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(docPage === 0),
                    new ButtonBuilder()
                        .setCustomId('help-doc-next')
                        .setLabel(await t(interaction, 'core_utils_help_button_doc_next'))
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(docPage >= totalDocPages - 1),
                    new ButtonBuilder()
                        .setCustomId('help-cat-prev')
                        .setLabel(await t(interaction, 'core_utils_help_button_cat_prev'))
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(categoryPage === 0),
                    new ButtonBuilder()
                        .setCustomId('help-cat-next')
                        .setLabel(await t(interaction, 'core_utils_help_button_cat_next'))
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(categoryPage >= totalCategoryPages - 1)
                );
            } else if (totalCategoryPages > 1) {
                rowButtons.addComponents(
                    new ButtonBuilder()
                        .setCustomId('help-cat-prev')
                        .setLabel(await t(interaction, 'core_utils_help_button_cat_prev'))
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(categoryPage === 0),
                    new ButtonBuilder()
                        .setCustomId('help-cat-next')
                        .setLabel(await t(interaction, 'core_utils_help_button_cat_next'))
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(categoryPage >= totalCategoryPages - 1)
                );
            }

            if (rowButtons.components.length > 0) {
                container.addActionRowComponents(rowButtons);
            }

            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    await t(interaction, 'common_container_footer', { username: interaction.client.user.username })
                )
            );

            return { components: [container] };
        };

        const initialReply = await buildHelpReply(state);
        const message = await interaction.reply({
            ...initialReply,
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
        });

        const collector = message.createMessageComponentCollector({ time: 300000 });

        collector.on('collect', async (i) => {
            if (i.user.id !== state.userId) {
                await i.reply({ content: await t(i, 'common_error_not_your_interaction'), ephemeral: true });
                return;
            }
            await i.deferUpdate();

            if (i.customId === 'help-cat-prev') state.categoryPage--;
            if (i.customId === 'help-cat-next') state.categoryPage++;
            if (i.customId === 'help-doc-prev') state.docPage--;
            if (i.customId === 'help-doc-next') state.docPage++;
            if (i.customId === 'help-go-home') {
                state.selectedCategory = null;
                state.docPage = 0;
            }

            if (i.isStringSelectMenu()) {
                state.selectedCategory = i.values[0];
                state.docPage = 0;
            }

            const totalCategoryPages = Math.ceil(state.allCategories.length / CATEGORIES_PER_PAGE);
            state.categoryPage = Math.max(0, Math.min(state.categoryPage, totalCategoryPages - 1));
            if (state.selectedCategory) {
                const totalDocPages = state.pages[state.selectedCategory]?.length || 1;
                state.docPage = Math.max(0, Math.min(state.docPage, totalDocPages - 1));
            }

            const updatedReply = await buildHelpReply(state);
            await i.editReply(updatedReply);
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'bot_shutdown') return;

            try {
                const finalReply = await buildHelpReply(state);

                if (finalReply.components) {
                    finalReply.components.forEach((container) => {
                        if (container.components) {
                            container.components.forEach((row) => {
                                if (Array.isArray(row.components)) {
                                    row.components = row.components.map((comp) => comp.setDisabled(true));
                                }
                            });
                        }
                    });
                }

                await interaction.editReply(finalReply);
            } catch (error) {
                await interaction.editReply({ components: [] }).catch(() => {});
            }
        });
    },
};
