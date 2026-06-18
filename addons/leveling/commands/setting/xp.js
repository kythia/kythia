/**
 * @namespace: addons/leveling/commands/setting/xp.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class XpCommand extends BaseCommand {
	subcommand = true;
	permissions = [PermissionFlagsBits.ManageGuild];
	slashCommand = (subcommand) =>
		subcommand
			.setName('xp')
			.setDescription('Set XP amount per message')
			.addIntegerOption((option) =>
				option
					.setName('xp')
					.setDescription('XP gained per message')
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
		const xp = interaction.options.getInteger('xp');
		const [serverSetting] = await ServerSetting.findOrCreateCache({
			where: {
				guildId,
			},
			defaults: {
				guildId,
				guildName,
			},
		});
		serverSetting.levelingXp = xp;
		await serverSetting.save();
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'core.setting.setting.leveling.xp.set', {
				xp,
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
exports.default = XpCommand;
