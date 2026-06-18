/**
 * @namespace: addons/server-stats/commands/enable.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, SlashCommandBuilder } = require('discord.js');
const { updateStats } = require('../helpers/stats');
const { BaseCommand } = require('kythia-core');
class EnableCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('enable')
		.setDescription('Enable stat channel')
		.addStringOption((option) =>
			option
				.setName('stats')
				.setDescription('Select the stat to enable')
				.setRequired(true)
				.setAutocomplete(true),
		);
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
	}
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, models, logger } = container;
		const { simpleContainer } = helpers.discord;
		const { ServerSetting } = models;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;
		const [serverSetting, created] = await ServerSetting.findOrCreateCache({
			where: {
				guildId: guildId,
			},
			defaults: {
				guildId: guildId,
				guildName: guildName,
			},
		});
		if (created) {
			await ServerSetting.clearNegativeCache({
				where: {
					guildId: guildId,
				},
			});
			logger.info(
				`[CACHE] Cleared negative cache for new ServerSetting: ${guildId}`,
				{
					label: 'server-stats',
				},
			);
		}
		const statsId = interaction.options.getString('stats');
		const stat = serverSetting.serverStats?.find(
			(subcommand) => subcommand.channelId === statsId,
		);
		if (!stat) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.setting.setting.stats.notfound'),
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		stat.enabled = true;
		serverSetting.changed('serverStats', true);
		await serverSetting.save();
		await updateStats(interaction.client, [serverSetting]);
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'core.setting.setting.stats.enabled.msg', {
				channel: `<#${statsId}>`,
			}),
			{
				color: 'Green',
			},
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = EnableCommand;
