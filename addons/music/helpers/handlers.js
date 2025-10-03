/**
 * @namespace: addons/music/helpers/handlers.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { generateLyricsWithTranscript, formatDuration } = require('.');
const { embedFooter, checkIsPremium } = require('@utils/discord');
// const nanoid = require('nanoid');
const {
    EmbedBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    SeparatorSpacingSize,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
    ComponentType,
    AttachmentBuilder,
} = require('discord.js');
const PlaylistTrack = require('../database/models/PlaylistTrack');
const Playlist = require('../database/models/Playlist');
const Favorite = require('../database/models/Favorite');
const convertColor = require('@utils/color');
const { t } = require('@utils/translator');
const { customFilter } = require('poru');
const logger = require('@utils/logger');
const cheerio = require('cheerio');
const play = require('play-dl');
const axios = require('axios');

/**
 * ▶️ Handles the 'play' subcommand.
 * Searches for a song/playlist and adds it to the queue, filtering out YouTube Shorts.
 * If the query is a Spotify playlist link, adds all tracks from that playlist to the queue.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
async function handlePlay(interaction) {
    const { client, member, guild, options, channel } = interaction;
    await interaction.deferReply();
    const query = options.getString('search');

    // Check if Spotify feature is not configured by the bot owner
    if (query.toLowerCase().includes('spotify') && (!kythia.addons.music.spotify.clientID || !kythia.addons.music.spotify.clientSecret)) {
        const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'music_helpers_handlers_music_configured'));
        return interaction.editReply({ embeds: [embed] });
    }

    // Poru: Use poru.resolve for search
    let res;
    try {
        res = await client.poru.resolve({ query, requester: interaction.user });
    } catch (e) {
        logger.error('Poru resolve error:', e);
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(await t(interaction, 'music_helpers_handlers_music_failed', { error: e?.message || 'Unknown error' }));
        return interaction.editReply({ embeds: [embed] });
    }

    // Special handling for Spotify playlist links
    const isSpotifyPlaylist = /^https?:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]+/i.test(query.trim());
    if (isSpotifyPlaylist) {
        // If Poru failed to resolve as a playlist, show error
        if (!res || res.loadType !== 'PLAYLIST_LOADED' || !Array.isArray(res.tracks) || res.tracks.length === 0) {
            const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'music_helpers_handlers_music_results'));
            return interaction.editReply({ embeds: [embed] });
        }

        // Poru: create connection
        const player = client.poru.createConnection({
            guildId: guild.id,
            voiceChannel: member.voice.channel.id,
            textChannel: channel.id,
            deaf: true,
        });

        for (const track of res.tracks) {
            track.info.requester = interaction.user;
            player.queue.add(track);
        }

        if (!player.isPlaying && player.isConnected) player.play();

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setThumbnail(res.playlistInfo?.image)
            .setFooter(await embedFooter(interaction))
            .setDescription(
                await t(interaction, 'music_helpers_handlers_music_playlist_desc_spotify', {
                    count: res.tracks.length,
                    name: res.playlistInfo?.name || 'Spotify Playlist',
                })
            );
        return interaction.editReply({ embeds: [embed] });
    }

    // Filter out YouTube Shorts (<70s) for search results
    if (res.loadType === 'search') {
        const filteredTracks = res.tracks.filter((track) => !track.info.isStream && track.info.length > 70000);
        if (!filteredTracks.length) {
            const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'music_helpers_handlers_music_results'));
            return interaction.editReply({ embeds: [embed] });
        }
        res.tracks = filteredTracks;
    }

    if (res.loadType === 'error') {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                await t(interaction, 'music_helpers_handlers_music_failed', { error: res.exception?.message || 'Unknown error' })
            );
        return interaction.editReply({ embeds: [embed] });
    }
    if (res.loadType === 'empty') {
        const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'music_helpers_handlers_music_results'));
        return interaction.editReply({ embeds: [embed] });
    }

    // Poru: create connection
    const player = client.poru.createConnection({
        guildId: guild.id,
        voiceChannel: member.voice.channel.id,
        textChannel: channel.id,
        deaf: true,
    });

    if (res.loadType === 'playlist' || res.loadType === 'PLAYLIST_LOADED') {
        for (const track of res.tracks) {
            track.info.requester = interaction.user;
            player.queue.add(track);
        }
    } else {
        const track = res.tracks[0];
        track.info.requester = interaction.user;
        player.queue.add(track);
    }

    if (!player.isPlaying && player.isConnected) player.play();

    const embed = new EmbedBuilder().setColor(kythia.bot.color);
    if (res.loadType === 'playlist' || res.loadType === 'PLAYLIST_LOADED') {
        embed.setDescription(
            await t(interaction, 'music_helpers_handlers_music_playlist_desc', {
                count: res.tracks.length,
                name: res.playlistInfo?.name || 'Playlist',
            })
        );
    } else {
        const track = res.tracks[0];
        embed.setDescription(
            await t(interaction, 'music_helpers_handlers_music_added_to_queue', { title: track.info.title, url: track.info.uri })
        );
    }
    return interaction.editReply({ embeds: [embed] });
}

/**
 * ⏸️ Handles the 'pause' subcommand.
 * Pauses the currently playing track.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} player - The music player instance.
 */
async function handlePause(interaction, player) {
    if (player.isPaused) {
        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(await t(interaction, 'music_helpers_handlers_music_paused'));
        return interaction.reply({ embeds: [embed] });
    }
    player.pause(true);
    const embed = new EmbedBuilder().setColor(kythia.bot.color).setDescription(await t(interaction, 'music_helpers_handlers_music_paused'));
    return interaction.reply({ embeds: [embed] });
}

/**
 * ▶️ Handles the 'resume' subcommand.
 * Resumes playback if paused.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} player - The music player instance.
 */
async function handleResume(interaction, player) {
    if (!player.isPaused) {
        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playing'));
        return interaction.reply({ embeds: [embed] });
    }
    player.pause(false);
    const embed = new EmbedBuilder().setColor(kythia.bot.color).setDescription(await t(interaction, 'music_helpers_handlers_music_resume'));
    return interaction.reply({ embeds: [embed] });
}

async function handlePauseResume(interaction, player) {
    player.pause(!player.isPaused);
    // console.log(player.currentTrack)
    const state = player.isPaused
        ? await t(interaction, 'music_helpers_handlers_manager_paused')
        : await t(interaction, 'music_helpers_handlers_manager_resumed');
    await interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setColor(kythia.bot.color)
                .setDescription(await t(interaction, 'music_helpers_handlers_manager_reply', { state })),
        ],
    });
}

/**
 * ⏭️ Handles the 'skip' subcommand.
 * Skips the current track.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} player - The music player instance.
 */
async function handleSkip(interaction, player) {
    if (!player.currentTrack) {
        const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'music_helpers_handlers_music_skip'));
        return interaction.reply({ embeds: [embed] });
    }
    player.skip();
    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setDescription(await t(interaction, 'music_helpers_handlers_music_skipped'));
    return interaction.reply({ embeds: [embed] });
}

/**
 * ⏹️ Handles the 'stop' subcommand.
 * Stops playback and clears the queue.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} player - The music player instance.
 */
async function handleStop(interaction, player) {
    player.autoplay = false;
    player.manualStop = true;
    player.destroy();
    const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'music_helpers_handlers_music_stopped'));
    return interaction.reply({ embeds: [embed] });
}

/**
 * [HELPER] Membuat embed dan tombol navigasi untuk halaman antrian.
 * @param {object} player - The music player instance.
 * @param {number} page - Halaman yang ingin ditampilkan.
 * @returns {import('discord.js').InteractionReplyOptions}
 */
