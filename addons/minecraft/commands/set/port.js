/**
 * @namespace: addons/minecraft/commands/set/port.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class PortCommand extends BaseCommand {
	guildOnly = true;
	subcommand = true;
	permissions = [PermissionFlagsBits.ManageGuild];
	slashCommand = (subcommand) =>
		subcommand
			.setName('port')
			.setDescription('Set the Minecraft server port for this guild')
			.addIntegerOption((option) =>
				option
					.setName('port')
					.setDescription('Minecraft server port (default: 25565)')
					.setRequired(true)
					.setMinValue(1)
					.setMaxValue(65535),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, helpers, models } = container;
		const { ServerSetting } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const port = interaction.options.getInteger('port');
		const [serverSetting] = await ServerSetting.findOrCreateCache({
			where: {
				guildId: interaction.guild.id,
			},
			defaults: {
				guildId: interaction.guild.id,
				guildName: interaction.guild.name,
			},
		});
		serverSetting.minecraftPort = port;
		await serverSetting.save();
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'core.setting.setting.minecraft.port.set', {
				port,
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
exports.default = PortCommand;
