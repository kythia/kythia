/**
 * @namespace: addons/music/register.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const MusicManager = require('./helpers/MusicManager');
const MusicHandlers = require('./helpers/MusicHandlers');

module.exports = {
    async initialize(bot) {
        const container = bot.client.container;
        const { logger, models } = container;
        const summary = [];

        container.musicHandlers = new MusicHandlers(container);
        summary.push('   └─ 🎵 Music Handlers Injected');

        container.music = new MusicManager(container);
        await container.music.init();

        summary.push('   └─ 🎵 Initialize Music Manager');

        bot.addDbReadyHook((sequelize) => {
            const { Playlist, PlaylistTrack } = sequelize.models;

            if (Playlist && PlaylistTrack) {
                Playlist.hasMany(PlaylistTrack, { foreignKey: 'playlistId', as: 'tracks' });
                PlaylistTrack.belongsTo(Playlist, { foreignKey: 'playlistId', as: 'playlist' });
            }
        });
        summary.push('   └─ 🎵 Model associations registered.');

        bot.addClientReadyHook(async (client) => {
            logger.info('🎵 [24/7 Resurrector] Checking persistent 24/7 sessions...');

            const Music247 = container.models.Music247;
            if (!Music247) {
                logger.warn('🎵 [24/7 Resurrector] Music247 model not found. Skipping.');
                return;
            }

            const sessions = await Music247.findAll();
            if (sessions.length === 0) {
                logger.info('🎵 [24/7 Resurrector] No active sessions found.');
                return;
            }

            let restoredCount = 0;
            for (const session of sessions) {
                try {
                    const guild = await client.guilds.fetch(session.guildId);
                    const voiceChannel = await guild.channels.fetch(session.voiceChannelId);
                    const textChannel = await guild.channels.fetch(session.textChannelId);

                    if (!guild || !voiceChannel || !textChannel) {
                        throw new Error('Guild/Channel not found');
                    }

                    const player = client.poru.createConnection({
                        guildId: guild.id,
                        voiceChannel: voiceChannel.id,
                        textChannel: textChannel.id,
                        deaf: true,
                    });

                    player._247 = true;

                    restoredCount++;
                } catch (e) {
                    logger.warn(`🎵 [24/7 Resurrector] Failed to restore ${session.guildId}: ${e.message}. Removing from DB.`);
                    await session.destroy();
                }
            }
            logger.info(`🎵 [24/7 Resurrector] Successfully restored ${restoredCount}/${sessions.length} sessions.`);
        });
        summary.push('   └─ 🎵 24/7 Resurrector Hook is Active');

        return summary;
    },
};
