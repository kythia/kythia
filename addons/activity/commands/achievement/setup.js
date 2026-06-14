/**
 * @namespace: addons/activity/commands/achievement/setup.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	PermissionFlagsBits,
	ChannelType,
	ContainerBuilder,
	TextDisplayBuilder,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class SetupCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('setup')
			.setDescription('⚙️ Setup the achievement notification channel.')
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription(
						'The channel to send notifications to (leave empty to disable).',
					)
					.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
					.setRequired(false),
			);

	defaultMemberPermissions = PermissionFlagsBits.ManageGuild;

	async execute(interaction) {
		const container = this.container;
		const { models, helpers, kythiaConfig } = container;
		const { ServerSetting } = models;
		const { convertColor } = helpers.color;

		await interaction.deferReply();

		const channel = interaction.options.getChannel('channel');
		const guildId = interaction.guildId;

		const [setting] = await ServerSetting.firstOrCreateCache(
			{ guildId },
			{ achievementChannelId: null },
		);

		setting.achievementChannelId = channel ? channel.id : null;
		setting.changed('achievementChannelId', true);
		await setting.save();

		// await ServerSetting.clearCache({ guildId });

		const accentColorDecimal = convertColor(
			kythiaConfig.bot.color || '#5865F2',
			{
				from: 'hex',
				to: 'decimal',
			},
		);

		const message = channel
			? `✅ **Achievement Notifications** will now be sent to <#${channel.id}>.`
			: `✅ **Achievement Notifications** have been **disabled** (no channel set).`;

		const successContainer = new ContainerBuilder()
			.setAccentColor(accentColorDecimal)
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(message));

		await interaction.editReply({
			components: [successContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = SetupCommand;
