/**
 * @namespace: addons/core/commands/utils/kyth/guildinvite.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ChannelType,
	PermissionFlagsBits,
} = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('guildinvite')
			.setDescription('Generate an invite link for a specific guild.')
			.addStringOption((option) =>
				option
					.setName('guild_id')
					.setDescription('The ID of the guild to invite from')
					.setRequired(true)
					.setAutocomplete(true),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { helpers, logger, kythiaConfig } = container;
		const { simpleContainer } = helpers.discord;
		const guildId = interaction.options.getString('guild_id', true);

		// Ephemeral defer
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		let inviteUrl = null;
		let guildName = 'Unknown';
		const client = interaction.client;

		try {
			// Helper to find a channel we can invite from
			const getInviteLink = async (g) => {
				const channels = g.channels.cache.filter(
					(c) =>
						[
							ChannelType.GuildText,
							ChannelType.GuildAnnouncement,
							ChannelType.GuildForum,
							ChannelType.GuildMedia,
						].includes(c.type) &&
						g.members.me
							.permissionsIn(c)
							.has(PermissionFlagsBits.CreateInstantInvite),
				);

				const targetChannel = channels.first();
				if (!targetChannel) return null;

				const invite = await targetChannel.createInvite({
					maxAge: 86400, // 24 hours
					maxUses: 1,
					unique: true,
					reason: `Owner requested invite (${interaction.user.tag})`,
				});
				return invite.url;
			};

			if (client.shard) {
				const results = await client.shard.broadcastEval(
					async (c, context) => {
						const g = c.guilds.cache.get(context.guildId);
						if (!g) return { found: false };

						// find channel & create invite
						const channels = g.channels.cache.filter(
							(ch) =>
								[0, 5, 15, 16].includes(ch.type) &&
								g.members.me.permissionsIn(ch).has(1n << 0n), // CreateInstantInvite flag is 1n << 0n (1)
						);
						const target = channels.first();
						if (!target) return { found: true, name: g.name, url: null };

						const inv = await target
							.createInvite({
								maxAge: 86400,
								maxUses: 1,
								unique: true,
								reason: `Owner requested invite`,
							})
							.catch(() => null);

						return { found: true, name: g.name, url: inv ? inv.url : null };
					},
					{ context: { guildId } },
				);

				const hit = results.find((r) => r.found);
				if (hit) {
					guildName = hit.name;
					inviteUrl = hit.url;
				} else {
					const comps = await simpleContainer(
						interaction,
						`❌ Could not find a guild with ID \`${guildId}\` across any shards.`,
						{ color: 'Red' },
					);
					return interaction.editReply({ components: comps });
				}
			} else {
				const guild = client.guilds.cache.get(guildId);
				if (!guild) {
					const comps = await simpleContainer(
						interaction,
						`❌ Could not find a guild with ID \`${guildId}\` in cache.`,
						{ color: 'Red' },
					);
					return interaction.editReply({ components: comps });
				}

				guildName = guild.name;
				inviteUrl = await getInviteLink(guild).catch(() => null);
			}

			if (!inviteUrl) {
				const comps = await simpleContainer(
					interaction,
					`❌ Found guild **${guildName}**, but I don't have permission to create an invite in any text channel.`,
					{ color: 'Red' },
				);
				return interaction.editReply({ components: comps });
			}

			logger.info(
				`Generated invite for guild ${guildName} (${guildId}) by owner ${interaction.user.tag}`,
				{ label: 'commands:owner' },
			);

			const comps = await simpleContainer(
				interaction,
				`✅ **Successfully generated invite**\n**Guild:** ${guildName} (${guildId})\n\n[Click here to join](${inviteUrl})\n\n*Note: This link expires in 24 hours and is single-use.*`,
				{ color: kythiaConfig.bot.color },
			);

			await interaction.editReply({
				components: comps,
			});
		} catch (error) {
			logger.error(`Error in guildinvite: ${error.message || error}`, {
				label: 'commands:owner',
			});
			const errComps = await simpleContainer(
				interaction,
				`❌ An error occurred: ${error.message || 'Unknown error'}`,
				{ color: 'Red' },
			);
			await interaction.editReply({ components: errComps });
		}
	},
};
