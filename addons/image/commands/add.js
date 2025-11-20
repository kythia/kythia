/**
 * @namespace: addons/image/commands/add.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
// const logger = require('@coreHelpers/logger');
const { EmbedBuilder, MessageFlags } = require('discord.js');
// const { t } = require('@coreHelpers/translator');
// const { embedFooter } = require('@coreHelpers/discord');

module.exports = {
    subcommand: true,
    data: (subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Add a new image')
            .addAttachmentOption((option) => option.setName('image').setDescription('The image to add').setRequired(true)),
    async execute(interaction) {
        const { models, helpers, translator, kythiaConfig } = interaction.client.container;
        const { Image } = models;
        const { embedFooter } = helpers.discord;
        const { t } = translator;

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const attachment = interaction.options.getAttachment('image');

        if (!attachment.contentType.startsWith('image/')) {
            const embed = new EmbedBuilder().setColor(kythiaConfig.bot.color).setDescription(await t(interaction, 'image.add.invalid.type.desc'));
            return interaction.editReply({ embeds: [embed], ephemeral: true });
        }

        const storageDir = path.join(process.cwd(), 'storage', 'images');
        await fs.mkdir(storageDir, { recursive: true });

        const fileExt = path.extname(attachment.name);
        const filename = `${uuidv4()}${fileExt}`;
        const filePath = path.join(storageDir, filename);

        const response = await fetch(attachment.url);
        const buffer = await response.arrayBuffer();

        await fs.writeFile(filePath, Buffer.from(buffer));

        const savedImage = await Image.create({
            userId: interaction.user.id,
            filename: filename,
            originalUrl: attachment.url,
            storagePath: `images/${filename}`,
            mimetype: attachment.contentType,
        });

        const baseUrl = kythiaConfig.addons.dashboard.url || 'https://localhost:3000';

        const embed = new EmbedBuilder()
            .setColor(kythiaConfig.bot.color)
            .setDescription(
                await t(interaction, 'image.add.success.desc', {
                    url: `${baseUrl}/files/images/${savedImage.filename}`,
                })
            )
            .setFooter(await embedFooter(interaction));

        await interaction.editReply({ embeds: [embed] });
    },
};
