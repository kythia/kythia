/**
 * @namespace: addons/giveaway/buttons/giveawayjoin.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @version 0.9.17-beta (RESTORED & POLISHED)
 */

const { MessageFlags } = require('discord.js');

module.exports = {
    execute: async (interaction, container) => {
        // Ambil tools yang dibutuhkan dari container
        const { models, helpers, t, giveawayManager, logger } = container;
        const { simpleContainer } = helpers.discord;
        const { Giveaway } = models;

        await interaction.deferReply({ ephemeral: true });

        try {
            const messageId = interaction.message.id;
            // Cari data giveaway
            const giveaway = await Giveaway.findOne({ where: { messageId } });

            // 1. Validasi: Udah kelar / Gak ketemu
            if (!giveaway || giveaway.ended) {
                const msg = await t(interaction, 'giveaway.buttons.giveawayjoin.error.ended');
                const err = await simpleContainer(interaction, msg, { color: 'Red' });
                return interaction.editReply({ components: err, flags: MessageFlags.IsComponentsV2 });
            }

            // 2. Validasi: Role Requirement
            if (giveaway.roleId && !interaction.member.roles.cache.has(giveaway.roleId)) {
                const msg = await t(interaction, 'giveaway.buttons.giveawayjoin.error.role.required', { role: giveaway.roleId });
                const err = await simpleContainer(interaction, msg, { color: 'Red' });
                return interaction.editReply({ components: err, flags: MessageFlags.IsComponentsV2 });
            }

            // 3. Logic Join/Unjoin
            let participants = [];
            try {
                participants = typeof giveaway.participants === 'string' ? JSON.parse(giveaway.participants) : giveaway.participants;
            } catch (e) {
                participants = [];
            }

            const userId = interaction.user.id;
            let message = '';
            let color = 'Green';

            if (participants.includes(userId)) {
                // LEAVE
                participants = participants.filter((id) => id !== userId);
                message = await t(interaction, 'giveaway.buttons.giveawayjoin.response.unjoin');
                color = 'Red'; // Merah = Leave
            } else {
                // JOIN
                participants.push(userId);
                message = await t(interaction, 'giveaway.buttons.giveawayjoin.response.join');
                color = 'Green'; // Hijau = Join
            }

            // 4. Save ke Database
            giveaway.participants = participants;
            giveaway.changed('participants', true);
            await giveaway.save();

            // 5. Update Tampilan Embed (Panggil method Manager)
            // Kita update embed biar angka participants berubah realtime
            try {
                // Kita pinjam logic build UI dari Manager biar konsisten
                const uiComponents = await giveawayManager.buildGiveawayUI(interaction, {
                    prize: giveaway.prize,
                    endTime: Math.floor(new Date(giveaway.endTime).getTime() / 1000),
                    hostId: giveaway.hostId,
                    winnersCount: giveaway.winners,
                    participantsCount: participants.length,
                    ended: false,
                    color: giveaway.color,
                    roleId: giveaway.roleId,
                });

                await interaction.message.edit({ components: uiComponents });
            } catch (e) {
                logger.warn(`Failed to update UI for ${messageId}: ${e.message}`);
            }

            // 6. Respon ke User (Simple Container)
            const resultContainer = await simpleContainer(interaction, message, { color: color });
            await interaction.editReply({ components: resultContainer, flags: MessageFlags.IsComponentsV2 });
        } catch (error) {
            logger.error('[GiveawayJoin] Fatal Error:', error);
            const msg = await t(interaction, 'giveaway.error.fatal.join');
            const err = await simpleContainer(interaction, msg, { color: 'Red', title: 'System Error' });
            await interaction.editReply({ components: err, flags: MessageFlags.IsComponentsV2 });
        }
    },
};
