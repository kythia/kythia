/**
 * @namespace: addons/dashboard/web/public/assets/js/front-page-landing.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

(
    () => {
        let e = document.querySelector('.layout-navbar'),
            t = document.getElementById('hero-animation'),
            r = document.querySelectorAll('.hero-dashboard-img'),
            o = document.querySelectorAll('.hero-elements-img'),
            n = document.getElementById('swiper-clients-logos'),
            i = document.getElementById('swiper-reviews'),
            a = document.getElementById('reviews-previous-btn'),
            s = document.getElementById('reviews-next-btn'),
            c = document.querySelector('.swiper-button-prev'),
            l = document.querySelector('.swiper-button-next'),
            d = document.querySelector('.price-duration-toggler'),
            u = [].slice.call(document.querySelectorAll('.price-monthly')),
            m = [].slice.call(document.querySelectorAll('.price-yearly'));
        ('1200' <= screen.width &&
            t &&
            (t.addEventListener('mousemove', function (n) {
                (o.forEach((e) => {
                    e.style.transform = 'translateZ(1rem)';
                }),
                    r.forEach((e) => {
                        var t = (window.innerWidth - 2 * n.pageX) / 100;
                        e.style.transform = `perspective(1200px) rotateX(${(window.innerHeight - 2 * n.pageY) / 100}deg) rotateY(${t}deg) scale3d(1, 1, 1)`;
                    }));
            }),
            e.addEventListener('mousemove', function (n) {
                (o.forEach((e) => {
                    e.style.transform = 'translateZ(1rem)';
                }),
                    r.forEach((e) => {
                        var t = (window.innerWidth - 2 * n.pageX) / 100;
                        e.style.transform = `perspective(1200px) rotateX(${(window.innerHeight - 2 * n.pageY) / 100}deg) rotateY(${t}deg) scale3d(1, 1, 1)`;
                    }));
            }),
            t.addEventListener('mouseout', function () {
                (o.forEach((e) => {
                    e.style.transform = 'translateZ(0)';
                }),
                    r.forEach((e) => {
                        e.style.transform = 'perspective(1200px) scale(1) rotateX(0) rotateY(0)';
                    }));
            })),
            i &&
                new Swiper(i, {
                    slidesPerView: 1,
                    spaceBetween: 5,
                    grabCursor: !0,
                    autoplay: { delay: 3e3, disableOnInteraction: !1 },
                    loop: !0,
                    loopAdditionalSlides: 1,
                    navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
                    breakpoints: { 1200: { slidesPerView: 3, spaceBetween: 26 }, 992: { slidesPerView: 2, spaceBetween: 20 } },
                }),
            s.addEventListener('click', function () {
                l.click();
            }),
            a.addEventListener('click', function () {
                c.click();
            }),
            n &&
                new Swiper(n, {
                    slidesPerView: 2,
                    autoplay: { delay: 3e3, disableOnInteraction: !1 },
                    breakpoints: { 992: { slidesPerView: 5 }, 768: { slidesPerView: 3 } },
                }),
            document.addEventListener('DOMContentLoaded', function (e) {
                function t() {
                    d.checked
                        ? (m.map(function (e) {
                              e.classList.remove('d-none');
                          }),
                          u.map(function (e) {
                              e.classList.add('d-none');
                          }))
                        : (m.map(function (e) {
                              e.classList.add('d-none');
                          }),
                          u.map(function (e) {
                              e.classList.remove('d-none');
                          }));
                }
                (t(),
                    (d.onchange = function () {
                        t();
                    }));
            }));
    }
)();
