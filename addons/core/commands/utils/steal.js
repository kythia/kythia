/**
 * @namespace: addons/core/commands/utils/steal.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

const { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { t } = require('@utils/translator');

function parseCustomEmoji(str) {
    // <a:name:id> or <name:id>
    const match = str.match(/<?a?:?(\w+):(\d+)>?/);
    if (!match) return null;
    const [, name, id] = match;
    const isAnimated = str.startsWith('<a:');
    return { name, id, isAnimated };
}

module.exports = {
    // Slash command with subcommands
    slashCommand: new SlashCommandBuilder()
        .setName('steal')
        .setDescription('🛍️ Steal stickers or emojis from messages.')
        .addSubcommand((sub) =>
            sub
                .setName('sticker')
                .setDescription('Steal a sticker from a message')
                .addStringOption((opt) => opt.setName('sticker_id').setDescription('Sticker ID to steal').setRequired(true))
        )
        .addSubcommand((sub) =>
            sub
                .setName('emoji')
                .setDescription('Steal a custom emoji from a message')
                .addStringOption((opt) => opt.setName('emoji').setDescription('Emoji to steal (custom emoji format)').setRequired(true))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers),

    // Hybrid context menu for stealing sticker or emoji from a message
    contextMenuCommand: new ContextMenuCommandBuilder().setName('Steal Sticker/Emoji').setType(ApplicationCommandType.Message),

    contextMenuDescription: '🛍️ Steal sticker or emoji from this message.',
    // guildOnly: true,
    permissions: PermissionFlagsBits.ManageEmojisAndStickers,
    botPermissions: PermissionFlagsBits.ManageEmojisAndStickers,
    voteLocked: true,
    async execute(interaction) {
        // Handle slash command
        if (interaction.isChatInputCommand?.() && interaction.commandName === 'steal') {
            const sub = interaction.options.getSubcommand();
            if (sub === 'sticker') {
                await interaction.deferReply({ ephemeral: true });
                const stickerId = interaction.options.getString('sticker_id');
                try {
                    const sticker = await interaction.client.fetchSticker(stickerId);
                    if (!sticker) {
                        return interaction.editReply({ content: await t(interaction, 'core_utils_steal_sticker_not_found') });
                    }
                    // Try to add sticker to guild
                    if (!interaction.guild?.stickers?.create) {
                        return interaction.editReply({ content: await t(interaction, 'core_utils_steal_no_perm_sticker') });
                    }
                    // Discord API only allows PNG/Lottie/Apng stickers, and only for Boosted servers
                    // We'll just send the sticker file for manual upload if not possible
                    let url = sticker.url || sticker.asset;
                    if (!url) {
                        return interaction.editReply({ content: await t(interaction, 'core_utils_steal_sticker_no_url') });
                    }
                    // Try to upload (if possible)
                    try {
                        const created = await interaction.guild.stickers.create({
                            file: url,
                            name: sticker.name || `stolen_sticker_${sticker.id}`,
                            tags: sticker.tags || 'stolen',
                        });
                        return interaction.editReply({
                            content: await t(interaction, 'core_utils_steal_sticker_success', { name: created.name }),
                        });
                    } catch (e) {
                        // Fallback: send sticker file for manual upload
                        return interaction.editReply({
                            content: await t(interaction, 'core_utils_steal_sticker_manual'),
                            files: [url],
                        });
                    }
                } catch (err) {
                    return interaction.editReply({ content: await t(interaction, 'core_utils_steal_sticker_error') });
                }
            } else if (sub === 'emoji') {
                await interaction.deferReply({ ephemeral: true });
                const emojiInput = interaction.options.getString('emoji');
                // Parse custom emoji: <a:name:id> or <name:id>
                const match = emojiInput.match(/<?a?:?(\w+):(\d+)>?/);
                if (!match) {
                    return interaction.editReply({ content: await t(interaction, 'core_utils_steal_emoji_invalid') });
                }
                const [, name, id] = match;
                const isAnimated = emojiInput.startsWith('<a:');
                const url = `https://cdn.discordapp.com/emojis/${id}.${isAnimated ? 'gif' : 'png'}?v=1`;
                try {
                    // Try to add emoji to guild
                    if (!interaction.guild?.emojis?.create) {
                        return interaction.editReply({ content: await t(interaction, 'core_utils_steal_no_perm_emoji') });
                    }
                    const created = await interaction.guild.emojis.create({ attachment: url, name });
                    return interaction.editReply({
                        content: await t(interaction, 'core_utils_steal_emoji_success', { name: created.name }),
                    });
                } catch (e) {
                    // Fallback: send emoji file for manual upload
                    return interaction.editReply({
                        content: await t(interaction, 'core_utils_steal_emoji_manual'),
                        files: [url],
                    });
                }
            }
        }

        // Hybrid context menu: detect sticker or emoji automatically
        if (interaction.isMessageContextMenuCommand?.() && interaction.commandName === 'Steal Sticker/Emoji') {
            await interaction.deferReply({ ephemeral: true });
            const message = interaction.targetMessage;
            // 1. Try sticker first
            if (message && message.stickers && message.stickers.size > 0) {
                const sticker = message.stickers.first();
                if (!sticker) {
                    return interaction.editReply({ content: await t(interaction, 'core_utils_steal_sticker_not_found') });
                }
                let url = sticker.url || sticker.asset;
                if (!url) {
                    return interaction.editReply({ content: await t(interaction, 'core_utils_steal_sticker_no_url') });
                }
                // Try to upload (if possible)
                try {
                    if (!interaction.guild?.stickers?.create) throw new Error('No permission');
                    const created = await interaction.guild.stickers.create({
                        file: url,
                        name: sticker.name || `stolen_sticker_${sticker.id}`,
                        tags: sticker.tags || 'stolen',
                    });
                    return interaction.editReply({ content: await t(interaction, 'core_utils_steal_sticker_success', { name: created.name }) });
                } catch (e) {
                    // Fallback: send sticker file for manual upload
                    return interaction.editReply({
                        content: await t(interaction, 'core_utils_steal_sticker_manual'),
                        files: [url],
                    });
                }
            }

            // 2. Try to find a custom emoji in the message content
            const emojiRegex = /<a?:\w+:\d+>/g;
            const found = message?.content?.match?.(emojiRegex);
            if (found && found.length > 0) {
                // Use the first found emoji
                const emojiData = parseCustomEmoji(found[0]);
                if (!emojiData) {
                    return interaction.editReply({ content: await t(interaction, 'core_utils_steal_emoji_invalid') });
                }
                const { name, id, isAnimated } = emojiData;
                const url = `https://cdn.discordapp.com/emojis/${id}.${isAnimated ? 'gif' : 'png'}?v=1`;
                try {
                    if (!interaction.guild?.emojis?.create) {
                        return interaction.editReply({ content: await t(interaction, 'core_utils_steal_no_perm_emoji') });
                    }
                    const created = await interaction.guild.emojis.create({ attachment: url, name });
                    return interaction.editReply({
                        content: await t(interaction, 'core_utils_steal_emoji_success', { name: created.name }),
                    });
                } catch (e) {
                    // Fallback: send emoji file for manual upload
                    return interaction.editReply({
                        content: await t(interaction, 'core_utils_steal_emoji_manual'),
                        files: [url],
                    });
                }
            }

            // 3. If neither, reply not found
            return interaction.editReply({ content: await t(interaction, 'core_utils_steal_sticker_or_emoji_not_found') });
        }
    },
};
