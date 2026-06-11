/**
 * @namespace: addons/activity/commands/setup.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	PermissionFlagsBits,
	ContainerBuilder,
	TextDisplayBuilder,
} = require('discord.js');

module.exports = {
	subcommand: true,
	premiumLocked: 'cute',
	slashCommand: (subcommand) =>
		subcommand
			.setName('setup')
			.setDescription('⚙️ Enable or disable activity tracking for this server.')
			.addBooleanOption((option) =>
				option
					.setName('enabled')
					.setDescription('Turn activity tracking on or off.')
					.setRequired(true),
			),
	defaultMemberPermissions: PermissionFlagsBits.ManageGuild,

	/**
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {import('kythia-core').KythiaDI.Container} container
	 */
	async execute(interaction, container) {
		const { models, helpers, kythiaConfig } = container;
		const { ServerSetting } = models;
		const { convertColor } = helpers.color;

		await interaction.deferReply();

		const enabled = interaction.options.getBoolean('enabled', true);
		const guildId = interaction.guildId;

		const [setting] = await ServerSetting.firstOrCreateCache(
			{ guildId },
			{ activityOn: false },
		);

		setting.activityOn = enabled;
		setting.changed('activityOn', true);
		await setting.save();

		// await ServerSetting.clearCache({ guildId });

		const accentColorDecimal = convertColor(
			kythiaConfig.bot.color || '#5865F2',
			{
				from: 'hex',
				to: 'decimal',
			},
		);

		const successContainer = new ContainerBuilder()
			.setAccentColor(accentColorDecimal)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					`✅ **Activity Tracking** has been **${enabled ? 'enabled' : 'disabled'}** for this server.`,
				),
			);

		await interaction.editReply({
			components: [successContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	},
};
