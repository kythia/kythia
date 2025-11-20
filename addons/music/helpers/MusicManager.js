/**
 * @namespace: addons/music/helpers/MusicManager.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
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
    SectionBuilder,
    ThumbnailBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
} = require('discord.js');
const { createProgressBar, hasControlPermission } = require('.');
const { Spotify } = require('poru-spotify');
const { Poru } = require('poru');

const MASTER_TITLE_CLEAN_REGEX =
    /[\[\]\(\)]|(?:\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])|\s{2,}/g;

/**
 * 🎹 Music Manager Service
 *
 * Core orchestrator for the Kythia music system.
 * This class is stored in `container.music` and acts as a Singleton.
 *
 * Main Responsibilities:
 * 1. Initialize Poru (Lavalink Client) & Spotify Plugin.
 * 2. Maintain per-guild music state (history, last track) in memory.
 * 3. Listen to Poru events (trackStart, trackEnd, queueEnd) to trigger UI updates & Autoplay.
 * 4. Run a global UI ticker to update the progress bar in real time.
 *
 * @class MusicManager
 * @param {object} container - Kythia global dependency injection container.
 * @property {Map<string, object>} guildStates - In-memory map for storing per-guild track history.
 * @property {number} TICKER_INTERVAL - UI "Now Playing" update interval (ms).
 */
class MusicManager {
    constructor(container) {
        this.container = container;
        this.client = container.client;
        this.logger = container.logger;
        this.t = container.t;
        this.config = container.kythiaConfig;
        this.helpers = container.helpers;

        this.handlers = container.musicHandlers;

        this.setVoiceChannelStatus = this.helpers.discord.setVoiceChannelStatus;
        this.convertColor = this.helpers.color.convertColor;

        this.guildStates = new Map();

        this.TICKER_INTERVAL = 5000;
    }

    async init() {
        this.logger.info('🎵 Initializing Music Manager Service...');
        // Config Check
        if (!this.config.addons.music.lavalink.hosts) {
            this.logger.warn('⚠️ Lavalink config missing.');
            return;
        }

        // Setup Nodes
        const nodes = (this.config.addons.music.lavalink.hosts || 'localhost').split(',').map((host, i) => ({
            name: `Kythia Nodes #${i + 1}`,
            host: host.trim(),
            port: parseInt((this.config.addons.music.lavalink.ports || '2333').split(',')[i] || '2333', 10),
            password: (this.config.addons.music.lavalink.passwords || 'youshallnotpass').split(',')[i] || 'youshallnotpass',
            secure: ((this.config.addons.music.lavalink.secures || 'false').split(',')[i] || 'false').toLowerCase() === 'true',
        }));

        // Setup Plugins
        let plugins = [];
        if (this.config.addons.music.spotify.clientID && this.config.addons.music.spotify.clientSecret) {
            plugins.push(
                new Spotify({
                    clientID: this.config.addons.music.spotify.clientID,
                    clientSecret: this.config.addons.music.spotify.clientSecret,
                })
            );
        }

        // Init Poru
        this.client.poru = new Poru(this.client, nodes, {
            library: 'discord.js',
            defaultPlatform: this.config.addons.music.defaultPlatform || 'ytsearch',
            plugins: plugins,
        });

        // Register Poru Events & Listeners
        this.registerPoruEvents();

        // Start UI ticker
        this.client.once('clientReady', () => {
            this.client.poru.init(this.client);
            this.logger.info(`🎵 Music UI Ticker started (${this.TICKER_INTERVAL}ms)`);
            this.startUiTicker();
        });

        // Register Dropdown Handler
        this.client.on('interactionCreate', this.handleInteraction.bind(this));
    }

