/**
 * @namespace: addons/leveling/commands/setting/channel.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class ChannelCommand extends BaseCommand {
	subcommand = true;
	permissions = [PermissionFlagsBits.ManageGuild];
	slashCommand = (subcommand) =>
		subcommand
			.setName('channel')
			.setDescription('Set channel for level up messages')
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription('Channel for level up messages')
					.setRequired(true),
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
		const targetChannel = interaction.options.getChannel('channel');
		const [serverSetting] = await ServerSetting.findOrCreateCache({
			where: {
				guildId,
			},
			defaults: {
				guildId,
				guildName,
			},
		});
		serverSetting.levelingChannelId = targetChannel.id;
		await serverSetting.save();
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'core.setting.setting.leveling.channel.set', {
				channel: `<#${targetChannel.id}>`,
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
exports.default = ChannelCommand;
