/**
 * @namespace: addons/giveaway/helpers/giveawayManager.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

// addons/giveaway/helpers/giveawayManager.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const User = require('@coreModels/User');
const { t } = require('@utils/translator');

/**
 * Update the giveaway message with translated content and embed.
 * @param {Client} client
 * @param {Giveaway} giveaway
 * @param {Interaction} [interaction] - Optional, for translation context
 */
async function updateGiveawayMessage(client, giveaway, interaction = null) {
    try {
        const channel = await client.channels.fetch(giveaway.channelId);
        const message = await channel.messages.fetch(giveaway.messageId);

        const participants = JSON.parse(giveaway.participants || '[]');
        const endTimestamp = Math.floor(new Date(giveaway.endTime).getTime() / 1000);

        // Translation context: use interaction if available, else fallback to channel
        const tCtx = interaction || channel;

        // Compose embed
        let desc = `${await t(tCtx, 'giveaway_helpers_giveawayManager_embed_title')}\n`;
        desc += await t(tCtx, 'giveaway_helpers_giveawayManager_embed_desc', {
            prize: giveaway.prize,
            endRelative: !isNaN(endTimestamp) ? `<t:${endTimestamp}:R>` : await t(tCtx, 'giveaway_helpers_giveawayManager_embed_ending_soon'),
            endFull: !isNaN(endTimestamp) ? `<t:${endTimestamp}:F>` : await t(tCtx, 'giveaway_helpers_giveawayManager_embed_ending_soon'),
            host: `<@${giveaway.hostId}>`,
        });

        const embed = new EmbedBuilder()
            .setColor(giveaway.color || kythia.bot.color)
            .setDescription(desc)
            .addFields(
                {
                    name: await t(tCtx, 'giveaway_helpers_giveawayManager_field_winners'),
                    value: `🏆 ${giveaway.winners}`,
                    inline: true,
                },
                {
                    name: await t(tCtx, 'giveaway_helpers_giveawayManager_field_participants'),
                    value: `👥 ${participants.length}`,
                    inline: true,
                }
            )
            .setFooter({
                text: await t(tCtx, 'giveaway_helpers_giveawayManager_embed_footer_id', { id: giveaway.messageId }),
            });

        if (giveaway.roleId) {
            embed.addFields({
                name: await t(tCtx, 'giveaway_helpers_giveawayManager_field_role_requirement'),
                value: `<@&${giveaway.roleId}>`,
                inline: true,
            });
        }

        const button = new ButtonBuilder()
            .setCustomId('giveawayjoin')
            .setLabel(await t(tCtx, giveaway.ended ? 'giveaway_button_cancelled' : 'giveaway_button_join'))
            .setStyle(ButtonStyle.Success)
            .setEmoji('🎉')
            .setDisabled(!!giveaway.ended);

        const row = new ActionRowBuilder().addComponents(button);

        await message.edit({ embeds: [embed], components: [row] });
    } catch (error) {
        // If interaction is available, reply with error embed
        if (interaction) {
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    `${await t(interaction, 'giveaway_helpers_giveawayManager_fatal_error_title')}\n${await t(interaction, 'giveaway_helpers_giveawayManager_fatal_error_desc')}`
                );
            try {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            } catch (e) {
                /* ignore */
            }
        }
        console.error(`[GiveawayManager] Failed to update message ${giveaway.messageId}:`, error);
    }
}

/**
 * Announce giveaway winners with translated embed.
 * @param {Client} client
 * @param {Giveaway} giveaway
 * @param {boolean} isReroll
 * @param {Interaction} [interaction] - Optional, for translation context
 */
async function announceWinners(client, giveaway, isReroll = false, interaction = null) {
    const participants = JSON.parse(giveaway.participants || '[]');
    const winners = [];

    if (participants.length > 0) {
        let availableParticipants = [...participants];
        for (let i = 0; i < giveaway.winners; i++) {
            if (availableParticipants.length === 0) break;
            const randomIndex = Math.floor(Math.random() * availableParticipants.length);
            winners.push(availableParticipants[randomIndex]);
            availableParticipants.splice(randomIndex, 1);
        }
    }

    // Translation context: use interaction if available, else fallback to channel
    let channel;
    try {
        channel = await client.channels.fetch(giveaway.channelId);
    } catch (e) {
        channel = null;
    }
    const tCtx = interaction || channel;

    const titleKey = isReroll ? 'giveaway_reroll_success_title' : 'giveaway_end_success_title';
    const descKey = isReroll ? 'giveaway_reroll_announce_desc' : 'giveaway_end_announce_desc';
    const noWinnerKey = 'giveaway_no_valid_winner';

    const winnerMentions = winners.length > 0 ? winners.map((id) => `<@${id}>`).join(', ') : await t(tCtx, noWinnerKey);

    const embed = new EmbedBuilder()
        .setColor(winners.length > 0 ? 'Gold' : 'Red')
        .setDescription(
            `${await t(tCtx, titleKey)}\n` +
                (await t(tCtx, descKey, {
                    winners: winnerMentions,
                    host: `<@${giveaway.hostId}>`,
                    prize: giveaway.prize,
                }))
        )
        .setTimestamp();

    if (channel) {
        await channel.send({
            embeds: [embed],
        });
    }

    // Otomatisasi Hadiah (jika tipe 'money')
    if (giveaway.type === 'money' && winners.length > 0) {
        const amount = parseInt(giveaway.prize);
        if (!isNaN(amount)) {
            for (const winnerId of winners) {
                const user = await User.findOne({ where: { userId: winnerId, guildId: giveaway.guildId } });
                if (user) {
                    user.cash += amount;
                    await user.saveAndUpdateCache();
                }
            }
        }
    }

    if (!giveaway.ended) {
        giveaway.ended = true;
        await giveaway.saveAndUpdateCache('messageId');
    }

    // Update pesan asli jadi disabled
    await updateGiveawayMessage(client, giveaway, interaction);
}

module.exports = { updateGiveawayMessage, announceWinners };
