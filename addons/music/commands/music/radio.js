/**
 * @namespace: addons/music/commands/music/radio.js
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
			.setName('radio')
			.setDescription('📻 Search and play live radio stations worldwide')
			.addStringOption((option) =>
				option
					.setName('search')
					.setDescription(
						'Name of the radio station (e.g., Prambors, BBC, Lofi)',
					)
					.setRequired(true)
					.setAutocomplete(true),
			),

	async autocomplete(interaction, container) {
		const run = async () => {
			const { client } = container;
			const focusedOption = interaction.options.getFocused(true);
			const focusedValue = focusedOption.value;

			if (!client._radioAutocompleteCache)
				client._radioAutocompleteCache = new Map();
			if (client._radioAutocompleteCache.has(focusedValue))
				return interaction.respond(
					client._radioAutocompleteCache.get(focusedValue),
				);
			if (!focusedValue || focusedValue.trim().length === 0)
				return interaction.respond([]);

			try {
				const axios = require('axios');
				const response = await axios.get(
					`https://de1.api.radio-browser.info/json/stations/search?name=${encodeURIComponent(focusedValue)}&limit=20&hidebroken=true&order=clickcount&reverse=true`,
					{ timeout: 2000 },
				);
				if (!response.data || !Array.isArray(response.data))
					return interaction.respond([]);
				const choices = response.data.slice(0, 25).map((station) => {
					const name =
						station.name.length > 50
							? `${station.name.substring(0, 47)}...`
							: station.name;
					const finalName = `📻 ${name} [${station.countrycode || '🌐'}|${station.bitrate || 0} k]`;
					return {
						name:
							finalName.length > 100
								? `${finalName.slice(0, 97)}...`
								: finalName,
						value: String(station.stationuuid).slice(0, 100),
					};
				});
				client._radioAutocompleteCache.set(focusedValue, choices);
				setTimeout(
					() => client._radioAutocompleteCache.delete(focusedValue),
					60000,
				);
				return interaction.respond(choices);
			} catch (_e) {
				return interaction.respond([]);
			}
		};
		try {
			await run();
		} catch (error) {
			if (error.code === 10062 || error.message === 'Unknown interaction')
				return;
		}
	},

	async execute(interaction, container) {
		const { client, member, guild } = interaction;
		const { t, musicHandlers, music } = container;

		if (!(member instanceof GuildMember) || !member.voice.channel) {
			return interaction.reply({
				content: await t(interaction, 'music.music.voice.channel.not.found'),
				flags: MessageFlags.Ephemeral,
			});
		}

		return musicHandlers.handleRadio(
			interaction,
			client.poru.players.get(guild.id),
		);
	},
};
