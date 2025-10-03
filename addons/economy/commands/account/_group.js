/**
 * @namespace: addons/economy/commands/account/_group.js
 * @type: Subcommand Group Definition
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

module.exports = {
    subcommand: true,
    data: (group) => group.setName('account').setDescription('Manage your bank account.'),
};
