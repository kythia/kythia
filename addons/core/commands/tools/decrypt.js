/**
 * @namespace: addons/core/commands/tools/decrypt.js
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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('decrypt')
        .setDescription('🔓 Decrypt data using the correct secret key.')
        .addStringOption((option) =>
            option.setName('encrypted-data').setDescription('The full encrypted string from the /encrypt command').setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('secret-key').setDescription('The 32-character secret key used for encryption').setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const encryptedData = interaction.options.getString('encrypted-data');
        const secretKey = interaction.options.getString('secret-key');

        if (secretKey.length !== 32) {
            return interaction.editReply({
                content: await t(interaction, 'core_tools_decrypt_invalid_key_length'),
            });
        }

        try {
            // 1. Pisahkan kembali data terenkripsi menjadi 3 bagian
            const parts = encryptedData.split(':');
            if (parts.length !== 3) {
                return interaction.editReply({ content: await t(interaction, 'core_tools_decrypt_invalid_data_format') });
            }

            const iv = Buffer.from(parts[0], 'hex');
            const authTag = Buffer.from(parts[1], 'hex');
            const encryptedText = parts[2];

            // 2. Buat "Decipher" (mesin dekripsi)
            const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(secretKey), iv);

            // 3. Set Auth Tag untuk verifikasi (kalau data diubah, di sini akan error)
            decipher.setAuthTag(authTag);

            // 4. Dekripsi teksnya
            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            const embed = new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setTitle(await t(interaction, 'core_tools_decrypt_success'))
                .addFields({ name: await t(interaction, 'core_tools_decrypt_decrypted_plaintext'), value: '```' + decrypted + '```' })
                .setFooter(await embedFooter(interaction));

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            // Error ini paling sering terjadi jika KUNCI SALAH atau DATA RUSAK
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(await t(interaction, 'core_tools_decrypt_failed'))
                        .setDescription(await t(interaction, 'core_tools_decrypt_failed_desc')),
                ],
            });
        }
    },
};
