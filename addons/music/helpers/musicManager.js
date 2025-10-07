/**
 * @namespace: addons/music/helpers/musicManager.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    MessageFlags,
    ComponentType,
    Collection,
    SectionBuilder,
    ThumbnailBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
} = require('discord.js');
const { Poru } = require('poru');
const { createProgressBar, hasControlPermission } = require('.');
const convertColor = require('@utils/color');
const logger = require('@utils/logger');
const { t } = require('@utils/translator');
const { Spotify } = require('poru-spotify');
const {
    handleLyrics,
    handlePauseResume,
    handleSkip,
    handleStop,
    handleLoop,
    handleAutoplay,
    handleQueue,
    handleShuffle,
    handleFilter,
    handleFavorite,
} = require('./handlers');
const { setVoiceChannelStatus } = require('@src/utils/discord');

// Stores per-guild music state (previous tracks, last played, etc.)
const guildStates = new Map();

module.exports.guildStates = guildStates;

/**
 * Helper to edit the Now Playing message with an "ended" container.
 * Used in ALL ended track scenarios.
 * @param {object} player - The Poru player instance.
 * @param {object} track - The track that just ended (may be null).
 * @param {object} client - The Discord client.
 * @param {object} channel - The text channel (optional, will try to resolve from player).
 */
async function shutdownPlayerUI(player, track, client, channel) {
    try {
        if (!player.nowPlayingMessage?.editable) return;
        channel = channel || player.nowPlayingMessage.channel || (client && client.channels.cache.get(player.textChannel));
        let endedText, artistText, requestedByText, artworkUrl, title, url;
        if (track && track.info) {
            endedText = await t(channel, 'music_helpers_musicManager_manager_now_ended', {
                title: track.info.title,
                url: track.info.uri,
            });
            artistText = await t(channel, 'music_helpers_musicManager_manager_channel', { author: track.info.author });
            requestedByText = await t(channel, 'music_helpers_musicManager_manager_requested_by', {
                user: track.info.requester?.username
                    ? `${track.info.requester} (${track.info.requester.username})`
                    : `${track.info.requester}`,
            });
            artworkUrl = track.info.artworkUrl || track.info.image || null;
            title = track.info.title;
            url = track.info.uri;
        } else {
            endedText = await t(channel, 'music_helpers_musicManager_manager_simple');
            artistText = '';
            requestedByText = '';
            artworkUrl = null;
            title = '';
            url = '';
        }

        const container = new ContainerBuilder().setAccentColor(convertColor('Red', { from: 'discord', to: 'decimal' }));

        if (kythia.addons.music.artworkUrlStyle === 'banner' && artworkUrl) {
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems([artworkUrl ? new MediaGalleryItemBuilder().setURL(artworkUrl) : null])
            );
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(endedText));
        } else {
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(endedText))
                    .setThumbnailAccessory(artworkUrl ? new ThumbnailBuilder().setDescription(title).setURL(artworkUrl) : null)
            );
        }
        if (artistText) container.addTextDisplayComponents(new TextDisplayBuilder().setContent(artistText));
        if (requestedByText) container.addTextDisplayComponents(new TextDisplayBuilder().setContent(requestedByText));
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(await t(channel, 'common_container_footer', { username: client.user.username }))
        );

        await player.nowPlayingMessage.edit({
            components: [container],
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
        });
    } catch (e) {
        // Silent fail
    }
}

/**
 * 🎵 Initializes the Poru music manager and sets up all event listeners and Discord integration.
 * @param {object} bot - The bot object containing the Discord client.
 */
