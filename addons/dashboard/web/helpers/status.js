/**
 * @namespace: addons/dashboard/web/helpers/status.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta
 */

const { Op } = require('sequelize');
const StatusHistory = require('@addons/dashboard/database/models/StatusHistory');

/**
 * Memeriksa status Kythia Bot.
 * @param {Client} client Instance Discord Client.
 * @returns {object} Objek status untuk komponen bot.
 */
function getBotStatus(client) {
    if (client && client.isReady()) {
        // Uptime dalam milidetik, kita ubah ke format yang lebih mudah dibaca
        const uptimeDuration = client.uptime;
        const seconds = Math.floor((uptimeDuration / 1000) % 60);
        const minutes = Math.floor((uptimeDuration / (1000 * 60)) % 60);
        const hours = Math.floor((uptimeDuration / (1000 * 60 * 60)) % 24);
        const days = Math.floor(uptimeDuration / (1000 * 60 * 60 * 24));
        const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        return {
            name: 'Kythia Bot',
            status: 'operational',
            // Kita akan hitung persentase uptime nanti dari data historis
            // Untuk sekarang, kita tampilkan uptime durasinya sebagai data tambahan
            detail: `Uptime: ${uptimeString}`,
        };
    }
    return { name: 'Kythia Bot', status: 'outage', detail: 'Bot is not ready or offline.' };
}

/**
 * Mendapatkan status Lavalink Node(s) dengan penanganan null/undefined status.
 * @returns {Promise<object|array>} Objek status untuk satu node, atau array untuk multi-node.
 */

async function getLavalinkStatus() {
    // 1. Ambil semua konfigurasi dari .env sebagai string
    // const hostsString = kythia.addons.music.lavalink.hosts || 'localhost';
    // const portsString = kythia.addons.music.lavalink.ports || '2333';
    // const passwordsString = kythia.addons.music.lavalink.passwords || 'youshallnotpass';
    // const securesString = kythia.addons.music.lavalink.secures || 'false';
    const hostsString = process.env.LAVALINK_HOSTS || 'localhost';
    const portsString = process.env.LAVALINK_PORTS || '2333';
    const passwordsString = process.env.LAVALINK_PASSWORDS || 'youshallnotpass';
    const securesString = process.env.LAVALINK_SECURES || 'false';

    // 2. Pisahkan menjadi array
    const hosts = hostsString.split(',').map((h) => h.trim());
    const ports = portsString.split(',').map((p) => p.trim());
    const passwords = passwordsString.split(',').map((p) => p.trim());
    const secures = securesString.split(',').map((s) => s.trim().toLowerCase() === 'true');

    // 3. Buat array objek node yang terstruktur
    const nodes = hosts.map((host, index) => ({
        host,
        // Ambil port, password, secure sesuai index, atau gunakan default jika tidak ada
        port: parseInt(ports[index] || ports[0] || '2333', 10),
        password: passwords[index] || passwords[0] || 'youshallnotpass',
        secure: secures[index] || secures[0] || false,
    }));

    const results = [];

    // 4. Lakukan fetch untuk setiap node dengan konfigurasinya masing-masing
    for (const node of nodes) {
        const protocol = node.secure ? 'https' : 'http';
        const url = `${protocol}://${node.host}:${node.port}/v4/stats`;

        try {
            const response = await fetch(url, {
                headers: { Authorization: node.password },
                signal: AbortSignal.timeout(5000),
            });

            if (response.ok) {
                const stats = await response.json();
                const uptimeDuration = stats.uptime;
                const seconds = Math.floor((uptimeDuration / 1000) % 60);
                const minutes = Math.floor((uptimeDuration / (1000 * 60)) % 60);
                const hours = Math.floor((uptimeDuration / (1000 * 60 * 60)) % 24);
                const days = Math.floor(uptimeDuration / (1000 * 60 * 60 * 24));
                const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

                results.push({
                    host: node.host,
                    name: `Lavalink Node (${node.host})`,
                    status: 'operational',
                    detail: `Uptime: ${uptimeString}, Players: ${stats.players ?? '?'}`,
                });
            } else {
                results.push({
                    host: node.host,
                    name: `Lavalink Node (${node.host})`,
                    status: 'outage',
                    detail: `Node merespon dengan status ${response.status}.`,
                });
            }
        } catch (error) {
            results.push({
                host: node.host,
                name: `Lavalink Node (${node.host})`,
                status: 'outage',
                detail: error.name === 'TimeoutError' ? 'Koneksi timeout.' : 'Gagal terhubung ke node.',
            });
        }
    }

    // Selalu kembalikan array, agar kode yang memakai fungsi ini lebih konsisten
    return results;
}

