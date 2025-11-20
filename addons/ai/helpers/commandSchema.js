/**
 * @namespace: addons/ai/helpers/commandSchema.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

// addons/ai/helpers/commandSchema.js

const { ApplicationCommandOptionType } = require('discord.js');

function mapType(type) {
    switch (type) {
        case ApplicationCommandOptionType.String:
            return 'string';
        case ApplicationCommandOptionType.Integer:
            return 'integer';
        case ApplicationCommandOptionType.Number:
            return 'number';
        case ApplicationCommandOptionType.Boolean:
            return 'boolean';
        default:
            return 'string';
    }
}

function extractParameters(options) {
    const parameters = { type: 'object', properties: {}, required: [] };
    if (!options) return parameters;

    options.forEach((opt) => {
        // Hanya ekstrak argumen, bukan subcommand/group
        if (opt && typeof opt === 'object' && opt.type > ApplicationCommandOptionType.SubcommandGroup) {
            parameters.properties[opt.name] = {
                type: mapType(opt.type),
                description: opt.description,
            };
            if (opt.choices?.length > 0) {
                parameters.properties[opt.name].enum = opt.choices.map((c) => c.value);
            }
            if (opt.required) {
                parameters.required.push(opt.name);
            }
        }
    });
    return parameters;
}

function flattenCommandOptions(options, schemas, namePrefix, descPrefix) {
    if (!options || options.length === 0) return;

    options.forEach((option) => {
        if (!option || typeof option !== 'object') return;
        if (option.type === ApplicationCommandOptionType.Subcommand) {
            schemas.push({
                name: `${namePrefix}_${option.name}`,
                description: `${option.description}`,
                parameters: extractParameters(option.options),
            });
        } else if (option.type === ApplicationCommandOptionType.SubcommandGroup) {
            flattenCommandOptions(option.options, schemas, `${namePrefix}_${option.name}`, `${option.description}`);
        }
    });
}

function generateCommandSchema(client) {
    const safeCommands = client.container.kythiaConfig.addons.ai.safeCommands;
    const schemas = [];

    client.commands.forEach((command) => {
        // Defensive: skip if command or command.data is missing
        if (!command || !command.data || typeof command.data !== 'object') return;

        // Defensive: skip if .name is missing
        const commandName = command.data.name;
        if (!commandName || typeof commandName !== 'string') return;

        if (!Array.isArray(safeCommands) || !safeCommands.includes(commandName)) return;

        // Defensive: check if toJSON exists and is a function
        if (typeof command.data.toJSON !== 'function') return;

        let commandJSON;
        try {
            commandJSON = command.data.toJSON();
        } catch (e) {
            // If toJSON fails, skip this command
            return;
        }
        if (!commandJSON || typeof commandJSON !== 'object') return;

        const hasSubOptions =
            Array.isArray(commandJSON.options) &&
            commandJSON.options.some(
                (opt) =>
                    opt &&
                    (opt.type === ApplicationCommandOptionType.Subcommand || opt.type === ApplicationCommandOptionType.SubcommandGroup)
            );

        if (hasSubOptions) {
            flattenCommandOptions(
                commandJSON.options, // Gunakan data JSON yang sudah matang
                schemas,
                commandName,
                commandJSON.description
            );
        } else {
            schemas.push({
                name: commandName,
                description: commandJSON.description,
                parameters: extractParameters(commandJSON.options),
            });
        }
    });
    return schemas;
}

module.exports = { generateCommandSchema };
