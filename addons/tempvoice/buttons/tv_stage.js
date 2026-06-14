/**
 * @namespace: addons/tempvoice/buttons/tv_stage.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { PermissionsBitField, MessageFlags } = require('discord.js');

const { BaseButton } = require('kythia-core');

class TvStageButton extends BaseButton {
	button = {};

	async execute(interaction) {
		const container = this.container;

		const { models, client, t, helpers, logger } = container;
		const { simpleContainer } = helpers.discord;
		const { TempVoiceChannel } = models;

		const activeChannel = await TempVoiceChannel.getCache({
			ownerId: interaction.user.id,
			guildId: interaction.guild.id,
		});
		if (!activeChannel) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.stage.no_active_channel'),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		const channelId = activeChannel.channelId;
		let channel;
		try {
			channel = await client.channels.fetch(channelId, { force: true });
		} catch (error) {
			logger.error(
				`CRITICAL: Failed to fetch channel ${channelId} for rename. Error: ${error.message || error}`,
				{ label: 'tempvoice' },
			);

			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.common.channel_not_found'),
					{ color: 'Red' },
				),
				flags: MessageFlags.Ephemeral | MessageFlags.IsComponentsV2,
			});
		}

		if (!channel) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.common.channel_not_found'),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		const everyoneRole = interaction.guild.roles.everyone;
		const perms = channel.permissionsFor(everyoneRole);
		const canEveryoneSpeak = perms.has(PermissionsBitField.Flags.Speak);

		try {
			if (canEveryoneSpeak) {
				await channel.permissionOverwrites.edit(everyoneRole, {
					[PermissionsBitField.Flags.Speak]: false,
				});
				await interaction.reply({
					components: await simpleContainer(
						interaction,
						await t(interaction, 'tempvoice.stage.enabled'),
						{ color: 'Green' },
					),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			} else {
				await channel.permissionOverwrites.edit(everyoneRole, {
					[PermissionsBitField.Flags.Speak]: true,
				});
				await interaction.reply({
					components: await simpleContainer(
						interaction,
						await t(interaction, 'tempvoice.stage.disabled'),
						{ color: 'Green' },
					),
					flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
				});
			}
		} catch (_err) {
			await interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.common.fail'),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
	}
}

module.exports = TvStageButton;
