/**
 * @namespace: addons/automod/commands/moderation/snipe.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { BaseCommand } = require('kythia-core');
const snipeuiHelper = require('../../helpers/snipeUi');

// Helpers extracted to addons/automod/helpers/snipe-ui.js

class SnipeCommand extends BaseCommand {
	permissions = PermissionFlagsBits.ManageMessages;
	botPermissions = PermissionFlagsBits.SendMessages;

	slashCommand = (subcommand) =>
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
			);

	async execute(interaction) {
		const container = this.container;
		const { helpers, redis } = container;
		await interaction.deferReply();
		if (redis?.status !== 'ready') {
			const reply = await helpers.discord.simpleContainer(
				interaction,
				'❌ Redis is not available, unable to fetch snipes.',
				{
					color: 'Red',
				},
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
				{
					color: 'Orange',
				},
			);
			return interaction.editReply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const snipes = rawSnipes.map((s) => JSON.parse(s));
		const totalSnipes = snipes.length;
		let currentPage = interaction.options.getInteger('index') || 1;
		const { generateSnipeContainer } = snipeuiHelper;
		const { snipeContainer, totalPages } = generateSnipeContainer(
			interaction,
			currentPage,
			snipes,
			totalSnipes,
		);
		const message = await interaction.editReply({
			components: [snipeContainer],
			allowedMentions: {
				parse: [],
			},
			flags: MessageFlags.IsComponentsV2,
			fetchReply: true,
		});
		if (totalPages <= 1) return;
		const collector = message.createMessageComponentCollector({
			time: 120000,
		});
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
				allowedMentions: {
					parse: [],
				},
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
					allowedMentions: {
						parse: [],
					},
					flags: MessageFlags.IsComponentsV2,
				})
				.catch(() => {});
		});
	}
}

exports.default = SnipeCommand;
