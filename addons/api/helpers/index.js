/**
 * @namespace: addons/api/helpers/index.js
 * @type: Helper Script
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { ApplicationCommandOptionType } = require('discord.js');

function getOptionType(type) {
	switch (type) {
		case ApplicationCommandOptionType.String:
			return 'Text';
		case ApplicationCommandOptionType.Integer:
			return 'Integer';
		case ApplicationCommandOptionType.Number:
			return 'Number';
		case ApplicationCommandOptionType.Boolean:
			return 'True/False';
		case ApplicationCommandOptionType.User:
			return 'User';
		case ApplicationCommandOptionType.Channel:
			return 'Channel';
		case ApplicationCommandOptionType.Role:
			return 'Role';
		case ApplicationCommandOptionType.Mentionable:
			return 'Mention';
		case ApplicationCommandOptionType.Attachment:
			return 'Attachment';
		default:
			return 'Unknown';
	}
}

function formatChoices(choices) {
	if (!choices) return null;
	return choices.map((c) => `\`${c.name}\` (\`${c.value}\`)`).join(', ');
}

function clearRequireCache(filePath) {
	try {
		delete require.cache[require.resolve(filePath)];
	} catch (_e) {}
}

module.exports = {
	getOptionType,
	formatChoices,
	clearRequireCache,
};
