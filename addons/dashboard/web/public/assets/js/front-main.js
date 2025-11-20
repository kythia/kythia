/**
 * @namespace: addons/dashboard/web/public/assets/js/front-main.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

((window.isRtl = window.Helpers.isRtl()),
    (window.isDarkStyle = window.Helpers.isDarkStyle()),
    (() => {
        let t = document.getElementById('navbarSupportedContent'),
            o = document.querySelector('.layout-navbar'),
            e = document.querySelectorAll('.navbar-nav .nav-link');
        function n() {
            t.classList.remove('show');
        }
        (setTimeout(function () {
            window.Helpers.initCustomOptionCheck();
        }, 1e3),
            'undefined' != typeof Waves &&
                (Waves.init(),
                Waves.attach(".btn[class*='btn-']:not([class*='btn-outline-']):not([class*='btn-label-'])", ['waves-light']),
                Waves.attach("[class*='btn-outline-']"),
                Waves.attach("[class*='btn-label-']"),
                Waves.attach('.pagination .page-item .page-link')),
            [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(function (e) {
                return new bootstrap.Tooltip(e);
            }),
            isRtl &&
                (Helpers._addClass('dropdown-menu-end', document.querySelectorAll('#layout-navbar .dropdown-menu')),
                Helpers._addClass('dropdown-menu-end', document.querySelectorAll('.dropdown-menu'))),
            window.addEventListener('scroll', (e) => {
                10 < window.scrollY ? o.classList.add('navbar-active') : o.classList.remove('navbar-active');
            }),
            window.addEventListener('load', (e) => {
                10 < window.scrollY ? o.classList.add('navbar-active') : o.classList.remove('navbar-active');
            }),
            document.addEventListener('click', function (e) {
                t.contains(e.target) || n();
            }),
            e.forEach((t) => {
                t.addEventListener('click', (e) => {
                    t.classList.contains('dropdown-toggle') ? e.preventDefault() : n();
                });
            }));
        (a = document.querySelectorAll('.nav-link.mega-dropdown')) &&
            a.forEach((e) => {
                new MegaDropdown(e);
            });
        var a =
            localStorage.getItem('templateCustomizer-' + templateName + '--Theme') ||
            (window.templateCustomizer?.settings?.defaultStyle ?? document.documentElement.getAttribute('data-bs-theme'));
        let l = document.querySelector('.dropdown-style-switcher').querySelector('i');
        function s() {
            var e = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.setProperty('--ky-scrollbar-width', e + 'px');
        }
        (new bootstrap.Tooltip(l, { title: a.charAt(0).toUpperCase() + a.slice(1) + ' Mode', fallbackPlacements: ['bottom'] }),
            window.Helpers.switchImage(a),
            window.Helpers.setTheme(window.Helpers.getPreferredTheme()),
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                var e = window.Helpers.getStoredTheme();
                'light' !== e && 'dark' !== e && window.Helpers.setTheme(window.Helpers.getPreferredTheme());
            }),
            s(),
            window.addEventListener('DOMContentLoaded', () => {
                (window.Helpers.showActiveTheme(window.Helpers.getPreferredTheme()),
                    s(),
                    document.querySelectorAll('[data-bs-theme-value]').forEach((o) => {
                        o.addEventListener('click', () => {
                            var e = o.getAttribute('data-bs-theme-value');
                            (window.Helpers.setStoredTheme(templateName, e),
                                window.Helpers.setTheme(e),
                                window.Helpers.showActiveTheme(e, !0),
                                window.Helpers.syncCustomOptions(e));
                            let t = e;
                            ('system' === e && (t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
                                new bootstrap.Tooltip(l, {
                                    title: e.charAt(0).toUpperCase() + e.slice(1) + ' Mode',
                                    fallbackPlacements: ['bottom'],
                                }),
                                window.Helpers.switchImage(t));
                        });
                    }));
            }));
    })());
