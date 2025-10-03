/**
 * @namespace: addons/core/commands/tools/obfuscate.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const JavaScriptObfuscator = require('javascript-obfuscator');
const { t } = require('@utils/translator');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('obfuscate')
        .setDescription('🔒 Obfuscate a Lua or JavaScript file and return it as an attachment.')
        .addStringOption((option) =>
            option
                .setName('type')
                .setDescription('The type of script to obfuscate (lua/javascript)')
                .setRequired(true)
                .addChoices({ name: 'javascript', value: 'javascript' }, { name: 'lua', value: 'lua' })
        )
        .addAttachmentOption((option) => option.setName('file').setDescription('The script file to obfuscate').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const type = interaction.options.getString('type');
        const file = interaction.options.getAttachment('file');

        if (!file || !file.url) {
            return interaction.editReply({ content: await t(interaction, 'core_tools_obfuscate_no_file'), ephemeral: true });
        }

        // Download the file content
        let scriptText;
        try {
            const res = await axios.get(file.url);
            scriptText = res.data;
        } catch (err) {
            return interaction.editReply({ content: await t(interaction, 'core_tools_obfuscate_failed_download'), ephemeral: true });
        }

        let obfuscated, filename;
        if (type === 'javascript') {
            try {
                obfuscated = JavaScriptObfuscator.obfuscate(scriptText, {
                    compact: true,
                    controlFlowFlattening: true,
                }).getObfuscatedCode();
                filename = file.name.replace(/\.js$/i, '') + '.obf.js';
            } catch (e) {
                return interaction.editReply({ content: await t(interaction, 'core_tools_obfuscate_failed_javascript'), ephemeral: true });
            }
        } else if (type === 'lua') {
            try {
                const response = await axios.post(
                    'https://wearedevs.net/api/obfuscate',
                    { script: scriptText },
                    { headers: { 'Content-Type': 'application/json' } }
                );
                // The API returns an object with { success, obfuscated }
                if (
                    !response.data ||
                    typeof response.data !== 'object' ||
                    !response.data.success ||
                    typeof response.data.obfuscated !== 'string' ||
                    !response.data.obfuscated.trim()
                ) {
                    console.error('Unexpected response from Lua obfuscator:', response.data);
                    return interaction.editReply({ content: await t(interaction, 'core_tools_obfuscate_failed_lua'), ephemeral: true });
                }
                // Replace the version comment with "by kenndeclouv"
                obfuscated = response.data.obfuscated.replace(
                    /--\[\[\s*v\d+\.\d+\.\d+\s+https:\/\/wearedevs\.net\/obfuscator\s*\]\]/g,
                    '--[[ obfuscated with kythia bot by kenndeclouv ]]'
                );
                filename = file.name.replace(/\.lua$/i, '') + '.obf.lua';
            } catch (e) {
                console.error(e);
                return interaction.editReply({ content: await t(interaction, 'core_tools_obfuscate_failed_lua'), ephemeral: true });
            }
        } else {
            return interaction.editReply({ content: await t(interaction, 'core_tools_obfuscate_invalid_type'), ephemeral: true });
        }

        const buffer = Buffer.from(obfuscated, 'utf8');
        const attachment = new AttachmentBuilder(buffer, { name: filename });

        await interaction.editReply({
            content: await t(interaction, 'core_tools_obfuscate_success', { type }),
            ephemeral: true,
            files: [attachment],
        });
    },
};
