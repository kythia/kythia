/**
 * @namespace: addons/dashboard/web/public/assets/vendor/libs/shepherd/shepherd.js
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
        'use strict';
        var t = {
                d: function (e, n) {
                    for (var o in n) t.o(n, o) && !t.o(e, o) && Object.defineProperty(e, o, { enumerable: !0, get: n[o] });
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
            e = {};
        function n(t) {
            return t instanceof HTMLElement;
        }
        function o(t) {
            return 'function' == typeof t;
        }
        function i(t) {
            return 'string' == typeof t;
        }
        function r(t) {
            return void 0 === t;
        }
        (t.r(e),
            t.d(e, {
                Shepherd: function () {
                    return vn;
                },
            }));
        class s {
            on(t, e, n, o = !1) {
                var i;
                return (
                    r(this.bindings) && (this.bindings = {}),
                    r(this.bindings[t]) && (this.bindings[t] = []),
                    null == (i = this.bindings[t]) || i.push({ handler: e, ctx: n, once: o }),
                    this
                );
            }
            once(t, e, n) {
                return this.on(t, e, n, !0);
            }
            off(t, e) {
                if (r(this.bindings) || r(this.bindings[t])) return this;
                var n;
                r(e)
                    ? delete this.bindings[t]
                    : null == (n = this.bindings[t]) ||
                      n.forEach((n, o) => {
                          var i;
                          n.handler === e && (null == (i = this.bindings[t]) || i.splice(o, 1));
                      });
                return this;
            }
            trigger(t, ...e) {
                var n;
                !r(this.bindings) &&
                    this.bindings[t] &&
                    (null == (n = this.bindings[t]) ||
                        n.forEach((n, o) => {
                            const { ctx: i, handler: r, once: s } = n,
                                l = i || this;
                            var c;
                            (r.apply(l, e), s) && (null == (c = this.bindings[t]) || c.splice(o, 1));
                        }));
                return this;
            }
        }
        function l() {
            return (
                (l = Object.assign
                    ? Object.assign.bind()
                    : function (t) {
                          for (var e = 1; e < arguments.length; e++) {
                              var n = arguments[e];
                              for (var o in n) ({}).hasOwnProperty.call(n, o) && (t[o] = n[o]);
                          }
                          return t;
                      }),
                l.apply(null, arguments)
            );
        }
        function c(t, e) {
            if (null == t) return {};
            var n = {};
            for (var o in t)
                if ({}.hasOwnProperty.call(t, o)) {
                    if (e.includes(o)) continue;
                    n[o] = t[o];
                }
            return n;
        }
        const a = { defaultMerge: Symbol('deepmerge-ts: default merge'), skip: Symbol('deepmerge-ts: skip') };
        function u(t, e) {
            return e;
        }
        function f(t, e) {
            return t.filter((t) => void 0 !== t);
        }
        var d;
        function h(t) {
            return 'object' != typeof t || null === t
                ? 0
                : Array.isArray(t)
                  ? 2
                  : (function (t) {
                          if (!m.has(Object.prototype.toString.call(t))) return !1;
                          const { constructor: e } = t;
                          if (void 0 === e) return !0;
                          const n = e.prototype;
                          if (null === n || 'object' != typeof n || !m.has(Object.prototype.toString.call(n))) return !1;
                          if (!n.hasOwnProperty('isPrototypeOf')) return !1;
                          return !0;
                      })(t)
                    ? 1
                    : t instanceof Set
                      ? 3
                      : t instanceof Map
                        ? 4
                        : 5;
        }
        function p(t) {
            return {
                *[Symbol.iterator]() {
                    for (const e of t) for (const t of e) yield t;
                },
            };
        }
        !(function (t) {
            ((t[(t.NOT = 0)] = 'NOT'),
                (t[(t.RECORD = 1)] = 'RECORD'),
                (t[(t.ARRAY = 2)] = 'ARRAY'),
                (t[(t.SET = 3)] = 'SET'),
                (t[(t.MAP = 4)] = 'MAP'),
                (t[(t.OTHER = 5)] = 'OTHER'));
        })(d || (d = {}));
        const m = new Set(['[object Object]', '[object Module]']);
        const g = {
            mergeRecords: function (t, e, n) {
                const o = {};
                for (const s of (function (t) {
                    const e = new Set();
                    for (const n of t) for (const t of [...Object.keys(n), ...Object.getOwnPropertySymbols(n)]) e.add(t);
                    return e;
                })(t)) {
                    const l = [];
                    for (const e of t)
                        ((r = s), 'object' == typeof (i = e) && Object.prototype.propertyIsEnumerable.call(i, r) && l.push(e[s]));
                    if (0 === l.length) continue;
                    const c = e.metaDataUpdater(n, { key: s, parents: t }),
                        u = v(l, e, c);
                    u !== a.skip &&
                        ('__proto__' === s
                            ? Object.defineProperty(o, s, { value: u, configurable: !0, enumerable: !0, writable: !0 })
                            : (o[s] = u));
                }
                var i, r;
                return o;
            },
            mergeArrays: function (t) {
                return t.flat();
            },
            mergeSets: function (t) {
                return new Set(p(t));
            },
            mergeMaps: function (t) {
                return new Map(p(t));
            },
            mergeOthers: function (t) {
                return t.at(-1);
            },
        };
        function y(...t) {
            return (function (t, e) {
                const n = (function (t, e) {
                    var n, o, i;
                    return {
                        defaultMergeFunctions: g,
                        mergeFunctions: l(
                            {},
                            g,
                            Object.fromEntries(
                                Object.entries(t)
                                    .filter(([t, e]) => Object.hasOwn(g, t))
                                    .map(([t, e]) => (!1 === e ? [t, g.mergeOthers] : [t, e]))
                            )
                        ),
                        metaDataUpdater: null != (n = t.metaDataUpdater) ? n : u,
                        deepmerge: e,
                        useImplicitDefaultMerging: null != (o = t.enableImplicitDefaultMerging) && o,
                        filterValues: !1 === t.filterValues ? void 0 : null != (i = t.filterValues) ? i : f,
                        actions: a,
                    };
                })(t, o);
                function o(...t) {
                    return v(t, n, e);
                }
                return o;
            })({})(...t);
        }
        function v(t, e, n) {
            var o;
            const i = null != (o = null == e.filterValues ? void 0 : e.filterValues(t, n)) ? o : t;
            if (0 === i.length) return;
            if (1 === i.length) return b(i, e, n);
            const r = h(i[0]);
            if (0 !== r && 5 !== r) for (let t = 1; t < i.length; t++) if (h(i[t]) !== r) return b(i, e, n);
            switch (r) {
                case 1:
                    return (function (t, e, n) {
                        const o = e.mergeFunctions.mergeRecords(t, e, n);
                        if (
                            o === a.defaultMerge ||
                            (e.useImplicitDefaultMerging &&
                                void 0 === o &&
                                e.mergeFunctions.mergeRecords !== e.defaultMergeFunctions.mergeRecords)
                        )
                            return e.defaultMergeFunctions.mergeRecords(t, e, n);
                        return o;
                    })(i, e, n);
                case 2:
                    return (function (t, e, n) {
                        const o = e.mergeFunctions.mergeArrays(t, e, n);
                        if (
                            o === a.defaultMerge ||
                            (e.useImplicitDefaultMerging &&
                                void 0 === o &&
                                e.mergeFunctions.mergeArrays !== e.defaultMergeFunctions.mergeArrays)
                        )
                            return e.defaultMergeFunctions.mergeArrays(t);
                        return o;
                    })(i, e, n);
                case 3:
                    return (function (t, e, n) {
                        const o = e.mergeFunctions.mergeSets(t, e, n);
                        if (
                            o === a.defaultMerge ||
                            (e.useImplicitDefaultMerging &&
                                void 0 === o &&
                                e.mergeFunctions.mergeSets !== e.defaultMergeFunctions.mergeSets)
                        )
                            return e.defaultMergeFunctions.mergeSets(t);
                        return o;
                    })(i, e, n);
                case 4:
                    return (function (t, e, n) {
                        const o = e.mergeFunctions.mergeMaps(t, e, n);
                        if (
                            o === a.defaultMerge ||
                            (e.useImplicitDefaultMerging &&
                                void 0 === o &&
                                e.mergeFunctions.mergeMaps !== e.defaultMergeFunctions.mergeMaps)
                        )
                            return e.defaultMergeFunctions.mergeMaps(t);
                        return o;
                    })(i, e, n);
                default:
                    return b(i, e, n);
            }
        }
        function b(t, e, n) {
            const o = e.mergeFunctions.mergeOthers(t, e, n);
            return o === a.defaultMerge ||
                (e.useImplicitDefaultMerging && void 0 === o && e.mergeFunctions.mergeOthers !== e.defaultMergeFunctions.mergeOthers)
                ? e.defaultMergeFunctions.mergeOthers(t)
                : o;
        }
        function x(t) {
            const e = Object.getOwnPropertyNames(t.constructor.prototype);
            for (let n = 0; n < e.length; n++) {
                const o = e[n],
                    i = t[o];
                'constructor' !== o && 'function' == typeof i && (t[o] = i.bind(t));
            }
            return t;
        }
        function w(t) {
            const { event: e, selector: n } = t.options.advanceOn || {};
            if (e) {
                const o = (function (t, e) {
                    return (n) => {
                        if (t.isOpen()) {
                            const o = t.el && n.currentTarget === t.el;
                            ((!r(e) && n.currentTarget.matches(e)) || o) && t.tour.next();
                        }
                    };
                })(t, n);
                let i = null;
                if (!r(n) && ((i = document.querySelector(n)), !i)) return;
                i
                    ? (i.addEventListener(e, o), t.on('destroy', () => i.removeEventListener(e, o)))
                    : (document.body.addEventListener(e, o, !0), t.on('destroy', () => document.body.removeEventListener(e, o, !0)));
            }
        }
        function $(t) {
            return i(t) && '' !== t ? ('-' !== t.charAt(t.length - 1) ? `${t}-` : t) : '';
        }
        function E(t) {
            return null == t || !t.element || !t.on;
        }
        function O() {
            let t = Date.now();
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (e) => {
                const n = (t + 16 * Math.random()) % 16 | 0;
                return ((t = Math.floor(t / 16)), ('x' == e ? n : (3 & n) | 8).toString(16));
            });
        }
        const S = ['start', 'end'],
            T = ['top', 'right', 'bottom', 'left'].reduce((t, e) => t.concat(e, e + '-' + S[0], e + '-' + S[1]), []),
            _ = Math.min,
            A = Math.max,
            I = Math.round,
            P = Math.floor,
            L = (t) => ({ x: t, y: t }),
            M = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' },
            R = { start: 'end', end: 'start' };
        function k(t, e, n) {
            return A(t, _(e, n));
        }
        function C(t, e) {
            return 'function' == typeof t ? t(e) : t;
        }
        function F(t) {
            return t.split('-')[0];
        }
        function D(t) {
            return t.split('-')[1];
        }
        function H(t) {
            return 'x' === t ? 'y' : 'x';
        }
        function j(t) {
            return 'y' === t ? 'height' : 'width';
        }
        function B(t) {
            return ['top', 'bottom'].includes(F(t)) ? 'y' : 'x';
        }
        function V(t) {
            return H(B(t));
        }
        function N(t, e, n) {
            void 0 === n && (n = !1);
            const o = D(t),
                i = V(t),
                r = j(i);
            let s = 'x' === i ? (o === (n ? 'end' : 'start') ? 'right' : 'left') : 'start' === o ? 'bottom' : 'top';
            return (e.reference[r] > e.floating[r] && (s = q(s)), [s, q(s)]);
        }
        function W(t) {
            return t.replace(/start|end/g, (t) => R[t]);
        }
        function q(t) {
            return t.replace(/left|right|bottom|top/g, (t) => M[t]);
        }
        function z(t) {
            return 'number' != typeof t
                ? (function (t) {
                      return l({ top: 0, right: 0, bottom: 0, left: 0 }, t);
                  })(t)
                : { top: t, right: t, bottom: t, left: t };
        }
        function U(t) {
            const { x: e, y: n, width: o, height: i } = t;
            return { width: o, height: i, top: n, left: e, right: e + o, bottom: n + i, x: e, y: n };
        }
        const Y = ['crossAxis', 'alignment', 'allowedPlacements', 'autoAlignment'],
            X = ['mainAxis', 'crossAxis', 'fallbackPlacements', 'fallbackStrategy', 'fallbackAxisSideDirection', 'flipAlignment'],
            Z = ['mainAxis', 'crossAxis', 'limiter'];
        function K(t, e, n) {
            let { reference: o, floating: i } = t;
            const r = B(e),
                s = V(e),
                l = j(s),
                c = F(e),
                a = 'y' === r,
                u = o.x + o.width / 2 - i.width / 2,
                f = o.y + o.height / 2 - i.height / 2,
                d = o[l] / 2 - i[l] / 2;
            let h;
            switch (c) {
                case 'top':
                    h = { x: u, y: o.y - i.height };
                    break;
                case 'bottom':
                    h = { x: u, y: o.y + o.height };
                    break;
                case 'right':
                    h = { x: o.x + o.width, y: f };
                    break;
                case 'left':
                    h = { x: o.x - i.width, y: f };
                    break;
                default:
                    h = { x: o.x, y: o.y };
            }
            switch (D(e)) {
                case 'start':
                    h[s] -= d * (n && a ? -1 : 1);
                    break;
                case 'end':
                    h[s] += d * (n && a ? -1 : 1);
            }
            return h;
        }
        async function G(t, e) {
            var n;
            void 0 === e && (e = {});
            const { x: o, y: i, platform: r, rects: s, elements: l, strategy: c } = t,
                {
                    boundary: a = 'clippingAncestors',
                    rootBoundary: u = 'viewport',
                    elementContext: f = 'floating',
                    altBoundary: d = !1,
                    padding: h = 0,
                } = C(e, t),
                p = z(h),
                m = l[d ? ('floating' === f ? 'reference' : 'floating') : f],
                g = U(
                    await r.getClippingRect({
                        element:
                            null == (n = await (null == r.isElement ? void 0 : r.isElement(m))) || n
                                ? m
                                : m.contextElement || (await (null == r.getDocumentElement ? void 0 : r.getDocumentElement(l.floating))),
                        boundary: a,
                        rootBoundary: u,
                        strategy: c,
                    })
                ),
                y = 'floating' === f ? { x: o, y: i, width: s.floating.width, height: s.floating.height } : s.reference,
                v = await (null == r.getOffsetParent ? void 0 : r.getOffsetParent(l.floating)),
                b = ((await (null == r.isElement ? void 0 : r.isElement(v))) && (await (null == r.getScale ? void 0 : r.getScale(v)))) || {
                    x: 1,
                    y: 1,
                },
                x = U(
                    r.convertOffsetParentRelativeRectToViewportRelativeRect
                        ? await r.convertOffsetParentRelativeRectToViewportRelativeRect({
                              elements: l,
                              rect: y,
                              offsetParent: v,
                              strategy: c,
                          })
                        : y
                );
            return {
                top: (g.top - x.top + p.top) / b.y,
                bottom: (x.bottom - g.bottom + p.bottom) / b.y,
                left: (g.left - x.left + p.left) / b.x,
                right: (x.right - g.right + p.right) / b.x,
            };
        }
        function J(t) {
            return et(t) ? (t.nodeName || '').toLowerCase() : '#document';
        }
        function Q(t) {
            var e;
            return (null == t || null == (e = t.ownerDocument) ? void 0 : e.defaultView) || window;
        }
        function tt(t) {
            var e;
            return null == (e = (et(t) ? t.ownerDocument : t.document) || window.document) ? void 0 : e.documentElement;
        }
        function et(t) {
            return t instanceof Node || t instanceof Q(t).Node;
        }
        function nt(t) {
            return t instanceof Element || t instanceof Q(t).Element;
        }
        function ot(t) {
            return t instanceof HTMLElement || t instanceof Q(t).HTMLElement;
        }
        function it(t) {
            return 'undefined' != typeof ShadowRoot && (t instanceof ShadowRoot || t instanceof Q(t).ShadowRoot);
        }
        function rt(t) {
            const { overflow: e, overflowX: n, overflowY: o, display: i } = ft(t);
            return /auto|scroll|overlay|hidden|clip/.test(e + o + n) && !['inline', 'contents'].includes(i);
        }
        function st(t) {
            return ['table', 'td', 'th'].includes(J(t));
        }
        function lt(t) {
            return [':popover-open', ':modal'].some((e) => {
                try {
                    return t.matches(e);
                } catch (t) {
                    return !1;
                }
            });
        }
        function ct(t) {
            const e = at(),
                n = nt(t) ? ft(t) : t;
            return (
                'none' !== n.transform ||
                'none' !== n.perspective ||
                (!!n.containerType && 'normal' !== n.containerType) ||
                (!e && !!n.backdropFilter && 'none' !== n.backdropFilter) ||
                (!e && !!n.filter && 'none' !== n.filter) ||
                ['transform', 'perspective', 'filter'].some((t) => (n.willChange || '').includes(t)) ||
                ['paint', 'layout', 'strict', 'content'].some((t) => (n.contain || '').includes(t))
            );
        }
        function at() {
            return !('undefined' == typeof CSS || !CSS.supports) && CSS.supports('-webkit-backdrop-filter', 'none');
        }
        function ut(t) {
            return ['html', 'body', '#document'].includes(J(t));
        }
        function ft(t) {
            return Q(t).getComputedStyle(t);
        }
        function dt(t) {
            return nt(t) ? { scrollLeft: t.scrollLeft, scrollTop: t.scrollTop } : { scrollLeft: t.scrollX, scrollTop: t.scrollY };
        }
        function ht(t) {
            if ('html' === J(t)) return t;
            const e = t.assignedSlot || t.parentNode || (it(t) && t.host) || tt(t);
            return it(e) ? e.host : e;
        }
        function pt(t) {
            const e = ht(t);
            return ut(e) ? (t.ownerDocument ? t.ownerDocument.body : t.body) : ot(e) && rt(e) ? e : pt(e);
        }
        function mt(t, e, n) {
            var o;
            (void 0 === e && (e = []), void 0 === n && (n = !0));
            const i = pt(t),
                r = i === (null == (o = t.ownerDocument) ? void 0 : o.body),
                s = Q(i);
            return r
                ? e.concat(s, s.visualViewport || [], rt(i) ? i : [], s.frameElement && n ? mt(s.frameElement) : [])
                : e.concat(i, mt(i, [], n));
        }
        function gt(t) {
            const e = ft(t);
            let n = parseFloat(e.width) || 0,
                o = parseFloat(e.height) || 0;
            const i = ot(t),
                r = i ? t.offsetWidth : n,
                s = i ? t.offsetHeight : o,
                l = I(n) !== r || I(o) !== s;
            return (l && ((n = r), (o = s)), { width: n, height: o, $: l });
        }
        function yt(t) {
            return nt(t) ? t : t.contextElement;
        }
        function vt(t) {
            const e = yt(t);
            if (!ot(e)) return L(1);
            const n = e.getBoundingClientRect(),
                { width: o, height: i, $: r } = gt(e);
            let s = (r ? I(n.width) : n.width) / o,
                l = (r ? I(n.height) : n.height) / i;
            return ((s && Number.isFinite(s)) || (s = 1), (l && Number.isFinite(l)) || (l = 1), { x: s, y: l });
        }
        const bt = L(0);
        function xt(t) {
            const e = Q(t);
            return at() && e.visualViewport ? { x: e.visualViewport.offsetLeft, y: e.visualViewport.offsetTop } : bt;
        }
        function wt(t, e, n, o) {
            (void 0 === e && (e = !1), void 0 === n && (n = !1));
            const i = t.getBoundingClientRect(),
                r = yt(t);
            let s = L(1);
            e && (o ? nt(o) && (s = vt(o)) : (s = vt(t)));
            const l = (function (t, e, n) {
                return (void 0 === e && (e = !1), !(!n || (e && n !== Q(t))) && e);
            })(r, n, o)
                ? xt(r)
                : L(0);
            let c = (i.left + l.x) / s.x,
                a = (i.top + l.y) / s.y,
                u = i.width / s.x,
                f = i.height / s.y;
            if (r) {
                const t = Q(r),
                    e = o && nt(o) ? Q(o) : o;
                let n = t,
                    i = n.frameElement;
                for (; i && o && e !== n; ) {
                    const t = vt(i),
                        e = i.getBoundingClientRect(),
                        o = ft(i),
                        r = e.left + (i.clientLeft + parseFloat(o.paddingLeft)) * t.x,
                        s = e.top + (i.clientTop + parseFloat(o.paddingTop)) * t.y;
                    ((c *= t.x), (a *= t.y), (u *= t.x), (f *= t.y), (c += r), (a += s), (n = Q(i)), (i = n.frameElement));
                }
            }
            return U({ width: u, height: f, x: c, y: a });
        }
        function $t(t) {
            return wt(tt(t)).left + dt(t).scrollLeft;
        }
        function Et(t, e, n) {
            let o;
            if ('viewport' === e)
                o = (function (t, e) {
                    const n = Q(t),
                        o = tt(t),
                        i = n.visualViewport;
                    let r = o.clientWidth,
                        s = o.clientHeight,
                        l = 0,
                        c = 0;
                    if (i) {
                        ((r = i.width), (s = i.height));
                        const t = at();
                        (!t || (t && 'fixed' === e)) && ((l = i.offsetLeft), (c = i.offsetTop));
                    }
                    return { width: r, height: s, x: l, y: c };
                })(t, n);
            else if ('document' === e)
                o = (function (t) {
                    const e = tt(t),
                        n = dt(t),
                        o = t.ownerDocument.body,
                        i = A(e.scrollWidth, e.clientWidth, o.scrollWidth, o.clientWidth),
                        r = A(e.scrollHeight, e.clientHeight, o.scrollHeight, o.clientHeight);
                    let s = -n.scrollLeft + $t(t);
                    const l = -n.scrollTop;
                    return ('rtl' === ft(o).direction && (s += A(e.clientWidth, o.clientWidth) - i), { width: i, height: r, x: s, y: l });
                })(tt(t));
            else if (nt(e))
                o = (function (t, e) {
                    const n = wt(t, !0, 'fixed' === e),
                        o = n.top + t.clientTop,
                        i = n.left + t.clientLeft,
                        r = ot(t) ? vt(t) : L(1);
                    return { width: t.clientWidth * r.x, height: t.clientHeight * r.y, x: i * r.x, y: o * r.y };
                })(e, n);
            else {
                const n = xt(t);
                o = l({}, e, { x: e.x - n.x, y: e.y - n.y });
            }
            return U(o);
        }
        function Ot(t, e) {
            const n = ht(t);
            return !(n === e || !nt(n) || ut(n)) && ('fixed' === ft(n).position || Ot(n, e));
        }
        function St(t, e, n) {
            const o = ot(e),
                i = tt(e),
                r = 'fixed' === n,
                s = wt(t, !0, r, e);
            let l = { scrollLeft: 0, scrollTop: 0 };
            const c = L(0);
            if (o || (!o && !r))
                if ((('body' !== J(e) || rt(i)) && (l = dt(e)), o)) {
                    const t = wt(e, !0, r, e);
                    ((c.x = t.x + e.clientLeft), (c.y = t.y + e.clientTop));
                } else i && (c.x = $t(i));
            return { x: s.left + l.scrollLeft - c.x, y: s.top + l.scrollTop - c.y, width: s.width, height: s.height };
        }
        function Tt(t) {
            return 'static' === ft(t).position;
        }
        function _t(t, e) {
            return ot(t) && 'fixed' !== ft(t).position ? (e ? e(t) : t.offsetParent) : null;
        }
        function At(t, e) {
            const n = Q(t);
            if (lt(t)) return n;
            if (!ot(t)) {
                let e = ht(t);
                for (; e && !ut(e); ) {
                    if (nt(e) && !Tt(e)) return e;
                    e = ht(e);
                }
                return n;
            }
            let o = _t(t, e);
            for (; o && st(o) && Tt(o); ) o = _t(o, e);
            return o && ut(o) && Tt(o) && !ct(o)
                ? n
                : o ||
                      (function (t) {
                          let e = ht(t);
                          for (; ot(e) && !ut(e); ) {
                              if (ct(e)) return e;
                              if (lt(e)) return null;
                              e = ht(e);
                          }
                          return null;
                      })(t) ||
                      n;
        }
        const It = {
            convertOffsetParentRelativeRectToViewportRelativeRect: function (t) {
                let { elements: e, rect: n, offsetParent: o, strategy: i } = t;
                const r = 'fixed' === i,
                    s = tt(o),
                    l = !!e && lt(e.floating);
                if (o === s || (l && r)) return n;
                let c = { scrollLeft: 0, scrollTop: 0 },
                    a = L(1);
                const u = L(0),
                    f = ot(o);
                if ((f || (!f && !r)) && (('body' !== J(o) || rt(s)) && (c = dt(o)), ot(o))) {
                    const t = wt(o);
                    ((a = vt(o)), (u.x = t.x + o.clientLeft), (u.y = t.y + o.clientTop));
                }
                return {
                    width: n.width * a.x,
                    height: n.height * a.y,
                    x: n.x * a.x - c.scrollLeft * a.x + u.x,
                    y: n.y * a.y - c.scrollTop * a.y + u.y,
                };
            },
            getDocumentElement: tt,
            getClippingRect: function (t) {
                let { element: e, boundary: n, rootBoundary: o, strategy: i } = t;
                const r = [
                        ...('clippingAncestors' === n
                            ? lt(e)
                                ? []
                                : (function (t, e) {
                                      const n = e.get(t);
                                      if (n) return n;
                                      let o = mt(t, [], !1).filter((t) => nt(t) && 'body' !== J(t)),
                                          i = null;
                                      const r = 'fixed' === ft(t).position;
                                      let s = r ? ht(t) : t;
                                      for (; nt(s) && !ut(s); ) {
                                          const e = ft(s),
                                              n = ct(s);
                                          (n || 'fixed' !== e.position || (i = null),
                                              (
                                                  r
                                                      ? !n && !i
                                                      : (!n &&
                                                            'static' === e.position &&
                                                            i &&
                                                            ['absolute', 'fixed'].includes(i.position)) ||
                                                        (rt(s) && !n && Ot(t, s))
                                              )
                                                  ? (o = o.filter((t) => t !== s))
                                                  : (i = e),
                                              (s = ht(s)));
                                      }
                                      return (e.set(t, o), o);
                                  })(e, this._c)
                            : [].concat(n)),
                        o,
                    ],
                    s = r[0],
                    l = r.reduce(
                        (t, n) => {
                            const o = Et(e, n, i);
                            return (
                                (t.top = A(o.top, t.top)),
                                (t.right = _(o.right, t.right)),
                                (t.bottom = _(o.bottom, t.bottom)),
                                (t.left = A(o.left, t.left)),
                                t
                            );
                        },
                        Et(e, s, i)
                    );
                return { width: l.right - l.left, height: l.bottom - l.top, x: l.left, y: l.top };
            },
            getOffsetParent: At,
            getElementRects: async function (t) {
                const e = this.getOffsetParent || At,
                    n = this.getDimensions,
                    o = await n(t.floating);
                return {
                    reference: St(t.reference, await e(t.floating), t.strategy),
                    floating: { x: 0, y: 0, width: o.width, height: o.height },
                };
            },
            getClientRects: function (t) {
                return Array.from(t.getClientRects());
            },
            getDimensions: function (t) {
                const { width: e, height: n } = gt(t);
                return { width: e, height: n };
            },
            getScale: vt,
            isElement: nt,
            isRTL: function (t) {
                return 'rtl' === ft(t).direction;
            },
        };
        function Pt(t, e, n, o) {
            void 0 === o && (o = {});
            const {
                    ancestorScroll: i = !0,
                    ancestorResize: r = !0,
                    elementResize: s = 'function' == typeof ResizeObserver,
                    layoutShift: c = 'function' == typeof IntersectionObserver,
                    animationFrame: a = !1,
                } = o,
                u = yt(t),
                f = i || r ? [...(u ? mt(u) : []), ...mt(e)] : [];
            f.forEach((t) => {
                (i && t.addEventListener('scroll', n, { passive: !0 }), r && t.addEventListener('resize', n));
            });
            const d =
                u && c
                    ? (function (t, e) {
                          let n,
                              o = null;
                          const i = tt(t);
                          function r() {
                              var t;
                              (clearTimeout(n), null == (t = o) || t.disconnect(), (o = null));
                          }
                          return (
                              (function s(c, a) {
                                  (void 0 === c && (c = !1), void 0 === a && (a = 1), r());
                                  const { left: u, top: f, width: d, height: h } = t.getBoundingClientRect();
                                  if ((c || e(), !d || !h)) return;
                                  const p = {
                                      rootMargin:
                                          -P(f) +
                                          'px ' +
                                          -P(i.clientWidth - (u + d)) +
                                          'px ' +
                                          -P(i.clientHeight - (f + h)) +
                                          'px ' +
                                          -P(u) +
                                          'px',
                                      threshold: A(0, _(1, a)) || 1,
                                  };
                                  let m = !0;
                                  function g(t) {
                                      const e = t[0].intersectionRatio;
                                      if (e !== a) {
                                          if (!m) return s();
                                          e
                                              ? s(!1, e)
                                              : (n = setTimeout(() => {
                                                    s(!1, 1e-7);
                                                }, 1e3));
                                      }
                                      m = !1;
                                  }
                                  try {
                                      o = new IntersectionObserver(g, l({}, p, { root: i.ownerDocument }));
                                  } catch (t) {
                                      o = new IntersectionObserver(g, p);
                                  }
                                  o.observe(t);
                              })(!0),
                              r
                          );
                      })(u, n)
                    : null;
            let h,
                p = -1,
                m = null;
            s &&
                ((m = new ResizeObserver((t) => {
                    let [o] = t;
                    (o &&
                        o.target === u &&
                        m &&
                        (m.unobserve(e),
                        cancelAnimationFrame(p),
                        (p = requestAnimationFrame(() => {
                            var t;
                            null == (t = m) || t.observe(e);
                        }))),
                        n());
                })),
                u && !a && m.observe(u),
                m.observe(e));
            let g = a ? wt(t) : null;
            return (
                a &&
                    (function e() {
                        const o = wt(t);
                        !g || (o.x === g.x && o.y === g.y && o.width === g.width && o.height === g.height) || n();
                        ((g = o), (h = requestAnimationFrame(e)));
                    })(),
                n(),
                () => {
                    var t;
                    (f.forEach((t) => {
                        (i && t.removeEventListener('scroll', n), r && t.removeEventListener('resize', n));
                    }),
                        null == d || d(),
                        null == (t = m) || t.disconnect(),
                        (m = null),
                        a && cancelAnimationFrame(h));
                }
            );
        }
        const Lt = function (t) {
                return (
                    void 0 === t && (t = {}),
                    {
                        name: 'autoPlacement',
                        options: t,
                        async fn(e) {
                            var n, o, i;
                            const { rects: r, middlewareData: s, placement: l, platform: a, elements: u } = e,
                                f = C(t, e),
                                { crossAxis: d = !1, alignment: h, allowedPlacements: p = T, autoAlignment: m = !0 } = f,
                                g = c(f, Y),
                                y =
                                    void 0 !== h || p === T
                                        ? (function (t, e, n) {
                                              return (
                                                  t
                                                      ? [...n.filter((e) => D(e) === t), ...n.filter((e) => D(e) !== t)]
                                                      : n.filter((t) => F(t) === t)
                                              ).filter((n) => !t || D(n) === t || (!!e && W(n) !== n));
                                          })(h || null, m, p)
                                        : p,
                                v = await G(e, g),
                                b = (null == (n = s.autoPlacement) ? void 0 : n.index) || 0,
                                x = y[b];
                            if (null == x) return {};
                            const w = N(x, r, await (null == a.isRTL ? void 0 : a.isRTL(u.floating)));
                            if (l !== x) return { reset: { placement: y[0] } };
                            const $ = [v[F(x)], v[w[0]], v[w[1]]],
                                E = [...((null == (o = s.autoPlacement) ? void 0 : o.overflows) || []), { placement: x, overflows: $ }],
                                O = y[b + 1];
                            if (O) return { data: { index: b + 1, overflows: E }, reset: { placement: O } };
                            const S = E.map((t) => {
                                    const e = D(t.placement);
                                    return [
                                        t.placement,
                                        e && d ? t.overflows.slice(0, 2).reduce((t, e) => t + e, 0) : t.overflows[0],
                                        t.overflows,
                                    ];
                                }).sort((t, e) => t[1] - e[1]),
                                _ =
                                    (null == (i = S.filter((t) => t[2].slice(0, D(t[0]) ? 2 : 3).every((t) => t <= 0))[0])
                                        ? void 0
                                        : i[0]) || S[0][0];
                            return _ !== l ? { data: { index: b + 1, overflows: E }, reset: { placement: _ } } : {};
                        },
                    }
                );
            },
            Mt = function (t) {
                return (
                    void 0 === t && (t = {}),
                    {
                        name: 'shift',
                        options: t,
                        async fn(e) {
                            const { x: n, y: o, placement: i } = e,
                                r = C(t, e),
                                {
                                    mainAxis: s = !0,
                                    crossAxis: a = !1,
                                    limiter: u = {
                                        fn: (t) => {
                                            let { x: e, y: n } = t;
                                            return { x: e, y: n };
                                        },
                                    },
                                } = r,
                                f = c(r, Z),
                                d = { x: n, y: o },
                                h = await G(e, f),
                                p = B(F(i)),
                                m = H(p);
                            let g = d[m],
                                y = d[p];
                            if (s) {
                                const t = 'y' === m ? 'bottom' : 'right';
                                g = k(g + h['y' === m ? 'top' : 'left'], g, g - h[t]);
                            }
                            if (a) {
                                const t = 'y' === p ? 'bottom' : 'right';
                                y = k(y + h['y' === p ? 'top' : 'left'], y, y - h[t]);
                            }
                            const v = u.fn(l({}, e, { [m]: g, [p]: y }));
                            return l({}, v, { data: { x: v.x - n, y: v.y - o } });
                        },
                    }
                );
            },
            Rt = function (t) {
                return (
                    void 0 === t && (t = {}),
                    {
                        name: 'flip',
                        options: t,
                        async fn(e) {
                            var n, o;
                            const { placement: i, middlewareData: r, rects: s, initialPlacement: l, platform: a, elements: u } = e,
                                f = C(t, e),
                                {
                                    mainAxis: d = !0,
                                    crossAxis: h = !0,
                                    fallbackPlacements: p,
                                    fallbackStrategy: m = 'bestFit',
                                    fallbackAxisSideDirection: g = 'none',
                                    flipAlignment: y = !0,
                                } = f,
                                v = c(f, X);
                            if (null != (n = r.arrow) && n.alignmentOffset) return {};
                            const b = F(i),
                                x = B(l),
                                w = F(l) === l,
                                $ = await (null == a.isRTL ? void 0 : a.isRTL(u.floating)),
                                E =
                                    p ||
                                    (w || !y
                                        ? [q(l)]
                                        : (function (t) {
                                              const e = q(t);
                                              return [W(t), e, W(e)];
                                          })(l)),
                                O = 'none' !== g;
                            !p &&
                                O &&
                                E.push(
                                    ...(function (t, e, n, o) {
                                        const i = D(t);
                                        let r = (function (t, e, n) {
                                            const o = ['left', 'right'],
                                                i = ['right', 'left'],
                                                r = ['top', 'bottom'],
                                                s = ['bottom', 'top'];
                                            switch (t) {
                                                case 'top':
                                                case 'bottom':
                                                    return n ? (e ? i : o) : e ? o : i;
                                                case 'left':
                                                case 'right':
                                                    return e ? r : s;
                                                default:
                                                    return [];
                                            }
                                        })(F(t), 'start' === n, o);
                                        return (i && ((r = r.map((t) => t + '-' + i)), e && (r = r.concat(r.map(W)))), r);
                                    })(l, y, g, $)
                                );
                            const S = [l, ...E],
                                T = await G(e, v),
                                _ = [];
                            let A = (null == (o = r.flip) ? void 0 : o.overflows) || [];
                            if ((d && _.push(T[b]), h)) {
                                const t = N(i, s, $);
                                _.push(T[t[0]], T[t[1]]);
                            }
                            if (((A = [...A, { placement: i, overflows: _ }]), !_.every((t) => t <= 0))) {
                                var I, P;
                                const t = ((null == (I = r.flip) ? void 0 : I.index) || 0) + 1,
                                    e = S[t];
                                if (e) return { data: { index: t, overflows: A }, reset: { placement: e } };
                                let n =
                                    null == (P = A.filter((t) => t.overflows[0] <= 0).sort((t, e) => t.overflows[1] - e.overflows[1])[0])
                                        ? void 0
                                        : P.placement;
                                if (!n)
                                    switch (m) {
                                        case 'bestFit': {
                                            var L;
                                            const t =
                                                null ==
                                                (L = A.filter((t) => {
                                                    if (O) {
                                                        const e = B(t.placement);
                                                        return e === x || 'y' === e;
                                                    }
                                                    return !0;
                                                })
                                                    .map((t) => [t.placement, t.overflows.filter((t) => t > 0).reduce((t, e) => t + e, 0)])
                                                    .sort((t, e) => t[1] - e[1])[0])
                                                    ? void 0
                                                    : L[0];
                                            t && (n = t);
                                            break;
                                        }
                                        case 'initialPlacement':
                                            n = l;
                                    }
                                if (i !== n) return { reset: { placement: n } };
                            }
                            return {};
                        },
                    }
                );
            },
            kt = (t) => ({
                name: 'arrow',
                options: t,
                async fn(e) {
                    const { x: n, y: o, placement: i, rects: r, platform: s, elements: c, middlewareData: a } = e,
                        { element: u, padding: f = 0 } = C(t, e) || {};
                    if (null == u) return {};
                    const d = z(f),
                        h = { x: n, y: o },
                        p = V(i),
                        m = j(p),
                        g = await s.getDimensions(u),
                        y = 'y' === p,
                        v = y ? 'top' : 'left',
                        b = y ? 'bottom' : 'right',
                        x = y ? 'clientHeight' : 'clientWidth',
                        w = r.reference[m] + r.reference[p] - h[p] - r.floating[m],
                        $ = h[p] - r.reference[p],
                        E = await (null == s.getOffsetParent ? void 0 : s.getOffsetParent(u));
                    let O = E ? E[x] : 0;
                    (O && (await (null == s.isElement ? void 0 : s.isElement(E)))) || (O = c.floating[x] || r.floating[m]);
                    const S = w / 2 - $ / 2,
                        T = O / 2 - g[m] / 2 - 1,
                        A = _(d[v], T),
                        I = _(d[b], T),
                        P = A,
                        L = O - g[m] - I,
                        M = O / 2 - g[m] / 2 + S,
                        R = k(P, M, L),
                        F = !a.arrow && null != D(i) && M !== R && r.reference[m] / 2 - (M < P ? A : I) - g[m] / 2 < 0,
                        H = F ? (M < P ? M - P : M - L) : 0;
                    return { [p]: h[p] + H, data: l({ [p]: R, centerOffset: M - R - H }, F && { alignmentOffset: H }), reset: F };
                },
            }),
            Ct = function (t) {
                return (
                    void 0 === t && (t = {}),
                    {
                        options: t,
                        fn(e) {
                            const { x: n, y: o, placement: i, rects: r, middlewareData: s } = e,
                                { offset: c = 0, mainAxis: a = !0, crossAxis: u = !0 } = C(t, e),
                                f = { x: n, y: o },
                                d = B(i),
                                h = H(d);
                            let p = f[h],
                                m = f[d];
                            const g = C(c, e),
                                y = 'number' == typeof g ? { mainAxis: g, crossAxis: 0 } : l({ mainAxis: 0, crossAxis: 0 }, g);
                            if (a) {
                                const t = 'y' === h ? 'height' : 'width',
                                    e = r.reference[h] - r.floating[t] + y.mainAxis,
                                    n = r.reference[h] + r.reference[t] - y.mainAxis;
                                p < e ? (p = e) : p > n && (p = n);
                            }
                            if (u) {
                                var v, b;
                                const t = 'y' === h ? 'width' : 'height',
                                    e = ['top', 'left'].includes(F(i)),
                                    n =
                                        r.reference[d] -
                                        r.floating[t] +
                                        ((e && (null == (v = s.offset) ? void 0 : v[d])) || 0) +
                                        (e ? 0 : y.crossAxis),
                                    o =
                                        r.reference[d] +
                                        r.reference[t] +
                                        (e ? 0 : (null == (b = s.offset) ? void 0 : b[d]) || 0) -
                                        (e ? y.crossAxis : 0);
                                m < n ? (m = n) : m > o && (m = o);
                            }
                            return { [h]: p, [d]: m };
                        },
                    }
                );
            },
            Ft = (t, e, n) => {
                const o = new Map(),
                    i = l({ platform: It }, n),
                    r = l({}, i.platform, { _c: o });
                return (async (t, e, n) => {
                    const { placement: o = 'bottom', strategy: i = 'absolute', middleware: r = [], platform: s } = n,
                        c = r.filter(Boolean),
                        a = await (null == s.isRTL ? void 0 : s.isRTL(e));
                    let u = await s.getElementRects({ reference: t, floating: e, strategy: i }),
                        { x: f, y: d } = K(u, o, a),
                        h = o,
                        p = {},
                        m = 0;
                    for (let n = 0; n < c.length; n++) {
                        const { name: r, fn: g } = c[n],
                            {
                                x: y,
                                y: v,
                                data: b,
                                reset: x,
                            } = await g({
                                x: f,
                                y: d,
                                initialPlacement: o,
                                placement: h,
                                strategy: i,
                                middlewareData: p,
                                rects: u,
                                platform: s,
                                elements: { reference: t, floating: e },
                            });
                        ((f = null != y ? y : f),
                            (d = null != v ? v : d),
                            (p = l({}, p, { [r]: l({}, p[r], b) })),
                            x &&
                                m <= 50 &&
                                (m++,
                                'object' == typeof x &&
                                    (x.placement && (h = x.placement),
                                    x.rects &&
                                        (u =
                                            !0 === x.rects ? await s.getElementRects({ reference: t, floating: e, strategy: i }) : x.rects),
                                    ({ x: f, y: d } = K(u, h, a))),
                                (n = -1)));
                    }
                    return { x: f, y: d, placement: h, strategy: i, middlewareData: p };
                })(t, e, l({}, i, { platform: r }));
            };
        function Dt(t) {
            t.cleanup && t.cleanup();
            const e = t._getResolvedAttachToOptions();
            let o = e.element;
            const i = (function (t, e) {
                    var n, o, i;
                    const r = { strategy: 'absolute', middleware: [] },
                        s = (function (t) {
                            if (t.options.arrow && t.el) return t.el.querySelector('.shepherd-arrow');
                            return !1;
                        })(e),
                        l = E(t),
                        c = null == (n = t.on) ? void 0 : n.includes('auto'),
                        a =
                            (null == t || null == (o = t.on) ? void 0 : o.includes('-start')) ||
                            (null == t || null == (i = t.on) ? void 0 : i.includes('-end'));
                    if (!l) {
                        var u;
                        if (c)
                            r.middleware.push(
                                Lt({ crossAxis: !0, alignment: a ? (null == t || null == (u = t.on) ? void 0 : u.split('-').pop()) : null })
                            );
                        else r.middleware.push(Rt());
                        (r.middleware.push(Mt({ limiter: Ct(), crossAxis: !0 })),
                            s && r.middleware.push(kt({ element: s, padding: a ? 4 : 0 })),
                            c || (r.placement = t.on));
                    }
                    return y(r, e.options.floatingUIOptions || {});
                })(e, t),
                r = E(e);
            if (r) {
                o = document.body;
                t.shepherdElementComponent.getElement().classList.add('shepherd-centered');
            }
            return (
                (t.cleanup = Pt(o, t.el, () => {
                    t.el
                        ? (function (t, e, o, i) {
                              Ft(t, e.el, o)
                                  .then(
                                      (function (t, e) {
                                          return ({ x: o, y: i, placement: r, middlewareData: s }) =>
                                              t.el
                                                  ? (e
                                                        ? Object.assign(t.el.style, {
                                                              position: 'fixed',
                                                              left: '50%',
                                                              top: '50%',
                                                              transform: 'translate(-50%, -50%)',
                                                          })
                                                        : Object.assign(t.el.style, {
                                                              position: 'absolute',
                                                              left: `${o}px`,
                                                              top: `${i}px`,
                                                          }),
                                                    (t.el.dataset.popperPlacement = r),
                                                    (function (t, e) {
                                                        const o = t.querySelector('.shepherd-arrow');
                                                        if (n(o) && e.arrow) {
                                                            const { x: t, y: n } = e.arrow;
                                                            Object.assign(o.style, {
                                                                left: null != t ? `${t}px` : '',
                                                                top: null != n ? `${n}px` : '',
                                                            });
                                                        }
                                                    })(t.el, s),
                                                    t)
                                                  : t;
                                      })(e, i)
                                  )
                                  .then(
                                      (t) =>
                                          new Promise((e) => {
                                              setTimeout(() => e(t), 300);
                                          })
                                  )
                                  .then((t) => {
                                      null != t && t.el && t.el.focus({ preventScroll: !0 });
                                  });
                          })(o, t, i, r)
                        : null == t.cleanup || t.cleanup();
                })),
                (t.target = e.element),
                i
            );
        }
        function Ht() {}
        function jt(t, e) {
            for (const n in e) t[n] = e[n];
            return t;
        }
        function Bt(t) {
            return t();
        }
        function Vt() {
            return Object.create(null);
        }
        function Nt(t) {
            t.forEach(Bt);
        }
        function Wt(t) {
            return 'function' == typeof t;
        }
        function qt(t, e) {
            return t != t ? e == e : t !== e || (t && 'object' == typeof t) || 'function' == typeof t;
        }
        function zt(t, e) {
            t.appendChild(e);
        }
        function Ut(t, e, n) {
            t.insertBefore(e, n || null);
        }
        function Yt(t) {
            t.parentNode && t.parentNode.removeChild(t);
        }
        function Xt(t) {
            return document.createElement(t);
        }
        function Zt(t) {
            return document.createElementNS('http://www.w3.org/2000/svg', t);
        }
        function Kt(t) {
            return document.createTextNode(t);
        }
        function Gt() {
            return Kt(' ');
        }
        function Jt(t, e, n, o) {
            return (t.addEventListener(e, n, o), () => t.removeEventListener(e, n, o));
        }
        function Qt(t, e, n) {
            null == n ? t.removeAttribute(e) : t.getAttribute(e) !== n && t.setAttribute(e, n);
        }
        const te = ['width', 'height'];
        function ee(t, e) {
            const n = Object.getOwnPropertyDescriptors(t.__proto__);
            for (const o in e)
                null == e[o]
                    ? t.removeAttribute(o)
                    : 'style' === o
                      ? (t.style.cssText = e[o])
                      : '__value' === o
                        ? (t.value = t[o] = e[o])
                        : n[o] && n[o].set && -1 === te.indexOf(o)
                          ? (t[o] = e[o])
                          : Qt(t, o, e[o]);
        }
        function ne(t, e, n) {
            t.classList.toggle(e, !!n);
        }
        let oe;
        function ie(t) {
            oe = t;
        }
        function re() {
            if (!oe) throw new Error('Function called outside component initialization');
            return oe;
        }
        function se(t) {
            re().$$.after_update.push(t);
        }
        const le = [],
            ce = [];
        let ae = [];
        const ue = [],
            fe = Promise.resolve();
        let de = !1;
        function he(t) {
            ae.push(t);
        }
        const pe = new Set();
        let me = 0;
        function ge() {
            if (0 !== me) return;
            const t = oe;
            do {
                try {
                    for (; me < le.length; ) {
                        const t = le[me];
                        (me++, ie(t), ye(t.$$));
                    }
                } catch (t) {
                    throw ((le.length = 0), (me = 0), t);
                }
                for (ie(null), le.length = 0, me = 0; ce.length; ) ce.pop()();
                for (let t = 0; t < ae.length; t += 1) {
                    const e = ae[t];
                    pe.has(e) || (pe.add(e), e());
                }
                ae.length = 0;
            } while (le.length);
            for (; ue.length; ) ue.pop()();
            ((de = !1), pe.clear(), ie(t));
        }
        function ye(t) {
            if (null !== t.fragment) {
                (t.update(), Nt(t.before_update));
                const e = t.dirty;
                ((t.dirty = [-1]), t.fragment && t.fragment.p(t.ctx, e), t.after_update.forEach(he));
            }
        }
        const ve = new Set();
        let be;
        function xe() {
            be = { r: 0, c: [], p: be };
        }
        function we() {
            (be.r || Nt(be.c), (be = be.p));
        }
        function $e(t, e) {
            t && t.i && (ve.delete(t), t.i(e));
        }
        function Ee(t, e, n, o) {
            if (t && t.o) {
                if (ve.has(t)) return;
                (ve.add(t),
                    be.c.push(() => {
                        (ve.delete(t), o && (n && t.d(1), o()));
                    }),
                    t.o(e));
            } else o && o();
        }
        function Oe(t) {
            return void 0 !== (null == t ? void 0 : t.length) ? t : Array.from(t);
        }
        function Se(t) {
            t && t.c();
        }
        function Te(t, e, n) {
            const { fragment: o, after_update: i } = t.$$;
            (o && o.m(e, n),
                he(() => {
                    const e = t.$$.on_mount.map(Bt).filter(Wt);
                    (t.$$.on_destroy ? t.$$.on_destroy.push(...e) : Nt(e), (t.$$.on_mount = []));
                }),
                i.forEach(he));
        }
        function _e(t, e) {
            const n = t.$$;
            null !== n.fragment &&
                (!(function (t) {
                    const e = [],
                        n = [];
                    (ae.forEach((o) => (-1 === t.indexOf(o) ? e.push(o) : n.push(o))), n.forEach((t) => t()), (ae = e));
                })(n.after_update),
                Nt(n.on_destroy),
                n.fragment && n.fragment.d(e),
                (n.on_destroy = n.fragment = null),
                (n.ctx = []));
        }
        function Ae(t, e) {
            (-1 === t.$$.dirty[0] && (le.push(t), de || ((de = !0), fe.then(ge)), t.$$.dirty.fill(0)),
                (t.$$.dirty[(e / 31) | 0] |= 1 << e % 31));
        }
        function Ie(t, e, n, o, i, r, s = null, l = [-1]) {
            const c = oe;
            ie(t);
            const a = (t.$$ = {
                fragment: null,
                ctx: [],
                props: r,
                update: Ht,
                not_equal: i,
                bound: Vt(),
                on_mount: [],
                on_destroy: [],
                on_disconnect: [],
                before_update: [],
                after_update: [],
                context: new Map(e.context || (c ? c.$$.context : [])),
                callbacks: Vt(),
                dirty: l,
                skip_bound: !1,
                root: e.target || c.$$.root,
            });
            s && s(a.root);
            let u = !1;
            if (
                ((a.ctx = n
                    ? n(t, e.props || {}, (e, n, ...o) => {
                          const r = o.length ? o[0] : n;
                          return (a.ctx && i(a.ctx[e], (a.ctx[e] = r)) && (!a.skip_bound && a.bound[e] && a.bound[e](r), u && Ae(t, e)), n);
                      })
                    : []),
                a.update(),
                (u = !0),
                Nt(a.before_update),
                (a.fragment = !!o && o(a.ctx)),
                e.target)
            ) {
                if (e.hydrate) {
                    const t = ((f = e.target), Array.from(f.childNodes));
                    (a.fragment && a.fragment.l(t), t.forEach(Yt));
                } else a.fragment && a.fragment.c();
                (e.intro && $e(t.$$.fragment), Te(t, e.target, e.anchor), ge());
            }
            var f;
            ie(c);
        }
        class Pe {
            constructor() {
                ((this.$$ = void 0), (this.$$set = void 0));
            }
            $destroy() {
                (_e(this, 1), (this.$destroy = Ht));
            }
            $on(t, e) {
                if (!Wt(e)) return Ht;
                const n = this.$$.callbacks[t] || (this.$$.callbacks[t] = []);
                return (
                    n.push(e),
                    () => {
                        const t = n.indexOf(e);
                        -1 !== t && n.splice(t, 1);
                    }
                );
            }
            $set(t) {
                var e;
                this.$$set &&
                    ((e = t), 0 !== Object.keys(e).length) &&
                    ((this.$$.skip_bound = !0), this.$$set(t), (this.$$.skip_bound = !1));
            }
        }
        function Le(t) {
            let e, n, o, i, r;
            return {
                c() {
                    ((e = Xt('button')),
                        Qt(e, 'aria-label', (n = t[3] ? t[3] : null)),
                        Qt(e, 'class', (o = `${t[1] || ''} shepherd-button ${t[4] ? 'shepherd-button-secondary' : ''}`)),
                        (e.disabled = t[2]),
                        Qt(e, 'tabindex', '0'),
                        Qt(e, 'type', 'button'));
                },
                m(n, o) {
                    (Ut(n, e, o),
                        (e.innerHTML = t[5]),
                        i ||
                            ((r = Jt(e, 'click', function () {
                                Wt(t[0]) && t[0].apply(this, arguments);
                            })),
                            (i = !0)));
                },
                p(i, [r]) {
                    ((t = i),
                        32 & r && (e.innerHTML = t[5]),
                        8 & r && n !== (n = t[3] ? t[3] : null) && Qt(e, 'aria-label', n),
                        18 & r &&
                            o !== (o = `${t[1] || ''} shepherd-button ${t[4] ? 'shepherd-button-secondary' : ''}`) &&
                            Qt(e, 'class', o),
                        4 & r && (e.disabled = t[2]));
                },
                i: Ht,
                o: Ht,
                d(t) {
                    (t && Yt(e), (i = !1), r());
                },
            };
        }
        function Me(t, e, n) {
            let i,
                r,
                s,
                l,
                c,
                a,
                { config: u, step: f } = e;
            function d(t) {
                return o(t) ? t.call(f) : t;
            }
            return (
                (t.$$set = (t) => {
                    ('config' in t && n(6, (u = t.config)), 'step' in t && n(7, (f = t.step)));
                }),
                (t.$$.update = () => {
                    192 & t.$$.dirty &&
                        (n(0, (i = u.action ? u.action.bind(f.tour) : null)),
                        n(1, (r = u.classes)),
                        n(2, (s = !!u.disabled && d(u.disabled))),
                        n(3, (l = u.label ? d(u.label) : null)),
                        n(4, (c = u.secondary)),
                        n(5, (a = u.text ? d(u.text) : null)));
                }),
                [i, r, s, l, c, a, u, f]
            );
        }
        'undefined' != typeof window && (window.__svelte || (window.__svelte = { v: new Set() })).v.add('4');
        class Re extends Pe {
            constructor(t) {
                (super(), Ie(this, t, Me, Le, qt, { config: 6, step: 7 }));
            }
        }
        function ke(t, e, n) {
            const o = t.slice();
            return ((o[2] = e[n]), o);
        }
        function Ce(t) {
            let e,
                n,
                o = Oe(t[1]),
                i = [];
            for (let e = 0; e < o.length; e += 1) i[e] = Fe(ke(t, o, e));
            const r = (t) =>
                Ee(i[t], 1, 1, () => {
                    i[t] = null;
                });
            return {
                c() {
                    for (let t = 0; t < i.length; t += 1) i[t].c();
                    e = Kt('');
                },
                m(t, o) {
                    for (let e = 0; e < i.length; e += 1) i[e] && i[e].m(t, o);
                    (Ut(t, e, o), (n = !0));
                },
                p(t, n) {
                    if (3 & n) {
                        let s;
                        for (o = Oe(t[1]), s = 0; s < o.length; s += 1) {
                            const r = ke(t, o, s);
                            i[s] ? (i[s].p(r, n), $e(i[s], 1)) : ((i[s] = Fe(r)), i[s].c(), $e(i[s], 1), i[s].m(e.parentNode, e));
                        }
                        for (xe(), s = o.length; s < i.length; s += 1) r(s);
                        we();
                    }
                },
                i(t) {
                    if (!n) {
                        for (let t = 0; t < o.length; t += 1) $e(i[t]);
                        n = !0;
                    }
                },
                o(t) {
                    i = i.filter(Boolean);
                    for (let t = 0; t < i.length; t += 1) Ee(i[t]);
                    n = !1;
                },
                d(t) {
                    (t && Yt(e),
                        (function (t, e) {
                            for (let n = 0; n < t.length; n += 1) t[n] && t[n].d(e);
                        })(i, t));
                },
            };
        }
        function Fe(t) {
            let e, n;
            return (
                (e = new Re({ props: { config: t[2], step: t[0] } })),
                {
                    c() {
                        Se(e.$$.fragment);
                    },
                    m(t, o) {
                        (Te(e, t, o), (n = !0));
                    },
                    p(t, n) {
                        const o = {};
                        (2 & n && (o.config = t[2]), 1 & n && (o.step = t[0]), e.$set(o));
                    },
                    i(t) {
                        n || ($e(e.$$.fragment, t), (n = !0));
                    },
                    o(t) {
                        (Ee(e.$$.fragment, t), (n = !1));
                    },
                    d(t) {
                        _e(e, t);
                    },
                }
            );
        }
        function De(t) {
            let e,
                n,
                o = t[1] && Ce(t);
            return {
                c() {
                    ((e = Xt('footer')), o && o.c(), Qt(e, 'class', 'shepherd-footer'));
                },
                m(t, i) {
                    (Ut(t, e, i), o && o.m(e, null), (n = !0));
                },
                p(t, [n]) {
                    t[1]
                        ? o
                            ? (o.p(t, n), 2 & n && $e(o, 1))
                            : ((o = Ce(t)), o.c(), $e(o, 1), o.m(e, null))
                        : o &&
                          (xe(),
                          Ee(o, 1, 1, () => {
                              o = null;
                          }),
                          we());
                },
                i(t) {
                    n || ($e(o), (n = !0));
                },
                o(t) {
                    (Ee(o), (n = !1));
                },
                d(t) {
                    (t && Yt(e), o && o.d());
                },
            };
        }
        function He(t, e, n) {
            let o,
                { step: i } = e;
            return (
                (t.$$set = (t) => {
                    'step' in t && n(0, (i = t.step));
                }),
                (t.$$.update = () => {
                    1 & t.$$.dirty && n(1, (o = i.options.buttons));
                }),
                [i, o]
            );
        }
        class je extends Pe {
            constructor(t) {
                (super(), Ie(this, t, He, De, qt, { step: 0 }));
            }
        }
        function Be(t) {
            let e, n, o, i, r;
            return {
                c() {
                    ((e = Xt('button')),
                        (n = Xt('span')),
                        (n.textContent = '×'),
                        Qt(n, 'aria-hidden', 'true'),
                        Qt(e, 'aria-label', (o = t[0].label ? t[0].label : 'Close Tour')),
                        Qt(e, 'class', 'shepherd-cancel-icon'),
                        Qt(e, 'type', 'button'));
                },
                m(o, s) {
                    (Ut(o, e, s), zt(e, n), i || ((r = Jt(e, 'click', t[1])), (i = !0)));
                },
                p(t, [n]) {
                    1 & n && o !== (o = t[0].label ? t[0].label : 'Close Tour') && Qt(e, 'aria-label', o);
                },
                i: Ht,
                o: Ht,
                d(t) {
                    (t && Yt(e), (i = !1), r());
                },
            };
        }
        function Ve(t, e, n) {
            let { cancelIcon: o, step: i } = e;
            return (
                (t.$$set = (t) => {
                    ('cancelIcon' in t && n(0, (o = t.cancelIcon)), 'step' in t && n(2, (i = t.step)));
                }),
                [
                    o,
                    (t) => {
                        (t.preventDefault(), i.cancel());
                    },
                    i,
                ]
            );
        }
        class Ne extends Pe {
            constructor(t) {
                (super(), Ie(this, t, Ve, Be, qt, { cancelIcon: 0, step: 2 }));
            }
        }
        function We(t) {
            let e;
            return {
                c() {
                    ((e = Xt('h3')), Qt(e, 'id', t[1]), Qt(e, 'class', 'shepherd-title'));
                },
                m(n, o) {
                    (Ut(n, e, o), t[3](e));
                },
                p(t, [n]) {
                    2 & n && Qt(e, 'id', t[1]);
                },
                i: Ht,
                o: Ht,
                d(n) {
                    (n && Yt(e), t[3](null));
                },
            };
        }
        function qe(t, e, n) {
            let { labelId: i, element: r, title: s } = e;
            return (
                se(() => {
                    (o(s) && n(2, (s = s())), n(0, (r.innerHTML = s), r));
                }),
                (t.$$set = (t) => {
                    ('labelId' in t && n(1, (i = t.labelId)), 'element' in t && n(0, (r = t.element)), 'title' in t && n(2, (s = t.title)));
                }),
                [
                    r,
                    i,
                    s,
                    function (t) {
                        ce[t ? 'unshift' : 'push'](() => {
                            ((r = t), n(0, r));
                        });
                    },
                ]
            );
        }
        class ze extends Pe {
            constructor(t) {
                (super(), Ie(this, t, qe, We, qt, { labelId: 1, element: 0, title: 2 }));
            }
        }
        function Ue(t) {
            let e, n;
            return (
                (e = new ze({ props: { labelId: t[0], title: t[2] } })),
                {
                    c() {
                        Se(e.$$.fragment);
                    },
                    m(t, o) {
                        (Te(e, t, o), (n = !0));
                    },
                    p(t, n) {
                        const o = {};
                        (1 & n && (o.labelId = t[0]), 4 & n && (o.title = t[2]), e.$set(o));
                    },
                    i(t) {
                        n || ($e(e.$$.fragment, t), (n = !0));
                    },
                    o(t) {
                        (Ee(e.$$.fragment, t), (n = !1));
                    },
                    d(t) {
                        _e(e, t);
                    },
                }
            );
        }
        function Ye(t) {
            let e, n;
            return (
                (e = new Ne({ props: { cancelIcon: t[3], step: t[1] } })),
                {
                    c() {
                        Se(e.$$.fragment);
                    },
                    m(t, o) {
                        (Te(e, t, o), (n = !0));
                    },
                    p(t, n) {
                        const o = {};
                        (8 & n && (o.cancelIcon = t[3]), 2 & n && (o.step = t[1]), e.$set(o));
                    },
                    i(t) {
                        n || ($e(e.$$.fragment, t), (n = !0));
                    },
                    o(t) {
                        (Ee(e.$$.fragment, t), (n = !1));
                    },
                    d(t) {
                        _e(e, t);
                    },
                }
            );
        }
        function Xe(t) {
            let e,
                n,
                o,
                i = t[2] && Ue(t),
                r = t[3] && t[3].enabled && Ye(t);
            return {
                c() {
                    ((e = Xt('header')), i && i.c(), (n = Gt()), r && r.c(), Qt(e, 'class', 'shepherd-header'));
                },
                m(t, s) {
                    (Ut(t, e, s), i && i.m(e, null), zt(e, n), r && r.m(e, null), (o = !0));
                },
                p(t, [o]) {
                    (t[2]
                        ? i
                            ? (i.p(t, o), 4 & o && $e(i, 1))
                            : ((i = Ue(t)), i.c(), $e(i, 1), i.m(e, n))
                        : i &&
                          (xe(),
                          Ee(i, 1, 1, () => {
                              i = null;
                          }),
                          we()),
                        t[3] && t[3].enabled
                            ? r
                                ? (r.p(t, o), 8 & o && $e(r, 1))
                                : ((r = Ye(t)), r.c(), $e(r, 1), r.m(e, null))
                            : r &&
                              (xe(),
                              Ee(r, 1, 1, () => {
                                  r = null;
                              }),
                              we()));
                },
                i(t) {
                    o || ($e(i), $e(r), (o = !0));
                },
                o(t) {
                    (Ee(i), Ee(r), (o = !1));
                },
                d(t) {
                    (t && Yt(e), i && i.d(), r && r.d());
                },
            };
        }
        function Ze(t, e, n) {
            let o,
                i,
                { labelId: r, step: s } = e;
            return (
                (t.$$set = (t) => {
                    ('labelId' in t && n(0, (r = t.labelId)), 'step' in t && n(1, (s = t.step)));
                }),
                (t.$$.update = () => {
                    2 & t.$$.dirty && (n(2, (o = s.options.title)), n(3, (i = s.options.cancelIcon)));
                }),
                [r, s, o, i]
            );
        }
        class Ke extends Pe {
            constructor(t) {
                (super(), Ie(this, t, Ze, Xe, qt, { labelId: 0, step: 1 }));
            }
        }
        function Ge(t) {
            let e;
            return {
                c() {
                    ((e = Xt('div')), Qt(e, 'class', 'shepherd-text'), Qt(e, 'id', t[1]));
                },
                m(n, o) {
                    (Ut(n, e, o), t[3](e));
                },
                p(t, [n]) {
                    2 & n && Qt(e, 'id', t[1]);
                },
                i: Ht,
                o: Ht,
                d(n) {
                    (n && Yt(e), t[3](null));
                },
            };
        }
        function Je(t, e, i) {
            let { descriptionId: r, element: s, step: l } = e;
            return (
                se(() => {
                    let { text: t } = l.options;
                    (o(t) && (t = t.call(l)), n(t) ? s.appendChild(t) : i(0, (s.innerHTML = t), s));
                }),
                (t.$$set = (t) => {
                    ('descriptionId' in t && i(1, (r = t.descriptionId)),
                        'element' in t && i(0, (s = t.element)),
                        'step' in t && i(2, (l = t.step)));
                }),
                [
                    s,
                    r,
                    l,
                    function (t) {
                        ce[t ? 'unshift' : 'push'](() => {
                            ((s = t), i(0, s));
                        });
                    },
                ]
            );
        }
        class Qe extends Pe {
            constructor(t) {
                (super(), Ie(this, t, Je, Ge, qt, { descriptionId: 1, element: 0, step: 2 }));
            }
        }
        function tn(t) {
            let e, n;
            return (
                (e = new Ke({ props: { labelId: t[1], step: t[2] } })),
                {
                    c() {
                        Se(e.$$.fragment);
                    },
                    m(t, o) {
                        (Te(e, t, o), (n = !0));
                    },
                    p(t, n) {
                        const o = {};
                        (2 & n && (o.labelId = t[1]), 4 & n && (o.step = t[2]), e.$set(o));
                    },
                    i(t) {
                        n || ($e(e.$$.fragment, t), (n = !0));
                    },
                    o(t) {
                        (Ee(e.$$.fragment, t), (n = !1));
                    },
                    d(t) {
                        _e(e, t);
                    },
                }
            );
        }
        function en(t) {
            let e, n;
            return (
                (e = new Qe({ props: { descriptionId: t[0], step: t[2] } })),
                {
                    c() {
                        Se(e.$$.fragment);
                    },
                    m(t, o) {
                        (Te(e, t, o), (n = !0));
                    },
                    p(t, n) {
                        const o = {};
                        (1 & n && (o.descriptionId = t[0]), 4 & n && (o.step = t[2]), e.$set(o));
                    },
                    i(t) {
                        n || ($e(e.$$.fragment, t), (n = !0));
                    },
                    o(t) {
                        (Ee(e.$$.fragment, t), (n = !1));
                    },
                    d(t) {
                        _e(e, t);
                    },
                }
            );
        }
        function nn(t) {
            let e, n;
            return (
                (e = new je({ props: { step: t[2] } })),
                {
                    c() {
                        Se(e.$$.fragment);
                    },
                    m(t, o) {
                        (Te(e, t, o), (n = !0));
                    },
                    p(t, n) {
                        const o = {};
                        (4 & n && (o.step = t[2]), e.$set(o));
                    },
                    i(t) {
                        n || ($e(e.$$.fragment, t), (n = !0));
                    },
                    o(t) {
                        (Ee(e.$$.fragment, t), (n = !1));
                    },
                    d(t) {
                        _e(e, t);
                    },
                }
            );
        }
        function on(t) {
            let e,
                n,
                o,
                i,
                s = !r(t[2].options.title) || (t[2].options.cancelIcon && t[2].options.cancelIcon.enabled),
                l = !r(t[2].options.text),
                c = Array.isArray(t[2].options.buttons) && t[2].options.buttons.length,
                a = s && tn(t),
                u = l && en(t),
                f = c && nn(t);
            return {
                c() {
                    ((e = Xt('div')),
                        a && a.c(),
                        (n = Gt()),
                        u && u.c(),
                        (o = Gt()),
                        f && f.c(),
                        Qt(e, 'class', 'shepherd-content'),
                        Qt(e, 'tabindex', '0'));
                },
                m(t, r) {
                    (Ut(t, e, r), a && a.m(e, null), zt(e, n), u && u.m(e, null), zt(e, o), f && f.m(e, null), (i = !0));
                },
                p(t, [i]) {
                    (4 & i && (s = !r(t[2].options.title) || (t[2].options.cancelIcon && t[2].options.cancelIcon.enabled)),
                        s
                            ? a
                                ? (a.p(t, i), 4 & i && $e(a, 1))
                                : ((a = tn(t)), a.c(), $e(a, 1), a.m(e, n))
                            : a &&
                              (xe(),
                              Ee(a, 1, 1, () => {
                                  a = null;
                              }),
                              we()),
                        4 & i && (l = !r(t[2].options.text)),
                        l
                            ? u
                                ? (u.p(t, i), 4 & i && $e(u, 1))
                                : ((u = en(t)), u.c(), $e(u, 1), u.m(e, o))
                            : u &&
                              (xe(),
                              Ee(u, 1, 1, () => {
                                  u = null;
                              }),
                              we()),
                        4 & i && (c = Array.isArray(t[2].options.buttons) && t[2].options.buttons.length),
                        c
                            ? f
                                ? (f.p(t, i), 4 & i && $e(f, 1))
                                : ((f = nn(t)), f.c(), $e(f, 1), f.m(e, null))
                            : f &&
                              (xe(),
                              Ee(f, 1, 1, () => {
                                  f = null;
                              }),
                              we()));
                },
                i(t) {
                    i || ($e(a), $e(u), $e(f), (i = !0));
                },
                o(t) {
                    (Ee(a), Ee(u), Ee(f), (i = !1));
                },
                d(t) {
                    (t && Yt(e), a && a.d(), u && u.d(), f && f.d());
                },
            };
        }
        function rn(t, e, n) {
            let { descriptionId: o, labelId: i, step: r } = e;
            return (
                (t.$$set = (t) => {
                    ('descriptionId' in t && n(0, (o = t.descriptionId)),
                        'labelId' in t && n(1, (i = t.labelId)),
                        'step' in t && n(2, (r = t.step)));
                }),
                [o, i, r]
            );
        }
        class sn extends Pe {
            constructor(t) {
                (super(), Ie(this, t, rn, on, qt, { descriptionId: 0, labelId: 1, step: 2 }));
            }
        }
        function ln(t) {
            let e;
            return {
                c() {
                    ((e = Xt('div')), Qt(e, 'class', 'shepherd-arrow'), Qt(e, 'data-popper-arrow', ''));
                },
                m(t, n) {
                    Ut(t, e, n);
                },
                d(t) {
                    t && Yt(e);
                },
            };
        }
        function cn(t) {
            let e,
                n,
                o,
                i,
                s,
                l,
                c,
                a,
                u = t[4].options.arrow && t[4].options.attachTo && t[4].options.attachTo.element && t[4].options.attachTo.on && ln();
            o = new sn({ props: { descriptionId: t[2], labelId: t[3], step: t[4] } });
            let f = [
                    { 'aria-describedby': (i = r(t[4].options.text) ? null : t[2]) },
                    { 'aria-labelledby': (s = t[4].options.title ? t[3] : null) },
                    t[1],
                    { open: 'true' },
                ],
                d = {};
            for (let t = 0; t < f.length; t += 1) d = jt(d, f[t]);
            return {
                c() {
                    ((e = Xt('dialog')),
                        u && u.c(),
                        (n = Gt()),
                        Se(o.$$.fragment),
                        ee(e, d),
                        ne(e, 'shepherd-has-cancel-icon', t[5]),
                        ne(e, 'shepherd-has-title', t[6]),
                        ne(e, 'shepherd-element', !0));
                },
                m(i, r) {
                    (Ut(i, e, r),
                        u && u.m(e, null),
                        zt(e, n),
                        Te(o, e, null),
                        t[13](e),
                        (l = !0),
                        c || ((a = Jt(e, 'keydown', t[7])), (c = !0)));
                },
                p(t, [c]) {
                    t[4].options.arrow && t[4].options.attachTo && t[4].options.attachTo.element && t[4].options.attachTo.on
                        ? u || ((u = ln()), u.c(), u.m(e, n))
                        : u && (u.d(1), (u = null));
                    const a = {};
                    (4 & c && (a.descriptionId = t[2]),
                        8 & c && (a.labelId = t[3]),
                        16 & c && (a.step = t[4]),
                        o.$set(a),
                        ee(
                            e,
                            (d = (function (t, e) {
                                const n = {},
                                    o = {},
                                    i = { $$scope: 1 };
                                let r = t.length;
                                for (; r--; ) {
                                    const s = t[r],
                                        l = e[r];
                                    if (l) {
                                        for (const t in s) t in l || (o[t] = 1);
                                        for (const t in l) i[t] || ((n[t] = l[t]), (i[t] = 1));
                                        t[r] = l;
                                    } else for (const t in s) i[t] = 1;
                                }
                                for (const t in o) t in n || (n[t] = void 0);
                                return n;
                            })(f, [
                                (!l || (20 & c && i !== (i = r(t[4].options.text) ? null : t[2]))) && { 'aria-describedby': i },
                                (!l || (24 & c && s !== (s = t[4].options.title ? t[3] : null))) && { 'aria-labelledby': s },
                                2 & c && t[1],
                                { open: 'true' },
                            ]))
                        ),
                        ne(e, 'shepherd-has-cancel-icon', t[5]),
                        ne(e, 'shepherd-has-title', t[6]),
                        ne(e, 'shepherd-element', !0));
                },
                i(t) {
                    l || ($e(o.$$.fragment, t), (l = !0));
                },
                o(t) {
                    (Ee(o.$$.fragment, t), (l = !1));
                },
                d(n) {
                    (n && Yt(e), u && u.d(), _e(o), t[13](null), (c = !1), a());
                },
            };
        }
        function an(t) {
            return t.split(' ').filter((t) => !!t.length);
        }
        function un(t, e, n) {
            let o,
                r,
                s,
                {
                    classPrefix: l,
                    element: c,
                    descriptionId: a,
                    firstFocusableElement: u,
                    focusableElements: f,
                    labelId: d,
                    lastFocusableElement: h,
                    step: p,
                    dataStepId: m,
                } = e;
            var g;
            ((g = () => {
                (n(1, (m = { [`data-${l}shepherd-step-id`]: p.id })),
                    n(
                        9,
                        (f = c.querySelectorAll(
                            'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
                        ))
                    ),
                    n(8, (u = f[0])),
                    n(10, (h = f[f.length - 1])));
            }),
                re().$$.on_mount.push(g),
                se(() => {
                    s !== p.options.classes &&
                        ((function (t) {
                            if (i(t)) {
                                const e = an(t);
                                e.length && c.classList.remove(...e);
                            }
                        })(s),
                        (s = p.options.classes),
                        (function (t) {
                            if (i(t)) {
                                const e = an(t);
                                e.length && c.classList.add(...e);
                            }
                        })(s));
                }));
            return (
                (t.$$set = (t) => {
                    ('classPrefix' in t && n(11, (l = t.classPrefix)),
                        'element' in t && n(0, (c = t.element)),
                        'descriptionId' in t && n(2, (a = t.descriptionId)),
                        'firstFocusableElement' in t && n(8, (u = t.firstFocusableElement)),
                        'focusableElements' in t && n(9, (f = t.focusableElements)),
                        'labelId' in t && n(3, (d = t.labelId)),
                        'lastFocusableElement' in t && n(10, (h = t.lastFocusableElement)),
                        'step' in t && n(4, (p = t.step)),
                        'dataStepId' in t && n(1, (m = t.dataStepId)));
                }),
                (t.$$.update = () => {
                    16 & t.$$.dirty &&
                        (n(5, (o = p.options && p.options.cancelIcon && p.options.cancelIcon.enabled)),
                        n(6, (r = p.options && p.options.title)));
                }),
                [
                    c,
                    m,
                    a,
                    d,
                    p,
                    o,
                    r,
                    (t) => {
                        const { tour: e } = p;
                        switch (t.keyCode) {
                            case 9:
                                if (0 === f.length) {
                                    t.preventDefault();
                                    break;
                                }
                                t.shiftKey
                                    ? (document.activeElement === u || document.activeElement.classList.contains('shepherd-element')) &&
                                      (t.preventDefault(), h.focus())
                                    : document.activeElement === h && (t.preventDefault(), u.focus());
                                break;
                            case 27:
                                e.options.exitOnEsc && (t.preventDefault(), t.stopPropagation(), p.cancel());
                                break;
                            case 37:
                                e.options.keyboardNavigation && (t.preventDefault(), t.stopPropagation(), e.back());
                                break;
                            case 39:
                                e.options.keyboardNavigation && (t.preventDefault(), t.stopPropagation(), e.next());
                        }
                    },
                    u,
                    f,
                    h,
                    l,
                    () => c,
                    function (t) {
                        ce[t ? 'unshift' : 'push'](() => {
                            ((c = t), n(0, c));
                        });
                    },
                ]
            );
        }
        class fn extends Pe {
            constructor(t) {
                (super(),
                    Ie(this, t, un, cn, qt, {
                        classPrefix: 11,
                        element: 0,
                        descriptionId: 2,
                        firstFocusableElement: 8,
                        focusableElements: 9,
                        labelId: 3,
                        lastFocusableElement: 10,
                        step: 4,
                        dataStepId: 1,
                        getElement: 12,
                    }));
            }
            get getElement() {
                return this.$$.ctx[12];
            }
        }
        class dn extends s {
            constructor(t, e = {}) {
                return (
                    super(),
                    (this._resolvedAttachTo = void 0),
                    (this._resolvedExtraHighlightElements = void 0),
                    (this.classPrefix = void 0),
                    (this.el = void 0),
                    (this.target = void 0),
                    (this.tour = void 0),
                    (this.tour = t),
                    (this.classPrefix = this.tour.options ? $(this.tour.options.classPrefix) : ''),
                    (this.styles = t.styles),
                    (this._resolvedAttachTo = null),
                    x(this),
                    this._setOptions(e),
                    this
                );
            }
            cancel() {
                (this.tour.cancel(), this.trigger('cancel'));
            }
            complete() {
                (this.tour.complete(), this.trigger('complete'));
            }
            destroy() {
                var t;
                ((t = this).cleanup && t.cleanup(),
                    (t.cleanup = null),
                    n(this.el) && (this.el.remove(), (this.el = null)),
                    this._updateStepTargetOnHide(),
                    this.trigger('destroy'));
            }
            getTour() {
                return this.tour;
            }
            hide() {
                var t;
                (null == (t = this.tour.modal) || t.hide(),
                    this.trigger('before-hide'),
                    this.el && (this.el.hidden = !0),
                    this._updateStepTargetOnHide(),
                    this.trigger('hide'));
            }
            _resolveExtraHiglightElements() {
                var t;
                return (
                    (this._resolvedExtraHighlightElements = (t = this).options.extraHighlights
                        ? t.options.extraHighlights.flatMap((t) => Array.from(document.querySelectorAll(t)))
                        : []),
                    this._resolvedExtraHighlightElements
                );
            }
            _resolveAttachToOptions() {
                return (
                    (this._resolvedAttachTo = (function (t) {
                        const e = t.options.attachTo || {},
                            n = Object.assign({}, e);
                        if ((o(n.element) && (n.element = n.element.call(t)), i(n.element))) {
                            try {
                                n.element = document.querySelector(n.element);
                            } catch (t) {}
                            n.element;
                        }
                        return n;
                    })(this)),
                    this._resolvedAttachTo
                );
            }
            _getResolvedAttachToOptions() {
                return null === this._resolvedAttachTo ? this._resolveAttachToOptions() : this._resolvedAttachTo;
            }
            isOpen() {
                return Boolean(this.el && !this.el.hidden);
            }
            show() {
                return o(this.options.beforeShowPromise)
                    ? Promise.resolve(this.options.beforeShowPromise()).then(() => this._show())
                    : Promise.resolve(this._show());
            }
            updateStepOptions(t) {
                (Object.assign(this.options, t), this.shepherdElementComponent && this.shepherdElementComponent.$set({ step: this }));
            }
            getElement() {
                return this.el;
            }
            getTarget() {
                return this.target;
            }
            _createTooltipContent() {
                const t = `${this.id}-description`,
                    e = `${this.id}-label`;
                return (
                    (this.shepherdElementComponent = new fn({
                        target: this.tour.options.stepsContainer || document.body,
                        props: { classPrefix: this.classPrefix, descriptionId: t, labelId: e, step: this, styles: this.styles },
                    })),
                    this.shepherdElementComponent.getElement()
                );
            }
            _scrollTo(t) {
                const { element: e } = this._getResolvedAttachToOptions();
                o(this.options.scrollToHandler)
                    ? this.options.scrollToHandler(e)
                    : e instanceof Element && 'function' == typeof e.scrollIntoView && e.scrollIntoView(t);
            }
            _getClassOptions(t) {
                const e = this.tour && this.tour.options && this.tour.options.defaultStepOptions,
                    n = t.classes ? t.classes : '',
                    o = e && e.classes ? e.classes : '',
                    i = [...n.split(' '), ...o.split(' ')],
                    r = new Set(i);
                return Array.from(r).join(' ').trim();
            }
            _setOptions(t = {}) {
                let e = this.tour && this.tour.options && this.tour.options.defaultStepOptions;
                ((e = y({}, e || {})),
                    (this.options = Object.assign(
                        { arrow: !0 },
                        e,
                        t,
                        (function (t, e) {
                            return { floatingUIOptions: y(t.floatingUIOptions || {}, e.floatingUIOptions || {}) };
                        })(e, t)
                    )));
                const { when: n } = this.options;
                ((this.options.classes = this._getClassOptions(t)),
                    this.destroy(),
                    (this.id = this.options.id || `step-${O()}`),
                    n &&
                        Object.keys(n).forEach((t) => {
                            this.on(t, n[t], this);
                        }));
            }
            _setupElements() {
                (r(this.el) || this.destroy(), (this.el = this._createTooltipContent()), this.options.advanceOn && w(this), Dt(this));
            }
            _show() {
                var t;
                (this.trigger('before-show'),
                    this._resolveAttachToOptions(),
                    this._resolveExtraHiglightElements(),
                    this._setupElements(),
                    this.tour.modal || this.tour.setupModal(),
                    null == (t = this.tour.modal) || t.setupForStep(this),
                    this._styleTargetElementForStep(this),
                    this.el && (this.el.hidden = !1),
                    this.options.scrollTo &&
                        setTimeout(() => {
                            this._scrollTo(this.options.scrollTo);
                        }),
                    this.el && (this.el.hidden = !1));
                const e = this.shepherdElementComponent.getElement(),
                    n = this.target || document.body,
                    o = this._resolvedExtraHighlightElements;
                (n.classList.add(`${this.classPrefix}shepherd-enabled`),
                    n.classList.add(`${this.classPrefix}shepherd-target`),
                    e.classList.add('shepherd-enabled'),
                    null == o ||
                        o.forEach((t) => {
                            (t.classList.add(`${this.classPrefix}shepherd-enabled`), t.classList.add(`${this.classPrefix}shepherd-target`));
                        }),
                    this.trigger('show'));
            }
            _styleTargetElementForStep(t) {
                const e = t.target,
                    n = t._resolvedExtraHighlightElements;
                if (!e) return;
                const o = t.options.highlightClass;
                (o && (e.classList.add(o), null == n || n.forEach((t) => t.classList.add(o))),
                    e.classList.remove('shepherd-target-click-disabled'),
                    null == n || n.forEach((t) => t.classList.remove('shepherd-target-click-disabled')),
                    !1 === t.options.canClickTarget &&
                        (e.classList.add('shepherd-target-click-disabled'),
                        null == n || n.forEach((t) => t.classList.add('shepherd-target-click-disabled'))));
            }
            _updateStepTargetOnHide() {
                const t = this.target || document.body,
                    e = this._resolvedExtraHighlightElements,
                    n = this.options.highlightClass;
                (n && (t.classList.remove(n), null == e || e.forEach((t) => t.classList.remove(n))),
                    t.classList.remove(
                        'shepherd-target-click-disabled',
                        `${this.classPrefix}shepherd-enabled`,
                        `${this.classPrefix}shepherd-target`
                    ),
                    null == e ||
                        e.forEach((t) => {
                            t.classList.remove(
                                'shepherd-target-click-disabled',
                                `${this.classPrefix}shepherd-enabled`,
                                `${this.classPrefix}shepherd-target`
                            );
                        }));
            }
        }
        function hn(t) {
            let e, n, o, i, r;
            return {
                c() {
                    ((e = Zt('svg')),
                        (n = Zt('path')),
                        Qt(n, 'd', t[2]),
                        Qt(e, 'class', (o = (t[1] ? 'shepherd-modal-is-visible' : '') + ' shepherd-modal-overlay-container')));
                },
                m(o, s) {
                    (Ut(o, e, s), zt(e, n), t[11](e), i || ((r = Jt(e, 'touchmove', t[3])), (i = !0)));
                },
                p(t, [i]) {
                    (4 & i && Qt(n, 'd', t[2]),
                        2 & i &&
                            o !== (o = (t[1] ? 'shepherd-modal-is-visible' : '') + ' shepherd-modal-overlay-container') &&
                            Qt(e, 'class', o));
                },
                i: Ht,
                o: Ht,
                d(n) {
                    (n && Yt(e), t[11](null), (i = !1), r());
                },
            };
        }
        function pn(t) {
            if (!t) return null;
            const e = t instanceof HTMLElement && window.getComputedStyle(t).overflowY;
            return 'hidden' !== e && 'visible' !== e && t.scrollHeight >= t.clientHeight ? t : pn(t.parentElement);
        }
        function mn(t, e) {
            const n = t.getBoundingClientRect();
            let o = n.y || n.top,
                i = n.bottom || o + n.height;
            if (e) {
                const t = e.getBoundingClientRect(),
                    n = t.y || t.top,
                    r = t.bottom || n + t.height;
                ((o = Math.max(o, n)), (i = Math.min(i, r)));
            }
            return { y: o, height: Math.max(i - o, 0) };
        }
        function gn(t, e, n) {
            let o,
                i,
                { element: r, openingProperties: s } = e,
                l = !1;
            c();
            function c() {
                n(4, (s = [{ width: 0, height: 0, x: 0, y: 0, r: 0 }]));
            }
            function a() {
                (n(1, (l = !1)), h());
            }
            function u(t = 0, e = 0, o = 0, i = 0, r, l, a) {
                if (l) {
                    const c = [l, ...(a || [])];
                    n(4, (s = []));
                    for (const n of c) {
                        if (!n) continue;
                        if (c.indexOf(n) !== c.lastIndexOf(n)) continue;
                        const { y: l, height: a } = mn(n, r),
                            { x: u, width: f, left: d } = n.getBoundingClientRect();
                        c.some((t) => {
                            if (t === n) return !1;
                            const e = t.getBoundingClientRect();
                            return u >= e.left && u + f <= e.right && l >= e.top && l + a <= e.bottom;
                        }) || s.push({ width: f + 2 * t, height: a + 2 * t, x: (u || d) + o - t, y: l + i - t, r: e });
                    }
                } else c();
            }
            function f() {
                n(1, (l = !0));
            }
            const d = (t) => {
                t.preventDefault();
            };
            function h() {
                (o && (cancelAnimationFrame(o), (o = void 0)), window.removeEventListener('touchmove', d, { passive: !1 }));
            }
            return (
                (t.$$set = (t) => {
                    ('element' in t && n(0, (r = t.element)), 'openingProperties' in t && n(4, (s = t.openingProperties)));
                }),
                (t.$$.update = () => {
                    16 & t.$$.dirty &&
                        n(
                            2,
                            (i = (function (t) {
                                let e = '';
                                const { innerWidth: n, innerHeight: o } = window;
                                return (
                                    t.forEach((t) => {
                                        const { width: n, height: o, x: i = 0, y: r = 0, r: s = 0 } = t,
                                            {
                                                topLeft: l = 0,
                                                topRight: c = 0,
                                                bottomRight: a = 0,
                                                bottomLeft: u = 0,
                                            } = 'number' == typeof s ? { topLeft: s, topRight: s, bottomRight: s, bottomLeft: s } : s;
                                        e += `M${i + l},${r}      a${l},${l},0,0,0-${l},${l}      V${o + r - u}      a${u},${u},0,0,0,${u},${u}      H${n + i - a}      a${a},${a},0,0,0,${a}-${a}      V${r + c}      a${c},${c},0,0,0-${c}-${c}      Z`;
                                    }),
                                    `M${n},${o}          H0          V0          H${n}          V${o}          Z          ${e}`.replace(
                                        /\s/g,
                                        ''
                                    )
                                );
                            })(s))
                        );
                }),
                [
                    r,
                    l,
                    i,
                    (t) => {
                        t.stopPropagation();
                    },
                    s,
                    () => r,
                    c,
                    a,
                    u,
                    function (t) {
                        (h(),
                            t.tour.options.useModalOverlay
                                ? (!(function (t) {
                                      const {
                                              modalOverlayOpeningPadding: e,
                                              modalOverlayOpeningRadius: n,
                                              modalOverlayOpeningXOffset: i = 0,
                                              modalOverlayOpeningYOffset: r = 0,
                                          } = t.options,
                                          s = (function (t) {
                                              let e = { top: 0, left: 0 };
                                              if (!t) return e;
                                              let n = t.ownerDocument.defaultView;
                                              for (; n !== window.top; ) {
                                                  var o;
                                                  const t = null == (o = n) ? void 0 : o.frameElement;
                                                  if (t) {
                                                      var i, r;
                                                      const n = t.getBoundingClientRect();
                                                      ((e.top += n.top + (null != (i = n.scrollTop) ? i : 0)),
                                                          (e.left += n.left + (null != (r = n.scrollLeft) ? r : 0)));
                                                  }
                                                  n = n.parent;
                                              }
                                              return e;
                                          })(t.target),
                                          l = pn(t.target),
                                          c = () => {
                                              ((o = void 0),
                                                  u(e, n, i + s.left, r + s.top, l, t.target, t._resolvedExtraHighlightElements),
                                                  (o = requestAnimationFrame(c)));
                                          };
                                      (c(), window.addEventListener('touchmove', d, { passive: !1 }));
                                  })(t),
                                  f())
                                : a());
                    },
                    f,
                    function (t) {
                        ce[t ? 'unshift' : 'push'](() => {
                            ((r = t), n(0, r));
                        });
                    },
                ]
            );
        }
        class yn extends Pe {
            constructor(t) {
                (super(),
                    Ie(this, t, gn, hn, qt, {
                        element: 0,
                        openingProperties: 4,
                        getElement: 5,
                        closeModalOpening: 6,
                        hide: 7,
                        positionModal: 8,
                        setupForStep: 9,
                        show: 10,
                    }));
            }
            get getElement() {
                return this.$$.ctx[5];
            }
            get closeModalOpening() {
                return this.$$.ctx[6];
            }
            get hide() {
                return this.$$.ctx[7];
            }
            get positionModal() {
                return this.$$.ctx[8];
            }
            get setupForStep() {
                return this.$$.ctx[9];
            }
            get show() {
                return this.$$.ctx[10];
            }
        }
        const vn = new (class extends s {
                constructor() {
                    (super(), (this.activeTour = void 0), x(this));
                }
            })(),
            bn = 'undefined' == typeof window;
        ((vn.Step = bn
            ? class {
                  constructor(t) {}
              }
            : dn),
            (vn.Tour = bn
                ? class {
                      constructor(t, e) {}
                  }
                : class extends s {
                      constructor(t = {}) {
                          (super(),
                              (this.trackedEvents = ['active', 'cancel', 'complete', 'show']),
                              (this.classPrefix = void 0),
                              (this.currentStep = void 0),
                              (this.focusedElBeforeOpen = void 0),
                              (this.id = void 0),
                              (this.modal = void 0),
                              (this.options = void 0),
                              (this.steps = void 0),
                              x(this));
                          ((this.options = Object.assign({}, { exitOnEsc: !0, keyboardNavigation: !0 }, t)),
                              (this.classPrefix = $(this.options.classPrefix)),
                              (this.steps = []),
                              this.addSteps(this.options.steps));
                          return (
                              ['active', 'cancel', 'complete', 'inactive', 'show', 'start'].map((t) => {
                                  ((t) => {
                                      this.on(t, (e) => {
                                          (((e = e || {}).tour = this), vn.trigger(t, e));
                                      });
                                  })(t);
                              }),
                              this._setTourID(t.id),
                              this
                          );
                      }
                      addStep(t, e) {
                          let n = t;
                          return (
                              n instanceof dn ? (n.tour = this) : (n = new dn(this, n)),
                              r(e) ? this.steps.push(n) : this.steps.splice(e, 0, n),
                              n
                          );
                      }
                      addSteps(t) {
                          return (
                              Array.isArray(t) &&
                                  t.forEach((t) => {
                                      this.addStep(t);
                                  }),
                              this
                          );
                      }
                      back() {
                          const t = this.steps.indexOf(this.currentStep);
                          this.show(t - 1, !1);
                      }
                      async cancel() {
                          if (this.options.confirmCancel) {
                              const t = this.options.confirmCancelMessage || 'Are you sure you want to stop the tour?';
                              let e;
                              ((e = o(this.options.confirmCancel) ? await this.options.confirmCancel() : window.confirm(t)),
                                  e && this._done('cancel'));
                          } else this._done('cancel');
                      }
                      complete() {
                          this._done('complete');
                      }
                      getById(t) {
                          return this.steps.find((e) => e.id === t);
                      }
                      getCurrentStep() {
                          return this.currentStep;
                      }
                      hide() {
                          const t = this.getCurrentStep();
                          if (t) return t.hide();
                      }
                      isActive() {
                          return vn.activeTour === this;
                      }
                      next() {
                          const t = this.steps.indexOf(this.currentStep);
                          t === this.steps.length - 1 ? this.complete() : this.show(t + 1, !0);
                      }
                      removeStep(t) {
                          const e = this.getCurrentStep();
                          (this.steps.some((e, n) => {
                              if (e.id === t) return (e.isOpen() && e.hide(), e.destroy(), this.steps.splice(n, 1), !0);
                          }),
                              e && e.id === t && ((this.currentStep = void 0), this.steps.length ? this.show(0) : this.cancel()));
                      }
                      show(t = 0, e = !0) {
                          const n = i(t) ? this.getById(t) : this.steps[t];
                          if (n) {
                              this._updateStateBeforeShow();
                              o(n.options.showOn) && !n.options.showOn()
                                  ? this._skipStep(n, e)
                                  : ((this.currentStep = n), this.trigger('show', { step: n, previous: this.currentStep }), n.show());
                          }
                      }
                      async start() {
                          (this.trigger('start'),
                              (this.focusedElBeforeOpen = document.activeElement),
                              (this.currentStep = null),
                              this.setupModal(),
                              this._setupActiveTour(),
                              this.next());
                      }
                      _done(t) {
                          const e = this.steps.indexOf(this.currentStep);
                          if (
                              (Array.isArray(this.steps) && this.steps.forEach((t) => t.destroy()),
                              (function (t) {
                                  if (t) {
                                      const { steps: e } = t;
                                      e.forEach((t) => {
                                          t.options &&
                                              !1 === t.options.canClickTarget &&
                                              t.options.attachTo &&
                                              (n(t.target) && t.target.classList.remove('shepherd-target-click-disabled'),
                                              t._resolvedExtraHighlightElements &&
                                                  t._resolvedExtraHighlightElements.forEach((t) => {
                                                      n(t) && t.classList.remove('shepherd-target-click-disabled');
                                                  }));
                                      });
                                  }
                              })(this),
                              this.trigger(t, { index: e }),
                              (vn.activeTour = null),
                              this.trigger('inactive', { tour: this }),
                              this.modal && this.modal.hide(),
                              ('cancel' === t || 'complete' === t) && this.modal)
                          ) {
                              const t = document.querySelector('.shepherd-modal-overlay-container');
                              t && (t.remove(), (this.modal = null));
                          }
                          n(this.focusedElBeforeOpen) && this.focusedElBeforeOpen.focus();
                      }
                      _setupActiveTour() {
                          (this.trigger('active', { tour: this }), (vn.activeTour = this));
                      }
                      setupModal() {
                          this.modal = new yn({ target: this.options.modalContainer || document.body, props: { styles: this.styles } });
                      }
                      _skipStep(t, e) {
                          const n = this.steps.indexOf(t);
                          if (n === this.steps.length - 1) this.complete();
                          else {
                              const t = e ? n + 1 : n - 1;
                              this.show(t, e);
                          }
                      }
                      _updateStateBeforeShow() {
                          (this.currentStep && this.currentStep.hide(), this.isActive() || this._setupActiveTour());
                      }
                      _setTourID(t) {
                          const e = this.options.tourName || 'tour',
                              n = t || O();
                          this.id = `${e}--${n}`;
                      }
                  }));
        try {
            window.Shepherd = vn;
        } catch (t) {}
        return e;
    })();
});
