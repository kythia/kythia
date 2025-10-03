/**
 * 🚀 Kythia Docs Generator (Pro Edition)
 *
 * This script automatically generates detailed Markdown documentation for all bot commands
 * by reading their source files. It extracts not only the structure (name, options) but
 * also critical metadata like permissions, cooldowns, and usage examples.
 *
 * @version 0.9.9-beta
 */

require('dotenv').config();
require('../kythia.config.js');

require('module-alias/register');

const fs = require('fs');
const path = require('path');
const { ApplicationCommandOptionType, PermissionsBitField, SlashCommandSubcommandBuilder } = require('discord.js');

const rootAddonsDir = path.join(__dirname, '..', 'addons');
const outputDir = path.join(__dirname, 'commands');

const markdownBuffers = {};

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * 💡 Gets the valid slash command builder from a command module.
 * Ignores contextMenuCommand as it's not relevant for this documentation format.
 * @param {object} commandModule - The required command module.
 * @returns {object|null} The valid builder or null.
 */
function getSlashCommandBuilder(commandModule) {
    if (!commandModule) return null;
    return commandModule.slashCommand || commandModule.data || null;
}

/**
 * Gets the string representation of an option type.
 * @param {ApplicationCommandOptionType} type - The option type.
 * @returns {string}
 */
function getOptionType(type) {
    // This function remains the same
    switch (type) {
        case ApplicationCommandOptionType.String:
            return 'Text';
        case ApplicationCommandOptionType.Integer:
            return 'Integer';
        case ApplicationCommandOptionType.Number:
            return 'Number';
        case ApplicationCommandOptionType.Boolean:
            return 'Boolean';
        case ApplicationCommandOptionType.User:
            return 'User';
        case ApplicationCommandOptionType.Channel:
            return 'Channel';
        case ApplicationCommandOptionType.Role:
            return 'Role';
        case ApplicationCommandOptionType.Mentionable:
            return 'Mentionable';
        case ApplicationCommandOptionType.Attachment:
            return 'Attachment';
        default:
            return 'Unknown';
    }
}

/**
 * ✨ [UPGRADED] Generates Markdown documentation for command options.
 * Now includes an asterisk (*) for required options.
 * @param {Array} optionsData - The options array from the command JSON.
 * @param {boolean} [isListStyle=false] - Whether to render as a list or a section.
 * @returns {string} The generated Markdown string.
 */
function generateOptionsDocs(optionsData, isListStyle = false) {
    let md = isListStyle ? '' : '### ⚙️ Options\n\n';
    for (const opt of optionsData) {
        // ADDED: Asterisk for required options
        md += `- **\`${opt.name}${opt.required ? '*' : ''}\`**\n`;
        md += `  - **Description:** ${opt.description}\n`;
        md += `  - **Type:** ${getOptionType(opt.type)}\n`;
        if (opt.choices) {
            const choicesString = opt.choices.map((c) => `\`${c.name}\` (\`${c.value}\`)`).join(', ');
            md += `  - **Choices:** ${choicesString}\n`;
        }
    }
    return md;
}

/**
 * 📝 Generates Markdown for a subcommand.
 * @param {string} parentName - The name of the root command.
 * @param {object} subData - The subcommand's JSON data.
 * @param {string|null} [groupName=null] - The name of the subcommand group, if any.
 * @returns {string} The generated Markdown string.
 */
function generateSubcommandDocs(parentName, subData, groupName = null) {
    const groupPrefix = groupName ? `${groupName} ` : '';
    const subOptions = subData.options || [];

    // Generate placeholder values for the example usage string
    const usageString = subOptions
        .map((opt) => {
            const placeholder = `<${opt.name.toLowerCase()}>`;
            return opt.required ? placeholder : `[${placeholder}]`;
        })
        .join(' ');

    let md = `**\`/${parentName} ${groupPrefix}${subData.name}${usageString ? ' ' + usageString : ''}\`**\n`;
    md += `> ${subData.description}\n\n`;

    if (subOptions.length > 0) {
        md += `**Options for this subcommand:**\n`;
        md += generateOptionsDocs(subOptions, true);
    } else {
        md += `\n`;
    }
    return md;
}

/**
 * ✨ [NEW] Generates the metadata block for a command (permissions, cooldown, etc.).
 * @param {object} commandModule - The full command module object.
 * @returns {string} The generated Markdown string for the metadata section.
 */