async function _createQueueEmbed(player, page = 1, interaction) {
    const itemsPerPage = 10;
    const totalPages = Math.ceil(player.queue.length / itemsPerPage) || 1;
    page = Math.max(1, Math.min(page, totalPages));

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const currentQueue = player.queue.slice(start, end);
    const duration = player.queue.reduce((total, track) => total + track.info.length, 0);
    const queueList = currentQueue
        .map(
            (track, index) =>
                `**${start + index + 1}.** [${track.info.title.length > 55 ? track.info.title.slice(0, 52) + '…' : track.info.title}](${
                    track.info.uri
                }) \`${formatDuration(track.info.length)}\``
        )
        .join('\n');

    const nowPlaying = player.currentTrack;

    // Navigation buttons
    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId(`queue_prev_${page}`)
            .setEmoji('◀️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === 1),
        new ButtonBuilder()
            .setCustomId(`queue_next_${page}`)
            .setEmoji('▶️')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(page === totalPages)
    );

    // ContainerBuilder for queue display
    const container = new ContainerBuilder()
        .setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }))
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                await t(interaction, 'music_helpers_handlers_queue_nowplaying', {
                    nowTitle: nowPlaying.info.title,
                    nowUrl: nowPlaying.info.uri,
                    nowDuration: formatDuration(nowPlaying.info.length),
                })
            )
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(queueList || (await t(interaction, 'music_helpers_handlers_music_more')))
        )
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addActionRowComponents(buttons)
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                await t(interaction, 'music_helpers_handlers_queue_footer', {
                    page: page,
                    totalPages: totalPages,
                    totalTracks: player.queue.length,
                })
            )
        );

    return {
        components: [container],
        flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
        fetchReply: true,
    };
}

/**
 * 📜 Handles the 'queue' subcommand and its button interactions.
 */
async function handleQueue(interaction, player) {
    const nowPlaying = player.currentTrack;

    if (!nowPlaying) {
        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_empty'));
        return interaction.reply({ embeds: [embed] });
    }

    // Ambil halaman awal dari opsi slash command
    let initialPage;
    if (interaction.isChatInputCommand()) {
        initialPage = interaction.options.getInteger('page') || 1;
    } else {
        initialPage = 1;
    }
    const queueMessageOptions = await _createQueueEmbed(player, initialPage, interaction);

    // Kirim pesan awal
    const message = await interaction.reply(queueMessageOptions);

    // Buat collector untuk tombol navigasi
    const collector = message.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: 5 * 60 * 1000, // 5 menit
    });

    collector.on('collect', async (buttonInteraction) => {
        const [action, currentPageStr] = buttonInteraction.customId.split('_').slice(1);
        let currentPage = parseInt(currentPageStr, 10);

        if (action === 'next') {
            currentPage++;
        } else if (action === 'prev') {
            currentPage--;
        }

        const updatedMessageOptions = await _createQueueEmbed(player, currentPage, interaction);

        // Gunakan .update() untuk mengedit pesan yang sudah ada
        await buttonInteraction.update(updatedMessageOptions);
    });

    collector.on('end', async () => {
        // Hapus tombol setelah collector berakhir
        if (message.editable) {
            const finalState = await _createQueueEmbed(player, 1, interaction);
            finalState.components = []; // Hapus tombol
            await message.edit(finalState).catch(() => {});
        }
    });
}
/**
 * ℹ️ Handles the 'nowplaying' subcommand.
 * Triggers a resend of the now playing panel.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} player - The music player instance.
 */
async function handleNowPlaying(interaction, player) {
    if (!player.currentTrack) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(await t(interaction, 'music_helpers_handlers_music_nowplaying_error'))
            .setFooter(await embedFooter(interaction));
        return interaction.reply({ embeds: [embed] });
    }

    // Poru: No built-in nowPlayingMessage, so just reply with info
    const track = player.currentTrack;
    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setURL(track.info.uri)
        .setThumbnail(track.info.thumbnail)
        .setDescription(
            await t(interaction, 'music_helpers_handlers_music_nowplaying', {
                duration: formatDuration(track.info.length),
                author: track.info.author,
            })
        )
        .setFooter(await embedFooter(interaction));
    return interaction.reply({ embeds: [embed] });
}

/**
 * 🔁 Handles the 'loop' subcommand.
 * Sets repeat mode for track or queue.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} player - The music player instance.
 */
async function handleLoop(interaction, player) {
    let nextMode;

    // KUNCI UTAMA: Cek tipe interaksi
    if (interaction.isChatInputCommand()) {
        // Jika dari slash command, ambil mode dari options
        nextMode = interaction.options.getString('mode');
    } else {
        // Asumsi jika bukan, berarti dari Button
        // Jika dari tombol, kita putar modenya: OFF -> TRACK -> QUEUE -> OFF
        if (!player.trackRepeat && !player.queueRepeat) {
            nextMode = 'track'; // Dari mati, jadi loop lagu
        } else if (player.trackRepeat) {
            nextMode = 'queue'; // Dari loop lagu, jadi loop antrian
        } else {
            // player.queueRepeat is true
            nextMode = 'off'; // Dari loop antrian, jadi mati
        }
    }

    let embed;
    let descriptionText = ''; // Variabel untuk deskripsi

    // Logika switch-nya tetap sama, tapi sekarang pakai 'nextMode'
    switch (nextMode) {
        case 'track':
            player.trackRepeat = true;
            player.queueRepeat = false;
            descriptionText = await t(interaction, 'music_helpers_handlers_music_track');
            break;
        case 'queue':
            player.trackRepeat = false;
            player.queueRepeat = true;
            descriptionText = await t(interaction, 'music_helpers_handlers_music_queue');
            break;
        default: // case 'off'
            player.trackRepeat = false;
            player.queueRepeat = false;
            descriptionText = await t(interaction, 'music_helpers_handlers_music_off');
            break;
    }

    embed = new EmbedBuilder()
        .setColor(nextMode === 'off' ? 'Red' : kythia.bot.color)
        .setDescription(descriptionText)
        .setFooter(await embedFooter(interaction));

    // Balas interaksinya. Bisa berupa reply baru atau update dari tombol.
    return interaction.reply({ embeds: [embed] });
}

/**
 * 🔄 Handles the 'autoplay' subcommand.
 * Toggles autoplay and disables all loop modes if enabled.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} player - The music player instance.
 */
async function handleAutoplay(interaction, player) {
    let nextState;

    // Cek apakah interaksi dari slash command yang punya 'options'
    if (interaction.isChatInputCommand()) {
        const status = interaction.options.getString('status'); // Asumsi ada opsi 'status'
        nextState = status === 'enable';
    } else {
        // Jika dari tombol, toggle state saat ini
        nextState = !player.autoplay;
    }

    player.autoplay = nextState;

    // Jika autoplay diaktifkan, pastikan semua mode loop mati
    if (player.autoplay) {
        player.trackRepeat = false; // <--- CARA YANG BENAR
        player.queueRepeat = false; // <--- CARA YANG BENAR
    }

    const statusMessage = player.autoplay
        ? await t(interaction, 'music_helpers_handlers_music_autoplay_enabled_message')
        : await t(interaction, 'music_helpers_handlers_music_autoplay_disabled_message');

    const embed = new EmbedBuilder()
        .setColor(player.autoplay ? kythia.bot.color : 'Red')
        .setDescription(await t(interaction, 'music_helpers_handlers_music_autoplay_status_desc', { status: statusMessage }));

    return interaction.reply({ embeds: [embed] });
}

/**
 * 🔊 Handles the 'volume' subcommand.
 * Sets the playback volume.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} player - The music player instance.
 */
async function handleVolume(interaction, player) {
    const level = interaction.options.getInteger('level');
    player.setVolume(level);
    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setDescription(await t(interaction, 'music_helpers_handlers_music_set', { level }))
        .setFooter(await embedFooter(interaction));
    return interaction.reply({ embeds: [embed] });
}

/**
 * 🔀 Handles the 'shuffle' subcommand.
 * Shuffles the current queue.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} player - The music player instance.
 */
async function handleShuffle(interaction, player) {
    await interaction.deferReply();
    if (player.queue.length < 2) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(await t(interaction, 'music_helpers_handlers_music_enough'))
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    }
    // Poru: shuffle queue
    player.queue.shuffle();

    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setDescription(await t(interaction, 'music_helpers_handlers_music_shuffled'))
        .setFooter(await embedFooter(interaction));
    return interaction.editReply({ embeds: [embed] });
}
/**
 * ⏮️ Handles the 'back' subcommand.
 * Plays the previous track from history.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} player - The music player instance.
 */