    registerPoruEvents() {
        const poru = this.client.poru;

        // Clean player setup
        poru.on('playerCreate', (player) => {
            player.autoplay = false;
            player.nowPlayingMessage = null;
            player.updateInterval = null;
            player._sendingNowPlaying = false;
            player._autoplayReference = null;
            player.playedTrackIdentifiers = new Set();
            player.buttonCollector = null;
            player._247 = false;
            player._latestSuggestionRow = null;
            player.disconnectTimeout = null;
        });

        poru.on('nodeConnect', (node) => this.logger.info(`🎚️  Node "${node.name}" connected.`));

        poru.on('nodeError', (node, error) => {
            const poruLavalinkPatternNode = /\[Poru Websocket\] Unable to connect with (.+?) node after (\d+) tries/;
            if (error && error.message && poruLavalinkPatternNode.test(error.message)) {
                this.logger.warn(`‼️ Lavalink node connection warning: ${error.message}`);
            } else {
                this.logger.info(`❌ Node "${node.name}" error: ${error.message}`);
            }
        });

        /**
         * ▶️ Handles when a new track starts playing.
         */
        poru.on('trackStart', async (player, track) => {
            // Handle disconnect timeout
            if (player.disconnectTimeout) {
                clearTimeout(player.disconnectTimeout);
                player.disconnectTimeout = null;
            }
            // Voice channel empty auto-destroy
            try {
                const voiceChannel = this.client.channels.cache.get(player.voiceChannel);

                if (voiceChannel && !player._247) {
                    const realUsers = voiceChannel.members.filter((m) => !m.user.bot);
                    if (realUsers.size === 0) {
                        if (player && !player.destroyed) {
                            player.destroy();
                        }
                        return;
                    }
                }
            } catch (err) {
                this.logger.error('❌ Error checking voice channel members (on trackStart):', err);
            }

            // Init state
            if (!this.guildStates.has(player.guildId)) {
                this.guildStates.set(player.guildId, {
                    previousTracks: [],
                    lastPlayedTrack: null,
                });
            }
            const state = this.guildStates.get(player.guildId);
            state.lastPlayedTrack = track;

            // Set voice channel status
            try {
                const voiceChannel = this.client.channels.cache.get(player.voiceChannel);
                await this.setVoiceChannelStatus(
                    voiceChannel,
                    `🎵 ${track.info && track.info.title ? track.info.title.substring(0, 90) : 'Unknown'}`
                );
            } catch (e) {}

            // If there was already a UI, destroy it
            if (player.nowPlayingMessage && player.nowPlayingMessage.deletable) {
                try {
                    await player.nowPlayingMessage.delete().catch(() => {});
                } catch (e) {}
                player.nowPlayingMessage = null;
            }
            if (player.updateInterval) clearInterval(player.updateInterval);

            if (player.buttonCollector) {
                try {
                    player.buttonCollector.stop('newTrack');
                } catch (e) {}
                player.buttonCollector = null;
            }

            // Recommendations logic
            let recommendations = [];
            try {
                const searchUrl = `https://www.youtube.com/watch?v=${track.info.identifier}&list=RD${track.info.identifier}`;
                const res = await this.client.poru.resolve({ query: searchUrl, source: 'ytsearch', requester: track.info.requester });
                if (res.loadType === 'playlist' && res.tracks.length) {
                    recommendations = res.tracks
                        .filter((t) => t.info.identifier !== track.info.identifier)
                        .slice(0, this.config.addons.music.suggestionLimit || 5);
                }
            } catch (e) {
                this.logger.error('Failed to fetch recommendations for dropdown:', e);
            }

            player.playedTrackIdentifiers.add(track.info.identifier);

            // Call UI update (with first drawing=true)
            await this.updateNowPlayingUI(player, { recommendations, track });
        });

        /**
         * ⏭️ Handles when a track ends (either naturally or by skip/stop).
         */
        poru.on('trackEnd', async (player, track) => {
            let state = this.guildStates.get(player.guildId);

            if (!state) {
                state = {
                    previousTracks: [],
                    lastPlayedTrack: null,
                };
                this.guildStates.set(player.guildId, state);
            }
            state.previousTracks.unshift(track);
            if (state.previousTracks.length > 10) state.previousTracks.pop();

            if (player.updateInterval) clearInterval(player.updateInterval);

            if (player.buttonCollector) {
                try {
                    player.buttonCollector.stop('trackEnd');
                } catch (e) {}
                player.buttonCollector = null;
            }
            if (player.trackRepeat) {
                player.queue.add(track);
            } else if (player.queueRepeat) {
                player.queue.add(track);
            }
        });

        /**
         * 🔄 Handles when the queue ends, including autoplay logic.
         */
        poru.on('queueEnd', async (player) => {
            const channel = this.client.channels.cache.get(player.textChannel);
            let shouldContinue = true;
            try {
                const voiceChannel = this.client.channels.cache.get(player.voiceChannel);
                if (voiceChannel) {
                    const realUsers = voiceChannel.members.filter((m) => !m.user.bot);
                    if (realUsers.size === 0) {
                        if (!player._247) {
                            shouldContinue = false;
                        }
                    }
                }
            } catch (err) {
                this.logger.error('❌ Error checking voice channel members:', err);
            }

            if (!shouldContinue) {
                if (channel) {
                    channel.send({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Orange')
                                .setDescription(await this.t(channel, 'music.helpers.musicManager.manager.no.listener')),
                        ],
                    });
                }
                if (player && !player.destroyed) {
                    player.destroy();
                }
                return;
            }

            const lastTrack = player._autoplayReference;

            if (lastTrack) {
                let state = this.guildStates.get(player.guildId);
                if (!state) {
                    state = { previousTracks: [], lastPlayedTrack: null };
                    this.guildStates.set(player.guildId, state);
                }
                const topHistory = state.previousTracks[0];
                if (!topHistory || topHistory.info.identifier !== lastTrack.info.identifier) {
                    state.previousTracks.unshift(lastTrack);
                    if (state.previousTracks.length > 10) state.previousTracks.pop();
                }
            }

            if (player.buttonCollector) {
                try {
                    player.buttonCollector.stop('queueEnd');
                } catch (e) {}
                player.buttonCollector = null;
            }

            let autoplaySucceeded = false;

            // ---- Autoplay recommendations ----
            if (player.autoplay && lastTrack) {
                let searchingMessage = null;

                try {
                    if (channel) {
                        searchingMessage = await channel.send({
                            embeds: [
                                new EmbedBuilder().setColor(this.config.bot.color).setDescription(
                                    await this.t(channel, 'music.helpers.musicManager.manager.searching', {
                                        title: lastTrack.info.title,
                                    })
                                ),
                            ],
                        });
                    }

                    const searchUrl = `https://www.youtube.com/watch?v=${lastTrack.info.identifier}&list=RD${lastTrack.info.identifier}`;
                    const res = await this.client.poru.resolve({
                        query: searchUrl,
                        source: 'ytsearch',
                        requester: lastTrack.info.requester,
                    });

                    if (res.loadType !== 'playlist' || !res.tracks.length) {
                        throw new Error(await this.t(channel, 'music.helpers.musicManager.manager.recommendation'));
                    }

                    const potentialNextTracks = res.tracks.filter((t) => !player.playedTrackIdentifiers.has(t.info.identifier));

                    if (!potentialNextTracks.length) {
                        if (channel) {
                            const embed = new EmbedBuilder()
                                .setColor('Orange')
                                .setDescription(await this.t(channel, 'music.helpers.musicManager.manager.played'));

                            if (searchingMessage && searchingMessage.editable) {
                                await searchingMessage.edit({ embeds: [embed] });
                            } else {
                                await channel.send({ embeds: [embed] });
                            }
                        }
                    } else {
                        const topRecommendations = potentialNextTracks.slice(0, 5);
                        const nextTrack = topRecommendations[Math.floor(Math.random() * topRecommendations.length)];

                        nextTrack.info.isAutoplay = true;

                        player.queue.add(nextTrack);
                        await player.play();
                        autoplaySucceeded = true;

                        if (searchingMessage && searchingMessage.deletable) {
                            await searchingMessage.delete().catch(() => {});
                        }

                        return;
                    }
                } catch (err) {
                    if (channel) {
                        const embed = new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(await this.t(channel, 'music.helpers.musicManager.manager.failed', { error: err.message }));

                        if (searchingMessage && searchingMessage.editable) {
                            await searchingMessage.edit({ embeds: [embed] });
                        } else {
                            await channel.send({ embeds: [embed] });
                        }
                    }
                }
            }

            if (autoplaySucceeded) return;

            if (player._247) {
                this.logger.info(`🎵 [24/7] Queue ended for ${player.guildId}, staying idle.`);
                if (player.updateInterval) clearInterval(player.updateInterval);

                const voiceChannel = this.client.channels.cache.get(player.voiceChannel);
                try {
                    this.setVoiceChannelStatus(voiceChannel, 'idle');
                } catch (e) {}

                let lastPlayable = player.currentTrack || lastTrack;
                await this.shutdownPlayerUI(player, lastPlayable);

                player.nowPlayingMessage = null;
            } else {
                let lastPlayable = player.currentTrack || lastTrack;
                await this.shutdownPlayerUI(player, lastPlayable);
                player.nowPlayingMessage = null;

                const IDLE_TIMEOUT_MS = 5 * 60 * 1000;

                if (player.disconnectTimeout) clearTimeout(player.disconnectTimeout);

                player.disconnectTimeout = setTimeout(async () => {
                    if (player.queue.length > 0) {
                        return;
                    }

                    if (channel) {
                        await channel.send({
                            embeds: [
                                new EmbedBuilder().setColor('Orange').setDescription(
                                    await this.t(channel, 'music.helpers.musicManager.manager.idleDisconnect', {
                                        seconds: IDLE_TIMEOUT_MS / 1000,
                                    })
                                ),
                            ],
                        });
                    }
                    player.destroy();
                }, IDLE_TIMEOUT_MS);
            }
        });

