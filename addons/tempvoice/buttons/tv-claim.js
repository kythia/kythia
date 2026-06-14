/**
 * @namespace: addons/tempvoice/buttons/tv_claim.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */
const { PermissionsBitField, MessageFlags } = require('discord.js');

const { BaseButton } = require('kythia-core');

class TvClaimButton extends BaseButton {
	button = {};

	async execute(interaction) {
		const container = this.container;

		const { models, client, t, helpers, logger } = container;
		const { TempVoiceChannel } = models;
		const { simpleContainer } = helpers.discord;

		const userVoiceState = interaction.member.voice;
		if (!userVoiceState?.channelId) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.claim.not_in_channel'),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		const activeChannel = await TempVoiceChannel.getCache({
			channelId: userVoiceState.channelId,
			guildId: interaction.guild.id,
		});
		if (!activeChannel) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.claim.not_temp_channel'),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		if (activeChannel.ownerId === interaction.user.id) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.claim.already_owner'),
					{ color: 'Yellow' },
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		const oldOwner = await interaction.guild.members
			.fetch(activeChannel.ownerId)
			.catch(() => null);

		if (oldOwner) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.claim.owner_exists', {
						user: oldOwner.displayName,
					}),
					{ color: 'Red' },
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		try {
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

			await channel.permissionOverwrites.delete(activeChannel.ownerId);

			await channel.permissionOverwrites.edit(interaction.member, {
				[PermissionsBitField.Flags.ManageChannels]: true,
				[PermissionsBitField.Flags.MoveMembers]: true,
				[PermissionsBitField.Flags.ViewChannel]: true,
				[PermissionsBitField.Flags.Connect]: true,
			});

			activeChannel.ownerId = interaction.user.id;
			await activeChannel.save();

			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'tempvoice.claim.success'),
					{ color: 'Green' },
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		} catch (_err) {
			return interaction.reply({
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

exports.default = TvClaimButton;