async function handleBack(interaction, player, guildStates) {
    await interaction.deferReply();
    // 1. Ambil state (history lagu) untuk server ini
    const guildState = guildStates.get(interaction.guild.id);

    // 2. Cek kalau nggak ada history lagu
    if (!guildState || !guildState.previousTracks || guildState.previousTracks.length === 0) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            // Jangan lupa buat terjemahan baru di file bahasamu, misal: music_music_no_previous_track: "Gak ada lagu di history."
            .setDescription(await t(interaction, 'music_helpers_handlers_music_no_previous_track'))
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    }

    // 3. Ambil lagu terakhir dari history
    const previousTrack = guildState.previousTracks.shift(); // .shift() ngambil elemen pertama dari array

    // 4. (PENTING) Taruh lagu yang lagi jalan sekarang balik ke antrian paling depan
    if (player.currentTrack) {
        player.queue.unshift(player.currentTrack);
    }

    // 5. Taruh lagu dari history ke antrian paling depan (biar langsung diputar)
    player.queue.unshift(previousTrack);

    // 6. Langsung skip, yang otomatis akan muter lagu paling depan (yaitu lagu 'back' tadi)
    player.skip();

    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        // Buat terjemahan baru, misal: music_music_playing_previous: "⏮️ Memutar lagu sebelumnya: **{title}**"
        .setDescription(await t(interaction, 'music_helpers_handlers_music_playing_previous', { title: previousTrack.info.title }))
        .setFooter(await embedFooter(interaction));
    return interaction.editReply({ embeds: [embed] });
}

/**
 * 🎧 Handles the 'filter' subcommand.
 * Menampilkan UI filter dengan tombol-tombol filter (11 filter, 5-5-1), menggunakan ContainerBuilder dan collector yang tidak mati.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} player - The music player instance.
 */
async function handleFilter(interaction, player) {
    // Pastikan player.filters adalah instance customFilter
    if (!(player.filters instanceof customFilter)) {
        player.filters = new customFilter(player);
    }

    // Daftar filter dan label/emoji
    const filterList = [
        { id: 'nightcore', label: 'Nightcore', emoji: '🎶' },
        { id: 'vaporwave', label: 'Vaporwave', emoji: '🌫️' },
        { id: 'bassboost', label: 'Bassboost', emoji: '🔊' },
        { id: 'eightD', label: '8D', emoji: '🌀' },
        { id: 'karaoke', label: 'Karaoke', emoji: '🎤' },
        { id: 'vibrato', label: 'Vibrato', emoji: '🎸' },
        { id: 'tremolo', label: 'Tremolo', emoji: '🎚️' },
        { id: 'slowed', label: 'Slowed', emoji: '🐢' },
        { id: 'distortion', label: 'Distortion', emoji: '🤘' },
        { id: 'pop', label: 'Pop', emoji: '🎧' },
        { id: 'soft', label: 'Soft', emoji: '🛌' },
    ];

    // Tombol reset filter
    const resetButton = new ButtonBuilder()
        .setCustomId('filter_reset')
        .setLabel('Reset')
        // .setEmoji('♻️')
        .setStyle(ButtonStyle.Danger);

    // Bagi tombol menjadi 3 baris: 5, 5, 1
    const rows = [new ActionRowBuilder(), new ActionRowBuilder(), new ActionRowBuilder()];

    for (let i = 0; i < filterList.length; i++) {
        const filter = filterList[i];
        const btn = new ButtonBuilder()
            .setCustomId(`filter_${filter.id}`)
            .setLabel(filter.label)
            // .setEmoji(filter.emoji)
            .setStyle(ButtonStyle.Secondary);
        if (i < 5) rows[0].addComponents(btn);
        else if (i < 10) rows[1].addComponents(btn);
        else rows[2].addComponents(btn);
    }
    // Baris ke-3 juga tambahkan tombol reset
    rows[2].addComponents(resetButton);

    // ContainerBuilder untuk UI filter
    const container = new ContainerBuilder()
        .setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(await t(interaction, 'music_helpers_handlers_filter_title')))
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addActionRowComponents(rows[0])
        .addActionRowComponents(rows[1])
        .addActionRowComponents(rows[2])
        .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                await t(interaction, 'common_container_footer', { username: interaction.client.user.username })
            )
        );

    // Kirim UI filter
    let filterMsg;
    if (interaction.replied || interaction.deferred) {
        filterMsg = await interaction.editReply({
            components: [container],
            fetchReply: true,
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
        });
    } else {
        filterMsg = await interaction.reply({
            components: [container],
            fetchReply: true,
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
        });
    }

    // Collector yang tidak mati (selama player aktif)
    if (player.filterCollector) player.filterCollector.stop();
    const collector = filterMsg.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 0, // Tidak pernah mati otomatis
    });
    player.filterCollector = collector;

    collector.on('collect', async (btnInt) => {
        // Hanya user yang sama yang bisa tekan
        if (btnInt.user.id !== interaction.user.id) {
            return btnInt.reply({ content: await t(btnInt, 'music_helpers_musicManager_music_permission_denied'), ephemeral: true });
        }

        // Pastikan player.filters masih valid
        if (!(player.filters instanceof customFilter)) {
            player.filters = new customFilter(player);
        }

        // Reset
        if (btnInt.customId === 'filter_reset') {
            player.filters.clearFilters(true);
            await player.filters.updateFilters();
            await btnInt.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(kythia.bot.color)
                        .setDescription(await t(btnInt, 'music_helpers_handlers_music_filter_reset'))
                        .setFooter(await embedFooter(btnInt)),
                ],
            });
            return;
        }

        // Cek filter yang dipilih
        const filterId = btnInt.customId.replace('filter_', '');
        let applied = false;
        switch (filterId) {
            case 'nightcore':
                player.filters.setNightcore(true);
                applied = true;
                break;
            case 'vaporwave':
                player.filters.setVaporwave(true);
                applied = true;
                break;
            case 'bassboost':
                player.filters.setBassboost(true);
                applied = true;
                break;
            case 'eightD':
                player.filters.set8D(true);
                applied = true;
                break;
            case 'karaoke':
                player.filters.setKaraoke(true);
                applied = true;
                break;
            case 'vibrato':
                player.filters.setVibrato(true);
                applied = true;
                break;
            case 'tremolo':
                player.filters.setTremolo(true);
                applied = true;
                break;
            case 'slowed':
                player.filters.setSlowmode(true);
                applied = true;
                break;
            case 'distortion':
                player.filters.setDistortion(true);
                applied = true;
                break;
            case 'pop':
                player.filters.setEqualizer([
                    { band: 1, gain: 0.35 },
                    { band: 2, gain: 0.25 },
                    { band: 3, gain: 0.0 },
                    { band: 4, gain: -0.25 },
                    { band: 5, gain: -0.3 },
                    { band: 6, gain: -0.2 },
                    { band: 7, gain: -0.1 },
                    { band: 8, gain: 0.15 },
                    { band: 9, gain: 0.25 },
                ]);
                applied = true;
                break;
            case 'soft':
                player.filters.setEqualizer([
                    { band: 0, gain: 0 },
                    { band: 1, gain: 0 },
                    { band: 2, gain: 0 },
                    { band: 3, gain: 0 },
                    { band: 4, gain: 0 },
                    { band: 5, gain: 0 },
                    { band: 6, gain: 0 },
                    { band: 7, gain: 0 },
                    { band: 8, gain: -0.25 },
                    { band: 9, gain: -0.25 },
                    { band: 10, gain: -0.25 },
                    { band: 11, gain: -0.25 },
                    { band: 12, gain: -0.25 },
                    { band: 13, gain: -0.25 },
                ]);
                applied = true;
                break;
            default:
                break;
        }

        if (applied) {
            await player.filters.updateFilters();
            await btnInt.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor(kythia.bot.color)
                        .setDescription(await t(btnInt, 'music_helpers_handlers_music_filter_applied', { preset: filterId }))
                        .setFooter(await embedFooter(btnInt)),
                ],
            });
        } else {
            await btnInt.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Orange')
                        .setDescription(await t(btnInt, 'music_helpers_handlers_music_filter_not_available', { preset: filterId }))
                        .setFooter(await embedFooter(btnInt)),
                ],
            });
        }
    });

    // Bersihkan collector jika player dihancurkan
    player.on('destroy', () => {
        if (player.filterCollector) player.filterCollector.stop();
        player.filterCollector = null;
    });
}

/**
 * 🗑️ Handles the 'remove' subcommand.
 * Removes a song from the queue at the given position.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} player - The music player instance.
 */
