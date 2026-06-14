/**
 * @namespace: addons/welcomer/commands/out-channel.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class OutChannelCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('out-channel')
			.setDescription('👋 Set the farewell channel')
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription('Channel where farewell messages are sent')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { WelcomeSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [welcomeSetting] = await WelcomeSetting.getOrCreateCache({
			guildId: interaction.guild.id,
		});

		const ch = interaction.options.getChannel('channel');
		welcomeSetting.welcomeOutChannelId = ch.id;
		await welcomeSetting.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'welcomer.welcomer.out.channel.set', {
				channelId: ch.id,
			}),
			{ color: 'Green' },
		);

		return interaction.editReply({
			components,
			flags: MessageFlags.IsComponentsV2,
		});
	}
}

exports.default = OutChannelCommand;
