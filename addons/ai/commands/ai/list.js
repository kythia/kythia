/**
 * @namespace: addons/ai/commands/ai/list.js
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
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

const CHANNELS_PER_PAGE = 10;

async function buildNavButtons(
	interaction,
	page,
	totalPages,
	allDisabled = false,
) {
	const { t } = interaction.client.container;
	return [
		new ButtonBuilder()
			.setCustomId('ai_list_first')
			.setLabel(await t(interaction, 'ai.ai.list.nav.first'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('ai_list_prev')
			.setLabel(await t(interaction, 'ai.ai.list.nav.prev'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('ai_list_next')
			.setLabel(await t(interaction, 'ai.ai.list.nav.next'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('ai_list_last')
			.setLabel(await t(interaction, 'ai.ai.list.nav.last'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

async function generateAIListContainer(
	interaction,
	page,
	allChannelIds,
	totalChannels,
	navDisabled = false,
) {
	const { t, kythiaConfig, helpers } = interaction.client.container;
	const { convertColor } = helpers.color;

	const totalPages = Math.max(1, Math.ceil(totalChannels / CHANNELS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * CHANNELS_PER_PAGE;
	const pageChannelIds = allChannelIds.slice(
		startIndex,
		startIndex + CHANNELS_PER_PAGE,
	);

	let listText = '';
	if (pageChannelIds.length === 0) {
		listText = await t(interaction, 'ai.ai.list.empty');
	} else {
		const entries = pageChannelIds.map((channelId, index) => {
			const globalIndex = startIndex + index + 1;
			return `${globalIndex}. <#${channelId}>`;
		});
		listText = entries.join('\n');
	}

	const navButtons = await buildNavButtons(
		interaction,
		page,
		totalPages,
		navDisabled,
	);

	const aiListContainer = new ContainerBuilder()
		.setAccentColor(
			convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## ${await t(interaction, 'ai.ai.list.title')}`,
			),
		)
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(new TextDisplayBuilder().setContent(listText))
		.addSeparatorComponents(
			new SeparatorBuilder()
				.setSpacing(SeparatorSpacingSize.Small)
				.setDivider(true),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				await t(interaction, 'ai.ai.list.footer', {
					page,
					totalPages,
					totalChannels,
				}),
			),
		)
		.addActionRowComponents(
			new ActionRowBuilder().addComponents(...navButtons),
		);

	return { aiListContainer, page, totalPages };
}

class ListCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('list')
			.setDescription('View list of AI-enabled channels');

	guildOnly = true;

	async execute(interaction) {
		const container = this.container;
		const { t, models } = container;
		const { ServerSetting } = models;

		await interaction.deferReply();

		const [setting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId: interaction.guild.id },
			defaults: {
				guildId: interaction.guild.id,
				guildName: interaction.guild.name,
			},
		});

		const aiChannelIds = Array.isArray(setting?.aiChannelIds)
			? [...setting.aiChannelIds]
			: [];

		const totalChannels = aiChannelIds.length;
		let currentPage = 1;

		if (totalChannels === 0) {
			const { aiListContainer } = await generateAIListContainer(
				interaction,
				1,
				[],
				0,
				/*navDisabled*/ true,
			);
			return interaction.editReply({
				components: [aiListContainer],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		}

		const { aiListContainer, totalPages } = await generateAIListContainer(
			interaction,
			currentPage,
			aiChannelIds,
			totalChannels,
		);

		const message = await interaction.editReply({
			components: [aiListContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
			allowedMentions: {
				parse: [],
			},
		});

		if (totalPages <= 1) return;

		const collector = message.createMessageComponentCollector({ time: 300000 });

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: await t(i, 'ai.ai.list.not.your.interaction'),
					flags: MessageFlags.Ephemeral,
				});
			}

			if (i.customId === 'ai_list_first') {
				currentPage = 1;
			} else if (i.customId === 'ai_list_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'ai_list_next') {
				currentPage = Math.min(totalPages, currentPage + 1);
			} else if (i.customId === 'ai_list_last') {
				currentPage = totalPages;
			}

			const { aiListContainer: newAIListContainer } =
				await generateAIListContainer(
					i,
					currentPage,
					aiChannelIds,
					totalChannels,
				);

			await i.update({
				components: [newAIListContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		});

		collector.on('end', async () => {
			try {
				const { aiListContainer: finalContainer } =
					await generateAIListContainer(
						interaction,
						currentPage,
						aiChannelIds,
						totalChannels,
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