async function handleRemove(interaction, player) {
    const position = interaction.options.getInteger('position');
    if (!Number.isInteger(position) || position < 1 || position > player.queue.length) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(await t(interaction, 'music_helpers_handlers_music_position', { size: player.queue.length }))
            .setFooter(await embedFooter(interaction));
        return interaction.reply({ embeds: [embed] });
    }
    const removed = player.queue.splice(position - 1, 1);
    if (!removed || removed.length === 0) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(await t(interaction, 'music_helpers_handlers_music_failed'))
            .setFooter(await embedFooter(interaction));
        return interaction.reply({ embeds: [embed] });
    }
    const track = removed[0];
    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setDescription(
            await t(interaction, 'music_helpers_handlers_music_removed', { title: track.info.title, url: track.info.uri, position })
        )
        .setFooter(await embedFooter(interaction));
    return interaction.reply({ embeds: [embed] });
}

/**
 * 🔀 Handles the 'move' subcommand.
 * Moves a song from one position to another in the queue.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {object} player - The music player instance.
 */
async function handleMove(interaction, player) {
    const from = interaction.options.getInteger('from');
    const to = interaction.options.getInteger('to');
    const queueSize = player.queue.length;

    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 1 || from > queueSize || to < 1 || to > queueSize) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(await t(interaction, 'music_helpers_handlers_music_positions', { size: queueSize }))
            .setFooter(await embedFooter(interaction));
        return interaction.reply({ embeds: [embed] });
    }
    if (from === to) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(await t(interaction, 'music_helpers_handlers_music_position'))
            .setFooter(await embedFooter(interaction));
        return interaction.reply({ embeds: [embed] });
    }

    const trackArr = player.queue.splice(from - 1, 1);
    const track = trackArr[0];
    if (!track) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(await t(interaction, 'music_helpers_handlers_music_found'))
            .setFooter(await embedFooter(interaction));
        return interaction.reply({ embeds: [embed] });
    }
    player.queue.splice(to - 1, 0, track);

    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setDescription(
            await t(interaction, 'music_helpers_handlers_music_moved', { title: track.info.title, url: track.info.uri, from, to })
        )
        .setFooter(await embedFooter(interaction));
    return interaction.reply({ embeds: [embed] });
}

async function handleClear(interaction, player) {
    player.queue.clear();
    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setDescription(await t(interaction, 'music_helpers_handlers_music_clear'))
        .setFooter(await embedFooter(interaction));
    return interaction.reply({ embeds: [embed] });
}

async function handleSeek(interaction, player) {
    const time = interaction.options.getInteger('time');
    player.seekTo(time * 1000);
    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setDescription(await t(interaction, 'music_helpers_handlers_music_seeked', { time: time }))
        .setFooter(await embedFooter(interaction));
    return interaction.reply({ embeds: [embed] });
}

async function handleLyrics(interaction, player) {
    await interaction.deferReply();

    const track = player.currentTrack;
    if (!track) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(await t(interaction, 'music_helpers_handlers_music_lyrics_music_not_found'));
        return interaction.editReply({ embeds: [embed] });
    }

    // --- Ambil info artis, judul, album, durasi ---
    let artist, titleForSearch, album, durationSec;
    const separators = ['-', '–', '|'];
    let potentialSplit = null;
    const originalTitle = track.info.title || '';

    for (const sep of separators) {
        if (originalTitle.includes(sep)) {
            potentialSplit = originalTitle.split(sep);
            break;
        }
    }

    if (potentialSplit && potentialSplit.length >= 2) {
        artist = potentialSplit[0].trim();
        titleForSearch = potentialSplit.slice(1).join(' ').trim();
    } else {
        artist = track.info.author || '';
        titleForSearch = originalTitle;
    }

    // Clean up noise
    const cleanUpRegex = /official|lyric|video|audio|mv|hd|hq|ft|feat/gi;
    artist = artist.replace(cleanUpRegex, '').trim();
    titleForSearch = titleForSearch.replace(cleanUpRegex, '').trim();
    titleForSearch = titleForSearch.replace(/\(.*?\)|\[.*?\]/g, '').trim();

    album = track.info.album || '';
    if (album)
        album = album
            .replace(cleanUpRegex, '')
            .replace(/\(.*?\)|\[.*?\]/g, '')
            .trim();
    durationSec = Math.round((track.info.length || 0) / 1000);

    // Fallback album if not available
    if (!album && track.info.sourceName && track.info.sourceName.toLowerCase().includes('spotify')) {
        album = track.info.album || '';
    }
    if (!album) album = '';

    // --- Query LRCLIB API ---
    let lyrics = null;
    let usedLrclib = false;
    let usedAI = false;

    try {
        // Compose query params
        const params = new URLSearchParams({
            track_name: titleForSearch,
            artist_name: artist,
            album_name: album,
            duration: durationSec,
        });

        // User-Agent for LRCLIB etiquette
        const headers = {
            'User-Agent': 'KythiaBot v0.9.8-beta (https://github.com/kenndeclouv/kythia)',
        };

        // Try /api/get first (will try external sources if not found in cache)
        const lrclibUrl = `https://lrclib.net/api/get?${params.toString()}`;
        const response = await fetch(lrclibUrl, { headers });
        if (response.status === 200) {
            const data = await response.json();
            if (data && (data.plainLyrics || data.syncedLyrics)) {
                lyrics = data.plainLyrics || data.syncedLyrics;
                usedLrclib = true;
            }
        }
    } catch (e) {
        logger.error(`LRCLIB API request failed: ${e.stack}`);
    }

    // Fallback: Try AI if enabled and LRCLIB failed
    if (!lyrics && kythia.addons.ai.geminiApiKeys && kythia.addons.music.useAI) {
        try {
            lyrics = await generateLyricsWithTranscript(artist, titleForSearch, track.info.uri);
            usedAI = !!lyrics;
        } catch (e) {
            logger.error(`Gemini AI lyrics generation failed: ${e.stack}`);
        }
    }

    // If still not found, show not found message
    if (!lyrics) {
        const embed = new EmbedBuilder()
            .setColor('Orange')
            .setDescription(await t(interaction, 'music_helpers_handlers_music_lyrics_lyrics_not_found'))
            .setFooter(await embedFooter(interaction));
        return interaction.editReply({ embeds: [embed] });
    }

    // Trim if too long
    const trimmedLyrics = lyrics.length > 4096 ? lyrics.substring(0, 4093) + '...' : lyrics;

    // Footer
    let footer;
    if (usedLrclib) {
        footer = {
            text: ' • Source: lrclib.net',
            iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
        };
    } else if (usedAI) {
        footer = {
            text: ' • Generated by AI',
            iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
        };
    } else {
        footer = await embedFooter(interaction);
    }

    // Build embed
    const embed = new EmbedBuilder()
        .setColor(kythia?.bot?.color || 'Blue')
        .setTitle(`${artist} - ${titleForSearch}`)
        .setURL(track.info.uri)
        .setThumbnail(track.info.artworkUrl ?? track.info.image)
        .setDescription(trimmedLyrics)
        .setFooter(footer);

    return interaction.editReply({ embeds: [embed] });
}
async function handlePlaylist(interaction, player) {
    await interaction.deferReply();
    const s = interaction.options.getSubcommand();
    if (s === 'save') return _handlePlaylistSave(interaction, player);
    if (s === 'load') return _handlePlaylistLoad(interaction, player);
    if (s === 'list') return _handlePlaylistList(interaction);
    if (s === 'delete') return _handlePlaylistDelete(interaction);
    if (s === 'append') return _handlePlaylistAppend(interaction, player);
    if (s === 'rename') return _handlePlaylistRename(interaction);
    if (s === 'track-remove') return _handlePlaylistRemoveTrack(interaction);
    if (s === 'track-list') return _handlePlaylistTrackList(interaction);
    if (s === 'track-add') return _handlePlaylistTrackAdd(interaction);
    if (s === 'share') return _handlePlaylistShare(interaction);
    if (s === 'import') return _handlePlaylistImport(interaction);
}

