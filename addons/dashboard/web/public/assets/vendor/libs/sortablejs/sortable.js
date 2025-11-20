/**
 * @namespace: addons/dashboard/web/public/assets/vendor/libs/sortablejs/sortable.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

!(function (t, e) {
    if ('object' == typeof exports && 'object' == typeof module) module.exports = e();
    else if ('function' == typeof define && define.amd) define([], e);
    else {
        var n = e();
        for (var o in n) ('object' == typeof exports ? exports : t)[o] = n[o];
    }
})(self, function () {
    return (function () {
        var t = {
                5311: function (t) {
                    t.exports = (function () {
                        'use strict';
                        function t(t, e) {
                            var n = Object.keys(t);
                            if (Object.getOwnPropertySymbols) {
                                var o = Object.getOwnPropertySymbols(t);
                                (e &&
                                    (o = o.filter(function (e) {
                                        return Object.getOwnPropertyDescriptor(t, e).enumerable;
                                    })),
                                    n.push.apply(n, o));
                            }
                            return n;
                        }
                        function e(e) {
                            for (var n = 1; n < arguments.length; n++) {
                                var i = null != arguments[n] ? arguments[n] : {};
                                n % 2
                                    ? t(Object(i), !0).forEach(function (t) {
                                          o(e, t, i[t]);
                                      })
                                    : Object.getOwnPropertyDescriptors
                                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(i))
                                      : t(Object(i)).forEach(function (t) {
                                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(i, t));
                                        });
                            }
                            return e;
                        }
                        function n(t) {
                            return (
                                (n =
                                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                                        ? function (t) {
                                              return typeof t;
                                          }
                                        : function (t) {
                                              return t && 'function' == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype
                                                  ? 'symbol'
                                                  : typeof t;
                                          }),
                                n(t)
                            );
                        }
                        function o(t, e, n) {
                            return (
                                e in t
                                    ? Object.defineProperty(t, e, { value: n, enumerable: !0, configurable: !0, writable: !0 })
                                    : (t[e] = n),
                                t
                            );
                        }
                        function i() {
                            return (
                                (i =
                                    Object.assign ||
                                    function (t) {
                                        for (var e = 1; e < arguments.length; e++) {
                                            var n = arguments[e];
                                            for (var o in n) Object.prototype.hasOwnProperty.call(n, o) && (t[o] = n[o]);
                                        }
                                        return t;
                                    }),
                                i.apply(this, arguments)
                            );
                        }
                        function r(t, e) {
                            if (null == t) return {};
                            var n,
                                o,
                                i = {},
                                r = Object.keys(t);
                            for (o = 0; o < r.length; o++) ((n = r[o]), e.indexOf(n) >= 0 || (i[n] = t[n]));
                            return i;
                        }
                        function a(t, e) {
                            if (null == t) return {};
                            var n,
                                o,
                                i = r(t, e);
                            if (Object.getOwnPropertySymbols) {
                                var a = Object.getOwnPropertySymbols(t);
                                for (o = 0; o < a.length; o++)
                                    ((n = a[o]), e.indexOf(n) >= 0 || (Object.prototype.propertyIsEnumerable.call(t, n) && (i[n] = t[n])));
                            }
                            return i;
                        }
                        function l(t) {
                            return s(t) || c(t) || u(t) || h();
                        }
                        function s(t) {
                            if (Array.isArray(t)) return d(t);
                        }
                        function c(t) {
                            if (('undefined' != typeof Symbol && null != t[Symbol.iterator]) || null != t['@@iterator'])
                                return Array.from(t);
                        }
                        function u(t, e) {
                            if (t) {
                                if ('string' == typeof t) return d(t, e);
                                var n = Object.prototype.toString.call(t).slice(8, -1);
                                return (
                                    'Object' === n && t.constructor && (n = t.constructor.name),
                                    'Map' === n || 'Set' === n
                                        ? Array.from(t)
                                        : 'Arguments' === n || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                                          ? d(t, e)
                                          : void 0
                                );
                            }
                        }
                        function d(t, e) {
                            (null == e || e > t.length) && (e = t.length);
                            for (var n = 0, o = new Array(e); n < e; n++) o[n] = t[n];
                            return o;
                        }
                        function h() {
                            throw new TypeError(
                                'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                            );
                        }
                        var f = '1.15.6';
                        function p(t) {
                            if ('undefined' != typeof window && window.navigator) return !!navigator.userAgent.match(t);
                        }
                        var g = p(/(?:Trident.*rv[ :]?11\.|msie|iemobile|Windows Phone)/i),
                            v = p(/Edge/i),
                            m = p(/firefox/i),
                            b = p(/safari/i) && !p(/chrome/i) && !p(/android/i),
                            y = p(/iP(ad|od|hone)/i),
                            w = p(/chrome/i) && p(/android/i),
                            D = { capture: !1, passive: !1 };
                        function E(t, e, n) {
                            t.addEventListener(e, n, !g && D);
                        }
                        function S(t, e, n) {
                            t.removeEventListener(e, n, !g && D);
                        }
                        function _(t, e) {
                            if (e) {
                                if (('>' === e[0] && (e = e.substring(1)), t))
                                    try {
                                        if (t.matches) return t.matches(e);
                                        if (t.msMatchesSelector) return t.msMatchesSelector(e);
                                        if (t.webkitMatchesSelector) return t.webkitMatchesSelector(e);
                                    } catch (t) {
                                        return !1;
                                    }
                                return !1;
                            }
                        }
                        function C(t) {
                            return t.host && t !== document && t.host.nodeType ? t.host : t.parentNode;
                        }
                        function x(t, e, n, o) {
                            if (t) {
                                n = n || document;
                                do {
                                    if ((null != e && ('>' === e[0] ? t.parentNode === n && _(t, e) : _(t, e))) || (o && t === n)) return t;
                                    if (t === n) break;
                                } while ((t = C(t)));
                            }
                            return null;
                        }
                        var T,
                            O = /\s+/g;
                        function M(t, e, n) {
                            if (t && e)
                                if (t.classList) t.classList[n ? 'add' : 'remove'](e);
                                else {
                                    var o = (' ' + t.className + ' ').replace(O, ' ').replace(' ' + e + ' ', ' ');
                                    t.className = (o + (n ? ' ' + e : '')).replace(O, ' ');
                                }
                        }
                        function A(t, e, n) {
                            var o = t && t.style;
                            if (o) {
                                if (void 0 === n)
                                    return (
                                        document.defaultView && document.defaultView.getComputedStyle
                                            ? (n = document.defaultView.getComputedStyle(t, ''))
                                            : t.currentStyle && (n = t.currentStyle),
                                        void 0 === e ? n : n[e]
                                    );
                                (e in o || -1 !== e.indexOf('webkit') || (e = '-webkit-' + e),
                                    (o[e] = n + ('string' == typeof n ? '' : 'px')));
                            }
                        }
                        function N(t, e) {
                            var n = '';
                            if ('string' == typeof t) n = t;
                            else
                                do {
                                    var o = A(t, 'transform');
                                    o && 'none' !== o && (n = o + ' ' + n);
                                } while (!e && (t = t.parentNode));
                            var i = window.DOMMatrix || window.WebKitCSSMatrix || window.CSSMatrix || window.MSCSSMatrix;
                            return i && new i(n);
                        }
                        function I(t, e, n) {
                            if (t) {
                                var o = t.getElementsByTagName(e),
                                    i = 0,
                                    r = o.length;
                                if (n) for (; i < r; i++) n(o[i], i);
                                return o;
                            }
                            return [];
                        }
                        function P() {
                            var t = document.scrollingElement;
                            return t || document.documentElement;
                        }
                        function k(t, e, n, o, i) {
                            if (t.getBoundingClientRect || t === window) {
                                var r, a, l, s, c, u, d;
                                if (
                                    (t !== window && t.parentNode && t !== P()
                                        ? ((a = (r = t.getBoundingClientRect()).top),
                                          (l = r.left),
                                          (s = r.bottom),
                                          (c = r.right),
                                          (u = r.height),
                                          (d = r.width))
                                        : ((a = 0),
                                          (l = 0),
                                          (s = window.innerHeight),
                                          (c = window.innerWidth),
                                          (u = window.innerHeight),
                                          (d = window.innerWidth)),
                                    (e || n) && t !== window && ((i = i || t.parentNode), !g))
                                )
                                    do {
                                        if (
                                            i &&
                                            i.getBoundingClientRect &&
                                            ('none' !== A(i, 'transform') || (n && 'static' !== A(i, 'position')))
                                        ) {
                                            var h = i.getBoundingClientRect();
                                            ((a -= h.top + parseInt(A(i, 'border-top-width'))),
                                                (l -= h.left + parseInt(A(i, 'border-left-width'))),
                                                (s = a + r.height),
                                                (c = l + r.width));
                                            break;
                                        }
                                    } while ((i = i.parentNode));
                                if (o && t !== window) {
                                    var f = N(i || t),
                                        p = f && f.a,
                                        v = f && f.d;
                                    f && ((s = (a /= v) + (u /= v)), (c = (l /= p) + (d /= p)));
                                }
                                return { top: a, left: l, bottom: s, right: c, width: d, height: u };
                            }
                        }
                        function R(t, e, n) {
                            for (var o = H(t, !0), i = k(t)[e]; o; ) {
                                var r = k(o)[n];
                                if (!('top' === n || 'left' === n ? i >= r : i <= r)) return o;
                                if (o === P()) break;
                                o = H(o, !1);
                            }
                            return !1;
                        }
                        function X(t, e, n, o) {
                            for (var i = 0, r = 0, a = t.children; r < a.length; ) {
                                if (
                                    'none' !== a[r].style.display &&
                                    a[r] !== te.ghost &&
                                    (o || a[r] !== te.dragged) &&
                                    x(a[r], n.draggable, t, !1)
                                ) {
                                    if (i === e) return a[r];
                                    i++;
                                }
                                r++;
                            }
                            return null;
                        }
                        function Y(t, e) {
                            for (var n = t.lastElementChild; n && (n === te.ghost || 'none' === A(n, 'display') || (e && !_(n, e))); )
                                n = n.previousElementSibling;
                            return n || null;
                        }
                        function B(t, e) {
                            var n = 0;
                            if (!t || !t.parentNode) return -1;
                            for (; (t = t.previousElementSibling); )
                                'TEMPLATE' === t.nodeName.toUpperCase() || t === te.clone || (e && !_(t, e)) || n++;
                            return n;
                        }
                        function j(t) {
                            var e = 0,
                                n = 0,
                                o = P();
                            if (t)
                                do {
                                    var i = N(t),
                                        r = i.a,
                                        a = i.d;
                                    ((e += t.scrollLeft * r), (n += t.scrollTop * a));
                                } while (t !== o && (t = t.parentNode));
                            return [e, n];
                        }
                        function F(t, e) {
                            for (var n in t)
                                if (t.hasOwnProperty(n)) for (var o in e) if (e.hasOwnProperty(o) && e[o] === t[n][o]) return Number(n);
                            return -1;
                        }
                        function H(t, e) {
                            if (!t || !t.getBoundingClientRect) return P();
                            var n = t,
                                o = !1;
                            do {
                                if (n.clientWidth < n.scrollWidth || n.clientHeight < n.scrollHeight) {
                                    var i = A(n);
                                    if (
                                        (n.clientWidth < n.scrollWidth && ('auto' == i.overflowX || 'scroll' == i.overflowX)) ||
                                        (n.clientHeight < n.scrollHeight && ('auto' == i.overflowY || 'scroll' == i.overflowY))
                                    ) {
                                        if (!n.getBoundingClientRect || n === document.body) return P();
                                        if (o || e) return n;
                                        o = !0;
                                    }
                                }
                            } while ((n = n.parentNode));
                            return P();
                        }
                        function L(t, e) {
                            if (t && e) for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
                            return t;
                        }
                        function K(t, e) {
                            return (
                                Math.round(t.top) === Math.round(e.top) &&
                                Math.round(t.left) === Math.round(e.left) &&
                                Math.round(t.height) === Math.round(e.height) &&
                                Math.round(t.width) === Math.round(e.width)
                            );
                        }
                        function W(t, e) {
                            return function () {
                                if (!T) {
                                    var n = arguments,
                                        o = this;
                                    (1 === n.length ? t.call(o, n[0]) : t.apply(o, n),
                                        (T = setTimeout(function () {
                                            T = void 0;
                                        }, e)));
                                }
                            };
                        }
                        function z() {
                            (clearTimeout(T), (T = void 0));
                        }
                        function G(t, e, n) {
                            ((t.scrollLeft += e), (t.scrollTop += n));
                        }
                        function U(t) {
                            var e = window.Polymer,
                                n = window.jQuery || window.Zepto;
                            return e && e.dom ? e.dom(t).cloneNode(!0) : n ? n(t).clone(!0)[0] : t.cloneNode(!0);
                        }
                        function q(t, e) {
                            (A(t, 'position', 'absolute'),
                                A(t, 'top', e.top),
                                A(t, 'left', e.left),
                                A(t, 'width', e.width),
                                A(t, 'height', e.height));
                        }
                        function V(t) {
                            (A(t, 'position', ''), A(t, 'top', ''), A(t, 'left', ''), A(t, 'width', ''), A(t, 'height', ''));
                        }
                        function Z(t, e, n) {
                            var o = {};
                            return (
                                Array.from(t.children).forEach(function (i) {
                                    var r, a, l, s;
                                    if (x(i, e.draggable, t, !1) && !i.animated && i !== n) {
                                        var c = k(i);
                                        ((o.left = Math.min(null !== (r = o.left) && void 0 !== r ? r : 1 / 0, c.left)),
                                            (o.top = Math.min(null !== (a = o.top) && void 0 !== a ? a : 1 / 0, c.top)),
                                            (o.right = Math.max(null !== (l = o.right) && void 0 !== l ? l : -1 / 0, c.right)),
                                            (o.bottom = Math.max(null !== (s = o.bottom) && void 0 !== s ? s : -1 / 0, c.bottom)));
                                    }
                                }),
                                (o.width = o.right - o.left),
                                (o.height = o.bottom - o.top),
                                (o.x = o.left),
                                (o.y = o.top),
                                o
                            );
                        }
                        var $ = 'Sortable' + new Date().getTime();
                        function Q() {
                            var t,
                                n = [];
                            return {
                                captureAnimationState: function () {
                                    ((n = []),
                                        this.options.animation &&
                                            [].slice.call(this.el.children).forEach(function (t) {
                                                if ('none' !== A(t, 'display') && t !== te.ghost) {
                                                    n.push({ target: t, rect: k(t) });
                                                    var o = e({}, n[n.length - 1].rect);
                                                    if (t.thisAnimationDuration) {
                                                        var i = N(t, !0);
                                                        i && ((o.top -= i.f), (o.left -= i.e));
                                                    }
                                                    t.fromRect = o;
                                                }
                                            }));
                                },
                                addAnimationState: function (t) {
                                    n.push(t);
                                },
                                removeAnimationState: function (t) {
                                    n.splice(F(n, { target: t }), 1);
                                },
                                animateAll: function (e) {
                                    var o = this;
                                    if (!this.options.animation) return (clearTimeout(t), void ('function' == typeof e && e()));
                                    var i = !1,
                                        r = 0;
                                    (n.forEach(function (t) {
                                        var e = 0,
                                            n = t.target,
                                            a = n.fromRect,
                                            l = k(n),
                                            s = n.prevFromRect,
                                            c = n.prevToRect,
                                            u = t.rect,
                                            d = N(n, !0);
                                        (d && ((l.top -= d.f), (l.left -= d.e)),
                                            (n.toRect = l),
                                            n.thisAnimationDuration &&
                                                K(s, l) &&
                                                !K(a, l) &&
                                                (u.top - l.top) / (u.left - l.left) == (a.top - l.top) / (a.left - l.left) &&
                                                (e = tt(u, s, c, o.options)),
                                            K(l, a) ||
                                                ((n.prevFromRect = a),
                                                (n.prevToRect = l),
                                                e || (e = o.options.animation),
                                                o.animate(n, u, l, e)),
                                            e &&
                                                ((i = !0),
                                                (r = Math.max(r, e)),
                                                clearTimeout(n.animationResetTimer),
                                                (n.animationResetTimer = setTimeout(function () {
                                                    ((n.animationTime = 0),
                                                        (n.prevFromRect = null),
                                                        (n.fromRect = null),
                                                        (n.prevToRect = null),
                                                        (n.thisAnimationDuration = null));
                                                }, e)),
                                                (n.thisAnimationDuration = e)));
                                    }),
                                        clearTimeout(t),
                                        i
                                            ? (t = setTimeout(function () {
                                                  'function' == typeof e && e();
                                              }, r))
                                            : 'function' == typeof e && e(),
                                        (n = []));
                                },
                                animate: function (t, e, n, o) {
                                    if (o) {
                                        (A(t, 'transition', ''), A(t, 'transform', ''));
                                        var i = N(this.el),
                                            r = i && i.a,
                                            a = i && i.d,
                                            l = (e.left - n.left) / (r || 1),
                                            s = (e.top - n.top) / (a || 1);
                                        ((t.animatingX = !!l),
                                            (t.animatingY = !!s),
                                            A(t, 'transform', 'translate3d(' + l + 'px,' + s + 'px,0)'),
                                            (this.forRepaintDummy = J(t)),
                                            A(
                                                t,
                                                'transition',
                                                'transform ' + o + 'ms' + (this.options.easing ? ' ' + this.options.easing : '')
                                            ),
                                            A(t, 'transform', 'translate3d(0,0,0)'),
                                            'number' == typeof t.animated && clearTimeout(t.animated),
                                            (t.animated = setTimeout(function () {
                                                (A(t, 'transition', ''),
                                                    A(t, 'transform', ''),
                                                    (t.animated = !1),
                                                    (t.animatingX = !1),
                                                    (t.animatingY = !1));
                                            }, o)));
                                    }
                                },
                            };
                        }
                        function J(t) {
                            return t.offsetWidth;
                        }
                        function tt(t, e, n, o) {
                            return (
                                (Math.sqrt(Math.pow(e.top - t.top, 2) + Math.pow(e.left - t.left, 2)) /
                                    Math.sqrt(Math.pow(e.top - n.top, 2) + Math.pow(e.left - n.left, 2))) *
                                o.animation
                            );
                        }
                        var et = [],
                            nt = { initializeByDefault: !0 },
                            ot = {
                                mount: function (t) {
                                    for (var e in nt) nt.hasOwnProperty(e) && !(e in t) && (t[e] = nt[e]);
                                    (et.forEach(function (e) {
                                        if (e.pluginName === t.pluginName)
                                            throw 'Sortable: Cannot mount plugin '.concat(t.pluginName, ' more than once');
                                    }),
                                        et.push(t));
                                },
                                pluginEvent: function (t, n, o) {
                                    var i = this;
                                    ((this.eventCanceled = !1),
                                        (o.cancel = function () {
                                            i.eventCanceled = !0;
                                        }));
                                    var r = t + 'Global';
                                    et.forEach(function (i) {
                                        n[i.pluginName] &&
                                            (n[i.pluginName][r] && n[i.pluginName][r](e({ sortable: n }, o)),
                                            n.options[i.pluginName] && n[i.pluginName][t] && n[i.pluginName][t](e({ sortable: n }, o)));
                                    });
                                },
                                initializePlugins: function (t, e, n, o) {
                                    for (var r in (et.forEach(function (o) {
                                        var r = o.pluginName;
                                        if (t.options[r] || o.initializeByDefault) {
                                            var a = new o(t, e, t.options);
                                            ((a.sortable = t), (a.options = t.options), (t[r] = a), i(n, a.defaults));
                                        }
                                    }),
                                    t.options))
                                        if (t.options.hasOwnProperty(r)) {
                                            var a = this.modifyOption(t, r, t.options[r]);
                                            void 0 !== a && (t.options[r] = a);
                                        }
                                },
                                getEventProperties: function (t, e) {
                                    var n = {};
                                    return (
                                        et.forEach(function (o) {
                                            'function' == typeof o.eventProperties && i(n, o.eventProperties.call(e[o.pluginName], t));
                                        }),
                                        n
                                    );
                                },
                                modifyOption: function (t, e, n) {
                                    var o;
                                    return (
                                        et.forEach(function (i) {
                                            t[i.pluginName] &&
                                                i.optionListeners &&
                                                'function' == typeof i.optionListeners[e] &&
                                                (o = i.optionListeners[e].call(t[i.pluginName], n));
                                        }),
                                        o
                                    );
                                },
                            };
                        function it(t) {
                            var n = t.sortable,
                                o = t.rootEl,
                                i = t.name,
                                r = t.targetEl,
                                a = t.cloneEl,
                                l = t.toEl,
                                s = t.fromEl,
                                c = t.oldIndex,
                                u = t.newIndex,
                                d = t.oldDraggableIndex,
                                h = t.newDraggableIndex,
                                f = t.originalEvent,
                                p = t.putSortable,
                                m = t.extraEventProperties;
                            if ((n = n || (o && o[$]))) {
                                var b,
                                    y = n.options,
                                    w = 'on' + i.charAt(0).toUpperCase() + i.substr(1);
                                (!window.CustomEvent || g || v
                                    ? (b = document.createEvent('Event')).initEvent(i, !0, !0)
                                    : (b = new CustomEvent(i, { bubbles: !0, cancelable: !0 })),
                                    (b.to = l || o),
                                    (b.from = s || o),
                                    (b.item = r || o),
                                    (b.clone = a),
                                    (b.oldIndex = c),
                                    (b.newIndex = u),
                                    (b.oldDraggableIndex = d),
                                    (b.newDraggableIndex = h),
                                    (b.originalEvent = f),
                                    (b.pullMode = p ? p.lastPutMode : void 0));
                                var D = e(e({}, m), ot.getEventProperties(i, n));
                                for (var E in D) b[E] = D[E];
                                (o && o.dispatchEvent(b), y[w] && y[w].call(n, b));
                            }
                        }
                        var rt = ['evt'],
                            at = function (t, n) {
                                var o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
                                    i = o.evt,
                                    r = a(o, rt);
                                ot.pluginEvent.bind(te)(
                                    t,
                                    n,
                                    e(
                                        {
                                            dragEl: st,
                                            parentEl: ct,
                                            ghostEl: ut,
                                            rootEl: dt,
                                            nextEl: ht,
                                            lastDownEl: ft,
                                            cloneEl: pt,
                                            cloneHidden: gt,
                                            dragStarted: Ot,
                                            putSortable: Dt,
                                            activeSortable: te.active,
                                            originalEvent: i,
                                            oldIndex: vt,
                                            oldDraggableIndex: bt,
                                            newIndex: mt,
                                            newDraggableIndex: yt,
                                            hideGhostForTarget: Zt,
                                            unhideGhostForTarget: $t,
                                            cloneNowHidden: function () {
                                                gt = !0;
                                            },
                                            cloneNowShown: function () {
                                                gt = !1;
                                            },
                                            dispatchSortableEvent: function (t) {
                                                lt({ sortable: n, name: t, originalEvent: i });
                                            },
                                        },
                                        r
                                    )
                                );
                            };
                        function lt(t) {
                            it(
                                e(
                                    {
                                        putSortable: Dt,
                                        cloneEl: pt,
                                        targetEl: st,
                                        rootEl: dt,
                                        oldIndex: vt,
                                        oldDraggableIndex: bt,
                                        newIndex: mt,
                                        newDraggableIndex: yt,
                                    },
                                    t
                                )
                            );
                        }
                        var st,
                            ct,
                            ut,
                            dt,
                            ht,
                            ft,
                            pt,
                            gt,
                            vt,
                            mt,
                            bt,
                            yt,
                            wt,
                            Dt,
                            Et,
                            St,
                            _t,
                            Ct,
                            xt,
                            Tt,
                            Ot,
                            Mt,
                            At,
                            Nt,
                            It,
                            Pt = !1,
                            kt = !1,
                            Rt = [],
                            Xt = !1,
                            Yt = !1,
                            Bt = [],
                            jt = !1,
                            Ft = [],
                            Ht = 'undefined' != typeof document,
                            Lt = y,
                            Kt = v || g ? 'cssFloat' : 'float',
                            Wt = Ht && !w && !y && 'draggable' in document.createElement('div'),
                            zt = (function () {
                                if (Ht) {
                                    if (g) return !1;
                                    var t = document.createElement('x');
                                    return ((t.style.cssText = 'pointer-events:auto'), 'auto' === t.style.pointerEvents);
                                }
                            })(),
                            Gt = function (t, e) {
                                var n = A(t),
                                    o =
                                        parseInt(n.width) -
                                        parseInt(n.paddingLeft) -
                                        parseInt(n.paddingRight) -
                                        parseInt(n.borderLeftWidth) -
                                        parseInt(n.borderRightWidth),
                                    i = X(t, 0, e),
                                    r = X(t, 1, e),
                                    a = i && A(i),
                                    l = r && A(r),
                                    s = a && parseInt(a.marginLeft) + parseInt(a.marginRight) + k(i).width,
                                    c = l && parseInt(l.marginLeft) + parseInt(l.marginRight) + k(r).width;
                                if ('flex' === n.display)
                                    return 'column' === n.flexDirection || 'column-reverse' === n.flexDirection ? 'vertical' : 'horizontal';
                                if ('grid' === n.display) return n.gridTemplateColumns.split(' ').length <= 1 ? 'vertical' : 'horizontal';
                                if (i && a.float && 'none' !== a.float) {
                                    var u = 'left' === a.float ? 'left' : 'right';
                                    return !r || ('both' !== l.clear && l.clear !== u) ? 'horizontal' : 'vertical';
                                }
                                return i &&
                                    ('block' === a.display ||
                                        'flex' === a.display ||
                                        'table' === a.display ||
                                        'grid' === a.display ||
                                        (s >= o && 'none' === n[Kt]) ||
                                        (r && 'none' === n[Kt] && s + c > o))
                                    ? 'vertical'
                                    : 'horizontal';
                            },
                            Ut = function (t, e, n) {
                                var o = n ? t.left : t.top,
                                    i = n ? t.right : t.bottom,
                                    r = n ? t.width : t.height,
                                    a = n ? e.left : e.top,
                                    l = n ? e.right : e.bottom,
                                    s = n ? e.width : e.height;
                                return o === a || i === l || o + r / 2 === a + s / 2;
                            },
                            qt = function (t, e) {
                                var n;
                                return (
                                    Rt.some(function (o) {
                                        var i = o[$].options.emptyInsertThreshold;
                                        if (i && !Y(o)) {
                                            var r = k(o),
                                                a = t >= r.left - i && t <= r.right + i,
                                                l = e >= r.top - i && e <= r.bottom + i;
                                            return a && l ? (n = o) : void 0;
                                        }
                                    }),
                                    n
                                );
                            },
                            Vt = function (t) {
                                function e(t, n) {
                                    return function (o, i, r, a) {
                                        var l =
                                            o.options.group.name && i.options.group.name && o.options.group.name === i.options.group.name;
                                        if (null == t && (n || l)) return !0;
                                        if (null == t || !1 === t) return !1;
                                        if (n && 'clone' === t) return t;
                                        if ('function' == typeof t) return e(t(o, i, r, a), n)(o, i, r, a);
                                        var s = (n ? o : i).options.group.name;
                                        return !0 === t || ('string' == typeof t && t === s) || (t.join && t.indexOf(s) > -1);
                                    };
                                }
                                var o = {},
                                    i = t.group;
                                ((i && 'object' == n(i)) || (i = { name: i }),
                                    (o.name = i.name),
                                    (o.checkPull = e(i.pull, !0)),
                                    (o.checkPut = e(i.put)),
                                    (o.revertClone = i.revertClone),
                                    (t.group = o));
                            },
                            Zt = function () {
                                !zt && ut && A(ut, 'display', 'none');
                            },
                            $t = function () {
                                !zt && ut && A(ut, 'display', '');
                            };
                        Ht &&
                            !w &&
                            document.addEventListener(
                                'click',
                                function (t) {
                                    if (kt)
                                        return (
                                            t.preventDefault(),
                                            t.stopPropagation && t.stopPropagation(),
                                            t.stopImmediatePropagation && t.stopImmediatePropagation(),
                                            (kt = !1),
                                            !1
                                        );
                                },
                                !0
                            );
                        var Qt = function (t) {
                                if (st) {
                                    t = t.touches ? t.touches[0] : t;
                                    var e = qt(t.clientX, t.clientY);
                                    if (e) {
                                        var n = {};
                                        for (var o in t) t.hasOwnProperty(o) && (n[o] = t[o]);
                                        ((n.target = n.rootEl = e),
                                            (n.preventDefault = void 0),
                                            (n.stopPropagation = void 0),
                                            e[$]._onDragOver(n));
                                    }
                                }
                            },
                            Jt = function (t) {
                                st && st.parentNode[$]._isOutsideThisEl(t.target);
                            };
                        function te(t, e) {
                            if (!t || !t.nodeType || 1 !== t.nodeType)
                                throw 'Sortable: `el` must be an HTMLElement, not '.concat({}.toString.call(t));
                            ((this.el = t), (this.options = e = i({}, e)), (t[$] = this));
                            var n = {
                                group: null,
                                sort: !0,
                                disabled: !1,
                                store: null,
                                handle: null,
                                draggable: /^[uo]l$/i.test(t.nodeName) ? '>li' : '>*',
                                swapThreshold: 1,
                                invertSwap: !1,
                                invertedSwapThreshold: null,
                                removeCloneOnHide: !0,
                                direction: function () {
                                    return Gt(t, this.options);
                                },
                                ghostClass: 'sortable-ghost',
                                chosenClass: 'sortable-chosen',
                                dragClass: 'sortable-drag',
                                ignore: 'a, img',
                                filter: null,
                                preventOnFilter: !0,
                                animation: 0,
                                easing: null,
                                setData: function (t, e) {
                                    t.setData('Text', e.textContent);
                                },
                                dropBubble: !1,
                                dragoverBubble: !1,
                                dataIdAttr: 'data-id',
                                delay: 0,
                                delayOnTouchOnly: !1,
                                touchStartThreshold: (Number.parseInt ? Number : window).parseInt(window.devicePixelRatio, 10) || 1,
                                forceFallback: !1,
                                fallbackClass: 'sortable-fallback',
                                fallbackOnBody: !1,
                                fallbackTolerance: 0,
                                fallbackOffset: { x: 0, y: 0 },
                                supportPointer: !1 !== te.supportPointer && 'PointerEvent' in window && (!b || y),
                                emptyInsertThreshold: 5,
                            };
                            for (var o in (ot.initializePlugins(this, t, n), n)) !(o in e) && (e[o] = n[o]);
                            for (var r in (Vt(e), this))
                                '_' === r.charAt(0) && 'function' == typeof this[r] && (this[r] = this[r].bind(this));
                            ((this.nativeDraggable = !e.forceFallback && Wt),
                                this.nativeDraggable && (this.options.touchStartThreshold = 1),
                                e.supportPointer
                                    ? E(t, 'pointerdown', this._onTapStart)
                                    : (E(t, 'mousedown', this._onTapStart), E(t, 'touchstart', this._onTapStart)),
                                this.nativeDraggable && (E(t, 'dragover', this), E(t, 'dragenter', this)),
                                Rt.push(this.el),
                                e.store && e.store.get && this.sort(e.store.get(this) || []),
                                i(this, Q()));
                        }
                        function ee(t) {
                            (t.dataTransfer && (t.dataTransfer.dropEffect = 'move'), t.cancelable && t.preventDefault());
                        }
                        function ne(t, e, n, o, i, r, a, l) {
                            var s,
                                c,
                                u = t[$],
                                d = u.options.onMove;
                            return (
                                !window.CustomEvent || g || v
                                    ? (s = document.createEvent('Event')).initEvent('move', !0, !0)
                                    : (s = new CustomEvent('move', { bubbles: !0, cancelable: !0 })),
                                (s.to = e),
                                (s.from = t),
                                (s.dragged = n),
                                (s.draggedRect = o),
                                (s.related = i || e),
                                (s.relatedRect = r || k(e)),
                                (s.willInsertAfter = l),
                                (s.originalEvent = a),
                                t.dispatchEvent(s),
                                d && (c = d.call(u, s, a)),
                                c
                            );
                        }
                        function oe(t) {
                            t.draggable = !1;
                        }
                        function ie() {
                            jt = !1;
                        }
                        function re(t, e, n) {
                            var o = k(X(n.el, 0, n.options, !0)),
                                i = Z(n.el, n.options, ut),
                                r = 10;
                            return e
                                ? t.clientX < i.left - r || (t.clientY < o.top && t.clientX < o.right)
                                : t.clientY < i.top - r || (t.clientY < o.bottom && t.clientX < o.left);
                        }
                        function ae(t, e, n) {
                            var o = k(Y(n.el, n.options.draggable)),
                                i = Z(n.el, n.options, ut),
                                r = 10;
                            return e
                                ? t.clientX > i.right + r || (t.clientY > o.bottom && t.clientX > o.left)
                                : t.clientY > i.bottom + r || (t.clientX > o.right && t.clientY > o.top);
                        }
                        function le(t, e, n, o, i, r, a, l) {
                            var s = o ? t.clientY : t.clientX,
                                c = o ? n.height : n.width,
                                u = o ? n.top : n.left,
                                d = o ? n.bottom : n.right,
                                h = !1;
                            if (!a)
                                if (l && Nt < c * i) {
                                    if ((!Xt && (1 === At ? s > u + (c * r) / 2 : s < d - (c * r) / 2) && (Xt = !0), Xt)) h = !0;
                                    else if (1 === At ? s < u + Nt : s > d - Nt) return -At;
                                } else if (s > u + (c * (1 - i)) / 2 && s < d - (c * (1 - i)) / 2) return se(e);
                            return (h = h || a) && (s < u + (c * r) / 2 || s > d - (c * r) / 2) ? (s > u + c / 2 ? 1 : -1) : 0;
                        }
                        function se(t) {
                            return B(st) < B(t) ? 1 : -1;
                        }
                        function ce(t) {
                            for (var e = t.tagName + t.className + t.src + t.href + t.textContent, n = e.length, o = 0; n--; )
                                o += e.charCodeAt(n);
                            return o.toString(36);
                        }
                        function ue(t) {
                            Ft.length = 0;
                            for (var e = t.getElementsByTagName('input'), n = e.length; n--; ) {
                                var o = e[n];
                                o.checked && Ft.push(o);
                            }
                        }
                        function de(t) {
                            return setTimeout(t, 0);
                        }
                        function he(t) {
                            return clearTimeout(t);
                        }
                        ((te.prototype = {
                            constructor: te,
                            _isOutsideThisEl: function (t) {
                                this.el.contains(t) || t === this.el || (Mt = null);
                            },
                            _getDirection: function (t, e) {
                                return 'function' == typeof this.options.direction
                                    ? this.options.direction.call(this, t, e, st)
                                    : this.options.direction;
                            },
                            _onTapStart: function (t) {
                                if (t.cancelable) {
                                    var e = this,
                                        n = this.el,
                                        o = this.options,
                                        i = o.preventOnFilter,
                                        r = t.type,
                                        a = (t.touches && t.touches[0]) || (t.pointerType && 'touch' === t.pointerType && t),
                                        l = (a || t).target,
                                        s =
                                            (t.target.shadowRoot && ((t.path && t.path[0]) || (t.composedPath && t.composedPath()[0]))) ||
                                            l,
                                        c = o.filter;
                                    if (
                                        (ue(n),
                                        !st &&
                                            !((/mousedown|pointerdown/.test(r) && 0 !== t.button) || o.disabled) &&
                                            !s.isContentEditable &&
                                            (this.nativeDraggable || !b || !l || 'SELECT' !== l.tagName.toUpperCase()) &&
                                            !(((l = x(l, o.draggable, n, !1)) && l.animated) || ft === l))
                                    ) {
                                        if (((vt = B(l)), (bt = B(l, o.draggable)), 'function' == typeof c)) {
                                            if (c.call(this, t, l, this))
                                                return (
                                                    lt({ sortable: e, rootEl: s, name: 'filter', targetEl: l, toEl: n, fromEl: n }),
                                                    at('filter', e, { evt: t }),
                                                    void (i && t.preventDefault())
                                                );
                                        } else if (
                                            c &&
                                            (c = c.split(',').some(function (o) {
                                                if ((o = x(s, o.trim(), n, !1)))
                                                    return (
                                                        lt({ sortable: e, rootEl: o, name: 'filter', targetEl: l, fromEl: n, toEl: n }),
                                                        at('filter', e, { evt: t }),
                                                        !0
                                                    );
                                            }))
                                        )
                                            return void (i && t.preventDefault());
                                        (o.handle && !x(s, o.handle, n, !1)) || this._prepareDragStart(t, a, l);
                                    }
                                }
                            },
                            _prepareDragStart: function (t, e, n) {
                                var o,
                                    i = this,
                                    r = i.el,
                                    a = i.options,
                                    l = r.ownerDocument;
                                if (n && !st && n.parentNode === r) {
                                    var s = k(n);
                                    if (
                                        ((dt = r),
                                        (ct = (st = n).parentNode),
                                        (ht = st.nextSibling),
                                        (ft = n),
                                        (wt = a.group),
                                        (te.dragged = st),
                                        (Et = { target: st, clientX: (e || t).clientX, clientY: (e || t).clientY }),
                                        (xt = Et.clientX - s.left),
                                        (Tt = Et.clientY - s.top),
                                        (this._lastX = (e || t).clientX),
                                        (this._lastY = (e || t).clientY),
                                        (st.style['will-change'] = 'all'),
                                        (o = function () {
                                            (at('delayEnded', i, { evt: t }),
                                                te.eventCanceled
                                                    ? i._onDrop()
                                                    : (i._disableDelayedDragEvents(),
                                                      !m && i.nativeDraggable && (st.draggable = !0),
                                                      i._triggerDragStart(t, e),
                                                      lt({ sortable: i, name: 'choose', originalEvent: t }),
                                                      M(st, a.chosenClass, !0)));
                                        }),
                                        a.ignore.split(',').forEach(function (t) {
                                            I(st, t.trim(), oe);
                                        }),
                                        E(l, 'dragover', Qt),
                                        E(l, 'mousemove', Qt),
                                        E(l, 'touchmove', Qt),
                                        a.supportPointer
                                            ? (E(l, 'pointerup', i._onDrop), !this.nativeDraggable && E(l, 'pointercancel', i._onDrop))
                                            : (E(l, 'mouseup', i._onDrop), E(l, 'touchend', i._onDrop), E(l, 'touchcancel', i._onDrop)),
                                        m && this.nativeDraggable && ((this.options.touchStartThreshold = 4), (st.draggable = !0)),
                                        at('delayStart', this, { evt: t }),
                                        !a.delay || (a.delayOnTouchOnly && !e) || (this.nativeDraggable && (v || g)))
                                    )
                                        o();
                                    else {
                                        if (te.eventCanceled) return void this._onDrop();
                                        (a.supportPointer
                                            ? (E(l, 'pointerup', i._disableDelayedDrag), E(l, 'pointercancel', i._disableDelayedDrag))
                                            : (E(l, 'mouseup', i._disableDelayedDrag),
                                              E(l, 'touchend', i._disableDelayedDrag),
                                              E(l, 'touchcancel', i._disableDelayedDrag)),
                                            E(l, 'mousemove', i._delayedDragTouchMoveHandler),
                                            E(l, 'touchmove', i._delayedDragTouchMoveHandler),
                                            a.supportPointer && E(l, 'pointermove', i._delayedDragTouchMoveHandler),
                                            (i._dragStartTimer = setTimeout(o, a.delay)));
                                    }
                                }
                            },
                            _delayedDragTouchMoveHandler: function (t) {
                                var e = t.touches ? t.touches[0] : t;
                                Math.max(Math.abs(e.clientX - this._lastX), Math.abs(e.clientY - this._lastY)) >=
                                    Math.floor(
                                        this.options.touchStartThreshold / ((this.nativeDraggable && window.devicePixelRatio) || 1)
                                    ) && this._disableDelayedDrag();
                            },
                            _disableDelayedDrag: function () {
                                (st && oe(st), clearTimeout(this._dragStartTimer), this._disableDelayedDragEvents());
                            },
                            _disableDelayedDragEvents: function () {
                                var t = this.el.ownerDocument;
                                (S(t, 'mouseup', this._disableDelayedDrag),
                                    S(t, 'touchend', this._disableDelayedDrag),
                                    S(t, 'touchcancel', this._disableDelayedDrag),
                                    S(t, 'pointerup', this._disableDelayedDrag),
                                    S(t, 'pointercancel', this._disableDelayedDrag),
                                    S(t, 'mousemove', this._delayedDragTouchMoveHandler),
                                    S(t, 'touchmove', this._delayedDragTouchMoveHandler),
                                    S(t, 'pointermove', this._delayedDragTouchMoveHandler));
                            },
                            _triggerDragStart: function (t, e) {
                                ((e = e || ('touch' == t.pointerType && t)),
                                    !this.nativeDraggable || e
                                        ? this.options.supportPointer
                                            ? E(document, 'pointermove', this._onTouchMove)
                                            : E(document, e ? 'touchmove' : 'mousemove', this._onTouchMove)
                                        : (E(st, 'dragend', this), E(dt, 'dragstart', this._onDragStart)));
                                try {
                                    document.selection
                                        ? de(function () {
                                              document.selection.empty();
                                          })
                                        : window.getSelection().removeAllRanges();
                                } catch (t) {}
                            },
                            _dragStarted: function (t, e) {
                                if (((Pt = !1), dt && st)) {
                                    (at('dragStarted', this, { evt: e }), this.nativeDraggable && E(document, 'dragover', Jt));
                                    var n = this.options;
                                    (!t && M(st, n.dragClass, !1),
                                        M(st, n.ghostClass, !0),
                                        (te.active = this),
                                        t && this._appendGhost(),
                                        lt({ sortable: this, name: 'start', originalEvent: e }));
                                } else this._nulling();
                            },
                            _emulateDragOver: function () {
                                if (St) {
                                    ((this._lastX = St.clientX), (this._lastY = St.clientY), Zt());
                                    for (
                                        var t = document.elementFromPoint(St.clientX, St.clientY), e = t;
                                        t && t.shadowRoot && (t = t.shadowRoot.elementFromPoint(St.clientX, St.clientY)) !== e;

                                    )
                                        e = t;
                                    if ((st.parentNode[$]._isOutsideThisEl(t), e))
                                        do {
                                            if (
                                                e[$] &&
                                                e[$]._onDragOver({ clientX: St.clientX, clientY: St.clientY, target: t, rootEl: e }) &&
                                                !this.options.dragoverBubble
                                            )
                                                break;
                                            t = e;
                                        } while ((e = C(e)));
                                    $t();
                                }
                            },
                            _onTouchMove: function (t) {
                                if (Et) {
                                    var e = this.options,
                                        n = e.fallbackTolerance,
                                        o = e.fallbackOffset,
                                        i = t.touches ? t.touches[0] : t,
                                        r = ut && N(ut, !0),
                                        a = ut && r && r.a,
                                        l = ut && r && r.d,
                                        s = Lt && It && j(It),
                                        c = (i.clientX - Et.clientX + o.x) / (a || 1) + (s ? s[0] - Bt[0] : 0) / (a || 1),
                                        u = (i.clientY - Et.clientY + o.y) / (l || 1) + (s ? s[1] - Bt[1] : 0) / (l || 1);
                                    if (!te.active && !Pt) {
                                        if (n && Math.max(Math.abs(i.clientX - this._lastX), Math.abs(i.clientY - this._lastY)) < n) return;
                                        this._onDragStart(t, !0);
                                    }
                                    if (ut) {
                                        r ? ((r.e += c - (_t || 0)), (r.f += u - (Ct || 0))) : (r = { a: 1, b: 0, c: 0, d: 1, e: c, f: u });
                                        var d = 'matrix('
                                            .concat(r.a, ',')
                                            .concat(r.b, ',')
                                            .concat(r.c, ',')
                                            .concat(r.d, ',')
                                            .concat(r.e, ',')
                                            .concat(r.f, ')');
                                        (A(ut, 'webkitTransform', d),
                                            A(ut, 'mozTransform', d),
                                            A(ut, 'msTransform', d),
                                            A(ut, 'transform', d),
                                            (_t = c),
                                            (Ct = u),
                                            (St = i));
                                    }
                                    t.cancelable && t.preventDefault();
                                }
                            },
                            _appendGhost: function () {
                                if (!ut) {
                                    var t = this.options.fallbackOnBody ? document.body : dt,
                                        e = k(st, !0, Lt, !0, t),
                                        n = this.options;
                                    if (Lt) {
                                        for (It = t; 'static' === A(It, 'position') && 'none' === A(It, 'transform') && It !== document; )
                                            It = It.parentNode;
                                        (It !== document.body && It !== document.documentElement
                                            ? (It === document && (It = P()), (e.top += It.scrollTop), (e.left += It.scrollLeft))
                                            : (It = P()),
                                            (Bt = j(It)));
                                    }
                                    (M((ut = st.cloneNode(!0)), n.ghostClass, !1),
                                        M(ut, n.fallbackClass, !0),
                                        M(ut, n.dragClass, !0),
                                        A(ut, 'transition', ''),
                                        A(ut, 'transform', ''),
                                        A(ut, 'box-sizing', 'border-box'),
                                        A(ut, 'margin', 0),
                                        A(ut, 'top', e.top),
                                        A(ut, 'left', e.left),
                                        A(ut, 'width', e.width),
                                        A(ut, 'height', e.height),
                                        A(ut, 'opacity', '0.8'),
                                        A(ut, 'position', Lt ? 'absolute' : 'fixed'),
                                        A(ut, 'zIndex', '100000'),
                                        A(ut, 'pointerEvents', 'none'),
                                        (te.ghost = ut),
                                        t.appendChild(ut),
                                        A(
                                            ut,
                                            'transform-origin',
                                            (xt / parseInt(ut.style.width)) * 100 + '% ' + (Tt / parseInt(ut.style.height)) * 100 + '%'
                                        ));
                                }
                            },
                            _onDragStart: function (t, e) {
                                var n = this,
                                    o = t.dataTransfer,
                                    i = n.options;
                                (at('dragStart', this, { evt: t }),
                                    te.eventCanceled
                                        ? this._onDrop()
                                        : (at('setupClone', this),
                                          te.eventCanceled ||
                                              ((pt = U(st)).removeAttribute('id'),
                                              (pt.draggable = !1),
                                              (pt.style['will-change'] = ''),
                                              this._hideClone(),
                                              M(pt, this.options.chosenClass, !1),
                                              (te.clone = pt)),
                                          (n.cloneId = de(function () {
                                              (at('clone', n),
                                                  te.eventCanceled ||
                                                      (n.options.removeCloneOnHide || dt.insertBefore(pt, st),
                                                      n._hideClone(),
                                                      lt({ sortable: n, name: 'clone' })));
                                          })),
                                          !e && M(st, i.dragClass, !0),
                                          e
                                              ? ((kt = !0), (n._loopId = setInterval(n._emulateDragOver, 50)))
                                              : (S(document, 'mouseup', n._onDrop),
                                                S(document, 'touchend', n._onDrop),
                                                S(document, 'touchcancel', n._onDrop),
                                                o && ((o.effectAllowed = 'move'), i.setData && i.setData.call(n, o, st)),
                                                E(document, 'drop', n),
                                                A(st, 'transform', 'translateZ(0)')),
                                          (Pt = !0),
                                          (n._dragStartId = de(n._dragStarted.bind(n, e, t))),
                                          E(document, 'selectstart', n),
                                          (Ot = !0),
                                          window.getSelection().removeAllRanges(),
                                          b && A(document.body, 'user-select', 'none')));
                            },
                            _onDragOver: function (t) {
                                var n,
                                    o,
                                    i,
                                    r,
                                    a = this.el,
                                    l = t.target,
                                    s = this.options,
                                    c = s.group,
                                    u = te.active,
                                    d = wt === c,
                                    h = s.sort,
                                    f = Dt || u,
                                    p = this,
                                    g = !1;
                                if (!jt) {
                                    if (
                                        (void 0 !== t.preventDefault && t.cancelable && t.preventDefault(),
                                        (l = x(l, s.draggable, a, !0)),
                                        P('dragOver'),
                                        te.eventCanceled)
                                    )
                                        return g;
                                    if (
                                        st.contains(t.target) ||
                                        (l.animated && l.animatingX && l.animatingY) ||
                                        p._ignoreWhileAnimating === l
                                    )
                                        return F(!1);
                                    if (
                                        ((kt = !1),
                                        u &&
                                            !s.disabled &&
                                            (d
                                                ? h || (i = ct !== dt)
                                                : Dt === this ||
                                                  ((this.lastPutMode = wt.checkPull(this, u, st, t)) && c.checkPut(this, u, st, t))))
                                    ) {
                                        if (
                                            ((r = 'vertical' === this._getDirection(t, l)),
                                            (n = k(st)),
                                            P('dragOverValid'),
                                            te.eventCanceled)
                                        )
                                            return g;
                                        if (i)
                                            return (
                                                (ct = dt),
                                                j(),
                                                this._hideClone(),
                                                P('revert'),
                                                te.eventCanceled || (ht ? dt.insertBefore(st, ht) : dt.appendChild(st)),
                                                F(!0)
                                            );
                                        var v = Y(a, s.draggable);
                                        if (!v || (ae(t, r, this) && !v.animated)) {
                                            if (v === st) return F(!1);
                                            if ((v && a === t.target && (l = v), l && (o = k(l)), !1 !== ne(dt, a, st, n, l, o, t, !!l)))
                                                return (
                                                    j(),
                                                    v && v.nextSibling ? a.insertBefore(st, v.nextSibling) : a.appendChild(st),
                                                    (ct = a),
                                                    H(),
                                                    F(!0)
                                                );
                                        } else if (v && re(t, r, this)) {
                                            var m = X(a, 0, s, !0);
                                            if (m === st) return F(!1);
                                            if (((o = k((l = m))), !1 !== ne(dt, a, st, n, l, o, t, !1)))
                                                return (j(), a.insertBefore(st, m), (ct = a), H(), F(!0));
                                        } else if (l.parentNode === a) {
                                            o = k(l);
                                            var b,
                                                y,
                                                w = 0,
                                                D = st.parentNode !== a,
                                                E = !Ut((st.animated && st.toRect) || n, (l.animated && l.toRect) || o, r),
                                                S = r ? 'top' : 'left',
                                                _ = R(l, 'top', 'top') || R(st, 'top', 'top'),
                                                C = _ ? _.scrollTop : void 0;
                                            if (
                                                (Mt !== l && ((b = o[S]), (Xt = !1), (Yt = (!E && s.invertSwap) || D)),
                                                0 !==
                                                    (w = le(
                                                        t,
                                                        l,
                                                        o,
                                                        r,
                                                        E ? 1 : s.swapThreshold,
                                                        null == s.invertedSwapThreshold ? s.swapThreshold : s.invertedSwapThreshold,
                                                        Yt,
                                                        Mt === l
                                                    )))
                                            ) {
                                                var T = B(st);
                                                do {
                                                    ((T -= w), (y = ct.children[T]));
                                                } while (y && ('none' === A(y, 'display') || y === ut));
                                            }
                                            if (0 === w || y === l) return F(!1);
                                            ((Mt = l), (At = w));
                                            var O = l.nextElementSibling,
                                                N = !1,
                                                I = ne(dt, a, st, n, l, o, t, (N = 1 === w));
                                            if (!1 !== I)
                                                return (
                                                    (1 !== I && -1 !== I) || (N = 1 === I),
                                                    (jt = !0),
                                                    setTimeout(ie, 30),
                                                    j(),
                                                    N && !O ? a.appendChild(st) : l.parentNode.insertBefore(st, N ? O : l),
                                                    _ && G(_, 0, C - _.scrollTop),
                                                    (ct = st.parentNode),
                                                    void 0 === b || Yt || (Nt = Math.abs(b - k(l)[S])),
                                                    H(),
                                                    F(!0)
                                                );
                                        }
                                        if (a.contains(st)) return F(!1);
                                    }
                                    return !1;
                                }
                                function P(s, c) {
                                    at(
                                        s,
                                        p,
                                        e(
                                            {
                                                evt: t,
                                                isOwner: d,
                                                axis: r ? 'vertical' : 'horizontal',
                                                revert: i,
                                                dragRect: n,
                                                targetRect: o,
                                                canSort: h,
                                                fromSortable: f,
                                                target: l,
                                                completed: F,
                                                onMove: function (e, o) {
                                                    return ne(dt, a, st, n, e, k(e), t, o);
                                                },
                                                changed: H,
                                            },
                                            c
                                        )
                                    );
                                }
                                function j() {
                                    (P('dragOverAnimationCapture'), p.captureAnimationState(), p !== f && f.captureAnimationState());
                                }
                                function F(e) {
                                    return (
                                        P('dragOverCompleted', { insertion: e }),
                                        e &&
                                            (d ? u._hideClone() : u._showClone(p),
                                            p !== f &&
                                                (M(st, Dt ? Dt.options.ghostClass : u.options.ghostClass, !1), M(st, s.ghostClass, !0)),
                                            Dt !== p && p !== te.active ? (Dt = p) : p === te.active && Dt && (Dt = null),
                                            f === p && (p._ignoreWhileAnimating = l),
                                            p.animateAll(function () {
                                                (P('dragOverAnimationComplete'), (p._ignoreWhileAnimating = null));
                                            }),
                                            p !== f && (f.animateAll(), (f._ignoreWhileAnimating = null))),
                                        ((l === st && !st.animated) || (l === a && !l.animated)) && (Mt = null),
                                        s.dragoverBubble ||
                                            t.rootEl ||
                                            l === document ||
                                            (st.parentNode[$]._isOutsideThisEl(t.target), !e && Qt(t)),
                                        !s.dragoverBubble && t.stopPropagation && t.stopPropagation(),
                                        (g = !0)
                                    );
                                }
                                function H() {
                                    ((mt = B(st)),
                                        (yt = B(st, s.draggable)),
                                        lt({
                                            sortable: p,
                                            name: 'change',
                                            toEl: a,
                                            newIndex: mt,
                                            newDraggableIndex: yt,
                                            originalEvent: t,
                                        }));
                                }
                            },
                            _ignoreWhileAnimating: null,
                            _offMoveEvents: function () {
                                (S(document, 'mousemove', this._onTouchMove),
                                    S(document, 'touchmove', this._onTouchMove),
                                    S(document, 'pointermove', this._onTouchMove),
                                    S(document, 'dragover', Qt),
                                    S(document, 'mousemove', Qt),
                                    S(document, 'touchmove', Qt));
                            },
                            _offUpEvents: function () {
                                var t = this.el.ownerDocument;
                                (S(t, 'mouseup', this._onDrop),
                                    S(t, 'touchend', this._onDrop),
                                    S(t, 'pointerup', this._onDrop),
                                    S(t, 'pointercancel', this._onDrop),
                                    S(t, 'touchcancel', this._onDrop),
                                    S(document, 'selectstart', this));
                            },
                            _onDrop: function (t) {
                                var e = this.el,
                                    n = this.options;
                                ((mt = B(st)),
                                    (yt = B(st, n.draggable)),
                                    at('drop', this, { evt: t }),
                                    (ct = st && st.parentNode),
                                    (mt = B(st)),
                                    (yt = B(st, n.draggable)),
                                    te.eventCanceled ||
                                        ((Pt = !1),
                                        (Yt = !1),
                                        (Xt = !1),
                                        clearInterval(this._loopId),
                                        clearTimeout(this._dragStartTimer),
                                        he(this.cloneId),
                                        he(this._dragStartId),
                                        this.nativeDraggable && (S(document, 'drop', this), S(e, 'dragstart', this._onDragStart)),
                                        this._offMoveEvents(),
                                        this._offUpEvents(),
                                        b && A(document.body, 'user-select', ''),
                                        A(st, 'transform', ''),
                                        t &&
                                            (Ot && (t.cancelable && t.preventDefault(), !n.dropBubble && t.stopPropagation()),
                                            ut && ut.parentNode && ut.parentNode.removeChild(ut),
                                            (dt === ct || (Dt && 'clone' !== Dt.lastPutMode)) &&
                                                pt &&
                                                pt.parentNode &&
                                                pt.parentNode.removeChild(pt),
                                            st &&
                                                (this.nativeDraggable && S(st, 'dragend', this),
                                                oe(st),
                                                (st.style['will-change'] = ''),
                                                Ot && !Pt && M(st, Dt ? Dt.options.ghostClass : this.options.ghostClass, !1),
                                                M(st, this.options.chosenClass, !1),
                                                lt({
                                                    sortable: this,
                                                    name: 'unchoose',
                                                    toEl: ct,
                                                    newIndex: null,
                                                    newDraggableIndex: null,
                                                    originalEvent: t,
                                                }),
                                                dt !== ct
                                                    ? (mt >= 0 &&
                                                          (lt({ rootEl: ct, name: 'add', toEl: ct, fromEl: dt, originalEvent: t }),
                                                          lt({ sortable: this, name: 'remove', toEl: ct, originalEvent: t }),
                                                          lt({ rootEl: ct, name: 'sort', toEl: ct, fromEl: dt, originalEvent: t }),
                                                          lt({ sortable: this, name: 'sort', toEl: ct, originalEvent: t })),
                                                      Dt && Dt.save())
                                                    : mt !== vt &&
                                                      mt >= 0 &&
                                                      (lt({ sortable: this, name: 'update', toEl: ct, originalEvent: t }),
                                                      lt({ sortable: this, name: 'sort', toEl: ct, originalEvent: t })),
                                                te.active &&
                                                    ((null != mt && -1 !== mt) || ((mt = vt), (yt = bt)),
                                                    lt({ sortable: this, name: 'end', toEl: ct, originalEvent: t }),
                                                    this.save())))),
                                    this._nulling());
                            },
                            _nulling: function () {
                                (at('nulling', this),
                                    (dt =
                                        st =
                                        ct =
                                        ut =
                                        ht =
                                        pt =
                                        ft =
                                        gt =
                                        Et =
                                        St =
                                        Ot =
                                        mt =
                                        yt =
                                        vt =
                                        bt =
                                        Mt =
                                        At =
                                        Dt =
                                        wt =
                                        te.dragged =
                                        te.ghost =
                                        te.clone =
                                        te.active =
                                            null),
                                    Ft.forEach(function (t) {
                                        t.checked = !0;
                                    }),
                                    (Ft.length = _t = Ct = 0));
                            },
                            handleEvent: function (t) {
                                switch (t.type) {
                                    case 'drop':
                                    case 'dragend':
                                        this._onDrop(t);
                                        break;
                                    case 'dragenter':
                                    case 'dragover':
                                        st && (this._onDragOver(t), ee(t));
                                        break;
                                    case 'selectstart':
                                        t.preventDefault();
                                }
                            },
                            toArray: function () {
                                for (var t, e = [], n = this.el.children, o = 0, i = n.length, r = this.options; o < i; o++)
                                    x((t = n[o]), r.draggable, this.el, !1) && e.push(t.getAttribute(r.dataIdAttr) || ce(t));
                                return e;
                            },
                            sort: function (t, e) {
                                var n = {},
                                    o = this.el;
                                (this.toArray().forEach(function (t, e) {
                                    var i = o.children[e];
                                    x(i, this.options.draggable, o, !1) && (n[t] = i);
                                }, this),
                                    e && this.captureAnimationState(),
                                    t.forEach(function (t) {
                                        n[t] && (o.removeChild(n[t]), o.appendChild(n[t]));
                                    }),
                                    e && this.animateAll());
                            },
                            save: function () {
                                var t = this.options.store;
                                t && t.set && t.set(this);
                            },
                            closest: function (t, e) {
                                return x(t, e || this.options.draggable, this.el, !1);
                            },
                            option: function (t, e) {
                                var n = this.options;
                                if (void 0 === e) return n[t];
                                var o = ot.modifyOption(this, t, e);
                                ((n[t] = void 0 !== o ? o : e), 'group' === t && Vt(n));
                            },
                            destroy: function () {
                                at('destroy', this);
                                var t = this.el;
                                ((t[$] = null),
                                    S(t, 'mousedown', this._onTapStart),
                                    S(t, 'touchstart', this._onTapStart),
                                    S(t, 'pointerdown', this._onTapStart),
                                    this.nativeDraggable && (S(t, 'dragover', this), S(t, 'dragenter', this)),
                                    Array.prototype.forEach.call(t.querySelectorAll('[draggable]'), function (t) {
                                        t.removeAttribute('draggable');
                                    }),
                                    this._onDrop(),
                                    this._disableDelayedDragEvents(),
                                    Rt.splice(Rt.indexOf(this.el), 1),
                                    (this.el = t = null));
                            },
                            _hideClone: function () {
                                if (!gt) {
                                    if ((at('hideClone', this), te.eventCanceled)) return;
                                    (A(pt, 'display', 'none'),
                                        this.options.removeCloneOnHide && pt.parentNode && pt.parentNode.removeChild(pt),
                                        (gt = !0));
                                }
                            },
                            _showClone: function (t) {
                                if ('clone' === t.lastPutMode) {
                                    if (gt) {
                                        if ((at('showClone', this), te.eventCanceled)) return;
                                        (st.parentNode != dt || this.options.group.revertClone
                                            ? ht
                                                ? dt.insertBefore(pt, ht)
                                                : dt.appendChild(pt)
                                            : dt.insertBefore(pt, st),
                                            this.options.group.revertClone && this.animate(st, pt),
                                            A(pt, 'display', ''),
                                            (gt = !1));
                                    }
                                } else this._hideClone();
                            },
                        }),
                            Ht &&
                                E(document, 'touchmove', function (t) {
                                    (te.active || Pt) && t.cancelable && t.preventDefault();
                                }),
                            (te.utils = {
                                on: E,
                                off: S,
                                css: A,
                                find: I,
                                is: function (t, e) {
                                    return !!x(t, e, t, !1);
                                },
                                extend: L,
                                throttle: W,
                                closest: x,
                                toggleClass: M,
                                clone: U,
                                index: B,
                                nextTick: de,
                                cancelNextTick: he,
                                detectDirection: Gt,
                                getChild: X,
                                expando: $,
                            }),
                            (te.get = function (t) {
                                return t[$];
                            }),
                            (te.mount = function () {
                                for (var t = arguments.length, n = new Array(t), o = 0; o < t; o++) n[o] = arguments[o];
                                (n[0].constructor === Array && (n = n[0]),
                                    n.forEach(function (t) {
                                        if (!t.prototype || !t.prototype.constructor)
                                            throw 'Sortable: Mounted plugin must be a constructor function, not '.concat(
                                                {}.toString.call(t)
                                            );
                                        (t.utils && (te.utils = e(e({}, te.utils), t.utils)), ot.mount(t));
                                    }));
                            }),
                            (te.create = function (t, e) {
                                return new te(t, e);
                            }),
                            (te.version = f));
                        var fe,
                            pe,
                            ge,
                            ve,
                            me,
                            be,
                            ye = [],
                            we = !1;
                        function De() {
                            function t() {
                                for (var t in ((this.defaults = {
                                    scroll: !0,
                                    forceAutoScrollFallback: !1,
                                    scrollSensitivity: 30,
                                    scrollSpeed: 10,
                                    bubbleScroll: !0,
                                }),
                                this))
                                    '_' === t.charAt(0) && 'function' == typeof this[t] && (this[t] = this[t].bind(this));
                            }
                            return (
                                (t.prototype = {
                                    dragStarted: function (t) {
                                        var e = t.originalEvent;
                                        this.sortable.nativeDraggable
                                            ? E(document, 'dragover', this._handleAutoScroll)
                                            : this.options.supportPointer
                                              ? E(document, 'pointermove', this._handleFallbackAutoScroll)
                                              : e.touches
                                                ? E(document, 'touchmove', this._handleFallbackAutoScroll)
                                                : E(document, 'mousemove', this._handleFallbackAutoScroll);
                                    },
                                    dragOverCompleted: function (t) {
                                        var e = t.originalEvent;
                                        this.options.dragOverBubble || e.rootEl || this._handleAutoScroll(e);
                                    },
                                    drop: function () {
                                        (this.sortable.nativeDraggable
                                            ? S(document, 'dragover', this._handleAutoScroll)
                                            : (S(document, 'pointermove', this._handleFallbackAutoScroll),
                                              S(document, 'touchmove', this._handleFallbackAutoScroll),
                                              S(document, 'mousemove', this._handleFallbackAutoScroll)),
                                            Se(),
                                            Ee(),
                                            z());
                                    },
                                    nulling: function () {
                                        ((me = pe = fe = we = be = ge = ve = null), (ye.length = 0));
                                    },
                                    _handleFallbackAutoScroll: function (t) {
                                        this._handleAutoScroll(t, !0);
                                    },
                                    _handleAutoScroll: function (t, e) {
                                        var n = this,
                                            o = (t.touches ? t.touches[0] : t).clientX,
                                            i = (t.touches ? t.touches[0] : t).clientY,
                                            r = document.elementFromPoint(o, i);
                                        if (((me = t), e || this.options.forceAutoScrollFallback || v || g || b)) {
                                            Ce(t, this.options, r, e);
                                            var a = H(r, !0);
                                            !we ||
                                                (be && o === ge && i === ve) ||
                                                (be && Se(),
                                                (be = setInterval(function () {
                                                    var r = H(document.elementFromPoint(o, i), !0);
                                                    (r !== a && ((a = r), Ee()), Ce(t, n.options, r, e));
                                                }, 10)),
                                                (ge = o),
                                                (ve = i));
                                        } else {
                                            if (!this.options.bubbleScroll || H(r, !0) === P()) return void Ee();
                                            Ce(t, this.options, H(r, !1), !1);
                                        }
                                    },
                                }),
                                i(t, { pluginName: 'scroll', initializeByDefault: !0 })
                            );
                        }
                        function Ee() {
                            (ye.forEach(function (t) {
                                clearInterval(t.pid);
                            }),
                                (ye = []));
                        }
                        function Se() {
                            clearInterval(be);
                        }
                        var _e,
                            Ce = W(function (t, e, n, o) {
                                if (e.scroll) {
                                    var i,
                                        r = (t.touches ? t.touches[0] : t).clientX,
                                        a = (t.touches ? t.touches[0] : t).clientY,
                                        l = e.scrollSensitivity,
                                        s = e.scrollSpeed,
                                        c = P(),
                                        u = !1;
                                    pe !== n && ((pe = n), Ee(), (fe = e.scroll), (i = e.scrollFn), !0 === fe && (fe = H(n, !0)));
                                    var d = 0,
                                        h = fe;
                                    do {
                                        var f = h,
                                            p = k(f),
                                            g = p.top,
                                            v = p.bottom,
                                            m = p.left,
                                            b = p.right,
                                            y = p.width,
                                            w = p.height,
                                            D = void 0,
                                            E = void 0,
                                            S = f.scrollWidth,
                                            _ = f.scrollHeight,
                                            C = A(f),
                                            x = f.scrollLeft,
                                            T = f.scrollTop;
                                        f === c
                                            ? ((D =
                                                  y < S &&
                                                  ('auto' === C.overflowX || 'scroll' === C.overflowX || 'visible' === C.overflowX)),
                                              (E =
                                                  w < _ &&
                                                  ('auto' === C.overflowY || 'scroll' === C.overflowY || 'visible' === C.overflowY)))
                                            : ((D = y < S && ('auto' === C.overflowX || 'scroll' === C.overflowX)),
                                              (E = w < _ && ('auto' === C.overflowY || 'scroll' === C.overflowY)));
                                        var O = D && (Math.abs(b - r) <= l && x + y < S) - (Math.abs(m - r) <= l && !!x),
                                            M = E && (Math.abs(v - a) <= l && T + w < _) - (Math.abs(g - a) <= l && !!T);
                                        if (!ye[d]) for (var N = 0; N <= d; N++) ye[N] || (ye[N] = {});
                                        ((ye[d].vx == O && ye[d].vy == M && ye[d].el === f) ||
                                            ((ye[d].el = f),
                                            (ye[d].vx = O),
                                            (ye[d].vy = M),
                                            clearInterval(ye[d].pid),
                                            (0 == O && 0 == M) ||
                                                ((u = !0),
                                                (ye[d].pid = setInterval(
                                                    function () {
                                                        o && 0 === this.layer && te.active._onTouchMove(me);
                                                        var e = ye[this.layer].vy ? ye[this.layer].vy * s : 0,
                                                            n = ye[this.layer].vx ? ye[this.layer].vx * s : 0;
                                                        ('function' == typeof i &&
                                                            'continue' !==
                                                                i.call(te.dragged.parentNode[$], n, e, t, me, ye[this.layer].el)) ||
                                                            G(ye[this.layer].el, n, e);
                                                    }.bind({ layer: d }),
                                                    24
                                                )))),
                                            d++);
                                    } while (e.bubbleScroll && h !== c && (h = H(h, !1)));
                                    we = u;
                                }
                            }, 30),
                            xe = function (t) {
                                var e = t.originalEvent,
                                    n = t.putSortable,
                                    o = t.dragEl,
                                    i = t.activeSortable,
                                    r = t.dispatchSortableEvent,
                                    a = t.hideGhostForTarget,
                                    l = t.unhideGhostForTarget;
                                if (e) {
                                    var s = n || i;
                                    a();
                                    var c = e.changedTouches && e.changedTouches.length ? e.changedTouches[0] : e,
                                        u = document.elementFromPoint(c.clientX, c.clientY);
                                    (l(), s && !s.el.contains(u) && (r('spill'), this.onSpill({ dragEl: o, putSortable: n })));
                                }
                            };
                        function Te() {}
                        function Oe() {}
                        function Me() {
                            function t() {
                                this.defaults = { swapClass: 'sortable-swap-highlight' };
                            }
                            return (
                                (t.prototype = {
                                    dragStart: function (t) {
                                        var e = t.dragEl;
                                        _e = e;
                                    },
                                    dragOverValid: function (t) {
                                        var e = t.completed,
                                            n = t.target,
                                            o = t.onMove,
                                            i = t.activeSortable,
                                            r = t.changed,
                                            a = t.cancel;
                                        if (i.options.swap) {
                                            var l = this.sortable.el,
                                                s = this.options;
                                            if (n && n !== l) {
                                                var c = _e;
                                                (!1 !== o(n) ? (M(n, s.swapClass, !0), (_e = n)) : (_e = null),
                                                    c && c !== _e && M(c, s.swapClass, !1));
                                            }
                                            (r(), e(!0), a());
                                        }
                                    },
                                    drop: function (t) {
                                        var e = t.activeSortable,
                                            n = t.putSortable,
                                            o = t.dragEl,
                                            i = n || this.sortable,
                                            r = this.options;
                                        (_e && M(_e, r.swapClass, !1),
                                            _e &&
                                                (r.swap || (n && n.options.swap)) &&
                                                o !== _e &&
                                                (i.captureAnimationState(),
                                                i !== e && e.captureAnimationState(),
                                                Ae(o, _e),
                                                i.animateAll(),
                                                i !== e && e.animateAll()));
                                    },
                                    nulling: function () {
                                        _e = null;
                                    },
                                }),
                                i(t, {
                                    pluginName: 'swap',
                                    eventProperties: function () {
                                        return { swapItem: _e };
                                    },
                                })
                            );
                        }
                        function Ae(t, e) {
                            var n,
                                o,
                                i = t.parentNode,
                                r = e.parentNode;
                            i &&
                                r &&
                                !i.isEqualNode(e) &&
                                !r.isEqualNode(t) &&
                                ((n = B(t)),
                                (o = B(e)),
                                i.isEqualNode(r) && n < o && o++,
                                i.insertBefore(e, i.children[n]),
                                r.insertBefore(t, r.children[o]));
                        }
                        ((Te.prototype = {
                            startIndex: null,
                            dragStart: function (t) {
                                var e = t.oldDraggableIndex;
                                this.startIndex = e;
                            },
                            onSpill: function (t) {
                                var e = t.dragEl,
                                    n = t.putSortable;
                                (this.sortable.captureAnimationState(), n && n.captureAnimationState());
                                var o = X(this.sortable.el, this.startIndex, this.options);
                                (o ? this.sortable.el.insertBefore(e, o) : this.sortable.el.appendChild(e),
                                    this.sortable.animateAll(),
                                    n && n.animateAll());
                            },
                            drop: xe,
                        }),
                            i(Te, { pluginName: 'revertOnSpill' }),
                            (Oe.prototype = {
                                onSpill: function (t) {
                                    var e = t.dragEl,
                                        n = t.putSortable || this.sortable;
                                    (n.captureAnimationState(), e.parentNode && e.parentNode.removeChild(e), n.animateAll());
                                },
                                drop: xe,
                            }),
                            i(Oe, { pluginName: 'removeOnSpill' }));
                        var Ne,
                            Ie,
                            Pe,
                            ke,
                            Re,
                            Xe = [],
                            Ye = [],
                            Be = !1,
                            je = !1,
                            Fe = !1;
                        function He() {
                            function t(t) {
                                for (var e in this) '_' === e.charAt(0) && 'function' == typeof this[e] && (this[e] = this[e].bind(this));
                                (t.options.avoidImplicitDeselect ||
                                    (t.options.supportPointer
                                        ? E(document, 'pointerup', this._deselectMultiDrag)
                                        : (E(document, 'mouseup', this._deselectMultiDrag),
                                          E(document, 'touchend', this._deselectMultiDrag))),
                                    E(document, 'keydown', this._checkKeyDown),
                                    E(document, 'keyup', this._checkKeyUp),
                                    (this.defaults = {
                                        selectedClass: 'sortable-selected',
                                        multiDragKey: null,
                                        avoidImplicitDeselect: !1,
                                        setData: function (e, n) {
                                            var o = '';
                                            (Xe.length && Ie === t
                                                ? Xe.forEach(function (t, e) {
                                                      o += (e ? ', ' : '') + t.textContent;
                                                  })
                                                : (o = n.textContent),
                                                e.setData('Text', o));
                                        },
                                    }));
                            }
                            return (
                                (t.prototype = {
                                    multiDragKeyDown: !1,
                                    isMultiDrag: !1,
                                    delayStartGlobal: function (t) {
                                        var e = t.dragEl;
                                        Pe = e;
                                    },
                                    delayEnded: function () {
                                        this.isMultiDrag = ~Xe.indexOf(Pe);
                                    },
                                    setupClone: function (t) {
                                        var e = t.sortable,
                                            n = t.cancel;
                                        if (this.isMultiDrag) {
                                            for (var o = 0; o < Xe.length; o++)
                                                (Ye.push(U(Xe[o])),
                                                    (Ye[o].sortableIndex = Xe[o].sortableIndex),
                                                    (Ye[o].draggable = !1),
                                                    (Ye[o].style['will-change'] = ''),
                                                    M(Ye[o], this.options.selectedClass, !1),
                                                    Xe[o] === Pe && M(Ye[o], this.options.chosenClass, !1));
                                            (e._hideClone(), n());
                                        }
                                    },
                                    clone: function (t) {
                                        var e = t.sortable,
                                            n = t.rootEl,
                                            o = t.dispatchSortableEvent,
                                            i = t.cancel;
                                        this.isMultiDrag &&
                                            (this.options.removeCloneOnHide || (Xe.length && Ie === e && (Ke(!0, n), o('clone'), i())));
                                    },
                                    showClone: function (t) {
                                        var e = t.cloneNowShown,
                                            n = t.rootEl,
                                            o = t.cancel;
                                        this.isMultiDrag &&
                                            (Ke(!1, n),
                                            Ye.forEach(function (t) {
                                                A(t, 'display', '');
                                            }),
                                            e(),
                                            (Re = !1),
                                            o());
                                    },
                                    hideClone: function (t) {
                                        var e = this,
                                            n = (t.sortable, t.cloneNowHidden),
                                            o = t.cancel;
                                        this.isMultiDrag &&
                                            (Ye.forEach(function (t) {
                                                (A(t, 'display', 'none'),
                                                    e.options.removeCloneOnHide && t.parentNode && t.parentNode.removeChild(t));
                                            }),
                                            n(),
                                            (Re = !0),
                                            o());
                                    },
                                    dragStartGlobal: function (t) {
                                        (t.sortable,
                                            !this.isMultiDrag && Ie && Ie.multiDrag._deselectMultiDrag(),
                                            Xe.forEach(function (t) {
                                                t.sortableIndex = B(t);
                                            }),
                                            (Xe = Xe.sort(function (t, e) {
                                                return t.sortableIndex - e.sortableIndex;
                                            })),
                                            (Fe = !0));
                                    },
                                    dragStarted: function (t) {
                                        var e = this,
                                            n = t.sortable;
                                        if (this.isMultiDrag) {
                                            if (this.options.sort && (n.captureAnimationState(), this.options.animation)) {
                                                Xe.forEach(function (t) {
                                                    t !== Pe && A(t, 'position', 'absolute');
                                                });
                                                var o = k(Pe, !1, !0, !0);
                                                (Xe.forEach(function (t) {
                                                    t !== Pe && q(t, o);
                                                }),
                                                    (je = !0),
                                                    (Be = !0));
                                            }
                                            n.animateAll(function () {
                                                ((je = !1),
                                                    (Be = !1),
                                                    e.options.animation &&
                                                        Xe.forEach(function (t) {
                                                            V(t);
                                                        }),
                                                    e.options.sort && We());
                                            });
                                        }
                                    },
                                    dragOver: function (t) {
                                        var e = t.target,
                                            n = t.completed,
                                            o = t.cancel;
                                        je && ~Xe.indexOf(e) && (n(!1), o());
                                    },
                                    revert: function (t) {
                                        var e = t.fromSortable,
                                            n = t.rootEl,
                                            o = t.sortable,
                                            i = t.dragRect;
                                        Xe.length > 1 &&
                                            (Xe.forEach(function (t) {
                                                (o.addAnimationState({ target: t, rect: je ? k(t) : i }),
                                                    V(t),
                                                    (t.fromRect = i),
                                                    e.removeAnimationState(t));
                                            }),
                                            (je = !1),
                                            Le(!this.options.removeCloneOnHide, n));
                                    },
                                    dragOverCompleted: function (t) {
                                        var e = t.sortable,
                                            n = t.isOwner,
                                            o = t.insertion,
                                            i = t.activeSortable,
                                            r = t.parentEl,
                                            a = t.putSortable,
                                            l = this.options;
                                        if (o) {
                                            if (
                                                (n && i._hideClone(),
                                                (Be = !1),
                                                l.animation && Xe.length > 1 && (je || (!n && !i.options.sort && !a)))
                                            ) {
                                                var s = k(Pe, !1, !0, !0);
                                                (Xe.forEach(function (t) {
                                                    t !== Pe && (q(t, s), r.appendChild(t));
                                                }),
                                                    (je = !0));
                                            }
                                            if (!n)
                                                if ((je || We(), Xe.length > 1)) {
                                                    var c = Re;
                                                    (i._showClone(e),
                                                        i.options.animation &&
                                                            !Re &&
                                                            c &&
                                                            Ye.forEach(function (t) {
                                                                (i.addAnimationState({ target: t, rect: ke }),
                                                                    (t.fromRect = ke),
                                                                    (t.thisAnimationDuration = null));
                                                            }));
                                                } else i._showClone(e);
                                        }
                                    },
                                    dragOverAnimationCapture: function (t) {
                                        var e = t.dragRect,
                                            n = t.isOwner,
                                            o = t.activeSortable;
                                        if (
                                            (Xe.forEach(function (t) {
                                                t.thisAnimationDuration = null;
                                            }),
                                            o.options.animation && !n && o.multiDrag.isMultiDrag)
                                        ) {
                                            ke = i({}, e);
                                            var r = N(Pe, !0);
                                            ((ke.top -= r.f), (ke.left -= r.e));
                                        }
                                    },
                                    dragOverAnimationComplete: function () {
                                        je && ((je = !1), We());
                                    },
                                    drop: function (t) {
                                        var e = t.originalEvent,
                                            n = t.rootEl,
                                            o = t.parentEl,
                                            i = t.sortable,
                                            r = t.dispatchSortableEvent,
                                            a = t.oldIndex,
                                            l = t.putSortable,
                                            s = l || this.sortable;
                                        if (e) {
                                            var c = this.options,
                                                u = o.children;
                                            if (!Fe)
                                                if (
                                                    (c.multiDragKey && !this.multiDragKeyDown && this._deselectMultiDrag(),
                                                    M(Pe, c.selectedClass, !~Xe.indexOf(Pe)),
                                                    ~Xe.indexOf(Pe))
                                                )
                                                    (Xe.splice(Xe.indexOf(Pe), 1),
                                                        (Ne = null),
                                                        it({ sortable: i, rootEl: n, name: 'deselect', targetEl: Pe, originalEvent: e }));
                                                else {
                                                    if (
                                                        (Xe.push(Pe),
                                                        it({ sortable: i, rootEl: n, name: 'select', targetEl: Pe, originalEvent: e }),
                                                        e.shiftKey && Ne && i.el.contains(Ne))
                                                    ) {
                                                        var d = B(Ne),
                                                            h = B(Pe);
                                                        ~d &&
                                                            ~h &&
                                                            d !== h &&
                                                            (function () {
                                                                var t, r;
                                                                h > d ? ((r = d), (t = h)) : ((r = h), (t = d + 1));
                                                                for (var a = c.filter; r < t; r++)
                                                                    ~Xe.indexOf(u[r]) ||
                                                                        (x(u[r], c.draggable, o, !1) &&
                                                                            ((a &&
                                                                                ('function' == typeof a
                                                                                    ? a.call(i, e, u[r], i)
                                                                                    : a.split(',').some(function (t) {
                                                                                          return x(u[r], t.trim(), o, !1);
                                                                                      }))) ||
                                                                                (M(u[r], c.selectedClass, !0),
                                                                                Xe.push(u[r]),
                                                                                it({
                                                                                    sortable: i,
                                                                                    rootEl: n,
                                                                                    name: 'select',
                                                                                    targetEl: u[r],
                                                                                    originalEvent: e,
                                                                                }))));
                                                            })();
                                                    } else Ne = Pe;
                                                    Ie = s;
                                                }
                                            if (Fe && this.isMultiDrag) {
                                                if (((je = !1), (o[$].options.sort || o !== n) && Xe.length > 1)) {
                                                    var f = k(Pe),
                                                        p = B(Pe, ':not(.' + this.options.selectedClass + ')');
                                                    if (
                                                        (!Be && c.animation && (Pe.thisAnimationDuration = null),
                                                        s.captureAnimationState(),
                                                        !Be &&
                                                            (c.animation &&
                                                                ((Pe.fromRect = f),
                                                                Xe.forEach(function (t) {
                                                                    if (((t.thisAnimationDuration = null), t !== Pe)) {
                                                                        var e = je ? k(t) : f;
                                                                        ((t.fromRect = e), s.addAnimationState({ target: t, rect: e }));
                                                                    }
                                                                })),
                                                            We(),
                                                            Xe.forEach(function (t) {
                                                                (u[p] ? o.insertBefore(t, u[p]) : o.appendChild(t), p++);
                                                            }),
                                                            a === B(Pe)))
                                                    ) {
                                                        var g = !1;
                                                        (Xe.forEach(function (t) {
                                                            t.sortableIndex === B(t) || (g = !0);
                                                        }),
                                                            g && (r('update'), r('sort')));
                                                    }
                                                    (Xe.forEach(function (t) {
                                                        V(t);
                                                    }),
                                                        s.animateAll());
                                                }
                                                Ie = s;
                                            }
                                            (n === o || (l && 'clone' !== l.lastPutMode)) &&
                                                Ye.forEach(function (t) {
                                                    t.parentNode && t.parentNode.removeChild(t);
                                                });
                                        }
                                    },
                                    nullingGlobal: function () {
                                        ((this.isMultiDrag = Fe = !1), (Ye.length = 0));
                                    },
                                    destroyGlobal: function () {
                                        (this._deselectMultiDrag(),
                                            S(document, 'pointerup', this._deselectMultiDrag),
                                            S(document, 'mouseup', this._deselectMultiDrag),
                                            S(document, 'touchend', this._deselectMultiDrag),
                                            S(document, 'keydown', this._checkKeyDown),
                                            S(document, 'keyup', this._checkKeyUp));
                                    },
                                    _deselectMultiDrag: function (t) {
                                        if (
                                            !(
                                                (void 0 !== Fe && Fe) ||
                                                Ie !== this.sortable ||
                                                (t && x(t.target, this.options.draggable, this.sortable.el, !1)) ||
                                                (t && 0 !== t.button)
                                            )
                                        )
                                            for (; Xe.length; ) {
                                                var e = Xe[0];
                                                (M(e, this.options.selectedClass, !1),
                                                    Xe.shift(),
                                                    it({
                                                        sortable: this.sortable,
                                                        rootEl: this.sortable.el,
                                                        name: 'deselect',
                                                        targetEl: e,
                                                        originalEvent: t,
                                                    }));
                                            }
                                    },
                                    _checkKeyDown: function (t) {
                                        t.key === this.options.multiDragKey && (this.multiDragKeyDown = !0);
                                    },
                                    _checkKeyUp: function (t) {
                                        t.key === this.options.multiDragKey && (this.multiDragKeyDown = !1);
                                    },
                                }),
                                i(t, {
                                    pluginName: 'multiDrag',
                                    utils: {
                                        select: function (t) {
                                            var e = t.parentNode[$];
                                            e &&
                                                e.options.multiDrag &&
                                                !~Xe.indexOf(t) &&
                                                (Ie && Ie !== e && (Ie.multiDrag._deselectMultiDrag(), (Ie = e)),
                                                M(t, e.options.selectedClass, !0),
                                                Xe.push(t));
                                        },
                                        deselect: function (t) {
                                            var e = t.parentNode[$],
                                                n = Xe.indexOf(t);
                                            e && e.options.multiDrag && ~n && (M(t, e.options.selectedClass, !1), Xe.splice(n, 1));
                                        },
                                    },
                                    eventProperties: function () {
                                        var t = this,
                                            e = [],
                                            n = [];
                                        return (
                                            Xe.forEach(function (o) {
                                                var i;
                                                (e.push({ multiDragElement: o, index: o.sortableIndex }),
                                                    (i = je && o !== Pe ? -1 : je ? B(o, ':not(.' + t.options.selectedClass + ')') : B(o)),
                                                    n.push({ multiDragElement: o, index: i }));
                                            }),
                                            { items: l(Xe), clones: [].concat(Ye), oldIndicies: e, newIndicies: n }
                                        );
                                    },
                                    optionListeners: {
                                        multiDragKey: function (t) {
                                            return (
                                                'ctrl' === (t = t.toLowerCase())
                                                    ? (t = 'Control')
                                                    : t.length > 1 && (t = t.charAt(0).toUpperCase() + t.substr(1)),
                                                t
                                            );
                                        },
                                    },
                                })
                            );
                        }
                        function Le(t, e) {
                            Xe.forEach(function (n, o) {
                                var i = e.children[n.sortableIndex + (t ? Number(o) : 0)];
                                i ? e.insertBefore(n, i) : e.appendChild(n);
                            });
                        }
                        function Ke(t, e) {
                            Ye.forEach(function (n, o) {
                                var i = e.children[n.sortableIndex + (t ? Number(o) : 0)];
                                i ? e.insertBefore(n, i) : e.appendChild(n);
                            });
                        }
                        function We() {
                            Xe.forEach(function (t) {
                                t !== Pe && t.parentNode && t.parentNode.removeChild(t);
                            });
                        }
                        return (te.mount(new De()), te.mount(Oe, Te), te.mount(new Me()), te.mount(new He()), te);
                    })();
                },
            },
            e = {};
        function n(o) {
            var i = e[o];
            if (void 0 !== i) return i.exports;
            var r = (e[o] = { exports: {} });
            return (t[o].call(r.exports, r, r.exports, n), r.exports);
        }
        ((n.n = function (t) {
            var e =
                t && t.__esModule
                    ? function () {
                          return t.default;
                      }
                    : function () {
                          return t;
                      };
            return (n.d(e, { a: e }), e);
        }),
            (n.d = function (t, e) {
                for (var o in e) n.o(e, o) && !n.o(t, o) && Object.defineProperty(t, o, { enumerable: !0, get: e[o] });
            }),
            (n.o = function (t, e) {
                return Object.prototype.hasOwnProperty.call(t, e);
            }),
            (n.r = function (t) {
                ('undefined' != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
                    Object.defineProperty(t, '__esModule', { value: !0 }));
            }));
        var o = {};
        return (
            (function () {
                'use strict';
                (n.r(o),
                    n.d(o, {
                        Sortable: function () {
                            return e.a;
                        },
                    }));
                var t = n(5311),
                    e = n.n(t);
                try {
                    window.Sortable = e();
                } catch (t) {}
            })(),
            o
        );
    })();
});
