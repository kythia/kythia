/**
 * @namespace: addons/core/commands/tools/encrypt.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedFooter } = require('@utils/discord');
const { t } = require('@utils/translator');
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // Untuk AES, ini selalu 16
const AUTH_TAG_LENGTH = 16;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('encrypt')
        .setDescription('🔒 Encrypt a text with a secret key (two-way encryption).')
        .addStringOption((option) => option.setName('text').setDescription('The text you want to encrypt').setRequired(true))
        .addStringOption((option) =>
            option.setName('secret-key').setDescription('A 32-character secret key for encryption').setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const text = interaction.options.getString('text');
        const secretKey = interaction.options.getString('secret-key');

        // KUNCI PENTING: Kunci untuk AES-256 HARUS 32 byte (32 karakter).
        if (secretKey.length !== 32) {
            return interaction.editReply({
                content: await t(interaction, 'core_tools_encrypt_invalid_key_length'),
            });
        }

        try {
            // 1. Buat IV (Initialization Vector) - Ini angka acak untuk keamanan
            const iv = crypto.randomBytes(IV_LENGTH);

            // 2. Buat "Cipher" (mesin enkripsi) dengan kunci dan IV
            const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(secretKey), iv);

            // 3. Enkripsi teksnya
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            // 4. Dapatkan "Auth Tag" - Ini semacam segel digital untuk verifikasi
            const authTag = cipher.getAuthTag();

            // 5. Gabungkan semuanya jadi satu string untuk di-copy-paste
            // Format: iv(hex):authTag(hex):encryptedText(hex)
            const encryptedData = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;

            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setTitle(await t(interaction, 'core_tools_encrypt_success'))
                .setDescription(await t(interaction, 'core_tools_encrypt_embed_desc'))
                .addFields(
                    { name: await t(interaction, 'core_tools_encrypt_secret_key_used'), value: '```' + '*'.repeat(32) + '```' },
                    { name: await t(interaction, 'core_tools_encrypt_encrypted_data'), value: '```' + encryptedData + '```' }
                )
                .setFooter(await embedFooter(interaction));

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: await t(interaction, 'core_tools_encrypt_error') });
        }
    },
};