async function initializeMusicManager(bot) {
    const client = bot.client;

    // Validate environment variables for Spotify and Lavalink
    if (!kythia.addons.music.spotify.clientID || !kythia.addons.music.spotify.clientSecret) {
        logger.warn('⚠️ Spotify Client ID/Secret not found in .env. Spotify features will be disabled.');
    }
    if (!kythia.addons.music.lavalink.hosts || !kythia.addons.music.lavalink.ports || !kythia.addons.music.lavalink.passwords) {
        logger.warn('⚠️ Lavalink Host/Port/Password/Secure not found in .env. Music features will be disabled.');
    }

    // Setup Poru nodes
    const nodes = (kythia.addons.music.lavalink.hosts || 'localhost').split(',').map((host, i) => ({
        name: `kythia-${i}`,
        host: host.trim(),
        port: parseInt((kythia.addons.music.lavalink.ports || '2333').split(',')[i] || '2333', 10),
        password: (kythia.addons.music.lavalink.passwords || 'youshallnotpass').split(',')[i] || 'youshallnotpass',
        secure: ((kythia.addons.music.lavalink.secures || 'false').split(',')[i] || 'false').toLowerCase() === 'true',
    }));

    let plugins = [];

    const spotify = new Spotify({
        clientID: kythia.addons.music.spotify.clientID,
        clientSecret: kythia.addons.music.spotify.clientSecret,
    });

    if (kythia.addons.music.spotify.clientID && kythia.addons.music.spotify.clientSecret) {
        plugins.push(spotify);
    }
    let source = kythia.addons.music.defaultPlatform || 'ytsearch';
    const PoruOptions = {
        library: 'discord.js',
        defaultPlatform: source,
        plugins: plugins,
    };

    client.poru = new Poru(client, nodes, PoruOptions);

    // Add custom state to player
    client.poru.on('playerCreate', (player) => {
        player.autoplay = false;
        player.nowPlayingMessage = null;
        player.updateInterval = null;
        player._sendingNowPlaying = false;
        player._autoplayReference = null;
        player.playedTrackIdentifiers = new Set();
        player.buttonCollector = null;
    });

    // Poru node events
    client.poru.on('nodeConnect', (node) => logger.info(`🎚️  Node "${node.name}" connected.`));
    client.poru.on('nodeError', (node, error) => logger.info(`❌ Node "${node.name}" error: ${error.message}`));

    /**
     * ▶️ Handles when a new track starts playing.
     */
    client.poru.on('trackStart', async (player, track) => {
        if (!guildStates.has(player.guildId)) {
            guildStates.set(player.guildId, {
                previousTracks: [],
                lastPlayedTrack: null,
            });
        }

        const channel = client.channels.cache.get(player.textChannel);
        if (!channel) return;
        // Ambil nama lagu
        const songTitle = track.info && track.info.title ? track.info.title : 'Unknown';

        // Set status channel voice menjadi "playing: {namalagu}"
        try {
            await setVoiceChannelStatus(channel, `🎵 ${songTitle}`);
        } catch (e) {
            logger.error('❌ Failed to set voice channel status', e);
        }

        // Delete previous Now Playing embed if exists, to keep the player embed at the bottom
        if (player.nowPlayingMessage && player.nowPlayingMessage.deletable) {
            try {
                await player.nowPlayingMessage.delete().catch(() => {});
            } catch (e) {}
            player.nowPlayingMessage = null;
        }
        if (player.updateInterval) clearInterval(player.updateInterval);

        // Stop and dispose any previous collector
        if (player.buttonCollector) {
            try {
                player.buttonCollector.stop('newTrack');
            } catch (e) {}
            player.buttonCollector = null;
        }

        // Fetch recommended tracks for dropdown suggestion
        let recommendations = [];
        try {
            const searchUrl = `https://www.youtube.com/watch?v=${track.info.identifier}&list=RD${track.info.identifier}`;
            const res = await client.poru.resolve({ query: searchUrl, source: 'ytsearch', requester: track.info.requester });

            if (res.loadType === 'playlist' && res.tracks.length) {
                recommendations = res.tracks
                    .filter((t) => t.info.identifier !== track.info.identifier)
                    .slice(0, kythia.addons.music.suggestionLimit);
            }
        } catch (e) {
            logger.error('Failed to fetch recommendations for dropdown:', e);
        }

        player.playedTrackIdentifiers.add(track.info.identifier);

        // Now Playing text
        const nowPlayingText = await t(channel, 'music_helpers_musicManager_manager_playing', {
            title: track.info.title,
            url: track.info.uri,
        });
        const progress = createProgressBar(player);

        // Artist/Channel text
        const artistText = await t(channel, 'music_helpers_musicManager_manager_channel', { author: track.info.author });
        // Requested by text
        const requestedByText = await t(channel, 'music_helpers_musicManager_manager_requested_by', {
            user: track.info.requester?.username ? `${track.info.requester} (${track.info.requester.username})` : `${track.info.requester}`,
        });

        // --- DYNAMIC CONTROL BUTTONS ---
        function getFirstControlButtonRow(isPaused, disabled = false) {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('music_pause_resume')
                    [
                        typeof kythia.emojis.musicPlay !== 'undefined' && typeof kythia.emojis.musicPause !== 'undefined'
                            ? 'setEmoji'
                            : 'setLabel'
                    ](
                        typeof kythia.emojis.musicPlay !== 'undefined' && typeof kythia.emojis.musicPause !== 'undefined'
                            ? isPaused
                                ? kythia.emojis.musicPlay
                                : kythia.emojis.musicPause
                            : isPaused
                              ? 'Play'
                              : 'Pause'
                    )
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId('music_skip')
                    [typeof kythia.emojis.musicSkip !== 'undefined' ? 'setEmoji' : 'setLabel'](
                        typeof kythia.emojis.musicSkip !== 'undefined' ? kythia.emojis.musicSkip : 'Skip'
                    )
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId('music_stop')
                    [typeof kythia.emojis.musicStop !== 'undefined' ? 'setEmoji' : 'setLabel'](
                        typeof kythia.emojis.musicStop !== 'undefined' ? kythia.emojis.musicStop : 'Stop'
                    )
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId('music_loop')
                    [typeof kythia.emojis.musicLoop !== 'undefined' ? 'setEmoji' : 'setLabel'](
                        typeof kythia.emojis.musicLoop !== 'undefined' ? kythia.emojis.musicLoop : 'Loop'
                    )
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId('music_autoplay')
                    [typeof kythia.emojis.musicAutoplay !== 'undefined' ? 'setEmoji' : 'setLabel'](
                        typeof kythia.emojis.musicAutoplay !== 'undefined' ? kythia.emojis.musicAutoplay : 'Autoplay'
                    )
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled)
            );
        }
        function getSecondControlButtonRow(disabled = false) {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('music_lyrics')
                    [typeof kythia.emojis.musicLyrics !== 'undefined' ? 'setEmoji' : 'setLabel'](
                        typeof kythia.emojis.musicLyrics !== 'undefined' ? kythia.emojis.musicLyrics : 'Lyrics'
                    )
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId('music_queue')
                    [typeof kythia.emojis.musicQueue !== 'undefined' ? 'setEmoji' : 'setLabel'](
                        typeof kythia.emojis.musicQueue !== 'undefined' ? kythia.emojis.musicQueue : 'Queue'
                    )
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId('music_shuffle')
                    [typeof kythia.emojis.musicShuffle !== 'undefined' ? 'setEmoji' : 'setLabel'](
                        typeof kythia.emojis.musicShuffle !== 'undefined' ? kythia.emojis.musicShuffle : 'Shuffle'
                    )
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId('music_filter')
                    [typeof kythia.emojis.musicFilter !== 'undefined' ? 'setEmoji' : 'setLabel'](
                        typeof kythia.emojis.musicFilter !== 'undefined' ? kythia.emojis.musicFilter : 'Filter'
                    )
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId('music_favorite_add')
                    [typeof kythia.emojis.musicFavorite !== 'undefined' ? 'setEmoji' : 'setLabel'](
                        typeof kythia.emojis.musicFavorite !== 'undefined' ? kythia.emojis.musicFavorite : 'Favorite'
                    )
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(disabled)
            );
        }

        let firstControlButtonRow = getFirstControlButtonRow(false, false);
        let secondControlButtonRow = getSecondControlButtonRow(false);

        // const lyricsButtonRow = new ActionRowBuilder().addComponents(
        //     new ButtonBuilder().setCustomId('music_lyrics').setEmoji(kythia.emojis.musicLyrics).setStyle(ButtonStyle.Secondary).setDisabled(false)
        // );

        // Dropdown for recommendations
        let suggestionRow = null;
        if (recommendations.length > 0) {
            const suggestionOptions = [];
            for (const song of recommendations) {
                suggestionOptions.push({
                    label: song.info.title.substring(0, 95),
                    description: await t(channel, 'music_helpers_musicManager_manager_by', { author: song.info.author.substring(0, 90) }),
                    value: song.info.uri,
                });
            }
            const suggestionMenu = new StringSelectMenuBuilder()
                .setCustomId('music_suggest')
                .setPlaceholder(await t(channel, 'music_helpers_musicManager_manager_placeholder'))
                .addOptions(suggestionOptions)
                .setDisabled(false);
            suggestionRow = new ActionRowBuilder().addComponents(suggestionMenu);
        }

        const container = new ContainerBuilder().setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }));

        if (kythia.addons.music.artworkUrlStyle === 'banner') {
            if (track.info.artworkUrl || track.info.image) {
                container.addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems([new MediaGalleryItemBuilder().setURL(track.info.artworkUrl || track.info.image)])
                );
            }
            container.addTextDisplayComponents(new TextDisplayBuilder().setContent(nowPlayingText));
        } else {
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(nowPlayingText))
                    .setThumbnailAccessory(
                        track.info.artworkUrl || track.info.image
                            ? new ThumbnailBuilder().setDescription(track.info.title).setURL(track.info.artworkUrl || track.info.image)
                            : null
                    )
            );
        }
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(progress));
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(artistText));
        container.addTextDisplayComponents(new TextDisplayBuilder().setContent(requestedByText));
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
        if (suggestionRow) {
            container.addActionRowComponents(suggestionRow);
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
        }
        container.addActionRowComponents(firstControlButtonRow);
        container.addActionRowComponents(secondControlButtonRow);
        container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
        container.addTextDisplayComponents(
            new TextDisplayBuilder().setContent(await t(channel, 'common_container_footer', { username: client.user.username }))
        );

        const components = [container];

        // Prevent double embed by ensuring only one Now Playing message is sent per track
        if (player._sendingNowPlaying) return;
        player._sendingNowPlaying = true;

        try {
            // Always send a new Now Playing message so the player embed stays at the bottom
            const message = await channel.send({
                components: components,
                flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            });
            player.nowPlayingMessage = message;

            // --- BUTTON COLLECTOR LOGIC ---
            // Set up a collector for the Now Playing message
            const filter = (i) =>
                i.isButton() && i.message.id === message.id && i.guildId === player.guildId && i.customId.startsWith('music_');
            const collector = message.createMessageComponentCollector({
                componentType: ComponentType.Button,
                filter,
            });
            player.buttonCollector = collector;

            collector.on('collect', async (interaction) => {
                if (!interaction.member.voice.channelId || interaction.member.voice.channelId !== player.voiceChannel) {
                    return interaction.reply({
                        embeds: [new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'music_helpers_musicManager_manager_required'))],
                    });
                }
                if (!hasControlPermission(interaction, player)) {
                    return interaction.reply({
                        content: await t(interaction, 'music_helpers_musicManager_music_permission_denied'), // Buat terjemahan baru
                        ephemeral: true,
                    });
                }
                switch (interaction.customId) {
                    case 'music_pause_resume': {
                        await handlePauseResume(interaction, player);
                        break;
                    }
                    case 'music_skip': {
                        await handleSkip(interaction, player);
                        break;
                    }
                    case 'music_stop': {
                        await handleStop(interaction, player);
                        break;
                    }
                    case 'music_loop': {
                        await handleLoop(interaction, player);
                        break;
                    }
                    case 'music_autoplay': {
                        await handleAutoplay(interaction, player);
                        break;
                    }
                    case 'music_lyrics': {
                        await handleLyrics(interaction, player);
                        break;
                    }
                    case 'music_queue': {
                        await handleQueue(interaction, player);
                        break;
                    }
                    case 'music_shuffle': {
                        await handleShuffle(interaction, player);
                        break;
                    }
                    case 'music_filter': {
                        await handleFilter(interaction, player);
                        break;
                    }
                    case 'music_favorite_add': {
                        await handleFavorite(interaction, player);
                        break;
                    }
                }
            });
        } finally {
            player._sendingNowPlaying = false;
        }

        // Interval logic for updating the progress bar and control buttons
        player.updateInterval = setInterval(async () => {
            const currentTrack = player.currentTrack;
            if (!currentTrack || !player.nowPlayingMessage?.editable) return;

            // Dynamically update the play/pause button emoji
            const updatedFirstControlButtonRow = getFirstControlButtonRow(player.isPaused, false);
            const updatedSecondControlButtonRow = getSecondControlButtonRow(false);

            const updatedNowPlayingText = await t(channel, 'music_helpers_musicManager_manager_playing', {
                title: currentTrack.info.title.replace(/[\[\]\(\)]/g, ''),
                url: currentTrack.info.uri,
            });
            const updatedProgress = createProgressBar(player);
            const updatedArtistText = await t(channel, 'music_helpers_musicManager_manager_channel', { author: currentTrack.info.author });
            const updatedRequestedByText = await t(channel, 'music_helpers_musicManager_manager_requested_by', {
                user: currentTrack.info.requester?.username
                    ? `${currentTrack.info.requester} (${currentTrack.info.requester.username})`
                    : `${currentTrack.info.requester}`,
            });

            let updatedSuggestionRow = null;
            if (suggestionRow) {
                // Enable the select menu
                const menu = suggestionRow.components[0];
                menu.setDisabled(false);
                updatedSuggestionRow = new ActionRowBuilder().addComponents(menu);
            }

            const updatedContainer = new ContainerBuilder().setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }));

            if (kythia.addons.music.artworkUrlStyle === 'banner') {
                if (currentTrack.info.artworkUrl || currentTrack.info.image) {
                    updatedContainer.addMediaGalleryComponents(
                        new MediaGalleryBuilder().addItems([
                            new MediaGalleryItemBuilder().setURL(currentTrack.info.artworkUrl || currentTrack.info.image),
                        ])
                    );
                }
                updatedContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(updatedNowPlayingText));
            } else {
                updatedContainer.addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent(updatedNowPlayingText))
                        .setThumbnailAccessory(
                            currentTrack.info.artworkUrl || currentTrack.info.image
                                ? new ThumbnailBuilder()
                                      .setDescription(currentTrack.info.title)
                                      .setURL(currentTrack.info.artworkUrl || currentTrack.info.image)
                                : null
                        )
                );
            }

            updatedContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(updatedProgress));
            updatedContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(updatedArtistText));
            updatedContainer.addTextDisplayComponents(new TextDisplayBuilder().setContent(updatedRequestedByText));
            updatedContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
            if (updatedSuggestionRow) {
                updatedContainer.addActionRowComponents(updatedSuggestionRow);
                updatedContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
            }
            updatedContainer.addActionRowComponents(updatedFirstControlButtonRow);
            updatedContainer.addActionRowComponents(updatedSecondControlButtonRow);
            updatedContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
            updatedContainer.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(await t(channel, 'common_container_footer', { username: client.user.username }))
            );

            try {
                await player.nowPlayingMessage.edit({
                    components: [updatedContainer],
                    flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                });
            } catch (e) {
                clearInterval(player.updateInterval);
            }
        }, 1000);

        // --- AUTOPLAY REFERENCE: Set the most recently played track for autoplay ---
        player._autoplayReference = track;

        // Also update lastPlayedTrack in guildStates for legacy/other uses
        const state = guildStates.get(player.guildId);
        if (state) {
            state.lastPlayedTrack = track;
        }
    });

    /**
     * ⏭️ Handles when a track ends (either naturally or by skip/stop).
     */
    client.poru.on('trackEnd', async (player, track) => {
        // Save finished track to history
        const state = guildStates.get(player.guildId);
        if (state) {
            state.previousTracks.unshift(track);
            if (state.previousTracks.length > 10) state.previousTracks.pop();
        }

        // Clear progress bar update interval
        if (player.updateInterval) clearInterval(player.updateInterval);

        // Stop and dispose any button collector
        if (player.buttonCollector) {
            try {
                player.buttonCollector.stop('trackEnd');
            } catch (e) {}
            player.buttonCollector = null;
        }

        // Edit Now Playing to ended container
        // await shutdownPlayerUI(player, track, client);

        // If repeat track mode is active, add the track back to the queue
        if (player.trackRepeat) {
            player.queue.add(track);
        }
        // If repeat queue mode is active, also add the track to the end of the queue
        else if (player.queueRepeat) {
            player.queue.add(track);
        }
    });

    /**
     * 🔄 Handles when the queue ends, including autoplay logic.
     * This event now FOCUSES on handling what happens after the queue is truly empty.
     */
    client.poru.on('queueEnd', async (player) => {
        const channel = client.channels.cache.get(player.textChannel);

        // Edit Now Playing to ended container (no track, just ended)
        // await shutdownPlayerUI(player, player._autoplayReference, client, channel);

        // Stop and dispose any button collector
        if (player.buttonCollector) {
            try {
                player.buttonCollector.stop('queueEnd');
            } catch (e) {}
            player.buttonCollector = null;
        }

        const autoplayReference = player._autoplayReference;

        if (player.autoplay && autoplayReference) {
            try {
                if (channel) {
                    (async () => {
                        await channel.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor(kythia.bot.color)
                                    .setDescription(await t(channel, 'music_helpers_musicManager_manager_searching', { title: autoplayReference.info.title })),
                            ],
                        });
                    })();
                }

                const searchUrl = `https://www.youtube.com/watch?v=${autoplayReference.info.identifier}&list=RD${autoplayReference.info.identifier}`;
                const res = await client.poru.resolve({
                    query: searchUrl,
                    source: 'ytsearch',
                    requester: autoplayReference.info.requester,
                });

                if (res.loadType !== 'playlist' || !res.tracks.length) {
                    throw new Error(await t(channel, 'music_helpers_musicManager_manager_recommendation'));
                }

                // --- ✨ LOGIKA FILTER ANTI-REPEAT YANG DISEMPURNAKAN ---
                const potentialNextTracks = res.tracks.filter((t) => !player.playedTrackIdentifiers.has(t.info.identifier));

                if (!potentialNextTracks.length) {
                    if (channel) {
                        (async () => {
                            await channel.send({
                                embeds: [new EmbedBuilder().setColor('Orange').setDescription(await t(channel, 'music_helpers_musicManager_manager_played'))],
                            });
                        })();
                    }
                    return player.destroy();
                }

                // Ambil 5 rekomendasi teratas untuk variasi, lalu pilih satu secara acak
                const topRecommendations = potentialNextTracks.slice(0, 5);
                const nextTrack = topRecommendations[Math.floor(Math.random() * topRecommendations.length)];

                player.queue.add(nextTrack);
                return player.play();
            } catch (err) {
                if (channel)
                    channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Red')
                                .setDescription(await t(channel, 'music_helpers_musicManager_manager_failed', { error: err.message })),
                        ],
                    });
                return player.destroy();
            }
        } else {
            // Jika autoplay mati, akhiri sesi
            // if (channel) channel.send({ embeds: [new EmbedBuilder().setColor(kythia.bot.color).setDescription(await t(channel, "music_helpers_musicManager_manager_ended"))] });
            if (player && !player.destroyed) {
                player.destroy();
            }
        }
    });

    /**
     * 🛑 Handles when the player is destroyed (e.g., bot leaves voice channel).
     */
    client.poru.on('playerDestroy', async (player) => {
        if (guildStates.has(player.guildId)) {
            guildStates.delete(player.guildId);
        }
        if (player.updateInterval) clearInterval(player.updateInterval);

        // Stop and dispose any button collector
        if (player.buttonCollector) {
            try {
                player.buttonCollector.stop('playerDestroy');
            } catch (e) {}
            player.buttonCollector = null;
        }

        const channel = client.channels.cache.get(player.textChannel);
        try {
            setVoiceChannelStatus(channel, 'idle');
        } catch (e) {
            logger.error('❌ Failed to set voice channel status', e);
        }

        // Use the ended container for the last played track
        let lastTrack = player.currentTrack || (player.queue && player.queue.length > 0 ? player.queue[0] : player._autoplayReference);
        await shutdownPlayerUI(player, lastTrack, client);
    });

    /**
     * 🖱️ Handles Discord interaction events for music controls and suggestions.
     * (Button logic is now handled by the collector above, only dropdown handled here)
     */
    client.on('interactionCreate', async (interaction) => {
        // === Dropdown suggestion logic ===
        if (interaction.isStringSelectMenu() && interaction.customId === 'music_suggest') {
            await interaction.deferReply();
            const player = client.poru.players.get(interaction.guildId);

            // Basic checks
            if (!player) {
                return await interaction.editReply({
                    embeds: [new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'music_helpers_musicManager_manager_ended'))],
                });
            }
            if (!interaction.member.voice.channel) {
                return await interaction.editReply({
                    embeds: [new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'music_helpers_musicManager_manager_simple'))],
                });
            }
            if (interaction.member.voice.channel.id !== player.voiceChannel) {
                return await interaction.editReply({
                    embeds: [new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'music_helpers_musicManager_manager_required'))],
                });
            }

            // Get the selected track URL from the dropdown value
            const selectedSongUri = interaction.values[0];

            try {
                // Search for the selected track by URL
                const res = await client.poru.resolve({ query: selectedSongUri, source: 'ytsearch', requester: interaction.user });
                if (res.loadType === 'error' || !res.tracks.length) {
                    return await interaction.editReply({
                        embeds: [new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'music_helpers_musicManager_manager_track'))],
                    });
                }

                // Add the track to the queue
                player.queue.add(res.tracks[0]);

                // Confirm to the user
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor(kythia.bot.color)
                            .setDescription(
                                await t(interaction, 'music_helpers_musicManager_manager_queue', {
                                    title: res.tracks[0].info.title,
                                    url: res.tracks[0].info.uri,
                                })
                            ),
                    ],
                });
            } catch (e) {
                await interaction.editReply({
                    embeds: [new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'music_helpers_musicManager_manager_track'))],
                });
            }
        }
    });

    // Initialize Poru when the bot is ready
    client.once('clientReady', () => client.poru.init(client));
}

module.exports = initializeMusicManager;
