/**
 * @namespace: addons/music/commands/playback/seek.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class SeekCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('seek')
			.setDescription('Seeks to a specific time in the current song.')
			.addStringOption((option) =>
				option
					.setName('time')
					.setDescription('The time to seek to. eg. 10, 2:30, 1:20:30')
					.setRequired(true),
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
					await t(interaction, 'music.music.voice.channel.not.found'),
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
				await t(interaction, 'music.music.player.not.found'),
				{ color: 'Red' },
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
					await t(interaction, 'music.music.required'),
					{
						color: 'Red',
					},
				),
				flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
			});
		}

		return musicHandlers.handleSeek(interaction, player);
	}
}

exports.default = SeekCommand;
