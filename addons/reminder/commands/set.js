/**
 * @namespace: addons/reminder/commands/set.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');
const { parseTime } = require('../helpers/time');
const { MessageFlags } = require('discord.js');

class SetCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('set')
			.setDescription('Set a new reminder.')
			.addStringOption((option) =>
				option
					.setName('time')
					.setDescription(
						'When to remind you (e.g. 10m, 2h, 1d, 12:00, 8:30pm)',
					)
					.setRequired(true),
			)
			.addStringOption((option) =>
				option
					.setName('reason')
					.setDescription('What do you want to be reminded about?')
					.setRequired(true),
			)
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription('Target channel (leave blank for DM)')
					.setRequired(false),
			)
			.addStringOption((option) =>
				option
					.setName('repeat')
					.setDescription('Make this a repeating reminder')
					.setRequired(false)
					.addChoices(
						{ name: 'Daily', value: 'daily' },
						{ name: 'Weekly', value: 'weekly' },
						{ name: 'Monthly', value: 'monthly' },
					),
			);

	async execute(interaction) {
		const { models, helpers, kythiaConfig, redis, t } = this.container;
		const { KythiaReminder } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply();

		const timeInput = interaction.options.getString('time');
		const reason = interaction.options.getString('reason');
		const channel = interaction.options.getChannel('channel');
		const repeatMode = interaction.options.getString('repeat') || null;

		let timezone = kythiaConfig.bot.timezone || 'UTC';

		const cacheKey = `kythia:reminder:timezone:${interaction.user.id}`;
		const cachedTz = await redis.get(cacheKey);
		if (cachedTz) {
			timezone = cachedTz;
		} else {
			const existingReminder = await KythiaReminder.getCache({
				where: { userId: interaction.user.id },
			});
			if (existingReminder?.timezone) {
				timezone = existingReminder.timezone;
			}
		}

		const targetDate = parseTime(timeInput, timezone);

		if (!targetDate) {
			const errContainer = await simpleContainer(
				interaction,
				await t(interaction, 'reminder.commands.reminder.set.invalid_time'),
				{ color: 'Red' },
			);
			return interaction.editReply({
				components: errContainer,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		await KythiaReminder.create({
			userId: interaction.user.id,
			channelId: channel ? channel.id : null,
			reason,
			timezone,
			expiresAt: targetDate,
			repeatMode,
		});

		const timestampStr = `<t:${Math.floor(targetDate.getTime() / 1000)}:f>`;
		const targetStr = channel ? `<#${channel.id}>` : 'your DM';

		let msg = await t(interaction, 'reminder.commands.reminder.set.success', {
			time: timestampStr,
			timezone: timezone,
			target: targetStr,
		});

		if (repeatMode) {
			msg += `\n> 🔁 **Repeats:** ${repeatMode.charAt(0).toUpperCase() + repeatMode.slice(1)}`;
		}

		const components = await simpleContainer(interaction, msg, {
			color: kythiaConfig.bot.color,
		});

		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

module.exports = SetCommand;
