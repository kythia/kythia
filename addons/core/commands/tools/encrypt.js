/**
 * @namespace: addons/core/commands/tools/encrypt.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('encrypt')
        .setDescription('🔒 Encrypt a text with a secret key (two-way encryption).')
        .addStringOption((option) => option.setName('text').setDescription('The text you want to encrypt').setRequired(true))
        .addStringOption((option) =>
            option.setName('secret-key').setDescription('A 32-character secret key for encryption').setRequired(true)
        ),
    async execute(interaction, container) {
        const { t, kythiaConfig, helpers } = container;
        const { embedFooter } = helpers.discord;

        await interaction.deferReply({ ephemeral: true });

        const text = interaction.options.getString('text');
        const secretKey = interaction.options.getString('secret-key');

        if (secretKey.length !== 32) {
            return interaction.editReply({
                content: await t(interaction, 'core.tools.encrypt.invalid.key.length'),
            });
        }

        try {
            const iv = crypto.randomBytes(IV_LENGTH);

            const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(secretKey), iv);

            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            const authTag = cipher.getAuthTag();

            const encryptedData = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;

            const embed = new EmbedBuilder()
                .setColor(kythiaConfig.bot.color)
                .setTitle(await t(interaction, 'core.tools.encrypt.success'))
                .setDescription(await t(interaction, 'core.tools.encrypt.embed.desc'))
                .addFields(
                    { name: await t(interaction, 'core.tools.encrypt.secret.key.used'), value: '```' + '*'.repeat(32) + '```' },
                    { name: await t(interaction, 'core.tools.encrypt.encrypted.data'), value: '```' + encryptedData + '```' }
                )
                .setFooter(await embedFooter(interaction));

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error(error);
            await interaction.editReply({ content: await t(interaction, 'core.tools.encrypt.error') });
        }
    },
};
