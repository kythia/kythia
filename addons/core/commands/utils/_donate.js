/**
 * @namespace: addons/core/commands/utils/_donate.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { t } = require('@utils/translator');

// In-memory storage for donate info per guild (replace with DB in production)
const donateData = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('donate')
        .setDescription('💸 Show donation information or set it (admin only).')
        .addSubcommand((sub) =>
            sub
                .setName('set')
                .setDescription('Set the donation information (admin only).')
                .addStringOption((opt) =>
                    opt.setName('description').setDescription('Donation description or instructions.').setRequired(true)
                )
                .addAttachmentOption((opt) =>
                    opt.setName('image').setDescription('Donation image (QR code, banner, etc).').setRequired(true)
                )
                .addRoleOption((opt) => opt.setName('role').setDescription('Role to mention for donations (optional).').setRequired(false))
        ),
    async execute(interaction) {
        const sub = interaction.options.getSubcommand(false);

        // /donate set
        if (sub === 'set') {
            // Only allow admins to set donate info
            if (!interaction.memberPermissions?.has('Administrator')) {
                await interaction.reply({
                    content: await t(interaction, 'core_utils__donate_utils_donate_no_permission', {
                        defaultValue: 'You need Administrator permission to set donation info.',
                    }),
                    ephemeral: true,
                });
                return;
            }

            const description = interaction.options.getString('description');
            const image = interaction.options.getAttachment('image');
            const role = interaction.options.getRole('role');

            if (!image || !image.contentType?.startsWith('image/')) {
                await interaction.reply({
                    content: await t(interaction, 'core_utils__donate_utils_donate_invalid_image', {
                        defaultValue: 'Please provide a valid image attachment.',
                    }),
                    ephemeral: true,
                });
                return;
            }

            // Save to in-memory store (replace with DB in production)
            donateData.set(interaction.guildId, {
                description,
                imageURL: image.url,
                roleId: role?.id || null,
            });

            await interaction.reply({
                content: await t(interaction, 'core_utils__donate_utils_donate_set_success', { defaultValue: 'Donation info updated successfully!' }),
                ephemeral: true,
            });
            return;
        }

        // /donate (show info)
        const donate = donateData.get(interaction.guildId);
        if (!donate) {
            await interaction.reply({
                content: await t(interaction, 'core_utils__donate_utils_donate_not_set', {
                    defaultValue: 'Donation information has not been set for this server.',
                }),
                ephemeral: true,
            });
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(await t(interaction, 'core_utils__donate_utils_donate_embed_title', { defaultValue: 'Support Us with a Donation!' }))
            .setDescription(donate.description)
            .setImage(donate.imageURL)
            .setColor(kythia.bot.color);

        let content = '';
        if (donate.roleId) {
            content = `<@&${donate.roleId}>`;
        }

        await interaction.reply({
            content,
            embeds: [embed],
        });
    },
};
