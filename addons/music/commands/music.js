/**
 * @namespace: addons/music/commands/music.js
 * @type: Command
 * @copyright © 2026 kenndeclouv
 * @assistant graa & chaa
 * @version 1.0.0-rc
 */
const {
	GuildMember,
	MessageFlags,
	SlashCommandBuilder,
	PermissionFlagsBits,
	InteractionContextType,
} = require('discord.js');
const { formatTrackDuration, hasControlPermission } = require('../helpers');

module.exports = {
	slashCommand: new SlashCommandBuilder()
		.setName('music')
		.setDescription('🎵 Full music command suite using Lavalink')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('play')
				.setDescription('🎶 Play a song or add it to the queue')
				.addStringOption((option) =>
					option
						.setName('search')
						.setDescription(
							'Song title or URL (YouTube, Spotify (can be playlist link))',
						)
						.setRequired(true)
						.setAutocomplete(true),
				),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('pause')
				.setDescription('⏸️ Pause the currently playing song'),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName('resume').setDescription('▶️ Resume the paused song'),
		)
		.addSubcommand((subcommand) =>
			subcommand.setName('skip').setDescription('⏭️ Skip the current song'),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('stop')
				.setDescription('⏹️ Stop music and clear the queue'),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('queue')
				.setDescription('📜 Show the current song queue'),
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('nowplaying')
				.setDescription('ℹ️ Show the currently playing song'),
		)
		.addSubcommand((subcommand) =>
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
		)

		.addSubcommandGroup((group) =>
			group
				.setName('playback')
				.setDescription('Advanced playback controls')
				.addSubcommand((subcommand) =>
					subcommand.setName('back').setDescription('⏮️ Play the previous song'),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('replay')
						.setDescription('🔄 Replay the current song'),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('seek')
						.setDescription('⏩ Seeks to a specific time in the current song.')
						.addStringOption((option) =>
							option
								.setName('time')
								.setDescription('The time to seek to. eg. 10, 2:30, 1:20:30')
								.setRequired(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('loop')
						.setDescription('🔁 Set repeat mode')
						.addStringOption((option) =>
							option
								.setName('mode')
								.setDescription('Choose repeat mode')
								.setRequired(true)
								.addChoices(
									{ name: '❌ Off', value: 'none' },
									{ name: '🔂 Track', value: 'track' },
									{ name: '🔁 Queue', value: 'queue' },
								),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('autoplay')
						.setDescription('🔄 Enable or disable autoplay')
						.addStringOption((option) =>
							option
								.setName('status')
								.setDescription('Enable or disable autoplay')
								.addChoices(
									{ name: 'Enable', value: 'enable' },
									{ name: 'Disable', value: 'disable' },
								),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('shuffle')
						.setDescription('🔀 Shuffle the queue order'),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('volume')
						.setDescription('🔊 Set music volume')
						.addIntegerOption((option) =>
							option
								.setName('level')
								.setDescription('Volume level (1-1000)')
								.setRequired(true)
								.setMinValue(1)
								.setMaxValue(1000),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('filter')
						.setDescription('🎧 Apply audio filter (equalizer)'),
				),
		)

		.addSubcommandGroup((group) =>
			group
				.setName('manage')
				.setDescription('Manage the music queue')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('remove')
						.setDescription('🗑️ Remove a song from queue')
						.addIntegerOption((option) =>
							option
								.setName('position')
								.setDescription('Position in queue to remove')
								.setRequired(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('move')
						.setDescription('🔀 Move a song to different position')
						.addIntegerOption((option) =>
							option
								.setName('from')
								.setDescription('Current position')
								.setRequired(true),
						)
						.addIntegerOption((option) =>
							option
								.setName('to')
								.setDescription('New position')
								.setRequired(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('clear')
						.setDescription('🗑️ Clears the current queue.'),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('jump')
						.setDescription('🐇 Jump to a specific song in the queue')
						.addIntegerOption((option) =>
							option
								.setName('position')
								.setDescription('The position in the queue to jump to')
								.setRequired(true)
								.setMinValue(1),
						),
				),
		)

		.addSubcommandGroup((group) =>
			group
				.setName('utils')
				.setDescription('Various music utilities')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('join')
						.setDescription('🌸 Make Kythia Join the voice channel'),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('leave')
						.setDescription('🌸 Make Kythia Leave the voice channel'),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('247')
						.setDescription(
							'🎧 Enable or disable 24/7 mode to keep the bot in the voice channel.',
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('grab')
						.setDescription('📥 Grab the current song to your DMs'),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('lyrics')
						.setDescription('🎤 Show the lyrics of the currently playing song'),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('karaoke')
						.setDescription('🎤 Toggle live synced karaoke lyrics'),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('history')
						.setDescription('📜 Show the history of played songs'),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('download')
						.setDescription('📥 Download the current song')
						.addStringOption((option) =>
							option
								.setName('query')
								.setDescription(
									'The song to download (optional, if not specified, the current song will be downloaded)',
								)
								.setRequired(false),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('repair')
						.setDescription('🔧 Repair a stuck or broken music session'),
				),
		)

		.addSubcommandGroup((subcommandGroup) =>
			subcommandGroup
				.setName('playlist')
				.setDescription('Manage your personal music playlists.')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('save')
						.setDescription('Saves the current queue as a new playlist.')
						.addStringOption((option) =>
							option
								.setName('name')
								.setDescription('The name for your new playlist.')
								.setRequired(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('load')
						.setDescription('Clears the queue and loads a playlist.')
						.addStringOption((option) =>
							option
								.setName('name')
								.setDescription('The name of the playlist to load.')
								.setRequired(true)
								.setAutocomplete(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('append')
						.setDescription('Adds songs from a playlist to the current queue.')
						.addStringOption((option) =>
							option
								.setName('name')
								.setDescription('The name of the playlist to append.')
								.setRequired(true)
								.setAutocomplete(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('list')
						.setDescription('Shows all of your saved playlists.'),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('delete')
						.setDescription('Deletes one of your playlists.')
						.addStringOption((option) =>
							option
								.setName('name')
								.setDescription('The name of the playlist to delete.')
								.setRequired(true)
								.setAutocomplete(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('rename')
						.setDescription('Renames one of your playlists.')
						.addStringOption((option) =>
							option
								.setName('name')
								.setDescription('The name of the playlist to rename.')
								.setRequired(true)
								.setAutocomplete(true),
						)
						.addStringOption((option) =>
							option
								.setName('new_name')
								.setDescription('The new name of the playlist.')
								.setRequired(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('track-remove')
						.setDescription('Removes a track from one of your playlists.')
						.addStringOption((option) =>
							option
								.setName('name')
								.setDescription(
									'The name of the playlist to remove the track from.',
								)
								.setRequired(true)
								.setAutocomplete(true),
						)
						.addIntegerOption((option) =>
							option
								.setName('position')
								.setDescription('The position of the track to remove.')
								.setRequired(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('track-list')
						.setDescription('Shows the list of tracks in a playlist.')
						.addStringOption((option) =>
							option
								.setName('name')
								.setDescription(
									'The name of the playlist to show the list of tracks from.',
								)
								.setRequired(true)
								.setAutocomplete(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('track-add')
						.setDescription('Adds a single song to one of your playlists.')
						.addStringOption((option) =>
							option
								.setName('name')
								.setDescription('The name of the playlist to add the song to.')
								.setRequired(true)
								.setAutocomplete(true),
						)
						.addStringOption((option) =>
							option
								.setName('search')
								.setDescription('The song title or URL to add.')
								.setRequired(true)
								.setAutocomplete(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('import')
						.setDescription(
							`Import Playlist from Kythia playlist code or external services like Spotify.`,
						)
						.addStringOption((option) =>
							option
								.setName('code')
								.setDescription(
									`Kythia playlist code or Spotify URL to import.`,
								)
								.setRequired(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('share')
						.setDescription(`Share Kythia playlist with others.`)
						.addStringOption((option) =>
							option
								.setName('name')
								.setDescription(`The name of the Kythia playlist to share.`)
								.setRequired(true)
								.setAutocomplete(true),
						),
				),
		)
		.addSubcommandGroup((subcommandGroup) =>
			subcommandGroup
				.setName('favorite')
				.setDescription('💖 Manage your favorite songs.')
				.addSubcommand((subcommand) =>
					subcommand
						.setName('play')
						.setDescription('🎶 Play all songs from your favorites.')
						.addBooleanOption((option) =>
							option
								.setName('append')
								.setDescription('Append the songs to the current queue.')
								.setRequired(false),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('list')
						.setDescription('🌟 Show your favorite songs.'),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('add')
						.setDescription('💖 Add a song to your favorites.')
						.addStringOption((option) =>
							option
								.setName('search')
								.setDescription('The song title or URL to add.')
								.setRequired(true)
								.setAutocomplete(true),
						),
				)
				.addSubcommand((subcommand) =>
					subcommand
						.setName('remove')
						.setDescription('💖 Remove a song from your favorites.')
						.addStringOption((option) =>
							option
								.setName('name')
								.setDescription('The name of the song to remove.')
								.setRequired(true)
								.setAutocomplete(true),
						),
				),
		)
		.setContexts(InteractionContextType.Guild),
	cooldown: 15,
	permissions: [
		PermissionFlagsBits.Speak,
		PermissionFlagsBits.Connect,
		PermissionFlagsBits.ViewChannel,
		PermissionFlagsBits.SendMessages,
	],
	botPermissions: [
		PermissionFlagsBits.Speak,
		PermissionFlagsBits.Connect,
		PermissionFlagsBits.SendMessages,
	],
	aliases: ['music', 'm'],
	defaultArgument: 'search',

	/**
	 * 🔎 Handles autocomplete for the 'play' subcommand.
	 * Suggests top YouTube search results based on user input.
	 * @param {import('discord.js').AutocompleteInteraction} interaction
	 * @param {import('discord.js').Client} client
	 */
	async autocomplete(interaction, container) {
		const { client, logger, models, kythiaConfig } = container;
		const { Favorite, Playlist } = models;
		const focusedOption = interaction.options.getFocused(true);
		const focusedValue = focusedOption.value;
		const subcommand = interaction.options.getSubcommand(false);
		const subcommandgroup = interaction.options.getSubcommandGroup(false);

		if (
			(focusedOption.name === 'search' &&
				(subcommand === 'play' || subcommand === 'track-add')) ||
			(subcommandgroup === 'favorite' &&
				subcommand === 'add' &&
				focusedOption.name === 'search')
		) {
			if (focusedValue.toLowerCase().includes('spotify')) {
				const truncatedUrl =
					focusedValue.length > 50
						? `${focusedValue.slice(0, 47)}...`
						: focusedValue;
				return interaction.respond([
					{
						name: `🎵 Play Spotify: ${truncatedUrl}`,
						value:
							focusedValue.length > 100
								? focusedValue.slice(0, 100)
								: focusedValue,
					},
				]);
			} else if (focusedValue.toLowerCase().includes('youtube')) {
				const truncatedUrl =
					focusedValue.length > 50
						? `${focusedValue.slice(0, 47)}...`
						: focusedValue;
				return interaction.respond([
					{
						name: `🎵 Play Youtube: ${truncatedUrl}`,
						value:
							focusedValue.length > 100
								? focusedValue.slice(0, 100)
								: focusedValue,
					},
				]);
			} else if (/^https?:\/\//.test(focusedValue)) {
				const truncatedUrl =
					focusedValue.length > 60
						? `${focusedValue.slice(0, 57)}...`
						: focusedValue;
				return interaction.respond([
					{
						name: `🎵 Play from URL: ${truncatedUrl}`,
						value:
							focusedValue.length > 100
								? focusedValue.slice(0, 100)
								: focusedValue,
					},
				]);
			}

			if (!client._musicAutocompleteCache)
				client._musicAutocompleteCache = new Map();
			const searchCache = client._musicAutocompleteCache;

			if (searchCache.has(focusedValue)) {
				return interaction.respond(searchCache.get(focusedValue));
			}

			if (!focusedValue || focusedValue.trim().length === 0) {
				return interaction.respond([]);
			}

			if (/^https?:\/\//.test(focusedValue)) {
				return interaction.respond([]);
			}

			if (!client.poru || typeof client.poru.resolve !== 'function') {
				logger.error(
					'Autocomplete search failed: client.poru or client.poru.resolve is undefined',
					{ label: 'music' },
				);
				return interaction.respond([]);
			}

			try {
				const source = kythiaConfig.addons.music.defaultPlatform || 'ytsearch';
				const res = await client.poru.resolve({
					query: focusedValue,
					source: source,
					requester: interaction.user,
				});
				if (
					!res?.tracks ||
					!Array.isArray(res.tracks) ||
					res.tracks.length === 0
				) {
					return interaction.respond([]);
				}
				const choices = res.tracks
					.slice(0, kythiaConfig.addons.music.autocompleteLimit)
					.map((track) => ({
						name: `🎵 ${track.info.title.length > 80 ? `${track.info.title.slice(0, 77)}…` : track.info.title} [${formatTrackDuration(track.info.length)}]`,
						value:
							(track.info.uri || '').length > 100
								? track.info.uri.slice(0, 100)
								: track.info.uri || '',
					}));
				searchCache.set(focusedValue, choices);
				return interaction.respond(choices);
			} catch (e) {
				logger.error(`Autocomplete search failed: ${e.message || e}`, {
					label: 'music',
				});
				return interaction.respond([]);
			}
		}

		if (subcommandgroup === 'playlist' && focusedOption.name === 'name') {
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
						value: name.length > 100 ? name.slice(0, 100) : name,
					}));
				return interaction.respond(filteredChoices.slice(0, 25));
			} catch (error) {
				logger.error(`Playlist autocomplete error: ${error.message || error}`, {
					label: 'music',
				});
				return interaction.respond([]);
			}
		}

		if (subcommandgroup === 'favorite' && focusedOption.name === 'name') {
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
			} catch (error) {
				logger.error(`Favorite autocomplete error: ${error.message || error}`, {
					label: 'music',
				});
				return interaction.respond([]);
			}
		}

		if (subcommand === 'radio' && focusedOption.name === 'search') {
			if (!client._radioAutocompleteCache)
				client._radioAutocompleteCache = new Map();
			if (client._radioAutocompleteCache.has(focusedValue)) {
				return interaction.respond(
					client._radioAutocompleteCache.get(focusedValue),
				);
			}

			if (!focusedValue || focusedValue.trim().length === 0) {
				return interaction.respond([]);
			}

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
					const country = station.countrycode || '🌐';
					const bitrate = station.bitrate || 0;

					const finalName = `📻 ${name} [${country}|${bitrate} k]`;
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
		}
	},

	/**
	 * 🏷️ Main command executor for all subcommands.
	 * Handles permission checks and delegates to the appropriate handler.
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 */
	async execute(interaction, container) {
		const { client, member, guild, options } = interaction;
		const { t, music, musicHandlers } = container;
		// const { isOwner } = helpers.discord;

		if (!(member instanceof GuildMember) || !member.voice.channel) {
			return interaction.reply({
				content: await t(interaction, 'music.music.voice.channel.not.found'),
				flags: MessageFlags.Ephemeral,
			});
		}

		const player = client.poru.players.get(guild.id);
		const subcommand = options.getSubcommand();
		const group = options.getSubcommandGroup(false);

		const dispatchKey = group || subcommand;

		const creationHandlers = {
			playlist: musicHandlers.handlePlaylist,
			favorite: musicHandlers.handleFavorite,
			play: musicHandlers.handlePlay,
			radio: musicHandlers.handleRadio,
			join: musicHandlers.handleJoin,

			utils: (i, p) => {
				const sub = i.options.getSubcommand();
				if (sub === 'join') return musicHandlers.handleJoin(i, p);
				if (sub === 'leave') return musicHandlers.handleLeave(i, p);
				if (sub === '247') return musicHandlers.handle247(i, p);

				if (sub === 'grab') return musicHandlers.handleGrab(i, p);
				if (sub === 'lyrics') return musicHandlers.handleLyrics(i, p);
				if (sub === 'karaoke') return musicHandlers.handleKaraoke(i, p);
				if (sub === 'history')
					return musicHandlers.handleHistory(i, p, music.guildStates);

				if (sub === 'download') return musicHandlers.handleDownload(i, p);
				if (sub === 'repair') return musicHandlers.handleRepair(i, p);
			},
		};

		if (creationHandlers[dispatchKey]) {
			return creationHandlers[dispatchKey](interaction, player);
		}

		if (!player) {
			const reply = await this.simpleContainer(
				interaction,
				await this.t(interaction, 'music.music.player.not.found'),
				{ color: 'Red' },
			);

			return interaction.reply({
				components: reply.components,
				flags: MessageFlags.IsComponentsV2,
			});
		}

		if (member.voice.channel.id !== player.voiceChannel) {
			return interaction.reply({
				content: await t(interaction, 'music.music.required'),
				flags: MessageFlags.Ephemeral,
			});
		}

		const topLevelHandlers = {
			nowplaying: musicHandlers.handleNowPlaying,
			queue: musicHandlers.handleQueue,
			pause: musicHandlers.handlePause,
			resume: musicHandlers.handleResume,
			skip: musicHandlers.handleSkip,
			stop: musicHandlers.handleStop,
		};

		const groupHandlers = {
			playback: (i, p) => {
				const sub = i.options.getSubcommand();
				const map = {
					back: () => musicHandlers.handleBack(i, p, music.guildStates),
					replay: musicHandlers.handleReplay,
					seek: musicHandlers.handleSeek,
					loop: musicHandlers.handleLoop,
					autoplay: musicHandlers.handleAutoplay,
					shuffle: musicHandlers.handleShuffle,
					volume: musicHandlers.handleVolume,
					filter: musicHandlers.handleFilter,
				};
				if (map[sub])
					return typeof map[sub] === 'function' ? map[sub](i, p) : map[sub];
			},
			manage: (i, p) => {
				const sub = i.options.getSubcommand();
				const map = {
					remove: musicHandlers.handleRemove,
					move: musicHandlers.handleMove,
					clear: musicHandlers.handleClear,
					jump: musicHandlers.handleJump,
				};
				if (map[sub]) return map[sub](i, p);
			},
		};

		if (topLevelHandlers[subcommand] && !group) {
			if (!hasControlPermission(interaction, player)) {
				return interaction.reply({
					content: await t(
						interaction,
						'music.helpers.musicManager.music.permission.denied',
					),
					flags: MessageFlags.Ephemeral,
				});
			}
			return topLevelHandlers[subcommand](interaction, player);
		}

		if (groupHandlers[group]) {
			if (['playback', 'manage'].includes(group)) {
				if (!hasControlPermission(interaction, player)) {
					return interaction.reply({
						content: await t(
							interaction,
							'music.helpers.musicManager.music.permission.denied',
						),
						flags: MessageFlags.Ephemeral,
					});
				}
			}
			return groupHandlers[group](interaction, player);
		}

		return interaction.reply({
			content: await t(interaction, 'music.music.subcommand.not.found'),
			flags: MessageFlags.Ephemeral,
		});
	},
};
