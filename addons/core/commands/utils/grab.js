/**
 * @namespace: addons/core/commands/utils/grab.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType, PermissionFlagsBits } = require('discord.js');

function parseCustomEmoji(str) {
    const match = str.match(/<?a?:?(\w+):(\d+)>?/);
    if (!match) return null;
    const [, name, id] = match;
    const isAnimated = str.startsWith('<a:');
    return { name, id, isAnimated };
}

module.exports = {
    slashCommand: new SlashCommandBuilder()
        .setName('grab')
        .setDescription('🛍️ grab stickers or emojis from messages.')
        .addSubcommand((sub) =>
            sub
                .setName('sticker')
                .setDescription('grab a sticker from a message')
                .addStringOption((opt) => opt.setName('sticker_id').setDescription('Sticker ID to grab').setRequired(true))
        )
        .addSubcommand((sub) =>
            sub
                .setName('emoji')
                .setDescription('grab a custom emoji from a message')
                .addStringOption((opt) => opt.setName('emoji').setDescription('Emoji to grab (custom emoji format)').setRequired(true))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageEmojisAndStickers),

    contextMenuCommand: new ContextMenuCommandBuilder().setName('Grab Sticker/Emoji').setType(ApplicationCommandType.Message),

    contextMenuDescription: '🛍️ Grab sticker or emoji from this message.',

    permissions: PermissionFlagsBits.ManageEmojisAndStickers,
    botPermissions: PermissionFlagsBits.ManageEmojisAndStickers,
    voteLocked: true,
    async execute(interaction, container) {
        const { t } = container;

        if (interaction.isChatInputCommand?.() && interaction.commandName === 'grab') {
            const sub = interaction.options.getSubcommand();
            if (sub === 'sticker') {
                await interaction.deferReply({ ephemeral: true });
                const stickerId = interaction.options.getString('sticker_id');
                try {
                    const sticker = await interaction.client.fetchSticker(stickerId);
                    if (!sticker) {
                        return interaction.editReply({ content: await t(interaction, 'core.utils.grab.sticker.not.found') });
                    }

                    if (!interaction.guild?.stickers?.create) {
                        return interaction.editReply({ content: await t(interaction, 'core.utils.grab.no.perm.sticker') });
                    }

                    let url = sticker.url || sticker.asset;
                    if (!url) {
                        return interaction.editReply({ content: await t(interaction, 'core.utils.grab.sticker.no.url') });
                    }

                    try {
                        const created = await interaction.guild.stickers.create({
                            file: url,
                            name: sticker.name || `stolen_sticker_${sticker.id}`,
                            tags: sticker.tags || 'stolen',
                        });
                        return interaction.editReply({
                            content: await t(interaction, 'core.utils.grab.sticker.success', { name: created.name }),
                        });
                    } catch (e) {
                        return interaction.editReply({
                            content: await t(interaction, 'core.utils.grab.sticker.manual'),
                            files: [url],
                        });
                    }
                } catch (err) {
                    return interaction.editReply({ content: await t(interaction, 'core.utils.grab.sticker.error') });
                }
            } else if (sub === 'emoji') {
                await interaction.deferReply({ ephemeral: true });
                const emojiInput = interaction.options.getString('emoji');

                const match = emojiInput.match(/<?a?:?(\w+):(\d+)>?/);
                if (!match) {
                    return interaction.editReply({ content: await t(interaction, 'core.utils.grab.emoji.invalid') });
                }
                const [, name, id] = match;
                const isAnimated = emojiInput.startsWith('<a:');
                const url = `https://cdn.discordapp.com/emojis/${id}.${isAnimated ? 'gif' : 'png'}?v=1`;
                try {
                    if (!interaction.guild?.emojis?.create) {
                        return interaction.editReply({ content: await t(interaction, 'core.utils.grab.no.perm.emoji') });
                    }
                    const created = await interaction.guild.emojis.create({ attachment: url, name });
                    return interaction.editReply({
                        content: await t(interaction, 'core.utils.grab.emoji.success', { name: created.name }),
                    });
                } catch (e) {
                    return interaction.editReply({
                        content: await t(interaction, 'core.utils.grab.emoji.manual'),
                        files: [url],
                    });
                }
            }
        }

        if (interaction.isMessageContextMenuCommand?.() && interaction.commandName === 'grab Sticker/Emoji') {
            await interaction.deferReply({ ephemeral: true });
            const message = interaction.targetMessage;

            if (message && message.stickers && message.stickers.size > 0) {
                const sticker = message.stickers.first();
                if (!sticker) {
                    return interaction.editReply({ content: await t(interaction, 'core.utils.grab.sticker.not.found') });
                }
                let url = sticker.url || sticker.asset;
                if (!url) {
                    return interaction.editReply({ content: await t(interaction, 'core.utils.grab.sticker.no.url') });
                }

                try {
                    if (!interaction.guild?.stickers?.create) throw new Error('No permission');
                    const created = await interaction.guild.stickers.create({
                        file: url,
                        name: sticker.name || `stolen_sticker_${sticker.id}`,
                        tags: sticker.tags || 'stolen',
                    });
                    return interaction.editReply({
                        content: await t(interaction, 'core.utils.grab.sticker.success', { name: created.name }),
                    });
                } catch (e) {
                    return interaction.editReply({
                        content: await t(interaction, 'core.utils.grab.sticker.manual'),
                        files: [url],
                    });
                }
            }

            const emojiRegex = /<a?:\w+:\d+>/g;
            const found = message?.content?.match?.(emojiRegex);
            if (found && found.length > 0) {
                const emojiData = parseCustomEmoji(found[0]);
                if (!emojiData) {
                    return interaction.editReply({ content: await t(interaction, 'core.utils.grab.emoji.invalid') });
                }
                const { name, id, isAnimated } = emojiData;
                const url = `https://cdn.discordapp.com/emojis/${id}.${isAnimated ? 'gif' : 'png'}?v=1`;
                try {
                    if (!interaction.guild?.emojis?.create) {
                        return interaction.editReply({ content: await t(interaction, 'core.utils.grab.no.perm.emoji') });
                    }
                    const created = await interaction.guild.emojis.create({ attachment: url, name });
                    return interaction.editReply({
                        content: await t(interaction, 'core.utils.grab.emoji.success', { name: created.name }),
                    });
                } catch (e) {
                    return interaction.editReply({
                        content: await t(interaction, 'core.utils.grab.emoji.manual'),
                        files: [url],
                    });
                }
            }

            return interaction.editReply({ content: await t(interaction, 'core.utils.grab.sticker.or.emoji.not.found') });
        }
    },
};
