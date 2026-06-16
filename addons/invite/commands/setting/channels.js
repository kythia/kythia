/**
 * @namespace: addons/invite/commands/setting/channels.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ChannelsCommand extends BaseCommand {
	subcommand = true;
	permissions = [PermissionFlagsBits.ManageGuild];

	slashCommand = (subcommand) =>
		subcommand
			.setName('invite')
			.setDescription('📢 Set invite log channel')
			.addChannelOption((option) =>
				option.setName('channel').setDescription('Channel').setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const guildId = interaction.guild.id;
		const guildName = interaction.guild.name;
		const channel = interaction.options.getChannel('channel');

		const [serverSetting] = await ServerSetting.findOrCreateCache({
			where: { guildId },
			defaults: { guildId, guildName },
		});

		serverSetting.inviteChannelId = channel.id;
		await serverSetting.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'core.setting.setting.invite.channel.set', {
				channel: `<#${channel.id}>`,
			}),
			{ color: 'Green' },
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = ChannelsCommand;
