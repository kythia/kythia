/**
 * @namespace: addons/checklist/commands/server/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

module.exports = {
    subcommand: true,
    data: (group) => group.setName('server').setDescription('Manage server checklist (public)'),
};
