/**
 * @namespace: addons/core/commands/tools/sticky/list.js
 * @type: Module
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
const stickyuiHelper = require('../../../helpers/stickyUi');

// Helpers extracted to addons/core/helpers/sticky-ui.js

class ListCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('list')
			.setDescription('📋 List all sticky messages in this server.');
	async execute(interaction) {
		const container = this.container;
		const { models, helpers, kythiaConfig, t } = container;
		const { StickyMessage } = models;
		const { convertColor } = helpers.color;
		const { generateListContainer } = stickyuiHelper;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});

		// Fetch all sticky messages for channels in this guild
		const guild = interaction.guild;
		const guildChannelIds = guild.channels.cache
			.filter((ch) => ch.isTextBased())
			.map((ch) => ch.id);
		const stickies = await StickyMessage.getAllCache({
			where: {
				channelId: guildChannelIds,
			},
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
		const collector = message.createMessageComponentCollector({
			time: 300000,
		});
		collector.on('collect', async (i) => {
			if (i.user.id !== interaction.user.id) {
				return i.reply({
					content: await t(
						interaction,
						'common.pagination.not.your.interaction',
					),
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
