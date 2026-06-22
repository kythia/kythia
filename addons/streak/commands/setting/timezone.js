/**
 * @namespace: addons/streak/commands/setting/timezone.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { BaseCommand } = require('kythia-core');

// Constants extracted to addons/streak/helpers/constants.js

class TimezoneCommand extends BaseCommand {
	subcommand = true;
	permissions = [PermissionFlagsBits.ManageGuild];
	slashCommand = (subcommand) =>
		subcommand
			.setName('timezone')
			.setDescription('Set the timezone used for streak day resets')
			.addStringOption((option) =>
				option
					.setName('timezone')
					.setDescription('Timezone for streak day calculations')
					.setRequired(true)
					.addChoices(...require('../../helpers/constants').COMMON_TIMEZONES),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;
		const timezone = interaction.options.getString('timezone');

		// Validate it's a real IANA timezone just in case
		try {
			Intl.DateTimeFormat(undefined, {
				timeZone: timezone,
			});
		} catch {
			const components = await simpleContainer(
				interaction,
				`❌ Invalid timezone: \`${timezone}\``,
				{
					color: 'Red',
				},
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		const [serverSetting] = await ServerSetting.findOrCreateCache({
			where: {
				guildId,
			},
			defaults: {
				guildId,
				guildName,
			},
		});
		serverSetting.streakTimezone = timezone;
		await serverSetting.save();
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'streak.commands.setting.timezone.streak.set', {
				timezone,
			}),
			{
				color: 'Green',
			},
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = TimezoneCommand;
