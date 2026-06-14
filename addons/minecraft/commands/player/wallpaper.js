/**
 * @namespace: addons/minecraft/commands/player/wallpaper.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	MediaGalleryBuilder,
	SeparatorSpacingSize,
	MediaGalleryItemBuilder,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

const {
	WALLPAPERS,
	USERNAME_REGEX,
	MULTI_PLAYER_WALLPAPERS,
} = require('../../helpers/constants');

const SKIN_API_BASE =
	'https://starlightskins.lunareclipse.studio/render/wallpaper';

class WallpaperCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('wallpaper')
			.setDescription(
				'🖼️ Generate a Minecraft wallpaper featuring one or more players',
			)
			.addStringOption((option) =>
				option
					.setName('wallpaper')
					.setDescription('Choose a wallpaper style')
					.setRequired(true)
					.addChoices(...WALLPAPERS),
			)
			.addStringOption((option) =>
				option
					.setName('players')
					.setDescription(
						'Player name(s) — separate multiple with commas, no spaces (e.g. kenndeclouv,ribellflow)',
					)
					.setRequired(true)
					.setMinLength(3)
					.setMaxLength(128),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, kythiaConfig, helpers } = container;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const wallpaperId = interaction.options.getString('wallpaper');
		const rawPlayers = interaction.options.getString('players');

		// Parse and validate each player name
		const allPlayers = rawPlayers
			.split(',')
			.map((p) => p.trim())
			.filter(Boolean);

		if (allPlayers.length === 0) {
			const msg = await t(
				interaction,
				'minecraft.player.errors.invalid_username',
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		for (const name of allPlayers) {
			if (!USERNAME_REGEX.test(name)) {
				const msg = await t(
					interaction,
					'minecraft.player.errors.invalid_username',
				);
				const components = await simpleContainer(interaction, msg, {
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		}

		// Only quick_hide supports multiple players — others use just the first
		const playerList = MULTI_PLAYER_WALLPAPERS.has(wallpaperId)
			? allPlayers
			: [allPlayers[0]];

		const playersParam = playerList.map(encodeURIComponent).join(',');
		const imageUrl = `${SKIN_API_BASE}/${wallpaperId}/${playersParam}`;

		// Validate the URL actually returns an image (not a JSON error from the API)
		try {
			const check = await fetch(imageUrl, { method: 'HEAD' });
			const contentType = check.headers.get('content-type') ?? '';
			if (!contentType.startsWith('image/')) {
				const msg = await t(
					interaction,
					'minecraft.player.wallpaper.errors.api_error',
					{
						players: playerList.join(', '),
					},
				);
				const components = await simpleContainer(interaction, msg, {
					color: 'Red',
				});
				return interaction.editReply({
					components,
					flags: MessageFlags.IsComponentsV2,
				});
			}
		} catch {
			const msg = await t(
				interaction,
				'minecraft.player.wallpaper.errors.api_unreachable',
			);
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const wallpaperLabel =
			WALLPAPERS.find((w) => w.value === wallpaperId)?.name ?? wallpaperId;

		const accentColor = helpers.color.convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		const playerDisplay =
			playerList.length === 1
				? playerList[0]
				: `${playerList.slice(0, -1).join(', ')} & ${playerList.at(-1)}`;

		const container_ = new ContainerBuilder()
			.setAccentColor(accentColor)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(interaction, 'minecraft.player.wallpaper.title', {
						wallpaper: wallpaperLabel,
						players: playerDisplay,
					}),
				),
			)
			.addSeparatorComponents(
				new SeparatorBuilder()
					.setSpacing(SeparatorSpacingSize.Small)
					.setDivider(true),
			)
			.addMediaGalleryComponents(
				new MediaGalleryBuilder().addItems([
					new MediaGalleryItemBuilder().setURL(imageUrl),
				]),
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
			components: [container_],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = WallpaperCommand;
