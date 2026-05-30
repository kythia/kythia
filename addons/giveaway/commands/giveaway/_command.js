/**
 * @namespace: addons/giveaway/commands/giveaway/_command.js
 * @type: Command Group Definition
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	InteractionContextType,
	PermissionFlagsBits,
	SlashCommandBuilder,
} = require('discord.js');
const { Op } = require('sequelize');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('giveaway')
		.setDescription('🎉 Create a giveaway event')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
		.setContexts(InteractionContextType.Guild),

	/**
	 * @param {import('discord.js').AutocompleteInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async autocomplete(interaction, container) {
		const focusedValue = interaction.options.getFocused();
		const subcommand = interaction.options.getSubcommand();
		const { logger, models } = container;
		const { Giveaway } = models;

		const whereClause = {
			guildId: interaction.guild.id,
			prize: { [Op.like]: `%${focusedValue}%` },
		};

		if (['end', 'cancel'].includes(subcommand)) {
			whereClause.ended = false;
		} else if (subcommand === 'reroll') {
			whereClause.ended = true;

			const sevenDaysAgo = new Date();
			sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

			whereClause.endTime = {
				[Op.gte]: sevenDaysAgo,
			};
		}

		try {
			const choices = await Giveaway.getAllCache({
				where: whereClause,
				limit: 20,
				order: [['endTime', 'DESC']],
			});

			const result = choices.map((g) => {
				const dateStr = new Date(g.endTime).toLocaleDateString('id-ID', {
					day: 'numeric',
					month: 'short',
				});

				const prizeName =
					g.prize.length > 25 ? `${g.prize.substring(0, 25)}...` : g.prize;

				return {
					name: `🎁 ${prizeName} (${dateStr}) #${g.messageId.slice(-4)}`,
					value: g.messageId,
				};
			});

			await interaction.respond(result);
		} catch (error) {
			logger.error(
				`[giveaway:autocomplete] Error: ${error.message || String(error)}`,
				{ label: 'giveaway:autocomplete' },
			);
			await interaction.respond([]);
		}
	},
};
