/**
 * @namespace: addons/server-stats/commands/add.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ChannelType,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
} = require('discord.js');
const { updateStats } = require('../helpers/stats');

const { BaseCommand } = require('kythia-core');

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

class AddCommand extends BaseCommand {
	slashCommand = new SlashCommandBuilder()
		.setName('add')
		.setDescription('📈 Add a new stat for a specific channel')
		.addStringOption((option) =>
			option
				.setName('format')
				.setDescription('Stat format, e.g.: {memberstotal}')
				.setRequired(true),
		)
		.addChannelOption((option) =>
			option
				.setName('channel')
				.setDescription(
					'📈 Select a channel to use as stat (if not selected, the bot will create a new channel)',
				)
				.setRequired(false),
		);

	async execute(interaction) {
		const container = this.container;
		const { t, helpers, models, logger } = container;
		const { simpleContainer } = helpers.discord;
		const { ServerSetting } = models;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;

		const [serverSetting, created] = await ServerSetting.findOrCreateCache({
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

		const format = interaction.options.getString('format');
		let channel = interaction.options.getChannel('channel');

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

		if (!channel) {
			channel = await interaction.guild.channels.create({
				name: format.replace(/{.*?}/g, '0'),
				type: ChannelType.GuildVoice,
				parent: serverSetting.serverStatsCategoryId,
				permissionOverwrites: [
					{
						id: interaction.guild.roles.everyone,
						deny: [PermissionFlagsBits.Connect],
						allow: [PermissionFlagsBits.ViewChannel],
					},
				],
			});
		}

		const already = serverSetting.serverStats?.find(
			(subcommand) => subcommand.channelId === channel.id,
		);
		if (already) {
			const components = await simpleContainer(
				interaction,
				await t(interaction, 'core.setting.setting.stats.already'),
				{ color: 'Yellow' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		serverSetting.serverStats ??= [];
		serverSetting.serverStats.push({
			channelId: channel.id,
			format,
			enabled: true,
		});

		serverSetting.changed('serverStats', true);
		await serverSetting.save();
		await updateStats(interaction.client, [serverSetting]);

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'core.setting.setting.stats.add', {
				channel: `<#${channel.id}>`,
				format,
			}),
			{ color: 'Green' },
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = AddCommand;
