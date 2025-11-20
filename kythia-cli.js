#!/usr/bin/env node

/**
 * 🩷 Kythia CLI
 *
 * @file kythia-cli.js
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 *
 * @description
 * Your personal command-line assistant for managing the Kythia project.
 * Inspired by Laravel's Artisan, this tool centralizes all your project scripts.
 *
 */

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CLI_DIR = __dirname;

console.log('🌸 Kythia CLI 🌸\n');

/**
 * Helper function to safely run a node script.
 * @param {string} scriptPath - Path to the script to run.
 * @param {string} args - Additional arguments to pass to the script.
 */
function runScript(action, args = '') {
    try {
        console.log(`💻 Running script: ${action} ${args}`);
        execSync(`${action} ${args}`, { stdio: 'inherit' });
        console.log(`✅ Script finished successfully.`);
    } catch (error) {
        console.error(`❌ Error executing script ${action}:`);
        process.exit(1);
    }
}

/**
 * Helper function to run a shell command.
 * @param {string} command - The shell command to run.
 */
function runShell(command) {
    try {
        console.log(`💻 Running: ${command}`);
        execSync(command, { stdio: 'inherit' });
        console.log(`✅ Finished: ${command}`);
    } catch (error) {
        console.error(`❌ Error running: ${command}`);
        process.exit(1);
    }
}

// Grouped commands by category
const groupedScripts = {
    pm2: {
        desc: 'PM2 process management commands',
        commands: {
            startup: {
                desc: 'Start bot with PM2 and save process list',
                run: () => runShell('pm2 start index.js --name kythia-bot -- --deploy && pm2 save'),
            },
            start: {
                desc: 'Start bot with PM2',
                run: () => runShell('pm2 start index.js --name kythia-bot -- --deploy'),
            },
            restart: {
                desc: 'Restart bot with PM2',
                run: () => runShell('pm2 restart kythia-bot'),
            },
            stop: {
                desc: 'Stop bot with PM2',
                run: () => runShell('pm2 stop kythia-bot'),
            },
            delete: {
                desc: 'Delete bot process from PM2',
                run: () => runShell('pm2 delete kythia-bot'),
            },
            logs: {
                desc: 'Show PM2 logs for bot',
                run: () => runShell('pm2 logs kythia-bot'),
            },
        },
    },
    db: {
        desc: 'Database management commands',
        commands: {
            flush: {
                desc: 'Flush the redis (USE WITH CAUTION!)',
                run: () => runScript('node src/database/KythiaFlush.js'),
            },
            seed: {
                desc: 'Seed the database',
                run: () => runScript('node src/database/KythiaSeeder.js'),
            },
        },
    },
    docs: {
        desc: 'Documentation commands',
        commands: {
            generate: {
                desc: 'Generate documentation',
                run: () => runScript('node docs/generate.js'),
            },
        },
    },
    build: {
        desc: 'Build, obfuscate, and package commands',
        commands: {
            build: {
                desc: 'Build: upversion, docs, obfuscate',
                run: () => runShell('node scripts/upversion.js && node scripts/docs.js && node scripts/obfuscate.js'),
            },
            obfuscate: {
                desc: 'Obfuscate code',
                run: () => runScript('node scripts/obfuscate.js'),
            },
            upversion: {
                desc: 'Upversion',
                run: () => runScript('node scripts/upversion.js'),
            },
        },
    },
    test: {
        desc: 'Testing commands',
        commands: {
            test: {
                desc: 'Run tests (jest)',
                run: () => runShell('jest'),
            },
        },
    },
    husky: {
        desc: 'Husky prepare command',
        commands: {
            prepare: {
                desc: 'Run husky prepare',
                run: () => runShell('husky'),
            },
        },
    },
    check: {
        desc: 'Check scripts',
        commands: {
            e: {
                desc: 'Check E',
                run: () => runScript('node scripts/check_e.js'),
            },
            t: {
                desc: 'Check T',
                run: () => runScript('node scripts/check_t.js'),
            },
        },
    },
    refactor: {
        desc: 'Refactor scripts',
        commands: {
            t: {
                desc: 'Refactor T',
                run: () => runScript('node scripts/refactor_t.js'),
            },
        },
    },
    add: {
        desc: 'Add scripts',
        commands: {
            namespace: {
                desc: 'Add namespace',
                run: () => runScript('node scripts/add_namespace.js'),
            },
        },
    },
    gen: {
        desc: 'Generate scripts',
        commands: {
            structure: {
                desc: 'Generate structure',
                run: () => runScript('node scripts/gen_structure.js'),
            },
        },
    },
    audit: {
        desc: 'Audit scripts',
        commands: {
            permissions: {
                desc: 'Audit permissions',
                run: () => runScript('node scripts/audit_permissions.js'),
            },
        },
    },
    format: {
        desc: 'Format scripts',
        commands: {
            format: {
                desc: 'Format code with Prettier',
                run: () => runShell('npx prettier --write "**/*.{js,json}"'),
            },
        },
    },
    // Main bot scripts (not grouped)
    main: {
        desc: 'Main bot commands',
        commands: {
            start: {
                desc: 'Start the Kythia bot (node index.js --deploy)',
                run: () => runShell('node index.js --deploy'),
            },
            deploy: {
                desc: 'Run deploy.js (slash command deploy)',
                run: () => runScript('node deploy.js'),
            },
        },
    },
};

