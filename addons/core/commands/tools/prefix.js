/**
 * @namespace: addons/core/commands/tools/prefix.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const { SlashCommandBuilder, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const { t } = require('@utils/translator');
const { rolePrefix, roleUnprefix } = require('../../helpers');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roleprefix')
        .setDescription('📛 Adds or removes a prefix from member nicknames.')
        .addSubcommand((sub) => sub.setName('add').setDescription('📛 Adds the highest role prefix to member nicknames.'))
        .addSubcommand((sub) => sub.setName('remove').setDescription('📛 Removes the prefix from member nicknames.'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageNicknames)
        .setContexts(InteractionContextType.Guild),

    guildOnly: true,
    permissions: PermissionFlagsBits.ManageNicknames,
    botPermissions: PermissionFlagsBits.ManageNicknames,
    async execute(interaction) {
        // deferReply dibuat ephemeral karena balasannya hanya konfirmasi singkat
        await interaction.deferReply({ ephemeral: true });

        const subcommand = interaction.options.getSubcommand();
        let updated = 0;

        if (subcommand === 'add') {
            updated = await rolePrefix(interaction.guild);
            await interaction.editReply({
                content: await t(interaction, 'core_tools_prefix_add_success', { count: updated }),
            });
        } else if (subcommand === 'remove') {
            updated = await roleUnprefix(interaction.guild);
            await interaction.editReply({
                content: await t(interaction, 'core_tools_prefix_remove_success', { count: updated }),
            });
        }
    },
};
