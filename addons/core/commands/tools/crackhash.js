/**
 * @namespace: addons/core/commands/tools/crackhash.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');
const axios = require('axios');

// Cukup sediakan pilihan algoritma yang didukung API
const SUPPORTED_HASHES = [
    { name: 'MD5', value: 'md5' },
    { name: 'SHA1', value: 'sha1' },
    { name: 'SHA256', value: 'sha256' },
    { name: 'SHA512', value: 'sha512' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crack-hash') // Nama lebih akurat!
        .setDescription('🔍 Try to lookup a hash from public databases (MD5, SHA1, SHA256, SHA512).')
        .addStringOption((option) =>
            option
                .setName('algorithm')
                .setDescription('The hash algorithm to lookup')
                .setRequired(true)
                .addChoices(...SUPPORTED_HASHES)
        )
        .addStringOption((option) => option.setName('hash').setDescription('The hash to try to lookup').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const algorithm = interaction.options.getString('algorithm');
        const hash = interaction.options.getString('hash').toLowerCase(); // Hash biasanya case-insensitive

        // Validasi panjang hash berdasarkan algoritmanya, biar lebih akurat
        const hashLengths = { md5: 32, sha1: 40, sha256: 64, sha512: 128 };
        if (hash.length !== hashLengths[algorithm]) {
            return interaction.editReply({
                content: await t(interaction, 'core_tools_crackhash_invalid_hash_length', {
                    algorithm: algorithm.toUpperCase(),
                    hashLength: hashLengths[algorithm],
                }),
            });
        }

        const algoObj = SUPPORTED_HASHES.find((a) => a.value === algorithm);

        let resultText = await t(interaction, 'core_tools_crackhash_not_found');
        let found = false;

        try {
            // API yang lebih stabil: hashes.com (gratis, tanpa kunci, mengembalikan JSON)
            const response = await axios.get(`https://hashes.com/api.php?act=get&hash=${hash}`);

            // Cek hasil dari API
            if (response.data && response.data.status === 'success' && response.data.result) {
                // API ini mengembalikan objek, kita ambil plaintext-nya
                const results = response.data.result;
                const foundHash = Object.values(results).find((r) => r.hash === hash && r.plaintext);

                if (foundHash) {
                    resultText = '```' + foundHash.plaintext + '```';
                    found = true;
                }
            }
        } catch (error) {
            console.error('Hash lookup API error:', error);
            resultText = await t(interaction, 'core_tools_crackhash_api_error');
        }

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(await t(interaction, 'core_tools_crackhash_result_desc'))
            .addFields(
                { name: await t(interaction, 'core_tools_crackhash_algorithm'), value: algoObj.name, inline: true },
                { name: await t(interaction, 'core_tools_crackhash_hash'), value: '```' + hash + '```' },
                { name: await t(interaction, 'core_tools_crackhash_result'), value: resultText }
            )
            .setFooter(await embedFooter(interaction));

        await interaction.editReply({ embeds: [embed] });
    },
};
