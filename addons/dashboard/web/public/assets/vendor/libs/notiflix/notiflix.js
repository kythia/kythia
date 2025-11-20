/**
 * @namespace: addons/dashboard/web/public/assets/vendor/libs/notiflix/notiflix.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

!(function (e, t) {
    if ('object' == typeof exports && 'object' == typeof module) module.exports = t();
    else if ('function' == typeof define && define.amd) define([], t);
    else {
        var i = t();
        for (var n in i) ('object' == typeof exports ? exports : e)[n] = i[n];
    }
})(self, function () {
    return (function () {
        var e = {
                8666: function (e, t, i) {
                    var n, a;
                    ((a = void 0 !== i.g ? i.g : 'undefined' != typeof window ? window : this),
                        (n = function () {
                            return (function (e) {
                                'use strict';
                                if (void 0 === e && void 0 === e.document) return !1;
                                var t,
                                    i =
                                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                                    n = {
                                        Standard: 'Standard',
                                        Hourglass: 'Hourglass',
                                        Circle: 'Circle',
                                        Arrows: 'Arrows',
                                        Dots: 'Dots',
                                        Pulse: 'Pulse',
                                    },
                                    a = {
                                        ID: 'NotiflixBlockWrap',
                                        querySelectorLimit: 200,
                                        className: 'notiflix-block',
                                        position: 'absolute',
                                        zindex: 1e3,
                                        backgroundColor: 'rgba(255,255,255,0.9)',
                                        rtl: !1,
                                        fontFamily: 'Quicksand',
                                        cssAnimation: !0,
                                        cssAnimationDuration: 300,
                                        svgSize: '45px',
                                        svgColor: '#383838',
                                        messageFontSize: '14px',
                                        messageMaxLength: 34,
                                        messageColor: '#383838',
                                    },
                                    o = function (e) {},
                                    r = function (e) {},
                                    s = function (t) {
                                        return (
                                            t || (t = 'head'),
                                            null !== e.document[t] ||
                                                (o(
                                                    '\nNotiflix needs to be appended to the "<' +
                                                        t +
                                                        '>" element, but you called it before the "<' +
                                                        t +
                                                        '>" element has been created.'
                                                ),
                                                !1)
                                        );
                                    },
                                    l = function (t, i) {
                                        if (!s('head')) return !1;
                                        if (null !== t() && !e.document.getElementById(i)) {
                                            var n = e.document.createElement('style');
                                            ((n.id = i), (n.innerHTML = t()), e.document.head.appendChild(n));
                                        }
                                    },
                                    c = function () {
                                        var e = {},
                                            t = !1,
                                            i = 0;
                                        '[object Boolean]' === Object.prototype.toString.call(arguments[0]) && ((t = arguments[0]), i++);
                                        for (
                                            var n = function (i) {
                                                for (var n in i)
                                                    Object.prototype.hasOwnProperty.call(i, n) &&
                                                        (t && '[object Object]' === Object.prototype.toString.call(i[n])
                                                            ? (e[n] = c(e[n], i[n]))
                                                            : (e[n] = i[n]));
                                            };
                                            i < arguments.length;
                                            i++
                                        )
                                            n(arguments[i]);
                                        return e;
                                    },
                                    m = function (t) {
                                        var i = e.document.createElement('div');
                                        return ((i.innerHTML = t), i.textContent || i.innerText || '');
                                    },
                                    f = function (e, t) {
                                        return (
                                            e || (e = '60px'),
                                            t || (t = '#32c682'),
                                            '<svg xmlns="http://www.w3.org/2000/svg" stroke="' +
                                                t +
                                                '" width="' +
                                                e +
                                                '" height="' +
                                                e +
                                                '" transform="scale(.8)" viewBox="0 0 38 38"><g fill="none" fill-rule="evenodd" stroke-width="2" transform="translate(1 1)"><circle cx="18" cy="18" r="18" stroke-opacity=".25"/><path d="M36 18c0-9.94-8.06-18-18-18"><animateTransform attributeName="transform" dur="1s" from="0 18 18" repeatCount="indefinite" to="360 18 18" type="rotate"/></path></g></svg>'
                                        );
                                    },
                                    d = function (e, t) {
                                        return (
                                            e || (e = '60px'),
                                            t || (t = '#32c682'),
                                            '<svg xmlns="http://www.w3.org/2000/svg" id="NXLoadingHourglass" fill="' +
                                                t +
                                                '" width="' +
                                                e +
                                                '" height="' +
                                                e +
                                                '" viewBox="0 0 200 200"><style>@-webkit-keyframes NXhourglass5-animation{0%{-webkit-transform:scale(1,1);transform:scale(1,1)}16.67%{-webkit-transform:scale(1,.8);transform:scale(1,.8)}33.33%{-webkit-transform:scale(.88,.6);transform:scale(.88,.6)}37.5%{-webkit-transform:scale(.85,.55);transform:scale(.85,.55)}41.67%{-webkit-transform:scale(.8,.5);transform:scale(.8,.5)}45.83%{-webkit-transform:scale(.75,.45);transform:scale(.75,.45)}50%{-webkit-transform:scale(.7,.4);transform:scale(.7,.4)}54.17%{-webkit-transform:scale(.6,.35);transform:scale(.6,.35)}58.33%{-webkit-transform:scale(.5,.3);transform:scale(.5,.3)}83.33%,to{-webkit-transform:scale(.2,0);transform:scale(.2,0)}}@keyframes NXhourglass5-animation{0%{-webkit-transform:scale(1,1);transform:scale(1,1)}16.67%{-webkit-transform:scale(1,.8);transform:scale(1,.8)}33.33%{-webkit-transform:scale(.88,.6);transform:scale(.88,.6)}37.5%{-webkit-transform:scale(.85,.55);transform:scale(.85,.55)}41.67%{-webkit-transform:scale(.8,.5);transform:scale(.8,.5)}45.83%{-webkit-transform:scale(.75,.45);transform:scale(.75,.45)}50%{-webkit-transform:scale(.7,.4);transform:scale(.7,.4)}54.17%{-webkit-transform:scale(.6,.35);transform:scale(.6,.35)}58.33%{-webkit-transform:scale(.5,.3);transform:scale(.5,.3)}83.33%,to{-webkit-transform:scale(.2,0);transform:scale(.2,0)}}@-webkit-keyframes NXhourglass3-animation{0%{-webkit-transform:scale(1,.02);transform:scale(1,.02)}79.17%,to{-webkit-transform:scale(1,1);transform:scale(1,1)}}@keyframes NXhourglass3-animation{0%{-webkit-transform:scale(1,.02);transform:scale(1,.02)}79.17%,to{-webkit-transform:scale(1,1);transform:scale(1,1)}}@-webkit-keyframes NXhourglass1-animation{0%,83.33%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(180deg);transform:rotate(180deg)}}@keyframes NXhourglass1-animation{0%,83.33%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(180deg);transform:rotate(180deg)}}#NXLoadingHourglass *{-webkit-animation-duration:1.2s;animation-duration:1.2s;-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite;-webkit-animation-timing-function:cubic-bezier(0,0,1,1);animation-timing-function:cubic-bezier(0,0,1,1)}</style><g data-animator-group="true" data-animator-type="1" style="-webkit-animation-name:NXhourglass1-animation;animation-name:NXhourglass1-animation;-webkit-transform-origin:50% 50%;transform-origin:50% 50%;transform-box:fill-box"><g id="NXhourglass2" fill="inherit"><g data-animator-group="true" data-animator-type="2" style="-webkit-animation-name:NXhourglass3-animation;animation-name:NXhourglass3-animation;-webkit-animation-timing-function:cubic-bezier(.42,0,.58,1);animation-timing-function:cubic-bezier(.42,0,.58,1);-webkit-transform-origin:50% 100%;transform-origin:50% 100%;transform-box:fill-box" opacity=".4"><path id="NXhourglass4" d="M100 100l-34.38 32.08v31.14h68.76v-31.14z"/></g><g data-animator-group="true" data-animator-type="2" style="-webkit-animation-name:NXhourglass5-animation;animation-name:NXhourglass5-animation;-webkit-transform-origin:50% 100%;transform-origin:50% 100%;transform-box:fill-box" opacity=".4"><path id="NXhourglass6" d="M100 100L65.62 67.92V36.78h68.76v31.14z"/></g><path d="M51.14 38.89h8.33v14.93c0 15.1 8.29 28.99 23.34 39.1 1.88 1.25 3.04 3.97 3.04 7.08s-1.16 5.83-3.04 7.09c-15.05 10.1-23.34 23.99-23.34 39.09v14.93h-8.33a4.859 4.859 0 1 0 0 9.72h97.72a4.859 4.859 0 1 0 0-9.72h-8.33v-14.93c0-15.1-8.29-28.99-23.34-39.09-1.88-1.26-3.04-3.98-3.04-7.09s1.16-5.83 3.04-7.08c15.05-10.11 23.34-24 23.34-39.1V38.89h8.33a4.859 4.859 0 1 0 0-9.72H51.14a4.859 4.859 0 1 0 0 9.72zm79.67 14.93c0 15.87-11.93 26.25-19.04 31.03-4.6 3.08-7.34 8.75-7.34 15.15 0 6.41 2.74 12.07 7.34 15.15 7.11 4.78 19.04 15.16 19.04 31.03v14.93H69.19v-14.93c0-15.87 11.93-26.25 19.04-31.02 4.6-3.09 7.34-8.75 7.34-15.16 0-6.4-2.74-12.07-7.34-15.15-7.11-4.78-19.04-15.16-19.04-31.03V38.89h61.62v14.93z"/></g></g></svg>'
                                        );
                                    },
                                    u = function (e, t) {
                                        return (
                                            e || (e = '60px'),
                                            t || (t = '#32c682'),
                                            '<svg xmlns="http://www.w3.org/2000/svg" width="' +
                                                e +
                                                '" height="' +
                                                e +
                                                '" viewBox="25 25 50 50" style="-webkit-animation:rotate 2s linear infinite;animation:rotate 2s linear infinite;height:' +
                                                e +
                                                ';-webkit-transform-origin:center center;-ms-transform-origin:center center;transform-origin:center center;width:' +
                                                e +
                                                ';position:absolute;top:0;left:0;margin:auto"><style>@-webkit-keyframes rotate{to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes rotate{to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes dash{0%{stroke-dasharray:1,200;stroke-dashoffset:0}50%{stroke-dasharray:89,200;stroke-dashoffset:-35}to{stroke-dasharray:89,200;stroke-dashoffset:-124}}@keyframes dash{0%{stroke-dasharray:1,200;stroke-dashoffset:0}50%{stroke-dasharray:89,200;stroke-dashoffset:-35}to{stroke-dasharray:89,200;stroke-dashoffset:-124}}</style><circle cx="50" cy="50" r="20" fill="none" stroke="' +
                                                t +
                                                '" stroke-width="2" style="-webkit-animation:dash 1.5s ease-in-out infinite,color 1.5s ease-in-out infinite;animation:dash 1.5s ease-in-out infinite,color 1.5s ease-in-out infinite" stroke-dasharray="150 200" stroke-dashoffset="-10" stroke-linecap="round"/></svg>'
                                        );
                                    },
                                    g = function (e, t) {
                                        return (
                                            e || (e = '60px'),
                                            t || (t = '#32c682'),
                                            '<svg xmlns="http://www.w3.org/2000/svg" fill="' +
                                                t +
                                                '" width="' +
                                                e +
                                                '" height="' +
                                                e +
                                                '" viewBox="0 0 128 128"><g><path fill="inherit" d="M109.25 55.5h-36l12-12a29.54 29.54 0 0 0-49.53 12H18.75A46.04 46.04 0 0 1 96.9 31.84l12.35-12.34v36zm-90.5 17h36l-12 12a29.54 29.54 0 0 0 49.53-12h16.97A46.04 46.04 0 0 1 31.1 96.16L18.74 108.5v-36z"/><animateTransform attributeName="transform" dur="1.5s" from="0 64 64" repeatCount="indefinite" to="360 64 64" type="rotate"/></g></svg>'
                                        );
                                    },
                                    p = function (e, t) {
                                        return (
                                            e || (e = '60px'),
                                            t || (t = '#32c682'),
                                            '<svg xmlns="http://www.w3.org/2000/svg" fill="' +
                                                t +
                                                '" width="' +
                                                e +
                                                '" height="' +
                                                e +
                                                '" viewBox="0 0 100 100"><g transform="translate(25 50)"><circle r="9" fill="inherit" transform="scale(.239)"><animateTransform attributeName="transform" begin="-0.266s" calcMode="spline" dur="0.8s" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" keyTimes="0;0.5;1" repeatCount="indefinite" type="scale" values="0;1;0"/></circle></g><g transform="translate(50 50)"><circle r="9" fill="inherit" transform="scale(.00152)"><animateTransform attributeName="transform" begin="-0.133s" calcMode="spline" dur="0.8s" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" keyTimes="0;0.5;1" repeatCount="indefinite" type="scale" values="0;1;0"/></circle></g><g transform="translate(75 50)"><circle r="9" fill="inherit" transform="scale(.299)"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="0.8s" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" keyTimes="0;0.5;1" repeatCount="indefinite" type="scale" values="0;1;0"/></circle></g></svg>'
                                        );
                                    },
                                    b = function (e, t) {
                                        return (
                                            e || (e = '60px'),
                                            t || (t = '#32c682'),
                                            '<svg xmlns="http://www.w3.org/2000/svg" stroke="' +
                                                t +
                                                '" width="' +
                                                e +
                                                '" height="' +
                                                e +
                                                '" viewBox="0 0 44 44"><g fill="none" fill-rule="evenodd" stroke-width="2"><circle cx="22" cy="22" r="1"><animate attributeName="r" begin="0s" calcMode="spline" dur="1.8s" keySplines="0.165, 0.84, 0.44, 1" keyTimes="0; 1" repeatCount="indefinite" values="1; 20"/><animate attributeName="stroke-opacity" begin="0s" calcMode="spline" dur="1.8s" keySplines="0.3, 0.61, 0.355, 1" keyTimes="0; 1" repeatCount="indefinite" values="1; 0"/></circle><circle cx="22" cy="22" r="1"><animate attributeName="r" begin="-0.9s" calcMode="spline" dur="1.8s" keySplines="0.165, 0.84, 0.44, 1" keyTimes="0; 1" repeatCount="indefinite" values="1; 20"/><animate attributeName="stroke-opacity" begin="-0.9s" calcMode="spline" dur="1.8s" keySplines="0.3, 0.61, 0.355, 1" keyTimes="0; 1" repeatCount="indefinite" values="1; 0"/></circle></g></svg>'
                                        );
                                    },
                                    h = function () {
                                        return '[id^=NotiflixBlockWrap]{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;-webkit-box-sizing:border-box;box-sizing:border-box;position:absolute;z-index:1000;font-family:"Quicksand",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;background:rgba(255,255,255,.9);text-align:center;animation-duration:.4s;width:100%;height:100%;left:0;top:0;border-radius:inherit;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center}[id^=NotiflixBlockWrap] *{-webkit-box-sizing:border-box;box-sizing:border-box}[id^=NotiflixBlockWrap]>span[class*="-icon"]{display:block;width:45px;height:45px;position:relative;margin:0 auto}[id^=NotiflixBlockWrap]>span[class*="-icon"] svg{width:inherit;height:inherit}[id^=NotiflixBlockWrap]>span[class*="-message"]{position:relative;display:block;width:100%;margin:10px auto 0;padding:0 10px;font-family:inherit!important;font-weight:normal;font-size:14px;line-height:1.4}[id^=NotiflixBlockWrap].nx-with-animation{-webkit-animation:block-animation-fade .3s ease-in-out 0s normal;animation:block-animation-fade .3s ease-in-out 0s normal}@-webkit-keyframes block-animation-fade{0%{opacity:0}100%{opacity:1}}@keyframes block-animation-fade{0%{opacity:0}100%{opacity:1}}[id^=NotiflixBlockWrap].nx-with-animation.nx-remove{opacity:0;-webkit-animation:block-animation-fade-remove .3s ease-in-out 0s normal;animation:block-animation-fade-remove .3s ease-in-out 0s normal}@-webkit-keyframes block-animation-fade-remove{0%{opacity:1}100%{opacity:0}}@keyframes block-animation-fade-remove{0%{opacity:1}100%{opacity:0}}';
                                    },
                                    k = 0,
                                    y = function (l, h, y, v, x, N) {
                                        var S;
                                        if (Array.isArray(y)) {
                                            if (y.length < 1)
                                                return (o('Array of HTMLElements should contains at least one HTMLElement.'), !1);
                                            S = y;
                                        } else if (Object.prototype.isPrototypeOf.call(NodeList.prototype, y)) {
                                            if (y.length < 1)
                                                return (o('NodeListOf<HTMLElement> should contains at least one HTMLElement.'), !1);
                                            S = Array.prototype.slice.call(y);
                                        } else {
                                            if (
                                                'string' != typeof y ||
                                                (y || '').length < 1 ||
                                                (1 === (y || '').length && ('#' === (y || '')[0] || '.' === (y || '')[0]))
                                            )
                                                return (
                                                    o('The selector parameter must be a string and matches a specified CSS selector(s).'),
                                                    !1
                                                );
                                            var C = e.document.querySelectorAll(y);
                                            if (C.length < 1)
                                                return (
                                                    o(
                                                        'You called the "Notiflix.Block..." function with "' +
                                                            y +
                                                            '" selector, but there is no such element(s) in the document.'
                                                    ),
                                                    !1
                                                );
                                            S = C;
                                        }
                                        t || w.Block.init({});
                                        var L = c(!0, t, {});
                                        if (('object' == typeof v && !Array.isArray(v)) || ('object' == typeof x && !Array.isArray(x))) {
                                            var z = {};
                                            ('object' == typeof v ? (z = v) : 'object' == typeof x && (z = x), (t = c(!0, t, z)));
                                        }
                                        var M = '';
                                        ('string' == typeof v && v.length > 0 && (M = v), t.cssAnimation || (t.cssAnimationDuration = 0));
                                        var T = a.className;
                                        'string' == typeof t.className && (T = t.className.trim());
                                        var A = 'number' == typeof t.querySelectorLimit ? t.querySelectorLimit : 200,
                                            B = (S || []).length >= A ? A : S.length,
                                            j = 'nx-block-temporary-position';
                                        if (l)
                                            for (
                                                var H = [
                                                        'area',
                                                        'base',
                                                        'br',
                                                        'col',
                                                        'command',
                                                        'embed',
                                                        'hr',
                                                        'img',
                                                        'input',
                                                        'keygen',
                                                        'link',
                                                        'meta',
                                                        'param',
                                                        'source',
                                                        'track',
                                                        'wbr',
                                                        'html',
                                                        'head',
                                                        'title',
                                                        'script',
                                                        'style',
                                                        'iframe',
                                                    ],
                                                    D = 0;
                                                D < B;
                                                D++
                                            ) {
                                                var X = S[D];
                                                if (X) {
                                                    if (H.indexOf(X.tagName.toLocaleLowerCase('en')) > -1) break;
                                                    var I = X.querySelectorAll('[id^=' + a.ID + ']');
                                                    if (I.length < 1) {
                                                        var E = '';
                                                        h &&
                                                            (E =
                                                                h === n.Hourglass
                                                                    ? d(t.svgSize, t.svgColor)
                                                                    : h === n.Circle
                                                                      ? u(t.svgSize, t.svgColor)
                                                                      : h === n.Arrows
                                                                        ? g(t.svgSize, t.svgColor)
                                                                        : h === n.Dots
                                                                          ? p(t.svgSize, t.svgColor)
                                                                          : h === n.Pulse
                                                                            ? b(t.svgSize, t.svgColor)
                                                                            : f(t.svgSize, t.svgColor));
                                                        var W =
                                                                '<span class="' +
                                                                T +
                                                                '-icon" style="width:' +
                                                                t.svgSize +
                                                                ';height:' +
                                                                t.svgSize +
                                                                ';">' +
                                                                E +
                                                                '</span>',
                                                            O = '';
                                                        (M.length > 0 &&
                                                            ((M =
                                                                M.length > t.messageMaxLength
                                                                    ? m(M).substring(0, t.messageMaxLength) + '...'
                                                                    : m(M)),
                                                            (O =
                                                                '<span style="font-size:' +
                                                                t.messageFontSize +
                                                                ';color:' +
                                                                t.messageColor +
                                                                ';" class="' +
                                                                T +
                                                                '-message">' +
                                                                M +
                                                                '</span>')),
                                                            k++);
                                                        var F = e.document.createElement('div');
                                                        ((F.id = a.ID + '-' + k),
                                                            (F.className = T + (t.cssAnimation ? ' nx-with-animation' : '')),
                                                            (F.style.position = t.position),
                                                            (F.style.zIndex = t.zindex),
                                                            (F.style.background = t.backgroundColor),
                                                            (F.style.animationDuration = t.cssAnimationDuration + 'ms'),
                                                            (F.style.fontFamily = '"' + t.fontFamily + '", ' + i),
                                                            (F.style.display = 'flex'),
                                                            (F.style.flexWrap = 'wrap'),
                                                            (F.style.flexDirection = 'column'),
                                                            (F.style.alignItems = 'center'),
                                                            (F.style.justifyContent = 'center'),
                                                            t.rtl && (F.setAttribute('dir', 'rtl'), F.classList.add('nx-rtl-on')),
                                                            (F.innerHTML = W + O));
                                                        var P = e.getComputedStyle(X).getPropertyValue('position'),
                                                            U = 'string' == typeof P ? P.toLocaleLowerCase('en') : 'relative',
                                                            V = Math.round(1.25 * parseInt(t.svgSize)) + 40,
                                                            q = '';
                                                        V > (X.offsetHeight || 0) && (q = 'min-height:' + V + 'px;');
                                                        var R = '';
                                                        R = X.getAttribute('id')
                                                            ? '#' + X.getAttribute('id')
                                                            : X.classList[0]
                                                              ? '.' + X.classList[0]
                                                              : (X.tagName || '').toLocaleLowerCase('en');
                                                        var Q = '',
                                                            Y = ['absolute', 'relative', 'fixed', 'sticky'].indexOf(U) <= -1;
                                                        if (Y || q.length > 0) {
                                                            if (!s('head')) return !1;
                                                            Y && (Q = 'position:relative!important;');
                                                            var _ =
                                                                    '<style id="Style-' +
                                                                    a.ID +
                                                                    '-' +
                                                                    k +
                                                                    '">' +
                                                                    R +
                                                                    '.' +
                                                                    j +
                                                                    '{' +
                                                                    Q +
                                                                    q +
                                                                    '}</style>',
                                                                G = e.document.createRange();
                                                            G.selectNode(e.document.head);
                                                            var J = G.createContextualFragment(_);
                                                            (e.document.head.appendChild(J), X.classList.add(j));
                                                        }
                                                        X.appendChild(F);
                                                    }
                                                }
                                            }
                                        else
                                            var K = function (i) {
                                                    var n = setTimeout(function () {
                                                        null !== i.parentNode && i.parentNode.removeChild(i);
                                                        var t = i.getAttribute('id'),
                                                            a = e.document.getElementById('Style-' + t);
                                                        (a && null !== a.parentNode && a.parentNode.removeChild(a), clearTimeout(n));
                                                    }, t.cssAnimationDuration);
                                                },
                                                Z = function (e) {
                                                    if (e && e.length > 0)
                                                        for (var t = 0; t < e.length; t++) {
                                                            var i = e[t];
                                                            i && (i.classList.add('nx-remove'), K(i));
                                                        }
                                                    else
                                                        r(
                                                            'string' == typeof y
                                                                ? '"Notiflix.Block.remove();" function called with "' +
                                                                      y +
                                                                      '" selector, but this selector does not have a "Block" element to remove.'
                                                                : '"Notiflix.Block.remove();" function called with "' +
                                                                      y +
                                                                      '", but this "Array<HTMLElement>" or "NodeListOf<HTMLElement>" does not have a "Block" element to remove.'
                                                        );
                                                },
                                                $ = function (e) {
                                                    var i = setTimeout(function () {
                                                        (e.classList.remove(j), clearTimeout(i));
                                                    }, t.cssAnimationDuration + 300);
                                                },
                                                ee = setTimeout(function () {
                                                    for (var e = 0; e < B; e++) {
                                                        var t = S[e];
                                                        t && ($(t), (I = t.querySelectorAll('[id^=' + a.ID + ']')), Z(I));
                                                    }
                                                    clearTimeout(ee);
                                                }, N);
                                        t = c(!0, t, L);
                                    },
                                    w = {
                                        Block: {
                                            init: function (e) {
                                                ((t = c(!0, a, e)), l(h, 'NotiflixBlockInternalCSS'));
                                            },
                                            merge: function (e) {
                                                if (!t)
                                                    return (
                                                        o('You have to initialize the "Notiflix.Block" module before call Merge function.'),
                                                        !1
                                                    );
                                                t = c(!0, t, e);
                                            },
                                            standard: function (e, t, i) {
                                                y(!0, n.Standard, e, t, i);
                                            },
                                            hourglass: function (e, t, i) {
                                                y(!0, n.Hourglass, e, t, i);
                                            },
                                            circle: function (e, t, i) {
                                                y(!0, n.Circle, e, t, i);
                                            },
                                            arrows: function (e, t, i) {
                                                y(!0, n.Arrows, e, t, i);
                                            },
                                            dots: function (e, t, i) {
                                                y(!0, n.Dots, e, t, i);
                                            },
                                            pulse: function (e, t, i) {
                                                y(!0, n.Pulse, e, t, i);
                                            },
                                            remove: function (e, t) {
                                                ('number' != typeof t && (t = 0), y(!1, null, e, null, null, t));
                                            },
                                        },
                                    };
                                return 'object' == typeof e.Notiflix ? c(!0, e.Notiflix, { Block: w.Block }) : { Block: w.Block };
                            })(a);
                        }.apply(t, [])),
                        void 0 === n || (e.exports = n));
                },
                4443: function (e, t, i) {
                    var n, a;
                    ((a = void 0 !== i.g ? i.g : 'undefined' != typeof window ? window : this),
                        (n = function () {
                            return (function (e) {
                                'use strict';
                                if (void 0 === e && void 0 === e.document) return !1;
                                var t,
                                    i =
                                        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
                                    n = {
                                        Standard: 'Standard',
                                        Hourglass: 'Hourglass',
                                        Circle: 'Circle',
                                        Arrows: 'Arrows',
                                        Dots: 'Dots',
                                        Pulse: 'Pulse',
                                        Custom: 'Custom',
                                        Notiflix: 'Notiflix',
                                    },
                                    a = {
                                        ID: 'NotiflixLoadingWrap',
                                        className: 'notiflix-loading',
                                        zindex: 4e3,
                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                        rtl: !1,
                                        fontFamily: 'Quicksand',
                                        cssAnimation: !0,
                                        cssAnimationDuration: 400,
                                        clickToClose: !1,
                                        customSvgUrl: null,
                                        customSvgCode: null,
                                        svgSize: '80px',
                                        svgColor: '#32c682',
                                        messageID: 'NotiflixLoadingMessage',
                                        messageFontSize: '15px',
                                        messageMaxLength: 34,
                                        messageColor: '#dcdcdc',
                                    },
                                    o = function (e) {},
                                    r = function (t) {
                                        return (
                                            t || (t = 'head'),
                                            null !== e.document[t] ||
                                                (o(
                                                    '\nNotiflix needs to be appended to the "<' +
                                                        t +
                                                        '>" element, but you called it before the "<' +
                                                        t +
                                                        '>" element has been created.'
                                                ),
                                                !1)
                                        );
                                    },
                                    s = function (t, i) {
                                        if (!r('head')) return !1;
                                        if (null !== t() && !e.document.getElementById(i)) {
                                            var n = e.document.createElement('style');
                                            ((n.id = i), (n.innerHTML = t()), e.document.head.appendChild(n));
                                        }
                                    },
                                    l = function () {
                                        var e = {},
                                            t = !1,
                                            i = 0;
                                        '[object Boolean]' === Object.prototype.toString.call(arguments[0]) && ((t = arguments[0]), i++);
                                        for (
                                            var n = function (i) {
                                                for (var n in i)
                                                    Object.prototype.hasOwnProperty.call(i, n) &&
                                                        (t && '[object Object]' === Object.prototype.toString.call(i[n])
                                                            ? (e[n] = l(e[n], i[n]))
                                                            : (e[n] = i[n]));
                                            };
                                            i < arguments.length;
                                            i++
                                        )
                                            n(arguments[i]);
                                        return e;
                                    },
                                    c = function (t) {
                                        var i = e.document.createElement('div');
                                        return ((i.innerHTML = t), i.textContent || i.innerText || '');
                                    },
                                    m = function (e, t) {
                                        return (
                                            e || (e = '60px'),
                                            t || (t = '#32c682'),
                                            '<svg xmlns="http://www.w3.org/2000/svg" stroke="' +
                                                t +
                                                '" width="' +
                                                e +
                                                '" height="' +
                                                e +
                                                '" transform="scale(.8)" viewBox="0 0 38 38"><g fill="none" fill-rule="evenodd" stroke-width="2" transform="translate(1 1)"><circle cx="18" cy="18" r="18" stroke-opacity=".25"/><path d="M36 18c0-9.94-8.06-18-18-18"><animateTransform attributeName="transform" dur="1s" from="0 18 18" repeatCount="indefinite" to="360 18 18" type="rotate"/></path></g></svg>'
                                        );
                                    },
                                    f = function (e, t) {
                                        return (
                                            e || (e = '60px'),
                                            t || (t = '#32c682'),
                                            '<svg xmlns="http://www.w3.org/2000/svg" id="NXLoadingHourglass" fill="' +
                                                t +
                                                '" width="' +
                                                e +
                                                '" height="' +
                                                e +
                                                '" viewBox="0 0 200 200"><style>@-webkit-keyframes NXhourglass5-animation{0%{-webkit-transform:scale(1,1);transform:scale(1,1)}16.67%{-webkit-transform:scale(1,.8);transform:scale(1,.8)}33.33%{-webkit-transform:scale(.88,.6);transform:scale(.88,.6)}37.5%{-webkit-transform:scale(.85,.55);transform:scale(.85,.55)}41.67%{-webkit-transform:scale(.8,.5);transform:scale(.8,.5)}45.83%{-webkit-transform:scale(.75,.45);transform:scale(.75,.45)}50%{-webkit-transform:scale(.7,.4);transform:scale(.7,.4)}54.17%{-webkit-transform:scale(.6,.35);transform:scale(.6,.35)}58.33%{-webkit-transform:scale(.5,.3);transform:scale(.5,.3)}83.33%,to{-webkit-transform:scale(.2,0);transform:scale(.2,0)}}@keyframes NXhourglass5-animation{0%{-webkit-transform:scale(1,1);transform:scale(1,1)}16.67%{-webkit-transform:scale(1,.8);transform:scale(1,.8)}33.33%{-webkit-transform:scale(.88,.6);transform:scale(.88,.6)}37.5%{-webkit-transform:scale(.85,.55);transform:scale(.85,.55)}41.67%{-webkit-transform:scale(.8,.5);transform:scale(.8,.5)}45.83%{-webkit-transform:scale(.75,.45);transform:scale(.75,.45)}50%{-webkit-transform:scale(.7,.4);transform:scale(.7,.4)}54.17%{-webkit-transform:scale(.6,.35);transform:scale(.6,.35)}58.33%{-webkit-transform:scale(.5,.3);transform:scale(.5,.3)}83.33%,to{-webkit-transform:scale(.2,0);transform:scale(.2,0)}}@-webkit-keyframes NXhourglass3-animation{0%{-webkit-transform:scale(1,.02);transform:scale(1,.02)}79.17%,to{-webkit-transform:scale(1,1);transform:scale(1,1)}}@keyframes NXhourglass3-animation{0%{-webkit-transform:scale(1,.02);transform:scale(1,.02)}79.17%,to{-webkit-transform:scale(1,1);transform:scale(1,1)}}@-webkit-keyframes NXhourglass1-animation{0%,83.33%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(180deg);transform:rotate(180deg)}}@keyframes NXhourglass1-animation{0%,83.33%{-webkit-transform:rotate(0deg);transform:rotate(0deg)}to{-webkit-transform:rotate(180deg);transform:rotate(180deg)}}#NXLoadingHourglass *{-webkit-animation-duration:1.2s;animation-duration:1.2s;-webkit-animation-iteration-count:infinite;animation-iteration-count:infinite;-webkit-animation-timing-function:cubic-bezier(0,0,1,1);animation-timing-function:cubic-bezier(0,0,1,1)}</style><g data-animator-group="true" data-animator-type="1" style="-webkit-animation-name:NXhourglass1-animation;animation-name:NXhourglass1-animation;-webkit-transform-origin:50% 50%;transform-origin:50% 50%;transform-box:fill-box"><g id="NXhourglass2" fill="inherit"><g data-animator-group="true" data-animator-type="2" style="-webkit-animation-name:NXhourglass3-animation;animation-name:NXhourglass3-animation;-webkit-animation-timing-function:cubic-bezier(.42,0,.58,1);animation-timing-function:cubic-bezier(.42,0,.58,1);-webkit-transform-origin:50% 100%;transform-origin:50% 100%;transform-box:fill-box" opacity=".4"><path id="NXhourglass4" d="M100 100l-34.38 32.08v31.14h68.76v-31.14z"/></g><g data-animator-group="true" data-animator-type="2" style="-webkit-animation-name:NXhourglass5-animation;animation-name:NXhourglass5-animation;-webkit-transform-origin:50% 100%;transform-origin:50% 100%;transform-box:fill-box" opacity=".4"><path id="NXhourglass6" d="M100 100L65.62 67.92V36.78h68.76v31.14z"/></g><path d="M51.14 38.89h8.33v14.93c0 15.1 8.29 28.99 23.34 39.1 1.88 1.25 3.04 3.97 3.04 7.08s-1.16 5.83-3.04 7.09c-15.05 10.1-23.34 23.99-23.34 39.09v14.93h-8.33a4.859 4.859 0 1 0 0 9.72h97.72a4.859 4.859 0 1 0 0-9.72h-8.33v-14.93c0-15.1-8.29-28.99-23.34-39.09-1.88-1.26-3.04-3.98-3.04-7.09s1.16-5.83 3.04-7.08c15.05-10.11 23.34-24 23.34-39.1V38.89h8.33a4.859 4.859 0 1 0 0-9.72H51.14a4.859 4.859 0 1 0 0 9.72zm79.67 14.93c0 15.87-11.93 26.25-19.04 31.03-4.6 3.08-7.34 8.75-7.34 15.15 0 6.41 2.74 12.07 7.34 15.15 7.11 4.78 19.04 15.16 19.04 31.03v14.93H69.19v-14.93c0-15.87 11.93-26.25 19.04-31.02 4.6-3.09 7.34-8.75 7.34-15.16 0-6.4-2.74-12.07-7.34-15.15-7.11-4.78-19.04-15.16-19.04-31.03V38.89h61.62v14.93z"/></g></g></svg>'
                                        );
                                    },
                                    d = function (e, t) {
                                        return (
                                            e || (e = '60px'),
                                            t || (t = '#32c682'),
                                            '<svg xmlns="http://www.w3.org/2000/svg" width="' +
                                                e +
                                                '" height="' +
                                                e +
                                                '" viewBox="25 25 50 50" style="-webkit-animation:rotate 2s linear infinite;animation:rotate 2s linear infinite;height:' +
                                                e +
                                                ';-webkit-transform-origin:center center;-ms-transform-origin:center center;transform-origin:center center;width:' +
                                                e +
                                                ';position:absolute;top:0;left:0;margin:auto"><style>@-webkit-keyframes rotate{to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes rotate{to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}@-webkit-keyframes dash{0%{stroke-dasharray:1,200;stroke-dashoffset:0}50%{stroke-dasharray:89,200;stroke-dashoffset:-35}to{stroke-dasharray:89,200;stroke-dashoffset:-124}}@keyframes dash{0%{stroke-dasharray:1,200;stroke-dashoffset:0}50%{stroke-dasharray:89,200;stroke-dashoffset:-35}to{stroke-dasharray:89,200;stroke-dashoffset:-124}}</style><circle cx="50" cy="50" r="20" fill="none" stroke="' +
                                                t +
                                                '" stroke-width="2" style="-webkit-animation:dash 1.5s ease-in-out infinite,color 1.5s ease-in-out infinite;animation:dash 1.5s ease-in-out infinite,color 1.5s ease-in-out infinite" stroke-dasharray="150 200" stroke-dashoffset="-10" stroke-linecap="round"/></svg>'
                                        );
                                    },
                                    u = function (e, t) {
                                        return (
                                            e || (e = '60px'),
                                            t || (t = '#32c682'),
                                            '<svg xmlns="http://www.w3.org/2000/svg" fill="' +
                                                t +
                                                '" width="' +
                                                e +
                                                '" height="' +
                                                e +
                                                '" viewBox="0 0 128 128"><g><path fill="inherit" d="M109.25 55.5h-36l12-12a29.54 29.54 0 0 0-49.53 12H18.75A46.04 46.04 0 0 1 96.9 31.84l12.35-12.34v36zm-90.5 17h36l-12 12a29.54 29.54 0 0 0 49.53-12h16.97A46.04 46.04 0 0 1 31.1 96.16L18.74 108.5v-36z"/><animateTransform attributeName="transform" dur="1.5s" from="0 64 64" repeatCount="indefinite" to="360 64 64" type="rotate"/></g></svg>'
                                        );
                                    },
                                    g = function (e, t) {
                                        return (
                                            e || (e = '60px'),
                                            t || (t = '#32c682'),
                                            '<svg xmlns="http://www.w3.org/2000/svg" fill="' +
                                                t +
                                                '" width="' +
                                                e +
                                                '" height="' +
                                                e +
                                                '" viewBox="0 0 100 100"><g transform="translate(25 50)"><circle r="9" fill="inherit" transform="scale(.239)"><animateTransform attributeName="transform" begin="-0.266s" calcMode="spline" dur="0.8s" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" keyTimes="0;0.5;1" repeatCount="indefinite" type="scale" values="0;1;0"/></circle></g><g transform="translate(50 50)"><circle r="9" fill="inherit" transform="scale(.00152)"><animateTransform attributeName="transform" begin="-0.133s" calcMode="spline" dur="0.8s" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" keyTimes="0;0.5;1" repeatCount="indefinite" type="scale" values="0;1;0"/></circle></g><g transform="translate(75 50)"><circle r="9" fill="inherit" transform="scale(.299)"><animateTransform attributeName="transform" begin="0s" calcMode="spline" dur="0.8s" keySplines="0.3 0 0.7 1;0.3 0 0.7 1" keyTimes="0;0.5;1" repeatCount="indefinite" type="scale" values="0;1;0"/></circle></g></svg>'
                                        );
                                    },
                                    p = function (e, t) {
                                        return (
                                            e || (e = '60px'),
                                            t || (t = '#32c682'),
                                            '<svg xmlns="http://www.w3.org/2000/svg" stroke="' +
                                                t +
                                                '" width="' +
                                                e +
                                                '" height="' +
                                                e +
                                                '" viewBox="0 0 44 44"><g fill="none" fill-rule="evenodd" stroke-width="2"><circle cx="22" cy="22" r="1"><animate attributeName="r" begin="0s" calcMode="spline" dur="1.8s" keySplines="0.165, 0.84, 0.44, 1" keyTimes="0; 1" repeatCount="indefinite" values="1; 20"/><animate attributeName="stroke-opacity" begin="0s" calcMode="spline" dur="1.8s" keySplines="0.3, 0.61, 0.355, 1" keyTimes="0; 1" repeatCount="indefinite" values="1; 0"/></circle><circle cx="22" cy="22" r="1"><animate attributeName="r" begin="-0.9s" calcMode="spline" dur="1.8s" keySplines="0.165, 0.84, 0.44, 1" keyTimes="0; 1" repeatCount="indefinite" values="1; 20"/><animate attributeName="stroke-opacity" begin="-0.9s" calcMode="spline" dur="1.8s" keySplines="0.3, 0.61, 0.355, 1" keyTimes="0; 1" repeatCount="indefinite" values="1; 0"/></circle></g></svg>'
                                        );
                                    },
                                    b = function (e, t, i) {
                                        return (
                                            e || (e = '60px'),
                                            t || (t = '#f8f8f8'),
                                            i || (i = '#32c682'),
                                            '<svg xmlns="http://www.w3.org/2000/svg" id="NXLoadingNotiflixLib" width="' +
                                                e +
                                                '" height="' +
                                                e +
                                                '" viewBox="0 0 200 200"><defs><style>@keyframes notiflix-n{0%{stroke-dashoffset:1000}to{stroke-dashoffset:0}}@keyframes notiflix-x{0%{stroke-dashoffset:1000}to{stroke-dashoffset:0}}@keyframes notiflix-dot{0%,to{stroke-width:0}50%{stroke-width:12}}.nx-icon-line{stroke:' +
                                                t +
                                                ';stroke-width:12;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:22;fill:none}</style></defs><path d="M47.97 135.05a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13z" style="animation-name:notiflix-dot;animation-timing-function:ease-in-out;animation-duration:1.25s;animation-iteration-count:infinite;animation-direction:normal" fill="' +
                                                i +
                                                '" stroke="' +
                                                i +
                                                '" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="22" stroke-width="12"/><path class="nx-icon-line" d="M10.14 144.76V87.55c0-5.68-4.54-41.36 37.83-41.36 42.36 0 37.82 35.68 37.82 41.36v57.21" style="animation-name:notiflix-n;animation-timing-function:linear;animation-duration:2.5s;animation-delay:0s;animation-iteration-count:infinite;animation-direction:normal" stroke-dasharray="500"/><path class="nx-icon-line" d="M115.06 144.49c24.98-32.68 49.96-65.35 74.94-98.03M114.89 46.6c25.09 32.58 50.19 65.17 75.29 97.75" style="animation-name:notiflix-x;animation-timing-function:linear;animation-duration:2.5s;animation-delay:.2s;animation-iteration-count:infinite;animation-direction:normal" stroke-dasharray="500"/></svg>'
                                        );
                                    },
                                    h = function () {
                                        return '[id^=NotiflixLoadingWrap]{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;position:fixed;z-index:4000;width:100%;height:100%;left:0;top:0;right:0;bottom:0;margin:auto;display:-webkit-box;display:-webkit-flex;display:-ms-flexbox;display:flex;-webkit-flex-wrap:wrap;-ms-flex-wrap:wrap;flex-wrap:wrap;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;-ms-flex-direction:column;flex-direction:column;-webkit-box-align:center;-webkit-align-items:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-ms-flex-pack:center;justify-content:center;text-align:center;-webkit-box-sizing:border-box;box-sizing:border-box;background:rgba(0,0,0,.8);font-family:"Quicksand",-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}[id^=NotiflixLoadingWrap] *{-webkit-box-sizing:border-box;box-sizing:border-box}[id^=NotiflixLoadingWrap].nx-loading-click-to-close{cursor:pointer}[id^=NotiflixLoadingWrap]>div[class*="-icon"]{width:60px;height:60px;position:relative;-webkit-transition:top .2s ease-in-out;-o-transition:top .2s ease-in-out;transition:top .2s ease-in-out;margin:0 auto}[id^=NotiflixLoadingWrap]>div[class*="-icon"] img,[id^=NotiflixLoadingWrap]>div[class*="-icon"] svg{max-width:unset;max-height:unset;width:100%;height:auto;position:absolute;left:0;top:0}[id^=NotiflixLoadingWrap]>p{position:relative;margin:10px auto 0;font-family:inherit!important;font-weight:normal;font-size:15px;line-height:1.4;padding:0 10px;width:100%;text-align:center}[id^=NotiflixLoadingWrap].nx-with-animation{-webkit-animation:loading-animation-fade .3s ease-in-out 0s normal;animation:loading-animation-fade .3s ease-in-out 0s normal}@-webkit-keyframes loading-animation-fade{0%{opacity:0}100%{opacity:1}}@keyframes loading-animation-fade{0%{opacity:0}100%{opacity:1}}[id^=NotiflixLoadingWrap].nx-with-animation.nx-remove{opacity:0;-webkit-animation:loading-animation-fade-remove .3s ease-in-out 0s normal;animation:loading-animation-fade-remove .3s ease-in-out 0s normal}@-webkit-keyframes loading-animation-fade-remove{0%{opacity:1}100%{opacity:0}}@keyframes loading-animation-fade-remove{0%{opacity:1}100%{opacity:0}}[id^=NotiflixLoadingWrap]>p.nx-loading-message-new{-webkit-animation:loading-new-message-fade .3s ease-in-out 0s normal;animation:loading-new-message-fade .3s ease-in-out 0s normal}@-webkit-keyframes loading-new-message-fade{0%{opacity:0}100%{opacity:1}}@keyframes loading-new-message-fade{0%{opacity:0}100%{opacity:1}}';
                                    },
                                    k = function (s, h, k, y, v) {
                                        if (!r('body')) return !1;
                                        t || w.Loading.init({});
                                        var x = l(!0, t, {});
                                        if (('object' == typeof h && !Array.isArray(h)) || ('object' == typeof k && !Array.isArray(k))) {
                                            var N = {};
                                            ('object' == typeof h ? (N = h) : 'object' == typeof k && (N = k), (t = l(!0, t, N)));
                                        }
                                        var S = '';
                                        if (('string' == typeof h && h.length > 0 && (S = h), y)) {
                                            var C = '';
                                            ((S =
                                                S.length > t.messageMaxLength
                                                    ? c(S).toString().substring(0, t.messageMaxLength) + '...'
                                                    : c(S).toString()).length > 0 &&
                                                (C =
                                                    '<p id="' +
                                                    t.messageID +
                                                    '" class="nx-loading-message" style="color:' +
                                                    t.messageColor +
                                                    ';font-size:' +
                                                    t.messageFontSize +
                                                    ';">' +
                                                    S +
                                                    '</p>'),
                                                t.cssAnimation || (t.cssAnimationDuration = 0));
                                            var L = '';
                                            if (s === n.Standard) L = m(t.svgSize, t.svgColor);
                                            else if (s === n.Hourglass) L = f(t.svgSize, t.svgColor);
                                            else if (s === n.Circle) L = d(t.svgSize, t.svgColor);
                                            else if (s === n.Arrows) L = u(t.svgSize, t.svgColor);
                                            else if (s === n.Dots) L = g(t.svgSize, t.svgColor);
                                            else if (s === n.Pulse) L = p(t.svgSize, t.svgColor);
                                            else if (s === n.Custom && null !== t.customSvgCode && null === t.customSvgUrl)
                                                L = t.customSvgCode || '';
                                            else if (s === n.Custom && null !== t.customSvgUrl && null === t.customSvgCode)
                                                L =
                                                    '<img class="nx-custom-loading-icon" width="' +
                                                    t.svgSize +
                                                    '" height="' +
                                                    t.svgSize +
                                                    '" src="' +
                                                    t.customSvgUrl +
                                                    '" alt="Notiflix">';
                                            else {
                                                if (s === n.Custom && (null === t.customSvgUrl || null === t.customSvgCode))
                                                    return (
                                                        o(
                                                            'You have to set a static SVG url to "customSvgUrl" option to use Loading Custom.'
                                                        ),
                                                        !1
                                                    );
                                                L = b(t.svgSize, '#f8f8f8', '#32c682');
                                            }
                                            var z = parseInt((t.svgSize || '').replace(/[^0-9]/g, '')),
                                                M = e.innerWidth,
                                                T = z >= M ? M - 40 + 'px' : z + 'px',
                                                A =
                                                    '<div style="width:' +
                                                    T +
                                                    '; height:' +
                                                    T +
                                                    ';" class="' +
                                                    t.className +
                                                    '-icon' +
                                                    (S.length > 0 ? ' nx-with-message' : '') +
                                                    '">' +
                                                    L +
                                                    '</div>',
                                                B = e.document.createElement('div');
                                            ((B.id = a.ID),
                                                (B.className =
                                                    t.className +
                                                    (t.cssAnimation ? ' nx-with-animation' : '') +
                                                    (t.clickToClose ? ' nx-loading-click-to-close' : '')),
                                                (B.style.zIndex = t.zindex),
                                                (B.style.background = t.backgroundColor),
                                                (B.style.animationDuration = t.cssAnimationDuration + 'ms'),
                                                (B.style.fontFamily = '"' + t.fontFamily + '", ' + i),
                                                (B.style.display = 'flex'),
                                                (B.style.flexWrap = 'wrap'),
                                                (B.style.flexDirection = 'column'),
                                                (B.style.alignItems = 'center'),
                                                (B.style.justifyContent = 'center'),
                                                t.rtl && (B.setAttribute('dir', 'rtl'), B.classList.add('nx-rtl-on')),
                                                (B.innerHTML = A + C),
                                                e.document.getElementById(B.id) ||
                                                    (e.document.body.appendChild(B),
                                                    t.clickToClose &&
                                                        e.document.getElementById(B.id).addEventListener('click', function () {
                                                            B.classList.add('nx-remove');
                                                            var e = setTimeout(function () {
                                                                null !== B.parentNode && (B.parentNode.removeChild(B), clearTimeout(e));
                                                            }, t.cssAnimationDuration);
                                                        })));
                                        } else if (e.document.getElementById(a.ID))
                                            var j = e.document.getElementById(a.ID),
                                                H = setTimeout(function () {
                                                    j.classList.add('nx-remove');
                                                    var e = setTimeout(function () {
                                                        null !== j.parentNode && (j.parentNode.removeChild(j), clearTimeout(e));
                                                    }, t.cssAnimationDuration);
                                                    clearTimeout(H);
                                                }, v);
                                        t = l(!0, t, x);
                                    },
                                    y = function (i) {
                                        'string' != typeof i && (i = '');
                                        var n = e.document.getElementById(a.ID);
                                        if (n)
                                            if (i.length > 0) {
                                                i = i.length > t.messageMaxLength ? c(i).substring(0, t.messageMaxLength) + '...' : c(i);
                                                var r = n.getElementsByTagName('p')[0];
                                                if (r) r.innerHTML = i;
                                                else {
                                                    var s = e.document.createElement('p');
                                                    ((s.id = t.messageID),
                                                        (s.className = 'nx-loading-message nx-loading-message-new'),
                                                        (s.style.color = t.messageColor),
                                                        (s.style.fontSize = t.messageFontSize),
                                                        (s.innerHTML = i),
                                                        n.appendChild(s));
                                                }
                                            } else o('Where is the new message?');
                                    },
                                    w = {
                                        Loading: {
                                            init: function (e) {
                                                ((t = l(!0, a, e)), s(h, 'NotiflixLoadingInternalCSS'));
                                            },
                                            merge: function (e) {
                                                if (!t)
                                                    return (o('You have to initialize the Loading module before call Merge function.'), !1);
                                                t = l(!0, t, e);
                                            },
                                            standard: function (e, t) {
                                                k(n.Standard, e, t, !0, 0);
                                            },
                                            hourglass: function (e, t) {
                                                k(n.Hourglass, e, t, !0, 0);
                                            },
                                            circle: function (e, t) {
                                                k(n.Circle, e, t, !0, 0);
                                            },
                                            arrows: function (e, t) {
                                                k(n.Arrows, e, t, !0, 0);
                                            },
                                            dots: function (e, t) {
                                                k(n.Dots, e, t, !0, 0);
                                            },
                                            pulse: function (e, t) {
                                                k(n.Pulse, e, t, !0, 0);
                                            },
                                            custom: function (e, t) {
                                                k(n.Custom, e, t, !0, 0);
                                            },
                                            notiflix: function (e, t) {
                                                k(n.Notiflix, e, t, !0, 0);
                                            },
                                            remove: function (e) {
                                                ('number' != typeof e && (e = 0), k(null, null, null, !1, e));
                                            },
                                            change: function (e) {
                                                y(e);
                                            },
                                        },
                                    };
                                return 'object' == typeof e.Notiflix ? l(!0, e.Notiflix, { Loading: w.Loading }) : { Loading: w.Loading };
                            })(a);
                        }.apply(t, [])),
                        void 0 === n || (e.exports = n));
                },
            },
            t = {};
        function i(n) {
            var a = t[n];
            if (void 0 !== a) return a.exports;
            var o = (t[n] = { exports: {} });
            return (e[n].call(o.exports, o, o.exports, i), o.exports);
        }
        ((i.n = function (e) {
            var t =
                e && e.__esModule
                    ? function () {
                          return e.default;
                      }
                    : function () {
                          return e;
                      };
            return (i.d(t, { a: t }), t);
        }),
            (i.d = function (e, t) {
                for (var n in t) i.o(t, n) && !i.o(e, n) && Object.defineProperty(e, n, { enumerable: !0, get: t[n] });
            }),
            (i.g = (function () {
                if ('object' == typeof globalThis) return globalThis;
                try {
                    return this || new Function('return this')();
                } catch (e) {
                    if ('object' == typeof window) return window;
                }
            })()),
            (i.o = function (e, t) {
                return Object.prototype.hasOwnProperty.call(e, t);
            }),
            (i.r = function (e) {
                ('undefined' != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
                    Object.defineProperty(e, '__esModule', { value: !0 }));
            }));
        var n = {};
        return (
            (function () {
                'use strict';
                (i.r(n),
                    i.d(n, {
                        Block: function () {
                            return t.Block;
                        },
                        Loading: function () {
                            return e.Loading;
                        },
                    }));
                var e = i(4443),
                    t = i(8666);
            })(),
            n
        );
    })();
});
