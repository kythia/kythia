/**
 * @namespace: addons/dashboard/web/server.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc.1
 */

require('module-alias/register');

const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const DiscordStrategy = require('passport-discord').Strategy;
const CachedSessionStore = require('@utils/session');
const sequelize = require('@src/database/KythiaSequelize');
const logger = require('@utils/logger');
const { Server } = require('socket.io');
const passport = require('passport');
const express = require('express');
const path = require('path');
const http = require('http');
const fs = require('fs');

module.exports = (bot) => {
    // === SEMUA LOGIKA DIMULAI DARI SINI ===
    const app = express();
    const server = http.createServer(app);
    const io = new Server(server);

    // Sekarang, `bot` sudah pasti terdefinisi
    app.locals.bot = bot;

    const PORT = kythia.addons.dashboard.port;

    // --- KONFIGURASI SESSION STORE BARU ---

    // 1. Buat SequelizeStore seperti biasa (tanpa model kustom)
    const sequelizeStore = new SequelizeStore({
        db: sequelize,
        // Tidak perlu table: Session lagi
    });
    sequelizeStore.sync(); // Kita bisa panggil sync() di sini karena ini versi standar

    // 2. Bungkus sequelizeStore dengan CachedSessionStore kita
    const cachedStore = new CachedSessionStore(sequelizeStore);

    // Konfigurasi Passport & Sesi
    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));
    passport.use(
        new DiscordStrategy(
            {
                clientID: kythia.bot.clientId,
                clientSecret: kythia.bot.clientSecret,
                callbackURL: `${kythia.addons.dashboard.url}/auth/discord/callback`,
                scope: ['identify', 'guilds'],
            },
            (accessToken, refreshToken, profile, done) => done(null, profile)
        )
    );

    // Setup View Engine dan file statis DULUAN!
    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static(path.join(__dirname, 'public'))); // <-- PINDAHKAN INI KE ATAS

    // --- UPDATE MIDDLEWARE SESSION ---
    app.use(
        session({
            // 3. Gunakan 'pembungkus' kita sebagai store
            store: cachedStore,
            secret: kythia.addons.dashboard.sessionSecret,
            resave: false,
            saveUninitialized: false,
            cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    // app.use(expressLayouts);

    // app.set('layout', 'layouts/main');

    // Middleware Global untuk EJS
    app.use((req, res, next) => {
        res.locals.user = req.user || null;
        res.locals.currentPage = req.path;
        res.locals.guild = null;
        res.locals.page = '';
        next();
    });

    app.set('botClient', bot);

    // Gunakan Rute
    // Autoload all route files in the routes directory
    const walkSync = (dir, filelist = []) => {
        fs.readdirSync(dir).forEach((file) => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                walkSync(fullPath, filelist);
            } else if (file.endsWith('.js') && !file.startsWith('.')) {
                filelist.push(fullPath);
            }
        });
        return filelist;
    };

    const routesDir = path.join(__dirname, 'routes');
    const routeFiles = walkSync(routesDir);

    routeFiles.forEach((fullPath) => {
        // Dapatkan path relatif dari file ke direktori 'routes'
        // Contoh: 'dashboard.js' atau 'api/status.js'
        const relativePath = path.relative(routesDir, fullPath);

        // Cek apakah file berada di dalam subdirektori
        // dengan melihat apakah path-nya mengandung slash '/' atau backslash '\'
        const isSubdirectory = relativePath.includes(path.sep);

        if (isSubdirectory) {
            // JIKA DI SUBDIREKTORI:
            // Buat prefix URL dari path file tersebut.
            // 'api/status.js' akan menjadi prefix '/api/status'
            const routePrefix = '/' + relativePath.replace(/\\/g, '/').replace(/\.js$/, '');

            // Daftarkan router dengan prefix-nya
            app.use(routePrefix, require(fullPath));
            logger.info(`✅ Route loaded`);
            logger.info(`  └─ ${routePrefix} (from ${relativePath})`);
        } else {
            // JIKA DI LEVEL ATAS (ROOT /routes):
            // Daftarkan router langsung di root '/' tanpa prefix.
            app.use('/', require(fullPath));
            logger.info(`✅ Route loaded`);
            logger.info(`  └─ / (from ${relativePath})`);
        }
    });

    // Load settings routes specifically
    app.use('/', require('./routes/settings'));
    logger.info(`✅ Settings routes loaded`);

    // --- LOGIKA WEBSOCKET & REAL-TIME ---

    // Dengarkan koneksi dari browser
    io.on('connection', (socket) => {
        logger.info('🔌 Seorang pengguna terhubung ke dasbor via WebSocket.');
        socket.on('disconnect', () => {
            logger.info('🔌 Pengguna terputus.');
        });
    });
    // Di server.js, dalam middleware global
    app.use((req, res, next) => {
        res.locals.user = req.user || null;
        res.locals.currentPage = req.path;
        res.locals.guild = null;
        res.locals.page = ''; // Anda bisa set default
        res.locals.botClientId = kythia.bot.clientId;
        res.locals.botPermissions = '8';
        next();
    });

    // Penanganan untuk 404 Not Found (3 parameter)
    app.use((req, res, next) => {
        res.status(404).render('layouts/main', {
            // Pastikan path view benar
            viewName: 'error', // View untuk error
            title: 'Halaman Tidak Ditemukan',
            error: { message: 'Maaf, halaman yang Anda cari tidak ada.' },
            user: req.user || null,
            currentPage: req.path,
            page: 'error',
            guild: null,
        });
    });

    // Penanganan Error 500 (4 parameter) - taruh di paling akhir
    app.use((err, req, res, next) => {
        logger.error('🔴 TERJADI ERROR DI SERVER:', err);
        res.status(500).render('layouts/main', {
            // Pastikan path view benar
            viewName: 'error',
            title: 'Terjadi Kesalahan Server',
            error: { message: 'Terjadi kesalahan internal pada server. Kami sedang menanganinya.' },
            user: req.user || null,
            currentPage: req.path,
            page: 'error',
            guild: null,
        });
    });

    // Jalankan Server
    server.listen(PORT, '0.0.0.0', () => {
        logger.info(`🚀 Dashboard running on ${kythia.addons.dashboard.url}`);
    });
};
