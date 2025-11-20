/**
 * @namespace: addons/tempvoice/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const tv_rename = require('./buttons/tv_rename');
const tv_limit = require('./buttons/tv_limit');
const tv_privacy = require('./buttons/tv_privacy');
// const tv_waiting = require('./buttons/tv_waiting');
// const tv_chat = require('./buttons/tv_chat');
const tv_trust = require('./buttons/tv_trust');
const tv_block = require('./buttons/tv_block');
const tv_unblock = require('./buttons/tv_unblock');
const tv_untrust = require('./buttons/tv_untrust');

const tv_kick = require('./buttons/tv_kick');
const tv_region = require('./buttons/tv_region');
const tv_invite = require('./buttons/tv_invite');

const tv_claim = require('./buttons/tv_claim');
const tv_transfer = require('./buttons/tv_transfer');
const tv_delete = require('./buttons/tv_delete');
const tv_waiting = require('./buttons/tv_waiting');
const tv_waiting_allow = require('./buttons/tv_waiting_allow');
const tv_waiting_deny = require('./buttons/tv_waiting_deny');

const tv_stage = require('./buttons/tv_stage');

const tv_rename_modal = require('./modals/tv_rename_modal');
const tv_limit_modal = require('./modals/tv_limit_modal');

const tv_kick_menu = require('./select_menus/tv_kick_menu');
const tv_privacy_menu = require('./select_menus/tv_privacy_menu');
const tv_trust_menu = require('./select_menus/tv_trust_menu');
const tv_block_menu = require('./select_menus/tv_block_menu');
const tv_unblock_menu = require('./select_menus/tv_unblock_menu');
const tv_untrust_menu = require('./select_menus/tv_untrust_menu');
const tv_region_menu = require('./select_menus/tv_region_menu');
const tv_transfer_menu = require('./select_menus/tv_transfer_menu');
const tv_invite_menu = require('./select_menus/tv_invite_menu');

module.exports = {
    async initialize(bot) {
        const summary = [];

        bot.registerButtonHandler('tv_rename', tv_rename.execute);
        bot.registerButtonHandler('tv_limit', tv_limit.execute);
        bot.registerButtonHandler('tv_privacy', tv_privacy.execute);
        bot.registerButtonHandler('tv_trust', tv_trust.execute);
        bot.registerButtonHandler('tv_block', tv_block.execute);
        bot.registerButtonHandler('tv_unblock', tv_unblock.execute);
        bot.registerButtonHandler('tv_untrust', tv_untrust.execute);
        bot.registerButtonHandler('tv_kick', tv_kick.execute);
        bot.registerButtonHandler('tv_region', tv_region.execute);
        bot.registerButtonHandler('tv_claim', tv_claim.execute);
        bot.registerButtonHandler('tv_delete', tv_delete.execute);
        bot.registerButtonHandler('tv_transfer', tv_transfer.execute);
        bot.registerButtonHandler('tv_invite', tv_invite.execute);
        bot.registerButtonHandler('tv_waiting', tv_waiting.execute);
        bot.registerButtonHandler('tv_waiting_allow', tv_waiting_allow.execute);
        bot.registerButtonHandler('tv_waiting_deny', tv_waiting_deny.execute);
        bot.registerButtonHandler('tv_stage', tv_stage.execute);

        summary.push(' └─ ✅ TempVoice Buttons registered.');

        bot.registerModalHandler('tv_rename_modal', tv_rename_modal.execute);
        bot.registerModalHandler('tv_limit_modal', tv_limit_modal.execute);

        summary.push(' └─ ✅ TempVoice Modals registered.');

        bot.registerSelectMenuHandler('tv_kick_menu', tv_kick_menu.execute);
        bot.registerSelectMenuHandler('tv_privacy_menu', tv_privacy_menu.execute);
        bot.registerSelectMenuHandler('tv_trust_menu', tv_trust_menu.execute);
        bot.registerSelectMenuHandler('tv_block_menu', tv_block_menu.execute);
        bot.registerSelectMenuHandler('tv_unblock_menu', tv_unblock_menu.execute);
        bot.registerSelectMenuHandler('tv_untrust_menu', tv_untrust_menu.execute);
        bot.registerSelectMenuHandler('tv_transfer_menu', tv_transfer_menu.execute);
        bot.registerSelectMenuHandler('tv_region_menu', tv_region_menu.execute);
        bot.registerSelectMenuHandler('tv_invite_menu', tv_invite_menu.execute);

        summary.push(' └─ ✅ TempVoice Select Menus registered.');

        return summary;
    },
};
