/**
 * @namespace: addons/music/commands/playlist/track-remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');

class TrackRemoveCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('track-remove')
			.setDescription('Removes a track from one of your playlists.')
			.addStringOption((option) =>
				option
					.setName('name')
					.setDescription('The name of the playlist to remove the track from.')
					.setRequired(true)
					.setAutocomplete(true),
			)
			.addIntegerOption((option) =>
				option
					.setName('position')
					.setDescription('The position of the track to remove.')
					.setRequired(true),
			);

	async autocomplete(interaction) {
		const container = this.container;
		const run = async () => {
			const { models } = container;
			const { Playlist } = models;
			const focusedOption = interaction.options.getFocused(true);
			const focusedValue = focusedOption.value;

			try {
				const userPlaylists = await Playlist.getAllCache({
					where: { userId: interaction.user.id },
					limit: 25,
					cacheTags: [`Playlist:byUser:${interaction.user.id}`],
				});
				if (!userPlaylists) return interaction.respond([]);
				const filteredChoices = userPlaylists
					.map((playlist) => playlist.name)
					.filter((name) =>
						name.toLowerCase().includes(focusedValue.toLowerCase()),
					)
					.map((name) => ({
						name: `🎵 ${name.length > 95 ? `${name.slice(0, 92)}...` : name}`,
						value: name.slice(0, 100),
					}));
				return interaction.respond(filteredChoices.slice(0, 25));
			} catch (_error) {
				return interaction.respond([]);
			}
		};
		try {
			await run();
		} catch (error) {
			if (error.code === 10062 || error.message === 'Unknown interaction')
				return;
		}
	}

	execute(interaction) {
		const container = this.container;
		const { client, guild } = interaction;
		const { musicHandlers } = container;

		return musicHandlers.handlePlaylist(
			interaction,
			client.poru.players.get(guild.id),
		);
	}
}

exports.default = TrackRemoveCommand;
