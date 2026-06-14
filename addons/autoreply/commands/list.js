/**
 * @namespace: addons/autoreply/commands/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
const uiHelper = require('../helpers/ui');

// Helpers extracted to addons/autoreply/helpers/ui.js

class ListCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) => {
		return subcommand
			.setName('list')
			.setDescription('📜 List all auto-replies in this server.');
	};
	async execute(interaction) {
		const container = this.container;
		const { models, helpers, kythiaConfig } = container;
		const { AutoReply } = models;
		const { convertColor } = helpers.color;
		const { generateListContainer } = uiHelper;
		await interaction.deferReply();
		const replies = await AutoReply.getAllCache({
			where: {
				guildId: interaction.guild.id,
			},
			order: [['trigger', 'ASC']],
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
			replies,
			accentColor,
		);
		const message = await interaction.editReply({
			components: [listContainer],
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
					content: 'This interaction is not for you.',
					flags: MessageFlags.Ephemeral,
				});
			}
			if (i.customId === 'autoreply_list_first') {
				currentPage = 1;
			} else if (i.customId === 'autoreply_list_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'autoreply_list_next') {
				currentPage = Math.min(totalPages, currentPage + 1);
			} else if (i.customId === 'autoreply_list_last') {
				currentPage = totalPages;
			}
			const { listContainer: newContainer } = await generateListContainer(
				i,
				currentPage,
				replies,
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
					replies,
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
