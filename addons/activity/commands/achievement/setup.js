/**
 * @namespace: addons/activity/commands/achievement/setup.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	ChannelType,
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	PermissionFlagsBits,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class SetupCommand extends BaseCommand {
	defaultMemberPermissions = PermissionFlagsBits.ManageGuild;

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

	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { ServerSetting } = models;
		const { convertColor } = helpers.color;

		await interaction.deferReply();

		const channel = interaction.options.getChannel('channel');
		const guildId = interaction.guildId;

		const [setting] = await ServerSetting.findOrCreateCache({
			where: {
				guildId,
			},
			defaults: {
				guildId,
				achievementChannelId: null,
			},
		});

		setting.achievementChannelId = channel ? channel.id : null;
		setting.changed('achievementChannelId', true);
		await setting.save();

		const message = channel
			? await t(interaction, 'activity.commands.achievement.setup.enabled', {
					channelId: channel.id,
				})
			: await t(interaction, 'activity.commands.achievement.setup.disabled');

		const successContainer = new ContainerBuilder()
			.setAccentColor(
				convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
			)
			.addTextDisplayComponents(new TextDisplayBuilder().setContent(message));

		await interaction.editReply({
			components: [successContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = SetupCommand;