/**
 * Menghitung persentase uptime untuk periode waktu tertentu (misal: 30 atau 90 hari).
 * @param {string} componentName Nama komponen ('bot', 'lavalink', 'discord_api')
 * @param {number} days Jumlah hari ke belakang.
 * @returns {Promise<string>} Persentase uptime dalam format string.
 */
async function getUptimePercentage(componentName, days = 90) {
    const periodStartDate = new Date(new Date().setDate(new Date().getDate() - days));

    const totalRecords = await StatusHistory.count({
        where: { component: componentName, timestamp: { [Op.gte]: periodStartDate } },
    });

    if (totalRecords === 0) return '100.00';

    const operationalRecords = await StatusHistory.count({
        where: { component: componentName, status: 'operational', timestamp: { [Op.gte]: periodStartDate } },
    });

    return ((operationalRecords / totalRecords) * 100).toFixed(2);
}

// GANTI FUNGSI LAMA DENGAN VERSI BARU INI

/**
 * Memproses data dari database menjadi 96 bar untuk 24 jam terakhir.
 * Versi ini menggunakan logika "fill forward" untuk representasi yang akurat.
 * @param {string} componentName Nama komponen.
 * @returns {Promise<Array<object>>} Array berisi 96 objek bar status.
 */
async function getStatusBarsForLast24Hours(componentName) {
    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Cari tahu status terakhir SEBELUM jendela 24 jam kita dimulai.
    const lastRecordBeforeWindow = await StatusHistory.findOne({
        where: {
            component: componentName,
            timestamp: { [Op.lt]: twentyFourHoursAgo }, // lt = less than
        },
        order: [['timestamp', 'DESC']],
    });
    let lastKnownStatus = lastRecordBeforeWindow ? lastRecordBeforeWindow.status : 'no_data';

    // 2. Ambil SEMUA catatan dari 24 jam terakhir
    const records = await StatusHistory.findAll({
        where: {
            component: componentName,
            timestamp: { [Op.gte]: twentyFourHoursAgo },
        },
        order: [['timestamp', 'ASC']],
    });

    // 3. Siapkan 96 slot bar kosong.
    const bars = Array.from({ length: 96 });
    const interval = 15 * 60 * 1000; // 15 menit

    // 4. Proses setiap bar 15 menit satu per satu
    for (let i = 0; i < 96; i++) {
        const barStartTime = twentyFourHoursAgo.getTime() + i * interval;
        const barEndTime = barStartTime + interval;

        // Cari semua catatan yang jatuh di dalam interval bar ini
        const recordsInInterval = records.filter((r) => {
            const recordTime = new Date(r.timestamp).getTime();
            return recordTime >= barStartTime && recordTime < barEndTime;
        });

        if (recordsInInterval.length > 0) {
            // Jika ada data di interval ini, cari status terburuk
            // (outage > degraded > operational)
            if (recordsInInterval.some((r) => r.status === 'outage')) {
                lastKnownStatus = 'outage';
            } else if (recordsInInterval.some((r) => r.status === 'degraded')) {
                lastKnownStatus = 'degraded';
            } else {
                lastKnownStatus = 'operational';
            }
        }

        // Tetapkan status bar ini berdasarkan status terakhir yang diketahui
        bars[i] = { status: lastKnownStatus };
    }

    return bars;
}

module.exports = {
    getBotStatus,
    getLavalinkStatus,
    // getDiscordApiStatus,
    getUptimePercentage,
    getStatusBarsForLast24Hours,
};
