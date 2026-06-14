/**
 * @namespace: addons/music/commands/favorite/play.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { GuildMember, MessageFlags } = require('discord.js');

const { BaseCommand } = require('kythia-core');

class PlayCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('play')
			.setDescription('🎶 Play all songs from your favorites.')
			.addBooleanOption((option) =>
				option
					.setName('append')
					.setDescription('Append the songs to the current queue.')
					.setRequired(false),
			);

	async execute(interaction) {
		const container = this.container;
		const { client, member, guild } = interaction;
		const { t, musicHandlers } = container;

		if (!(member instanceof GuildMember) || !member.voice.channel) {
			return interaction.reply({
				content: await t(interaction, 'music.music.voice.channel.not.found'),
				flags: MessageFlags.Ephemeral,
			});
		}

		return musicHandlers.handleFavorite(
			interaction,
			client.poru.players.get(guild.id),
		);
	}
}

exports.default = PlayCommand;
