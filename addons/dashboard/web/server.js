/**
 * @namespace: addons/dashboard/web/server.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

require('module-alias/register');

const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const DiscordStrategy = require('passport-discord').Strategy;
const CachedSessionStore = require('./helpers/session');
// <--- Hapus, ambil dari container
// const logger = require('@coreHelpers/logger'); // Idealnya dihapus, tapi kita biarin dulu import bawah
const { Server } = require('socket.io');
const passport = require('passport');
const express = require('express');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Impor logger SEBELUM dipakai (sementara)
const logger = require('@coreHelpers/logger');

module.exports = (bot) => {
    // --- AMBIL DEPENDENSI DARI CONTAINER ---
    const sequelize = bot.container.sequelize;
    const kythiaConfig = bot.container.kythiaConfig;
    // Opsional: const logger = bot.container.logger;

    if (!sequelize) {
        logger.error('❌ Dashboard Init Error: Sequelize instance not found in bot.container!');
        return;
    }
    // --- SELESAI AMBIL DEPENDENSI ---

    const app = express();
    const server = http.createServer(app);
    const io = new Server(server);

    app.locals.bot = bot;

    const PORT = kythiaConfig.addons.dashboard.port;

    const sequelizeStore = new SequelizeStore({
        db: sequelize,
    });
    sequelizeStore.sync();

    const cachedStore = new CachedSessionStore(sequelizeStore);

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));
    passport.use(
        new DiscordStrategy(
            {
                clientID: kythiaConfig.bot.clientId,
                clientSecret: kythiaConfig.bot.clientSecret,
                callbackURL: `${kythiaConfig.addons.dashboard.url}/auth/discord/callback`,
                scope: ['identify', 'guilds'],
            },
            (accessToken, refreshToken, profile, done) => done(null, profile)
        )
    );

    app.set('view engine', 'ejs');
    app.set('views', path.join(__dirname, 'views'));
    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/files', express.static(path.join(__dirname, '..', '..', '..', 'storage')));

    app.use(
        session({
            store: cachedStore,
            secret: kythiaConfig.addons.dashboard.sessionSecret,
            resave: false,
            saveUninitialized: false,
            cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 },
        })
    );
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use((req, res, next) => {
        res.locals.user = req.user || null;
        res.locals.currentPage = req.path;
        res.locals.guild = null;
        res.locals.page = '';
        next();
    });

    app.set('botClient', bot);

    // ... (Logika walkSync & loading routes biarin aja) ...

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

    logger.info(`✅ Route loaded`);
    routeFiles.forEach((fullPath) => {
        const relativePath = path.relative(routesDir, fullPath);

        const isSubdirectory = relativePath.includes(path.sep);

        if (isSubdirectory) {
            const routePrefix = '/' + relativePath.replace(/\\/g, '/').replace(/\.js$/, '');

            app.use(routePrefix, require(fullPath));
            logger.info(`  └─ ${routePrefix} (from ${relativePath})`);
        } else {
            app.use('/', require(fullPath));
            logger.info(`  └─ / (from ${relativePath})`);
        }
    });

    app.use('/', require('./routes/settings'));
    logger.info(`✅ Settings routes loaded`);

    io.on('connection', (socket) => {
        logger.info('🔌 Seorang pengguna terhubung ke dasbor via WebSocket.');
        socket.on('disconnect', () => {
            logger.info('🔌 Pengguna terputus.');
        });
    });

    app.use((req, res, next) => {
        res.locals.user = req.user || null;
        res.locals.currentPage = req.path;
        res.locals.guild = null;
        res.locals.page = '';
        res.locals.botClientId = kythiaConfig.bot.clientId;
        res.locals.botPermissions = '8';
        next();
    });

    app.use((req, res, next) => {
        res.status(404).render('layouts/main', {
            viewName: 'error',
            title: 'Halaman Tidak Ditemukan',
            error: { message: 'Maaf, halaman yang Anda cari tidak ada.' },
            user: req.user || null,
            currentPage: req.path,
            page: 'error',
            guild: null,
        });
    });

    app.use((err, req, res, next) => {
        logger.error('🔴 TERJADI ERROR DI SERVER:', err);
        res.status(500).render('layouts/main', {
            viewName: 'error',
            title: 'Terjadi Kesalahan Server',
            error: { message: 'Terjadi kesalahan internal pada server. Kami sedang menanganinya.' },
            user: req.user || null,
            currentPage: req.path,
            page: 'error',
            guild: null,
        });
    });

    server.listen(PORT, '0.0.0.0', () => {
        logger.info(`🚀 Dashboard server listening on 0.0.0.0:${PORT}`);
        logger.info(`🌐 Public URL (check Discord Dev Portal): ${kythiaConfig.addons.dashboard.url}`);
    });
};
