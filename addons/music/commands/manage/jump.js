/**
 * @namespace: addons/music/commands/manage/jump.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class JumpCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('jump')
			.setDescription('🐇 Jump to a specific song in the queue')
			.addIntegerOption((option) =>
				option
					.setName('position')
					.setDescription('The position in the queue to jump to')
					.setRequired(true)
					.setMinValue(1),
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

		return musicHandlers.handleJump(interaction, player);
	}
}

exports.default = JumpCommand;