        /**
         * 🛑 Handles when the player is destroyed (e.g., bot leaves voice channel).
         */
        poru.on('playerDestroy', async (player) => {
            if (player.updateInterval) clearInterval(player.updateInterval);
            if (player.buttonCollector) {
                try {
                    player.buttonCollector.stop('playerDestroy');
                } catch (e) {}
                player.buttonCollector = null;
            }
            const voiceChannel = this.client.channels.cache.get(player.voiceChannel);
            try {
                this.setVoiceChannelStatus(voiceChannel, 'idle');
            } catch (e) {
                this.logger.error('❌ Failed to set voice channel status', e);
            }

            let lastTrack = player.currentTrack || (player.queue && player.queue.length > 0 ? player.queue[0] : player._autoplayReference);
            await this.shutdownPlayerUI(player, lastTrack);

            if (this.guildStates.has(player.guildId) && !player._247) {
                this.guildStates.delete(player.guildId);
            }
        });
    }

    async handleInteraction(interaction) {
        if (interaction.isStringSelectMenu() && interaction.customId === 'music_suggest') {
            await interaction.deferReply();
            const player = this.client.poru.players.get(interaction.guildId);

            if (!player) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(await this.t(interaction, 'music.helpers.musicManager.manager.ended')),
                    ],
                });
            }
            if (!interaction.member.voice.channel) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(await this.t(interaction, 'music.helpers.musicManager.manager.simple')),
                    ],
                });
            }
            if (interaction.member.voice.channel.id !== player.voiceChannel) {
                return await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(await this.t(interaction, 'music.helpers.musicManager.manager.required')),
                    ],
                });
            }

            const selectedSongUri = interaction.values[0];

            try {
                const res = await this.client.poru.resolve({
                    query: selectedSongUri,
                    source: 'ytsearch',
                    requester: interaction.user,
                });
                if (res.loadType === 'error' || !res.tracks.length) {
                    return await interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Red')
                                .setDescription(await this.t(interaction, 'music.helpers.musicManager.manager.track')),
                        ],
                    });
                }

                player.queue.add(res.tracks[0]);

                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder().setColor(this.config.bot.color).setDescription(
                            await this.t(interaction, 'music.helpers.musicManager.manager.queue', {
                                title: res.tracks[0].info.title,
                                url: res.tracks[0].info.uri,
                            })
                        ),
                    ],
                });
            } catch (e) {
                await interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setDescription(await this.t(interaction, 'music.helpers.musicManager.manager.track')),
                    ],
                });
            }
        }
    }

    async startUiTicker() {
        const players = this.client.poru.players.values();
        for (const player of players) {
            try {
                if (!player || player.destroyed || !player.nowPlayingMessage?.editable || !player.currentTrack) {
                    continue;
                }
                const track = player.currentTrack;
                if (track.info) {
                    if (!track.info.isStream && track.info.length > 0) {
                        if (player.position >= track.info.length - 5000) {
                            continue;
                        }
                    }
                }
                await this.updateNowPlayingUI(player);
            } catch (e) {
                this.logger.warn(`[Ticker] Failed to update UI for player: ${player.guildId}`, e.message);
            }
        }
        setTimeout(() => this.startUiTicker(), this.TICKER_INTERVAL);
    }

    /**
     * Updates the "Now Playing" UI for a specific player.
     * @param {object} player - The Poru player instance.
     * @param {object} [options] - For trackStart, can feed {recommendations, track}
     */
    async updateNowPlayingUI(player, options = {}) {
        try {
            const client = this.client; // for ease of translation of legacy code
            const kythia = this.config;
            const t = this.t;

            const voiceChannel = client.channels.cache.get(player.voiceChannel);
            if (voiceChannel && !player._247) {
                const realUsers = voiceChannel.members.filter((m) => !m.user.bot);
                if (realUsers.size === 0) {
                    if (player && !player.destroyed) {
                        player.destroy();
                    }
                    return;
                }
            }

            const currentTrack = options.track || player.currentTrack;
            const channel = client.channels.cache.get(player.textChannel);
            if (!currentTrack || !channel) return;
            if (typeof player.nowPlayingMessage === 'undefined') player.nowPlayingMessage = null;

            // Only allow message edit if sending for ticker, else on first draw do send.
            const isTicker = !options || Object.keys(options).length === 0;

            // HISTORY
            const state = this.guildStates.get(player.guildId);
            const hasHistory = state && state.previousTracks.length > 0;

            // COMPONENTS/ROWS
            const updatedFirstControlButtonRow = this.getFirstControlButtonRow(currentTrack && player.isPaused, false, hasHistory, kythia);
            const updatedSecondControlButtonRow = this.getSecondControlButtonRow(false, kythia);

            const cleanTitle = currentTrack.info.title.replace(MASTER_TITLE_CLEAN_REGEX, '');
            const updatedNowPlayingText = await t(channel, 'music.helpers.musicManager.manager.playing', {
                title: cleanTitle,
                url: currentTrack.info.uri,
            });
            const updatedProgress = createProgressBar(player);
            const updatedArtistText = await t(channel, 'music.helpers.musicManager.manager.channel', { author: currentTrack.info.author });

            let userString;
            if (currentTrack.info.isAutoplay) {
                const username = currentTrack.info.requester?.username || 'User';
                userString = `Autoplay (${username})`;
            } else {
                userString = currentTrack.info.requester?.username
                    ? `${currentTrack.info.requester} (${currentTrack.info.requester.username})`
                    : `${currentTrack.info.requester}`;
            }
            const updatedRequestedByText = await t(channel, 'music.helpers.musicManager.manager.requested.by', {
                user: userString,
            });

            // Suggestion Row
            let updatedSuggestionRow = null;
            if (options.recommendations && Array.isArray(options.recommendations) && options.recommendations.length) {
                // draw fresh dropdown options (first send)
                const suggestionOptions = [];
                for (const song of options.recommendations) {
                    suggestionOptions.push({
                        label: song.info.title.substring(0, 95),
                        description: await t(channel, 'music.helpers.musicManager.manager.by', {
                            author: song.info.author.substring(0, 90),
                        }),
                        value: song.info.uri,
                    });
                }
                const suggestionMenu = new StringSelectMenuBuilder()
                    .setCustomId('music_suggest')
                    .setPlaceholder(await t(channel, 'music.helpers.musicManager.manager.placeholder'))
                    .addOptions(suggestionOptions)
                    .setDisabled(false);
                updatedSuggestionRow = new ActionRowBuilder().addComponents(suggestionMenu);
                player._latestSuggestionRow = updatedSuggestionRow;
            } else if (player._latestSuggestionRow) {
                // re-enable old dropdown row
                const menu = player._latestSuggestionRow.components[0];
                menu.setDisabled(false);
                updatedSuggestionRow = new ActionRowBuilder().addComponents(menu);
            }

            // UI container
            const updatedContainer = new ContainerBuilder().setAccentColor(
                this.convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' })
            );

            if (kythia.addons.music.artworkUrlStyle === 'banner') {
                if (currentTrack.info.artworkUrl || currentTrack.info.image) {
                    updatedContainer.addMediaGalleryComponents(
                        new MediaGalleryBuilder().addItems([
                            new MediaGalleryItemBuilder().setURL(currentTrack.info.artworkUrl || currentTrack.info.image),
                        ])
                    );
                }
                updatedContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
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
                updatedContainer.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
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
                new TextDisplayBuilder().setContent(await t(channel, 'common.container.footer', { username: client.user.username }))
            );

            // Send or Edit message
            if (!player.nowPlayingMessage) {
                // Initial send and new button collector
                const message = await channel.send({
                    components: [updatedContainer],
                    flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                });
                player.nowPlayingMessage = message;

                // Button collector (moved here!)
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
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Red')
                                    .setDescription(await t(interaction, 'music.helpers.musicManager.manager.required')),
                            ],
                        });
                    }
                    if (!hasControlPermission(interaction, player)) {
                        return interaction.reply({
                            content: await t(interaction, 'music.helpers.musicManager.music.permission.denied'),
                            ephemeral: true,
                        });
                    }
                    switch (interaction.customId) {
                        case 'music_back': {
                            await this.handlers.handleBack(interaction, player, this.guildStates);
                            break;
                        }
                        case 'music_pause_resume': {
                            await this.handlers.handlePauseResume(interaction, player);
                            break;
                        }
                        case 'music_skip': {
                            await this.handlers.handleSkip(interaction, player);
                            break;
                        }
                        case 'music_stop': {
                            await this.handlers.handleStop(interaction, player);
                            break;
                        }
                        case 'music_loop': {
                            await this.handlers.handleLoop(interaction, player);
                            break;
                        }
                        case 'music_autoplay': {
                            await this.handlers.handleAutoplay(interaction, player);
                            break;
                        }
                        case 'music_lyrics': {
                            await this.handlers.handleLyrics(interaction, player);
                            break;
                        }
                        case 'music_queue': {
                            await this.handlers.handleQueue(interaction, player);
                            break;
                        }
                        case 'music_shuffle': {
                            await this.handlers.handleShuffle(interaction, player);
                            break;
                        }
                        case 'music_favorite_add': {
                            await this.handlers.handleFavorite(interaction, player);
                            break;
                        }
                    }
                });

                // For autoplay reference!
                player._autoplayReference = currentTrack;

                if (state) {
                    state.lastPlayedTrack = currentTrack;
                }
            } else {
                // Edit for Ticker
                await player.nowPlayingMessage.edit({
                    components: [updatedContainer],
                    flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
                });
            }
        } catch (e) {}
    }

    // Helper to edit the Now Playing message with an "ended" container (shutdown UI)
    async shutdownPlayerUI(player, track, channel) {
        try {
            if (!player.nowPlayingMessage?.editable) return;
            const client = this.client;
            const kythia = this.config;
            const t = this.t;

            channel = channel || player.nowPlayingMessage.channel || (client && client.channels.cache.get(player.textChannel));
            let endedText, artistText, requestedByText, artworkUrl, title, url;
            if (track && track.info) {
                const cleanTitle = track.info.title.replace(MASTER_TITLE_CLEAN_REGEX, '');
                endedText = await t(channel, 'music.helpers.musicManager.manager.now.ended', {
                    title: cleanTitle,
                    url: track.info.uri,
                });
                artistText = await t(channel, 'music.helpers.musicManager.manager.channel', { author: track.info.author });

                let userString;
                if (track.info.isAutoplay) {
                    const username = track.info.requester?.username || 'User';
                    userString = `Autoplay (${username})`;
                } else {
                    userString = track.info.requester?.username
                        ? `${track.info.requester} (${track.info.requester.username})`
                        : `${track.info.requester}`;
                }
                requestedByText = await t(channel, 'music.helpers.musicManager.manager.requested.by', {
                    user: userString,
                });

                artworkUrl = track.info.artworkUrl || track.info.image || null;
                title = track.info.title;
                url = track.info.uri;
            } else {
                endedText = await t(channel, 'music.helpers.musicManager.manager.simple');
                artistText = '';
                requestedByText = '';
                artworkUrl = null;
                title = '';
                url = '';
            }

            const container = new ContainerBuilder().setAccentColor(this.convertColor('Red', { from: 'discord', to: 'decimal' }));

            if (kythia.addons.music.artworkUrlStyle === 'banner' && artworkUrl) {
                container.addMediaGalleryComponents(
                    new MediaGalleryBuilder().addItems([artworkUrl ? new MediaGalleryItemBuilder().setURL(artworkUrl) : null])
                );
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
                container.addTextDisplayComponents(new TextDisplayBuilder().setContent(endedText));
            } else {
                container.addSectionComponents(
                    new SectionBuilder()
                        .addTextDisplayComponents(new TextDisplayBuilder().setContent(endedText))
                        .setThumbnailAccessory(artworkUrl ? new ThumbnailBuilder().setDescription(title).setURL(artworkUrl) : null)
                );
                container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
            }
            if (artistText) container.addTextDisplayComponents(new TextDisplayBuilder().setContent(artistText));
            if (requestedByText) container.addTextDisplayComponents(new TextDisplayBuilder().setContent(requestedByText));
            container.addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true));
            container.addTextDisplayComponents(
                new TextDisplayBuilder().setContent(await t(channel, 'common.container.footer', { username: client.user.username }))
            );

            await player.nowPlayingMessage.edit({
                components: [container],
                flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            });
        } catch (e) {}
    }

    // BUTTON ROW HELPERS
    getFirstControlButtonRow(isPaused, disabled = false, hasHistory = false, kythia) {
        // kythia = this.config!
        kythia = kythia || this.config;
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('music_autoplay')
                [typeof kythia.emojis.musicAutoplay !== 'undefined' ? 'setEmoji' : 'setLabel'](
                    typeof kythia.emojis.musicAutoplay !== 'undefined' ? kythia.emojis.musicAutoplay : 'Autoplay'
                )
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled),
            new ButtonBuilder()
                .setCustomId('music_back')
                [typeof kythia.emojis.musicBack !== 'undefined' ? 'setEmoji' : 'setLabel'](
                    typeof kythia.emojis.musicBack !== 'undefined' ? kythia.emojis.musicBack : 'Back'
                )
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled || !hasHistory),
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
                .setCustomId('music_loop')
                [typeof kythia.emojis.musicLoop !== 'undefined' ? 'setEmoji' : 'setLabel'](
                    typeof kythia.emojis.musicLoop !== 'undefined' ? kythia.emojis.musicLoop : 'Loop'
                )
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled)
        );
    }

    getSecondControlButtonRow(disabled = false, kythia) {
        kythia = kythia || this.config;
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
                .setCustomId('music_stop')
                [typeof kythia.emojis.musicStop !== 'undefined' ? 'setEmoji' : 'setLabel'](
                    typeof kythia.emojis.musicStop !== 'undefined' ? kythia.emojis.musicStop : 'Stop'
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
                .setCustomId('music_favorite_add')
                [typeof kythia.emojis.musicFavorite !== 'undefined' ? 'setEmoji' : 'setLabel'](
                    typeof kythia.emojis.musicFavorite !== 'undefined' ? kythia.emojis.musicFavorite : 'Favorite'
                )
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(disabled)
        );
    }
}

module.exports = MusicManager;
