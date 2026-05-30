/**
 * @namespace: addons/core/commands/utils/kyth/blacklist/guild-add.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('guild-add')
			.setDescription('Add a guild to the blacklist')
			.addStringOption((option) =>
				option
					.setName('guild_id')
					.setDescription('Guild ID to blacklist')
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('reason')
					.setDescription('Reason for blacklisting')
					.setRequired(false),
			),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, logger, helpers, client } = container;
		const { KythiaBlacklist } = models;
		const { createContainer } = helpers.discord;

		await interaction.deferReply();

		const guildId = interaction.options.getString('guild_id');
		const reason = interaction.options.getString('reason') || null;

		try {
			const existing = await KythiaBlacklist.getCache({
				where: { type: 'guild', targetId: guildId },
			});
			if (existing) {
				const components = await createContainer(interaction, {
					description: await t(
						interaction,
						'core.utils.kyth.blacklist.guild.add.already',
						{ id: guildId },
					),
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}

			await KythiaBlacklist.create({
				type: 'guild',
				targetId: guildId,
				reason,
			});

			// If the bot is currently in this guild, leave it immediately
			let left = false;
			if (client.shard) {
				const results = await client.shard.broadcastEval(
					async (c, { id }) => {
						const g = c.guilds.cache.get(id);
						if (g) {
							try {
								await g.leave();
								return true;
							} catch {
								return false;
							}
						}
						return false;
					},
					{ context: { id: guildId } },
				);
				left = results.some((r) => r === true);
			} else {
				const targetGuild = client.guilds.cache.get(guildId);
				if (targetGuild) {
					try {
						await targetGuild.leave();
						left = true;
					} catch (leaveErr) {
						logger.warn(
							`Failed to leave blacklisted guild ${guildId}: ${leaveErr.message}`,
							{ label: 'core' },
						);
					}
				}
			}

			const components = await createContainer(interaction, {
				title: await t(
					interaction,
					'core.utils.kyth.blacklist.guild.add.title',
				),
				description: await t(
					interaction,
					'core.utils.kyth.blacklist.guild.add.success',
					{
						id: guildId,
						reason:
							reason ||
							(await t(interaction, 'core.utils.kyth.blacklist.no.reason')),
						left: left
							? await t(interaction, 'core.utils.kyth.blacklist.guild.add.left')
							: '',
					},
				),
				color: 'Green',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
			logger.info(
				`Guild ${guildId} blacklisted by ${interaction.user.tag} | Reason: ${reason ?? 'none'} | Left: ${left}`,
				{ label: 'core' },
			);
		} catch (error) {
			logger.error(`Failed to blacklist guild: ${error.message || error}`, {
				label: 'core',
			});
			const components = await createContainer(interaction, {
				description: await t(
					interaction,
					'core.utils.kyth.blacklist.guild.add.error',
					{ error: error.message },
				),
				color: 'Red',
			});
			await interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
	},
};
