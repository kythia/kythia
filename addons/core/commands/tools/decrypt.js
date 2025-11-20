/**
 * @namespace: addons/core/commands/tools/decrypt.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
    async execute(interaction, container) {
        const { t, kythiaConfig, helpers } = container;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply({ ephemeral: true });

        const encryptedData = interaction.options.getString('encrypted-data');
        const secretKey = interaction.options.getString('secret-key');

        if (secretKey.length !== 32) {
            return interaction.editReply({
                content: await t(interaction, 'core.tools.decrypt.invalid.key.length'),
            });
        }

        try {
            const parts = encryptedData.split(':');
            if (parts.length !== 3) {
                return interaction.editReply({ content: await t(interaction, 'core.tools.decrypt.invalid.data.format') });
            }

            const iv = Buffer.from(parts[0], 'hex');
            const authTag = Buffer.from(parts[1], 'hex');
            const encryptedText = parts[2];

            const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(secretKey), iv);

            decipher.setAuthTag(authTag);

            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setTitle(await t(interaction, 'core.tools.decrypt.success'))
                .addFields({ name: await t(interaction, 'core.tools.decrypt.decrypted.plaintext'), value: '```' + decrypted + '```' })
                .setFooter(await embedFooter(interaction));

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            await interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(await t(interaction, 'core.tools.decrypt.failed.title'))
                        .setDescription(await t(interaction, 'core.tools.decrypt.failed.desc')),
                ],
            });
        }
    },
};
