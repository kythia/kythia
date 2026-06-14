/**
 * @namespace: addons/ai/commands/ai/facts.js
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

const FACTS_PER_PAGE = 10;

async function buildNavButtons(
	interaction,
	page,
	totalPages,
	allDisabled = false,
) {
	const { t } = interaction.client.container;
	return [
		new ButtonBuilder()
			.setCustomId('ai_facts_first')
			.setLabel(await t(interaction, 'ai.ai.facts.nav.first'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('ai_facts_prev')
			.setLabel(await t(interaction, 'ai.ai.facts.nav.prev'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page <= 1),
		new ButtonBuilder()
			.setCustomId('ai_facts_next')
			.setLabel(await t(interaction, 'ai.ai.facts.nav.next'))
			.setStyle(ButtonStyle.Primary)
			.setDisabled(allDisabled || page >= totalPages),
		new ButtonBuilder()
			.setCustomId('ai_facts_last')
			.setLabel(await t(interaction, 'ai.ai.facts.nav.last'))
			.setStyle(ButtonStyle.Secondary)
			.setDisabled(allDisabled || page >= totalPages),
	];
}

async function generateFactsContainer(
	interaction,
	page,
	allFacts,
	totalFacts,
	navDisabled = false,
) {
	const { t, kythiaConfig, helpers } = interaction.client.container;
	const { convertColor } = helpers.color;

	const totalPages = Math.max(1, Math.ceil(totalFacts / FACTS_PER_PAGE));
	page = Math.max(1, Math.min(page, totalPages));

	const startIndex = (page - 1) * FACTS_PER_PAGE;
	const pageFacts = allFacts.slice(startIndex, startIndex + FACTS_PER_PAGE);

	let listText = '';
	if (pageFacts.length === 0) {
		listText = await t(interaction, 'ai.ai.facts.empty');
	} else {
		const UserFactsManager = require('../../helpers/UserFactsManager');
		const grouped = {};

		for (let i = 0; i < pageFacts.length; i++) {
			const fact = pageFacts[i];
			const factNumber = startIndex + i + 1;
			const label = UserFactsManager.typeLabels[fact.type] || 'Lainnya';
			if (!grouped[label]) grouped[label] = [];
			grouped[label].push({ number: factNumber, text: fact.fact });
		}

		const entries = [];
		for (const label in grouped) {
			entries.push(`**${label}:**`);
			for (const fact of grouped[label]) {
				entries.push(`  \`${fact.number}.\` ${fact.text}`);
			}
		}
		listText = entries.join('\n');
		listText += '\n\n_Use `/ai fact-delete <number>` to remove a fact._';
	}

	const navButtons = await buildNavButtons(
		interaction,
		page,
		totalPages,
		navDisabled,
	);

	const factsContainer = new ContainerBuilder()
		.setAccentColor(
			convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
		)
		.addTextDisplayComponents(
			new TextDisplayBuilder().setContent(
				`## ${await t(interaction, 'ai.ai.facts.title')}`,
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
				await t(interaction, 'ai.ai.facts.footer', {
					page,
					totalPages,
					totalFacts,
				}),
			),
		)
		.addActionRowComponents(
			new ActionRowBuilder().addComponents(...navButtons),
		);

	return { factsContainer, page, totalPages };
}

class FactsCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('facts')
			.setDescription('View all facts/memories AI has learned about you');

	async execute(interaction) {
		const container = this.container;
		const { t, models } = container;
		const { UserFact } = models;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const allFacts = await UserFact.getAllCache({
			where: { userId: interaction.user.id },
			order: [['createdAt', 'DESC']],
			cacheTags: [`UserFact:byUser:${interaction.user.id}`],
		});

		const totalFacts = allFacts.length;
		let currentPage = 1;

		if (totalFacts === 0) {
			const { factsContainer } = await generateFactsContainer(
				interaction,
				1,
				[],
				0,
				/*navDisabled*/ true,
			);
			return interaction.editReply({
				components: [factsContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const { factsContainer, totalPages } = await generateFactsContainer(
			interaction,
			currentPage,
			allFacts,
			totalFacts,
		);

		const message = await interaction.editReply({
			components: [factsContainer],
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});

		if (totalPages <= 1) return;

		const collector = message.createMessageComponentCollector({ time: 300000 });

		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: await t(i, 'ai.ai.facts.not.your.interaction'),
					flags: MessageFlags.Ephemeral,
				});
			}

			if (i.customId === 'ai_facts_first') {
				currentPage = 1;
			} else if (i.customId === 'ai_facts_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'ai_facts_next') {
				currentPage = Math.min(totalPages, currentPage + 1);
			} else if (i.customId === 'ai_facts_last') {
				currentPage = totalPages;
			}

			const { factsContainer: newFactsContainer } =
				await generateFactsContainer(i, currentPage, allFacts, totalFacts);

			await i.update({
				components: [newFactsContainer],
				flags: MessageFlags.IsComponentsV2,
			});
		});

		collector.on('end', async () => {
			try {
				const { factsContainer: finalContainer } = await generateFactsContainer(
					interaction,
					currentPage,
					allFacts,
					totalFacts,
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

exports.default = FactsCommand;
