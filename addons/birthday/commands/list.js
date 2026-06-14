/**
 * @namespace: addons/birthday/commands/list.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { DateTime } = require('luxon');
const { BaseCommand } = require('kythia-core');
const uiHelper = require('../helpers/ui');

// Helpers extracted to addons/birthday/helpers/ui.js

class ListCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('list')
			.setDescription('📅 See a list of upcoming birthdays.');
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { UserBirthday } = models;
		const { generateUpcomingContainer } = uiHelper;
		const MAX_BIRTHDAYS = 100;
		await interaction.deferReply();

		// Fetch birthdays
		const birthdays = await UserBirthday.getAllCache({
			where: {
				guildId: interaction.guild.id,
			},
			limit: MAX_BIRTHDAYS,
		});
		if (birthdays.length === 0) {
			const components = await helpers.discord.simpleContainer(
				interaction,
				await t(interaction, 'birthday.list.empty'),
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		}

		// Sort logic
		const now = DateTime.now();
		const upcoming = birthdays
			.map((b) => {
				let next = DateTime.fromObject({
					day: b.day,
					month: b.month,
					year: now.year,
				});
				if (next < now.startOf('day')) {
					next = next.plus({
						years: 1,
					});
				}
				return {
					...b.toJSON(),
					nextBirthday: next,
					daysUntil: next.diff(now, 'days').days,
				};
			})
			.sort((a, b) => a.nextBirthday - b.nextBirthday);
		const totalUsers = upcoming.length;
		let currentPage = 1;
		const { container: initialContainer, totalPages } =
			await generateUpcomingContainer(
				interaction,
				currentPage,
				upcoming,
				totalUsers,
			);
		const message = await interaction.editReply({
			components: [initialContainer],
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
					content: await t(i, 'common.error.interaction_refused'),
					flags: MessageFlags.Ephemeral,
				});
			}
			if (i.customId === 'upcoming_first') {
				currentPage = 1;
			} else if (i.customId === 'upcoming_prev') {
				currentPage = Math.max(1, currentPage - 1);
			} else if (i.customId === 'upcoming_next') {
				currentPage = Math.min(totalPages, currentPage + 1);
			} else if (i.customId === 'upcoming_last') {
				currentPage = totalPages;
			}
			const { container: newContainer } = await generateUpcomingContainer(
				i,
				currentPage,
				upcoming,
				totalUsers,
			);
			await i.update({
				components: [newContainer],
				flags: MessageFlags.IsComponentsV2,
				allowedMentions: {
					parse: [],
				},
			});
		});
		collector.on('end', async () => {
			try {
				const { container: finalContainer } = await generateUpcomingContainer(
					interaction,
					currentPage,
					upcoming,
					totalUsers,
					true,
				);
				await message.edit({
					components: [finalContainer],
					flags: MessageFlags.IsComponentsV2,
					allowedMentions: {
						parse: [],
					},
				});
			} catch (_e) {}
		});
	}
}
exports.default = ListCommand;
