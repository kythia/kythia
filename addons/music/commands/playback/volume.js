/**
 * @namespace: addons/music/commands/playback/volume.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');
const { BaseCommand } = require('kythia-core');
class VolumeCommand extends BaseCommand {
	subcommand = true;
	slashCommand = (subcommand) =>
		subcommand
			.setName('volume')
			.setDescription('Set music volume')
			.addIntegerOption((option) =>
				option
					.setName('level')
					.setDescription('Volume level (1-1000)')
					.setRequired(true)
					.setMinValue(1)
					.setMaxValue(1000),
			);
	async execute(interaction) {
		const container = this.container;
		const { client, member, guild } = interaction;
		const { t, musicHandlers, helpers } = container;
		const { simpleContainer } = helpers.discord;
		if (!member?.voice?.channel) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(
						interaction,
						'music.helpers.index.music.voice.channel.not.found',
					),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		const player = client.poru.players.get(guild.id);
		if (!player) {
			const reply = await simpleContainer(
				interaction,
				await t(interaction, 'music.helpers.index.music.player.not.found'),
				{
					color: 'Red',
				},
			);
			return interaction.reply({
				components: reply,
				flags: MessageFlags.IsComponentsV2,
			});
		}
		if (member.voice.channel.id !== player.voiceChannel) {
			return interaction.reply({
				components: await simpleContainer(
					interaction,
					await t(interaction, 'music.helpers.index.music.required'),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}
		return musicHandlers.handleVolume(interaction, player);
	}
}
exports.default = VolumeCommand;
