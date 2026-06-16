/**
 * @namespace: addons/activity/commands/setup.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const {
	MessageFlags,
	ContainerBuilder,
	TextDisplayBuilder,
	PermissionFlagsBits,
} = require('discord.js');

const { BaseCommand } = require('kythia-core');

class SetupCommand extends BaseCommand {
	premiumLocked = 'cute';
	permissions = [PermissionFlagsBits.ManageGuild];

	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('setup')
			.setDescription('Enable or disable activity tracking for this server.')
			.addBooleanOption((option) =>
				option
					.setName('enabled')
					.setDescription('Turn activity tracking on or off.')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, kythiaConfig, helpers } = container;
		const { ServerSetting } = models;
		const { convertColor } = helpers.color;

		await interaction.deferReply();

		const enabled = interaction.options.getBoolean('enabled', true);
		const guildId = interaction.guildId;

		const [setting] = await ServerSetting.findOrCreateCache({
			where: {
				guildId,
			},
			defaults: {
				guildId,
				activityOn: false,
			},
		});

		setting.activityOn = enabled;
		setting.changed('activityOn', true);
		await setting.save();

		const successContainer = new ContainerBuilder()
			.setAccentColor(
				convertColor(kythiaConfig.bot.color, { from: 'hex', to: 'decimal' }),
			)
			.addTextDisplayComponents(
				new TextDisplayBuilder().setContent(
					await t(
						interaction,
						enabled
							? 'activity.commands.setup.enabled'
							: 'activity.commands.setup.disabled',
					),
				),
			);

		await interaction.editReply({
			components: [successContainer],
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = SetupCommand;
