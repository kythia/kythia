/**
 * @namespace: addons/welcomer/commands/in-channel.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class InChannelCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('in-channel')
			.setDescription('Set the welcome channel')
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription('Channel where welcome messages are sent')
					.setRequired(true),
			);
	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { WelcomeSetting } = models;
		const { simpleContainer } = helpers.discord;
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const [welcomeSetting] = await WelcomeSetting.getOrCreateCache({
			guildId: interaction.guild.id,
		});
		const ch = interaction.options.getChannel('channel');
		welcomeSetting.welcomeInChannelId = ch.id;
		await welcomeSetting.save();
		const components = await simpleContainer(
			interaction,
			await t(interaction, 'welcomer.welcomer.in.channel.set', {
				channelId: ch.id,
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
exports.default = InChannelCommand;
