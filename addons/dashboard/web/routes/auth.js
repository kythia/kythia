/**
 * @namespace: addons/dashboard/web/routes/auth.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.9-beta-rc1
 */

const router = require('express').Router();
const passport = require('passport');

// Rute untuk memulai proses login Discord
router.get('/auth/discord', passport.authenticate('discord'));

// Rute callback setelah user menyetujui di Discord
router.get(
    '/auth/discord/callback',
    passport.authenticate('discord', {
        failureRedirect: '/', // Kembali ke halaman login jika gagal
    }),
    (req, res) => {
        res.redirect('/dashboard/servers'); // Arahkan ke dashboard jika berhasil
    }
);

// Rute untuk logout
router.get('/auth/logout', (req, res) => {
    if (req.user) {
        req.logout((err) => {
            if (err) {
                console.error('Error saat logout:', err);
                return res.redirect('/dashboard');
            }
            res.redirect('/');
        });
    } else {
        res.redirect('/');
    }
});

module.exports = router;
