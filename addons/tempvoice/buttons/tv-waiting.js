/**
 * @namespace: addons/tempvoice/buttons/tv-waiting.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const {
	ChannelType,
	MessageFlags,
	PermissionsBitField,
} = require('discord.js');
const { BaseButton } = require('kythia-core');
class TvWaitingButton extends BaseButton {
	button = {
		customId: 'tv_waiting',
	};
	async execute(interaction) {
		const container = this.container;
		const { models, client, t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		const { TempVoiceChannel } = models;

		// 1. Cek kepemilikan
		const activeChannel = await TempVoiceChannel.getCache({
			ownerId: interaction.user.id,
			guildId: interaction.guild.id,
		});
		if (!activeChannel) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(
						interaction,
						'tempvoice.buttons.tv-waiting.waiting.no_active_channel',
					),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const channelId = activeChannel.channelId;
		let mainChannel;
		try {
			mainChannel = await client.container.helpers.discord.getChannelGlobalSafe(
				client,
				channelId,
			);
		} catch (error) {
			logger.error(
				`CRITICAL: Failed to fetch channel ${channelId} for rename. Error: ${error.message || error}`,
				{
					label: 'tempvoice',
				},
			);
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.shared.common.channel_not_found'),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}
		if (!mainChannel)
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.shared.common.channel_not_found'),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		try {
			if (activeChannel.waitingRoomChannelId) {
				// --- LOGIKA DISABLE WAITING ROOM ---
				const waitingRoom =
					await client.container.helpers.discord.getChannelGlobalSafe(
						client,
						activeChannel.waitingRoomChannelId,
					);
				if (waitingRoom) {
					// Kick semua user di waiting room
					for (const [_, member] of waitingRoom.members) {
						await member.voice.disconnect(
							await t(
								interaction,
								'tempvoice.buttons.tv-waiting.waiting.wr_closed_reason',
							),
						);
					}
					await waitingRoom.delete('Waiting room disabled by owner.');
				}

				// Buka lagi channel utamanya
				await mainChannel.permissionOverwrites.edit(
					interaction.guild.roles.everyone,
					{
						Connect: true, // Balikin ke default
					},
				);
				activeChannel.waitingRoomChannelId = null;
				await activeChannel.save();
				await interaction.reply({
					components: await simpleContainer(
						interaction,
						await t(
							interaction,
							'tempvoice.buttons.tv-waiting.waiting.disabled',
						),
						{
							color: 'Green',
						},
					),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			} else {
				// --- LOGIKA ENABLE WAITING ROOM ---
				const wrName = await t(
					interaction,
					'tempvoice.buttons.tv-waiting.waiting.wr_channel_name',
					{
						name: mainChannel.name,
					},
				);
				const waitingRoom = await interaction.guild.channels.create({
					name: wrName,
					type: ChannelType.GuildVoice,
					parent: mainChannel.parentId,
					// Taruh di kategori yang sama
					permissionOverwrites: [
						{
							// @everyone: Boleh liat, boleh join
							id: interaction.guild.roles.everyone,
							allow: [
								PermissionsBitField.Flags.ViewChannel,
								PermissionsBitField.Flags.Connect,
							],
						},
						{
							// Owner: Boleh manage
							id: interaction.user.id,
							allow: [
								PermissionsBitField.Flags.ManageChannels,
								PermissionsBitField.Flags.MoveMembers,
							],
						},
					],
				});

				// Kunci channel utamanya
				await mainChannel.permissionOverwrites.edit(
					interaction.guild.roles.everyone,
					{
						Connect: false,
					},
				);
				activeChannel.waitingRoomChannelId = waitingRoom.id;
				await activeChannel.save();
				await interaction.reply({
					components: await simpleContainer(
						interaction,
						await t(
							interaction,
							'tempvoice.buttons.tv-waiting.waiting.enabled',
							{
								channel: waitingRoom.id,
							},
						),
						{
							color: 'Green',
						},
					),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
		} catch (err) {
			logger.error(`Gagal toggle waiting room: ${err.message || err}`, {
				label: 'tempvoice',
			});
			await interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.shared.common.fail'),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	}
}
exports.default = TvWaitingButton;
