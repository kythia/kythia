/**
 * @namespace: addons/streak/commands/setting/nickname.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags, PermissionFlagsBits } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class NicknameCommand extends BaseCommand {
	subcommand = true;
	permissions = [PermissionFlagsBits.ManageGuild];
	slashCommand = (subcommand) =>
		subcommand
			.setName('nickname')
			.setDescription('Toggle auto-nickname for streak')
			.addStringOption((option) =>
				option
					.setName('status')
					.setDescription('Select status')
					.setRequired(true)
					.addChoices(
						{
							name: 'Enable',
							value: 'enable',
						},
						{
							name: 'Disable',
							value: 'disable',
						},
					),
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
		const status = interaction.options.getString('status');
		const [serverSetting] = await ServerSetting.findOrCreateCache({
			where: {
				guildId,
			},
			defaults: {
				guildId,
				guildName,
			},
		});
		serverSetting.streakNickname = status === 'enable';
		await serverSetting.save();
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'streak.streak.setting.nickname.set', {
				status: status === 'enable' ? 'Enabled' : 'Disabled',
			}),
			{
				color: status === 'enable' ? 'Green' : 'Red',
			},
		);
		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}
exports.default = NicknameCommand;
