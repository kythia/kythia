/**
 * @namespace: addons/adventure/commands/start.js
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

const { BaseCommand } = require('kythia-core');

const characters = require('../helpers/characters');

class StartCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) => {
		const chars = characters.getAllCharacters();
		return subcommand
			.setName('start')
			.setNameLocalizations({
				id: 'mulai',
				fr: 'demarrer',
				ja: 'スタート',
			})
			.setDescription('🛩️ Start your journey now!')
			.setDescriptionLocalizations({
				id: '🛩️ Mulai petualanganmu sekarang!',
				fr: '🛩️ Commence ton aventure maintenant !',
				ja: '🛩️ 今すぐ冒険を始めよう！',
			})
			.addStringOption((option) =>
				option
					.setName('character')
					.setDescription('Choose your starting character!')
					.setRequired(true)
					.addChoices(
						...chars.map((char) => ({
							name: `${char.emoji} ${char.name}`,
							value: char.id,
						})),
					),
			);
	};

	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { UserAdventure } = models;
		const { createContainer } = helpers.discord;
		const { convertColor } = helpers.color;

		await interaction.deferReply();

		const userId = interaction.user.id;

		const existing = await UserAdventure.getCache({
			userId,
		});

		if (existing) {
			const msg = await t(interaction, 'adventure.start.already.have');
			const components = await createContainer(interaction, {
				description: msg,
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const charId = interaction.options.getString('character');
		const selected = characters.getChar(charId);

		if (!selected) {
			const msg = await t(interaction, 'adventure.start.invalid_char');
			const components = await createContainer(interaction, {
				description: msg,
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const level = 1;
		const xp = 0;
		let baseHp = 100;
		const gold = 50;
		let strength = 10;
		let defense = 5;

		strength += selected.strengthBonus;
		defense += selected.defenseBonus;
		baseHp = Math.floor(baseHp * (1 + (selected.hpBonusPercent || 0) / 100));

		await UserAdventure.create({
			userId,
			level,
			xp,
			hp: baseHp,
			maxHp: baseHp,
			gold,
			strength,
			defense,
			characterId: selected.id,
		});

		const charStatsString = await t(
			interaction,
			'adventure.start.choose.char.stats',
			{
				str: `${strength - selected.strengthBonus} (${selected.strengthBonus >= 0 ? '+' : ''}${selected.strengthBonus})`,
				def: `${defense - selected.defenseBonus} (${selected.defenseBonus >= 0 ? '+' : ''}${selected.defenseBonus})`,
				hp: `100% (${selected.hpBonusPercent >= 0 ? '+' : ''}${selected.hpBonusPercent}%)`,
				xp: `0% (${selected.xpBonusPercent >= 0 ? '+' : ''}${selected.xpBonusPercent}%)`,
				gold: `0% (${selected.goldBonusPercent >= 0 ? '+' : ''}${selected.goldBonusPercent}%)`,
			},
		);

		const accentColor = convertColor(kythiaConfig.bot.color, {
			from: 'hex',
			to: 'decimal',
		});

		const startContainer = new ContainerBuilder().setAccentColor(accentColor);

		startContainer.addSectionComponents(
			new SectionBuilder()
				.addTextDisplayComponents(
					new TextDisplayBuilder().setContent(
						`## ${await t(interaction, 'adventure.start.success.title')}\n${await t(interaction, 'adventure.start.success.desc')}`,
					),
				)
				.setThumbnailAccessory(
					new ThumbnailBuilder()
						.setURL(interaction.user.displayAvatarURL())
						.setDescription('User Avatar'),
				),
		);

		startContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		startContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`**${await t(interaction, 'adventure.start.selected.char')}**\n${selected.emoji} **${await t(interaction, selected.nameKey)}**\n*${await t(interaction, selected.descKey)}*`,
			),
		);

		startContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		startContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(charStatsString),
		);

		startContainer.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		);

		startContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'common.container.footer', {
					username: interaction.client.user.username,
				}),
			),
		);

		return interaction.editReply({
			components: [startContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = StartCommand;
