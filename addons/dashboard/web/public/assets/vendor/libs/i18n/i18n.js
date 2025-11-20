/**
 * @namespace: addons/dashboard/web/public/assets/vendor/libs/i18n/i18n.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

!(function (e, t) {
    if ('object' == typeof exports && 'object' == typeof module) module.exports = t(require('fetch'));
    else if ('function' == typeof define && define.amd) define(['fetch'], t);
    else {
        var o = 'object' == typeof exports ? t(require('fetch')) : t(e.fetch);
        for (var n in o) ('object' == typeof exports ? exports : e)[n] = o[n];
    }
})(self, function (e) {
    return (function () {
        'use strict';
        var t,
            o,
            n = {
                4265: function (t) {
                    t.exports = e;
                },
            },
            s = {};
        function i(e) {
            var t = s[e];
            if (void 0 !== t) return t.exports;
            var o = (s[e] = { exports: {} });
            return (n[e](o, o.exports, i), o.exports);
        }
        ((o = Object.getPrototypeOf
            ? function (e) {
                  return Object.getPrototypeOf(e);
              }
            : function (e) {
                  return e.__proto__;
              }),
            (i.t = function (e, n) {
                if ((1 & n && (e = this(e)), 8 & n)) return e;
                if ('object' == typeof e && e) {
                    if (4 & n && e.__esModule) return e;
                    if (16 & n && 'function' == typeof e.then) return e;
                }
                var s = Object.create(null);
                i.r(s);
                var r = {};
                t = t || [null, o({}), o([]), o(o)];
                for (var a = 2 & n && e; 'object' == typeof a && !~t.indexOf(a); a = o(a))
                    Object.getOwnPropertyNames(a).forEach(function (t) {
                        r[t] = function () {
                            return e[t];
                        };
                    });
                return (
                    (r.default = function () {
                        return e;
                    }),
                    i.d(s, r),
                    s
                );
            }),
            (i.d = function (e, t) {
                for (var o in t) i.o(t, o) && !i.o(e, o) && Object.defineProperty(e, o, { enumerable: !0, get: t[o] });
            }),
            (i.o = function (e, t) {
                return Object.prototype.hasOwnProperty.call(e, t);
            }),
            (i.r = function (e) {
                ('undefined' != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
                    Object.defineProperty(e, '__esModule', { value: !0 }));
            }));
        var r = {};
        return (
            (function () {
                (i.r(r),
                    i.d(r, {
                        i18NextHttpBackend: function () {
                            return le;
                        },
                        i18next: function () {
                            return H;
                        },
                        languageDetector: function () {
                            return je;
                        },
                    }));
                const e = (e) => 'string' == typeof e,
                    t = () => {
                        let e, t;
                        const o = new Promise((o, n) => {
                            ((e = o), (t = n));
                        });
                        return ((o.resolve = e), (o.reject = t), o);
                    },
                    o = (e) => (null == e ? '' : '' + e),
                    n = /###/g,
                    s = (e) => (e && e.indexOf('###') > -1 ? e.replace(n, '.') : e),
                    a = (t) => !t || e(t),
                    l = (t, o, n) => {
                        const i = e(o) ? o.split('.') : o;
                        let r = 0;
                        for (; r < i.length - 1; ) {
                            if (a(t)) return {};
                            const e = s(i[r]);
                            (!t[e] && n && (t[e] = new n()), (t = Object.prototype.hasOwnProperty.call(t, e) ? t[e] : {}), ++r);
                        }
                        return a(t) ? {} : { obj: t, k: s(i[r]) };
                    },
                    c = (e, t, o) => {
                        const { obj: n, k: s } = l(e, t, Object);
                        if (void 0 !== n || 1 === t.length) return void (n[s] = o);
                        let i = t[t.length - 1],
                            r = t.slice(0, t.length - 1),
                            a = l(e, r, Object);
                        for (; void 0 === a.obj && r.length; )
                            ((i = `${r[r.length - 1]}.${i}`),
                                (r = r.slice(0, r.length - 1)),
                                (a = l(e, r, Object)),
                                a?.obj && void 0 !== a.obj[`${a.k}.${i}`] && (a.obj = void 0));
                        a.obj[`${a.k}.${i}`] = o;
                    },
                    u = (e, t) => {
                        const { obj: o, k: n } = l(e, t);
                        if (o) return o[n];
                    },
                    h = (t, o, n) => {
                        for (const s in o)
                            '__proto__' !== s &&
                                'constructor' !== s &&
                                (s in t
                                    ? e(t[s]) || t[s] instanceof String || e(o[s]) || o[s] instanceof String
                                        ? n && (t[s] = o[s])
                                        : h(t[s], o[s], n)
                                    : (t[s] = o[s]));
                        return t;
                    },
                    p = (e) => e.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
                var d = {
                    '&': '&amp;',
                    '<': '&lt;',
                    '>': '&gt;',
                    '"': '&quot;',
                    "'": '&#39;',
                    '/': '&#x2F;',
                };
                const g = (t) => (e(t) ? t.replace(/[&<>"'\/]/g, (e) => d[e]) : t);
                const f = [' ', ',', '?', '!', ';'],
                    m = new (class {
                        constructor(e) {
                            ((this.capacity = e), (this.regExpMap = new Map()), (this.regExpQueue = []));
                        }
                        getRegExp(e) {
                            const t = this.regExpMap.get(e);
                            if (void 0 !== t) return t;
                            const o = new RegExp(e);
                            return (
                                this.regExpQueue.length === this.capacity && this.regExpMap.delete(this.regExpQueue.shift()),
                                this.regExpMap.set(e, o),
                                this.regExpQueue.push(e),
                                o
                            );
                        }
                    })(20),
                    y = function (e, t) {
                        let o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : '.';
                        if (!e) return;
                        if (e[t]) return e[t];
                        const n = t.split(o);
                        let s = e;
                        for (let e = 0; e < n.length; ) {
                            if (!s || 'object' != typeof s) return;
                            let t,
                                i = '';
                            for (let r = e; r < n.length; ++r)
                                if ((r !== e && (i += o), (i += n[r]), (t = s[i]), void 0 !== t)) {
                                    if (['string', 'number', 'boolean'].indexOf(typeof t) > -1 && r < n.length - 1) continue;
                                    e += r - e + 1;
                                    break;
                                }
                            s = t;
                        }
                        return s;
                    },
                    v = (e) => e?.replace('_', '-'),
                    b = {
                        type: 'logger',
                        log(e) {
                            this.output('log', e);
                        },
                        warn(e) {
                            this.output('warn', e);
                        },
                        error(e) {
                            this.output('error', e);
                        },
                        output(e, t) {},
                    };
                class x {
                    constructor(e) {
                        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                        this.init(e, t);
                    }
                    init(e) {
                        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                        ((this.prefix = t.prefix || 'i18next:'), (this.logger = e || b), (this.options = t), (this.debug = t.debug));
                    }
                    log() {
                        for (var e = arguments.length, t = new Array(e), o = 0; o < e; o++) t[o] = arguments[o];
                        return this.forward(t, 'log', '', !0);
                    }
                    warn() {
                        for (var e = arguments.length, t = new Array(e), o = 0; o < e; o++) t[o] = arguments[o];
                        return this.forward(t, 'warn', '', !0);
                    }
                    error() {
                        for (var e = arguments.length, t = new Array(e), o = 0; o < e; o++) t[o] = arguments[o];
                        return this.forward(t, 'error', '');
                    }
                    deprecate() {
                        for (var e = arguments.length, t = new Array(e), o = 0; o < e; o++) t[o] = arguments[o];
                        return this.forward(t, 'warn', 'WARNING DEPRECATED: ', !0);
                    }
                    forward(t, o, n, s) {
                        return s && !this.debug ? null : (e(t[0]) && (t[0] = `${n}${this.prefix} ${t[0]}`), this.logger[o](t));
                    }
                    create(e) {
                        return new x(this.logger, {
                            prefix: `${this.prefix}:${e}:`,
                            ...this.options,
                        });
                    }
                    clone(e) {
                        return (((e = e || this.options).prefix = e.prefix || this.prefix), new x(this.logger, e));
                    }
                }
                var S = new x();
                class w {
                    constructor() {
                        this.observers = {};
                    }
                    on(e, t) {
                        return (
                            e.split(' ').forEach((e) => {
                                this.observers[e] || (this.observers[e] = new Map());
                                const o = this.observers[e].get(t) || 0;
                                this.observers[e].set(t, o + 1);
                            }),
                            this
                        );
                    }
                    off(e, t) {
                        this.observers[e] && (t ? this.observers[e].delete(t) : delete this.observers[e]);
                    }
                    emit(e) {
                        for (var t = arguments.length, o = new Array(t > 1 ? t - 1 : 0), n = 1; n < t; n++) o[n - 1] = arguments[n];
                        if (this.observers[e]) {
                            Array.from(this.observers[e].entries()).forEach((e) => {
                                let [t, n] = e;
                                for (let e = 0; e < n; e++) t(...o);
                            });
                        }
                        if (this.observers['*']) {
                            Array.from(this.observers['*'].entries()).forEach((t) => {
                                let [n, s] = t;
                                for (let t = 0; t < s; t++) n.apply(n, [e, ...o]);
                            });
                        }
                    }
                }
                class k extends w {
                    constructor(e) {
                        let t =
                            arguments.length > 1 && void 0 !== arguments[1]
                                ? arguments[1]
                                : { ns: ['translation'], defaultNS: 'translation' };
                        (super(),
                            (this.data = e || {}),
                            (this.options = t),
                            void 0 === this.options.keySeparator && (this.options.keySeparator = '.'),
                            void 0 === this.options.ignoreJSONStructure && (this.options.ignoreJSONStructure = !0));
                    }
                    addNamespaces(e) {
                        this.options.ns.indexOf(e) < 0 && this.options.ns.push(e);
                    }
                    removeNamespaces(e) {
                        const t = this.options.ns.indexOf(e);
                        t > -1 && this.options.ns.splice(t, 1);
                    }
                    getResource(t, o, n) {
                        let s = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
                        const i = void 0 !== s.keySeparator ? s.keySeparator : this.options.keySeparator,
                            r = void 0 !== s.ignoreJSONStructure ? s.ignoreJSONStructure : this.options.ignoreJSONStructure;
                        let a;
                        t.indexOf('.') > -1
                            ? (a = t.split('.'))
                            : ((a = [t, o]), n && (Array.isArray(n) ? a.push(...n) : e(n) && i ? a.push(...n.split(i)) : a.push(n)));
                        const l = u(this.data, a);
                        return (
                            !l && !o && !n && t.indexOf('.') > -1 && ((t = a[0]), (o = a[1]), (n = a.slice(2).join('.'))),
                            !l && r && e(n) ? y(this.data?.[t]?.[o], n, i) : l
                        );
                    }
                    addResource(e, t, o, n) {
                        let s = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : { silent: !1 };
                        const i = void 0 !== s.keySeparator ? s.keySeparator : this.options.keySeparator;
                        let r = [e, t];
                        (o && (r = r.concat(i ? o.split(i) : o)),
                            e.indexOf('.') > -1 && ((r = e.split('.')), (n = t), (t = r[1])),
                            this.addNamespaces(t),
                            c(this.data, r, n),
                            s.silent || this.emit('added', e, t, o, n));
                    }
                    addResources(t, o, n) {
                        let s = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : { silent: !1 };
                        for (const s in n) (e(n[s]) || Array.isArray(n[s])) && this.addResource(t, o, s, n[s], { silent: !0 });
                        s.silent || this.emit('added', t, o, n);
                    }
                    addResourceBundle(e, t, o, n, s) {
                        let i = arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : { silent: !1, skipCopy: !1 },
                            r = [e, t];
                        (e.indexOf('.') > -1 && ((r = e.split('.')), (n = o), (o = t), (t = r[1])), this.addNamespaces(t));
                        let a = u(this.data, r) || {};
                        (i.skipCopy || (o = JSON.parse(JSON.stringify(o))),
                            n ? h(a, o, s) : (a = { ...a, ...o }),
                            c(this.data, r, a),
                            i.silent || this.emit('added', e, t, o));
                    }
                    removeResourceBundle(e, t) {
                        (this.hasResourceBundle(e, t) && delete this.data[e][t], this.removeNamespaces(t), this.emit('removed', e, t));
                    }
                    hasResourceBundle(e, t) {
                        return void 0 !== this.getResource(e, t);
                    }
                    getResourceBundle(e, t) {
                        return (t || (t = this.options.defaultNS), this.getResource(e, t));
                    }
                    getDataByLanguage(e) {
                        return this.data[e];
                    }
                    hasLanguageSomeTranslations(e) {
                        const t = this.getDataByLanguage(e);
                        return !!((t && Object.keys(t)) || []).find((e) => t[e] && Object.keys(t[e]).length > 0);
                    }
                    toJSON() {
                        return this.data;
                    }
                }
                var O = {
                    processors: {},
                    addPostProcessor(e) {
                        this.processors[e.name] = e;
                    },
                    handle(e, t, o, n, s) {
                        return (
                            e.forEach((e) => {
                                t = this.processors[e]?.process(t, o, n, s) ?? t;
                            }),
                            t
                        );
                    },
                };
                const L = {};
                class P extends w {
                    constructor(e) {
                        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                        (super(),
                            ((e, t, o) => {
                                e.forEach((e) => {
                                    t[e] && (o[e] = t[e]);
                                });
                            })(
                                [
                                    'resourceStore',
                                    'languageUtils',
                                    'pluralResolver',
                                    'interpolator',
                                    'backendConnector',
                                    'i18nFormat',
                                    'utils',
                                ],
                                e,
                                this
                            ),
                            (this.options = t),
                            void 0 === this.options.keySeparator && (this.options.keySeparator = '.'),
                            (this.logger = S.create('translator')));
                    }
                    changeLanguage(e) {
                        e && (this.language = e);
                    }
                    exists(e) {
                        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { interpolation: {} };
                        if (null == e) return !1;
                        const o = this.resolve(e, t);
                        return void 0 !== o?.res;
                    }
                    extractFromKey(t, o) {
                        let n = void 0 !== o.nsSeparator ? o.nsSeparator : this.options.nsSeparator;
                        void 0 === n && (n = ':');
                        const s = void 0 !== o.keySeparator ? o.keySeparator : this.options.keySeparator;
                        let i = o.ns || this.options.defaultNS || [];
                        const r = n && t.indexOf(n) > -1,
                            a = !(
                                this.options.userDefinedKeySeparator ||
                                o.keySeparator ||
                                this.options.userDefinedNsSeparator ||
                                o.nsSeparator ||
                                ((e, t, o) => {
                                    ((t = t || ''), (o = o || ''));
                                    const n = f.filter((e) => t.indexOf(e) < 0 && o.indexOf(e) < 0);
                                    if (0 === n.length) return !0;
                                    const s = m.getRegExp(`(${n.map((e) => ('?' === e ? '\\?' : e)).join('|')})`);
                                    let i = !s.test(e);
                                    if (!i) {
                                        const t = e.indexOf(o);
                                        t > 0 && !s.test(e.substring(0, t)) && (i = !0);
                                    }
                                    return i;
                                })(t, n, s)
                            );
                        if (r && !a) {
                            const o = t.match(this.interpolator.nestingRegexp);
                            if (o && o.length > 0) return { key: t, namespaces: e(i) ? [i] : i };
                            const r = t.split(n);
                            ((n !== s || (n === s && this.options.ns.indexOf(r[0]) > -1)) && (i = r.shift()), (t = r.join(s)));
                        }
                        return { key: t, namespaces: e(i) ? [i] : i };
                    }
                    translate(t, o, n) {
                        if (
                            ('object' != typeof o &&
                                this.options.overloadTranslationOptionHandler &&
                                (o = this.options.overloadTranslationOptionHandler(arguments)),
                            'object' == typeof o && (o = { ...o }),
                            o || (o = {}),
                            null == t)
                        )
                            return '';
                        Array.isArray(t) || (t = [String(t)]);
                        const s = void 0 !== o.returnDetails ? o.returnDetails : this.options.returnDetails,
                            i = void 0 !== o.keySeparator ? o.keySeparator : this.options.keySeparator,
                            { key: r, namespaces: a } = this.extractFromKey(t[t.length - 1], o),
                            l = a[a.length - 1],
                            c = o.lng || this.language,
                            u = o.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;
                        if ('cimode' === c?.toLowerCase()) {
                            if (u) {
                                const e = o.nsSeparator || this.options.nsSeparator;
                                return s
                                    ? {
                                          res: `${l}${e}${r}`,
                                          usedKey: r,
                                          exactUsedKey: r,
                                          usedLng: c,
                                          usedNS: l,
                                          usedParams: this.getUsedParamsDetails(o),
                                      }
                                    : `${l}${e}${r}`;
                            }
                            return s
                                ? {
                                      res: r,
                                      usedKey: r,
                                      exactUsedKey: r,
                                      usedLng: c,
                                      usedNS: l,
                                      usedParams: this.getUsedParamsDetails(o),
                                  }
                                : r;
                        }
                        const h = this.resolve(t, o);
                        let p = h?.res;
                        const d = h?.usedKey || r,
                            g = h?.exactUsedKey || r,
                            f = Object.prototype.toString.apply(p),
                            m = void 0 !== o.joinArrays ? o.joinArrays : this.options.joinArrays,
                            y = !this.i18nFormat || this.i18nFormat.handleAsObject,
                            v = !e(p) && 'boolean' != typeof p && 'number' != typeof p;
                        if (
                            !(y && p && v && ['[object Number]', '[object Function]', '[object RegExp]'].indexOf(f) < 0) ||
                            (e(m) && Array.isArray(p))
                        )
                            if (y && e(m) && Array.isArray(p)) ((p = p.join(m)), p && (p = this.extendTranslation(p, t, o, n)));
                            else {
                                let s = !1,
                                    a = !1;
                                const u = void 0 !== o.count && !e(o.count),
                                    d = P.hasDefaultValue(o),
                                    g = u ? this.pluralResolver.getSuffix(c, o.count, o) : '',
                                    f =
                                        o.ordinal && u
                                            ? this.pluralResolver.getSuffix(c, o.count, {
                                                  ordinal: !1,
                                              })
                                            : '',
                                    m = u && !o.ordinal && 0 === o.count,
                                    y =
                                        (m && o[`defaultValue${this.options.pluralSeparator}zero`]) ||
                                        o[`defaultValue${g}`] ||
                                        o[`defaultValue${f}`] ||
                                        o.defaultValue;
                                (!this.isValidLookup(p) && d && ((s = !0), (p = y)), this.isValidLookup(p) || ((a = !0), (p = r)));
                                const v =
                                        (o.missingKeyNoValueFallbackToKey || this.options.missingKeyNoValueFallbackToKey) && a ? void 0 : p,
                                    b = d && y !== p && this.options.updateMissing;
                                if (a || s || b) {
                                    if ((this.logger.log(b ? 'updateKey' : 'missingKey', c, l, r, b ? y : p), i)) {
                                        const e = this.resolve(r, { ...o, keySeparator: !1 });
                                        e &&
                                            e.res &&
                                            this.logger.warn(
                                                'Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.'
                                            );
                                    }
                                    let e = [];
                                    const t = this.languageUtils.getFallbackCodes(this.options.fallbackLng, o.lng || this.language);
                                    if ('fallback' === this.options.saveMissingTo && t && t[0])
                                        for (let o = 0; o < t.length; o++) e.push(t[o]);
                                    else
                                        'all' === this.options.saveMissingTo
                                            ? (e = this.languageUtils.toResolveHierarchy(o.lng || this.language))
                                            : e.push(o.lng || this.language);
                                    const n = (e, t, n) => {
                                        const s = d && n !== p ? n : v;
                                        (this.options.missingKeyHandler
                                            ? this.options.missingKeyHandler(e, l, t, s, b, o)
                                            : this.backendConnector?.saveMissing && this.backendConnector.saveMissing(e, l, t, s, b, o),
                                            this.emit('missingKey', e, l, t, p));
                                    };
                                    this.options.saveMissing &&
                                        (this.options.saveMissingPlurals && u
                                            ? e.forEach((e) => {
                                                  const t = this.pluralResolver.getSuffixes(e, o);
                                                  (m &&
                                                      o[`defaultValue${this.options.pluralSeparator}zero`] &&
                                                      t.indexOf(`${this.options.pluralSeparator}zero`) < 0 &&
                                                      t.push(`${this.options.pluralSeparator}zero`),
                                                      t.forEach((t) => {
                                                          n([e], r + t, o[`defaultValue${t}`] || y);
                                                      }));
                                              })
                                            : n(e, r, y));
                                }
                                ((p = this.extendTranslation(p, t, o, h, n)),
                                    a && p === r && this.options.appendNamespaceToMissingKey && (p = `${l}:${r}`),
                                    (a || s) &&
                                        this.options.parseMissingKeyHandler &&
                                        (p = this.options.parseMissingKeyHandler(
                                            this.options.appendNamespaceToMissingKey ? `${l}:${r}` : r,
                                            s ? p : void 0
                                        )));
                            }
                        else {
                            if (!o.returnObjects && !this.options.returnObjects) {
                                this.options.returnedObjectHandler ||
                                    this.logger.warn('accessing an object - but returnObjects options is not enabled!');
                                const e = this.options.returnedObjectHandler
                                    ? this.options.returnedObjectHandler(d, p, { ...o, ns: a })
                                    : `key '${r} (${this.language})' returned an object instead of string.`;
                                return s ? ((h.res = e), (h.usedParams = this.getUsedParamsDetails(o)), h) : e;
                            }
                            if (i) {
                                const e = Array.isArray(p),
                                    t = e ? [] : {},
                                    n = e ? g : d;
                                for (const e in p)
                                    if (Object.prototype.hasOwnProperty.call(p, e)) {
                                        const s = `${n}${i}${e}`;
                                        ((t[e] = this.translate(s, { ...o, joinArrays: !1, ns: a })), t[e] === s && (t[e] = p[e]));
                                    }
                                p = t;
                            }
                        }
                        return s ? ((h.res = p), (h.usedParams = this.getUsedParamsDetails(o)), h) : p;
                    }
                    extendTranslation(t, o, n, s, i) {
                        var r = this;
                        if (this.i18nFormat?.parse)
                            t = this.i18nFormat.parse(
                                t,
                                { ...this.options.interpolation.defaultVariables, ...n },
                                n.lng || this.language || s.usedLng,
                                s.usedNS,
                                s.usedKey,
                                { resolved: s }
                            );
                        else if (!n.skipInterpolation) {
                            n.interpolation &&
                                this.interpolator.init({
                                    ...n,
                                    interpolation: {
                                        ...this.options.interpolation,
                                        ...n.interpolation,
                                    },
                                });
                            const a =
                                e(t) &&
                                (void 0 !== n?.interpolation?.skipOnVariables
                                    ? n.interpolation.skipOnVariables
                                    : this.options.interpolation.skipOnVariables);
                            let l;
                            if (a) {
                                const e = t.match(this.interpolator.nestingRegexp);
                                l = e && e.length;
                            }
                            let c = n.replace && !e(n.replace) ? n.replace : n;
                            if (
                                (this.options.interpolation.defaultVariables &&
                                    (c = {
                                        ...this.options.interpolation.defaultVariables,
                                        ...c,
                                    }),
                                (t = this.interpolator.interpolate(t, c, n.lng || this.language || s.usedLng, n)),
                                a)
                            ) {
                                const e = t.match(this.interpolator.nestingRegexp);
                                l < (e && e.length) && (n.nest = !1);
                            }
                            (!n.lng && s && s.res && (n.lng = this.language || s.usedLng),
                                !1 !== n.nest &&
                                    (t = this.interpolator.nest(
                                        t,
                                        function () {
                                            for (var e = arguments.length, t = new Array(e), s = 0; s < e; s++) t[s] = arguments[s];
                                            return i?.[0] !== t[0] || n.context
                                                ? r.translate(...t, o)
                                                : (r.logger.warn(`It seems you are nesting recursively key: ${t[0]} in key: ${o[0]}`),
                                                  null);
                                        },
                                        n
                                    )),
                                n.interpolation && this.interpolator.reset());
                        }
                        const a = n.postProcess || this.options.postProcess,
                            l = e(a) ? [a] : a;
                        return (
                            null != t &&
                                l?.length &&
                                !1 !== n.applyPostProcessor &&
                                (t = O.handle(
                                    l,
                                    t,
                                    o,
                                    this.options && this.options.postProcessPassResolved
                                        ? {
                                              i18nResolved: {
                                                  ...s,
                                                  usedParams: this.getUsedParamsDetails(n),
                                              },
                                              ...n,
                                          }
                                        : n,
                                    this
                                )),
                            t
                        );
                    }
                    resolve(t) {
                        let o,
                            n,
                            s,
                            i,
                            r,
                            a = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                        return (
                            e(t) && (t = [t]),
                            t.forEach((t) => {
                                if (this.isValidLookup(o)) return;
                                const l = this.extractFromKey(t, a),
                                    c = l.key;
                                n = c;
                                let u = l.namespaces;
                                this.options.fallbackNS && (u = u.concat(this.options.fallbackNS));
                                const h = void 0 !== a.count && !e(a.count),
                                    p = h && !a.ordinal && 0 === a.count,
                                    d = void 0 !== a.context && (e(a.context) || 'number' == typeof a.context) && '' !== a.context,
                                    g = a.lngs ? a.lngs : this.languageUtils.toResolveHierarchy(a.lng || this.language, a.fallbackLng);
                                u.forEach((e) => {
                                    this.isValidLookup(o) ||
                                        ((r = e),
                                        L[`${g[0]}-${e}`] ||
                                            !this.utils?.hasLoadedNamespace ||
                                            this.utils?.hasLoadedNamespace(r) ||
                                            ((L[`${g[0]}-${e}`] = !0),
                                            this.logger.warn(
                                                `key "${n}" for languages "${g.join(
                                                    ', '
                                                )}" won't get resolved as namespace "${r}" was not yet loaded`,
                                                'This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!'
                                            )),
                                        g.forEach((t) => {
                                            if (this.isValidLookup(o)) return;
                                            i = t;
                                            const n = [c];
                                            if (this.i18nFormat?.addLookupKeys) this.i18nFormat.addLookupKeys(n, c, t, e, a);
                                            else {
                                                let e;
                                                h && (e = this.pluralResolver.getSuffix(t, a.count, a));
                                                const o = `${this.options.pluralSeparator}zero`,
                                                    s = `${this.options.pluralSeparator}ordinal${this.options.pluralSeparator}`;
                                                if (
                                                    (h &&
                                                        (n.push(c + e),
                                                        a.ordinal &&
                                                            0 === e.indexOf(s) &&
                                                            n.push(c + e.replace(s, this.options.pluralSeparator)),
                                                        p && n.push(c + o)),
                                                    d)
                                                ) {
                                                    const t = `${c}${this.options.contextSeparator}${a.context}`;
                                                    (n.push(t),
                                                        h &&
                                                            (n.push(t + e),
                                                            a.ordinal &&
                                                                0 === e.indexOf(s) &&
                                                                n.push(t + e.replace(s, this.options.pluralSeparator)),
                                                            p && n.push(t + o)));
                                                }
                                            }
                                            let r;
                                            for (; (r = n.pop()); ) this.isValidLookup(o) || ((s = r), (o = this.getResource(t, e, r, a)));
                                        }));
                                });
                            }),
                            { res: o, usedKey: n, exactUsedKey: s, usedLng: i, usedNS: r }
                        );
                    }
                    isValidLookup(e) {
                        return !(void 0 === e || (!this.options.returnNull && null === e) || (!this.options.returnEmptyString && '' === e));
                    }
                    getResource(e, t, o) {
                        let n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
                        return this.i18nFormat?.getResource
                            ? this.i18nFormat.getResource(e, t, o, n)
                            : this.resourceStore.getResource(e, t, o, n);
                    }
                    getUsedParamsDetails() {
                        let t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                        const o = [
                                'defaultValue',
                                'ordinal',
                                'context',
                                'replace',
                                'lng',
                                'lngs',
                                'fallbackLng',
                                'ns',
                                'keySeparator',
                                'nsSeparator',
                                'returnObjects',
                                'returnDetails',
                                'joinArrays',
                                'postProcess',
                                'interpolation',
                            ],
                            n = t.replace && !e(t.replace);
                        let s = n ? t.replace : t;
                        if (
                            (n && void 0 !== t.count && (s.count = t.count),
                            this.options.interpolation.defaultVariables && (s = { ...this.options.interpolation.defaultVariables, ...s }),
                            !n)
                        ) {
                            s = { ...s };
                            for (const e of o) delete s[e];
                        }
                        return s;
                    }
                    static hasDefaultValue(e) {
                        const t = 'defaultValue';
                        for (const o in e)
                            if (Object.prototype.hasOwnProperty.call(e, o) && t === o.substring(0, 12) && void 0 !== e[o]) return !0;
                        return !1;
                    }
                }
                class j {
                    constructor(e) {
                        ((this.options = e),
                            (this.supportedLngs = this.options.supportedLngs || !1),
                            (this.logger = S.create('languageUtils')));
                    }
                    getScriptPartFromCode(e) {
                        if (!(e = v(e)) || e.indexOf('-') < 0) return null;
                        const t = e.split('-');
                        return 2 === t.length
                            ? null
                            : (t.pop(), 'x' === t[t.length - 1].toLowerCase() ? null : this.formatLanguageCode(t.join('-')));
                    }
                    getLanguagePartFromCode(e) {
                        if (!(e = v(e)) || e.indexOf('-') < 0) return e;
                        const t = e.split('-');
                        return this.formatLanguageCode(t[0]);
                    }
                    formatLanguageCode(t) {
                        if (e(t) && t.indexOf('-') > -1) {
                            let e;
                            try {
                                e = Intl.getCanonicalLocales(t)[0];
                            } catch (e) {}
                            return (
                                e && this.options.lowerCaseLng && (e = e.toLowerCase()),
                                e || (this.options.lowerCaseLng ? t.toLowerCase() : t)
                            );
                        }
                        return this.options.cleanCode || this.options.lowerCaseLng ? t.toLowerCase() : t;
                    }
                    isSupportedCode(e) {
                        return (
                            ('languageOnly' === this.options.load || this.options.nonExplicitSupportedLngs) &&
                                (e = this.getLanguagePartFromCode(e)),
                            !this.supportedLngs || !this.supportedLngs.length || this.supportedLngs.indexOf(e) > -1
                        );
                    }
                    getBestMatchFromCodes(e) {
                        if (!e) return null;
                        let t;
                        return (
                            e.forEach((e) => {
                                if (t) return;
                                const o = this.formatLanguageCode(e);
                                (this.options.supportedLngs && !this.isSupportedCode(o)) || (t = o);
                            }),
                            !t &&
                                this.options.supportedLngs &&
                                e.forEach((e) => {
                                    if (t) return;
                                    const o = this.getLanguagePartFromCode(e);
                                    if (this.isSupportedCode(o)) return (t = o);
                                    t = this.options.supportedLngs.find((e) =>
                                        e === o
                                            ? e
                                            : e.indexOf('-') < 0 && o.indexOf('-') < 0
                                              ? void 0
                                              : (e.indexOf('-') > 0 && o.indexOf('-') < 0 && e.substring(0, e.indexOf('-')) === o) ||
                                                  (0 === e.indexOf(o) && o.length > 1)
                                                ? e
                                                : void 0
                                    );
                                }),
                            t || (t = this.getFallbackCodes(this.options.fallbackLng)[0]),
                            t
                        );
                    }
                    getFallbackCodes(t, o) {
                        if (!t) return [];
                        if (('function' == typeof t && (t = t(o)), e(t) && (t = [t]), Array.isArray(t))) return t;
                        if (!o) return t.default || [];
                        let n = t[o];
                        return (
                            n || (n = t[this.getScriptPartFromCode(o)]),
                            n || (n = t[this.formatLanguageCode(o)]),
                            n || (n = t[this.getLanguagePartFromCode(o)]),
                            n || (n = t.default),
                            n || []
                        );
                    }
                    toResolveHierarchy(t, o) {
                        const n = this.getFallbackCodes(o || this.options.fallbackLng || [], t),
                            s = [],
                            i = (e) => {
                                e &&
                                    (this.isSupportedCode(e)
                                        ? s.push(e)
                                        : this.logger.warn(`rejecting language code not found in supportedLngs: ${e}`));
                            };
                        return (
                            e(t) && (t.indexOf('-') > -1 || t.indexOf('_') > -1)
                                ? ('languageOnly' !== this.options.load && i(this.formatLanguageCode(t)),
                                  'languageOnly' !== this.options.load &&
                                      'currentOnly' !== this.options.load &&
                                      i(this.getScriptPartFromCode(t)),
                                  'currentOnly' !== this.options.load && i(this.getLanguagePartFromCode(t)))
                                : e(t) && i(this.formatLanguageCode(t)),
                            n.forEach((e) => {
                                s.indexOf(e) < 0 && i(this.formatLanguageCode(e));
                            }),
                            s
                        );
                    }
                }
                const R = { zero: 0, one: 1, two: 2, few: 3, many: 4, other: 5 },
                    C = {
                        select: (e) => (1 === e ? 'one' : 'other'),
                        resolvedOptions: () => ({ pluralCategories: ['one', 'other'] }),
                    };
                class $ {
                    constructor(e) {
                        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                        ((this.languageUtils = e),
                            (this.options = t),
                            (this.logger = S.create('pluralResolver')),
                            (this.pluralRulesCache = {}));
                    }
                    addRule(e, t) {
                        this.rules[e] = t;
                    }
                    clearCache() {
                        this.pluralRulesCache = {};
                    }
                    getRule(e) {
                        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                        const o = v('dev' === e ? 'en' : e),
                            n = t.ordinal ? 'ordinal' : 'cardinal',
                            s = JSON.stringify({ cleanedCode: o, type: n });
                        if (s in this.pluralRulesCache) return this.pluralRulesCache[s];
                        let i;
                        try {
                            i = new Intl.PluralRules(o, { type: n });
                        } catch (o) {
                            if (!Intl) return (this.logger.error('No Intl support, please use an Intl polyfill!'), C);
                            if (!e.match(/-|_/)) return C;
                            const n = this.languageUtils.getLanguagePartFromCode(e);
                            i = this.getRule(n, t);
                        }
                        return ((this.pluralRulesCache[s] = i), i);
                    }
                    needsPlural(e) {
                        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                            o = this.getRule(e, t);
                        return (o || (o = this.getRule('dev', t)), o?.resolvedOptions().pluralCategories.length > 1);
                    }
                    getPluralFormsOfKey(e, t) {
                        let o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
                        return this.getSuffixes(e, o).map((e) => `${t}${e}`);
                    }
                    getSuffixes(e) {
                        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                            o = this.getRule(e, t);
                        return (
                            o || (o = this.getRule('dev', t)),
                            o
                                ? o
                                      .resolvedOptions()
                                      .pluralCategories.sort((e, t) => R[e] - R[t])
                                      .map((e) => `${this.options.prepend}${t.ordinal ? `ordinal${this.options.prepend}` : ''}${e}`)
                                : []
                        );
                    }
                    getSuffix(e, t) {
                        let o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
                        const n = this.getRule(e, o);
                        return n
                            ? `${this.options.prepend}${o.ordinal ? `ordinal${this.options.prepend}` : ''}${n.select(t)}`
                            : (this.logger.warn(`no plural rule found for: ${e}`), this.getSuffix('dev', t, o));
                    }
                }
                const N = function (t, o, n) {
                        let s = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : '.',
                            i = !(arguments.length > 4 && void 0 !== arguments[4]) || arguments[4],
                            r = ((e, t, o) => {
                                const n = u(e, o);
                                return void 0 !== n ? n : u(t, o);
                            })(t, o, n);
                        return (!r && i && e(n) && ((r = y(t, n, s)), void 0 === r && (r = y(o, n, s))), r);
                    },
                    E = (e) => e.replace(/\$/g, '$$$$');
                class D {
                    constructor() {
                        let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                        ((this.logger = S.create('interpolator')),
                            (this.options = e),
                            (this.format = e?.interpolation?.format || ((e) => e)),
                            this.init(e));
                    }
                    init() {
                        let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                        e.interpolation || (e.interpolation = { escapeValue: !0 });
                        const {
                            escape: t,
                            escapeValue: o,
                            useRawValueToEscape: n,
                            prefix: s,
                            prefixEscaped: i,
                            suffix: r,
                            suffixEscaped: a,
                            formatSeparator: l,
                            unescapeSuffix: c,
                            unescapePrefix: u,
                            nestingPrefix: h,
                            nestingPrefixEscaped: d,
                            nestingSuffix: f,
                            nestingSuffixEscaped: m,
                            nestingOptionsSeparator: y,
                            maxReplaces: v,
                            alwaysFormat: b,
                        } = e.interpolation;
                        ((this.escape = void 0 !== t ? t : g),
                            (this.escapeValue = void 0 === o || o),
                            (this.useRawValueToEscape = void 0 !== n && n),
                            (this.prefix = s ? p(s) : i || '{{'),
                            (this.suffix = r ? p(r) : a || '}}'),
                            (this.formatSeparator = l || ','),
                            (this.unescapePrefix = c ? '' : u || '-'),
                            (this.unescapeSuffix = this.unescapePrefix ? '' : c || ''),
                            (this.nestingPrefix = h ? p(h) : d || p('$t(')),
                            (this.nestingSuffix = f ? p(f) : m || p(')')),
                            (this.nestingOptionsSeparator = y || ','),
                            (this.maxReplaces = v || 1e3),
                            (this.alwaysFormat = void 0 !== b && b),
                            this.resetRegExp());
                    }
                    reset() {
                        this.options && this.init(this.options);
                    }
                    resetRegExp() {
                        const e = (e, t) => (e?.source === t ? ((e.lastIndex = 0), e) : new RegExp(t, 'g'));
                        ((this.regexp = e(this.regexp, `${this.prefix}(.+?)${this.suffix}`)),
                            (this.regexpUnescape = e(
                                this.regexpUnescape,
                                `${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${this.suffix}`
                            )),
                            (this.nestingRegexp = e(this.nestingRegexp, `${this.nestingPrefix}(.+?)${this.nestingSuffix}`)));
                    }
                    interpolate(t, n, s, i) {
                        let r, a, l;
                        const c = (this.options && this.options.interpolation && this.options.interpolation.defaultVariables) || {},
                            u = (e) => {
                                if (e.indexOf(this.formatSeparator) < 0) {
                                    const t = N(n, c, e, this.options.keySeparator, this.options.ignoreJSONStructure);
                                    return this.alwaysFormat
                                        ? this.format(t, void 0, s, {
                                              ...i,
                                              ...n,
                                              interpolationkey: e,
                                          })
                                        : t;
                                }
                                const t = e.split(this.formatSeparator),
                                    o = t.shift().trim(),
                                    r = t.join(this.formatSeparator).trim();
                                return this.format(N(n, c, o, this.options.keySeparator, this.options.ignoreJSONStructure), r, s, {
                                    ...i,
                                    ...n,
                                    interpolationkey: o,
                                });
                            };
                        this.resetRegExp();
                        const h = i?.missingInterpolationHandler || this.options.missingInterpolationHandler,
                            p =
                                void 0 !== i?.interpolation?.skipOnVariables
                                    ? i.interpolation.skipOnVariables
                                    : this.options.interpolation.skipOnVariables;
                        return (
                            [
                                { regex: this.regexpUnescape, safeValue: (e) => E(e) },
                                {
                                    regex: this.regexp,
                                    safeValue: (e) => (this.escapeValue ? E(this.escape(e)) : E(e)),
                                },
                            ].forEach((n) => {
                                for (l = 0; (r = n.regex.exec(t)); ) {
                                    const s = r[1].trim();
                                    if (((a = u(s)), void 0 === a))
                                        if ('function' == typeof h) {
                                            const o = h(t, r, i);
                                            a = e(o) ? o : '';
                                        } else if (i && Object.prototype.hasOwnProperty.call(i, s)) a = '';
                                        else {
                                            if (p) {
                                                a = r[0];
                                                continue;
                                            }
                                            (this.logger.warn(`missed to pass in variable ${s} for interpolating ${t}`), (a = ''));
                                        }
                                    else e(a) || this.useRawValueToEscape || (a = o(a));
                                    const c = n.safeValue(a);
                                    if (
                                        ((t = t.replace(r[0], c)),
                                        p ? ((n.regex.lastIndex += a.length), (n.regex.lastIndex -= r[0].length)) : (n.regex.lastIndex = 0),
                                        l++,
                                        l >= this.maxReplaces)
                                    )
                                        break;
                                }
                            }),
                            t
                        );
                    }
                    nest(t, n) {
                        let s,
                            i,
                            r,
                            a = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
                        const l = (e, t) => {
                            const o = this.nestingOptionsSeparator;
                            if (e.indexOf(o) < 0) return e;
                            const n = e.split(new RegExp(`${o}[ ]*{`));
                            let s = `{${n[1]}`;
                            ((e = n[0]), (s = this.interpolate(s, r)));
                            const i = s.match(/'/g),
                                a = s.match(/"/g);
                            (((i?.length ?? 0) % 2 == 0 && !a) || a.length % 2 != 0) && (s = s.replace(/'/g, '"'));
                            try {
                                ((r = JSON.parse(s)), t && (r = { ...t, ...r }));
                            } catch (t) {
                                return (this.logger.warn(`failed parsing options string in nesting for key ${e}`, t), `${e}${o}${s}`);
                            }
                            return (r.defaultValue && r.defaultValue.indexOf(this.prefix) > -1 && delete r.defaultValue, e);
                        };
                        for (; (s = this.nestingRegexp.exec(t)); ) {
                            let c = [];
                            ((r = { ...a }),
                                (r = r.replace && !e(r.replace) ? r.replace : r),
                                (r.applyPostProcessor = !1),
                                delete r.defaultValue);
                            let u = !1;
                            if (-1 !== s[0].indexOf(this.formatSeparator) && !/{.*}/.test(s[1])) {
                                const e = s[1].split(this.formatSeparator).map((e) => e.trim());
                                ((s[1] = e.shift()), (c = e), (u = !0));
                            }
                            if (((i = n(l.call(this, s[1].trim(), r), r)), i && s[0] === t && !e(i))) return i;
                            (e(i) || (i = o(i)),
                                i || (this.logger.warn(`missed to resolve ${s[1]} for nesting ${t}`), (i = '')),
                                u &&
                                    (i = c.reduce(
                                        (e, t) =>
                                            this.format(e, t, a.lng, {
                                                ...a,
                                                interpolationkey: s[1].trim(),
                                            }),
                                        i.trim()
                                    )),
                                (t = t.replace(s[0], i)),
                                (this.regexp.lastIndex = 0));
                        }
                        return t;
                    }
                }
                const T = (e) => {
                    const t = {};
                    return (o, n, s) => {
                        let i = s;
                        s &&
                            s.interpolationkey &&
                            s.formatParams &&
                            s.formatParams[s.interpolationkey] &&
                            s[s.interpolationkey] &&
                            (i = { ...i, [s.interpolationkey]: void 0 });
                        const r = n + JSON.stringify(i);
                        let a = t[r];
                        return (a || ((a = e(v(n), s)), (t[r] = a)), a(o));
                    };
                };
                class F {
                    constructor() {
                        let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                        ((this.logger = S.create('formatter')),
                            (this.options = e),
                            (this.formats = {
                                number: T((e, t) => {
                                    const o = new Intl.NumberFormat(e, { ...t });
                                    return (e) => o.format(e);
                                }),
                                currency: T((e, t) => {
                                    const o = new Intl.NumberFormat(e, {
                                        ...t,
                                        style: 'currency',
                                    });
                                    return (e) => o.format(e);
                                }),
                                datetime: T((e, t) => {
                                    const o = new Intl.DateTimeFormat(e, { ...t });
                                    return (e) => o.format(e);
                                }),
                                relativetime: T((e, t) => {
                                    const o = new Intl.RelativeTimeFormat(e, { ...t });
                                    return (e) => o.format(e, t.range || 'day');
                                }),
                                list: T((e, t) => {
                                    const o = new Intl.ListFormat(e, { ...t });
                                    return (e) => o.format(e);
                                }),
                            }),
                            this.init(e));
                    }
                    init(e) {
                        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : { interpolation: {} };
                        this.formatSeparator = t.interpolation.formatSeparator || ',';
                    }
                    add(e, t) {
                        this.formats[e.toLowerCase().trim()] = t;
                    }
                    addCached(e, t) {
                        this.formats[e.toLowerCase().trim()] = T(t);
                    }
                    format(e, t, o) {
                        let n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
                        const s = t.split(this.formatSeparator);
                        if (s.length > 1 && s[0].indexOf('(') > 1 && s[0].indexOf(')') < 0 && s.find((e) => e.indexOf(')') > -1)) {
                            const e = s.findIndex((e) => e.indexOf(')') > -1);
                            s[0] = [s[0], ...s.splice(1, e)].join(this.formatSeparator);
                        }
                        return s.reduce((e, t) => {
                            const { formatName: s, formatOptions: i } = ((e) => {
                                let t = e.toLowerCase().trim();
                                const o = {};
                                if (e.indexOf('(') > -1) {
                                    const n = e.split('(');
                                    t = n[0].toLowerCase().trim();
                                    const s = n[1].substring(0, n[1].length - 1);
                                    'currency' === t && s.indexOf(':') < 0
                                        ? o.currency || (o.currency = s.trim())
                                        : 'relativetime' === t && s.indexOf(':') < 0
                                          ? o.range || (o.range = s.trim())
                                          : s.split(';').forEach((e) => {
                                                if (e) {
                                                    const [t, ...n] = e.split(':'),
                                                        s = n
                                                            .join(':')
                                                            .trim()
                                                            .replace(/^'+|'+$/g, ''),
                                                        i = t.trim();
                                                    (o[i] || (o[i] = s),
                                                        'false' === s && (o[i] = !1),
                                                        'true' === s && (o[i] = !0),
                                                        isNaN(s) || (o[i] = parseInt(s, 10)));
                                                }
                                            });
                                }
                                return { formatName: t, formatOptions: o };
                            })(t);
                            if (this.formats[s]) {
                                let t = e;
                                try {
                                    const r = n?.formatParams?.[n.interpolationkey] || {},
                                        a = r.locale || r.lng || n.locale || n.lng || o;
                                    t = this.formats[s](e, a, { ...i, ...n, ...r });
                                } catch (e) {
                                    this.logger.warn(e);
                                }
                                return t;
                            }
                            return (this.logger.warn(`there was no format function for ${s}`), e);
                        }, e);
                    }
                }
                class I extends w {
                    constructor(e, t, o) {
                        let n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : {};
                        (super(),
                            (this.backend = e),
                            (this.store = t),
                            (this.services = o),
                            (this.languageUtils = o.languageUtils),
                            (this.options = n),
                            (this.logger = S.create('backendConnector')),
                            (this.waitingReads = []),
                            (this.maxParallelReads = n.maxParallelReads || 10),
                            (this.readingCalls = 0),
                            (this.maxRetries = n.maxRetries >= 0 ? n.maxRetries : 5),
                            (this.retryTimeout = n.retryTimeout >= 1 ? n.retryTimeout : 350),
                            (this.state = {}),
                            (this.queue = []),
                            this.backend?.init?.(o, n.backend, n));
                    }
                    queueLoad(e, t, o, n) {
                        const s = {},
                            i = {},
                            r = {},
                            a = {};
                        return (
                            e.forEach((e) => {
                                let n = !0;
                                (t.forEach((t) => {
                                    const r = `${e}|${t}`;
                                    !o.reload && this.store.hasResourceBundle(e, t)
                                        ? (this.state[r] = 2)
                                        : this.state[r] < 0 ||
                                          (1 === this.state[r]
                                              ? void 0 === i[r] && (i[r] = !0)
                                              : ((this.state[r] = 1),
                                                (n = !1),
                                                void 0 === i[r] && (i[r] = !0),
                                                void 0 === s[r] && (s[r] = !0),
                                                void 0 === a[t] && (a[t] = !0)));
                                }),
                                    n || (r[e] = !0));
                            }),
                            (Object.keys(s).length || Object.keys(i).length) &&
                                this.queue.push({
                                    pending: i,
                                    pendingCount: Object.keys(i).length,
                                    loaded: {},
                                    errors: [],
                                    callback: n,
                                }),
                            {
                                toLoad: Object.keys(s),
                                pending: Object.keys(i),
                                toLoadLanguages: Object.keys(r),
                                toLoadNamespaces: Object.keys(a),
                            }
                        );
                    }
                    loaded(e, t, o) {
                        const n = e.split('|'),
                            s = n[0],
                            i = n[1];
                        (t && this.emit('failedLoading', s, i, t),
                            !t &&
                                o &&
                                this.store.addResourceBundle(s, i, o, void 0, void 0, {
                                    skipCopy: !0,
                                }),
                            (this.state[e] = t ? -1 : 2),
                            t && o && (this.state[e] = 0));
                        const r = {};
                        (this.queue.forEach((o) => {
                            (((e, t, o) => {
                                const { obj: n, k: s } = l(e, t, Object);
                                ((n[s] = n[s] || []), n[s].push(o));
                            })(o.loaded, [s], i),
                                ((e, t) => {
                                    void 0 !== e.pending[t] && (delete e.pending[t], e.pendingCount--);
                                })(o, e),
                                t && o.errors.push(t),
                                0 !== o.pendingCount ||
                                    o.done ||
                                    (Object.keys(o.loaded).forEach((e) => {
                                        r[e] || (r[e] = {});
                                        const t = o.loaded[e];
                                        t.length &&
                                            t.forEach((t) => {
                                                void 0 === r[e][t] && (r[e][t] = !0);
                                            });
                                    }),
                                    (o.done = !0),
                                    o.errors.length ? o.callback(o.errors) : o.callback()));
                        }),
                            this.emit('loaded', r),
                            (this.queue = this.queue.filter((e) => !e.done)));
                    }
                    read(e, t, o) {
                        let n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : 0,
                            s = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : this.retryTimeout,
                            i = arguments.length > 5 ? arguments[5] : void 0;
                        if (!e.length) return i(null, {});
                        if (this.readingCalls >= this.maxParallelReads)
                            return void this.waitingReads.push({
                                lng: e,
                                ns: t,
                                fcName: o,
                                tried: n,
                                wait: s,
                                callback: i,
                            });
                        this.readingCalls++;
                        const r = (r, a) => {
                                if ((this.readingCalls--, this.waitingReads.length > 0)) {
                                    const e = this.waitingReads.shift();
                                    this.read(e.lng, e.ns, e.fcName, e.tried, e.wait, e.callback);
                                }
                                r && a && n < this.maxRetries
                                    ? setTimeout(() => {
                                          this.read.call(this, e, t, o, n + 1, 2 * s, i);
                                      }, s)
                                    : i(r, a);
                            },
                            a = this.backend[o].bind(this.backend);
                        if (2 !== a.length) return a(e, t, r);
                        try {
                            const o = a(e, t);
                            o && 'function' == typeof o.then ? o.then((e) => r(null, e)).catch(r) : r(null, o);
                        } catch (e) {
                            r(e);
                        }
                    }
                    prepareLoading(t, o) {
                        let n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {},
                            s = arguments.length > 3 ? arguments[3] : void 0;
                        if (!this.backend)
                            return (this.logger.warn('No backend was added via i18next.use. Will not load resources.'), s && s());
                        (e(t) && (t = this.languageUtils.toResolveHierarchy(t)), e(o) && (o = [o]));
                        const i = this.queueLoad(t, o, n, s);
                        if (!i.toLoad.length) return (i.pending.length || s(), null);
                        i.toLoad.forEach((e) => {
                            this.loadOne(e);
                        });
                    }
                    load(e, t, o) {
                        this.prepareLoading(e, t, {}, o);
                    }
                    reload(e, t, o) {
                        this.prepareLoading(e, t, { reload: !0 }, o);
                    }
                    loadOne(e) {
                        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : '';
                        const o = e.split('|'),
                            n = o[0],
                            s = o[1];
                        this.read(n, s, 'read', void 0, void 0, (o, i) => {
                            (o && this.logger.warn(`${t}loading namespace ${s} for language ${n} failed`, o),
                                !o && i && this.logger.log(`${t}loaded namespace ${s} for language ${n}`, i),
                                this.loaded(e, o, i));
                        });
                    }
                    saveMissing(e, t, o, n, s) {
                        let i = arguments.length > 5 && void 0 !== arguments[5] ? arguments[5] : {},
                            r = arguments.length > 6 && void 0 !== arguments[6] ? arguments[6] : () => {};
                        if (!this.services?.utils?.hasLoadedNamespace || this.services?.utils?.hasLoadedNamespace(t)) {
                            if (null != o && '' !== o) {
                                if (this.backend?.create) {
                                    const a = { ...i, isUpdate: s },
                                        l = this.backend.create.bind(this.backend);
                                    if (l.length < 6)
                                        try {
                                            let s;
                                            ((s = 5 === l.length ? l(e, t, o, n, a) : l(e, t, o, n)),
                                                s && 'function' == typeof s.then ? s.then((e) => r(null, e)).catch(r) : r(null, s));
                                        } catch (e) {
                                            r(e);
                                        }
                                    else l(e, t, o, n, r, a);
                                }
                                e && e[0] && this.store.addResource(e[0], t, o, n);
                            }
                        } else
                            this.logger.warn(
                                `did not save key "${o}" as the namespace "${t}" was not yet loaded`,
                                'This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!'
                            );
                    }
                }
                const A = () => ({
                        debug: !1,
                        initAsync: !0,
                        ns: ['translation'],
                        defaultNS: ['translation'],
                        fallbackLng: ['dev'],
                        fallbackNS: !1,
                        supportedLngs: !1,
                        nonExplicitSupportedLngs: !1,
                        load: 'all',
                        preload: !1,
                        simplifyPluralSuffix: !0,
                        keySeparator: '.',
                        nsSeparator: ':',
                        pluralSeparator: '_',
                        contextSeparator: '_',
                        partialBundledLanguages: !1,
                        saveMissing: !1,
                        updateMissing: !1,
                        saveMissingTo: 'fallback',
                        saveMissingPlurals: !0,
                        missingKeyHandler: !1,
                        missingInterpolationHandler: !1,
                        postProcess: !1,
                        postProcessPassResolved: !1,
                        returnNull: !1,
                        returnEmptyString: !0,
                        returnObjects: !1,
                        joinArrays: !1,
                        returnedObjectHandler: !1,
                        parseMissingKeyHandler: !1,
                        appendNamespaceToMissingKey: !1,
                        appendNamespaceToCIMode: !1,
                        overloadTranslationOptionHandler: (t) => {
                            let o = {};
                            if (
                                ('object' == typeof t[1] && (o = t[1]),
                                e(t[1]) && (o.defaultValue = t[1]),
                                e(t[2]) && (o.tDescription = t[2]),
                                'object' == typeof t[2] || 'object' == typeof t[3])
                            ) {
                                const e = t[3] || t[2];
                                Object.keys(e).forEach((t) => {
                                    o[t] = e[t];
                                });
                            }
                            return o;
                        },
                        interpolation: {
                            escapeValue: !0,
                            format: (e) => e,
                            prefix: '{{',
                            suffix: '}}',
                            formatSeparator: ',',
                            unescapePrefix: '-',
                            nestingPrefix: '$t(',
                            nestingSuffix: ')',
                            nestingOptionsSeparator: ',',
                            maxReplaces: 1e3,
                            skipOnVariables: !0,
                        },
                    }),
                    U = (t) => (
                        e(t.ns) && (t.ns = [t.ns]),
                        e(t.fallbackLng) && (t.fallbackLng = [t.fallbackLng]),
                        e(t.fallbackNS) && (t.fallbackNS = [t.fallbackNS]),
                        t.supportedLngs?.indexOf?.('cimode') < 0 && (t.supportedLngs = t.supportedLngs.concat(['cimode'])),
                        'boolean' == typeof t.initImmediate && (t.initAsync = t.initImmediate),
                        t
                    ),
                    M = () => {};
                class V extends w {
                    constructor() {
                        let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
                            t = arguments.length > 1 ? arguments[1] : void 0;
                        var o;
                        if (
                            (super(),
                            (this.options = U(e)),
                            (this.services = {}),
                            (this.logger = S),
                            (this.modules = { external: [] }),
                            (o = this),
                            Object.getOwnPropertyNames(Object.getPrototypeOf(o)).forEach((e) => {
                                'function' == typeof o[e] && (o[e] = o[e].bind(o));
                            }),
                            t && !this.isInitialized && !e.isClone)
                        ) {
                            if (!this.options.initAsync) return (this.init(e, t), this);
                            setTimeout(() => {
                                this.init(e, t);
                            }, 0);
                        }
                    }
                    init() {
                        var o = this;
                        let n = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
                            s = arguments.length > 1 ? arguments[1] : void 0;
                        ((this.isInitializing = !0),
                            'function' == typeof n && ((s = n), (n = {})),
                            !n.defaultNS &&
                                !1 !== n.defaultNS &&
                                n.ns &&
                                (e(n.ns) ? (n.defaultNS = n.ns) : n.ns.indexOf('translation') < 0 && (n.defaultNS = n.ns[0])));
                        const i = A();
                        ((this.options = { ...i, ...this.options, ...U(n) }),
                            (this.options.interpolation = {
                                ...i.interpolation,
                                ...this.options.interpolation,
                            }),
                            void 0 !== n.keySeparator && (this.options.userDefinedKeySeparator = n.keySeparator),
                            void 0 !== n.nsSeparator && (this.options.userDefinedNsSeparator = n.nsSeparator));
                        const r = (e) => (e ? ('function' == typeof e ? new e() : e) : null);
                        if (!this.options.isClone) {
                            let e;
                            (this.modules.logger ? S.init(r(this.modules.logger), this.options) : S.init(null, this.options),
                                (e = this.modules.formatter ? this.modules.formatter : F));
                            const t = new j(this.options);
                            this.store = new k(this.options.resources, this.options);
                            const n = this.services;
                            ((n.logger = S),
                                (n.resourceStore = this.store),
                                (n.languageUtils = t),
                                (n.pluralResolver = new $(t, {
                                    prepend: this.options.pluralSeparator,
                                    simplifyPluralSuffix: this.options.simplifyPluralSuffix,
                                })),
                                !e ||
                                    (this.options.interpolation.format && this.options.interpolation.format !== i.interpolation.format) ||
                                    ((n.formatter = r(e)),
                                    n.formatter.init(n, this.options),
                                    (this.options.interpolation.format = n.formatter.format.bind(n.formatter))),
                                (n.interpolator = new D(this.options)),
                                (n.utils = {
                                    hasLoadedNamespace: this.hasLoadedNamespace.bind(this),
                                }),
                                (n.backendConnector = new I(r(this.modules.backend), n.resourceStore, n, this.options)),
                                n.backendConnector.on('*', function (e) {
                                    for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), s = 1; s < t; s++)
                                        n[s - 1] = arguments[s];
                                    o.emit(e, ...n);
                                }),
                                this.modules.languageDetector &&
                                    ((n.languageDetector = r(this.modules.languageDetector)),
                                    n.languageDetector.init && n.languageDetector.init(n, this.options.detection, this.options)),
                                this.modules.i18nFormat &&
                                    ((n.i18nFormat = r(this.modules.i18nFormat)), n.i18nFormat.init && n.i18nFormat.init(this)),
                                (this.translator = new P(this.services, this.options)),
                                this.translator.on('*', function (e) {
                                    for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), s = 1; s < t; s++)
                                        n[s - 1] = arguments[s];
                                    o.emit(e, ...n);
                                }),
                                this.modules.external.forEach((e) => {
                                    e.init && e.init(this);
                                }));
                        }
                        if (
                            ((this.format = this.options.interpolation.format),
                            s || (s = M),
                            this.options.fallbackLng && !this.services.languageDetector && !this.options.lng)
                        ) {
                            const e = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
                            e.length > 0 && 'dev' !== e[0] && (this.options.lng = e[0]);
                        }
                        this.services.languageDetector ||
                            this.options.lng ||
                            this.logger.warn('init: no languageDetector is used and no lng is defined');
                        ['getResource', 'hasResourceBundle', 'getResourceBundle', 'getDataByLanguage'].forEach((e) => {
                            this[e] = function () {
                                return o.store[e](...arguments);
                            };
                        });
                        ['addResource', 'addResources', 'addResourceBundle', 'removeResourceBundle'].forEach((e) => {
                            this[e] = function () {
                                return (o.store[e](...arguments), o);
                            };
                        });
                        const a = t(),
                            l = () => {
                                const e = (e, t) => {
                                    ((this.isInitializing = !1),
                                        this.isInitialized &&
                                            !this.initializedStoreOnce &&
                                            this.logger.warn('init: i18next is already initialized. You should call init just once!'),
                                        (this.isInitialized = !0),
                                        this.options.isClone || this.logger.log('initialized', this.options),
                                        this.emit('initialized', this.options),
                                        a.resolve(t),
                                        s(e, t));
                                };
                                if (this.languages && !this.isInitialized) return e(null, this.t.bind(this));
                                this.changeLanguage(this.options.lng, e);
                            };
                        return (this.options.resources || !this.options.initAsync ? l() : setTimeout(l, 0), a);
                    }
                    loadResources(t) {
                        let o = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : M;
                        const n = e(t) ? t : this.language;
                        if (('function' == typeof t && (o = t), !this.options.resources || this.options.partialBundledLanguages)) {
                            if ('cimode' === n?.toLowerCase() && (!this.options.preload || 0 === this.options.preload.length)) return o();
                            const e = [],
                                t = (t) => {
                                    if (!t) return;
                                    if ('cimode' === t) return;
                                    this.services.languageUtils.toResolveHierarchy(t).forEach((t) => {
                                        'cimode' !== t && e.indexOf(t) < 0 && e.push(t);
                                    });
                                };
                            if (n) t(n);
                            else {
                                this.services.languageUtils.getFallbackCodes(this.options.fallbackLng).forEach((e) => t(e));
                            }
                            (this.options.preload?.forEach?.((e) => t(e)),
                                this.services.backendConnector.load(e, this.options.ns, (e) => {
                                    (e || this.resolvedLanguage || !this.language || this.setResolvedLanguage(this.language), o(e));
                                }));
                        } else o(null);
                    }
                    reloadResources(e, o, n) {
                        const s = t();
                        return (
                            'function' == typeof e && ((n = e), (e = void 0)),
                            'function' == typeof o && ((n = o), (o = void 0)),
                            e || (e = this.languages),
                            o || (o = this.options.ns),
                            n || (n = M),
                            this.services.backendConnector.reload(e, o, (e) => {
                                (s.resolve(), n(e));
                            }),
                            s
                        );
                    }
                    use(e) {
                        if (!e)
                            throw new Error(
                                'You are passing an undefined module! Please check the object you are passing to i18next.use()'
                            );
                        if (!e.type)
                            throw new Error('You are passing a wrong module! Please check the object you are passing to i18next.use()');
                        return (
                            'backend' === e.type && (this.modules.backend = e),
                            ('logger' === e.type || (e.log && e.warn && e.error)) && (this.modules.logger = e),
                            'languageDetector' === e.type && (this.modules.languageDetector = e),
                            'i18nFormat' === e.type && (this.modules.i18nFormat = e),
                            'postProcessor' === e.type && O.addPostProcessor(e),
                            'formatter' === e.type && (this.modules.formatter = e),
                            '3rdParty' === e.type && this.modules.external.push(e),
                            this
                        );
                    }
                    setResolvedLanguage(e) {
                        if (e && this.languages && !(['cimode', 'dev'].indexOf(e) > -1))
                            for (let e = 0; e < this.languages.length; e++) {
                                const t = this.languages[e];
                                if (!(['cimode', 'dev'].indexOf(t) > -1) && this.store.hasLanguageSomeTranslations(t)) {
                                    this.resolvedLanguage = t;
                                    break;
                                }
                            }
                    }
                    changeLanguage(o, n) {
                        var s = this;
                        this.isLanguageChangingTo = o;
                        const i = t();
                        this.emit('languageChanging', o);
                        const r = (e) => {
                                ((this.language = e),
                                    (this.languages = this.services.languageUtils.toResolveHierarchy(e)),
                                    (this.resolvedLanguage = void 0),
                                    this.setResolvedLanguage(e));
                            },
                            a = (e, t) => {
                                (t
                                    ? (r(t),
                                      this.translator.changeLanguage(t),
                                      (this.isLanguageChangingTo = void 0),
                                      this.emit('languageChanged', t),
                                      this.logger.log('languageChanged', t))
                                    : (this.isLanguageChangingTo = void 0),
                                    i.resolve(function () {
                                        return s.t(...arguments);
                                    }),
                                    n &&
                                        n(e, function () {
                                            return s.t(...arguments);
                                        }));
                            },
                            l = (t) => {
                                o || t || !this.services.languageDetector || (t = []);
                                const n = e(t) ? t : this.services.languageUtils.getBestMatchFromCodes(t);
                                (n &&
                                    (this.language || r(n),
                                    this.translator.language || this.translator.changeLanguage(n),
                                    this.services.languageDetector?.cacheUserLanguage?.(n)),
                                    this.loadResources(n, (e) => {
                                        a(e, n);
                                    }));
                            };
                        return (
                            o || !this.services.languageDetector || this.services.languageDetector.async
                                ? !o && this.services.languageDetector && this.services.languageDetector.async
                                    ? 0 === this.services.languageDetector.detect.length
                                        ? this.services.languageDetector.detect().then(l)
                                        : this.services.languageDetector.detect(l)
                                    : l(o)
                                : l(this.services.languageDetector.detect()),
                            i
                        );
                    }
                    getFixedT(t, o, n) {
                        var s = this;
                        const i = function (e, t) {
                            let o;
                            if ('object' != typeof t) {
                                for (var r = arguments.length, a = new Array(r > 2 ? r - 2 : 0), l = 2; l < r; l++) a[l - 2] = arguments[l];
                                o = s.options.overloadTranslationOptionHandler([e, t].concat(a));
                            } else o = { ...t };
                            ((o.lng = o.lng || i.lng),
                                (o.lngs = o.lngs || i.lngs),
                                (o.ns = o.ns || i.ns),
                                '' !== o.keyPrefix && (o.keyPrefix = o.keyPrefix || n || i.keyPrefix));
                            const c = s.options.keySeparator || '.';
                            let u;
                            return (
                                (u =
                                    o.keyPrefix && Array.isArray(e)
                                        ? e.map((e) => `${o.keyPrefix}${c}${e}`)
                                        : o.keyPrefix
                                          ? `${o.keyPrefix}${c}${e}`
                                          : e),
                                s.t(u, o)
                            );
                        };
                        return (e(t) ? (i.lng = t) : (i.lngs = t), (i.ns = o), (i.keyPrefix = n), i);
                    }
                    t() {
                        for (var e = arguments.length, t = new Array(e), o = 0; o < e; o++) t[o] = arguments[o];
                        return this.translator?.translate(...t);
                    }
                    exists() {
                        for (var e = arguments.length, t = new Array(e), o = 0; o < e; o++) t[o] = arguments[o];
                        return this.translator?.exists(...t);
                    }
                    setDefaultNamespace(e) {
                        this.options.defaultNS = e;
                    }
                    hasLoadedNamespace(e) {
                        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                        if (!this.isInitialized)
                            return (this.logger.warn('hasLoadedNamespace: i18next was not initialized', this.languages), !1);
                        if (!this.languages || !this.languages.length)
                            return (this.logger.warn('hasLoadedNamespace: i18n.languages were undefined or empty', this.languages), !1);
                        const o = t.lng || this.resolvedLanguage || this.languages[0],
                            n = !!this.options && this.options.fallbackLng,
                            s = this.languages[this.languages.length - 1];
                        if ('cimode' === o.toLowerCase()) return !0;
                        const i = (e, t) => {
                            const o = this.services.backendConnector.state[`${e}|${t}`];
                            return -1 === o || 0 === o || 2 === o;
                        };
                        if (t.precheck) {
                            const e = t.precheck(this, i);
                            if (void 0 !== e) return e;
                        }
                        return (
                            !!this.hasResourceBundle(o, e) ||
                            !(
                                this.services.backendConnector.backend &&
                                (!this.options.resources || this.options.partialBundledLanguages)
                            ) ||
                            !(!i(o, e) || (n && !i(s, e)))
                        );
                    }
                    loadNamespaces(o, n) {
                        const s = t();
                        return this.options.ns
                            ? (e(o) && (o = [o]),
                              o.forEach((e) => {
                                  this.options.ns.indexOf(e) < 0 && this.options.ns.push(e);
                              }),
                              this.loadResources((e) => {
                                  (s.resolve(), n && n(e));
                              }),
                              s)
                            : (n && n(), Promise.resolve());
                    }
                    loadLanguages(o, n) {
                        const s = t();
                        e(o) && (o = [o]);
                        const i = this.options.preload || [],
                            r = o.filter((e) => i.indexOf(e) < 0 && this.services.languageUtils.isSupportedCode(e));
                        return r.length
                            ? ((this.options.preload = i.concat(r)),
                              this.loadResources((e) => {
                                  (s.resolve(), n && n(e));
                              }),
                              s)
                            : (n && n(), Promise.resolve());
                    }
                    dir(e) {
                        if ((e || (e = this.resolvedLanguage || (this.languages?.length > 0 ? this.languages[0] : this.language)), !e))
                            return 'rtl';
                        const t = this.services?.languageUtils || new j(A());
                        return [
                            'ar',
                            'shu',
                            'sqr',
                            'ssh',
                            'xaa',
                            'yhd',
                            'yud',
                            'aao',
                            'abh',
                            'abv',
                            'acm',
                            'acq',
                            'acw',
                            'acx',
                            'acy',
                            'adf',
                            'ads',
                            'aeb',
                            'aec',
                            'afb',
                            'ajp',
                            'apc',
                            'apd',
                            'arb',
                            'arq',
                            'ars',
                            'ary',
                            'arz',
                            'auz',
                            'avl',
                            'ayh',
                            'ayl',
                            'ayn',
                            'ayp',
                            'bbz',
                            'pga',
                            'he',
                            'iw',
                            'ps',
                            'pbt',
                            'pbu',
                            'pst',
                            'prp',
                            'prd',
                            'ug',
                            'ur',
                            'ydd',
                            'yds',
                            'yih',
                            'ji',
                            'yi',
                            'hbo',
                            'men',
                            'xmn',
                            'fa',
                            'jpr',
                            'peo',
                            'pes',
                            'prs',
                            'dv',
                            'sam',
                            'ckb',
                        ].indexOf(t.getLanguagePartFromCode(e)) > -1 || e.toLowerCase().indexOf('-arab') > 1
                            ? 'rtl'
                            : 'ltr';
                    }
                    static createInstance() {
                        return new V(
                            arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
                            arguments.length > 1 ? arguments[1] : void 0
                        );
                    }
                    cloneInstance() {
                        let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
                            t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : M;
                        const o = e.forkResourceStore;
                        o && delete e.forkResourceStore;
                        const n = { ...this.options, ...e, isClone: !0 },
                            s = new V(n);
                        (void 0 === e.debug && void 0 === e.prefix) || (s.logger = s.logger.clone(e));
                        if (
                            (['store', 'services', 'language'].forEach((e) => {
                                s[e] = this[e];
                            }),
                            (s.services = { ...this.services }),
                            (s.services.utils = {
                                hasLoadedNamespace: s.hasLoadedNamespace.bind(s),
                            }),
                            o)
                        ) {
                            const e = Object.keys(this.store.data).reduce(
                                (e, t) => (
                                    (e[t] = { ...this.store.data[t] }),
                                    Object.keys(e[t]).reduce((o, n) => ((o[n] = { ...e[t][n] }), o), {})
                                ),
                                {}
                            );
                            ((s.store = new k(e, n)), (s.services.resourceStore = s.store));
                        }
                        return (
                            (s.translator = new P(s.services, n)),
                            s.translator.on('*', function (e) {
                                for (var t = arguments.length, o = new Array(t > 1 ? t - 1 : 0), n = 1; n < t; n++) o[n - 1] = arguments[n];
                                s.emit(e, ...o);
                            }),
                            s.init(n, t),
                            (s.translator.options = n),
                            (s.translator.backendConnector.services.utils = {
                                hasLoadedNamespace: s.hasLoadedNamespace.bind(s),
                            }),
                            s
                        );
                    }
                    toJSON() {
                        return {
                            options: this.options,
                            store: this.store,
                            language: this.language,
                            languages: this.languages,
                            resolvedLanguage: this.resolvedLanguage,
                        };
                    }
                }
                const H = V.createInstance();
                H.createInstance = V.createInstance;
                (H.createInstance,
                    H.dir,
                    H.init,
                    H.loadResources,
                    H.reloadResources,
                    H.use,
                    H.changeLanguage,
                    H.getFixedT,
                    H.t,
                    H.exists,
                    H.setDefaultNamespace,
                    H.hasLoadedNamespace,
                    H.loadNamespaces,
                    H.loadLanguages);
                function q(e) {
                    return (
                        (q =
                            'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                                ? function (e) {
                                      return typeof e;
                                  }
                                : function (e) {
                                      return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                          ? 'symbol'
                                          : typeof e;
                                  }),
                        q(e)
                    );
                }
                var K, z, B;
                function _() {
                    return (
                        'function' == typeof XMLHttpRequest ||
                        'object' === ('undefined' == typeof XMLHttpRequest ? 'undefined' : q(XMLHttpRequest))
                    );
                }
                function J(e, t) {
                    var o = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var n = Object.getOwnPropertySymbols(e);
                        (t &&
                            (n = n.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            o.push.apply(o, n));
                    }
                    return o;
                }
                function X(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var o = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? J(Object(o), !0).forEach(function (t) {
                                  W(e, t, o[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                              ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(o))
                              : J(Object(o)).forEach(function (t) {
                                    Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(o, t));
                                });
                    }
                    return e;
                }
                function W(e, t, o) {
                    return (
                        (t = (function (e) {
                            var t = (function (e, t) {
                                if ('object' != Q(e) || !e) return e;
                                var o = e[Symbol.toPrimitive];
                                if (void 0 !== o) {
                                    var n = o.call(e, t || 'default');
                                    if ('object' != Q(n)) return n;
                                    throw new TypeError('@@toPrimitive must return a primitive value.');
                                }
                                return ('string' === t ? String : Number)(e);
                            })(e, 'string');
                            return 'symbol' == Q(t) ? t : t + '';
                        })(t)) in e
                            ? Object.defineProperty(e, t, {
                                  value: o,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0,
                              })
                            : (e[t] = o),
                        e
                    );
                }
                function Q(e) {
                    return (
                        (Q =
                            'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                                ? function (e) {
                                      return typeof e;
                                  }
                                : function (e) {
                                      return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                          ? 'symbol'
                                          : typeof e;
                                  }),
                        Q(e)
                    );
                }
                if (
                    ('function' == typeof fetch &&
                        (K =
                            'undefined' != typeof global && global.fetch
                                ? global.fetch
                                : 'undefined' != typeof window && window.fetch
                                  ? window.fetch
                                  : fetch),
                    _() &&
                        ('undefined' != typeof global && global.XMLHttpRequest
                            ? (z = global.XMLHttpRequest)
                            : 'undefined' != typeof window && window.XMLHttpRequest && (z = window.XMLHttpRequest)),
                    'function' == typeof ActiveXObject &&
                        ('undefined' != typeof global && global.ActiveXObject
                            ? (B = global.ActiveXObject)
                            : 'undefined' != typeof window && window.ActiveXObject && (B = window.ActiveXObject)),
                    'function' != typeof K && (K = void 0),
                    !K && !z && !B)
                )
                    try {
                        Promise.resolve()
                            .then(i.t.bind(i, 4265, 19))
                            .then(function (e) {
                                K = e.default;
                            })
                            .catch(function () {});
                    } catch (e) {}
                var G = function (e, t) {
                        if (t && 'object' === Q(t)) {
                            var o = '';
                            for (var n in t) o += '&' + encodeURIComponent(n) + '=' + encodeURIComponent(t[n]);
                            if (!o) return e;
                            e = e + (-1 !== e.indexOf('?') ? '&' : '?') + o.slice(1);
                        }
                        return e;
                    },
                    Y = function (e, t, o, n) {
                        var s = function (e) {
                            if (!e.ok) return o(e.statusText || 'Error', { status: e.status });
                            e.text()
                                .then(function (t) {
                                    o(null, { status: e.status, data: t });
                                })
                                .catch(o);
                        };
                        if (n) {
                            var i = n(e, t);
                            if (i instanceof Promise) return void i.then(s).catch(o);
                        }
                        'function' == typeof fetch ? fetch(e, t).then(s).catch(o) : K(e, t).then(s).catch(o);
                    },
                    Z = !1,
                    ee = function (e, t, o, n) {
                        return (
                            'function' == typeof o && ((n = o), (o = void 0)),
                            (n = n || function () {}),
                            K && 0 !== t.indexOf('file:')
                                ? (function (e, t, o, n) {
                                      e.queryStringParams && (t = G(t, e.queryStringParams));
                                      var s = X({}, 'function' == typeof e.customHeaders ? e.customHeaders() : e.customHeaders);
                                      ('undefined' == typeof window &&
                                          'undefined' != typeof global &&
                                          void 0 !== global.process &&
                                          global.process.versions &&
                                          global.process.versions.node &&
                                          (s['User-Agent'] = 'i18next-http-backend (node/'
                                              .concat(global.process.version, '; ')
                                              .concat(global.process.platform, ' ')
                                              .concat(global.process.arch, ')')),
                                          o && (s['Content-Type'] = 'application/json'));
                                      var i = 'function' == typeof e.requestOptions ? e.requestOptions(o) : e.requestOptions,
                                          r = X(
                                              {
                                                  method: o ? 'POST' : 'GET',
                                                  body: o ? e.stringify(o) : void 0,
                                                  headers: s,
                                              },
                                              Z ? {} : i
                                          ),
                                          a =
                                              'function' == typeof e.alternateFetch && e.alternateFetch.length >= 1
                                                  ? e.alternateFetch
                                                  : void 0;
                                      try {
                                          Y(t, r, n, a);
                                      } catch (e) {
                                          if (!i || 0 === Object.keys(i).length || !e.message || e.message.indexOf('not implemented') < 0)
                                              return n(e);
                                          try {
                                              (Object.keys(i).forEach(function (e) {
                                                  delete r[e];
                                              }),
                                                  Y(t, r, n, a),
                                                  (Z = !0));
                                          } catch (e) {
                                              n(e);
                                          }
                                      }
                                  })(e, t, o, n)
                                : _() || 'function' == typeof ActiveXObject
                                  ? (function (e, t, o, n) {
                                        (o && 'object' === Q(o) && (o = G('', o).slice(1)),
                                            e.queryStringParams && (t = G(t, e.queryStringParams)));
                                        try {
                                            var s = z ? new z() : new B('MSXML2.XMLHTTP.3.0');
                                            (s.open(o ? 'POST' : 'GET', t, 1),
                                                e.crossDomain || s.setRequestHeader('X-Requested-With', 'XMLHttpRequest'),
                                                (s.withCredentials = !!e.withCredentials),
                                                o && s.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'),
                                                s.overrideMimeType && s.overrideMimeType('application/json'));
                                            var i = e.customHeaders;
                                            if ((i = 'function' == typeof i ? i() : i)) for (var r in i) s.setRequestHeader(r, i[r]);
                                            ((s.onreadystatechange = function () {
                                                s.readyState > 3 &&
                                                    n(s.status >= 400 ? s.statusText : null, {
                                                        status: s.status,
                                                        data: s.responseText,
                                                    });
                                            }),
                                                s.send(o));
                                        } catch (e) {
                                            console;
                                        }
                                    })(e, t, o, n)
                                  : void n(new Error('No fetch and no xhr implementation found!'))
                        );
                    };
                function te(e) {
                    return (
                        (te =
                            'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                                ? function (e) {
                                      return typeof e;
                                  }
                                : function (e) {
                                      return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                          ? 'symbol'
                                          : typeof e;
                                  }),
                        te(e)
                    );
                }
                function oe(e, t) {
                    var o = Object.keys(e);
                    if (Object.getOwnPropertySymbols) {
                        var n = Object.getOwnPropertySymbols(e);
                        (t &&
                            (n = n.filter(function (t) {
                                return Object.getOwnPropertyDescriptor(e, t).enumerable;
                            })),
                            o.push.apply(o, n));
                    }
                    return o;
                }
                function ne(e) {
                    for (var t = 1; t < arguments.length; t++) {
                        var o = null != arguments[t] ? arguments[t] : {};
                        t % 2
                            ? oe(Object(o), !0).forEach(function (t) {
                                  ie(e, t, o[t]);
                              })
                            : Object.getOwnPropertyDescriptors
                              ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(o))
                              : oe(Object(o)).forEach(function (t) {
                                    Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(o, t));
                                });
                    }
                    return e;
                }
                function se(e, t) {
                    for (var o = 0; o < t.length; o++) {
                        var n = t[o];
                        ((n.enumerable = n.enumerable || !1),
                            (n.configurable = !0),
                            'value' in n && (n.writable = !0),
                            Object.defineProperty(e, re(n.key), n));
                    }
                }
                function ie(e, t, o) {
                    return (
                        (t = re(t)) in e
                            ? Object.defineProperty(e, t, {
                                  value: o,
                                  enumerable: !0,
                                  configurable: !0,
                                  writable: !0,
                              })
                            : (e[t] = o),
                        e
                    );
                }
                function re(e) {
                    var t = (function (e, t) {
                        if ('object' != te(e) || !e) return e;
                        var o = e[Symbol.toPrimitive];
                        if (void 0 !== o) {
                            var n = o.call(e, t || 'default');
                            if ('object' != te(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' == te(t) ? t : t + '';
                }
                var ae = (function (e, t, o) {
                    return (t && se(e.prototype, t), o && se(e, o), Object.defineProperty(e, 'prototype', { writable: !1 }), e);
                })(
                    function e(t) {
                        var o = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                            n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
                        (!(function (e, t) {
                            if (!(e instanceof t)) throw new TypeError('Cannot call a class as a function');
                        })(this, e),
                            (this.services = t),
                            (this.options = o),
                            (this.allOptions = n),
                            (this.type = 'backend'),
                            this.init(t, o, n));
                    },
                    [
                        {
                            key: 'init',
                            value: function (e) {
                                var t = this,
                                    o = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                                    n = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
                                if (
                                    ((this.services = e),
                                    (this.options = ne(
                                        ne(
                                            ne(
                                                {},
                                                {
                                                    loadPath: '/locales/{{lng}}/{{ns}}.json',
                                                    addPath: '/locales/add/{{lng}}/{{ns}}',
                                                    parse: function (e) {
                                                        return JSON.parse(e);
                                                    },
                                                    stringify: JSON.stringify,
                                                    parsePayload: function (e, t, o) {
                                                        return ie({}, t, o || '');
                                                    },
                                                    parseLoadPayload: function (e, t) {},
                                                    request: ee,
                                                    reloadInterval: 'undefined' == typeof window && 36e5,
                                                    customHeaders: {},
                                                    queryStringParams: {},
                                                    crossDomain: !1,
                                                    withCredentials: !1,
                                                    overrideMimeType: !1,
                                                    requestOptions: {
                                                        mode: 'cors',
                                                        credentials: 'same-origin',
                                                        cache: 'default',
                                                    },
                                                }
                                            ),
                                            this.options || {}
                                        ),
                                        o
                                    )),
                                    (this.allOptions = n),
                                    this.services && this.options.reloadInterval)
                                ) {
                                    var s = setInterval(function () {
                                        return t.reload();
                                    }, this.options.reloadInterval);
                                    'object' === te(s) && 'function' == typeof s.unref && s.unref();
                                }
                            },
                        },
                        {
                            key: 'readMulti',
                            value: function (e, t, o) {
                                this._readAny(e, e, t, t, o);
                            },
                        },
                        {
                            key: 'read',
                            value: function (e, t, o) {
                                this._readAny([e], e, [t], t, o);
                            },
                        },
                        {
                            key: '_readAny',
                            value: function (e, t, o, n, s) {
                                var i,
                                    r = this,
                                    a = this.options.loadPath;
                                ('function' == typeof this.options.loadPath && (a = this.options.loadPath(e, o)),
                                    (a = (function (e) {
                                        return !!e && 'function' == typeof e.then;
                                    })((i = a))
                                        ? i
                                        : Promise.resolve(i)).then(function (i) {
                                        if (!i) return s(null, {});
                                        var a = r.services.interpolator.interpolate(i, {
                                            lng: e.join('+'),
                                            ns: o.join('+'),
                                        });
                                        r.loadUrl(a, s, t, n);
                                    }));
                            },
                        },
                        {
                            key: 'loadUrl',
                            value: function (e, t, o, n) {
                                var s = this,
                                    i = 'string' == typeof o ? [o] : o,
                                    r = 'string' == typeof n ? [n] : n,
                                    a = this.options.parseLoadPayload(i, r);
                                this.options.request(this.options, e, a, function (i, r) {
                                    if (r && ((r.status >= 500 && r.status < 600) || !r.status))
                                        return t('failed loading ' + e + '; status code: ' + r.status, !0);
                                    if (r && r.status >= 400 && r.status < 500)
                                        return t('failed loading ' + e + '; status code: ' + r.status, !1);
                                    if (!r && i && i.message) {
                                        var a = i.message.toLowerCase();
                                        if (
                                            ['failed', 'fetch', 'network', 'load'].find(function (e) {
                                                return a.indexOf(e) > -1;
                                            })
                                        )
                                            return t('failed loading ' + e + ': ' + i.message, !0);
                                    }
                                    if (i) return t(i, !1);
                                    var l, c;
                                    try {
                                        l = 'string' == typeof r.data ? s.options.parse(r.data, o, n) : r.data;
                                    } catch (t) {
                                        c = 'failed parsing ' + e + ' to json';
                                    }
                                    if (c) return t(c, !1);
                                    t(null, l);
                                });
                            },
                        },
                        {
                            key: 'create',
                            value: function (e, t, o, n, s) {
                                var i = this;
                                if (this.options.addPath) {
                                    'string' == typeof e && (e = [e]);
                                    var r = this.options.parsePayload(t, o, n),
                                        a = 0,
                                        l = [],
                                        c = [];
                                    e.forEach(function (o) {
                                        var n = i.options.addPath;
                                        'function' == typeof i.options.addPath && (n = i.options.addPath(o, t));
                                        var u = i.services.interpolator.interpolate(n, {
                                            lng: o,
                                            ns: t,
                                        });
                                        i.options.request(i.options, u, r, function (t, o) {
                                            ((a += 1), l.push(t), c.push(o), a === e.length && 'function' == typeof s && s(l, c));
                                        });
                                    });
                                }
                            },
                        },
                        {
                            key: 'reload',
                            value: function () {
                                var e = this,
                                    t = this.services,
                                    o = t.backendConnector,
                                    n = t.languageUtils,
                                    s = t.logger,
                                    i = o.language;
                                if (!i || 'cimode' !== i.toLowerCase()) {
                                    var r = [],
                                        a = function (e) {
                                            n.toResolveHierarchy(e).forEach(function (e) {
                                                r.indexOf(e) < 0 && r.push(e);
                                            });
                                        };
                                    (a(i),
                                        this.allOptions.preload &&
                                            this.allOptions.preload.forEach(function (e) {
                                                return a(e);
                                            }),
                                        r.forEach(function (t) {
                                            e.allOptions.ns.forEach(function (e) {
                                                o.read(t, e, 'read', null, null, function (n, i) {
                                                    (n && s.warn('loading namespace '.concat(e, ' for language ').concat(t, ' failed'), n),
                                                        !n && i && s.log('loaded namespace '.concat(e, ' for language ').concat(t), i),
                                                        o.loaded(''.concat(t, '|').concat(e), n, i));
                                                });
                                            });
                                        }));
                                }
                            },
                        },
                    ]
                );
                ae.type = 'backend';
                var le = ae;
                const { slice: ce, forEach: ue } = [];
                const he = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/,
                    pe = {
                        create(e, t, o, n) {
                            let s = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : { path: '/', sameSite: 'strict' };
                            (o && ((s.expires = new Date()), s.expires.setTime(s.expires.getTime() + 60 * o * 1e3)),
                                n && (s.domain = n),
                                (document.cookie = (function (e, t) {
                                    const o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : { path: '/' };
                                    let n = `${e}=${encodeURIComponent(t)}`;
                                    if (o.maxAge > 0) {
                                        const e = o.maxAge - 0;
                                        if (Number.isNaN(e)) throw new Error('maxAge should be a Number');
                                        n += `; Max-Age=${Math.floor(e)}`;
                                    }
                                    if (o.domain) {
                                        if (!he.test(o.domain)) throw new TypeError('option domain is invalid');
                                        n += `; Domain=${o.domain}`;
                                    }
                                    if (o.path) {
                                        if (!he.test(o.path)) throw new TypeError('option path is invalid');
                                        n += `; Path=${o.path}`;
                                    }
                                    if (o.expires) {
                                        if ('function' != typeof o.expires.toUTCString) throw new TypeError('option expires is invalid');
                                        n += `; Expires=${o.expires.toUTCString()}`;
                                    }
                                    if ((o.httpOnly && (n += '; HttpOnly'), o.secure && (n += '; Secure'), o.sameSite))
                                        switch ('string' == typeof o.sameSite ? o.sameSite.toLowerCase() : o.sameSite) {
                                            case !0:
                                                n += '; SameSite=Strict';
                                                break;
                                            case 'lax':
                                                n += '; SameSite=Lax';
                                                break;
                                            case 'strict':
                                                n += '; SameSite=Strict';
                                                break;
                                            case 'none':
                                                n += '; SameSite=None';
                                                break;
                                            default:
                                                throw new TypeError('option sameSite is invalid');
                                        }
                                    return n;
                                })(e, encodeURIComponent(t), s)));
                        },
                        read(e) {
                            const t = `${e}=`,
                                o = document.cookie.split(';');
                            for (let e = 0; e < o.length; e++) {
                                let n = o[e];
                                for (; ' ' === n.charAt(0); ) n = n.substring(1, n.length);
                                if (0 === n.indexOf(t)) return n.substring(t.length, n.length);
                            }
                            return null;
                        },
                        remove(e) {
                            this.create(e, '', -1);
                        },
                    };
                var de = {
                        name: 'cookie',
                        lookup(e) {
                            let { lookupCookie: t } = e;
                            if (t && 'undefined' != typeof document) return pe.read(t) || void 0;
                        },
                        cacheUserLanguage(e, t) {
                            let { lookupCookie: o, cookieMinutes: n, cookieDomain: s, cookieOptions: i } = t;
                            o && 'undefined' != typeof document && pe.create(o, e, n, s, i);
                        },
                    },
                    ge = {
                        name: 'querystring',
                        lookup(e) {
                            let t,
                                { lookupQuerystring: o } = e;
                            if ('undefined' != typeof window) {
                                let { search: e } = window.location;
                                !window.location.search &&
                                    window.location.hash?.indexOf('?') > -1 &&
                                    (e = window.location.hash.substring(window.location.hash.indexOf('?')));
                                const n = e.substring(1).split('&');
                                for (let e = 0; e < n.length; e++) {
                                    const s = n[e].indexOf('=');
                                    if (s > 0) {
                                        n[e].substring(0, s) === o && (t = n[e].substring(s + 1));
                                    }
                                }
                            }
                            return t;
                        },
                    };
                let fe = null;
                const me = () => {
                    if (null !== fe) return fe;
                    try {
                        fe = 'undefined' !== window && null !== window.localStorage;
                        const e = 'i18next.translate.boo';
                        (window.localStorage.setItem(e, 'foo'), window.localStorage.removeItem(e));
                    } catch (e) {
                        fe = !1;
                    }
                    return fe;
                };
                var ye = {
                    name: 'localStorage',
                    lookup(e) {
                        let { lookupLocalStorage: t } = e;
                        if (t && me()) return window.localStorage.getItem(t) || void 0;
                    },
                    cacheUserLanguage(e, t) {
                        let { lookupLocalStorage: o } = t;
                        o && me() && window.localStorage.setItem(o, e);
                    },
                };
                let ve = null;
                const be = () => {
                    if (null !== ve) return ve;
                    try {
                        ve = 'undefined' !== window && null !== window.sessionStorage;
                        const e = 'i18next.translate.boo';
                        (window.sessionStorage.setItem(e, 'foo'), window.sessionStorage.removeItem(e));
                    } catch (e) {
                        ve = !1;
                    }
                    return ve;
                };
                var xe = {
                        name: 'sessionStorage',
                        lookup(e) {
                            let { lookupSessionStorage: t } = e;
                            if (t && be()) return window.sessionStorage.getItem(t) || void 0;
                        },
                        cacheUserLanguage(e, t) {
                            let { lookupSessionStorage: o } = t;
                            o && be() && window.sessionStorage.setItem(o, e);
                        },
                    },
                    Se = {
                        name: 'navigator',
                        lookup(e) {
                            const t = [];
                            if ('undefined' != typeof navigator) {
                                const { languages: e, userLanguage: o, language: n } = navigator;
                                if (e) for (let o = 0; o < e.length; o++) t.push(e[o]);
                                (o && t.push(o), n && t.push(n));
                            }
                            return t.length > 0 ? t : void 0;
                        },
                    },
                    we = {
                        name: 'htmlTag',
                        lookup(e) {
                            let t,
                                { htmlTag: o } = e;
                            const n = o || ('undefined' != typeof document ? document.documentElement : null);
                            return (n && 'function' == typeof n.getAttribute && (t = n.getAttribute('lang')), t);
                        },
                    },
                    ke = {
                        name: 'path',
                        lookup(e) {
                            let { lookupFromPathIndex: t } = e;
                            if ('undefined' == typeof window) return;
                            const o = window.location.pathname.match(/\/([a-zA-Z-]*)/g);
                            if (!Array.isArray(o)) return;
                            const n = 'number' == typeof t ? t : 0;
                            return o[n]?.replace('/', '');
                        },
                    },
                    Oe = {
                        name: 'subdomain',
                        lookup(e) {
                            let { lookupFromSubdomainIndex: t } = e;
                            const o = 'number' == typeof t ? t + 1 : 1,
                                n =
                                    'undefined' != typeof window &&
                                    window.location?.hostname?.match(/^(\w{2,5})\.(([a-z0-9-]{1,63}\.[a-z]{2,6})|localhost)/i);
                            if (n) return n[o];
                        },
                    };
                let Le = !1;
                try {
                    (document.cookie, (Le = !0));
                } catch (e) {}
                const Pe = ['querystring', 'cookie', 'localStorage', 'sessionStorage', 'navigator', 'htmlTag'];
                Le || Pe.splice(1, 1);
                class je {
                    constructor(e) {
                        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                        ((this.type = 'languageDetector'), (this.detectors = {}), this.init(e, t));
                    }
                    init() {
                        let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : { languageUtils: {} },
                            t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
                            o = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {};
                        ((this.services = e),
                            (this.options = (function (e) {
                                return (
                                    ue.call(ce.call(arguments, 1), (t) => {
                                        if (t) for (const o in t) void 0 === e[o] && (e[o] = t[o]);
                                    }),
                                    e
                                );
                            })(t, this.options || {}, {
                                order: Pe,
                                lookupQuerystring: 'lng',
                                lookupCookie: 'i18next',
                                lookupLocalStorage: 'i18nextLng',
                                lookupSessionStorage: 'i18nextLng',
                                caches: ['localStorage'],
                                excludeCacheFor: ['cimode'],
                                convertDetectedLanguage: (e) => e,
                            })),
                            'string' == typeof this.options.convertDetectedLanguage &&
                                this.options.convertDetectedLanguage.indexOf('15897') > -1 &&
                                (this.options.convertDetectedLanguage = (e) => e.replace('-', '_')),
                            this.options.lookupFromUrlIndex && (this.options.lookupFromPathIndex = this.options.lookupFromUrlIndex),
                            (this.i18nOptions = o),
                            this.addDetector(de),
                            this.addDetector(ge),
                            this.addDetector(ye),
                            this.addDetector(xe),
                            this.addDetector(Se),
                            this.addDetector(we),
                            this.addDetector(ke),
                            this.addDetector(Oe));
                    }
                    addDetector(e) {
                        return ((this.detectors[e.name] = e), this);
                    }
                    detect() {
                        let e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : this.options.order,
                            t = [];
                        return (
                            e.forEach((e) => {
                                if (this.detectors[e]) {
                                    let o = this.detectors[e].lookup(this.options);
                                    (o && 'string' == typeof o && (o = [o]), o && (t = t.concat(o)));
                                }
                            }),
                            (t = t.map((e) => this.options.convertDetectedLanguage(e))),
                            this.services && this.services.languageUtils && this.services.languageUtils.getBestMatchFromCodes
                                ? t
                                : t.length > 0
                                  ? t[0]
                                  : null
                        );
                    }
                    cacheUserLanguage(e) {
                        let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : this.options.caches;
                        t &&
                            ((this.options.excludeCacheFor && this.options.excludeCacheFor.indexOf(e) > -1) ||
                                t.forEach((t) => {
                                    this.detectors[t] && this.detectors[t].cacheUserLanguage(e, this.options);
                                }));
                    }
                }
                je.type = 'languageDetector';
            })(),
            r
        );
    })();
});
