/**
 * @namespace: scripts/audit_permissions.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

/**
 * 🕵️‍♂️ Kythia Permissions Auditor
 *
 * @file scripts/audit_permissions.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 *
 * @description
 * Script to read Kythia's addon architecture
 * and display all registered permissions, as well as context and special flags.
 */

require('module-alias/register');

const { PermissionsBitField } = require('discord.js');
const Kythia = require('../src/Kythia.js');
const clc = require('cli-color');

function parseContext(command) {
    // Supports .setContexts or .setContext (legacy)
    let ctx = command.data?.contexts;
    if (!ctx && typeof command.data?.context === 'number') ctx = [command.data.context];
    if (!ctx) return 'Unknown';
    if (Array.isArray(ctx)) {
        return ctx
            .map((c) => {
                if (typeof c === 'string') return c;
                if (typeof c === 'number') {
                    if (c === 0) return 'Guild';
                    if (c === 1) return 'BotDM';
                    return `Unknown(${c})`;
                }
                return String(c);
            })
            .join(', ');
    }
    return String(ctx);
}

function boolFlag(val) {
    return val ? clc.green('Yes') : clc.red('No');
}

async function audit() {
    console.log(clc.yellow('Starting permissions audit...'));

    // Initialize Kythia class to access its loader
    const bot = new Kythia();

    // Run _loadAddons to process all commands and permissions just like at bot startup
    try {
        await bot._loadAddons();
        console.log(clc.green('Successfully loaded all addons and commands.'));
    } catch (error) {
        console.error(clc.red('Failed to load addons:'), error);
        return;
    }

    const commands = bot.client.commands;
    console.log(clc.cyan(`Analyzing total of ${commands.size} command entries (including subcommands).\n`));

    const auditResult = {};

    // Iterate all loaded commands
    // 'command' here is the final object after merging with permission defaults
    for (const [key, command] of commands.entries()) {
        // Skip subcommand entries (which have a space in their key)
        // because their permissions are usually determined by the main command.
        if (key.includes(' ')) {
            continue;
        }

        const commandName = command.data?.name;
        if (!commandName) continue;

        const category = bot.commandCategoryMap.get(commandName) || 'Unknown';
        if (!auditResult[category]) {
            auditResult[category] = [];
        }

        // Get permissions from the final command object
        const perms = {
            default: command.data.default_member_permissions
                ? new PermissionsBitField(command.data.default_member_permissions).toArray().join(', ') || 'None'
                : 'Everyone',
            user: command.permissions ? new PermissionsBitField(command.permissions).toArray().join(', ') || 'None' : 'None',
            bot: command.botPermissions ? new PermissionsBitField(command.botPermissions).toArray().join(', ') || 'None' : 'None',
        };

        // Get context and special flags
        const context = parseContext(command);
        const ownerOnly = !!command.ownerOnly;
        const teamOnly = !!command.teamOnly;
        const guildOnly = !!command.guildOnly;
        // isInMainGuild is also sometimes used
        const isInMainGuild = !!command.isInMainGuild;

        auditResult[category].push({
            name: commandName,
            perms,
            context,
            ownerOnly,
            teamOnly,
            guildOnly,
            isInMainGuild,
        });
    }

    // Print the results nicely
    for (const category in auditResult) {
        console.log(clc.bold.underline.cyan(`\n--- Addon: ${category} ---`));
        for (const cmd of auditResult[category]) {
            console.log(clc.bold(`/${cmd.name}`));
            console.log(clc.whiteBright(`  - Default Permissions:`), clc.magenta(cmd.perms.default));
            console.log(clc.whiteBright(`  - Required User Permissions:`), clc.yellow(cmd.perms.user));
            console.log(clc.whiteBright(`  - Required Bot Permissions: `), clc.yellow(cmd.perms.bot));
            console.log(clc.whiteBright(`  - Context:`), clc.cyan(cmd.context));
            console.log(clc.whiteBright(`  - Owner Only:`), boolFlag(cmd.ownerOnly));
            console.log(clc.whiteBright(`  - Team Only:`), boolFlag(cmd.teamOnly));
            console.log(clc.whiteBright(`  - Guild Only:`), boolFlag(cmd.guildOnly));
            console.log(clc.whiteBright(`  - isInMainGuild:`), boolFlag(cmd.isInMainGuild));
        }
    }

    console.log(clc.green('\nAudit complete! Time to review together.'));
    process.exit(0);
}

audit();