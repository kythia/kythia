/**
 * @namespace: addons/streak/commands/setting/timezone.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

// IANA timezone list (common ones — enough for a select menu)
const COMMON_TIMEZONES = [
	{ name: 'UTC+0 — UTC', value: 'UTC' },
	{ name: 'UTC+7 — Asia/Jakarta (WIB)', value: 'Asia/Jakarta' },
	{ name: 'UTC+8 — Asia/Singapore', value: 'Asia/Singapore' },
	{ name: 'UTC+8 — Asia/Kuala_Lumpur', value: 'Asia/Kuala_Lumpur' },
	{ name: 'UTC+8 — Asia/Manila', value: 'Asia/Manila' },
	{ name: 'UTC+8 — Asia/Makassar (WITA)', value: 'Asia/Makassar' },
	{ name: 'UTC+9 — Asia/Tokyo', value: 'Asia/Tokyo' },
	{ name: 'UTC+9 — Asia/Seoul', value: 'Asia/Seoul' },
	{ name: 'UTC+9 — Asia/Jayapura (WIT)', value: 'Asia/Jayapura' },
	{ name: 'UTC+5:30 — Asia/Kolkata', value: 'Asia/Kolkata' },
	{ name: 'UTC+5 — Asia/Karachi', value: 'Asia/Karachi' },
	{ name: 'UTC+3 — Europe/Moscow', value: 'Europe/Moscow' },
	{ name: 'UTC+1 — Europe/Paris', value: 'Europe/Paris' },
	{ name: 'UTC+1 — Europe/Berlin', value: 'Europe/Berlin' },
	{ name: 'UTC+0 — Europe/London', value: 'Europe/London' },
	{ name: 'UTC-5 — America/New_York', value: 'America/New_York' },
	{ name: 'UTC-6 — America/Chicago', value: 'America/Chicago' },
	{ name: 'UTC-7 — America/Denver', value: 'America/Denver' },
	{ name: 'UTC-8 — America/Los_Angeles', value: 'America/Los_Angeles' },
	{ name: 'UTC+10 — Australia/Sydney', value: 'Australia/Sydney' },
	{ name: 'UTC+12 — Pacific/Auckland', value: 'Pacific/Auckland' },
	{ name: 'UTC-3 — America/Sao_Paulo', value: 'America/Sao_Paulo' },
	{ name: 'UTC+2 — Africa/Cairo', value: 'Africa/Cairo' },
	{ name: 'UTC+4 — Asia/Dubai', value: 'Asia/Dubai' },
	{ name: 'UTC+5:45 — Asia/Kathmandu', value: 'Asia/Kathmandu' },
];

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('timezone')
			.setDescription('🌐 Set the timezone used for streak day resets')
			.addStringOption((opt) =>
				opt
					.setName('timezone')
					.setDescription('Timezone for streak day calculations')
					.setRequired(true)
					.addChoices(...COMMON_TIMEZONES),
			),
	permissions: [PermissionFlagsBits.ManageGuild],

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;
		const timezone = interaction.options.getString('timezone');

		// Validate it's a real IANA timezone just in case
		try {
			Intl.DateTimeFormat(undefined, { timeZone: timezone });
		} catch {
			const components = await simpleContainer(
				interaction,
				`❌ Invalid timezone: \`${timezone}\``,
				{ color: 'Red' },
			);
			return interaction.editReply({
				components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		const [serverSetting] = await ServerSetting.findOrCreateWithCache({
			where: { guildId },
			defaults: { guildId, guildName },
		});

		serverSetting.streakTimezone = timezone;
		await serverSetting.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'core.setting.setting.streak.timezone.set', {
				timezone,
			}),
			{ color: 'Green' },
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
