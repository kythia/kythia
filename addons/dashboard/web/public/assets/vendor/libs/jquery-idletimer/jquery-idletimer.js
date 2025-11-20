/**
 * @namespace: addons/dashboard/web/public/assets/vendor/libs/jquery-idletimer/jquery-idletimer.js
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
                8164: function () {
                    var e;
                    (((e = jQuery).idleTimer = function (t, i, n) {
                        var r;
                        ('object' == typeof t ? ((r = t), (t = null)) : 'number' == typeof t && ((r = { timeout: t }), (t = null)),
                            (i = i || document),
                            (n = n || ''),
                            (r = e.extend(
                                {
                                    idle: !1,
                                    timeout: 3e4,
                                    events: 'mousemove keydown wheel DOMMouseScroll mousewheel mousedown touchstart touchmove MSPointerDown MSPointerMove',
                                },
                                r
                            )));
                        var o = e(i),
                            a = o.data('idleTimerObj' + n) || {},
                            l = function (t) {
                                var r = e.data(i, 'idleTimerObj' + n) || {};
                                ((r.idle = !r.idle), (r.olddate = +new Date()));
                                var o = e.Event((r.idle ? 'idle' : 'active') + '.idleTimer' + n);
                                e(i).trigger(o, [i, e.extend({}, r), t]);
                            },
                            d = function (t) {
                                var r = e.data(i, 'idleTimerObj' + n) || {};
                                if (('storage' !== t.type || t.originalEvent.key === r.timerSyncId) && null == r.remaining) {
                                    if ('mousemove' === t.type) {
                                        if (t.pageX === r.pageX && t.pageY === r.pageY) return;
                                        if (void 0 === t.pageX && void 0 === t.pageY) return;
                                        if (+new Date() - r.olddate < 200) return;
                                    }
                                    (clearTimeout(r.tId),
                                        r.idle && l(t),
                                        (r.lastActive = +new Date()),
                                        (r.pageX = t.pageX),
                                        (r.pageY = t.pageY),
                                        'storage' !== t.type &&
                                            r.timerSyncId &&
                                            'undefined' != typeof localStorage &&
                                            localStorage.setItem(r.timerSyncId, r.lastActive),
                                        (r.tId = setTimeout(l, r.timeout)));
                                }
                            },
                            u = function () {
                                var t = e.data(i, 'idleTimerObj' + n) || {};
                                ((t.idle = t.idleBackup),
                                    (t.olddate = +new Date()),
                                    (t.lastActive = t.olddate),
                                    (t.remaining = null),
                                    clearTimeout(t.tId),
                                    t.idle || (t.tId = setTimeout(l, t.timeout)));
                            };
                        if (null === t && void 0 !== a.idle) return (u(), o);
                        if (null === t);
                        else {
                            if (null !== t && void 0 === a.idle) return !1;
                            if ('destroy' === t)
                                return (
                                    (function () {
                                        var t = e.data(i, 'idleTimerObj' + n) || {};
                                        (clearTimeout(t.tId), o.removeData('idleTimerObj' + n), o.off('._idleTimer' + n));
                                    })(),
                                    o
                                );
                            if ('pause' === t)
                                return (
                                    (function () {
                                        var t = e.data(i, 'idleTimerObj' + n) || {};
                                        null == t.remaining && ((t.remaining = t.timeout - (+new Date() - t.olddate)), clearTimeout(t.tId));
                                    })(),
                                    o
                                );
                            if ('resume' === t)
                                return (
                                    (function () {
                                        var t = e.data(i, 'idleTimerObj' + n) || {};
                                        null != t.remaining && (t.idle || (t.tId = setTimeout(l, t.remaining)), (t.remaining = null));
                                    })(),
                                    o
                                );
                            if ('reset' === t) return (u(), o);
                            if ('getRemainingTime' === t)
                                return (function () {
                                    var t = e.data(i, 'idleTimerObj' + n) || {};
                                    if (t.idle) return 0;
                                    if (null != t.remaining) return t.remaining;
                                    var r = t.timeout - (+new Date() - t.lastActive);
                                    return (r < 0 && (r = 0), r);
                                })();
                            if ('getElapsedTime' === t) return +new Date() - a.olddate;
                            if ('getLastActiveTime' === t) return a.lastActive;
                            if ('isIdle' === t) return a.idle;
                        }
                        return (
                            o.on(
                                (r.events + ' ')
                                    .split(' ')
                                    .join('._idleTimer' + n + ' ')
                                    .trim(),
                                function (e) {
                                    d(e);
                                }
                            ),
                            r.timerSyncId && e(window).on('storage', d),
                            (a = e.extend(
                                {},
                                {
                                    olddate: +new Date(),
                                    lastActive: +new Date(),
                                    idle: r.idle,
                                    idleBackup: r.idle,
                                    timeout: r.timeout,
                                    remaining: null,
                                    timerSyncId: r.timerSyncId,
                                    tId: null,
                                    pageX: null,
                                    pageY: null,
                                }
                            )).idle || (a.tId = setTimeout(l, a.timeout)),
                            e.data(i, 'idleTimerObj' + n, a),
                            o
                        );
                    }),
                        (e.fn.idleTimer = function (t, i) {
                            return this[0] ? e.idleTimer(t, this[0], i) : this;
                        }));
                },
            },
            t = {};
        function i(n) {
            var r = t[n];
            if (void 0 !== r) return r.exports;
            var o = (t[n] = { exports: {} });
            return (e[n](o, o.exports, i), o.exports);
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
                i.r(n);
                i(8164);
            })(),
            n
        );
    })();
});
