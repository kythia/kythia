/**
 * @namespace: addons/booster/commands/channel.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class ChannelCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('channel')
			.setDescription('🚀 Set the booster channel')
			.addChannelOption((option) =>
				option
					.setName('channel')
					.setDescription('Channel where booster messages are sent')
					.setRequired(true),
			);

	async execute(interaction) {
		const container = this.container;
		const { t, models, helpers } = container;
		const { BoosterSetting } = models;
		const { simpleContainer } = helpers.discord;

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [boosterSetting] = await BoosterSetting.getOrCreateCache({
			guildId: interaction.guild.id,
		});

		const ch = interaction.options.getChannel('channel');
		boosterSetting.boosterChannelId = ch.id;
		boosterSetting.boosterOn = true;
		await boosterSetting.save();

		const components = await simpleContainer(
			interaction,
			await t(interaction, 'booster.booster.channel.set', {
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

exports.default = ChannelCommand;
