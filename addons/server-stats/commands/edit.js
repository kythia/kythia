/**
 * @namespace: addons/server-stats/commands/server-stats/edit.js
 * @type: Subcommand
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { updateStats } = require('../helpers/stats');

const allowedPlaceholders = [
	'{memberstotal}',
	'{online}',
	'{idle}',
	'{dnd}',
	'{offline}',
	'{bots}',
	'{humans}',
	'{online_bots}',
	'{online_humans}',
	'{boosts}',
	'{boost_level}',
	'{channels}',
	'{text_channels}',
	'{voice_channels}',
	'{categories}',
	'{announcement_channels}',
	'{stage_channels}',
	'{roles}',
	'{emojis}',
	'{stickers}',
	'{guild}',
	'{guild_id}',
	'{owner}',
	'{owner_id}',
	'{region}',
	'{verified}',
	'{partnered}',
	'{date}',
	'{time}',
	'{datetime}',
	'{day}',
	'{month}',
	'{year}',
	'{hour}',
	'{minute}',
	'{second}',
	'{timestamp}',
	'{created_date}',
	'{created_time}',
	'{guild_age}',
	'{member_join}',
];

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('edit')
		.setDescription('📈 Edit the format of an existing stat channel')
		.addStringOption((opt) =>
			opt
				.setName('stats')
				.setDescription('Select the stat to edit')
				.setRequired(true)
				.setAutocomplete(true),
		)
		.addChannelOption((opt) =>
			opt
				.setName('channel')
				.setDescription('📈 Edit stat channel')
				.setRequired(false),
		)
		.addStringOption((opt) =>
			opt
				.setName('format')
				.setDescription('📈 Edit stat format, e.g.: {membersonline}')
				.setRequired(false),
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
		const { simpleContainer } = helpers.discord;
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
		const format = interaction.options.getString('format');
		const stat = serverSetting.serverStats?.find(
			(s) => s.channelId === statsId,
		);

		if (!stat) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.setting.setting.stats.notfound'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (format) {
			const hasAllowedPlaceholder = allowedPlaceholders.some((ph) =>
				format.includes(ph),
			);
			if (!hasAllowedPlaceholder) {
				const components = await simpleContainer(
					interaction,
					await t(interaction, 'core.setting.setting.stats.format.invalid', {
						placeholders: allowedPlaceholders.join(', '),
					}),
					{ color: 'Red' },
				);
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
			stat.format = format;
		}

		serverSetting.changed('serverStats', true);
		await serverSetting.save();
		await updateStats(interaction.client, [serverSetting]);

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'core.setting.setting.stats.edit', {
				channel: `<#${statsId}>`,
				format: format || stat.format,
			}),
			{ color: 'Green' },
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
