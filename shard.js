// shard.js
require('dotenv').config();
require('./kythia.config.js');
require('module-alias/register');

const { ShardingManager } = require('discord.js');
const path = require('path');
const logger = require('@utils/logger');

const manager = new ShardingManager(path.join(__dirname, 'index.js'), {
    token: kythia.bot.token,
    totalShards: 'auto',
    respawn: true, // Will be disabled during shutdown
});

manager.on('shardCreate', (shard) => {
    logger.info(`🚀 [MANAGER] Shard #${shard.id} berhasil diluncurkan.`);
    shard.on('disconnect', () => logger.warn(`🔌 [SHARD #${shard.id}] Terputus.`));
    shard.on('reconnecting', () => logger.info(`... [SHARD #${shard.id}] Mencoba menyambung kembali...`));
    shard.on('death', (process) => logger.error(`💀 [SHARD #${shard.id}] Mati dengan kode keluar: ${process.exitCode}`));
});

// --- BAGIAN PENTING ADA DI SINI ---
let isShuttingDown = false;

const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info('🛑 [MANAGER] Sinyal shutdown diterima! Mematikan respawn dan memberi tahu shard...');

    // Disable respawn by setting the manager's respawn property to false
    // This prevents new shards from being spawned
    if (manager.respawn !== undefined) {
        manager.respawn = false;
        logger.info('✅ [MANAGER] Respawn disabled on manager level');
    }

    // Kirim sinyal shutdown ke semua shard
    const shutdownPromises = manager.shards.map(async (shard) => {
        try {
            await shard.send({ type: 'gracefulShutdown' });
            logger.info(`✅ [MANAGER] Shard #${shard.id} menerima sinyal shutdown`);
        } catch (error) {
            logger.warn(`⚠️ [MANAGER] Gagal mengirim sinyal ke shard #${shard.id}:`, error.message);
        }
    });

    await Promise.allSettled(shutdownPromises);

    logger.info('✅ [MANAGER] Semua shard sudah diberi tahu. Menunggu 10 detik sebelum keluar paksa...');

    // Tunggu sebentar untuk memastikan shard sudah shutdown
    setTimeout(() => {
        logger.info('👋 [MANAGER] Goodbye!');
        process.exit(0);
    }, 10000);
};
// ------------------------------------

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

manager.spawn().catch((err) => {
    logger.error('❌ [MANAGER] Gagal melahirkan shard:', err);
});
