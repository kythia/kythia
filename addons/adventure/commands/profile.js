/**
 * @namespace: addons/adventure/commands/profile.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	SectionBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	ThumbnailBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
} = require('discord.js');
const characters = require('../helpers/characters');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('profile')
			.setNameLocalizations({ id: 'profil', fr: 'profil', ja: 'プロフィール' })
			.setDescription('📑 Look at your Adventure stats')
			.setDescriptionLocalizations({
				id: '📑 Lihat Statistik petualanganmu',
				fr: "📑 Tes statistiques d'aventure",
				ja: '📑 冒険のステータスを確認しよう',
			}),

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, kythiaConfig, helpers } = container;
		const { UserAdventure } = models;
		const { createContainer } = helpers.discord;
		const { convertColor } = helpers.color;

		await interaction.deferReply();
		const user = await UserAdventure.getCache({ userId: interaction.user.id });

		if (!user) {
			const msg = await t(interaction, 'adventure.no.character');
			const components = await createContainer(interaction, {
				description: msg,
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const xpForNextLevel = 100 * user.level;
		const xpProgress = Math.min(user.xp / xpForNextLevel, 1);
		const progressBar =
			'█'.repeat(Math.round(20 * xpProgress)) +
			'░'.repeat(20 - Math.round(20 * xpProgress));

		const colorInput = kythiaConfig.bot.color;
		const defaultAccent = convertColor(colorInput, {
			from: 'hex',
			to: 'decimal',
		});
		let accentColor = defaultAccent;

		const isHex = /^#?([0-9A-Fa-f]{6})$/.test(colorInput);
		if (isHex) {
			accentColor = convertColor(colorInput, { from: 'hex', to: 'decimal' });
		} else {
			try {
				accentColor = convertColor(colorInput, {
					from: 'discord',
					to: 'decimal',
				});
			} catch (_e) {
				accentColor = defaultAccent;
			}
		}

		const profileContainer = new ContainerBuilder().setAccentColor(accentColor);

		const introText = await t(interaction, 'adventure.stats.embed.desc', {
			username: interaction.user.username,
		});

		profileContainer.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(introText),
				)
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(interaction.user.displayAvatarURL())
						.setDescription('User Avatar'),
				),
		);

		profileContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		const statsLine1 = [
			`**${await t(interaction, 'adventure.stats.level')}:** ${user.level}`,
			`**${await t(interaction, 'adventure.stats.hp')}:** ${user.hp}`,
			`**${await t(interaction, 'adventure.stats.gold')}:** ${user.gold.toLocaleString()}`,
		].join('\n');

		profileContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(statsLine1),
		);

		profileContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		const statsLine2 = [
			`**${await t(interaction, 'adventure.stats.strength')}:** ${user.strength}`,
			`**${await t(interaction, 'adventure.stats.defense')}:** ${user.defense}`,
		].join('\n');

		profileContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(statsLine2),
		);

		profileContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		const xpTitle = await t(interaction, 'adventure.stats.xp.progress.text');
		const xpValue = await t(interaction, 'adventure.stats.xp.progress.value', {
			xp: user.xp,
			xpForNextLevel,
			progressBar,
		});

		profileContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(`**${xpTitle}**\n${xpValue}`),
		);

		if (user.characterId) {
			const c = characters.getChar(user.characterId);
			if (c) {
				profileContainer.addSeparatorComponents(
					new SeparatorBuilder()
						.setSpacing(SeparatorSpacingSize.Small)
						.setDivider(true),
				);

				const charTitle = await t(interaction, 'adventure.stats.character');
				profileContainer.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`**${charTitle}**\n${c.emoji} ${c.name}`,
					),
				);
			}
		}

		profileContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);
		profileContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'common.container.footer', {
					username: interaction.client.user.username,
				}),
			),
		);

		return interaction.editReply({
			components: [profileContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