const y = yargs(hideBin(process.argv));

// --- Command: Start Bot (with deploy flag) ---
y.command(
    'start',
    'Starts the Kythia bot.',
    (yargs) => {
        return yargs.option('deploy', {
            alias: 'd',
            type: 'boolean',
            description: 'Run with --deploy flag to update slash commands.',
            default: false,
        });
    },
    (argv) => {
        console.log('🚀 Starting Kythia bot ...');
        const command = argv.deploy ? 'node index.js' : 'node index.js --deploy';
        try {
            execSync(command, { stdio: 'inherit' });
            console.log('✅ Bot started successfully.');
        } catch (error) {
            console.error(`❌ Failed to start bot. ${error}`);
            process.exit(1);
        }
    }
);

// --- Register grouped commands ---
Object.entries(groupedScripts).forEach(([category, { desc, commands }]) => {
    // For main, don't nest under a group, just add as top-level commands (except 'start', already handled)
    if (category === 'main') {
        Object.entries(commands).forEach(([action, { desc, run }]) => {
            if (action === 'start') return; // already handled above
            y.command(
                action,
                desc,
                () => {},
                () => run()
            );
        });
    } else {
        // Register as <category> <action>
        Object.entries(commands).forEach(([action, { desc, run }]) => {
            y.command(
                `${category} ${action}`,
                desc,
                () => {},
                () => run()
            );
        });
    }
});

// --- Command: Make New Command File ---
y.command(
    'make:command <addon> <name>',
    'Creates a new command file in an addon.',
    (yargs) => {
        return yargs
            .positional('addon', {
                describe: 'The name of the addon (e.g., core)',
                type: 'string',
            })
            .positional('name', {
                describe: 'The name of the new command (e.g., my-command)',
                type: 'string',
            });
    },
    (argv) => {
        const { addon, name } = argv;
        const commandName = name.toLowerCase();
        // Use CLI_DIR instead of __dirname for compatibility with npx and pkg
        const addonPath = path.join(CLI_DIR, 'addons', addon, 'commands');

        if (!fs.existsSync(addonPath)) {
            console.error(`❌ Addon '${addon}' not found or does not have a /commands directory.`);
            process.exit(1);
        }

        // If addon is 'core', default to 'utils' subfolder
        const targetDir = addon === 'core' ? path.join(addonPath, 'utils') : addonPath;
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const filePath = path.join(targetDir, `${commandName}.js`);

        if (fs.existsSync(filePath)) {
            console.error(`❌ Command file '${commandName}.js' already exists in '${addon}'.`);
            process.exit(1);
        }

        // Command file template
        const template = `/**
 * @namespace: addons/${addon}/commands/${addon === 'core' ? 'utils/' : ''}${commandName}.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
const { SlashCommandBuilder } = require('discord.js');
const { t } = require('@coreHelpers/translator');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('${commandName}')
        .setDescription('Description for ${commandName} command.'),
    async execute(interaction, container) {
        await interaction.reply({ content: 'Hello from your new command!', ephemeral: true });
    },
};
`;
        fs.writeFileSync(filePath, template.trim());
        console.log(`✅ Successfully created command: ${path.relative(CLI_DIR, filePath)}`);
    }
);

y.demandCommand(1, 'You need to specify a command to run. Use --help to see available commands.').strict().help().alias('help', 'h').argv;