async function _handlePlaylistSave(interaction, player) {
    const client = interaction.client;
    const playlistName = interaction.options.getString('name');
    const userId = interaction.user.id;

    const playlistCount = await Playlist.countWithCache({ where: { userId } });
    let isPremium = await checkIsPremium(userId);

    if (kythia.owner.id != interaction.user.id && playlistCount >= kythia.music.playlistLimit && !isPremium) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(
                await t(interaction, 'music_helpers_handlers_music_playlist_save_limit', { count: kythia.music.playlistLimit })
            );
        return interaction.editReply({ embeds: [embed] });
    }

    if (!player || (!player.currentTrack && player.queue.length === 0)) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_save_empty_queue'));
        return interaction.editReply({ embeds: [embed] });
    }

    // Cek duplikat
    const existing = await Playlist.getCache({ userId: userId, name: playlistName });
    if (existing) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_save_duplicate', { name: playlistName }));
        return interaction.editReply({ embeds: [embed] });
    }

    const playlist = await Playlist.create({ userId, name: playlistName });

    // Simpan currentTrack (jika ada) + queue
    const tracksToSave = [];
    if (player.currentTrack) {
        tracksToSave.push({
            playlistId: playlist.id,
            title: player.currentTrack.info.title,
            identifier: player.currentTrack.info.identifier,
            author: player.currentTrack.info.author,
            length: player.currentTrack.info.length,
            uri: player.currentTrack.info.uri,
        });
    }
    for (const track of player.queue) {
        tracksToSave.push({
            playlistId: playlist.id,
            title: track.info.title,
            identifier: track.info.identifier,
            author: track.info.author,
            length: track.info.length,
            uri: track.info.uri,
        });
    }

    await PlaylistTrack.bulkCreate(tracksToSave);

    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setFooter(await embedFooter(interaction))
        .setDescription(
            await t(interaction, 'music_helpers_handlers_music_playlist_save_success', { name: playlistName, count: tracksToSave.length })
        );
    await interaction.editReply({ embeds: [embed] });
}

// Load a playlist and play it
async function _handlePlaylistLoad(interaction, player) {
    const client = interaction.client;
    const playlistName = interaction.options.getString('name');
    const userId = interaction.user.id;

    // const playlist = await Playlist.findOne({
    //   where: {
    //     userId: userId,
    //     name: playlistName,
    //   },
    //   include: [{ model: PlaylistTrack, as: 'tracks' }]
    // });
    const playlist = await Playlist.getCache({
        userId: userId,
        name: playlistName,
        include: [{ model: PlaylistTrack, as: 'tracks' }],
    });

    if (!playlist) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_load_not_found', { name: playlistName }));
        return interaction.editReply({ embeds: [embed] });
    }

    if (!playlist.tracks || playlist.tracks.length === 0) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_load_empty', { name: playlistName }));
        return interaction.editReply({ embeds: [embed] });
    }

    // Kalau sudah ada player, hapus queue lama
    if (player) {
        player.queue.clear();
        // player.destroy();
    }

    // Buat player baru jika belum ada
    const newPlayer =
        player ||
        client.poru.createConnection({
            guildId: interaction.guild.id,
            voiceChannel: interaction.member.voice.channel.id,
            textChannel: interaction.channel.id,
            deaf: true,
        });

    let added = 0;
    for (const trackData of playlist.tracks) {
        const poruTrack = await client.poru.resolve({ query: trackData.uri, requester: interaction.user });
        if (poruTrack.tracks && poruTrack.tracks[0]) {
            newPlayer.queue.add(poruTrack.tracks[0]);
            added++;
        }
    }

    if (!newPlayer.isPlaying) newPlayer.play();

    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setFooter(await embedFooter(interaction))
        .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_load_success', { count: added, name: playlistName }));
    await interaction.editReply({ embeds: [embed] });
}

