/**
 * @namespace: addons/pro/commands/dns/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */
module.exports = {
    subcommand: true,
    data: (subcommandGroup) => subcommandGroup.setName('dns').setDescription('Kelola DNS record untuk subdomain Pro-mu.'),
};
