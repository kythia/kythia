/**
 * @namespace: addons/core/commands/tools/sticky/list.js
 * @type: Module
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
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

const ITEMS_PER_PAGE = 10;

async function buildNavButtons(
	interaction,
	page,
	totalPages,
	allDisabled = false,
) {
	const { t } = interaction.client.container;

	return [
		new ButtonBuilder()
			.setCustomId('sticky_list_first')
			.setLabel(await t(interaction, 'common.first'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('sticky_list_prev')
			.setLabel(await t(interaction, 'common.previous'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('sticky_list_next')
			.setLabel(await t(interaction, 'common.next'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('sticky_list_last')
			.setLabel(await t(interaction, 'common.last'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

async function generateListContainer(
	interaction,
	page,
	stickies,
	accentColor,
	navDisabled = false,
) {
	const { t } = interaction.client.container;
	const totalPages = Math.max(1, Math.ceil(stickies.length / ITEMS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * ITEMS_PER_PAGE;
	const pageItems = stickies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

	const listContainer = new ContainerBuilder()
		.setAccentColor(accentColor)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'core.tools.sticky.list.title'),
			),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Large)
				.setDivider(true),
		);

	if (pageItems.length === 0) {
		listContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'core.tools.sticky.list.empty'),
			),
		);
	} else {
		const entries = await Promise.all(
			pageItems.map((sticky) =>
				t(interaction, 'core.tools.sticky.list.entry', {
					channelId: sticky.channelId,
				}),
			),
		);

		listContainer.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(entries.join('')),
		);
	}

	listContainer
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'core.tools.sticky.list.footer', {
					page,
					totalPages,
				}),
			),
		);

	if (totalPages > 1) {
		const buttons = await buildNavButtons(
			interaction,
			page,
			totalPages,
			navDisabled,
		);
		listContainer.addActionRowComponents(
			new ActionRowBuilder().addComponents(...buttons),
		);
	}

	return { listContainer, page, totalPages };
}

class ListCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('list')
			.setDescription('📋 List all sticky messages in this server.');

	async execute(interaction) {
		const container = this.container;
		const { models, helpers, kythiaConfig } = container;
		const { StickyMessage } = models;
		const { convertColor } = helpers.color;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		// Fetch all sticky messages for channels in this guild
		const guild = interaction.guild;
		const guildChannelIds = guild.channels.cache
			.filter((ch) => ch.isTextBased())
			.map((ch) => ch.id);

		const stickies = await StickyMessage.getAllCache({
			where: { channelId: guildChannelIds },
			order: [['channelId', 'ASC']],
		});

		const colorInput = kythiaConfig.bot.color || '#5865F2';
		const accentColor = convertColor(colorInput, {
			from: 'hex',
			to: 'decimal',
		});

		let currentPage = 1;

		const { listContainer, totalPages } = await generateListContainer(
			interaction,
			currentPage,
			stickies,
			accentColor,
		);

		const message = await interaction.editReply({
			components: [listContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});

		if (totalPages <= 1) return;

		const collector = message.createMessageComponentCollector({ time: 300000 });

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: 'This interaction is not for you.',
					flags: MessageFlags.Ephemeral,
				});
			}

			if (i.customId === 'sticky_list_first') currentPage = 1;
			else if (i.customId === 'sticky_list_prev')
				currentPage = Math.max(1, currentPage - 1);
			else if (i.customId === 'sticky_list_next')
				currentPage = Math.min(totalPages, currentPage + 1);
			else if (i.customId === 'sticky_list_last') currentPage = totalPages;

			const { listContainer: newContainer } = await generateListContainer(
				i,
				currentPage,
				stickies,
				accentColor,
			);

			await i.update({
				components: [newContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		});

		collector.on('end', async () => {
			try {
				const { listContainer: finalContainer } = await generateListContainer(
					interaction,
					currentPage,
					stickies,
					accentColor,
					true,
				);

				await message.edit({
					components: [finalContainer],
					flags: MessageFlags.IsComponentsV2,
				});
			} catch (_e) {}
		});
	}
}

exports.default = ListCommand;
