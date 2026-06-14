/**
 * @namespace: addons/minecraft/commands/set/status-channel.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class StatusChannelCommand extends BaseCommand {
	guildOnly = true;

	subcommand = true;
	permissions = [PermissionFlagsBits.ManageGuild];

	slashCommand = (subcommand) =>
		subcommand
			.setName('status-channel')
			.setDescription('📢 Set a channel to display the Minecraft server status')
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription('Channel to display the server status')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, helpers, models } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const channel = interaction.options.getChannel('channel');

		const [serverSetting] = await ServerSetting.findOrCreateCache({
			where: { guildId: interaction.guild.id },
			defaults: {
				guildId: interaction.guild.id,
				guildName: interaction.guild.name,
			},
		});

		serverSetting.minecraftStatusChannelId = channel.id;
		await serverSetting.save();

		const components = await simpleContainer(
			interaction,
			await t(
				interaction,
				'core.setting.setting.minecraft.status.channel.set',
				{
					channel: `<#${channel.id}>`,
				},
			),
			{ color: 'Green' },
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = StatusChannelCommand;
