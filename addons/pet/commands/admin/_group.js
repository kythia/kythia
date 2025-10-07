/**
 * @namespace: addons/pet/commands/admin/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

module.exports = {
    subcommand: true,
    data: (group) => group.setName('admin').setDescription('Administrative pet management commands.'),
};
