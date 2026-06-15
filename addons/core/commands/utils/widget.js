/**
 * @namespace: addons/core/commands/utils/widget.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
	SlashCommandBuilder,
} = require('discord.js');
const { BaseCommand } = require('kythia-core');

class WidgetCommand extends BaseCommand {
	aliases = ['wdg'];
	slashCommand = new SlashCommandBuilder()
		.setName('widget')
		.setDescription('🛠️ Manage your Kythia Profile Widget on Discord.');

	async execute(interaction) {
		const container = this.container;
		const { kythiaConfig, models, helpers, logger } = container;
		const { KythiaUser } = models;
		const { simpleContainer, createContainer } = helpers.discord;

		await interaction.deferReply();

		const authorizeButton = new ButtonBuilder()
			.setStyle(ButtonStyle.Link)
			.setLabel('Authorize Kythia Widget')
			.setURL(
				`https://discord.com/oauth2/authorize?client_id=${kythiaConfig.bot.clientId}&response_type=token&scope=openid+sdk.social_layer`,
			);
		const row = new ActionRowBuilder().addComponents(authorizeButton);

		const user = await KythiaUser.getCache({
			userId: interaction.user.id,
		});
		const kythiaCoin = user ? user.kythiaCoin || 0 : 0;
		const kythiaRuby = user ? user.kythiaRuby || 0 : 0;
		const votePoints = user ? user.votePoints || 0 : 0;

		// Check if user is in support server, properly handling sharded environments
		const supportServerId = kythiaConfig.bot.mainGuildId;
		let isJoined = false;
		if (supportServerId) {
			try {
				if (interaction.client.shard) {
					// Sharded environment: broadcast check across all shards
					const results = await interaction.client.shard.broadcastEval(
						async (client, { guildId, userId }) => {
							const guild = await client.container.helpers.discord.getGuildSafe(
								client,
								guildId,
							);
							if (!guild) return false;
							const member = await helpers.discord.getMemberSafe(guild, userId);
							return !!member;
						},
						{
							context: {
								guildId: supportServerId,
								userId: interaction.user.id,
							},
						},
					);

					// If any shard returns true, they are in the guild
					isJoined = results.some((result) => result === true);
				} else {
					// Non-sharded environment
					const guild = await helpers.discord.getGuildSafe(
						interaction.client,
						supportServerId,
					);
					if (guild) {
						const member = await helpers.discord.getMemberSafe(
							guild,
							interaction.user.id,
						);
						if (member) isJoined = true;
					}
				}
			} catch (err) {
				logger.warn(
					'[WIDGET] Failed to check cross-shard guild membership:',
					err,
				);
			}
		}

		// Data yang mau ditampilin di widget
		const payload = {
			username: interaction.user.username,
			data: {
				dynamic: [
					{
						type: 1,
						name: 'kythia_coin',
						value: String(Number(kythiaCoin)),
					},
					{
						type: 1,
						name: 'kythia_ruby',
						value: String(Number(kythiaRuby)),
					},
					{
						type: 1,
						name: 'vote_points',
						value: String(Number(votePoints)),
					},
					{
						type: 1,
						name: 'is_joined_server',
						value: isJoined ? 'Joined Kythia' : 'Not Joined',
					},
				],
			},
		};
		const clientId = kythiaConfig.bot.clientId;
		const discordId = interaction.user.id;
		const url = `https://discord.com/api/v9/applications/${clientId}/users/${discordId}/identities/0/profile`;
		try {
			// Kirim request PATCH ke Discord
			const response = await fetch(url, {
				method: 'PATCH',
				headers: {
					Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});
			if (response.ok) {
				const components = await createContainer(interaction, {
					description: `## ✅ Widget Updated!\nYour widget has been successfully refreshed! Check your Discord profile! 😉\n\n*-# Belum pernah setup? Klik tombol di bawah buat authorize Kythia Widget ya!*`,
					color: kythiaConfig.bot.color,
					components: [row],
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			} else {
				const errText = await response.text();
				logger.error('[WIDGET ERROR]', errText);
				const components = await createContainer(interaction, {
					description: `## ❌ Update Failed\nOh no, failed to update your widget right now 😭\n\n*-# Kalau kamu belum pernah setup widget, wajib authorize dulu lewat tombol di bawah ya!*`,
					color: 'Red',
					components: [row],
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		} catch (error) {
			logger.error('[WIDGET FETCH ERROR]', error);
			const components = await simpleContainer(
				interaction,
				`## ❌ Error\nAn error occurred while contacting Discord.`,
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	}
}

exports.default = WidgetCommand;
