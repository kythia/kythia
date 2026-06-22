/**
 * @namespace: addons/reminder/commands/timezone.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class TimezoneCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('timezone')
			.setDescription('Set your preferred timezone for reminders.')
			.addStringOption((option) =>
				option
					.setName('timezone')
					.setDescription('Your timezone (e.g. Asia/Jakarta, UTC)')
					.setRequired(true),
			);
	async execute(interaction) {
		const { helpers, kythiaConfig, redis, t } = this.container;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply();
		const tz = interaction.options.getString('timezone');

		// Validate timezone
		try {
			Intl.DateTimeFormat(undefined, {
				timeZone: tz,
			});
		} catch (_e) {
			const errContainer = await simpleContainer(
				interaction,
				'Invalid timezone format. Please use standard IANA timezones (e.g., `Asia/Jakarta`, `America/New_York`, `UTC`).',
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components: errContainer,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		// Store in redis
		const cacheKey = `kythia:reminder:timezone:${interaction.user.id}`;
		await redis.set(cacheKey, tz);
		const msg = await t(
			interaction,
			'reminder.commands.timezone.reminder.success',
			{
				timezone: tz,
			},
		);
		const components = await simpleContainer(interaction, msg, {
			color: kythiaConfig.bot.color,
		});
		await interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
module.exports = TimezoneCommand;