// List all playlists for the user, paginated with ContainerBuilder
async function _handlePlaylistList(interaction) {
    const client = interaction.client;
    const userId = interaction.user.id;

    const playlists = await Playlist.getAllCache({
        where: { userId: userId },
        order: [['name', 'ASC']],
    });

    if (!playlists || playlists.length === 0) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_list_empty'));
        return interaction.editReply({ embeds: [embed] });
    }

    // Pagination setup
    const itemsPerPage = 10;
    const totalPages = Math.ceil(playlists.length / itemsPerPage) || 1;

    // Helper to create the paginated container
    async function createPlaylistListContainer(page = 1) {
        page = Math.max(1, Math.min(page, totalPages));
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const currentPagePlaylists = playlists.slice(start, end);

        const list = currentPagePlaylists.map((p, idx) => `**${start + idx + 1}.** ${p.name}`).join('\n');

        // Navigation buttons
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`playlistlist_prev_${page}`)
                .setEmoji('◀️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 1),
            new ButtonBuilder()
                .setCustomId(`playlistlist_next_${page}`)
                .setEmoji('▶️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === totalPages)
        );

        // ContainerBuilder for playlist list
        const container = new ContainerBuilder()
            .setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${await t(interaction, 'music_helpers_handlers_music_playlist_list_title')}`)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(list || (await t(interaction, 'music_helpers_handlers_music_playlist_list_empty')))
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addActionRowComponents(buttons)
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    await t(interaction, 'music_helpers_handlers_queue_footer', {
                        page: page,
                        totalPages: totalPages,
                        totalTracks: playlists.length,
                    })
                )
            );

        return {
            components: [container],
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            fetchReply: true,
        };
    }

    // Initial page
    let initialPage = 1;
    if (interaction.isChatInputCommand()) {
        initialPage = interaction.options.getInteger('page') || 1;
    }

    const messageOptions = await createPlaylistListContainer(initialPage);
    const message = await interaction.editReply(messageOptions);

    // Collector for navigation
    const collector = message.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: 5 * 60 * 1000, // 5 minutes
    });

    collector.on('collect', async (buttonInteraction) => {
        const [prefix, action, currentPageStr] = buttonInteraction.customId.split('_');
        let currentPage = parseInt(currentPageStr, 10);

        if (action === 'next') {
            currentPage++;
        } else if (action === 'prev') {
            currentPage--;
        }

        const updatedMessageOptions = await createPlaylistListContainer(currentPage);
        await buttonInteraction.update(updatedMessageOptions);
    });

    collector.on('end', async () => {
        // Remove buttons after collector ends
        if (message.editable) {
            const finalState = await createPlaylistListContainer(1);
            finalState.components = [];
            await message.edit(finalState).catch(() => {});
        }
    });
}

// Delete a playlist
async function _handlePlaylistDelete(interaction) {
    const client = interaction.client;
    const playlistName = interaction.options.getString('name');
    const userId = interaction.user.id;

    const playlist = await Playlist.getCache({ userId: userId, name: playlistName });
    if (!playlist) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_delete_not_found', { name: playlistName }));
        return interaction.editReply({ embeds: [embed] });
    }

    await PlaylistTrack.destroy({ where: { playlistId: playlist.id } });
    await playlist.destroy();

    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setFooter(await embedFooter(interaction))
        .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_delete_success', { name: playlistName }));
    await interaction.editReply({ embeds: [embed] });
}

async function _handlePlaylistAppend(interaction, player) {
    const { client, user } = interaction;
    const playlistName = interaction.options.getString('name');

    // Cek dulu, harus ada lagu yang jalan buat nambahin ke antriannya
    if (!player) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_append_no_player')); // "Nggak ada musik yang lagi jalan. Putar lagu dulu baru bisa nambahin dari playlist."
        return interaction.editReply({ embeds: [embed] });
    }

    // Ambil playlist dari database
    const playlist = await Playlist.getCache({
        userId: user.id,
        name: playlistName,
        include: { model: PlaylistTrack, as: 'tracks' },
    });

    if (!playlist) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_load_not_found', { name: playlistName }));
        return interaction.editReply({ embeds: [embed] });
    }

    if (!playlist.tracks || playlist.tracks.length === 0) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_load_empty', { name: playlistName }));
        return interaction.editReply({ embeds: [embed] });
    }

    let addedCount = 0;
    // Loop semua lagu di playlist, resolve, dan tambahin ke antrian
    for (const trackData of playlist.tracks) {
        const res = await client.poru.resolve({ query: trackData.uri, requester: user });
        if (res && res.tracks.length) {
            player.queue.add(res.tracks[0]);
            addedCount++;
        }
    }

    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setFooter(await embedFooter(interaction))
        .setDescription(
            await t(interaction, 'music_helpers_handlers_music_playlist_append_success_v2', { count: addedCount, name: playlistName })
        ); // Buat terjemahan baru: "✅ Berhasil menambahkan **{count}** lagu dari playlist **{name}** ke antrian."
    await interaction.editReply({ embeds: [embed] });
}

// Remove a track from a playlist by its position (1-based)
async function _handlePlaylistRemoveTrack(interaction) {
    const client = interaction.client;
    const playlistName = interaction.options.getString('name');
    const position = interaction.options.getInteger('position');
    const userId = interaction.user.id;

    const playlist = await Playlist.getCache({
        userId: userId,
        name: playlistName,
        include: [{ model: PlaylistTrack, as: 'tracks', order: [['id', 'ASC']] }],
    });

    if (!playlist) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_remove_track_not_found', { name: playlistName }));
        return interaction.editReply({ embeds: [embed] });
    }
    if (!playlist.tracks || playlist.tracks.length === 0) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_remove_track_empty', { name: playlistName }));
        return interaction.editReply({ embeds: [embed] });
    }
    if (position < 1 || position > playlist.tracks.length) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_remove_track_invalid_position'));
        return interaction.editReply({ embeds: [embed] });
    }

    const track = playlist.tracks[position - 1];
    await track.destroy();

    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setFooter(await embedFooter(interaction))
        .setDescription(
            await t(interaction, 'music_helpers_handlers_music_playlist_remove_track_success', { position, name: playlistName })
        );
    await interaction.editReply({ embeds: [embed] });
}

// Rename a playlist
async function _handlePlaylistRename(interaction) {
    const client = interaction.client;
    const playlistName = interaction.options.getString('name');
    const newName = interaction.options.getString('new_name');
    const userId = interaction.user.id;

    const playlist = await Playlist.getCache({ userId: userId, name: playlistName });
    if (!playlist) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_rename_not_found', { name: playlistName }));
        return interaction.editReply({ embeds: [embed] });
    }

    // Cek duplikat nama baru
    const existing = await Playlist.getCache({ userId: userId, name: newName });
    if (existing) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_rename_duplicate', { name: newName }));
        return interaction.editReply({ embeds: [embed] });
    }

    playlist.name = newName;
    await playlist.saveAndUpdateCache();

    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setFooter(await embedFooter(interaction))
        .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_rename_success', { oldName: playlistName, newName }));
    await interaction.editReply({ embeds: [embed] });
}

async function _handlePlaylistTrackList(interaction) {
    const client = interaction.client;
    const playlistName = interaction.options.getString('name');
    const userId = interaction.user.id;

    // Fetch playlist and include tracks
    const playlist = await Playlist.getCache({
        userId: userId,
        name: playlistName,
        include: [{ model: PlaylistTrack, as: 'tracks' }],
    });

    if (!playlist) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_track_list_not_found', { name: playlistName }));
        return interaction.editReply({ embeds: [embed] });
    }

    if (!playlist.tracks || playlist.tracks.length === 0) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setFooter(await embedFooter(interaction))
            .setDescription(await t(interaction, 'music_helpers_handlers_music_playlist_track_list_empty', { name: playlistName }));
        return interaction.editReply({ embeds: [embed] });
    }

    // Pagination setup
    const itemsPerPage = 10;
    const totalPages = Math.ceil(playlist.tracks.length / itemsPerPage) || 1;

    // Helper to create the paginated container
    async function createTrackListContainer(page = 1) {
        page = Math.max(1, Math.min(page, totalPages));
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const currentTracks = playlist.tracks.slice(start, end);

        const trackList = currentTracks.map((t, i) => `**${start + i + 1}.** [${t.title}](${t.uri})`).join('\n');

        // Navigation buttons
        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`playlisttracklist_prev_${page}`)
                .setEmoji('◀️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 1),
            new ButtonBuilder()
                .setCustomId(`playlisttracklist_next_${page}`)
                .setEmoji('▶️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === totalPages)
        );

        // ContainerBuilder for track list
        const container = new ContainerBuilder()
            .setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    `${(await t(interaction, 'music_helpers_handlers_music_playlist_track_list_title', { name: playlistName })) || playlistName}`
                )
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(trackList || (await t(interaction, 'music_helpers_handlers_music_more')))
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addActionRowComponents(buttons)
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    await t(interaction, 'music_helpers_handlers_queue_footer', {
                        page: page,
                        totalPages: totalPages,
                        totalTracks: playlist.tracks.length,
                    })
                )
            );

        return {
            components: [container],
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            fetchReply: true,
        };
    }

    // Initial page
    let initialPage = 1;
    const messageOptions = await createTrackListContainer(initialPage);

    // Send initial message
    const message = await interaction.editReply(messageOptions);

    // Collector for navigation buttons
    const collector = message.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: 5 * 60 * 1000, // 5 minutes
    });

    collector.on('collect', async (buttonInteraction) => {
        const [action, currentPageStr] = buttonInteraction.customId.split('_').slice(1);
        let currentPage = parseInt(currentPageStr, 10);

        if (action === 'next') {
            currentPage++;
        } else if (action === 'prev') {
            currentPage--;
        }

        const updatedMessageOptions = await createTrackListContainer(currentPage);

        await buttonInteraction.update(updatedMessageOptions);
    });

    collector.on('end', async () => {
        // Remove buttons after collector ends
        if (message.editable) {
            const finalState = await createTrackListContainer(1);
            finalState.components = []; // Remove buttons
            await message.edit(finalState).catch(() => {});
        }
    });
}

async function _handlePlaylistTrackAdd(interaction) {
    const { client, user } = interaction;
    const playlistName = interaction.options.getString('name');
    const query = interaction.options.getString('search');

    // 1. Cari dulu playlist-nya
    const playlist = await Playlist.getCache({ userId: user.id, name: playlistName });
    if (!playlist) {
        return interaction.editReply({
            content: await t(interaction, 'music_helpers_handlers_music_playlist_load_not_found', { name: playlistName }),
        });
    }

    // 2. Cari lagunya pake Poru
    const res = await client.poru.resolve({ query, requester: user });
    if (!res || !res.tracks || res.tracks.length === 0) {
        return interaction.editReply({ content: await t(interaction, 'music_helpers_handlers_music_play_no_results') });
    }

    const trackToAdd = res.tracks[0];

    // 3. (PENTING) Cek biar lagunya nggak duplikat di dalem playlist
    const existingTrack = await PlaylistTrack.getCache({
        // userId: user.id,
        playlistId: playlist.id,
        // name: playlistName,
        identifier: trackToAdd.info.identifier,
    });

    if (existingTrack) {
        return interaction.editReply({
            content: await t(interaction, 'music_helpers_handlers_music_playlist_track_add_duplicate', {
                track: trackToAdd.info.title,
                name: playlistName,
            }),
        });
    }

    // 4. Simpen lagu ke database
    try {
        await _saveTracksToPlaylist(playlist, [trackToAdd]);

        await interaction.editReply({
            content: await t(interaction, 'music_helpers_handlers_music_playlist_track_add_success', {
                track: trackToAdd.info.title,
                name: playlistName,
            }),
        });
    } catch (e) {
        logger.error('Error adding track to playlist:', e);
        await interaction.editReply({ content: await t(interaction, 'music_helpers_handlers_music_playlist_track_add_error') });
    }
}

async function _handlePlaylistShare(interaction) {
    const playlistName = interaction.options.getString('name');
    const userId = interaction.user.id;

    // 1. Find user's playlist
    const playlist = await Playlist.getCache({ userId: userId, name: playlistName });
    if (!playlist) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                `${await t(interaction, 'music_helpers_handlers_playlist_share_not_found_title')}\n${await t(
                    interaction,
                    'music_helpers_handlers_playlist_share_not_found_desc',
                    { name: playlistName }
                )}`
            );
        return interaction.editReply({ embeds: [embed] });
    }

    let shareCode = playlist.shareCode;

    // 2. If playlist does not have a share code, generate one
    if (!shareCode) {
        shareCode = `KYPL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        playlist.shareCode = shareCode;
        await playlist.saveAndUpdateCache();
    }

    // 3. Show the code to the user
    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setDescription(
            `${await t(interaction, 'music_helpers_handlers_playlist_share_title', { name: playlist.name })}\n${await t(
                interaction,
                'music_helpers_handlers_playlist_share_desc'
            )}\n\n**${await t(interaction, 'music_helpers_handlers_playlist_share_code_label')}**: \`${shareCode}\``
        );

    await interaction.editReply({ embeds: [embed] });
}

