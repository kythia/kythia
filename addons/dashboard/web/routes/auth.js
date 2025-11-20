/**
 * @namespace: addons/dashboard/web/routes/auth.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

const router = require('express').Router();
const passport = require('passport');

router.get('/auth/discord', passport.authenticate('discord'));

router.get(
    '/auth/discord/callback',
    passport.authenticate('discord', {
        failureRedirect: '/',
    }),
    (req, res) => {
        res.redirect('/dashboard/servers');
    }
);

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
