/**
 * @namespace: addons/music/commands/music.js
 * @type: Command
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */
const { SlashCommandBuilder, EmbedBuilder, GuildMember, PermissionFlagsBits, InteractionContextType } = require('discord.js');
const Favorite = require('../database/models/Favorite');
const { Playlist } = require('../database/models');
const {
    handlePlay,
    handlePause,
    handleResume,
    handleSkip,
    handleStop,
    handleQueue,
    handleNowPlaying,
    handleLoop,
    handleAutoplay,
    handleVolume,
    handleShuffle,
    handleBack,
    handleFilter,
    handleRemove,
    handleMove,
    handleClear,
    handleSeek,
    handlePlaylist,
    handleLyrics,
    handleFavorite,
    handleDownload,
} = require('../helpers/handlers');
const { formatDuration, hasControlPermission } = require('../helpers');
const { t } = require('@utils/translator');
const logger = require('@utils/logger');
const { guildStates } = require('../helpers/musicManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('🎵 Full music command suite using Lavalink')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('play')
                .setDescription('🎶 Play a song or add it to the queue')
                .addStringOption((option) =>
                    option
                        .setName('search')
                        .setDescription('Song title or URL (YouTube, Spotify (can be playlist link))')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand((subcommand) => subcommand.setName('pause').setDescription('⏸️ Pause the currently playing song'))
        .addSubcommand((subcommand) => subcommand.setName('resume').setDescription('▶️ Resume the paused song'))
        .addSubcommand((subcommand) => subcommand.setName('skip').setDescription('⏭️ Skip the current song'))
        .addSubcommand((subcommand) => subcommand.setName('stop').setDescription('⏹️ Stop music and clear the queue'))
        .addSubcommand((subcommand) => subcommand.setName('queue').setDescription('📜 Show the current song queue'))
        .addSubcommand((subcommand) => subcommand.setName('nowplaying').setDescription('ℹ️ Show the currently playing song'))
        .addSubcommand((subcommand) => subcommand.setName('shuffle').setDescription('🔀 Shuffle the queue order'))
        .addSubcommand((subcommand) => subcommand.setName('back').setDescription('⏮️ Play the previous song'))
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
                            { name: '🔁 Queue', value: 'queue' }
                        )
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('volume')
                .setDescription('🔊 Set music volume')
                .addIntegerOption((option) =>
                    option.setName('level').setDescription('Volume level (1-1000)').setRequired(true).setMinValue(1).setMaxValue(1000)
                )
        )
        .addSubcommand((subcommand) => subcommand.setName('autoplay').setDescription('🔄 Enable or disable autoplay'))
        .addSubcommand((subcommand) => subcommand.setName('filter').setDescription('🎧 Apply audio filter (equalizer)'))
        .addSubcommand((subcommand) =>
            subcommand
                .setName('remove')
                .setDescription('🗑️ Remove a song from queue')
                .addIntegerOption((option) => option.setName('position').setDescription('Position in queue to remove').setRequired(true))
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('move')
                .setDescription('🔀 Move a song to different position')
                .addIntegerOption((option) => option.setName('from').setDescription('Current position').setRequired(true))
                .addIntegerOption((option) => option.setName('to').setDescription('New position').setRequired(true))
        )
        .addSubcommand((subcommand) => subcommand.setName('lyrics').setDescription('🎤 Show the lyrics of the currently playing song'))
        .addSubcommandGroup((subcommandGroup) =>
            subcommandGroup
                .setName('playlist')
                .setDescription('Manage your personal music playlists.')
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('save') // <--- Ganti dari 'create'
                        .setDescription('Saves the current queue as a new playlist.')
                        .addStringOption((option) =>
                            option.setName('name').setDescription('The name for your new playlist.').setRequired(true)
                        )
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
                                .setAutocomplete(true)
                        )
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
                                .setAutocomplete(true)
                        )
                )
                .addSubcommand((subcommand) => subcommand.setName('list').setDescription('Shows all of your saved playlists.'))
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('delete')
                        .setDescription('Deletes one of your playlists.')
                        .addStringOption((option) =>
                            option
                                .setName('name')
                                .setDescription('The name of the playlist to delete.')
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
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
                                .setAutocomplete(true)
                        )
                        .addStringOption((option) =>
                            option.setName('new_name').setDescription('The new name of the playlist.').setRequired(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('track-remove')
                        .setDescription('Removes a track from one of your playlists.')
                        .addStringOption((option) =>
                            option
                                .setName('name')
                                .setDescription('The name of the playlist to remove the track from.')
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                        .addIntegerOption((option) =>
                            option.setName('position').setDescription('The position of the track to remove.').setRequired(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('track-list')
                        .setDescription('Shows the list of tracks in a playlist.')
                        .addStringOption((option) =>
                            option
                                .setName('name')
                                .setDescription('The name of the playlist to show the list of tracks from.')
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
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
                                .setAutocomplete(true)
                        )
                        .addStringOption((option) =>
                            option.setName('search').setDescription('The song title or URL to add.').setRequired(true).setAutocomplete(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('import')
                        .setDescription(`Import Playlist from ${kythia.bot.name} playlist code or external services like Spotify.`)
                        .addStringOption((option) =>
                            option
                                .setName('code')
                                .setDescription(`${kythia.bot.name} playlist code or Spotify URL to import.`)
                                .setRequired(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('share')
                        .setDescription(`Share ${kythia.bot.name} playlist with others.`)
                        .addStringOption((option) =>
                            option
                                .setName('name')
                                .setDescription(`The name of the ${kythia.bot.name} playlist to share.`)
                                .setRequired(true)
                                .setAutocomplete(true)
                        )
                )
        )
        .addSubcommand((subcommand) => subcommand.setName('clear').setDescription('🗑️ Clears the current queue.'))
        .addSubcommand((subcommand) =>
            subcommand
                .setName('seek')
                .setDescription('⏩ Seeks to a specific time in the current song.')
                .addIntegerOption((option) =>
                    option.setName('time').setDescription('The time to seek to in seconds. eg. 10 30').setRequired(true).setMinValue(0)
                )
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
                            option.setName('append').setDescription('Append the songs to the current queue.').setRequired(false)
                        )
                )
                .addSubcommand((subcommand) => subcommand.setName('list').setDescription('🌟 Show your favorite songs.'))
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('add')
                        .setDescription('💖 Add a song to your favorites.')
                        .addStringOption((option) =>
                            option.setName('search').setDescription('The song title or URL to add.').setRequired(true).setAutocomplete(true)
                        )
                )
                .addSubcommand((subcommand) =>
                    subcommand
                        .setName('remove')
                        .setDescription('💖 Remove a song from your favorites.')
                        .addStringOption((option) =>
                            option.setName('name').setDescription('The name of the song to remove.').setRequired(true).setAutocomplete(true)
                        )
                )
        )
        // .addSubcommand(subcommand =>
        //   subcommand
        //     .setName('download')
        //     .setDescription('📥 Download the currently playing song.')
        // )
        .setContexts(InteractionContextType.Guild),
    cooldown: 15,
    permissions: [
        PermissionFlagsBits.Speak,
        PermissionFlagsBits.Connect,
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
    ],
    botPermissions: [PermissionFlagsBits.Speak, PermissionFlagsBits.Connect, PermissionFlagsBits.SendMessages],
    isInMainGuild: true,
    defaultArgument: 'search',
    /**
     * 🔎 Handles autocomplete for the 'play' subcommand.
     * Suggests top YouTube search results based on user input.
     * @param {import('discord.js').AutocompleteInteraction} interaction
     * @param {import('discord.js').Client} client
     */
    async autocomplete(interaction, container) {
        const { client } = container;
        const focusedOption = interaction.options.getFocused(true);
        const focusedValue = focusedOption.value;
        const subcommand = interaction.options.getSubcommand(false);
        const subcommandgroup = interaction.options.getSubcommandGroup(false);

        // Autocomplete for song search (play, track-add, favorite add)
        if (
            (focusedOption.name === 'search' && (subcommand === 'play' || subcommand === 'track-add')) ||
            (subcommandgroup === 'favorite' && subcommand === 'add' && focusedOption.name === 'search')
        ) {
            if (focusedValue.toLowerCase().includes('spotify')) {
                const truncatedUrl = focusedValue.length > 50 ? focusedValue.slice(0, 47) + '...' : focusedValue;
                return interaction.respond([
                    {
                        name: `🎵 Play Spotify: ${truncatedUrl}`,
                        value: focusedValue,
                    },
                ]);
            } else if (focusedValue.toLowerCase().includes('youtube')) {
                const truncatedUrl = focusedValue.length > 50 ? focusedValue.slice(0, 47) + '...' : focusedValue;
                return interaction.respond([
                    {
                        name: `🎵 Play Youtube: ${truncatedUrl}`,
                        value: focusedValue,
                    },
                ]);
            } else if (/^https?:\/\//.test(focusedValue)) {
                const truncatedUrl = focusedValue.length > 60 ? focusedValue.slice(0, 57) + '...' : focusedValue;
                return interaction.respond([
                    {
                        name: `🎵 Play from URL: ${truncatedUrl}`,
                        value: focusedValue,
                    },
                ]);
            }

            if (!client._musicAutocompleteCache) client._musicAutocompleteCache = new Map();
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
                logger.error('Autocomplete search failed: client.poru or client.poru.resolve is undefined');
                return interaction.respond([]);
            }

            try {
                let source = kythia.addons.music.defaultPlatform || 'ytsearch';
                const res = await client.poru.resolve({ query: focusedValue, source: source, requester: interaction.user });
                if (!res || !res.tracks || !Array.isArray(res.tracks) || res.tracks.length === 0) {
                    return interaction.respond([]);
                }
                const choices = res.tracks.slice(0, kythia.addons.music.autocompleteLimit).map((choice) => ({
                    name: `🎵 ${choice.info.title.length > 80 ? choice.info.title.slice(0, 77) + '…' : choice.info.title} [${formatDuration(choice.info.length)}]`,
                    value: choice.info.uri,
                }));
                searchCache.set(focusedValue, choices);
                return interaction.respond(choices);
            } catch (e) {
                logger.error('Autocomplete search failed:', e && e.stack ? e.stack : e);
                return interaction.respond([]);
            }
        }

        // Autocomplete for playlist name
        if (subcommandgroup === 'playlist' && focusedOption.name === 'name') {
            try {
                const userPlaylists = await Playlist.getAllCache({
                    where: { userId: interaction.user.id },
                    limit: 25,
                });
                if (!userPlaylists) return interaction.respond([]);
                const filteredChoices = userPlaylists
                    .map((playlist) => playlist.name)
                    .filter((name) => name.toLowerCase().includes(focusedValue.toLowerCase()))
                    .map((name) => ({ name: `🎵 ${name}`, value: name }));
                return interaction.respond(filteredChoices.slice(0, 25));
            } catch (error) {
                logger.error('Playlist autocomplete error:', error);
                return interaction.respond([]);
            }
        }

        // Autocomplete for favorite song name
        if (subcommandgroup === 'favorite' && focusedOption.name === 'name') {
            try {
                const userFavorites = await Favorite.getAllCache({
                    where: { userId: interaction.user.id },
                    limit: 25,
                });
                if (!userFavorites) return interaction.respond([]);
                const filteredChoices = userFavorites
                    .map((favorite) => favorite.title)
                    .filter((name) => name.toLowerCase().includes(focusedValue.toLowerCase()))
                    .map((name) => ({
                        name: `🎵 ${name}`,
                        value: String(name).slice(0, 100),
                    }));
                return interaction.respond(filteredChoices.slice(0, 25));
            } catch (error) {
                logger.error('Favorite autocomplete error:', error);
                return interaction.respond([]);
            }
        }
    },

    /**
     * 🏷️ Main command executor for all subcommands.
     * Handles permission checks and delegates to the appropriate handler.
     * @param {import('discord.js').ChatInputCommandInteraction} interaction
     */
    async execute(interaction) {
        const { client, member, guild, options, channel } = interaction;
        const subcommand = options.getSubcommand();
        const subcommandGroup = options.getSubcommandGroup(false) || false;

        if (!(member instanceof GuildMember) || !member.voice.channel) {
            return await interaction.reply({ content: await t(interaction, 'music_music_voice_channel_not_found'), ephemeral: true });
        }

        // Poru: get player by guildId
        const player = client.poru.players.get(guild.id);

        if (subcommandGroup && subcommandGroup === 'playlist') {
            return handlePlaylist(interaction, player);
        }

        if (subcommandGroup && subcommandGroup === 'favorite') {
            return handleFavorite(interaction, player);
        }

        if (!subcommandGroup && subcommand == 'play') {
            return handlePlay(interaction);
        }
        // Require active player for other commands
        if (!player) {
            return interaction.reply({ content: await t(interaction, 'music_music_player_not_found'), ephemeral: true });
        }
        if (member.voice.channel.id !== player.voiceChannel) {
            return interaction.reply({ content: await t(interaction, 'music_music_required'), ephemeral: true });
        }
        const everyoneCommandHandlers = {
            nowplaying: handleNowPlaying,
            lyrics: handleLyrics,
            queue: handleQueue,
        };

        if (everyoneCommandHandlers[subcommand]) {
            return everyoneCommandHandlers[subcommand](interaction, player);
        }

        if (!hasControlPermission(interaction, player)) {
            return interaction.reply({
                content: await t(interaction, 'music_helpers_musicManager_music_permission_denied'),
                ephemeral: true,
            });
        }

        // Command handler mapping
        const originalRequesterCommandHandlers = {
            pause: handlePause,
            resume: handleResume,
            skip: handleSkip,
            stop: handleStop,
            loop: handleLoop,
            autoplay: handleAutoplay,
            volume: handleVolume,
            shuffle: handleShuffle,
            filter: handleFilter,
            // 'back': handleBack,
            remove: handleRemove,
            move: handleMove,
            clear: handleClear,
            seek: handleSeek,
            download: handleDownload,
        };

        if (originalRequesterCommandHandlers[subcommand]) {
            return originalRequesterCommandHandlers[subcommand](interaction, player);
        } else if (subcommand === 'back') {
            return handleBack(interaction, player, guildStates);
        } else {
            return interaction.reply({ content: await t(interaction, 'music_music_subcommand_not_found'), ephemeral: true });
        }
    },
};
