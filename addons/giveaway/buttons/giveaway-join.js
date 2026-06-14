/**
 * @namespace: addons/giveaway/buttons/giveaway-join.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseButton } = require('kythia-core');

class GiveawayJoinButton extends BaseButton {
	button = {};

	async execute(interaction) {
		const container = this.container;

		// Ambil tools yang dibutuhkan dari container
		const { models, helpers, t, giveawayManager, logger } = container;
		const { simpleContainer } = helpers.discord;
		const { Giveaway } = models;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		try {
			const messageId = interaction.message.id;
			// Cari data giveaway
			const giveaway = await Giveaway.getCache({ where: { messageId } });

			// 1. Validasi: Udah kelar / Gak ketemu
			if (!giveaway || giveaway.ended) {
				const msg = await t(
					interaction,
					'giveaway.buttons.giveawayjoin.error.ended',
				);
				const err = await simpleContainer(interaction, msg, { color: 'Red' });
				return interaction.editReply({
					components: err,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// 2. Validasi: Role Requirement
			if (
				giveaway.roleId &&
				!interaction.member.roles.cache.has(giveaway.roleId)
			) {
				const msg = await t(
					interaction,
					'giveaway.buttons.giveawayjoin.error.role.required',
					{ role: giveaway.roleId },
				);
				const err = await simpleContainer(interaction, msg, { color: 'Red' });
				return interaction.editReply({
					components: err,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			// 3. Logic Join/Unjoin
			let participants = [];
			try {
				participants =
					typeof giveaway.participants === 'string'
						? JSON.parse(giveaway.participants)
						: giveaway.participants;
			} catch (_e) {
				participants = [];
			}

			const userId = interaction.user.id;
			let message = '';
			let color = 'Green';

			if (participants.includes(userId)) {
				// LEAVE
				participants = participants.filter((id) => id !== userId);
				message = await t(
					interaction,
					'giveaway.buttons.giveawayjoin.response.unjoin',
				);
				color = 'Red'; // Merah = Leave
			} else {
				// JOIN
				participants.push(userId);
				message = await t(
					interaction,
					'giveaway.buttons.giveawayjoin.response.join',
				);
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
				const uiComponents = await giveawayManager.buildGiveawayUI(
					interaction,
					{
						prize: giveaway.prize,
						endTime: Math.floor(new Date(giveaway.endTime).getTime() / 1000),
						hostId: giveaway.hostId,
						winnersCount: giveaway.winners,
						participantsCount: participants.length,
						ended: false,
						color: giveaway.color,
						roleId: giveaway.roleId,
					},
				);

				await interaction.message.edit({ components: uiComponents });
			} catch (e) {
				logger.warn(`Failed to update UI for ${messageId}: ${e.message}`, {
					label: 'giveaway',
				});
			}

			// 6. Respon ke User (Simple Container)
			const resultContainer = await simpleContainer(interaction, message, {
				color: color,
			});
			await interaction.editReply({
				components: resultContainer,
				flags: MessageFlags.IsComponentsV2,
			});
		} catch (error) {
			logger.error(`Fatal Error: ${error.message || error}`, {
				label: 'giveawayjoin',
			});
			const msg = await t(interaction, 'giveaway.error.fatal.join');
			const err = await simpleContainer(interaction, msg, {
				color: 'Red',
				title: 'System Error',
			});
			await interaction.editReply({
				components: err,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

module.exports = GiveawayJoinButton;