function generateMetadataDocs(commandModule) {
    let md = '### 📋 Details\n\n';
    let hasMetadata = false;

    if (commandModule.ownerOnly) {
        md += `- **Owner Only:** ✅ Yes\n`;
        hasMetadata = true;
    }
    if (commandModule.cooldown) {
        md += `- **Cooldown:** ${commandModule.cooldown} seconds\n`;
        hasMetadata = true;
    }
    if (commandModule.permissions && commandModule.permissions.length > 0) {
        const perms = new PermissionsBitField(commandModule.permissions).toArray();
        md += `- **User Permissions:** \`${perms.join('`, `')}\`\n`;
        hasMetadata = true;
    }
    if (commandModule.botPermissions && commandModule.botPermissions.length > 0) {
        const perms = new PermissionsBitField(commandModule.botPermissions).toArray();
        md += `- **Bot Permissions:** \`${perms.join('`, `')}\`\n`;
        hasMetadata = true;
    }

    return hasMetadata ? md : '';
}

/**
 * ✨ [UPGRADED] Generates the complete Markdown for a command with a consistent structure.
 * Now includes a "Usage" summary for ALL command types before the detailed breakdown.
 * @param {object} commandJSON - The command's toJSON() output.
 * @param {object} commandModule - The full command module object.
 * @returns {string} The complete Markdown string for the command.
 */
function generateCommandMarkdown(commandJSON, commandModule) {
    const parentName = commandJSON.name;
    let mdContent = `### 💾 \`/${parentName}\`\n\n`;
    mdContent += `**Description:** ${commandJSON.description}\n\n`;
    mdContent += generateMetadataDocs(commandModule);

    const subcommands = commandJSON.options?.filter(
        (opt) => opt.type === ApplicationCommandOptionType.Subcommand || opt.type === ApplicationCommandOptionType.SubcommandGroup
    );
    const regularOptions = commandJSON.options?.filter(
        (opt) => opt.type !== ApplicationCommandOptionType.Subcommand && opt.type !== ApplicationCommandOptionType.SubcommandGroup
    );

    // --- NEW CONSISTENT USAGE SUMMARY SECTION ---
    mdContent += '### 💻 Usage\n\n';
    if (subcommands && subcommands.length > 0) {
        subcommands.forEach((sub) => {
            if (sub.type === ApplicationCommandOptionType.SubcommandGroup) {
                sub.options.forEach((subInGroup) => {
                    const usageString = (subInGroup.options || [])
                        .map((opt) => (opt.required ? `<${opt.name}>` : `[${opt.name}]`))
                        .join(' ');
                    mdContent += `\`/${parentName} ${sub.name} ${subInGroup.name}${usageString ? ' ' + usageString : ''}\`\n`;
                });
            } else {
                const usageString = (sub.options || []).map((opt) => (opt.required ? `<${opt.name}>` : `[${opt.name}]`)).join(' ');
                mdContent += `\`/${parentName} ${sub.name}${usageString ? ' ' + usageString : ''}\`\n`;
            }
        });
        mdContent += '\n';
    } else if (regularOptions && regularOptions.length > 0) {
        const usageString = regularOptions.map((opt) => (opt.required ? `<${opt.name}>` : `[${opt.name}]`)).join(' ');
        mdContent += `\`/${parentName}${usageString ? ' ' + usageString : ''}\`\n\n`;
    } else {
        mdContent += `\`/${parentName}\`\n\n`;
    }

    // --- DETAILED BREAKDOWN SECTION ---
    if (subcommands && subcommands.length > 0) {
        mdContent += `### 🔧 Subcommands\n\n`;
        for (const sub of subcommands) {
            if (sub.type === ApplicationCommandOptionType.SubcommandGroup) {
                for (const subInGroup of sub.options) {
                    mdContent += generateSubcommandDocs(parentName, subInGroup, sub.name);
                }
            } else {
                mdContent += generateSubcommandDocs(parentName, sub);
            }
        }
    } else if (regularOptions && regularOptions.length > 0) {
        mdContent += generateOptionsDocs(regularOptions);
    }

    return mdContent;
}

/**
 * ✨ [NEW] Processes a directory with a split command structure (_command.js).
 * It assembles the main command and all its subcommands before generating docs.
 * @param {string} dirPath - Path to the command directory.
 * @param {string} categoryName - The name of the category/addon.
 */