/**
 * 📥 Import playlist from share code or Spotify URL.
 */
async function _handlePlaylistImport(interaction) {
    const codeOrUrl = interaction.options.getString('code');
    const userId = interaction.user.id;
    const { client } = interaction;

    // Check if this is a Spotify URL
    if (/^https?:\/\/open\.spotify\.com\/playlist\/[a-zA-Z0-9]+/i.test(codeOrUrl.trim())) {
        return _importFromSpotify(interaction, codeOrUrl);
    }

    try {
        // 1. Find the original playlist by share code
        const originalPlaylist = await Playlist.getCache({
            shareCode: codeOrUrl,
            include: [{ model: PlaylistTrack, as: 'tracks' }],
        });

        if (!originalPlaylist) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    `${await t(interaction, 'music_helpers_handlers_playlist_import_invalid_title')}\n${await t(
                        interaction,
                        'music_helpers_handlers_playlist_import_invalid_desc'
                    )}`
                );
            return interaction.editReply({ embeds: [embed] });
        }

        // --- Copy playlist logic ---
        let newPlaylistName = originalPlaylist.name;

        // Check for duplicate name for importing user
        const existing = await Playlist.getCache({ userId: userId, name: newPlaylistName });
        if (existing) {
            newPlaylistName = `${newPlaylistName} (Share)`;
        }

        // Check playlist limit
        const playlistCount = await Playlist.countWithCache({ userId: userId });
        const isPremium = await checkIsPremium(userId);
        if (kythia.owner.id !== userId && playlistCount >= kythia.music.playlistLimit && !isPremium) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    `${await t(interaction, 'music_helpers_handlers_music_playlist_save_limit_title')}\n${await t(
                        interaction,
                        'music_helpers_handlers_music_playlist_save_limit',
                        { count: kythia.music.playlistLimit }
                    )}`
                );
            return interaction.editReply({ embeds: [embed] });
        }

        // 2. Create a new playlist for the current user
        const newPlaylist = await Playlist.create({
            userId: userId,
            name: newPlaylistName,
        });

        // 3. Copy all tracks from the original playlist to the new playlist
        const tracksToCopy = originalPlaylist.tracks.map((track) => ({
            playlistId: newPlaylist.id,
            title: track.title,
            identifier: track.identifier,
            author: track.author,
            length: track.length,
            uri: track.uri,
        }));

        await PlaylistTrack.bulkCreate(tracksToCopy);

        const embed = new EmbedBuilder()
            .setColor(kythia.bot.color)
            .setDescription(
                `${await t(interaction, 'music_helpers_handlers_playlist_import_success_title')}\n${await t(
                    interaction,
                    'music_helpers_handlers_playlist_import_success_desc',
                    { original: originalPlaylist.name, name: newPlaylist.name, count: tracksToCopy.length }
                )}`
            );

        return interaction.editReply({ embeds: [embed] });
    } catch (error) {
        logger.error('Playlist import from code failed:', error);
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(
                `${await t(interaction, 'music_helpers_handlers_playlist_import_error_title')}\n${await t(interaction, 'music_helpers_handlers_playlist_import_error_desc')}`
            );
        return interaction.editReply({ embeds: [embed] });
    }
}

// Pindahkan logika import Spotify ke sini agar rapi
async function _importFromSpotify(interaction, url) {
    // Salin logika import Spotify dari _handlePlaylistImport lama
    const { client, user } = interaction;
    const userId = user.id;

    const res = await client.poru.resolve({
        query: url,
        requester: user,
    });
    if (!res || res.loadType !== 'PLAYLIST_LOADED' || !res.tracks.length) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(await t(interaction, 'music_helpers_handlers_playlist_import_failed'));
        return interaction.editReply({ embeds: [embed] });
    }

    const spotifyPlaylistName = res.playlistInfo.name;
    const tracksFromSpotify = res.tracks;

    // Cek duplikat nama playlist di database
    const existingPlaylist = await Playlist.getCache({ userId: userId, name: spotifyPlaylistName });

    if (existingPlaylist) {
        // --- BAGIAN BARU: TAMPILKAN TOMBOL ---
        const embed = new EmbedBuilder()
            .setColor('Yellow')
            .setDescription(await t(interaction, 'music_helpers_handlers_playlist_import_duplicate_prompt', { name: spotifyPlaylistName }));

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('import_overwrite')
                .setLabel(await t(interaction, 'music_helpers_handlers_playlist_import_btn_overwrite'))
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('import_copy')
                .setLabel(await t(interaction, 'music_helpers_handlers_playlist_import_btn_copy'))
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('import_cancel')
                .setLabel(await t(interaction, 'music_helpers_handlers_playlist_import_btn_cancel'))
                .setStyle(ButtonStyle.Secondary)
        );

        const reply = await interaction.editReply({ embeds: [embed], components: [row] });

        // Tunggu interaksi tombol dari user yang sama, selama 60 detik
        const collector = reply.createMessageComponentCollector({
            filter: (i) => i.user.id === user.id,
            time: 60000,
        });

        collector.on('collect', async (i) => {
            await i.deferUpdate();

            if (i.customId === 'import_overwrite') {
                // Hapus semua lagu lama dari playlist yang ada
                await PlaylistTrack.destroy({ where: { playlistId: existingPlaylist.id } });
                await _saveTracksToPlaylist(existingPlaylist, tracksFromSpotify);

                const successEmbed = new EmbedBuilder().setColor(kythia.bot.color).setDescription(
                    await t(interaction, 'music_helpers_handlers_playlist_import_overwrite_success', {
                        count: tracksFromSpotify.length,
                        name: spotifyPlaylistName,
                        source: 'spotify',
                    })
                );
                await i.editReply({ embeds: [successEmbed], components: [] });
            } else if (i.customId === 'import_copy') {
                let newName = '';
                let copyNum = 1;
                let isNameAvailable = false;

                // Cari nama yang tersedia, misal "Favorites (1)", "Favorites (2)", dst.
                while (!isNameAvailable) {
                    newName = `${spotifyPlaylistName} (${copyNum})`;
                    const check = await Playlist.getCache({ userId: userId, name: newName });
                    if (!check) {
                        isNameAvailable = true;
                    } else {
                        copyNum++;
                    }
                }

                const newPlaylist = await Playlist.create({ userId, name: newName });
                await _saveTracksToPlaylist(newPlaylist, tracksFromSpotify);

                const successEmbed = new EmbedBuilder().setColor(kythia.bot.color).setDescription(
                    await t(interaction, 'music_helpers_handlers_playlist_import_copy_success', {
                        count: tracksFromSpotify.length,
                        newName: newName,
                        source: 'spotify',
                    })
                );
                await i.editReply({ embeds: [successEmbed], components: [] });
            } else if (i.customId === 'import_cancel') {
                const cancelEmbed = new EmbedBuilder()
                    .setColor('Grey')
                    .setDescription(await t(interaction, 'music_helpers_handlers_playlist_import_cancelled'));
                await i.editReply({ embeds: [cancelEmbed], components: [] });
            }
            collector.stop();
        });

        collector.on('end', async (collected, reason) => {
            if (reason === 'time') {
                const timeoutEmbed = new EmbedBuilder()
                    .setColor('Red')
                    .setDescription(await t(interaction, 'music_helpers_handlers_playlist_import_timeout'));
                interaction.editReply({ embeds: [timeoutEmbed], components: [] });
            }
        });
    } else {
        // --- KODE LAMA JIKA PLAYLIST BELUM ADA ---
        // Cek limit playlist (hanya jika membuat playlist baru)
        const playlistCount = await Playlist.countWithCache({ userId: userId });
        const isPremium = await checkIsPremium(userId);
        if (kythia.owner.id !== userId && playlistCount >= kythia.music.playlistLimit && !isPremium) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(
                    await t(interaction, 'music_helpers_handlers_music_playlist_save_limit', { count: kythia.music.playlistLimit })
                );
            return interaction.editReply({ embeds: [embed] });
        }

        const newPlaylist = await Playlist.create({ userId, name: spotifyPlaylistName });
        await _saveTracksToPlaylist(newPlaylist, tracksFromSpotify);

        const embed = new EmbedBuilder().setColor(kythia.bot.color).setDescription(
            await t(interaction, 'music_helpers_handlers_playlist_import_success', {
                count: tracksFromSpotify.length,
                name: spotifyPlaylistName,
                source: 'spotify',
            })
        );
        await interaction.editReply({ embeds: [embed] });
    }
}

