/**
 * @namespace: addons/ai/commands/ai/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
const listuiHelper = require('../../helpers/list-ui');

// Helpers extracted to addons/ai/helpers/list-ui.js

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
		const { generateAIListContainer } = listuiHelper;
		await interaction.deferReply();
		const [setting] = await ServerSetting.findOrCreateWithCache({
			where: {
				guildId: interaction.guild.id,
			},
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
		const collector = message.createMessageComponentCollector({
			time: 300000,
		});
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
