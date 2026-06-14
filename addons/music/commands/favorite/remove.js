/**
 * @namespace: addons/music/commands/favorite/remove.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 26.0.0-rc.1
 */

const { BaseCommand } = require('kythia-core');

class RemoveCommand extends BaseCommand {
	subcommand = true;

	slashCommand = (subcommand) =>
		subcommand
			.setName('remove')
			.setDescription('💖 Remove a song from your favorites.')
			.addStringOption((option) =>
				option
					.setName('name')
					.setDescription('The name of the song to remove.')
					.setRequired(true)
					.setAutocomplete(true),
			);

	async autocomplete(interaction) {
		const container = this.container;
		const run = async () => {
			const { models } = container;
			const { Favorite } = models;
			const focusedOption = interaction.options.getFocused(true);
			const focusedValue = focusedOption.value;

			try {
				const userFavorites = await Favorite.getAllCache({
					where: { userId: interaction.user.id },
					limit: 25,
					cacheTags: [`Favorite:byUser:${interaction.user.id}`],
				});
				if (!userFavorites) return interaction.respond([]);
				const filteredChoices = userFavorites
					.map((favorite) => favorite.title)
					.filter((name) =>
						name.toLowerCase().includes(focusedValue.toLowerCase()),
					)
					.map((name) => ({
						name: `🎵 ${String(name).length > 95 ? `${String(name).slice(0, 92)}...` : name}`,
						value: String(name).slice(0, 100),
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

		return musicHandlers.handleFavorite(
			interaction,
			client.poru.players.get(guild.id),
		);
	}
}

exports.default = RemoveCommand;
