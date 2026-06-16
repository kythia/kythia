/**
 * @namespace: addons/minecraft/commands/set/autosetup.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ChannelType,
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	PermissionFlagsBits,
	SeparatorSpacingSize,
} = require('discord.js');
const { fetchMcStatus } = require('../../helpers/mcstats');

const { BaseCommand } = require('kythia-core');

const { HOST_REGEX } = require('../../helpers/constants');

class AutosetupCommand extends BaseCommand {
	guildOnly = true;

	subcommand = true;
	permissions = [
		PermissionFlagsBits.ManageGuild,
		PermissionFlagsBits.ManageChannels,
	];
	botPermissions = [PermissionFlagsBits.ManageChannels];

	slashCommand = (subcommand) =>
		subcommand
			.setName('autosetup')
			.setDescription('⚙️ Auto-create all Minecraft stat channels in one go')
			.addStringOption((option) =>
				option
					.setName('host')
					.setDescription(
						'Minecraft server IP or hostname (e.g. mc.hypixel.net)',
					)
					.setRequired(true),
			)
			.addIntegerOption((option) =>
				option
					.setName('port')
					.setDescription('Server port (default: 25565)')
					.setRequired(false)
					.setMinValue(1)
					.setMaxValue(65535),
			)
			.addStringOption((option) =>
				option
					.setName('category_name')
					.setDescription(
						'Name for the new category (default: ⛏️ Minecraft Server)',
					)
					.setRequired(false),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, helpers, models, kythiaConfig } = container;
		const { ServerSetting } = models;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const rawHost = interaction.options.getString('host').trim();
		const port = interaction.options.getInteger('port') ?? 25565;
		const categoryName =
			interaction.options.getString('category_name')?.trim() ||
			'⛏️ Minecraft Server';

		// Validate host
		if (!HOST_REGEX.test(rawHost)) {
			return interaction.editReply({
				content: await t(interaction, 'minecraft.server.errors.invalid_host'),
			});
		}

		const guild = interaction.guild;

		// ── 1. Fetch initial status (best-effort) ────────────────────────
		let initialData = null;
		try {
			initialData = await fetchMcStatus(rawHost, port);
		} catch {
			// Non-fatal — channels will just show offline state initially
		}
		const isOnline = initialData?.online ?? false;
		const onlinePlayers = isOnline ? (initialData?.players?.online ?? 0) : 0;
		const maxPlayers = isOnline ? (initialData?.players?.max ?? 0) : 0;

		// ── 2. Create category ──────────────────────────────────────────
		let category;
		try {
			category = await guild.channels.create({
				name: categoryName,
				type: ChannelType.GuildCategory,
				reason: 'Minecraft Stats Auto-Setup',
			});
		} catch (err) {
			return interaction.editReply({
				content: await t(
					interaction,
					'minecraft.set.autosetup.error.category',
					{
						error: err.message,
					},
				),
			});
		}

		// ── 3. Create the 4 stat voice channels ─────────────────────────
		const channelDefs = [
			{ key: 'ip', name: `🖥️ IP: ${rawHost}`, field: 'minecraftIpChannelId' },
			{
				key: 'port',
				name: `🔌 Port: ${port}`,
				field: 'minecraftPortChannelId',
			},
			{
				key: 'status',
				name: isOnline ? `🟢 Online` : '🔴 Offline',
				field: 'minecraftStatusChannelId',
			},
			{
				key: 'players',
				name: isOnline ? `👥 ${onlinePlayers}/${maxPlayers}` : '👥 —/—',
				field: 'minecraftPlayersChannelId',
			},
		];

		const createdChannels = {};
		for (const def of channelDefs) {
			try {
				const ch = await guild.channels.create({
					name: def.name,
					type: ChannelType.GuildVoice,
					parent: category.id,
					permissionOverwrites: [
						{
							id: guild.roles.everyone.id,
							deny: [PermissionFlagsBits.Connect],
						},
					],
					reason: 'Minecraft Stats Auto-Setup',
				});
				createdChannels[def.field] = ch.id;
			} catch (err) {
				// Best-effort: skip channels we can't create
				container.logger?.warn(
					`[MC AUTOSETUP] Failed to create channel "${def.name}": ${err.message}`,
				);
			}
		}

		// ── 4. Save to ServerSetting ────────────────────────────────────
		const [serverSetting] = await ServerSetting.findOrCreateCache({
			where: { guildId: guild.id },
			defaults: { guildId: guild.id, guildName: guild.name },
		});

		serverSetting.minecraftIp = rawHost;
		serverSetting.minecraftPort = port;
		serverSetting.minecraftStatsOn = true;

		for (const [field, channelId] of Object.entries(createdChannels)) {
			serverSetting[field] = channelId;
		}

		await serverSetting.save();

		// ── 5. Build confirmation response ──────────────────────────────
		const accentColor = helpers.color.convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		const lines = [
			await t(interaction, 'minecraft.set.autosetup.success.title_md'),
			``,
			`**${await t(interaction, 'minecraft.set.autosetup.success.server')}** \`${rawHost}:${port}\``,
			`**${await t(interaction, 'minecraft.set.autosetup.success.category')}** <#${category.id}>`,
			``,
			await t(interaction, 'minecraft.set.autosetup.success.channels_md'),
		];

		const fieldLabels = {
			minecraftIpChannelId: '🖥️ IP',
			minecraftPortChannelId: '🔌 Port',
			minecraftStatusChannelId: '📶 Status',
			minecraftPlayersChannelId: '👥 Players',
		};

		for (const [field, label] of Object.entries(fieldLabels)) {
			const id = createdChannels[field];
			lines.push(
				id ? `**${label}:** <#${id}>` : `**${label}:** ⚠️ Failed to create`,
			);
		}

		lines.push(``);
		lines.push(
			`-# ${await t(interaction, 'minecraft.set.autosetup.success.note')}`,
		);

		const responseContainer = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(lines.join('\n')),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'common.container.footer', {
						username: interaction.client.user.username,
					}),
				),
			);

		return interaction.editReply({
			components: [responseContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = AutosetupCommand;
