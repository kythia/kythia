/**
 * @namespace: addons/ai/commands/ai/fact-delete.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class FactDeleteCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('fact-delete')
			.setDescription('Delete a specific fact about you')
			.addIntegerOption((option) =>
				option
					.setName('number')
					.setDescription('Fact number from /ai facts (1, 2, 3...)')
					.setRequired(true)
					.setMinValue(1),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { UserFact } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const factNumber = interaction.options.getInteger('number');

		const allFacts = await UserFact.getAllCache({
			where: { userId: interaction.user.id },
			order: [['createdAt', 'DESC']],
			cacheTags: [`UserFact:byUser:${interaction.user.id}`],
		});

		if (allFacts.length === 0) {
			const msg = await t(interaction, 'ai.ai.fact_delete.no_facts');
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (factNumber > allFacts.length) {
			const msg = await t(interaction, 'ai.ai.fact_delete.invalid_number', {
				max: allFacts.length,
			});
			const components = await simpleContainer(interaction, msg, {
				color: 'Red',
			});
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const factToDelete = allFacts[factNumber - 1];

		await factToDelete.destroy();

		const msg = await t(interaction, 'ai.ai.fact_delete.success', {
			fact: factToDelete.fact,
		});
		const components = await simpleContainer(interaction, msg, {
			color: 'Green',
		});

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = FactDeleteCommand;
