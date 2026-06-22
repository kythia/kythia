/**
 * @namespace: addons/ai/commands/ai/facts.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
const factsuiHelper = require('../../helpers/factsUi');

// Helpers extracted to addons/ai/helpers/facts-ui.js

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
		const { generateFactsContainer } = factsuiHelper;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const allFacts = await UserFact.getAllCache({
			where: {
				userId: interaction.user.id,
			},
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
		const collector = message.createMessageComponentCollector({
			time: 300000,
		});
		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: await t(i, 'ai.commands.ai.facts.ai.not.your.interaction'),
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
