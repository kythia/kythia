/**
 * @namespace: addons/dashboard/web/helpers/visitor.js
 * @type: Helper Script
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const Visitor = require('@addons/dashboard/database/models/Visitor');
const logger = require('@coreHelpers/logger');
const crypto = require('crypto');

/**
 * Middleware to fetch visitor data and provide it to all EJS files via `res.locals`.
 */
const loadVisitorCounts = async (req, res, next) => {
    try {
        const today = new Date();
        // Atur tanggal ke awal hari (jam 00:00:00) untuk konsistensi
        today.setHours(0, 0, 0, 0);

        const [todayCount, totalCount] = await Promise.all([
            Visitor.countWithCache({ where: { visitDate: today } }),
            // FIX: Berikan objek kosong untuk menghitung semua record
            Visitor.countWithCache({}),
        ]);

        res.locals.todayVisitors = todayCount;
        res.locals.totalVisitors = totalCount;
    } catch (error) {
        console.error('Failed to load visitor data:', error);
        res.locals.todayVisitors = 0;
        res.locals.totalVisitors = 0;
    }
    next();
};

/**
 * Middleware to track unique visitors per day.
 */
const trackVisitor = async (req, res, next) => {
    try {
        // Gunakan IP yang lebih bisa diandalkan, fallback ke remoteAddress
        const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket.remoteAddress;

        if (!ip) return next();

        const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
        const today = new Date();
        // Atur tanggal ke awal hari (jam 00:00:00) biar datanya konsisten
        today.setHours(0, 0, 0, 0);

        const [visitor, created] = await Visitor.findOrCreateWithCache({
            where: {
                ipHash: ipHash,
                visitDate: today,
            },
        });

        if (created) {
            // Jika visitor baru dibuat, kita harus membersihkan cache hitungan
            // agar `loadVisitorCounts` selanjutnya mengambil data baru dari DB.
            await Visitor.clearCache({ queryType: 'count', where: { visitDate: today } });
            await Visitor.clearCache({ queryType: 'count' });
            logger.info(`✅ New unique visitor detected today. Count caches cleared.`);
        }
    } catch (error) {
        console.error('Failed to track visitor:', error);
    }

    next();
};

module.exports = { loadVisitorCounts, trackVisitor };