function processSplitCommandDirectory(dirPath, categoryName) {
    console.log(`[SPLIT] Assembling '${categoryName}' from folder...`);
    try {
        const baseCommandPath = path.join(dirPath, '_command.js');
        const baseCommandModule = require(baseCommandPath);

        if (baseCommandModule.ownerOnly) {
            console.log(`⏩ Ignoring owner-only split command in '${categoryName}'.`);
            return; // Jangan proses sama sekali
        }

        const mainBuilder = getSlashCommandBuilder(baseCommandModule);
        if (!mainBuilder || typeof mainBuilder.addSubcommand !== 'function') {
            console.error(`❌ Base command in ${categoryName} is not a valid SlashCommandBuilder.`);
            return;
        }

        const subcommandFiles = fs.readdirSync(dirPath).filter((file) => file.endsWith('.js') && file !== '_command.js');

        for (const subFile of subcommandFiles) {
            const subFilePath = path.join(dirPath, subFile);
            const subcommandModule = require(subFilePath);

            if (typeof subcommandModule.data === 'function') {
                const subcommandBuilder = new SlashCommandSubcommandBuilder();
                subcommandModule.data(subcommandBuilder);
                mainBuilder.addSubcommand(subcommandBuilder);
            }
        }

        const commandJSON = mainBuilder.toJSON();
        const markdown = generateCommandMarkdown(commandJSON, baseCommandModule);

        if (!markdownBuffers[categoryName]) {
            markdownBuffers[categoryName] = `## 📁 Command Category: ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}\n\n`;
        }
        markdownBuffers[categoryName] += markdown + '\n\n';
        console.log(`[SPLIT] Added assembled command '${commandJSON.name}' to buffer`);
    } catch (e) {
        console.error(`❌ Failed to assemble split command in addon ${categoryName}: ${e.message}`);
    }
}

function runGenerator() {
    console.log('🚀 Starting documentation generator...');

    const addons = fs.readdirSync(rootAddonsDir, { withFileTypes: true }).filter((dirent) => dirent.isDirectory());

    for (const addon of addons) {
        const commandsPath = path.join(rootAddonsDir, addon.name, 'commands');
        if (!fs.existsSync(commandsPath)) continue;

        const processSimpleDirectory = (dirPath, categoryName) => {
            const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.js'));
            for (const file of files) {
                try {
                    const filePath = path.join(dirPath, file);
                    const commandModule = require(filePath);

                    if (commandModule.ownerOnly) {
                        console.log(`⏩ Ignoring owner-only command '${file}' in '${categoryName}'.`);
                        continue; // Skip file ini dan lanjut ke file berikutnya
                    }

                    const commandBuilder = getSlashCommandBuilder(commandModule);

                    if (!commandBuilder) continue;

                    const commandJSON = commandBuilder.toJSON();
                    const markdown = generateCommandMarkdown(commandJSON, commandModule);

                    if (!markdownBuffers[categoryName]) {
                        markdownBuffers[categoryName] =
                            `## 📁 Command Category: ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}\n\n`;
                    }
                    markdownBuffers[categoryName] += markdown + '\n\n';
                    console.log(`[${categoryName.toUpperCase()}] Added '${commandJSON.name}' to buffer`);
                } catch (e) {
                    console.error(`❌ Failed to process file ${file} in category ${categoryName}: ${e.message}`);
                }
            }
        };

        const categoryName = addon.name;
        const baseCommandPath = path.join(commandsPath, '_command.js');

        if (fs.existsSync(baseCommandPath)) {
            processSplitCommandDirectory(commandsPath, categoryName);
        } else if (addon.name === 'core') {
            const coreCategories = fs.readdirSync(commandsPath, { withFileTypes: true }).filter((dirent) => dirent.isDirectory());
            for (const category of coreCategories) {
                processSimpleDirectory(path.join(commandsPath, category.name), category.name);
            }
        } else {
            processSimpleDirectory(commandsPath, categoryName);
        }
    }

    console.log('\n✅ Writing all buffers to .md files...');
    for (const categoryName in markdownBuffers) {
        try {
            const outputFilePath = path.join(outputDir, `${categoryName}.md`);
            fs.writeFileSync(outputFilePath, markdownBuffers[categoryName]);
            console.log(`   -> Generated: ${path.relative(path.join(__dirname, '..'), outputFilePath)}`);
        } catch (e) {
            console.error(`❌ Failed to write file for category ${categoryName}: ${e.message}`);
        }
    }

    console.log('\n🎉 Documentation generator finished successfully.');
}

runGenerator();