async function _saveTracksToPlaylist(playlist, tracks) {
    const tracksToSave = tracks.map((track) => ({
        playlistId: playlist.id,
        title: track.info.title,
        identifier: track.info.identifier,
        author: track.info.author,
        length: track.info.length,
        uri: track.info.uri,
    }));
    await PlaylistTrack.bulkCreate(tracksToSave);
}

async function handleFavorite(interaction, player) {
    let s;
    if (interaction.isChatInputCommand()) {
        s = interaction.options.getSubcommand();
    } else {
        s = interaction.customId.split('_')[2];
    }
    if (s === 'play') return _handleFavoritePlay(interaction, player);
    if (s === 'list') return _handleFavoriteList(interaction);
    if (s === 'add') return _handleFavoriteAdd(interaction, player);
    if (s === 'remove') return _handleFavoriteRemove(interaction);
}

// Play all favorites for the user (replace queue)
async function _handleFavoritePlay(interaction, player) {
    await interaction.deferReply();

    const append = interaction.options.getBoolean('append') || false;
    const client = interaction.client;
    const userId = interaction.user.id;

    // Get all favorites for the user
    const favorites = await Favorite.findAll({ where: { userId }, order: [['createdAt', 'ASC']] });

    if (!favorites || favorites.length === 0) {
        const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'music_helpers_handlers_favorite_play_empty'));
        return interaction.editReply({ embeds: [embed] });
    }

    if (player && !append) {
        player.queue.clear();
    }

    // Create player if not exists
    const newPlayer =
        player ||
        client.poru.createConnection({
            guildId: interaction.guild.id,
            voiceChannel: interaction.member.voice.channel.id,
            textChannel: interaction.channel.id,
            deaf: true,
        });

    let added = 0;
    for (const fav of favorites) {
        const poruTrack = await client.poru.resolve({ query: fav.uri, requester: interaction.user });
        if (poruTrack.tracks && poruTrack.tracks[0]) {
            newPlayer.queue.add(poruTrack.tracks[0]);
            added++;
        }
    }

    if (!newPlayer.isPlaying) newPlayer.play();

    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setDescription(await t(interaction, 'music_helpers_handlers_favorite_play_success', { count: added }));
    await interaction.editReply({ embeds: [embed] });
}

// List all favorites for the user, paginated
async function _handleFavoriteList(interaction) {
    await interaction.deferReply();
    const userId = interaction.user.id;

    const favorites = await Favorite.getAllCache({
        where: { userId },
        order: [['createdAt', 'ASC']],
    });

    if (!favorites || favorites.length === 0) {
        const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'music_helpers_handlers_favorite_list_empty'));
        return interaction.editReply({ embeds: [embed] });
    }

    // Pagination setup
    const itemsPerPage = 10;
    const totalPages = Math.ceil(favorites.length / itemsPerPage) || 1;

    async function createFavoriteListContainer(page = 1) {
        page = Math.max(1, Math.min(page, totalPages));
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const currentPageFavorites = favorites.slice(start, end);

        const list = currentPageFavorites.map((f, idx) => `**${start + idx + 1}.** [${f.title}](${f.uri})`).join('\n');

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`favoritelist_prev_${page}`)
                .setEmoji('◀️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 1),
            new ButtonBuilder()
                .setCustomId(`favoritelist_next_${page}`)
                .setEmoji('▶️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === totalPages)
        );

        const container = new ContainerBuilder()
            .setAccentColor(convertColor(kythia.bot.color, { from: 'hex', to: 'decimal' }))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`${await t(interaction, 'music_helpers_handlers_favorite_list_title')}`)
            )
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(list || (await t(interaction, 'music_helpers_handlers_favorite_list_empty')))
            )
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addActionRowComponents(buttons)
            .addSeparatorComponents(new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    await t(interaction, 'music_helpers_handlers_queue_footer', {
                        page: page,
                        totalPages: totalPages,
                        totalTracks: favorites.length,
                    })
                )
            );

        return {
            components: [container],
            flags: MessageFlags.IsPersistent | MessageFlags.IsComponentsV2,
            fetchReply: true,
        };
    }

    // Initial page
    let initialPage = 1;
    if (interaction.isChatInputCommand()) {
        initialPage = interaction.options.getInteger('page') || 1;
    }

    const messageOptions = await createFavoriteListContainer(initialPage);
    const message = await interaction.editReply(messageOptions);

    // Collector for navigation
    const collector = message.createMessageComponentCollector({
        filter: (i) => i.user.id === interaction.user.id,
        time: 5 * 60 * 1000, // 5 minutes
    });

    collector.on('collect', async (buttonInteraction) => {
        const [prefix, action, currentPageStr] = buttonInteraction.customId.split('_');
        let currentPage = parseInt(currentPageStr, 10);

        if (action === 'next') {
            currentPage++;
        } else if (action === 'prev') {
            currentPage--;
        }

        const updatedMessageOptions = await createFavoriteListContainer(currentPage);
        await buttonInteraction.update(updatedMessageOptions);
    });

    collector.on('end', async () => {
        // Remove buttons after collector ends
        if (message.editable) {
            const finalState = await createFavoriteListContainer(1);
            finalState.components = [];
            await message.edit(finalState).catch(() => {});
        }
    });
}

// Add current track to favorites
async function _handleFavoriteAdd(interaction, player) {
    await interaction.deferReply();

    const userId = interaction.user.id;
    let track;

    if (interaction.isChatInputCommand()) {
        const query = interaction.options.getString('search');
        const res = await interaction.client.poru.resolve({ query, requester: interaction.user });
        if (!res || !res.tracks || res.tracks.length === 0) {
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setDescription(await t(interaction, 'music_helpers_handlers_favorite_add_no_track'));
            return interaction.editReply({ embeds: [embed] });
        }
        track = res.tracks[0];
    } else {
        track = player?.currentTrack;
    }

    // Only allow adding if there is a current track
    if (!track) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(await t(interaction, 'music_helpers_handlers_favorite_add_no_track'));
        return interaction.editReply({ embeds: [embed] });
    }

    // Check for duplicate
    const existing = await Favorite.findOne({
        where: {
            userId,
            identifier: track.info.identifier,
        },
    });

    if (existing) {
        const embed = new EmbedBuilder()
            .setColor('Yellow')
            .setDescription(
                await t(interaction, 'music_helpers_handlers_favorite_add_duplicate', { title: track.info.title || track.info.name })
            );
        return interaction.editReply({ embeds: [embed] });
    }

    // Add to favorites
    await Favorite.create({
        userId,
        identifier: track.info.identifier,
        title: track.info.title,
        author: track.info.author,
        length: track.info.length,
        uri: track.info.uri,
    });

    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setDescription(
            await t(interaction, 'music_helpers_handlers_favorite_add_success', { title: track.info.title || track.info.name })
        );
    await interaction.editReply({ embeds: [embed] });
}

// Remove a track from favorites by its position (1-based)
async function _handleFavoriteRemove(interaction) {
    await interaction.deferReply();

    const userId = interaction.user.id;
    const name = interaction.options.getString('name');

    // Get all favorites ordered
    const favorite = await Favorite.getCache({
        userId: userId,
        title: name,
    });

    if (!favorite) {
        const embed = new EmbedBuilder().setColor('Red').setDescription(await t(interaction, 'music_helpers_handlers_favorite_list_empty'));
        return interaction.editReply({ embeds: [embed] });
    }

    if (!favorite) {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setDescription(await t(interaction, 'music_helpers_handlers_favorite_remove_invalid_name'));
        return interaction.editReply({ embeds: [embed] });
    }

    await favorite.destroy();

    const embed = new EmbedBuilder()
        .setColor(kythia.bot.color)
        .setDescription(await t(interaction, 'music_helpers_handlers_favorite_remove_success', { title: favorite.title }));
    await interaction.editReply({ embeds: [embed] });
}

module.exports = {
    handlePlay,
    handlePause,
    handleResume,
    handlePauseResume,
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
    handleLyrics,
    handlePlaylist,
    handleFavorite,
};
