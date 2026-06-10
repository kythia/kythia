/**
 * @namespace: addons/music/commands/music/favorite/play.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { GuildMember, MessageFlags } = require('discord.js');

module.exports = {
	subcommand: true,
	slashCommand: (subcommand) =>
		subcommand
			.setName('play')
			.setDescription('🎶 Play all songs from your favorites.')
			.addBooleanOption((option) =>
				option
					.setName('append')
					.setDescription('Append the songs to the current queue.')
					.setRequired(false),
			),

	async execute(interaction, container) {
		const { client, member, guild } = interaction;
		const { t, musicHandlers, music } = container;

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
	},
};
