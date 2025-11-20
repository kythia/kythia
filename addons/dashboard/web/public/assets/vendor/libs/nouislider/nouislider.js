/**
 * @namespace: addons/dashboard/web/public/assets/vendor/libs/nouislider/nouislider.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

!(function (t, e) {
    if ('object' == typeof exports && 'object' == typeof module) module.exports = e();
    else if ('function' == typeof define && define.amd) define([], e);
    else {
        var r = e();
        for (var n in r) ('object' == typeof exports ? exports : t)[n] = r[n];
    }
})(self, function () {
    return (function () {
        'use strict';
        var t,
            e,
            r = {
                d: function (t, e) {
                    for (var n in e) r.o(e, n) && !r.o(t, n) && Object.defineProperty(t, n, { enumerable: !0, get: e[n] });
                },
                o: function (t, e) {
                    return Object.prototype.hasOwnProperty.call(t, e);
                },
                r: function (t) {
                    ('undefined' != typeof Symbol &&
                        Symbol.toStringTag &&
                        Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
                        Object.defineProperty(t, '__esModule', { value: !0 }));
                },
            },
            n = {};
        function i(t) {
            return 'object' == typeof t && 'function' == typeof t.to;
        }
        function o(t) {
            t.parentElement.removeChild(t);
        }
        function s(t) {
            return null != t;
        }
        function a(t) {
            t.preventDefault();
        }
        function l(t) {
            return 'number' == typeof t && !isNaN(t) && isFinite(t);
        }
        function u(t, e, r) {
            r > 0 &&
                (d(t, e),
                setTimeout(function () {
                    h(t, e);
                }, r));
        }
        function c(t) {
            return Math.max(Math.min(t, 100), 0);
        }
        function f(t) {
            return Array.isArray(t) ? t : [t];
        }
        function p(t) {
            var e = (t = String(t)).split('.');
            return e.length > 1 ? e[1].length : 0;
        }
        function d(t, e) {
            t.classList && !/\s/.test(e) ? t.classList.add(e) : (t.className += ' ' + e);
        }
        function h(t, e) {
            t.classList && !/\s/.test(e)
                ? t.classList.remove(e)
                : (t.className = t.className.replace(new RegExp('(^|\\b)' + e.split(' ').join('|') + '(\\b|$)', 'gi'), ' '));
        }
        function m(t) {
            var e = void 0 !== window.pageXOffset,
                r = 'CSS1Compat' === (t.compatMode || '');
            return {
                x: e ? window.pageXOffset : r ? t.documentElement.scrollLeft : t.body.scrollLeft,
                y: e ? window.pageYOffset : r ? t.documentElement.scrollTop : t.body.scrollTop,
            };
        }
        function g(t, e) {
            return 100 / (e - t);
        }
        function v(t, e, r) {
            return (100 * e) / (t[r + 1] - t[r]);
        }
        function b(t, e) {
            for (var r = 1; t >= e[r]; ) r += 1;
            return r;
        }
        function S(t, e, r) {
            if (r >= t.slice(-1)[0]) return 100;
            var n = b(r, t),
                i = t[n - 1],
                o = t[n],
                s = e[n - 1],
                a = e[n];
            return (
                s +
                (function (t, e) {
                    return v(t, t[0] < 0 ? e + Math.abs(t[0]) : e - t[0], 0);
                })([i, o], r) /
                    g(s, a)
            );
        }
        function x(t, e, r, n) {
            if (100 === n) return n;
            var i = b(n, t),
                o = t[i - 1],
                s = t[i];
            return r
                ? n - o > (s - o) / 2
                    ? s
                    : o
                : e[i - 1]
                  ? t[i - 1] +
                    (function (t, e) {
                        return Math.round(t / e) * e;
                    })(n - t[i - 1], e[i - 1])
                  : n;
        }
        (r.r(n),
            r.d(n, {
                noUiSlider: function () {
                    return Q;
                },
            }),
            (function (t) {
                ((t.Range = 'range'), (t.Steps = 'steps'), (t.Positions = 'positions'), (t.Count = 'count'), (t.Values = 'values'));
            })(t || (t = {})),
            (function (t) {
                ((t[(t.None = -1)] = 'None'),
                    (t[(t.NoValue = 0)] = 'NoValue'),
                    (t[(t.LargeValue = 1)] = 'LargeValue'),
                    (t[(t.SmallValue = 2)] = 'SmallValue'));
            })(e || (e = {})));
        var y = (function () {
                function t(t, e, r) {
                    var n;
                    ((this.xPct = []),
                        (this.xVal = []),
                        (this.xSteps = []),
                        (this.xNumSteps = []),
                        (this.xHighestCompleteStep = []),
                        (this.xSteps = [r || !1]),
                        (this.xNumSteps = [!1]),
                        (this.snap = e));
                    var i = [];
                    for (
                        Object.keys(t).forEach(function (e) {
                            i.push([f(t[e]), e]);
                        }),
                            i.sort(function (t, e) {
                                return t[0][0] - e[0][0];
                            }),
                            n = 0;
                        n < i.length;
                        n++
                    )
                        this.handleEntryPoint(i[n][1], i[n][0]);
                    for (this.xNumSteps = this.xSteps.slice(0), n = 0; n < this.xNumSteps.length; n++)
                        this.handleStepPoint(n, this.xNumSteps[n]);
                }
                return (
                    (t.prototype.getDistance = function (t) {
                        for (var e = [], r = 0; r < this.xNumSteps.length - 1; r++) e[r] = v(this.xVal, t, r);
                        return e;
                    }),
                    (t.prototype.getAbsoluteDistance = function (t, e, r) {
                        var n,
                            i = 0;
                        if (t < this.xPct[this.xPct.length - 1]) for (; t > this.xPct[i + 1]; ) i++;
                        else t === this.xPct[this.xPct.length - 1] && (i = this.xPct.length - 2);
                        (r || t !== this.xPct[i + 1] || i++, null === e && (e = []));
                        var o = 1,
                            s = e[i],
                            a = 0,
                            l = 0,
                            u = 0,
                            c = 0;
                        for (
                            n = r
                                ? (t - this.xPct[i]) / (this.xPct[i + 1] - this.xPct[i])
                                : (this.xPct[i + 1] - t) / (this.xPct[i + 1] - this.xPct[i]);
                            s > 0;

                        )
                            ((a = this.xPct[i + 1 + c] - this.xPct[i + c]),
                                e[i + c] * o + 100 - 100 * n > 100
                                    ? ((l = a * n), (o = (s - 100 * n) / e[i + c]), (n = 1))
                                    : ((l = ((e[i + c] * a) / 100) * o), (o = 0)),
                                r ? ((u -= l), this.xPct.length + c >= 1 && c--) : ((u += l), this.xPct.length - c >= 1 && c++),
                                (s = e[i + c] * o));
                        return t + u;
                    }),
                    (t.prototype.toStepping = function (t) {
                        return (t = S(this.xVal, this.xPct, t));
                    }),
                    (t.prototype.fromStepping = function (t) {
                        return (function (t, e, r) {
                            if (r >= 100) return t.slice(-1)[0];
                            var n = b(r, e),
                                i = t[n - 1],
                                o = t[n],
                                s = e[n - 1];
                            return (function (t, e) {
                                return (e * (t[1] - t[0])) / 100 + t[0];
                            })([i, o], (r - s) * g(s, e[n]));
                        })(this.xVal, this.xPct, t);
                    }),
                    (t.prototype.getStep = function (t) {
                        return (t = x(this.xPct, this.xSteps, this.snap, t));
                    }),
                    (t.prototype.getDefaultStep = function (t, e, r) {
                        var n = b(t, this.xPct);
                        return (
                            (100 === t || (e && t === this.xPct[n - 1])) && (n = Math.max(n - 1, 1)),
                            (this.xVal[n] - this.xVal[n - 1]) / r
                        );
                    }),
                    (t.prototype.getNearbySteps = function (t) {
                        var e = b(t, this.xPct);
                        return {
                            stepBefore: {
                                startValue: this.xVal[e - 2],
                                step: this.xNumSteps[e - 2],
                                highestStep: this.xHighestCompleteStep[e - 2],
                            },
                            thisStep: {
                                startValue: this.xVal[e - 1],
                                step: this.xNumSteps[e - 1],
                                highestStep: this.xHighestCompleteStep[e - 1],
                            },
                            stepAfter: { startValue: this.xVal[e], step: this.xNumSteps[e], highestStep: this.xHighestCompleteStep[e] },
                        };
                    }),
                    (t.prototype.countStepDecimals = function () {
                        var t = this.xNumSteps.map(p);
                        return Math.max.apply(null, t);
                    }),
                    (t.prototype.hasNoSize = function () {
                        return this.xVal[0] === this.xVal[this.xVal.length - 1];
                    }),
                    (t.prototype.convert = function (t) {
                        return this.getStep(this.toStepping(t));
                    }),
                    (t.prototype.handleEntryPoint = function (t, e) {
                        var r;
                        if (!l((r = 'min' === t ? 0 : 'max' === t ? 100 : parseFloat(t))) || !l(e[0]))
                            throw new Error("noUiSlider: 'range' value isn't numeric.");
                        (this.xPct.push(r), this.xVal.push(e[0]));
                        var n = Number(e[1]);
                        (r ? this.xSteps.push(!isNaN(n) && n) : isNaN(n) || (this.xSteps[0] = n), this.xHighestCompleteStep.push(0));
                    }),
                    (t.prototype.handleStepPoint = function (t, e) {
                        if (e)
                            if (this.xVal[t] !== this.xVal[t + 1]) {
                                this.xSteps[t] = v([this.xVal[t], this.xVal[t + 1]], e, 0) / g(this.xPct[t], this.xPct[t + 1]);
                                var r = (this.xVal[t + 1] - this.xVal[t]) / this.xNumSteps[t],
                                    n = Math.ceil(Number(r.toFixed(3)) - 1),
                                    i = this.xVal[t] + this.xNumSteps[t] * n;
                                this.xHighestCompleteStep[t] = i;
                            } else this.xSteps[t] = this.xHighestCompleteStep[t] = this.xVal[t];
                    }),
                    t
                );
            })(),
            w = {
                to: function (t) {
                    return void 0 === t ? '' : t.toFixed(2);
                },
                from: Number,
            },
            E = {
                target: 'target',
                base: 'base',
                origin: 'origin',
                handle: 'handle',
                handleLower: 'handle-lower',
                handleUpper: 'handle-upper',
                touchArea: 'touch-area',
                horizontal: 'horizontal',
                vertical: 'vertical',
                background: 'background',
                connect: 'connect',
                connects: 'connects',
                ltr: 'ltr',
                rtl: 'rtl',
                textDirectionLtr: 'txt-dir-ltr',
                textDirectionRtl: 'txt-dir-rtl',
                draggable: 'draggable',
                drag: 'state-drag',
                tap: 'state-tap',
                active: 'active',
                tooltip: 'tooltip',
                pips: 'pips',
                pipsHorizontal: 'pips-horizontal',
                pipsVertical: 'pips-vertical',
                marker: 'marker',
                markerHorizontal: 'marker-horizontal',
                markerVertical: 'marker-vertical',
                markerNormal: 'marker-normal',
                markerLarge: 'marker-large',
                markerSub: 'marker-sub',
                value: 'value',
                valueHorizontal: 'value-horizontal',
                valueVertical: 'value-vertical',
                valueNormal: 'value-normal',
                valueLarge: 'value-large',
                valueSub: 'value-sub',
            },
            C = '.__tooltips',
            N = '.__aria';
        function P(t, e) {
            if (!l(e)) throw new Error("noUiSlider: 'step' is not numeric.");
            t.singleStep = e;
        }
        function V(t, e) {
            if (!l(e)) throw new Error("noUiSlider: 'keyboardPageMultiplier' is not numeric.");
            t.keyboardPageMultiplier = e;
        }
        function A(t, e) {
            if (!l(e)) throw new Error("noUiSlider: 'keyboardMultiplier' is not numeric.");
            t.keyboardMultiplier = e;
        }
        function k(t, e) {
            if (!l(e)) throw new Error("noUiSlider: 'keyboardDefaultStep' is not numeric.");
            t.keyboardDefaultStep = e;
        }
        function U(t, e) {
            if ('object' != typeof e || Array.isArray(e)) throw new Error("noUiSlider: 'range' is not an object.");
            if (void 0 === e.min || void 0 === e.max) throw new Error("noUiSlider: Missing 'min' or 'max' in 'range'.");
            t.spectrum = new y(e, t.snap || !1, t.singleStep);
        }
        function M(t, e) {
            if (((e = f(e)), !Array.isArray(e) || !e.length)) throw new Error("noUiSlider: 'start' option is incorrect.");
            ((t.handles = e.length), (t.start = e));
        }
        function D(t, e) {
            if ('boolean' != typeof e) throw new Error("noUiSlider: 'snap' option must be a boolean.");
            t.snap = e;
        }
        function O(t, e) {
            if ('boolean' != typeof e) throw new Error("noUiSlider: 'animate' option must be a boolean.");
            t.animate = e;
        }
        function L(t, e) {
            if ('number' != typeof e) throw new Error("noUiSlider: 'animationDuration' option must be a number.");
            t.animationDuration = e;
        }
        function j(t, e) {
            var r,
                n = [!1];
            if (('lower' === e ? (e = [!0, !1]) : 'upper' === e && (e = [!1, !0]), !0 === e || !1 === e)) {
                for (r = 1; r < t.handles; r++) n.push(e);
                n.push(!1);
            } else {
                if (!Array.isArray(e) || !e.length || e.length !== t.handles + 1)
                    throw new Error("noUiSlider: 'connect' option doesn't match handle count.");
                n = e;
            }
            t.connect = n;
        }
        function z(t, e) {
            switch (e) {
                case 'horizontal':
                    t.ort = 0;
                    break;
                case 'vertical':
                    t.ort = 1;
                    break;
                default:
                    throw new Error("noUiSlider: 'orientation' option is invalid.");
            }
        }
        function H(t, e) {
            if (!l(e)) throw new Error("noUiSlider: 'margin' option must be numeric.");
            0 !== e && (t.margin = t.spectrum.getDistance(e));
        }
        function F(t, e) {
            if (!l(e)) throw new Error("noUiSlider: 'limit' option must be numeric.");
            if (((t.limit = t.spectrum.getDistance(e)), !t.limit || t.handles < 2))
                throw new Error("noUiSlider: 'limit' option is only supported on linear sliders with 2 or more handles.");
        }
        function R(t, e) {
            var r;
            if (!l(e) && !Array.isArray(e)) throw new Error("noUiSlider: 'padding' option must be numeric or array of exactly 2 numbers.");
            if (Array.isArray(e) && 2 !== e.length && !l(e[0]) && !l(e[1]))
                throw new Error("noUiSlider: 'padding' option must be numeric or array of exactly 2 numbers.");
            if (0 !== e) {
                for (
                    Array.isArray(e) || (e = [e, e]), t.padding = [t.spectrum.getDistance(e[0]), t.spectrum.getDistance(e[1])], r = 0;
                    r < t.spectrum.xNumSteps.length - 1;
                    r++
                )
                    if (t.padding[0][r] < 0 || t.padding[1][r] < 0)
                        throw new Error("noUiSlider: 'padding' option must be a positive number(s).");
                var n = e[0] + e[1],
                    i = t.spectrum.xVal[0];
                if (n / (t.spectrum.xVal[t.spectrum.xVal.length - 1] - i) > 1)
                    throw new Error("noUiSlider: 'padding' option must not exceed 100% of the range.");
            }
        }
        function T(t, e) {
            switch (e) {
                case 'ltr':
                    t.dir = 0;
                    break;
                case 'rtl':
                    t.dir = 1;
                    break;
                default:
                    throw new Error("noUiSlider: 'direction' option was not recognized.");
            }
        }
        function _(t, e) {
            if ('string' != typeof e) throw new Error("noUiSlider: 'behaviour' must be a string containing options.");
            var r = e.indexOf('tap') >= 0,
                n = e.indexOf('drag') >= 0,
                i = e.indexOf('fixed') >= 0,
                o = e.indexOf('snap') >= 0,
                s = e.indexOf('hover') >= 0,
                a = e.indexOf('unconstrained') >= 0,
                l = e.indexOf('invert-connects') >= 0,
                u = e.indexOf('drag-all') >= 0,
                c = e.indexOf('smooth-steps') >= 0;
            if (i) {
                if (2 !== t.handles) throw new Error("noUiSlider: 'fixed' behaviour must be used with 2 handles");
                H(t, t.start[1] - t.start[0]);
            }
            if (l && 2 !== t.handles) throw new Error("noUiSlider: 'invert-connects' behaviour must be used with 2 handles");
            if (a && (t.margin || t.limit)) throw new Error("noUiSlider: 'unconstrained' behaviour cannot be used with margin or limit");
            t.events = {
                tap: r || o,
                drag: n,
                dragAll: u,
                smoothSteps: c,
                fixed: i,
                snap: o,
                hover: s,
                unconstrained: a,
                invertConnects: l,
            };
        }
        function B(t, e) {
            if (!1 !== e)
                if (!0 === e || i(e)) {
                    t.tooltips = [];
                    for (var r = 0; r < t.handles; r++) t.tooltips.push(e);
                } else {
                    if ((e = f(e)).length !== t.handles) throw new Error('noUiSlider: must pass a formatter for all handles.');
                    (e.forEach(function (t) {
                        if ('boolean' != typeof t && !i(t))
                            throw new Error("noUiSlider: 'tooltips' must be passed a formatter or 'false'.");
                    }),
                        (t.tooltips = e));
                }
        }
        function q(t, e) {
            if (e.length !== t.handles) throw new Error('noUiSlider: must pass a attributes for all handles.');
            t.handleAttributes = e;
        }
        function X(t, e) {
            if (!i(e)) throw new Error("noUiSlider: 'ariaFormat' requires 'to' method.");
            t.ariaFormat = e;
        }
        function Y(t, e) {
            if (
                !(function (t) {
                    return i(t) && 'function' == typeof t.from;
                })(e)
            )
                throw new Error("noUiSlider: 'format' requires 'to' and 'from' methods.");
            t.format = e;
        }
        function I(t, e) {
            if ('boolean' != typeof e) throw new Error("noUiSlider: 'keyboardSupport' option must be a boolean.");
            t.keyboardSupport = e;
        }
        function W(t, e) {
            t.documentElement = e;
        }
        function $(t, e) {
            if ('string' != typeof e && !1 !== e) throw new Error("noUiSlider: 'cssPrefix' must be a string or `false`.");
            t.cssPrefix = e;
        }
        function G(t, e) {
            if ('object' != typeof e) throw new Error("noUiSlider: 'cssClasses' must be an object.");
            'string' == typeof t.cssPrefix
                ? ((t.cssClasses = {}),
                  Object.keys(e).forEach(function (r) {
                      t.cssClasses[r] = t.cssPrefix + e[r];
                  }))
                : (t.cssClasses = e);
        }
        function J(t) {
            var e = { margin: null, limit: null, padding: null, animate: !0, animationDuration: 300, ariaFormat: w, format: w },
                r = {
                    step: { r: !1, t: P },
                    keyboardPageMultiplier: { r: !1, t: V },
                    keyboardMultiplier: { r: !1, t: A },
                    keyboardDefaultStep: { r: !1, t: k },
                    start: { r: !0, t: M },
                    connect: { r: !0, t: j },
                    direction: { r: !0, t: T },
                    snap: { r: !1, t: D },
                    animate: { r: !1, t: O },
                    animationDuration: { r: !1, t: L },
                    range: { r: !0, t: U },
                    orientation: { r: !1, t: z },
                    margin: { r: !1, t: H },
                    limit: { r: !1, t: F },
                    padding: { r: !1, t: R },
                    behaviour: { r: !0, t: _ },
                    ariaFormat: { r: !1, t: X },
                    format: { r: !1, t: Y },
                    tooltips: { r: !1, t: B },
                    keyboardSupport: { r: !0, t: I },
                    documentElement: { r: !1, t: W },
                    cssPrefix: { r: !0, t: $ },
                    cssClasses: { r: !0, t: G },
                    handleAttributes: { r: !1, t: q },
                },
                n = {
                    connect: !1,
                    direction: 'ltr',
                    behaviour: 'tap',
                    orientation: 'horizontal',
                    keyboardSupport: !0,
                    cssPrefix: 'noUi-',
                    cssClasses: E,
                    keyboardPageMultiplier: 5,
                    keyboardMultiplier: 1,
                    keyboardDefaultStep: 10,
                };
            (t.format && !t.ariaFormat && (t.ariaFormat = t.format),
                Object.keys(r).forEach(function (i) {
                    if (s(t[i]) || void 0 !== n[i]) r[i].t(e, s(t[i]) ? t[i] : n[i]);
                    else if (r[i].r) throw new Error("noUiSlider: '" + i + "' is required.");
                }),
                (e.pips = t.pips));
            var i = document.createElement('div'),
                o = void 0 !== i.style.msTransform,
                a = void 0 !== i.style.transform;
            e.transformRule = a ? 'transform' : o ? 'msTransform' : 'webkitTransform';
            return (
                (e.style = [
                    ['left', 'top'],
                    ['right', 'bottom'],
                ][e.dir][e.ort]),
                e
            );
        }
        function K(r, n, i) {
            var l,
                p,
                g,
                v,
                b,
                S,
                x,
                y = window.navigator.pointerEnabled
                    ? { start: 'pointerdown', move: 'pointermove', end: 'pointerup' }
                    : window.navigator.msPointerEnabled
                      ? { start: 'MSPointerDown', move: 'MSPointerMove', end: 'MSPointerUp' }
                      : { start: 'mousedown touchstart', move: 'mousemove touchmove', end: 'mouseup touchend' },
                w =
                    window.CSS &&
                    CSS.supports &&
                    CSS.supports('touch-action', 'none') &&
                    (function () {
                        var t = !1;
                        try {
                            var e = Object.defineProperty({}, 'passive', {
                                get: function () {
                                    t = !0;
                                },
                            });
                            window.addEventListener('test', null, e);
                        } catch (t) {}
                        return t;
                    })(),
                E = r,
                P = n.spectrum,
                V = [],
                A = [],
                k = [],
                U = 0,
                M = {},
                D = !1,
                O = r.ownerDocument,
                L = n.documentElement || O.documentElement,
                z = O.body,
                H = 'rtl' === O.dir || 1 === n.ort ? 0 : 100;
            function F(t, e) {
                var r = O.createElement('div');
                return (e && d(r, e), t.appendChild(r), r);
            }
            function R(t, e) {
                var r = F(t, n.cssClasses.origin),
                    i = F(r, n.cssClasses.handle);
                if (
                    (F(i, n.cssClasses.touchArea),
                    i.setAttribute('data-handle', String(e)),
                    n.keyboardSupport &&
                        (i.setAttribute('tabindex', '0'),
                        i.addEventListener('keydown', function (t) {
                            return (function (t, e) {
                                if (B() || q(e)) return !1;
                                var r = ['Left', 'Right'],
                                    i = ['Down', 'Up'],
                                    o = ['PageDown', 'PageUp'],
                                    s = ['Home', 'End'];
                                n.dir && !n.ort ? r.reverse() : n.ort && !n.dir && (i.reverse(), o.reverse());
                                var a,
                                    l = t.key.replace('Arrow', ''),
                                    u = l === o[0],
                                    c = l === o[1],
                                    f = l === i[0] || l === r[0] || u,
                                    p = l === i[1] || l === r[1] || c,
                                    d = l === s[0],
                                    h = l === s[1];
                                if (!(f || p || d || h)) return !0;
                                if ((t.preventDefault(), p || f)) {
                                    var m = f ? 0 : 1,
                                        g = wt(e)[m];
                                    if (null === g) return !1;
                                    (!1 === g && (g = P.getDefaultStep(A[e], f, n.keyboardDefaultStep)),
                                        (g *= c || u ? n.keyboardPageMultiplier : n.keyboardMultiplier),
                                        (g = Math.max(g, 1e-7)),
                                        (g *= f ? -1 : 1),
                                        (a = V[e] + g));
                                } else a = h ? n.spectrum.xVal[n.spectrum.xVal.length - 1] : n.spectrum.xVal[0];
                                return (vt(e, P.toStepping(a), !0, !0), ct('slide', e), ct('update', e), ct('change', e), ct('set', e), !1);
                            })(t, e);
                        })),
                    void 0 !== n.handleAttributes)
                ) {
                    var o = n.handleAttributes[e];
                    Object.keys(o).forEach(function (t) {
                        i.setAttribute(t, o[t]);
                    });
                }
                return (
                    i.setAttribute('role', 'slider'),
                    i.setAttribute('aria-orientation', n.ort ? 'vertical' : 'horizontal'),
                    0 === e ? d(i, n.cssClasses.handleLower) : e === n.handles - 1 && d(i, n.cssClasses.handleUpper),
                    (r.handle = i),
                    r
                );
            }
            function T(t, e) {
                return !!e && F(t, n.cssClasses.connect);
            }
            function _(t, e) {
                return !(!n.tooltips || !n.tooltips[e]) && F(t.firstChild, n.cssClasses.tooltip);
            }
            function B() {
                return E.hasAttribute('disabled');
            }
            function q(t) {
                return g[t].hasAttribute('disabled');
            }
            function X() {
                S &&
                    (ut('update' + C),
                    S.forEach(function (t) {
                        t && o(t);
                    }),
                    (S = null));
            }
            function Y() {
                (X(),
                    (S = g.map(_)),
                    lt('update' + C, function (t, e, r) {
                        if (S && n.tooltips && !1 !== S[e]) {
                            var i = t[e];
                            (!0 !== n.tooltips[e] && (i = n.tooltips[e].to(r[e])), (S[e].innerHTML = i));
                        }
                    }));
            }
            function I(t, e) {
                return t.map(function (t) {
                    return P.fromStepping(e ? P.getStep(t) : t);
                });
            }
            function W(r) {
                var n,
                    i = (function (e) {
                        if (e.mode === t.Range || e.mode === t.Steps) return P.xVal;
                        if (e.mode === t.Count) {
                            if (e.values < 2) throw new Error("noUiSlider: 'values' (>= 2) required for mode 'count'.");
                            for (var r = e.values - 1, n = 100 / r, i = []; r--; ) i[r] = r * n;
                            return (i.push(100), I(i, e.stepped));
                        }
                        return e.mode === t.Positions
                            ? I(e.values, e.stepped)
                            : e.mode === t.Values
                              ? e.stepped
                                  ? e.values.map(function (t) {
                                        return P.fromStepping(P.getStep(P.toStepping(t)));
                                    })
                                  : e.values
                              : [];
                    })(r),
                    o = {},
                    s = P.xVal[0],
                    a = P.xVal[P.xVal.length - 1],
                    l = !1,
                    u = !1,
                    c = 0;
                return (
                    (n = i.slice().sort(function (t, e) {
                        return t - e;
                    })),
                    (i = n.filter(function (t) {
                        return !this[t] && (this[t] = !0);
                    }, {}))[0] !== s && (i.unshift(s), (l = !0)),
                    i[i.length - 1] !== a && (i.push(a), (u = !0)),
                    i.forEach(function (n, s) {
                        var a,
                            f,
                            p,
                            d,
                            h,
                            m,
                            g,
                            v,
                            b,
                            S,
                            x = n,
                            y = i[s + 1],
                            w = r.mode === t.Steps;
                        for (
                            w && (a = P.xNumSteps[s]), a || (a = y - x), void 0 === y && (y = x), a = Math.max(a, 1e-7), f = x;
                            f <= y;
                            f = Number((f + a).toFixed(7))
                        ) {
                            for (v = (h = (d = P.toStepping(f)) - c) / (r.density || 1), S = h / (b = Math.round(v)), p = 1; p <= b; p += 1)
                                o[(m = c + p * S).toFixed(5)] = [P.fromStepping(m), 0];
                            ((g = i.indexOf(f) > -1 ? e.LargeValue : w ? e.SmallValue : e.NoValue),
                                !s && l && f !== y && (g = 0),
                                (f === y && u) || (o[d.toFixed(5)] = [f, g]),
                                (c = d));
                        }
                    }),
                    o
                );
            }
            function $(t, r, i) {
                var o,
                    s,
                    a = O.createElement('div'),
                    l =
                        (((o = {})[e.None] = ''),
                        (o[e.NoValue] = n.cssClasses.valueNormal),
                        (o[e.LargeValue] = n.cssClasses.valueLarge),
                        (o[e.SmallValue] = n.cssClasses.valueSub),
                        o),
                    u =
                        (((s = {})[e.None] = ''),
                        (s[e.NoValue] = n.cssClasses.markerNormal),
                        (s[e.LargeValue] = n.cssClasses.markerLarge),
                        (s[e.SmallValue] = n.cssClasses.markerSub),
                        s),
                    c = [n.cssClasses.valueHorizontal, n.cssClasses.valueVertical],
                    f = [n.cssClasses.markerHorizontal, n.cssClasses.markerVertical];
                function p(t, e) {
                    var r = e === n.cssClasses.value,
                        i = r ? l : u;
                    return e + ' ' + (r ? c : f)[n.ort] + ' ' + i[t];
                }
                return (
                    d(a, n.cssClasses.pips),
                    d(a, 0 === n.ort ? n.cssClasses.pipsHorizontal : n.cssClasses.pipsVertical),
                    Object.keys(t).forEach(function (o) {
                        !(function (t, o, s) {
                            if ((s = r ? r(o, s) : s) !== e.None) {
                                var l = F(a, !1);
                                ((l.className = p(s, n.cssClasses.marker)),
                                    (l.style[n.style] = t + '%'),
                                    s > e.NoValue &&
                                        (((l = F(a, !1)).className = p(s, n.cssClasses.value)),
                                        l.setAttribute('data-value', String(o)),
                                        (l.style[n.style] = t + '%'),
                                        (l.innerHTML = String(i.to(o)))));
                            }
                        })(o, t[o][0], t[o][1]);
                    }),
                    a
                );
            }
            function G() {
                b && (o(b), (b = null));
            }
            function K(t) {
                G();
                var e = W(t),
                    r = t.filter,
                    n = t.format || {
                        to: function (t) {
                            return String(Math.round(t));
                        },
                    };
                return (b = E.appendChild($(e, r, n)));
            }
            function Q() {
                var t = l.getBoundingClientRect(),
                    e = 'offset' + ['Width', 'Height'][n.ort];
                return 0 === n.ort ? t.width || l[e] : t.height || l[e];
            }
            function Z(t, e, r, i) {
                var o = function (o) {
                        var s,
                            a,
                            l = (function (t, e, r) {
                                var n = 0 === t.type.indexOf('touch'),
                                    i = 0 === t.type.indexOf('mouse'),
                                    o = 0 === t.type.indexOf('pointer'),
                                    s = 0,
                                    a = 0;
                                0 === t.type.indexOf('MSPointer') && (o = !0);
                                if ('mousedown' === t.type && !t.buttons && !t.touches) return !1;
                                if (n) {
                                    var l = function (e) {
                                        var n = e.target;
                                        return n === r || r.contains(n) || (t.composed && t.composedPath().shift() === r);
                                    };
                                    if ('touchstart' === t.type) {
                                        var u = Array.prototype.filter.call(t.touches, l);
                                        if (u.length > 1) return !1;
                                        ((s = u[0].pageX), (a = u[0].pageY));
                                    } else {
                                        var c = Array.prototype.find.call(t.changedTouches, l);
                                        if (!c) return !1;
                                        ((s = c.pageX), (a = c.pageY));
                                    }
                                }
                                ((e = e || m(O)), (i || o) && ((s = t.clientX + e.x), (a = t.clientY + e.y)));
                                return ((t.pageOffset = e), (t.points = [s, a]), (t.cursor = i || o), t);
                            })(o, i.pageOffset, i.target || e);
                        return (
                            !!l &&
                            !(B() && !i.doNotReject) &&
                            ((s = E),
                            (a = n.cssClasses.tap),
                            !(
                                (s.classList ? s.classList.contains(a) : new RegExp('\\b' + a + '\\b').test(s.className)) && !i.doNotReject
                            ) &&
                                !(t === y.start && void 0 !== l.buttons && l.buttons > 1) &&
                                (!i.hover || !l.buttons) &&
                                (w || l.preventDefault(), (l.calcPoint = l.points[n.ort]), void r(l, i)))
                        );
                    },
                    s = [];
                return (
                    t.split(' ').forEach(function (t) {
                        (e.addEventListener(t, o, !!w && { passive: !0 }), s.push([t, o]));
                    }),
                    s
                );
            }
            function tt(t) {
                var e,
                    r,
                    i,
                    o,
                    s,
                    a,
                    u =
                        (100 *
                            (t -
                                ((e = l),
                                (r = n.ort),
                                (i = e.getBoundingClientRect()),
                                (o = e.ownerDocument),
                                (s = o.documentElement),
                                (a = m(o)),
                                /webkit.*Chrome.*Mobile/i.test(navigator.userAgent) && (a.x = 0),
                                r ? i.top + a.y - s.clientTop : i.left + a.x - s.clientLeft))) /
                        Q();
                return ((u = c(u)), n.dir ? 100 - u : u);
            }
            function et(t, e) {
                'mouseout' === t.type && 'HTML' === t.target.nodeName && null === t.relatedTarget && nt(t, e);
            }
            function rt(t, e) {
                if (-1 === navigator.appVersion.indexOf('MSIE 9') && 0 === t.buttons && 0 !== e.buttonsProperty) return nt(t, e);
                var r = (n.dir ? -1 : 1) * (t.calcPoint - e.startCalcPoint);
                dt(r > 0, (100 * r) / e.baseSize, e.locations, e.handleNumbers, e.connect);
            }
            function nt(t, e) {
                (e.handle && (h(e.handle, n.cssClasses.active), (U -= 1)),
                    e.listeners.forEach(function (t) {
                        L.removeEventListener(t[0], t[1]);
                    }),
                    0 === U &&
                        (h(E, n.cssClasses.drag), gt(), t.cursor && ((z.style.cursor = ''), z.removeEventListener('selectstart', a))),
                    n.events.smoothSteps &&
                        (e.handleNumbers.forEach(function (t) {
                            vt(t, A[t], !0, !0, !1, !1);
                        }),
                        e.handleNumbers.forEach(function (t) {
                            ct('update', t);
                        })),
                    e.handleNumbers.forEach(function (t) {
                        (ct('change', t), ct('set', t), ct('end', t));
                    }));
            }
            function it(t, e) {
                if (!e.handleNumbers.some(q)) {
                    var r;
                    if (1 === e.handleNumbers.length) ((r = g[e.handleNumbers[0]].children[0]), (U += 1), d(r, n.cssClasses.active));
                    t.stopPropagation();
                    var i = [],
                        o = Z(y.move, L, rt, {
                            target: t.target,
                            handle: r,
                            connect: e.connect,
                            listeners: i,
                            startCalcPoint: t.calcPoint,
                            baseSize: Q(),
                            pageOffset: t.pageOffset,
                            handleNumbers: e.handleNumbers,
                            buttonsProperty: t.buttons,
                            locations: A.slice(),
                        }),
                        s = Z(y.end, L, nt, { target: t.target, handle: r, listeners: i, doNotReject: !0, handleNumbers: e.handleNumbers }),
                        l = Z('mouseout', L, et, {
                            target: t.target,
                            handle: r,
                            listeners: i,
                            doNotReject: !0,
                            handleNumbers: e.handleNumbers,
                        });
                    (i.push.apply(i, o.concat(s, l)),
                        t.cursor &&
                            ((z.style.cursor = getComputedStyle(t.target).cursor),
                            g.length > 1 && d(E, n.cssClasses.drag),
                            z.addEventListener('selectstart', a, !1)),
                        e.handleNumbers.forEach(function (t) {
                            ct('start', t);
                        }));
                }
            }
            function ot(t) {
                t.stopPropagation();
                var e = tt(t.calcPoint),
                    r = (function (t) {
                        var e = 100,
                            r = !1;
                        return (
                            g.forEach(function (n, i) {
                                if (!q(i)) {
                                    var o = A[i],
                                        s = Math.abs(o - t);
                                    (s < e || (s <= e && t > o) || (100 === s && 100 === e)) && ((r = i), (e = s));
                                }
                            }),
                            r
                        );
                    })(e);
                !1 !== r &&
                    (n.events.snap || u(E, n.cssClasses.tap, n.animationDuration),
                    vt(r, e, !0, !0),
                    gt(),
                    ct('slide', r, !0),
                    ct('update', r, !0),
                    n.events.snap ? it(t, { handleNumbers: [r] }) : (ct('change', r, !0), ct('set', r, !0)));
            }
            function st(t) {
                var e = tt(t.calcPoint),
                    r = P.getStep(e),
                    n = P.fromStepping(r);
                Object.keys(M).forEach(function (t) {
                    'hover' === t.split('.')[0] &&
                        M[t].forEach(function (t) {
                            t.call(Ct, n);
                        });
                });
            }
            function at(t) {
                (t.fixed ||
                    g.forEach(function (t, e) {
                        Z(y.start, t.children[0], it, { handleNumbers: [e] });
                    }),
                    t.tap && Z(y.start, l, ot, {}),
                    t.hover && Z(y.move, l, st, { hover: !0 }),
                    t.drag &&
                        v.forEach(function (e, r) {
                            if (!1 !== e && 0 !== r && r !== v.length - 1) {
                                var i = g[r - 1],
                                    o = g[r],
                                    s = [e],
                                    a = [i, o],
                                    l = [r - 1, r];
                                (d(e, n.cssClasses.draggable),
                                    t.fixed && (s.push(i.children[0]), s.push(o.children[0])),
                                    t.dragAll && ((a = g), (l = k)),
                                    s.forEach(function (t) {
                                        Z(y.start, t, it, { handles: a, handleNumbers: l, connect: e });
                                    }));
                            }
                        }));
            }
            function lt(t, e) {
                ((M[t] = M[t] || []),
                    M[t].push(e),
                    'update' === t.split('.')[0] &&
                        g.forEach(function (t, e) {
                            ct('update', e);
                        }));
            }
            function ut(t) {
                var e = t && t.split('.')[0],
                    r = e ? t.substring(e.length) : t;
                Object.keys(M).forEach(function (t) {
                    var n = t.split('.')[0],
                        i = t.substring(n.length);
                    (e && e !== n) ||
                        (r && r !== i) ||
                        ((function (t) {
                            return t === N || t === C;
                        })(i) &&
                            r !== i) ||
                        delete M[t];
                });
            }
            function ct(t, e, r) {
                Object.keys(M).forEach(function (i) {
                    var o = i.split('.')[0];
                    t === o &&
                        M[i].forEach(function (t) {
                            t.call(Ct, V.map(n.format.to), e, V.slice(), r || !1, A.slice(), Ct);
                        });
                });
            }
            function ft(t, e, r, i, o, s, a) {
                var l;
                return (
                    g.length > 1 &&
                        !n.events.unconstrained &&
                        (i && e > 0 && ((l = P.getAbsoluteDistance(t[e - 1], n.margin, !1)), (r = Math.max(r, l))),
                        o && e < g.length - 1 && ((l = P.getAbsoluteDistance(t[e + 1], n.margin, !0)), (r = Math.min(r, l)))),
                    g.length > 1 &&
                        n.limit &&
                        (i && e > 0 && ((l = P.getAbsoluteDistance(t[e - 1], n.limit, !1)), (r = Math.min(r, l))),
                        o && e < g.length - 1 && ((l = P.getAbsoluteDistance(t[e + 1], n.limit, !0)), (r = Math.max(r, l)))),
                    n.padding &&
                        (0 === e && ((l = P.getAbsoluteDistance(0, n.padding[0], !1)), (r = Math.max(r, l))),
                        e === g.length - 1 && ((l = P.getAbsoluteDistance(100, n.padding[1], !0)), (r = Math.min(r, l)))),
                    a || (r = P.getStep(r)),
                    !((r = c(r)) === t[e] && !s) && r
                );
            }
            function pt(t, e) {
                var r = n.ort;
                return (r ? e : t) + ', ' + (r ? t : e);
            }
            function dt(t, e, r, i, o) {
                var s = r.slice(),
                    a = i[0],
                    l = n.events.smoothSteps,
                    u = [!t, t],
                    c = [t, !t];
                ((i = i.slice()),
                    t && i.reverse(),
                    i.length > 1
                        ? i.forEach(function (t, r) {
                              var n = ft(s, t, s[t] + e, u[r], c[r], !1, l);
                              !1 === n ? (e = 0) : ((e = n - s[t]), (s[t] = n));
                          })
                        : (u = c = [!0]));
                var f = !1;
                (i.forEach(function (t, n) {
                    f = vt(t, r[t] + e, u[n], c[n], !1, l) || f;
                }),
                    f &&
                        (i.forEach(function (t) {
                            (ct('update', t), ct('slide', t));
                        }),
                        null != o && ct('drag', a)));
            }
            function ht(t, e) {
                return n.dir ? 100 - t - e : t;
            }
            function mt(t, e) {
                ((A[t] = e), (V[t] = P.fromStepping(e)));
                var r = 'translate(' + pt(ht(e, 0) - H + '%', '0') + ')';
                if (((g[t].style[n.transformRule] = r), n.events.invertConnects && A.length > 1)) {
                    var i = A.every(function (t, e, r) {
                        return 0 === e || t >= r[e - 1];
                    });
                    if (D !== !i)
                        return (
                            (D = !D),
                            j(
                                n,
                                n.connect.map(function (t) {
                                    return !t;
                                })
                            ),
                            void Et()
                        );
                }
                (bt(t), bt(t + 1), D && (bt(t - 1), bt(t + 2)));
            }
            function gt() {
                k.forEach(function (t) {
                    var e = A[t] > 50 ? -1 : 1,
                        r = 3 + (g.length + e * t);
                    g[t].style.zIndex = String(r);
                });
            }
            function vt(t, e, r, n, i, o) {
                return (i || (e = ft(A, t, e, r, n, !1, o)), !1 !== e && (mt(t, e), !0));
            }
            function bt(t) {
                if (v[t]) {
                    var e = A.slice();
                    D &&
                        e.sort(function (t, e) {
                            return t - e;
                        });
                    var r = 0,
                        i = 100;
                    (0 !== t && (r = e[t - 1]), t !== v.length - 1 && (i = e[t]));
                    var o = i - r,
                        s = 'translate(' + pt(ht(r, o) + '%', '0') + ')',
                        a = 'scale(' + pt(o / 100, '1') + ')';
                    v[t].style[n.transformRule] = s + ' ' + a;
                }
            }
            function St(t, e) {
                return null === t || !1 === t || void 0 === t
                    ? A[e]
                    : ('number' == typeof t && (t = String(t)),
                      !1 !== (t = n.format.from(t)) && (t = P.toStepping(t)),
                      !1 === t || isNaN(t) ? A[e] : t);
            }
            function xt(t, e, r) {
                var i = f(t),
                    o = void 0 === A[0];
                ((e = void 0 === e || e),
                    n.animate && !o && u(E, n.cssClasses.tap, n.animationDuration),
                    k.forEach(function (t) {
                        vt(t, St(i[t], t), !0, !1, r);
                    }));
                var s = 1 === k.length ? 0 : 1;
                if (o && P.hasNoSize() && ((r = !0), (A[0] = 0), k.length > 1)) {
                    var a = 100 / (k.length - 1);
                    k.forEach(function (t) {
                        A[t] = t * a;
                    });
                }
                for (; s < k.length; ++s)
                    k.forEach(function (t) {
                        vt(t, A[t], !0, !0, r);
                    });
                (gt(),
                    k.forEach(function (t) {
                        (ct('update', t), null !== i[t] && e && ct('set', t));
                    }));
            }
            function yt(t) {
                if ((void 0 === t && (t = !1), t)) return 1 === V.length ? V[0] : V.slice(0);
                var e = V.map(n.format.to);
                return 1 === e.length ? e[0] : e;
            }
            function wt(t) {
                var e = A[t],
                    r = P.getNearbySteps(e),
                    i = V[t],
                    o = r.thisStep.step,
                    s = null;
                if (n.snap) return [i - r.stepBefore.startValue || null, r.stepAfter.startValue - i || null];
                (!1 !== o && i + o > r.stepAfter.startValue && (o = r.stepAfter.startValue - i),
                    (s = i > r.thisStep.startValue ? r.thisStep.step : !1 !== r.stepBefore.step && i - r.stepBefore.highestStep),
                    100 === e ? (o = null) : 0 === e && (s = null));
                var a = P.countStepDecimals();
                return (null !== o && !1 !== o && (o = Number(o.toFixed(a))), null !== s && !1 !== s && (s = Number(s.toFixed(a))), [s, o]);
            }
            function Et() {
                for (; p.firstChild; ) p.removeChild(p.firstChild);
                for (var t = 0; t <= n.handles; t++) ((v[t] = T(p, n.connect[t])), bt(t));
                at({ drag: n.events.drag, fixed: !0 });
            }
            (d((x = E), n.cssClasses.target),
                0 === n.dir ? d(x, n.cssClasses.ltr) : d(x, n.cssClasses.rtl),
                0 === n.ort ? d(x, n.cssClasses.horizontal) : d(x, n.cssClasses.vertical),
                d(x, 'rtl' === getComputedStyle(x).direction ? n.cssClasses.textDirectionRtl : n.cssClasses.textDirectionLtr),
                (l = F(x, n.cssClasses.base)),
                (function (t, e) {
                    ((p = F(e, n.cssClasses.connects)), (g = []), (v = []).push(T(p, t[0])));
                    for (var r = 0; r < n.handles; r++) (g.push(R(e, r)), (k[r] = r), v.push(T(p, t[r + 1])));
                })(n.connect, l),
                at(n.events),
                xt(n.start),
                n.pips && K(n.pips),
                n.tooltips && Y(),
                ut('update' + N),
                lt('update' + N, function (t, e, r, i, o) {
                    k.forEach(function (t) {
                        var e = g[t],
                            i = ft(A, t, 0, !0, !0, !0),
                            s = ft(A, t, 100, !0, !0, !0),
                            a = o[t],
                            l = String(n.ariaFormat.to(r[t]));
                        ((i = P.fromStepping(i).toFixed(1)),
                            (s = P.fromStepping(s).toFixed(1)),
                            (a = P.fromStepping(a).toFixed(1)),
                            e.children[0].setAttribute('aria-valuemin', i),
                            e.children[0].setAttribute('aria-valuemax', s),
                            e.children[0].setAttribute('aria-valuenow', a),
                            e.children[0].setAttribute('aria-valuetext', l));
                    });
                }));
            var Ct = {
                destroy: function () {
                    for (
                        ut(N),
                            ut(C),
                            Object.keys(n.cssClasses).forEach(function (t) {
                                h(E, n.cssClasses[t]);
                            });
                        E.firstChild;

                    )
                        E.removeChild(E.firstChild);
                    delete E.noUiSlider;
                },
                steps: function () {
                    return k.map(wt);
                },
                on: lt,
                off: ut,
                get: yt,
                set: xt,
                setHandle: function (t, e, r, n) {
                    if (!((t = Number(t)) >= 0 && t < k.length)) throw new Error('noUiSlider: invalid handle number, got: ' + t);
                    (vt(t, St(e, t), !0, !0, n), ct('update', t), r && ct('set', t));
                },
                reset: function (t) {
                    xt(n.start, t);
                },
                disable: function (t) {
                    null != t
                        ? (g[t].setAttribute('disabled', ''), g[t].handle.removeAttribute('tabindex'))
                        : (E.setAttribute('disabled', ''),
                          g.forEach(function (t) {
                              t.handle.removeAttribute('tabindex');
                          }));
                },
                enable: function (t) {
                    null != t
                        ? (g[t].removeAttribute('disabled'), g[t].handle.setAttribute('tabindex', '0'))
                        : (E.removeAttribute('disabled'),
                          g.forEach(function (t) {
                              (t.removeAttribute('disabled'), t.handle.setAttribute('tabindex', '0'));
                          }));
                },
                __moveHandles: function (t, e, r) {
                    dt(t, e, A, r);
                },
                options: i,
                updateOptions: function (t, e) {
                    var r = yt(),
                        o = ['margin', 'limit', 'padding', 'range', 'animate', 'snap', 'step', 'format', 'pips', 'tooltips', 'connect'];
                    o.forEach(function (e) {
                        void 0 !== t[e] && (i[e] = t[e]);
                    });
                    var a = J(i);
                    (o.forEach(function (e) {
                        void 0 !== t[e] && (n[e] = a[e]);
                    }),
                        (P = a.spectrum),
                        (n.margin = a.margin),
                        (n.limit = a.limit),
                        (n.padding = a.padding),
                        n.pips ? K(n.pips) : G(),
                        n.tooltips ? Y() : X(),
                        (A = []),
                        xt(s(t.start) ? t.start : r, e),
                        t.connect && Et());
                },
                target: E,
                removePips: G,
                removeTooltips: X,
                getPositions: function () {
                    return A.slice();
                },
                getTooltips: function () {
                    return S;
                },
                getOrigins: function () {
                    return g;
                },
                pips: K,
            };
            return Ct;
        }
        var Q = {
            __spectrum: y,
            cssClasses: E,
            create: function (t, e) {
                if (!t || !t.nodeName) throw new Error('noUiSlider: create requires a single element, got: ' + t);
                if (t.noUiSlider) throw new Error('noUiSlider: Slider was already initialized.');
                var r = K(t, J(e), e);
                return ((t.noUiSlider = r), r);
            },
        };
        try {
            window.noUiSlider = Q;
        } catch (t) {}
        return n;
    })();
});
