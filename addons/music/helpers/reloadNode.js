/**
 * @namespace: addons/music/helpers/reloadNode.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const logger = require('@utils/logger');
const { reloadConfig } = require('@utils/reload_config');

/**
 * Fungsi untuk me-reload koneksi ke node Lavalink.
 * Ini bisa ditaruh di file command terpisah (misal: /reload-nodes).
 * @param {object} client - Discord client instance.
 */
async function reloadLavalinkNodes(client) {
    logger.info('🔄 Attempting to reload Lavalink nodes...');
    reloadConfig();
    // 1. Asumsikan kamu punya cara untuk reload config dari .env
    //    Misalnya dengan library `dotenv` yang di-call ulang.
    //    Ini langkah krusial!
    //    require('dotenv').config({ override: true });
    //    // Lalu update object config globalmu (kythia)

    // 2. Disconnect dan hapus semua node yang ada
    for (const node of client.poru.nodes.values()) {
        try {
            await node.disconnect();
            logger.info(`🔌 Disconnected from node "${node.name}".`);
        } catch (e) {
            logger.warn(`⚠️ Failed to disconnect from node "${node.name}": ${e.message}`);
        }
    }
    client.poru.nodes.clear();
    logger.info('All old nodes have been cleared.');

    // 3. Baca ulang konfigurasi node dari object config kamu yang sudah di-update
    const newNodes = (kythia.addons.music.lavalink.hosts || 'localhost').split(',').map((host, i) => ({
        name: `kythia-${i}`, // Beri nama unik untuk menghindari konflik
        host: host.trim(),
        port: parseInt((kythia.addons.music.lavalink.ports || '2333').split(',')[i] || '2333', 10),
        password: (kythia.addons.music.lavalink.passwords || 'youshallnotpass').split(',')[i] || 'youshallnotpass',
        secure: ((kythia.addons.music.lavalink.secures || 'false').split(',')[i] || 'false').toLowerCase() === 'true',
    }));

    // 4. Tambahkan node baru ke Poru
    for (const nodeConfig of newNodes) {
        client.poru.addNode(nodeConfig);
    }
    logger.info(`✅ Added ${newNodes.length} new node(s) to Poru.`);

    // 5. Pindahkan semua player yang sedang aktif ke node terbaik yang tersedia
    // 5. Tunggu node baru connect, lalu pindahkan player
    try {
        // Kita kasih waktu maksimal 10 detik buat node baru connect
        let attempts = 0;
        let bestNode = null;
        const maxAttempts = 20; // 20 * 500ms = 10 detik

        while (attempts < maxAttempts) {
            // Ambil node dengan beban paling ringan (yang baru kita tambahkan)
            const availableNodes = client.poru.leastUsedNodes;

            // Cek jika array tidak kosong dan node pertama sudah connect
            if (availableNodes.length > 0 && availableNodes[0].isConnected) {
                bestNode = availableNodes[0]; // Ini cara yang benar untuk ambil elemen pertama dari Array
                break; // Keluar dari loop karena node sudah siap
            }

            attempts++;
            // Tunggu 500ms sebelum mencoba lagi
            await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // Setelah loop selesai, kita cek lagi apakah node berhasil didapatkan
        if (bestNode) {
            logger.info(`✅ New node "${bestNode.name}" is connected. Moving players...`);
            let movedPlayers = 0;
            for (const player of client.poru.players.values()) {
                if (player.voiceChannel) {
                    await player.moveNode(bestNode.name);
                    movedPlayers++;
                }
            }
            logger.info(`🚀 Moved ${movedPlayers} player(s) successfully.`);
        } else {
            // Ini terjadi jika setelah 10 detik node baru tetap tidak connect
            throw new Error('New node failed to connect within the time limit.');
        }

        return true; // Berhasil
    } catch (error) {
        logger.error(`❌ Error during player migration: ${error.message}`);
        return false; // Gagal
    }
}

module.exports = { reloadLavalinkNodes };
// Cara panggil di command:
// await reloadLavalinkNodes(interaction.client);
// await interaction.reply("Berhasil me-reload semua Lavalink node! 🥳");
