/**
 * @namespace: addons/core/commands/tools/hash.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { SlashCommandBuilder, MessageFlags, EmbedBuilder } = require('discord.js');
const crypto = require('crypto');
const { t } = require('@utils/translator');
const { embedFooter } = require('@src/utils/discord');

const SUPPORTED_ALGOS = [
    { name: 'MD5', value: 'md5' },
    { name: 'SHA1', value: 'sha1' },
    { name: 'SHA224', value: 'sha224' },
    { name: 'SHA256', value: 'sha256' },
    { name: 'SHA384', value: 'sha384' },
    { name: 'SHA512', value: 'sha512' },
    { name: 'SHA3-256', value: 'sha3-256' },
    { name: 'SHA3-512', value: 'sha3-512' },
    { name: 'RIPEMD160', value: 'ripemd160' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hash')
        .setDescription('🔒 Hash a text string using MD5, SHA, or other algorithms.')
        .addStringOption((option) =>
            option
                .setName('algorithm')
                .setDescription('The hash algorithm to use')
                .setRequired(true)
                .addChoices(...SUPPORTED_ALGOS)
        )
        .addStringOption((option) => option.setName('text').setDescription('The text to hash').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const algorithm = interaction.options.getString('algorithm');
        const text = interaction.options.getString('text');

        if (!text || text.length > 1024) {
            return interaction.editReply({ content: await t(interaction, 'core_tools_hash_invalid_text') });
        }

        // Validate algorithm
        const algoObj = SUPPORTED_ALGOS.find((a) => a.value === algorithm);
        if (!algoObj) {
            return interaction.editReply({ content: await t(interaction, 'core_tools_hash_invalid_algorithm') });
        }

        let hash;
        try {
            hash = crypto.createHash(algorithm).update(text, 'utf8').digest('hex');
        } catch (e) {
            return interaction.editReply({ content: await t(interaction, 'core_tools_hash_failed_hash') });
        }

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(await t(interaction, 'core_tools_hash_result'))
            .addFields(
                { name: await t(interaction, 'core_tools_hash_algorithm'), value: algoObj.name, inline: true },
                { name: await t(interaction, 'core_tools_hash_input'), value: '```' + text + '```' },
                { name: await t(interaction, 'core_tools_hash_hash'), value: '```' + hash + '```' }
            )
            .setFooter(await embedFooter(interaction));

        await interaction.editReply({ embeds: [embed] });
    },
};
