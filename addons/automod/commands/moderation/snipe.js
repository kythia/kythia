/**
 * @namespace: addons/automod/commands/moderation/snipe.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ButtonStyle,
	MessageFlags,
	ButtonBuilder,
	ActionRowBuilder,
	ContainerBuilder,
	SeparatorBuilder,
	TextDisplayBuilder,
	SeparatorSpacingSize,
	PermissionFlagsBits,
	MediaGalleryBuilder,
	MediaGalleryItemBuilder,
} = require('discord.js');

const SNIPES_PER_PAGE = 1;

function buildNavButtons(page, totalPages, allDisabled = false) {
	return [
		new ButtonBuilder()
			.setCustomId('snipe_first')
			.setLabel('First')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('snipe_prev')
			.setLabel('Prev')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('snipe_next')
			.setLabel('Next')
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('snipe_last')
			.setLabel('Last')
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

function generateSnipeContainer(
	interaction,
	page,
	snipes,
	totalSnipes,
	navDisabled = false,
) {
	const { kythiaConfig, helpers } = interaction.client.container;
	const { convertColor } = helpers.color;

	const totalPages = Math.max(1, Math.ceil(totalSnipes / SNIPES_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const targetSnipe = snipes[page - 1];

	const mainContainer = new ContainerBuilder().setAccentColor(
		convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
	);

	mainContainer.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(
			`**Author:** <@${targetSnipe.authorId}> (${targetSnipe.authorTag})\n` +
				`**Sent:** <t:${Math.floor(targetSnipe.timestamp / 1000)}:R>\n\n` +
				(targetSnipe.content || '*(No text content)*'),
		),
	);

	if (targetSnipe.image) {
		mainContainer.addMediaGalleryComponents(
			new MediaGalleryBuilder().addItems([
				new MediaGalleryItemBuilder().setURL(targetSnipe.image),
			]),
		);
	}

	mainContainer.addSeparatorComponents(
		new SeparatorBuilder()
			.setSpacing(SeparatorSpacingSize.Small)
			.setDivider(true),
	);
	mainContainer.addTextDisplayComponents(
		new TextDisplayBuilder().setContent(`- Snipe ${page} of ${totalPages}`),
	);

	if (totalPages > 1) {
		const navButtons = buildNavButtons(page, totalPages, navDisabled);
		mainContainer.addActionRowComponents(
			new ActionRowBuilder().addComponents(...navButtons),
		);
	}

	return { snipeContainer: mainContainer, totalPages };
}

module.exports = {
	slashCommand: (subcommand) =>
		subcommand
			.setName('snipe')
			.setDescription('👀 Snipe deleted messages in this channel.')
			.addIntegerOption((option) =>
				option
					.setName('index')
					.setDescription(
						'The index of the deleted message to snipe (1 = most recent)',
					)
					.setRequired(false)
					.setMinValue(1)
					.setMaxValue(20),
			),

	permissions: PermissionFlagsBits.ManageMessages,
	botPermissions: PermissionFlagsBits.SendMessages,

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { helpers, redis } = container;

		await interaction.deferReply();

		if (redis?.status !== 'ready') {
			const reply = await helpers.discord.simpleContainer(
				interaction,
				'❌ Redis is not available, unable to fetch snipes.',
				{ color: 'Red' },
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const snipeKey = `snipe:${interaction.channelId}`;
		const rawSnipes = await redis.lrange(snipeKey, 0, -1);

		if (!rawSnipes || rawSnipes.length === 0) {
			const reply = await helpers.discord.simpleContainer(
				interaction,
				'❌ There is nothing to snipe!',
				{ color: 'Orange' },
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const snipes = rawSnipes.map((s) => JSON.parse(s));
		const totalSnipes = snipes.length;
		let currentPage = interaction.options.getInteger('index') || 1;

		const { snipeContainer, totalPages } = generateSnipeContainer(
			interaction,
			currentPage,
			snipes,
			totalSnipes,
		);

		const message = await interaction.editReply({
			components: [snipeContainer],
			allowedMentions: { parse: [] },
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});

		if (totalPages <= 1) return;

		const collector = message.createMessageComponentCollector({ time: 120000 });

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: '❌ You cannot interact with this menu.',
					flags: MessageFlags.Ephemeral,
				});
			}

			if (i.customId === 'snipe_first') {
				currentPage = 1;
			} else if (i.customId === 'snipe_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'snipe_next') {
				currentPage = Math.min(totalPages, currentPage - -1);
			} else if (i.customId === 'snipe_last') {
				currentPage = totalPages;
			}

			const { snipeContainer: newContainer } = await generateSnipeContainer(
				i,
				currentPage,
				snipes,
				totalSnipes,
			);

			await i.update({
				components: [newContainer],
				allowedMentions: { parse: [] },
				flags: MessageFlags.IsComponentsV2,
			});
		});

		collector.on('end', async () => {
			const { snipeContainer: disabledContainer } =
				await generateSnipeContainer(
					interaction,
					currentPage,
					snipes,
					totalSnipes,
					true, // navDisabled
				);
			await interaction
				.editReply({
					components: [disabledContainer],
					allowedMentions: { parse: [] },
					flags: MessageFlags.IsComponentsV2,
				})
				.catch(() => {});
		});
	},
};
