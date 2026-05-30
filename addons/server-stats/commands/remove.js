/**
 * @namespace: addons/server-stats/commands/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { updateStats } = require('../helpers/stats');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('remove')
		.setDescription('📈 Delete the stat and its channel')
		.addStringOption((opt) =>
			opt
				.setName('stats')
				.setDescription('Select the stat to delete')
				.setRequired(true)
				.setAutocomplete(true),
		),

	async autocomplete(interaction) {
		const container = interaction.client.container;
		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { getChannelSafe } = helpers.discord;
		const focused = interaction.options.getFocused();
		const settings = await ServerSetting.getCache({
			guildId: interaction.guild.id,
		});
		const stats = settings?.serverStats ?? [];

		const choices = [];
		for (const stat of stats) {
			const channel = await getChannelSafe(interaction.guild, stat.channelId);
			if (!channel) continue;

			const channelName = channel.name || 'Unknown Channel';
			if (channelName.toLowerCase().includes(focused.toLowerCase())) {
				const statusText = stat.enabled
					? await t(interaction, 'core.setting.setting.stats.enabled.text')
					: await t(interaction, 'core.setting.setting.stats.disabled.text');

				const finalName = `${channelName} (${statusText})`;
				choices.push({
					name: finalName.length > 100 ? finalName.slice(0, 100) : finalName,
					value: channel.id,
				});
			}
			if (choices.length >= 25) break;
		}

		await interaction.respond(choices);
	},

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, helpers, models, logger } = container;
		const { getChannelSafe, simpleContainer } = helpers.discord;
		const { ServerSetting } = models;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;

		const [serverSetting, created] = await ServerSetting.findOrCreateWithCache({
			where: { guildId: guildId },
			defaults: { guildId: guildId, guildName: guildName },
		});

		if (created) {
			await ServerSetting.clearNegativeCache({ where: { guildId: guildId } });
			logger.info(
				`[CACHE] Cleared negative cache for new ServerSetting: ${guildId}`,
				{ label: 'server-stats' },
			);
		}

		const statsId = interaction.options.getString('stats');
		const channel = await getChannelSafe(interaction.guild, statsId);
		const before = serverSetting.serverStats?.length || 0;

		serverSetting.serverStats = serverSetting.serverStats?.filter(
			(s) => s.channelId !== statsId,
		);

		const after = serverSetting.serverStats?.length || 0;
		try {
			if (channel?.deletable) {
				await channel.delete('Stat channel removed');
			}
		} catch (_) {}

		serverSetting.changed('serverStats', true);
		await serverSetting.save();
		await updateStats(interaction.client, [serverSetting]);

		const isSuccess = before !== after;
		const components = await simpleContainer(
			interaction,
			isSuccess
				? await t(interaction, 'core.setting.setting.stats.remove.success')
				: await t(interaction, 'core.setting.setting.stats.remove.notfound'),
			{ color: isSuccess ? 'Green' : 'Yellow' },
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
