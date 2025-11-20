/**
 * @namespace: addons/dashboard/web/public/assets/vendor/libs/@algolia/autocomplete-js.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

!(function (e, t) {
    if ('object' == typeof exports && 'object' == typeof module) module.exports = t();
    else if ('function' == typeof define && define.amd) define([], t);
    else {
        var r = t();
        for (var n in r) ('object' == typeof exports ? exports : e)[n] = r[n];
    }
})(self, function () {
    return (function () {
        'use strict';
        var e = {
                d: function (t, r) {
                    for (var n in r) e.o(r, n) && !e.o(t, n) && Object.defineProperty(t, n, { enumerable: !0, get: r[n] });
                },
                o: function (e, t) {
                    return Object.prototype.hasOwnProperty.call(e, t);
                },
                r: function (e) {
                    ('undefined' != typeof Symbol &&
                        Symbol.toStringTag &&
                        Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
                        Object.defineProperty(e, '__esModule', { value: !0 }));
                },
            },
            t = {};
        function r(e, t) {
            var r = void 0;
            return function () {
                for (var n = arguments.length, o = new Array(n), i = 0; i < n; i++) o[i] = arguments[i];
                (r && clearTimeout(r),
                    (r = setTimeout(function () {
                        return e.apply(void 0, o);
                    }, t)));
            };
        }
        function n(e) {
            return { current: e };
        }
        function o(e) {
            return e !== Object(e);
        }
        function i(e, t) {
            if (e === t) return !0;
            if (o(e) || o(t) || 'function' == typeof e || 'function' == typeof t) return e === t;
            if (Object.keys(e).length !== Object.keys(t).length) return !1;
            for (var r = 0, n = Object.keys(e); r < n.length; r++) {
                var u = n[r];
                if (!(u in t)) return !1;
                if (!i(e[u], t[u])) return !1;
            }
            return !0;
        }
        (e.r(t),
            e.d(t, {
                autocomplete: function () {
                    return Un;
                },
            }));
        var u = function () {};
        function a(e) {
            var t = e.item,
                r = e.items,
                n = void 0 === r ? [] : r;
            return {
                index: t.__autocomplete_indexName,
                items: [t],
                positions: [
                    1 +
                        n.findIndex(function (e) {
                            return e.objectID === t.objectID;
                        }),
                ],
                queryID: t.__autocomplete_queryID,
                algoliaSource: ['autocomplete'],
            };
        }
        function c(e, t) {
            return (
                (function (e) {
                    if (Array.isArray(e)) return e;
                })(e) ||
                (function (e, t) {
                    var r = null == e ? null : ('undefined' != typeof Symbol && e[Symbol.iterator]) || e['@@iterator'];
                    if (null != r) {
                        var n,
                            o,
                            i,
                            u,
                            a = [],
                            c = !0,
                            l = !1;
                        try {
                            if (((i = (r = r.call(e)).next), 0 === t)) {
                                if (Object(r) !== r) return;
                                c = !1;
                            } else for (; !(c = (n = i.call(r)).done) && (a.push(n.value), a.length !== t); c = !0);
                        } catch (e) {
                            ((l = !0), (o = e));
                        } finally {
                            try {
                                if (!c && null != r.return && ((u = r.return()), Object(u) !== u)) return;
                            } finally {
                                if (l) throw o;
                            }
                        }
                        return a;
                    }
                })(e, t) ||
                (function (e, t) {
                    if (!e) return;
                    if ('string' == typeof e) return l(e, t);
                    var r = Object.prototype.toString.call(e).slice(8, -1);
                    'Object' === r && e.constructor && (r = e.constructor.name);
                    if ('Map' === r || 'Set' === r) return Array.from(e);
                    if ('Arguments' === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)) return l(e, t);
                })(e, t) ||
                (function () {
                    throw new TypeError(
                        'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                    );
                })()
            );
        }
        function l(e, t) {
            (null == t || t > e.length) && (t = e.length);
            for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
            return n;
        }
        var s = ['items'],
            f = ['items'];
        function p(e) {
            return (
                (p =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                p(e)
            );
        }
        function m(e) {
            return (
                (function (e) {
                    if (Array.isArray(e)) return v(e);
                })(e) ||
                (function (e) {
                    if (('undefined' != typeof Symbol && null != e[Symbol.iterator]) || null != e['@@iterator']) return Array.from(e);
                })(e) ||
                (function (e, t) {
                    if (!e) return;
                    if ('string' == typeof e) return v(e, t);
                    var r = Object.prototype.toString.call(e).slice(8, -1);
                    'Object' === r && e.constructor && (r = e.constructor.name);
                    if ('Map' === r || 'Set' === r) return Array.from(e);
                    if ('Arguments' === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)) return v(e, t);
                })(e) ||
                (function () {
                    throw new TypeError(
                        'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                    );
                })()
            );
        }
        function v(e, t) {
            (null == t || t > e.length) && (t = e.length);
            for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
            return n;
        }
        function y(e, t) {
            if (null == e) return {};
            var r,
                n,
                o = (function (e, t) {
                    if (null == e) return {};
                    var r,
                        n,
                        o = {},
                        i = Object.keys(e);
                    for (n = 0; n < i.length; n++) ((r = i[n]), t.indexOf(r) >= 0 || (o[r] = e[r]));
                    return o;
                })(e, t);
            if (Object.getOwnPropertySymbols) {
                var i = Object.getOwnPropertySymbols(e);
                for (n = 0; n < i.length; n++)
                    ((r = i[n]), t.indexOf(r) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, r) && (o[r] = e[r])));
            }
            return o;
        }
        function d(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function b(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? d(Object(r), !0).forEach(function (t) {
                          g(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : d(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function g(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== p(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== p(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === p(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function h(e) {
            return e.map(function (e) {
                var t = e.items,
                    r = y(e, s);
                return b(
                    b({}, r),
                    {},
                    {
                        objectIDs:
                            (null == t
                                ? void 0
                                : t.map(function (e) {
                                      return e.objectID;
                                  })) || r.objectIDs,
                    }
                );
            });
        }
        function O(e) {
            var t,
                r,
                n,
                o =
                    ((t = c((e.version || '').split('.').map(Number), 2)),
                    (r = t[0]),
                    (n = t[1]),
                    r >= 3 || (2 === r && n >= 4) || (1 === r && n >= 10));
            function i(t, r, n) {
                if (o && void 0 !== n) {
                    var i = n[0].__autocomplete_algoliaCredentials,
                        u = { 'X-Algolia-Application-Id': i.appId, 'X-Algolia-API-Key': i.apiKey };
                    e.apply(void 0, [t].concat(m(r), [{ headers: u }]));
                } else e.apply(void 0, [t].concat(m(r)));
            }
            return {
                init: function (t, r) {
                    e('init', { appId: t, apiKey: r });
                },
                setAuthenticatedUserToken: function (t) {
                    e('setAuthenticatedUserToken', t);
                },
                setUserToken: function (t) {
                    e('setUserToken', t);
                },
                clickedObjectIDsAfterSearch: function () {
                    for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++) t[r] = arguments[r];
                    t.length > 0 && i('clickedObjectIDsAfterSearch', h(t), t[0].items);
                },
                clickedObjectIDs: function () {
                    for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++) t[r] = arguments[r];
                    t.length > 0 && i('clickedObjectIDs', h(t), t[0].items);
                },
                clickedFilters: function () {
                    for (var t = arguments.length, r = new Array(t), n = 0; n < t; n++) r[n] = arguments[n];
                    r.length > 0 && e.apply(void 0, ['clickedFilters'].concat(r));
                },
                convertedObjectIDsAfterSearch: function () {
                    for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++) t[r] = arguments[r];
                    t.length > 0 && i('convertedObjectIDsAfterSearch', h(t), t[0].items);
                },
                convertedObjectIDs: function () {
                    for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++) t[r] = arguments[r];
                    t.length > 0 && i('convertedObjectIDs', h(t), t[0].items);
                },
                convertedFilters: function () {
                    for (var t = arguments.length, r = new Array(t), n = 0; n < t; n++) r[n] = arguments[n];
                    r.length > 0 && e.apply(void 0, ['convertedFilters'].concat(r));
                },
                viewedObjectIDs: function () {
                    for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++) t[r] = arguments[r];
                    t.length > 0 &&
                        t
                            .reduce(function (e, t) {
                                var r = t.items,
                                    n = y(t, f);
                                return [].concat(
                                    m(e),
                                    m(
                                        (function (e) {
                                            for (
                                                var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 20, r = [], n = 0;
                                                n < e.objectIDs.length;
                                                n += t
                                            )
                                                r.push(b(b({}, e), {}, { objectIDs: e.objectIDs.slice(n, n + t) }));
                                            return r;
                                        })(
                                            b(
                                                b({}, n),
                                                {},
                                                {
                                                    objectIDs:
                                                        (null == r
                                                            ? void 0
                                                            : r.map(function (e) {
                                                                  return e.objectID;
                                                              })) || n.objectIDs,
                                                }
                                            )
                                        ).map(function (e) {
                                            return { items: r, payload: e };
                                        })
                                    )
                                );
                            }, [])
                            .forEach(function (e) {
                                var t = e.items;
                                return i('viewedObjectIDs', [e.payload], t);
                            });
                },
                viewedFilters: function () {
                    for (var t = arguments.length, r = new Array(t), n = 0; n < t; n++) r[n] = arguments[n];
                    r.length > 0 && e.apply(void 0, ['viewedFilters'].concat(r));
                },
            };
        }
        function _(e) {
            var t = e.items.reduce(function (e, t) {
                var r;
                return (
                    (e[t.__autocomplete_indexName] = (null !== (r = e[t.__autocomplete_indexName]) && void 0 !== r ? r : []).concat(t)),
                    e
                );
            }, {});
            return Object.keys(t).map(function (e) {
                return { index: e, items: t[e], algoliaSource: ['autocomplete'] };
            });
        }
        function S(e) {
            return e.objectID && e.__autocomplete_indexName && e.__autocomplete_queryID;
        }
        function j(e) {
            return (
                (j =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                j(e)
            );
        }
        function P(e) {
            return (
                (function (e) {
                    if (Array.isArray(e)) return w(e);
                })(e) ||
                (function (e) {
                    if (('undefined' != typeof Symbol && null != e[Symbol.iterator]) || null != e['@@iterator']) return Array.from(e);
                })(e) ||
                (function (e, t) {
                    if (!e) return;
                    if ('string' == typeof e) return w(e, t);
                    var r = Object.prototype.toString.call(e).slice(8, -1);
                    'Object' === r && e.constructor && (r = e.constructor.name);
                    if ('Map' === r || 'Set' === r) return Array.from(e);
                    if ('Arguments' === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)) return w(e, t);
                })(e) ||
                (function () {
                    throw new TypeError(
                        'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                    );
                })()
            );
        }
        function w(e, t) {
            (null == t || t > e.length) && (t = e.length);
            for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
            return n;
        }
        function I(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function E(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? I(Object(r), !0).forEach(function (t) {
                          A(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : I(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function A(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== j(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== j(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === j(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        var D = '2.15.0',
            C = 'https://cdn.jsdelivr.net/npm/search-insights@'.concat(D, '/dist/search-insights.min.js'),
            k = r(function (e) {
                var t = e.onItemsChange,
                    r = e.items,
                    n = e.insights,
                    o = e.state;
                t({
                    insights: n,
                    insightsEvents: _({ items: r }).map(function (e) {
                        return E({ eventName: 'Items Viewed' }, e);
                    }),
                    state: o,
                });
            }, 400);
        function x(e) {
            var t = (function (e) {
                    return E(
                        {
                            onItemsChange: function (e) {
                                var t = e.insights,
                                    r = e.insightsEvents,
                                    n = e.state;
                                t.viewedObjectIDs.apply(
                                    t,
                                    P(
                                        r.map(function (e) {
                                            return E(E({}, e), {}, { algoliaSource: N(e.algoliaSource, n.context) });
                                        })
                                    )
                                );
                            },
                            onSelect: function (e) {
                                var t = e.insights,
                                    r = e.insightsEvents,
                                    n = e.state;
                                t.clickedObjectIDsAfterSearch.apply(
                                    t,
                                    P(
                                        r.map(function (e) {
                                            return E(E({}, e), {}, { algoliaSource: N(e.algoliaSource, n.context) });
                                        })
                                    )
                                );
                            },
                            onActive: u,
                            __autocomplete_clickAnalytics: !0,
                        },
                        e
                    );
                })(e),
                o = t.insightsClient,
                c = t.insightsInitParams,
                l = t.onItemsChange,
                s = t.onSelect,
                f = t.onActive,
                p = t.__autocomplete_clickAnalytics,
                m = o;
            if (
                (o ||
                    (function (e) {
                        if ('undefined' != typeof window) e({ window: window });
                    })(function (e) {
                        var t = e.window,
                            r = t.AlgoliaAnalyticsObject || 'aa';
                        ('string' == typeof r && (m = t[r]),
                            m ||
                                ((t.AlgoliaAnalyticsObject = r),
                                t[r] ||
                                    (t[r] = function () {
                                        t[r].queue || (t[r].queue = []);
                                        for (var e = arguments.length, n = new Array(e), o = 0; o < e; o++) n[o] = arguments[o];
                                        t[r].queue.push(n);
                                    }),
                                (t[r].version = D),
                                (m = t[r]),
                                (function (e) {
                                    try {
                                        var t = e.document.createElement('script');
                                        ((t.async = !0), (t.src = C), (t.onerror = function () {}), document.body.appendChild(t));
                                    } catch (e) {}
                                })(t)));
                    }),
                !m)
            )
                return {};
            c && m('init', E({ partial: !0 }, c));
            var v = O(m),
                y = n([]),
                d = r(function (e) {
                    var t = e.state;
                    if (t.isOpen) {
                        var r = t.collections
                            .reduce(function (e, t) {
                                return [].concat(P(e), P(t.items));
                            }, [])
                            .filter(S);
                        i(
                            y.current.map(function (e) {
                                return e.objectID;
                            }),
                            r.map(function (e) {
                                return e.objectID;
                            })
                        ) || ((y.current = r), r.length > 0 && k({ onItemsChange: l, items: r, insights: v, state: t }));
                    }
                }, 0);
            return {
                name: 'aa.algoliaInsightsPlugin',
                subscribe: function (e) {
                    var t = e.setContext,
                        r = e.onSelect,
                        n = e.onActive;
                    function o(e) {
                        t({
                            algoliaInsightsPlugin: {
                                __algoliaSearchParameters: E(E({}, p ? { clickAnalytics: !0 } : {}), e ? { userToken: T(e) } : {}),
                                insights: v,
                            },
                        });
                    }
                    (m('addAlgoliaAgent', 'insights-plugin'),
                        o(),
                        m('onUserTokenChange', function (e) {
                            o(e);
                        }),
                        m('getUserToken', null, function (e, t) {
                            o(t);
                        }),
                        r(function (e) {
                            var t = e.item,
                                r = e.state,
                                n = e.event,
                                o = e.source;
                            S(t) &&
                                s({
                                    state: r,
                                    event: n,
                                    insights: v,
                                    item: t,
                                    insightsEvents: [E({ eventName: 'Item Selected' }, a({ item: t, items: o.getItems().filter(S) }))],
                                });
                        }),
                        n(function (e) {
                            var t = e.item,
                                r = e.source,
                                n = e.state,
                                o = e.event;
                            S(t) &&
                                f({
                                    state: n,
                                    event: o,
                                    insights: v,
                                    item: t,
                                    insightsEvents: [E({ eventName: 'Item Active' }, a({ item: t, items: r.getItems().filter(S) }))],
                                });
                        }));
                },
                onStateChange: function (e) {
                    var t = e.state;
                    d({ state: t });
                },
                __autocomplete_pluginOptions: e,
            };
        }
        function N() {
            var e,
                t = arguments.length > 1 ? arguments[1] : void 0;
            return [].concat(
                P(arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : []),
                ['autocomplete-internal'],
                P(null !== (e = t.algoliaInsightsPlugin) && void 0 !== e && e.__automaticInsights ? ['autocomplete-automatic'] : [])
            );
        }
        function T(e) {
            return 'number' == typeof e ? e.toString() : e;
        }
        function B(e) {
            return (
                (B =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                B(e)
            );
        }
        function q(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function R(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== B(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== B(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === B(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function L(e, t, r) {
            var n,
                o = t.initialState;
            return {
                getState: function () {
                    return o;
                },
                dispatch: function (n, i) {
                    var u = (function (e) {
                        for (var t = 1; t < arguments.length; t++) {
                            var r = null != arguments[t] ? arguments[t] : {};
                            t % 2
                                ? q(Object(r), !0).forEach(function (t) {
                                      R(e, t, r[t]);
                                  })
                                : Object.getOwnPropertyDescriptors
                                  ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                                  : q(Object(r)).forEach(function (t) {
                                        Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                                    });
                        }
                        return e;
                    })({}, o);
                    ((o = e(o, { type: n, props: t, payload: i })), r({ state: o, prevState: u }));
                },
                pendingRequests:
                    ((n = []),
                    {
                        add: function (e) {
                            return (
                                n.push(e),
                                e.finally(function () {
                                    n = n.filter(function (t) {
                                        return t !== e;
                                    });
                                })
                            );
                        },
                        cancelAll: function () {
                            n.forEach(function (e) {
                                return e.cancel();
                            });
                        },
                        isEmpty: function () {
                            return 0 === n.length;
                        },
                    }),
            };
        }
        function F(e) {
            return e.reduce(function (e, t) {
                return e.concat(t);
            }, []);
        }
        function U(e) {
            return (
                (U =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                U(e)
            );
        }
        function M(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function H(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? M(Object(r), !0).forEach(function (t) {
                          V(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : M(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function V(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== U(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== U(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === U(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function W(e) {
            return 0 === e.collections.length
                ? 0
                : e.collections.reduce(function (e, t) {
                      return e + t.items.length;
                  }, 0);
        }
        var Q = 0;
        function $() {
            return 'autocomplete-'.concat(Q++);
        }
        function K(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function z(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? K(Object(r), !0).forEach(function (t) {
                          G(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : K(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function G(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== J(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== J(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === J(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function J(e) {
            return (
                (J =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                J(e)
            );
        }
        function X(e) {
            return (
                (X =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                X(e)
            );
        }
        function Y(e) {
            return (
                (function (e) {
                    if (Array.isArray(e)) return Z(e);
                })(e) ||
                (function (e) {
                    if (('undefined' != typeof Symbol && null != e[Symbol.iterator]) || null != e['@@iterator']) return Array.from(e);
                })(e) ||
                (function (e, t) {
                    if (!e) return;
                    if ('string' == typeof e) return Z(e, t);
                    var r = Object.prototype.toString.call(e).slice(8, -1);
                    'Object' === r && e.constructor && (r = e.constructor.name);
                    if ('Map' === r || 'Set' === r) return Array.from(e);
                    if ('Arguments' === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)) return Z(e, t);
                })(e) ||
                (function () {
                    throw new TypeError(
                        'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                    );
                })()
            );
        }
        function Z(e, t) {
            (null == t || t > e.length) && (t = e.length);
            for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
            return n;
        }
        function ee(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function te(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? ee(Object(r), !0).forEach(function (t) {
                          re(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : ee(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function re(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== X(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== X(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === X(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function ne(e, t) {
            var r,
                n = 'undefined' != typeof window ? window : {},
                o = e.plugins || [];
            return te(
                te(
                    {
                        debug: !1,
                        openOnFocus: !1,
                        enterKeyHint: void 0,
                        ignoreCompositionEvents: !1,
                        placeholder: '',
                        autoFocus: !1,
                        defaultActiveItemId: null,
                        stallThreshold: 300,
                        insights: void 0,
                        environment: n,
                        shouldPanelOpen: function (e) {
                            return W(e.state) > 0;
                        },
                        reshape: function (e) {
                            return e.sources;
                        },
                    },
                    e
                ),
                {},
                {
                    id: null !== (r = e.id) && void 0 !== r ? r : $(),
                    plugins: o,
                    initialState: te(
                        { activeItemId: null, query: '', completion: null, collections: [], isOpen: !1, status: 'idle', context: {} },
                        e.initialState
                    ),
                    onStateChange: function (t) {
                        var r;
                        (null === (r = e.onStateChange) || void 0 === r || r.call(e, t),
                            o.forEach(function (e) {
                                var r;
                                return null === (r = e.onStateChange) || void 0 === r ? void 0 : r.call(e, t);
                            }));
                    },
                    onSubmit: function (t) {
                        var r;
                        (null === (r = e.onSubmit) || void 0 === r || r.call(e, t),
                            o.forEach(function (e) {
                                var r;
                                return null === (r = e.onSubmit) || void 0 === r ? void 0 : r.call(e, t);
                            }));
                    },
                    onReset: function (t) {
                        var r;
                        (null === (r = e.onReset) || void 0 === r || r.call(e, t),
                            o.forEach(function (e) {
                                var r;
                                return null === (r = e.onReset) || void 0 === r ? void 0 : r.call(e, t);
                            }));
                    },
                    getSources: function (r) {
                        return Promise.all(
                            []
                                .concat(
                                    Y(
                                        o.map(function (e) {
                                            return e.getSources;
                                        })
                                    ),
                                    [e.getSources]
                                )
                                .filter(Boolean)
                                .map(function (e) {
                                    return (function (e, t) {
                                        var r = [];
                                        return Promise.resolve(e(t)).then(function (e) {
                                            return (
                                                Array.isArray(e),
                                                Promise.all(
                                                    e
                                                        .filter(function (e) {
                                                            return Boolean(e);
                                                        })
                                                        .map(function (e) {
                                                            if ((e.sourceId, r.includes(e.sourceId)))
                                                                throw new Error(
                                                                    '[Autocomplete] The `sourceId` '.concat(
                                                                        JSON.stringify(e.sourceId),
                                                                        ' is not unique.'
                                                                    )
                                                                );
                                                            r.push(e.sourceId);
                                                            var t = {
                                                                getItemInputValue: function (e) {
                                                                    return e.state.query;
                                                                },
                                                                getItemUrl: function () {},
                                                                onSelect: function (e) {
                                                                    (0, e.setIsOpen)(!1);
                                                                },
                                                                onActive: u,
                                                                onResolve: u,
                                                            };
                                                            Object.keys(t).forEach(function (e) {
                                                                t[e].__default = !0;
                                                            });
                                                            var n = z(z({}, t), e);
                                                            return Promise.resolve(n);
                                                        })
                                                )
                                            );
                                        });
                                    })(e, r);
                                })
                        )
                            .then(function (e) {
                                return F(e);
                            })
                            .then(function (e) {
                                return e.map(function (e) {
                                    return te(
                                        te({}, e),
                                        {},
                                        {
                                            onSelect: function (r) {
                                                (e.onSelect(r),
                                                    t.forEach(function (e) {
                                                        var t;
                                                        return null === (t = e.onSelect) || void 0 === t ? void 0 : t.call(e, r);
                                                    }));
                                            },
                                            onActive: function (r) {
                                                (e.onActive(r),
                                                    t.forEach(function (e) {
                                                        var t;
                                                        return null === (t = e.onActive) || void 0 === t ? void 0 : t.call(e, r);
                                                    }));
                                            },
                                            onResolve: function (r) {
                                                (e.onResolve(r),
                                                    t.forEach(function (e) {
                                                        var t;
                                                        return null === (t = e.onResolve) || void 0 === t ? void 0 : t.call(e, r);
                                                    }));
                                            },
                                        }
                                    );
                                });
                            });
                    },
                    navigator: te(
                        {
                            navigate: function (e) {
                                var t = e.itemUrl;
                                n.location.assign(t);
                            },
                            navigateNewTab: function (e) {
                                var t = e.itemUrl,
                                    r = n.open(t, '_blank', 'noopener');
                                null == r || r.focus();
                            },
                            navigateNewWindow: function (e) {
                                var t = e.itemUrl;
                                n.open(t, '_blank', 'noopener');
                            },
                        },
                        e.navigator
                    ),
                }
            );
        }
        function oe(e) {
            return (
                (oe =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                oe(e)
            );
        }
        function ie(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function ue(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? ie(Object(r), !0).forEach(function (t) {
                          ae(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : ie(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function ae(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== oe(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== oe(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === oe(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function ce(e) {
            return (
                (ce =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                ce(e)
            );
        }
        function le(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function se(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? le(Object(r), !0).forEach(function (t) {
                          fe(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : le(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function fe(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== ce(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== ce(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === ce(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function pe(e) {
            return (
                (function (e) {
                    if (Array.isArray(e)) return me(e);
                })(e) ||
                (function (e) {
                    if (('undefined' != typeof Symbol && null != e[Symbol.iterator]) || null != e['@@iterator']) return Array.from(e);
                })(e) ||
                (function (e, t) {
                    if (!e) return;
                    if ('string' == typeof e) return me(e, t);
                    var r = Object.prototype.toString.call(e).slice(8, -1);
                    'Object' === r && e.constructor && (r = e.constructor.name);
                    if ('Map' === r || 'Set' === r) return Array.from(e);
                    if ('Arguments' === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)) return me(e, t);
                })(e) ||
                (function () {
                    throw new TypeError(
                        'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                    );
                })()
            );
        }
        function me(e, t) {
            (null == t || t > e.length) && (t = e.length);
            for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
            return n;
        }
        function ve(e) {
            return Boolean(e.execute);
        }
        function ye(e, t, r) {
            if (((o = e), Boolean(null == o ? void 0 : o.execute))) {
                var n =
                    'algolia' === e.requesterId
                        ? Object.assign.apply(
                              Object,
                              [{}].concat(
                                  pe(
                                      Object.keys(r.context).map(function (e) {
                                          var t;
                                          return null === (t = r.context[e]) || void 0 === t ? void 0 : t.__algoliaSearchParameters;
                                      })
                                  )
                              )
                          )
                        : {};
                return se(
                    se({}, e),
                    {},
                    {
                        requests: e.queries.map(function (r) {
                            return {
                                query: 'algolia' === e.requesterId ? se(se({}, r), {}, { params: se(se({}, n), r.params) }) : r,
                                sourceId: t,
                                transformResponse: e.transformResponse,
                            };
                        }),
                    }
                );
            }
            var o;
            return { items: e, sourceId: t };
        }
        function de(e) {
            var t = e
                .reduce(function (e, t) {
                    if (!ve(t)) return (e.push(t), e);
                    var r = t.searchClient,
                        n = t.execute,
                        o = t.requesterId,
                        i = t.requests,
                        u = e.find(function (e) {
                            return ve(t) && ve(e) && e.searchClient === r && Boolean(o) && e.requesterId === o;
                        });
                    if (u) {
                        var a;
                        (a = u.items).push.apply(a, pe(i));
                    } else {
                        var c = { execute: n, requesterId: o, items: i, searchClient: r };
                        e.push(c);
                    }
                    return e;
                }, [])
                .map(function (e) {
                    if (!ve(e)) return Promise.resolve(e);
                    var t = e,
                        r = t.execute,
                        n = t.items;
                    return r({ searchClient: t.searchClient, requests: n });
                });
            return Promise.all(t).then(function (e) {
                return F(e);
            });
        }
        function be(e, t, r) {
            return t.map(function (t) {
                var n,
                    o = e.filter(function (e) {
                        return e.sourceId === t.sourceId;
                    }),
                    i = o.map(function (e) {
                        return e.items;
                    }),
                    u = o[0].transformResponse,
                    a = u
                        ? u({
                              results: (n = i),
                              hits: n
                                  .map(function (e) {
                                      return e.hits;
                                  })
                                  .filter(Boolean),
                              facetHits: n
                                  .map(function (e) {
                                      var t;
                                      return null === (t = e.facetHits) || void 0 === t
                                          ? void 0
                                          : t.map(function (e) {
                                                return {
                                                    label: e.value,
                                                    count: e.count,
                                                    _highlightResult: { label: { value: e.highlighted } },
                                                };
                                            });
                                  })
                                  .filter(Boolean),
                          })
                        : i;
                return (
                    t.onResolve({ source: t, results: i, items: a, state: r.getState() }),
                    Array.isArray(a),
                    a.every(Boolean),
                    'The `getItems` function from source "'
                        .concat(t.sourceId, '" must return an array of items but returned ')
                        .concat(
                            JSON.stringify(void 0),
                            '.\n\nDid you forget to return items?\n\nSee: https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/sources/#param-getitems'
                        ),
                    { source: t, items: a }
                );
            });
        }
        function ge(e, t) {
            var r = t;
            return {
                then: function (t, n) {
                    return ge(e.then(_e(t, r, e), _e(n, r, e)), r);
                },
                catch: function (t) {
                    return ge(e.catch(_e(t, r, e)), r);
                },
                finally: function (t) {
                    return (
                        t && r.onCancelList.push(t),
                        ge(
                            e.finally(
                                _e(
                                    t &&
                                        function () {
                                            return ((r.onCancelList = []), t());
                                        },
                                    r,
                                    e
                                )
                            ),
                            r
                        )
                    );
                },
                cancel: function () {
                    r.isCanceled = !0;
                    var e = r.onCancelList;
                    ((r.onCancelList = []),
                        e.forEach(function (e) {
                            e();
                        }));
                },
                isCanceled: function () {
                    return !0 === r.isCanceled;
                },
            };
        }
        function he(e) {
            return ge(
                new Promise(function (t, r) {
                    return e(t, r);
                }),
                { isCanceled: !1, onCancelList: [] }
            );
        }
        function Oe(e) {
            return ge(e, { isCanceled: !1, onCancelList: [] });
        }
        function _e(e, t, r) {
            return e
                ? function (r) {
                      return t.isCanceled ? r : e(r);
                  }
                : r;
        }
        function Se(e) {
            var t = (function (e) {
                var t = e.collections
                    .map(function (e) {
                        return e.items.length;
                    })
                    .reduce(function (e, t, r) {
                        var n = (e[r - 1] || 0) + t;
                        return (e.push(n), e);
                    }, [])
                    .reduce(function (t, r) {
                        return r <= e.activeItemId ? t + 1 : t;
                    }, 0);
                return e.collections[t];
            })(e);
            if (!t) return null;
            var r =
                    t.items[
                        (function (e) {
                            for (var t = e.state, r = e.collection, n = !1, o = 0, i = 0; !1 === n; ) {
                                var u = t.collections[o];
                                if (u === r) {
                                    n = !0;
                                    break;
                                }
                                ((i += u.items.length), o++);
                            }
                            return t.activeItemId - i;
                        })({ state: e, collection: t })
                    ],
                n = t.source;
            return {
                item: r,
                itemInputValue: n.getItemInputValue({ item: r, state: e }),
                itemUrl: n.getItemUrl({ item: r, state: e }),
                source: n,
            };
        }
        function je(e) {
            return (
                (je =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                je(e)
            );
        }
        ((he.resolve = function (e) {
            return Oe(Promise.resolve(e));
        }),
            (he.reject = function (e) {
                return Oe(Promise.reject(e));
            }));
        var Pe = ['event', 'nextState', 'props', 'query', 'refresh', 'store'];
        function we(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function Ie(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? we(Object(r), !0).forEach(function (t) {
                          Ee(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : we(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function Ee(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== je(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== je(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === je(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function Ae(e, t) {
            if (null == e) return {};
            var r,
                n,
                o = (function (e, t) {
                    if (null == e) return {};
                    var r,
                        n,
                        o = {},
                        i = Object.keys(e);
                    for (n = 0; n < i.length; n++) ((r = i[n]), t.indexOf(r) >= 0 || (o[r] = e[r]));
                    return o;
                })(e, t);
            if (Object.getOwnPropertySymbols) {
                var i = Object.getOwnPropertySymbols(e);
                for (n = 0; n < i.length; n++)
                    ((r = i[n]), t.indexOf(r) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, r) && (o[r] = e[r])));
            }
            return o;
        }
        var De,
            Ce,
            ke,
            xe = null,
            Ne =
                ((De = -1),
                (Ce = -1),
                (ke = void 0),
                function (e) {
                    var t = ++De;
                    return Promise.resolve(e).then(function (e) {
                        return ke && t < Ce ? ke : ((Ce = t), (ke = e), e);
                    });
                });
        function Te(e) {
            var t = e.event,
                r = e.nextState,
                n = void 0 === r ? {} : r,
                o = e.props,
                i = e.query,
                u = e.refresh,
                a = e.store,
                c = Ae(e, Pe);
            xe && o.environment.clearTimeout(xe);
            var l = c.setCollections,
                s = c.setIsOpen,
                f = c.setQuery,
                p = c.setActiveItemId,
                m = c.setStatus,
                v = c.setContext;
            if ((f(i), p(o.defaultActiveItemId), !i && !1 === o.openOnFocus)) {
                var y,
                    d = a.getState().collections.map(function (e) {
                        return Ie(Ie({}, e), {}, { items: [] });
                    });
                (m('idle'), l(d), s(null !== (y = n.isOpen) && void 0 !== y ? y : o.shouldPanelOpen({ state: a.getState() })));
                var b = Oe(
                    Ne(d).then(function () {
                        return Promise.resolve();
                    })
                );
                return a.pendingRequests.add(b);
            }
            (m('loading'),
                (xe = o.environment.setTimeout(function () {
                    m('stalled');
                }, o.stallThreshold)));
            var g = Oe(
                Ne(
                    o.getSources(Ie({ query: i, refresh: u, state: a.getState() }, c)).then(function (e) {
                        return Promise.all(
                            e.map(function (e) {
                                return Promise.resolve(e.getItems(Ie({ query: i, refresh: u, state: a.getState() }, c))).then(function (t) {
                                    return ye(t, e.sourceId, a.getState());
                                });
                            })
                        )
                            .then(de)
                            .then(function (t) {
                                var r,
                                    n = t.some(function (e) {
                                        return (function (e) {
                                            return !Array.isArray(e) && Boolean(null == e ? void 0 : e._automaticInsights);
                                        })(e.items);
                                    });
                                n &&
                                    v({
                                        algoliaInsightsPlugin: Ie(
                                            Ie(
                                                {},
                                                (null === (r = a.getState().context) || void 0 === r ? void 0 : r.algoliaInsightsPlugin) ||
                                                    {}
                                            ),
                                            {},
                                            { __automaticInsights: n }
                                        ),
                                    });
                                return be(t, e, a);
                            })
                            .then(function (e) {
                                return (function (e) {
                                    var t = e.collections,
                                        r = e.props,
                                        n = e.state,
                                        o = t.reduce(function (e, t) {
                                            return ue(
                                                ue({}, e),
                                                {},
                                                ae(
                                                    {},
                                                    t.source.sourceId,
                                                    ue(
                                                        ue({}, t.source),
                                                        {},
                                                        {
                                                            getItems: function () {
                                                                return F(t.items);
                                                            },
                                                        }
                                                    )
                                                )
                                            );
                                        }, {}),
                                        i = r.plugins.reduce(
                                            function (e, t) {
                                                return t.reshape ? t.reshape(e) : e;
                                            },
                                            { sourcesBySourceId: o, state: n }
                                        ).sourcesBySourceId;
                                    return F(r.reshape({ sourcesBySourceId: i, sources: Object.values(i), state: n }))
                                        .filter(Boolean)
                                        .map(function (e) {
                                            return { source: e, items: e.getItems() };
                                        });
                                })({ collections: e, props: o, state: a.getState() });
                            });
                    })
                )
            )
                .then(function (e) {
                    var r;
                    (m('idle'), l(e));
                    var f = o.shouldPanelOpen({ state: a.getState() });
                    s(null !== (r = n.isOpen) && void 0 !== r ? r : (o.openOnFocus && !i && f) || f);
                    var p = Se(a.getState());
                    if (null !== a.getState().activeItemId && p) {
                        var v = p.item,
                            y = p.itemInputValue,
                            d = p.itemUrl,
                            b = p.source;
                        b.onActive(Ie({ event: t, item: v, itemInputValue: y, itemUrl: d, refresh: u, source: b, state: a.getState() }, c));
                    }
                })
                .finally(function () {
                    (m('idle'), xe && o.environment.clearTimeout(xe));
                });
            return a.pendingRequests.add(g);
        }
        function Be(e, t, r) {
            return [e, null == r ? void 0 : r.sourceId, t].filter(Boolean).join('-').replace(/\s/g, '');
        }
        function qe(e) {
            return (
                (qe =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                qe(e)
            );
        }
        var Re = ['event', 'props', 'refresh', 'store'];
        function Le(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function Fe(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? Le(Object(r), !0).forEach(function (t) {
                          Ue(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : Le(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function Ue(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== qe(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== qe(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === qe(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function Me(e, t) {
            if (null == e) return {};
            var r,
                n,
                o = (function (e, t) {
                    if (null == e) return {};
                    var r,
                        n,
                        o = {},
                        i = Object.keys(e);
                    for (n = 0; n < i.length; n++) ((r = i[n]), t.indexOf(r) >= 0 || (o[r] = e[r]));
                    return o;
                })(e, t);
            if (Object.getOwnPropertySymbols) {
                var i = Object.getOwnPropertySymbols(e);
                for (n = 0; n < i.length; n++)
                    ((r = i[n]), t.indexOf(r) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, r) && (o[r] = e[r])));
            }
            return o;
        }
        var He = /((gt|sm)-|galaxy nexus)|samsung[- ]|samsungbrowser/i;
        function Ve(e) {
            return e.nativeEvent || e;
        }
        function We(e) {
            return (
                (We =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                We(e)
            );
        }
        var Qe = ['props', 'refresh', 'store'],
            $e = ['inputElement', 'formElement', 'panelElement'],
            Ke = ['inputElement'],
            ze = ['inputElement', 'maxLength'],
            Ge = ['source'],
            Je = ['item', 'source'];
        function Xe(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function Ye(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? Xe(Object(r), !0).forEach(function (t) {
                          Ze(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : Xe(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function Ze(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== We(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== We(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === We(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function et(e, t) {
            if (null == e) return {};
            var r,
                n,
                o = (function (e, t) {
                    if (null == e) return {};
                    var r,
                        n,
                        o = {},
                        i = Object.keys(e);
                    for (n = 0; n < i.length; n++) ((r = i[n]), t.indexOf(r) >= 0 || (o[r] = e[r]));
                    return o;
                })(e, t);
            if (Object.getOwnPropertySymbols) {
                var i = Object.getOwnPropertySymbols(e);
                for (n = 0; n < i.length; n++)
                    ((r = i[n]), t.indexOf(r) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, r) && (o[r] = e[r])));
            }
            return o;
        }
        function tt(e) {
            var t = e.props,
                r = e.refresh,
                n = e.store,
                o = et(e, Qe);
            return {
                getEnvironmentProps: function (e) {
                    var r = e.inputElement,
                        o = e.formElement,
                        i = e.panelElement;
                    function u(e) {
                        (!n.getState().isOpen && n.pendingRequests.isEmpty()) ||
                            e.target === r ||
                            (!1 ===
                                [o, i].some(function (t) {
                                    return ((r = t), (n = e.target), r === n || r.contains(n));
                                    var r, n;
                                }) &&
                                (n.dispatch('blur', null), t.debug || n.pendingRequests.cancelAll()));
                    }
                    return Ye(
                        {
                            onTouchStart: u,
                            onMouseDown: u,
                            onTouchMove: function (e) {
                                !1 !== n.getState().isOpen && r === t.environment.document.activeElement && e.target !== r && r.blur();
                            },
                        },
                        et(e, $e)
                    );
                },
                getRootProps: function (e) {
                    return Ye(
                        {
                            role: 'combobox',
                            'aria-expanded': n.getState().isOpen,
                            'aria-haspopup': 'listbox',
                            'aria-controls': n.getState().isOpen
                                ? n
                                      .getState()
                                      .collections.map(function (e) {
                                          var r = e.source;
                                          return Be(t.id, 'list', r);
                                      })
                                      .join(' ')
                                : void 0,
                            'aria-labelledby': Be(t.id, 'label'),
                        },
                        e
                    );
                },
                getFormProps: function (e) {
                    e.inputElement;
                    return Ye(
                        {
                            action: '',
                            noValidate: !0,
                            role: 'search',
                            onSubmit: function (i) {
                                var u;
                                (i.preventDefault(),
                                    t.onSubmit(Ye({ event: i, refresh: r, state: n.getState() }, o)),
                                    n.dispatch('submit', null),
                                    null === (u = e.inputElement) || void 0 === u || u.blur());
                            },
                            onReset: function (i) {
                                var u;
                                (i.preventDefault(),
                                    t.onReset(Ye({ event: i, refresh: r, state: n.getState() }, o)),
                                    n.dispatch('reset', null),
                                    null === (u = e.inputElement) || void 0 === u || u.focus());
                            },
                        },
                        et(e, Ke)
                    );
                },
                getLabelProps: function (e) {
                    return Ye({ htmlFor: Be(t.id, 'input'), id: Be(t.id, 'label') }, e);
                },
                getInputProps: function (e) {
                    var i;
                    function a(e) {
                        ((t.openOnFocus || Boolean(n.getState().query)) &&
                            Te(Ye({ event: e, props: t, query: n.getState().completion || n.getState().query, refresh: r, store: n }, o)),
                            n.dispatch('focus', null));
                    }
                    var c = e || {},
                        l = (c.inputElement, c.maxLength),
                        s = void 0 === l ? 512 : l,
                        f = et(c, ze),
                        p = Se(n.getState()),
                        m = (function (e) {
                            return Boolean(e && e.match(He));
                        })((null === (i = t.environment.navigator) || void 0 === i ? void 0 : i.userAgent) || ''),
                        v = t.enterKeyHint || (null != p && p.itemUrl && !m ? 'go' : 'search');
                    return Ye(
                        {
                            'aria-autocomplete': 'both',
                            'aria-activedescendant':
                                n.getState().isOpen && null !== n.getState().activeItemId
                                    ? Be(t.id, 'item-'.concat(n.getState().activeItemId), null == p ? void 0 : p.source)
                                    : void 0,
                            'aria-controls': n.getState().isOpen
                                ? n
                                      .getState()
                                      .collections.map(function (e) {
                                          var r = e.source;
                                          return Be(t.id, 'list', r);
                                      })
                                      .join(' ')
                                : void 0,
                            'aria-labelledby': Be(t.id, 'label'),
                            value: n.getState().completion || n.getState().query,
                            id: Be(t.id, 'input'),
                            autoComplete: 'off',
                            autoCorrect: 'off',
                            autoCapitalize: 'off',
                            enterKeyHint: v,
                            spellCheck: 'false',
                            autoFocus: t.autoFocus,
                            placeholder: t.placeholder,
                            maxLength: s,
                            type: 'search',
                            onChange: function (e) {
                                var i = e.currentTarget.value;
                                t.ignoreCompositionEvents && Ve(e).isComposing
                                    ? o.setQuery(i)
                                    : Te(Ye({ event: e, props: t, query: i.slice(0, s), refresh: r, store: n }, o));
                            },
                            onCompositionEnd: function (e) {
                                Te(Ye({ event: e, props: t, query: e.currentTarget.value.slice(0, s), refresh: r, store: n }, o));
                            },
                            onKeyDown: function (e) {
                                Ve(e).isComposing ||
                                    (function (e) {
                                        var t = e.event,
                                            r = e.props,
                                            n = e.refresh,
                                            o = e.store,
                                            i = Me(e, Re);
                                        if ('ArrowUp' === t.key || 'ArrowDown' === t.key) {
                                            var u = function () {
                                                    var e = Se(o.getState()),
                                                        t = r.environment.document.getElementById(
                                                            Be(
                                                                r.id,
                                                                'item-'.concat(o.getState().activeItemId),
                                                                null == e ? void 0 : e.source
                                                            )
                                                        );
                                                    t && (t.scrollIntoViewIfNeeded ? t.scrollIntoViewIfNeeded(!1) : t.scrollIntoView(!1));
                                                },
                                                a = function () {
                                                    var e = Se(o.getState());
                                                    if (null !== o.getState().activeItemId && e) {
                                                        var r = e.item,
                                                            u = e.itemInputValue,
                                                            a = e.itemUrl,
                                                            c = e.source;
                                                        c.onActive(
                                                            Fe(
                                                                {
                                                                    event: t,
                                                                    item: r,
                                                                    itemInputValue: u,
                                                                    itemUrl: a,
                                                                    refresh: n,
                                                                    source: c,
                                                                    state: o.getState(),
                                                                },
                                                                i
                                                            )
                                                        );
                                                    }
                                                };
                                            (t.preventDefault(),
                                                !1 === o.getState().isOpen && (r.openOnFocus || Boolean(o.getState().query))
                                                    ? Te(
                                                          Fe({ event: t, props: r, query: o.getState().query, refresh: n, store: o }, i)
                                                      ).then(function () {
                                                          (o.dispatch(t.key, { nextActiveItemId: r.defaultActiveItemId }),
                                                              a(),
                                                              setTimeout(u, 0));
                                                      })
                                                    : (o.dispatch(t.key, {}), a(), u()));
                                        } else if ('Escape' === t.key)
                                            (t.preventDefault(), o.dispatch(t.key, null), o.pendingRequests.cancelAll());
                                        else if ('Tab' === t.key) (o.dispatch('blur', null), o.pendingRequests.cancelAll());
                                        else if ('Enter' === t.key) {
                                            if (
                                                null === o.getState().activeItemId ||
                                                o.getState().collections.every(function (e) {
                                                    return 0 === e.items.length;
                                                })
                                            )
                                                return void (r.debug || o.pendingRequests.cancelAll());
                                            t.preventDefault();
                                            var c = Se(o.getState()),
                                                l = c.item,
                                                s = c.itemInputValue,
                                                f = c.itemUrl,
                                                p = c.source;
                                            if (t.metaKey || t.ctrlKey)
                                                void 0 !== f &&
                                                    (p.onSelect(
                                                        Fe(
                                                            {
                                                                event: t,
                                                                item: l,
                                                                itemInputValue: s,
                                                                itemUrl: f,
                                                                refresh: n,
                                                                source: p,
                                                                state: o.getState(),
                                                            },
                                                            i
                                                        )
                                                    ),
                                                    r.navigator.navigateNewTab({ itemUrl: f, item: l, state: o.getState() }));
                                            else if (t.shiftKey)
                                                void 0 !== f &&
                                                    (p.onSelect(
                                                        Fe(
                                                            {
                                                                event: t,
                                                                item: l,
                                                                itemInputValue: s,
                                                                itemUrl: f,
                                                                refresh: n,
                                                                source: p,
                                                                state: o.getState(),
                                                            },
                                                            i
                                                        )
                                                    ),
                                                    r.navigator.navigateNewWindow({ itemUrl: f, item: l, state: o.getState() }));
                                            else if (t.altKey);
                                            else {
                                                if (void 0 !== f)
                                                    return (
                                                        p.onSelect(
                                                            Fe(
                                                                {
                                                                    event: t,
                                                                    item: l,
                                                                    itemInputValue: s,
                                                                    itemUrl: f,
                                                                    refresh: n,
                                                                    source: p,
                                                                    state: o.getState(),
                                                                },
                                                                i
                                                            )
                                                        ),
                                                        void r.navigator.navigate({ itemUrl: f, item: l, state: o.getState() })
                                                    );
                                                Te(
                                                    Fe({ event: t, nextState: { isOpen: !1 }, props: r, query: s, refresh: n, store: o }, i)
                                                ).then(function () {
                                                    p.onSelect(
                                                        Fe(
                                                            {
                                                                event: t,
                                                                item: l,
                                                                itemInputValue: s,
                                                                itemUrl: f,
                                                                refresh: n,
                                                                source: p,
                                                                state: o.getState(),
                                                            },
                                                            i
                                                        )
                                                    );
                                                });
                                            }
                                        }
                                    })(Ye({ event: e, props: t, refresh: r, store: n }, o));
                            },
                            onFocus: a,
                            onBlur: u,
                            onClick: function (r) {
                                e.inputElement !== t.environment.document.activeElement || n.getState().isOpen || a(r);
                            },
                        },
                        f
                    );
                },
                getPanelProps: function (e) {
                    return Ye(
                        {
                            onMouseDown: function (e) {
                                e.preventDefault();
                            },
                            onMouseLeave: function () {
                                n.dispatch('mouseleave', null);
                            },
                        },
                        e
                    );
                },
                getListProps: function (e) {
                    var r = e || {},
                        n = r.source,
                        o = et(r, Ge);
                    return Ye({ role: 'listbox', 'aria-labelledby': Be(t.id, 'label'), id: Be(t.id, 'list', n) }, o);
                },
                getItemProps: function (e) {
                    var i = e.item,
                        u = e.source,
                        a = et(e, Je);
                    return Ye(
                        {
                            id: Be(t.id, 'item-'.concat(i.__autocomplete_id), u),
                            role: 'option',
                            'aria-selected': n.getState().activeItemId === i.__autocomplete_id,
                            onMouseMove: function (e) {
                                if (i.__autocomplete_id !== n.getState().activeItemId) {
                                    n.dispatch('mousemove', i.__autocomplete_id);
                                    var t = Se(n.getState());
                                    if (null !== n.getState().activeItemId && t) {
                                        var u = t.item,
                                            a = t.itemInputValue,
                                            c = t.itemUrl,
                                            l = t.source;
                                        l.onActive(
                                            Ye(
                                                {
                                                    event: e,
                                                    item: u,
                                                    itemInputValue: a,
                                                    itemUrl: c,
                                                    refresh: r,
                                                    source: l,
                                                    state: n.getState(),
                                                },
                                                o
                                            )
                                        );
                                    }
                                }
                            },
                            onMouseDown: function (e) {
                                e.preventDefault();
                            },
                            onClick: function (e) {
                                var a = u.getItemInputValue({ item: i, state: n.getState() }),
                                    c = u.getItemUrl({ item: i, state: n.getState() });
                                (c
                                    ? Promise.resolve()
                                    : Te(Ye({ event: e, nextState: { isOpen: !1 }, props: t, query: a, refresh: r, store: n }, o))
                                ).then(function () {
                                    u.onSelect(
                                        Ye(
                                            {
                                                event: e,
                                                item: i,
                                                itemInputValue: a,
                                                itemUrl: c,
                                                refresh: r,
                                                source: u,
                                                state: n.getState(),
                                            },
                                            o
                                        )
                                    );
                                });
                            },
                        },
                        a
                    );
                },
            };
        }
        var rt = '1.17.8',
            nt = [{ segment: 'autocomplete-core', version: rt }];
        function ot(e) {
            return (
                (ot =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                ot(e)
            );
        }
        function it(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function ut(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? it(Object(r), !0).forEach(function (t) {
                          at(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : it(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function at(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== ot(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== ot(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === ot(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function ct(e) {
            var t,
                r,
                n,
                o,
                i = e.plugins,
                u = e.options,
                a =
                    null === (t = ((null === (r = u.__autocomplete_metadata) || void 0 === r ? void 0 : r.userAgents) || [])[0]) ||
                    void 0 === t
                        ? void 0
                        : t.segment,
                c = a ? at({}, a, Object.keys((null === (n = u.__autocomplete_metadata) || void 0 === n ? void 0 : n.options) || {})) : {};
            return {
                plugins: i.map(function (e) {
                    return { name: e.name, options: Object.keys(e.__autocomplete_pluginOptions || []) };
                }),
                options: ut({ 'autocomplete-core': Object.keys(u) }, c),
                ua: nt.concat((null === (o = u.__autocomplete_metadata) || void 0 === o ? void 0 : o.userAgents) || []),
            };
        }
        function lt(e) {
            var t,
                r = e.state;
            return !1 === r.isOpen || null === r.activeItemId
                ? null
                : (null === (t = Se(r)) || void 0 === t ? void 0 : t.itemInputValue) || null;
        }
        function st(e, t, r, n) {
            if (!r) return null;
            if (e < 0 && (null === t || (null !== n && 0 === t))) return r + e;
            var o = (null === t ? -1 : t) + e;
            return o <= -1 || o >= r ? (null === n ? null : 0) : o;
        }
        function ft(e) {
            return (
                (ft =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                ft(e)
            );
        }
        function pt(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function mt(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? pt(Object(r), !0).forEach(function (t) {
                          vt(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : pt(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function vt(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== ft(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== ft(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === ft(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        var yt = function (e, t) {
            switch (t.type) {
                case 'setActiveItemId':
                case 'mousemove':
                    return mt(mt({}, e), {}, { activeItemId: t.payload });
                case 'setQuery':
                    return mt(mt({}, e), {}, { query: t.payload, completion: null });
                case 'setCollections':
                    return mt(mt({}, e), {}, { collections: t.payload });
                case 'setIsOpen':
                    return mt(mt({}, e), {}, { isOpen: t.payload });
                case 'setStatus':
                    return mt(mt({}, e), {}, { status: t.payload });
                case 'setContext':
                    return mt(mt({}, e), {}, { context: mt(mt({}, e.context), t.payload) });
                case 'ArrowDown':
                    var r = mt(
                        mt({}, e),
                        {},
                        {
                            activeItemId: t.payload.hasOwnProperty('nextActiveItemId')
                                ? t.payload.nextActiveItemId
                                : st(1, e.activeItemId, W(e), t.props.defaultActiveItemId),
                        }
                    );
                    return mt(mt({}, r), {}, { completion: lt({ state: r }) });
                case 'ArrowUp':
                    var n = mt(mt({}, e), {}, { activeItemId: st(-1, e.activeItemId, W(e), t.props.defaultActiveItemId) });
                    return mt(mt({}, n), {}, { completion: lt({ state: n }) });
                case 'Escape':
                    return e.isOpen
                        ? mt(mt({}, e), {}, { activeItemId: null, isOpen: !1, completion: null })
                        : mt(mt({}, e), {}, { activeItemId: null, query: '', status: 'idle', collections: [] });
                case 'submit':
                    return mt(mt({}, e), {}, { activeItemId: null, isOpen: !1, status: 'idle' });
                case 'reset':
                    return mt(
                        mt({}, e),
                        {},
                        {
                            activeItemId: !0 === t.props.openOnFocus ? t.props.defaultActiveItemId : null,
                            status: 'idle',
                            completion: null,
                            query: '',
                        }
                    );
                case 'focus':
                    return mt(
                        mt({}, e),
                        {},
                        {
                            activeItemId: t.props.defaultActiveItemId,
                            isOpen: (t.props.openOnFocus || Boolean(e.query)) && t.props.shouldPanelOpen({ state: e }),
                        }
                    );
                case 'blur':
                    return t.props.debug ? e : mt(mt({}, e), {}, { isOpen: !1, activeItemId: null });
                case 'mouseleave':
                    return mt(mt({}, e), {}, { activeItemId: t.props.defaultActiveItemId });
                default:
                    return ('The reducer action '.concat(JSON.stringify(t.type), ' is not supported.'), e);
            }
        };
        function dt(e) {
            return (
                (dt =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                dt(e)
            );
        }
        function bt(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function gt(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? bt(Object(r), !0).forEach(function (t) {
                          ht(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : bt(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function ht(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== dt(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== dt(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === dt(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function Ot(e) {
            var t = [],
                r = ne(e, t),
                n = L(yt, r, function (e) {
                    var t,
                        n,
                        i = e.prevState,
                        l = e.state;
                    if (
                        (r.onStateChange(gt({ prevState: i, state: l, refresh: u, navigator: r.navigator }, o)),
                        !c() &&
                            null !== (t = l.context) &&
                            void 0 !== t &&
                            null !== (n = t.algoliaInsightsPlugin) &&
                            void 0 !== n &&
                            n.__automaticInsights &&
                            !1 !== r.insights)
                    ) {
                        var s = x({ __autocomplete_clickAnalytics: !1 });
                        (r.plugins.push(s), a([s]));
                    }
                }),
                o = (function (e) {
                    var t = e.store;
                    return {
                        setActiveItemId: function (e) {
                            t.dispatch('setActiveItemId', e);
                        },
                        setQuery: function (e) {
                            t.dispatch('setQuery', e);
                        },
                        setCollections: function (e) {
                            var r = 0,
                                n = e.map(function (e) {
                                    return H(
                                        H({}, e),
                                        {},
                                        {
                                            items: F(e.items).map(function (e) {
                                                return H(H({}, e), {}, { __autocomplete_id: r++ });
                                            }),
                                        }
                                    );
                                });
                            t.dispatch('setCollections', n);
                        },
                        setIsOpen: function (e) {
                            t.dispatch('setIsOpen', e);
                        },
                        setStatus: function (e) {
                            t.dispatch('setStatus', e);
                        },
                        setContext: function (e) {
                            t.dispatch('setContext', e);
                        },
                    };
                })({ store: n }),
                i = tt(gt({ props: r, refresh: u, store: n, navigator: r.navigator }, o));
            function u() {
                return Te(
                    gt(
                        {
                            event: new Event('input'),
                            nextState: { isOpen: n.getState().isOpen },
                            props: r,
                            navigator: r.navigator,
                            query: n.getState().query,
                            refresh: u,
                            store: n,
                        },
                        o
                    )
                );
            }
            function a(e) {
                e.forEach(function (e) {
                    var n;
                    return null === (n = e.subscribe) || void 0 === n
                        ? void 0
                        : n.call(
                              e,
                              gt(
                                  gt({}, o),
                                  {},
                                  {
                                      navigator: r.navigator,
                                      refresh: u,
                                      onSelect: function (e) {
                                          t.push({ onSelect: e });
                                      },
                                      onActive: function (e) {
                                          t.push({ onActive: e });
                                      },
                                      onResolve: function (e) {
                                          t.push({ onResolve: e });
                                      },
                                  }
                              )
                          );
                });
            }
            function c() {
                return r.plugins.some(function (e) {
                    return 'aa.algoliaInsightsPlugin' === e.name;
                });
            }
            if (r.insights && !c()) {
                var l = 'boolean' == typeof r.insights ? {} : r.insights;
                r.plugins.push(x(l));
            }
            return (
                a(r.plugins),
                (function (e) {
                    var t,
                        r,
                        n = e.metadata,
                        o = e.environment;
                    if (
                        null === (t = o.navigator) || void 0 === t || null === (r = t.userAgent) || void 0 === r
                            ? void 0
                            : r.includes('Algolia Crawler')
                    ) {
                        var i = o.document.createElement('meta'),
                            u = o.document.querySelector('head');
                        ((i.name = 'algolia:metadata'),
                            setTimeout(function () {
                                ((i.content = JSON.stringify(n)), u.appendChild(i));
                            }, 0));
                    }
                })({ metadata: ct({ plugins: r.plugins, options: e }), environment: r.environment }),
                gt(gt({ refresh: u, navigator: r.navigator }, i), o)
            );
        }
        var _t = function (e, t, r, n) {
                var o;
                t[0] = 0;
                for (var i = 1; i < t.length; i++) {
                    var u = t[i++],
                        a = t[i] ? ((t[0] |= u ? 1 : 2), r[t[i++]]) : t[++i];
                    3 === u
                        ? (n[0] = a)
                        : 4 === u
                          ? (n[1] = Object.assign(n[1] || {}, a))
                          : 5 === u
                            ? ((n[1] = n[1] || {})[t[++i]] = a)
                            : 6 === u
                              ? (n[1][t[++i]] += a + '')
                              : u
                                ? ((o = e.apply(a, _t(e, a, r, ['', null]))), n.push(o), a[0] ? (t[0] |= 2) : ((t[i - 2] = 0), (t[i] = o)))
                                : n.push(a);
                }
                return n;
            },
            St = new Map();
        function jt(e) {
            var t = St.get(this);
            return (
                t || ((t = new Map()), St.set(this, t)),
                (t = _t(
                    this,
                    t.get(e) ||
                        (t.set(
                            e,
                            (t = (function (e) {
                                for (
                                    var t,
                                        r,
                                        n = 1,
                                        o = '',
                                        i = '',
                                        u = [0],
                                        a = function (e) {
                                            (1 === n && (e || (o = o.replace(/^\s*\n\s*|\s*\n\s*$/g, '')))
                                                ? u.push(0, e, o)
                                                : 3 === n && (e || o)
                                                  ? (u.push(3, e, o), (n = 2))
                                                  : 2 === n && '...' === o && e
                                                    ? u.push(4, e, 0)
                                                    : 2 === n && o && !e
                                                      ? u.push(5, 0, !0, o)
                                                      : n >= 5 &&
                                                        ((o || (!e && 5 === n)) && (u.push(n, 0, o, r), (n = 6)),
                                                        e && (u.push(n, e, 0, r), (n = 6))),
                                                (o = ''));
                                        },
                                        c = 0;
                                    c < e.length;
                                    c++
                                ) {
                                    c && (1 === n && a(), a(c));
                                    for (var l = 0; l < e[c].length; l++)
                                        ((t = e[c][l]),
                                            1 === n
                                                ? '<' === t
                                                    ? (a(), (u = [u]), (n = 3))
                                                    : (o += t)
                                                : 4 === n
                                                  ? '--' === o && '>' === t
                                                      ? ((n = 1), (o = ''))
                                                      : (o = t + o[0])
                                                  : i
                                                    ? t === i
                                                        ? (i = '')
                                                        : (o += t)
                                                    : '"' === t || "'" === t
                                                      ? (i = t)
                                                      : '>' === t
                                                        ? (a(), (n = 1))
                                                        : n &&
                                                          ('=' === t
                                                              ? ((n = 5), (r = o), (o = ''))
                                                              : '/' === t && (n < 5 || '>' === e[c][l + 1])
                                                                ? (a(), 3 === n && (u = u[0]), (n = u), (u = u[0]).push(2, 0, n), (n = 0))
                                                                : ' ' === t || '\t' === t || '\n' === t || '\r' === t
                                                                  ? (a(), (n = 2))
                                                                  : (o += t)),
                                            3 === n && '!--' === o && ((n = 4), (u = u[0])));
                                }
                                return (a(), u);
                            })(e))
                        ),
                        t),
                    arguments,
                    []
                )).length > 1
                    ? t
                    : t[0]
            );
        }
        var Pt = function (e) {
                var t = e.environment,
                    r = t.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                (r.setAttribute('class', 'aa-SubmitIcon'),
                    r.setAttribute('viewBox', '0 0 24 24'),
                    r.setAttribute('width', '20'),
                    r.setAttribute('height', '20'),
                    r.setAttribute('fill', 'currentColor'));
                var n = t.document.createElementNS('http://www.w3.org/2000/svg', 'path');
                return (
                    n.setAttribute(
                        'd',
                        'M16.041 15.856c-0.034 0.026-0.067 0.055-0.099 0.087s-0.060 0.064-0.087 0.099c-1.258 1.213-2.969 1.958-4.855 1.958-1.933 0-3.682-0.782-4.95-2.050s-2.050-3.017-2.050-4.95 0.782-3.682 2.050-4.95 3.017-2.050 4.95-2.050 3.682 0.782 4.95 2.050 2.050 3.017 2.050 4.95c0 1.886-0.745 3.597-1.959 4.856zM21.707 20.293l-3.675-3.675c1.231-1.54 1.968-3.493 1.968-5.618 0-2.485-1.008-4.736-2.636-6.364s-3.879-2.636-6.364-2.636-4.736 1.008-6.364 2.636-2.636 3.879-2.636 6.364 1.008 4.736 2.636 6.364 3.879 2.636 6.364 2.636c2.125 0 4.078-0.737 5.618-1.968l3.675 3.675c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414z'
                    ),
                    r.appendChild(n),
                    r
                );
            },
            wt = function (e) {
                var t = e.environment,
                    r = t.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                (r.setAttribute('class', 'aa-ClearIcon'),
                    r.setAttribute('viewBox', '0 0 24 24'),
                    r.setAttribute('width', '18'),
                    r.setAttribute('height', '18'),
                    r.setAttribute('fill', 'currentColor'));
                var n = t.document.createElementNS('http://www.w3.org/2000/svg', 'path');
                return (
                    n.setAttribute(
                        'd',
                        'M5.293 6.707l5.293 5.293-5.293 5.293c-0.391 0.391-0.391 1.024 0 1.414s1.024 0.391 1.414 0l5.293-5.293 5.293 5.293c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414l-5.293-5.293 5.293-5.293c0.391-0.391 0.391-1.024 0-1.414s-1.024-0.391-1.414 0l-5.293 5.293-5.293-5.293c-0.391-0.391-1.024-0.391-1.414 0s-0.391 1.024 0 1.414z'
                    ),
                    r.appendChild(n),
                    r
                );
            },
            It = function (e) {
                var t = e.environment.document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                return (
                    t.setAttribute('class', 'aa-LoadingIcon'),
                    t.setAttribute('viewBox', '0 0 100 100'),
                    t.setAttribute('width', '20'),
                    t.setAttribute('height', '20'),
                    (t.innerHTML =
                        '<circle\n  cx="50"\n  cy="50"\n  fill="none"\n  r="35"\n  stroke="currentColor"\n  stroke-dasharray="164.93361431346415 56.97787143782138"\n  stroke-width="6"\n>\n  <animateTransform\n    attributeName="transform"\n    type="rotate"\n    repeatCount="indefinite"\n    dur="1s"\n    values="0 50 50;90 50 50;180 50 50;360 50 50"\n    keyTimes="0;0.40;0.65;1"\n  />\n</circle>'),
                    t
                );
            },
            Et = ['ontouchstart', 'ontouchend', 'ontouchmove', 'ontouchcancel'];
        function At(e, t, r) {
            e[t] = null === r ? '' : 'number' != typeof r ? r : r + 'px';
        }
        function Dt(e) {
            this._listeners[e.type](e);
        }
        function Ct(e, t, r) {
            var n,
                o,
                i = e[t];
            if ('style' === t)
                if ('string' == typeof r) e.style = r;
                else if (null === r) e.style = '';
                else for (t in r) (i && r[t] === i[t]) || At(e.style, t, r[t]);
            else
                'o' === t[0] && 'n' === t[1]
                    ? ((n = t !== (t = t.replace(/Capture$/, ''))),
                      ((o = t.toLowerCase()) in e || Et.includes(o)) && (t = o),
                      (t = t.slice(2)),
                      e._listeners || (e._listeners = {}),
                      (e._listeners[t] = r),
                      r ? i || e.addEventListener(t, Dt, n) : e.removeEventListener(t, Dt, n))
                    : 'list' !== t &&
                        'tagName' !== t &&
                        'form' !== t &&
                        'type' !== t &&
                        'size' !== t &&
                        'download' !== t &&
                        'href' !== t &&
                        t in e
                      ? (e[t] = null == r ? '' : r)
                      : 'function' != typeof r &&
                        'dangerouslySetInnerHTML' !== t &&
                        (null == r || (!1 === r && !/^ar/.test(t)) ? e.removeAttribute(t) : e.setAttribute(t, r));
        }
        function kt(e) {
            switch (e) {
                case 'onChange':
                    return 'onInput';
                case 'onCompositionEnd':
                    return 'oncompositionend';
                default:
                    return e;
            }
        }
        function xt(e, t) {
            for (var r in t) Ct(e, kt(r), t[r]);
        }
        function Nt(e, t) {
            for (var r in t) ('o' === r[0] && 'n' === r[1]) || Ct(e, kt(r), t[r]);
        }
        var Tt = ['children'];
        function Bt(e) {
            return (
                (function (e) {
                    if (Array.isArray(e)) return qt(e);
                })(e) ||
                (function (e) {
                    if (('undefined' != typeof Symbol && null != e[Symbol.iterator]) || null != e['@@iterator']) return Array.from(e);
                })(e) ||
                (function (e, t) {
                    if (!e) return;
                    if ('string' == typeof e) return qt(e, t);
                    var r = Object.prototype.toString.call(e).slice(8, -1);
                    'Object' === r && e.constructor && (r = e.constructor.name);
                    if ('Map' === r || 'Set' === r) return Array.from(e);
                    if ('Arguments' === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)) return qt(e, t);
                })(e) ||
                (function () {
                    throw new TypeError(
                        'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                    );
                })()
            );
        }
        function qt(e, t) {
            (null == t || t > e.length) && (t = e.length);
            for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
            return n;
        }
        function Rt(e, t) {
            if (null == e) return {};
            var r,
                n,
                o = (function (e, t) {
                    if (null == e) return {};
                    var r,
                        n,
                        o = {},
                        i = Object.keys(e);
                    for (n = 0; n < i.length; n++) ((r = i[n]), t.indexOf(r) >= 0 || (o[r] = e[r]));
                    return o;
                })(e, t);
            if (Object.getOwnPropertySymbols) {
                var i = Object.getOwnPropertySymbols(e);
                for (n = 0; n < i.length; n++)
                    ((r = i[n]), t.indexOf(r) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, r) && (o[r] = e[r])));
            }
            return o;
        }
        function Lt(e) {
            return function (t, r) {
                var n = r.children,
                    o = void 0 === n ? [] : n,
                    i = Rt(r, Tt),
                    u = e.document.createElement(t);
                return (xt(u, i), u.append.apply(u, Bt(o)), u);
            };
        }
        function Ft(e) {
            return (
                (Ft =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                Ft(e)
            );
        }
        var Ut = ['autocompleteScopeApi', 'environment', 'classNames', 'getInputProps', 'getInputPropsCore', 'isDetached', 'state'];
        function Mt(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function Ht(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? Mt(Object(r), !0).forEach(function (t) {
                          Vt(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : Mt(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function Vt(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== Ft(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== Ft(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === Ft(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function Wt(e, t) {
            if (null == e) return {};
            var r,
                n,
                o = (function (e, t) {
                    if (null == e) return {};
                    var r,
                        n,
                        o = {},
                        i = Object.keys(e);
                    for (n = 0; n < i.length; n++) ((r = i[n]), t.indexOf(r) >= 0 || (o[r] = e[r]));
                    return o;
                })(e, t);
            if (Object.getOwnPropertySymbols) {
                var i = Object.getOwnPropertySymbols(e);
                for (n = 0; n < i.length; n++)
                    ((r = i[n]), t.indexOf(r) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, r) && (o[r] = e[r])));
            }
            return o;
        }
        var Qt = function (e) {
            var t = e.autocompleteScopeApi,
                r = e.environment,
                n = (e.classNames, e.getInputProps),
                o = e.getInputPropsCore,
                i = e.isDetached,
                u = e.state,
                a = Wt(e, Ut),
                c = Lt(r)('input', a),
                l = n(Ht({ state: u, props: o({ inputElement: c }), inputElement: c }, t));
            return (
                xt(
                    c,
                    Ht(
                        Ht({}, l),
                        {},
                        {
                            onKeyDown: function (e) {
                                (i && 'Tab' === e.key) || l.onKeyDown(e);
                            },
                        }
                    )
                ),
                c
            );
        };
        function $t(e) {
            return (
                ($t =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                $t(e)
            );
        }
        function Kt(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function zt(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? Kt(Object(r), !0).forEach(function (t) {
                          Gt(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : Kt(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function Gt(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== $t(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== $t(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === $t(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        var Jt,
            Xt,
            Yt,
            Zt,
            er,
            tr,
            rr,
            nr,
            or,
            ir,
            ur = {},
            ar = [],
            cr = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,
            lr = Array.isArray;
        function sr(e, t) {
            for (var r in t) e[r] = t[r];
            return e;
        }
        function fr(e) {
            e && e.parentNode && e.parentNode.removeChild(e);
        }
        function pr(e, t, r) {
            var n,
                o,
                i,
                u = {};
            for (i in t) 'key' == i ? (n = t[i]) : 'ref' == i ? (o = t[i]) : (u[i] = t[i]);
            if (
                (arguments.length > 2 && (u.children = arguments.length > 3 ? Jt.call(arguments, 2) : r),
                'function' == typeof e && null != e.defaultProps)
            )
                for (i in e.defaultProps) void 0 === u[i] && (u[i] = e.defaultProps[i]);
            return mr(e, u, n, o, null);
        }
        function mr(e, t, r, n, o) {
            var i = {
                type: e,
                props: t,
                key: r,
                ref: n,
                __k: null,
                __: null,
                __b: 0,
                __e: null,
                __d: void 0,
                __c: null,
                constructor: void 0,
                __v: null == o ? ++Yt : o,
                __i: -1,
                __u: 0,
            };
            return (null == o && null != Xt.vnode && Xt.vnode(i), i);
        }
        function vr(e) {
            return e.children;
        }
        function yr(e, t) {
            ((this.props = e), (this.context = t));
        }
        function dr(e, t) {
            if (null == t) return e.__ ? dr(e.__, e.__i + 1) : null;
            for (var r; t < e.__k.length; t++) if (null != (r = e.__k[t]) && null != r.__e) return r.__e;
            return 'function' == typeof e.type ? dr(e) : null;
        }
        function br(e) {
            var t, r;
            if (null != (e = e.__) && null != e.__c) {
                for (e.__e = e.__c.base = null, t = 0; t < e.__k.length; t++)
                    if (null != (r = e.__k[t]) && null != r.__e) {
                        e.__e = e.__c.base = r.__e;
                        break;
                    }
                return br(e);
            }
        }
        function gr(e) {
            ((!e.__d && (e.__d = !0) && Zt.push(e) && !hr.__r++) || er !== Xt.debounceRendering) && ((er = Xt.debounceRendering) || tr)(hr);
        }
        function hr() {
            var e, t, r, n, o, i, u, a;
            for (Zt.sort(rr); (e = Zt.shift()); )
                e.__d &&
                    ((t = Zt.length),
                    (n = void 0),
                    (i = (o = (r = e).__v).__e),
                    (u = []),
                    (a = []),
                    r.__P &&
                        (((n = sr({}, o)).__v = o.__v + 1),
                        Xt.vnode && Xt.vnode(n),
                        Er(r.__P, n, o, r.__n, r.__P.namespaceURI, 32 & o.__u ? [i] : null, u, null == i ? dr(o) : i, !!(32 & o.__u), a),
                        (n.__v = o.__v),
                        (n.__.__k[n.__i] = n),
                        Ar(u, n, a),
                        n.__e != i && br(n)),
                    Zt.length > t && Zt.sort(rr));
            hr.__r = 0;
        }
        function Or(e, t, r, n, o, i, u, a, c, l, s) {
            var f,
                p,
                m,
                v,
                y,
                d = (n && n.__k) || ar,
                b = t.length;
            for (r.__d = c, _r(r, t, d), c = r.__d, f = 0; f < b; f++)
                null != (m = r.__k[f]) &&
                    ((p = -1 === m.__i ? ur : d[m.__i] || ur),
                    (m.__i = f),
                    Er(e, m, p, o, i, u, a, c, l, s),
                    (v = m.__e),
                    m.ref && p.ref != m.ref && (p.ref && Cr(p.ref, null, m), s.push(m.ref, m.__c || v, m)),
                    null == y && null != v && (y = v),
                    65536 & m.__u || p.__k === m.__k
                        ? (c = Sr(m, c, e))
                        : 'function' == typeof m.type && void 0 !== m.__d
                          ? (c = m.__d)
                          : v && (c = v.nextSibling),
                    (m.__d = void 0),
                    (m.__u &= -196609));
            ((r.__d = c), (r.__e = y));
        }
        function _r(e, t, r) {
            var n,
                o,
                i,
                u,
                a,
                c = t.length,
                l = r.length,
                s = l,
                f = 0;
            for (e.__k = [], n = 0; n < c; n++)
                null != (o = t[n]) && 'boolean' != typeof o && 'function' != typeof o
                    ? ((u = n + f),
                      ((o = e.__k[n] =
                          'string' == typeof o || 'number' == typeof o || 'bigint' == typeof o || o.constructor == String
                              ? mr(null, o, null, null, null)
                              : lr(o)
                                ? mr(vr, { children: o }, null, null, null)
                                : void 0 === o.constructor && o.__b > 0
                                  ? mr(o.type, o.props, o.key, o.ref ? o.ref : null, o.__v)
                                  : o).__ = e),
                      (o.__b = e.__b + 1),
                      (i = null),
                      -1 !== (a = o.__i = jr(o, r, u, s)) && (s--, (i = r[a]) && (i.__u |= 131072)),
                      null == i || null === i.__v
                          ? (-1 == a && f--, 'function' != typeof o.type && (o.__u |= 65536))
                          : a !== u && (a == u - 1 ? f-- : a == u + 1 ? f++ : (a > u ? f-- : f++, (o.__u |= 65536))))
                    : (o = e.__k[n] = null);
            if (s) for (n = 0; n < l; n++) null != (i = r[n]) && !(131072 & i.__u) && (i.__e == e.__d && (e.__d = dr(i)), kr(i, i));
        }
        function Sr(e, t, r) {
            var n, o;
            if ('function' == typeof e.type) {
                for (n = e.__k, o = 0; n && o < n.length; o++) n[o] && ((n[o].__ = e), (t = Sr(n[o], t, r)));
                return t;
            }
            e.__e != t && (t && e.type && !r.contains(t) && (t = dr(e)), r.insertBefore(e.__e, t || null), (t = e.__e));
            do {
                t = t && t.nextSibling;
            } while (null != t && 8 === t.nodeType);
            return t;
        }
        function jr(e, t, r, n) {
            var o = e.key,
                i = e.type,
                u = r - 1,
                a = r + 1,
                c = t[r];
            if (null === c || (c && o == c.key && i === c.type && !(131072 & c.__u))) return r;
            if (n > (null == c || 131072 & c.__u ? 0 : 1))
                for (; u >= 0 || a < t.length; ) {
                    if (u >= 0) {
                        if ((c = t[u]) && !(131072 & c.__u) && o == c.key && i === c.type) return u;
                        u--;
                    }
                    if (a < t.length) {
                        if ((c = t[a]) && !(131072 & c.__u) && o == c.key && i === c.type) return a;
                        a++;
                    }
                }
            return -1;
        }
        function Pr(e, t, r) {
            '-' === t[0]
                ? e.setProperty(t, null == r ? '' : r)
                : (e[t] = null == r ? '' : 'number' != typeof r || cr.test(t) ? r : r + 'px');
        }
        function wr(e, t, r, n, o) {
            var i;
            e: if ('style' === t)
                if ('string' == typeof r) e.style.cssText = r;
                else {
                    if (('string' == typeof n && (e.style.cssText = n = ''), n)) for (t in n) (r && t in r) || Pr(e.style, t, '');
                    if (r) for (t in r) (n && r[t] === n[t]) || Pr(e.style, t, r[t]);
                }
            else if ('o' === t[0] && 'n' === t[1])
                ((i = t !== (t = t.replace(/(PointerCapture)$|Capture$/i, '$1'))),
                    (t = t.toLowerCase() in e || 'onFocusOut' === t || 'onFocusIn' === t ? t.toLowerCase().slice(2) : t.slice(2)),
                    e.l || (e.l = {}),
                    (e.l[t + i] = r),
                    r ? (n ? (r.u = n.u) : ((r.u = nr), e.addEventListener(t, i ? ir : or, i))) : e.removeEventListener(t, i ? ir : or, i));
            else {
                if ('http://www.w3.org/2000/svg' == o) t = t.replace(/xlink(H|:h)/, 'h').replace(/sName$/, 's');
                else if (
                    'width' != t &&
                    'height' != t &&
                    'href' != t &&
                    'list' != t &&
                    'form' != t &&
                    'tabIndex' != t &&
                    'download' != t &&
                    'rowSpan' != t &&
                    'colSpan' != t &&
                    'role' != t &&
                    'popover' != t &&
                    t in e
                )
                    try {
                        e[t] = null == r ? '' : r;
                        break e;
                    } catch (e) {}
                'function' == typeof r ||
                    (null == r || (!1 === r && '-' !== t[4]) ? e.removeAttribute(t) : e.setAttribute(t, 'popover' == t && 1 == r ? '' : r));
            }
        }
        function Ir(e) {
            return function (t) {
                if (this.l) {
                    var r = this.l[t.type + e];
                    if (null == t.t) t.t = nr++;
                    else if (t.t < r.u) return;
                    return r(Xt.event ? Xt.event(t) : t);
                }
            };
        }
        function Er(e, t, r, n, o, i, u, a, c, l) {
            var s,
                f,
                p,
                m,
                v,
                y,
                d,
                b,
                g,
                h,
                O,
                _,
                S,
                j,
                P,
                w,
                I = t.type;
            if (void 0 !== t.constructor) return null;
            (128 & r.__u && ((c = !!(32 & r.__u)), (i = [(a = t.__e = r.__e)])), (s = Xt.__b) && s(t));
            e: if ('function' == typeof I)
                try {
                    if (
                        ((b = t.props),
                        (g = 'prototype' in I && I.prototype.render),
                        (h = (s = I.contextType) && n[s.__c]),
                        (O = s ? (h ? h.props.value : s.__) : n),
                        r.__c
                            ? (d = (f = t.__c = r.__c).__ = f.__E)
                            : (g ? (t.__c = f = new I(b, O)) : ((t.__c = f = new yr(b, O)), (f.constructor = I), (f.render = xr)),
                              h && h.sub(f),
                              (f.props = b),
                              f.state || (f.state = {}),
                              (f.context = O),
                              (f.__n = n),
                              (p = f.__d = !0),
                              (f.__h = []),
                              (f._sb = [])),
                        g && null == f.__s && (f.__s = f.state),
                        g &&
                            null != I.getDerivedStateFromProps &&
                            (f.__s == f.state && (f.__s = sr({}, f.__s)), sr(f.__s, I.getDerivedStateFromProps(b, f.__s))),
                        (m = f.props),
                        (v = f.state),
                        (f.__v = t),
                        p)
                    )
                        (g && null == I.getDerivedStateFromProps && null != f.componentWillMount && f.componentWillMount(),
                            g && null != f.componentDidMount && f.__h.push(f.componentDidMount));
                    else {
                        if (
                            (g &&
                                null == I.getDerivedStateFromProps &&
                                b !== m &&
                                null != f.componentWillReceiveProps &&
                                f.componentWillReceiveProps(b, O),
                            !f.__e && ((null != f.shouldComponentUpdate && !1 === f.shouldComponentUpdate(b, f.__s, O)) || t.__v === r.__v))
                        ) {
                            for (
                                t.__v !== r.__v && ((f.props = b), (f.state = f.__s), (f.__d = !1)),
                                    t.__e = r.__e,
                                    t.__k = r.__k,
                                    t.__k.some(function (e) {
                                        e && (e.__ = t);
                                    }),
                                    _ = 0;
                                _ < f._sb.length;
                                _++
                            )
                                f.__h.push(f._sb[_]);
                            ((f._sb = []), f.__h.length && u.push(f));
                            break e;
                        }
                        (null != f.componentWillUpdate && f.componentWillUpdate(b, f.__s, O),
                            g &&
                                null != f.componentDidUpdate &&
                                f.__h.push(function () {
                                    f.componentDidUpdate(m, v, y);
                                }));
                    }
                    if (((f.context = O), (f.props = b), (f.__P = e), (f.__e = !1), (S = Xt.__r), (j = 0), g)) {
                        for (
                            f.state = f.__s, f.__d = !1, S && S(t), s = f.render(f.props, f.state, f.context), P = 0;
                            P < f._sb.length;
                            P++
                        )
                            f.__h.push(f._sb[P]);
                        f._sb = [];
                    } else
                        do {
                            ((f.__d = !1), S && S(t), (s = f.render(f.props, f.state, f.context)), (f.state = f.__s));
                        } while (f.__d && ++j < 25);
                    ((f.state = f.__s),
                        null != f.getChildContext && (n = sr(sr({}, n), f.getChildContext())),
                        g && !p && null != f.getSnapshotBeforeUpdate && (y = f.getSnapshotBeforeUpdate(m, v)),
                        Or(
                            e,
                            lr((w = null != s && s.type === vr && null == s.key ? s.props.children : s)) ? w : [w],
                            t,
                            r,
                            n,
                            o,
                            i,
                            u,
                            a,
                            c,
                            l
                        ),
                        (f.base = t.__e),
                        (t.__u &= -161),
                        f.__h.length && u.push(f),
                        d && (f.__E = f.__ = null));
                } catch (e) {
                    if (((t.__v = null), c || null != i)) {
                        for (t.__u |= c ? 160 : 128; a && 8 === a.nodeType && a.nextSibling; ) a = a.nextSibling;
                        ((i[i.indexOf(a)] = null), (t.__e = a));
                    } else ((t.__e = r.__e), (t.__k = r.__k));
                    Xt.__e(e, t, r);
                }
            else null == i && t.__v === r.__v ? ((t.__k = r.__k), (t.__e = r.__e)) : (t.__e = Dr(r.__e, t, r, n, o, i, u, c, l));
            (s = Xt.diffed) && s(t);
        }
        function Ar(e, t, r) {
            t.__d = void 0;
            for (var n = 0; n < r.length; n++) Cr(r[n], r[++n], r[++n]);
            (Xt.__c && Xt.__c(t, e),
                e.some(function (t) {
                    try {
                        ((e = t.__h),
                            (t.__h = []),
                            e.some(function (e) {
                                e.call(t);
                            }));
                    } catch (e) {
                        Xt.__e(e, t.__v);
                    }
                }));
        }
        function Dr(e, t, r, n, o, i, u, a, c) {
            var l,
                s,
                f,
                p,
                m,
                v,
                y,
                d = r.props,
                b = t.props,
                g = t.type;
            if (
                ('svg' === g
                    ? (o = 'http://www.w3.org/2000/svg')
                    : 'math' === g
                      ? (o = 'http://www.w3.org/1998/Math/MathML')
                      : o || (o = 'http://www.w3.org/1999/xhtml'),
                null != i)
            )
                for (l = 0; l < i.length; l++)
                    if ((m = i[l]) && 'setAttribute' in m == !!g && (g ? m.localName === g : 3 === m.nodeType)) {
                        ((e = m), (i[l] = null));
                        break;
                    }
            if (null == e) {
                if (null === g) return document.createTextNode(b);
                ((e = document.createElementNS(o, g, b.is && b)), a && (Xt.__m && Xt.__m(t, i), (a = !1)), (i = null));
            }
            if (null === g) d === b || (a && e.data === b) || (e.data = b);
            else {
                if (((i = i && Jt.call(e.childNodes)), (d = r.props || ur), !a && null != i))
                    for (d = {}, l = 0; l < e.attributes.length; l++) d[(m = e.attributes[l]).name] = m.value;
                for (l in d)
                    if (((m = d[l]), 'children' == l));
                    else if ('dangerouslySetInnerHTML' == l) f = m;
                    else if (!(l in b)) {
                        if (('value' == l && 'defaultValue' in b) || ('checked' == l && 'defaultChecked' in b)) continue;
                        wr(e, l, null, m, o);
                    }
                for (l in b)
                    ((m = b[l]),
                        'children' == l
                            ? (p = m)
                            : 'dangerouslySetInnerHTML' == l
                              ? (s = m)
                              : 'value' == l
                                ? (v = m)
                                : 'checked' == l
                                  ? (y = m)
                                  : (a && 'function' != typeof m) || d[l] === m || wr(e, l, m, d[l], o));
                if (s) (a || (f && (s.__html === f.__html || s.__html === e.innerHTML)) || (e.innerHTML = s.__html), (t.__k = []));
                else if (
                    (f && (e.innerHTML = ''),
                    Or(
                        e,
                        lr(p) ? p : [p],
                        t,
                        r,
                        n,
                        'foreignObject' === g ? 'http://www.w3.org/1999/xhtml' : o,
                        i,
                        u,
                        i ? i[0] : r.__k && dr(r, 0),
                        a,
                        c
                    ),
                    null != i)
                )
                    for (l = i.length; l--; ) fr(i[l]);
                a ||
                    ((l = 'value'),
                    'progress' === g && null == v
                        ? e.removeAttribute('value')
                        : void 0 !== v &&
                          (v !== e[l] || ('progress' === g && !v) || ('option' === g && v !== d[l])) &&
                          wr(e, l, v, d[l], o),
                    (l = 'checked'),
                    void 0 !== y && y !== e[l] && wr(e, l, y, d[l], o));
            }
            return e;
        }
        function Cr(e, t, r) {
            try {
                if ('function' == typeof e) {
                    var n = 'function' == typeof e.__u;
                    (n && e.__u(), (n && null == t) || (e.__u = e(t)));
                } else e.current = t;
            } catch (e) {
                Xt.__e(e, r);
            }
        }
        function kr(e, t, r) {
            var n, o;
            if ((Xt.unmount && Xt.unmount(e), (n = e.ref) && ((n.current && n.current !== e.__e) || Cr(n, null, t)), null != (n = e.__c))) {
                if (n.componentWillUnmount)
                    try {
                        n.componentWillUnmount();
                    } catch (e) {
                        Xt.__e(e, t);
                    }
                n.base = n.__P = null;
            }
            if ((n = e.__k)) for (o = 0; o < n.length; o++) n[o] && kr(n[o], t, r || 'function' != typeof e.type);
            (r || fr(e.__e), (e.__c = e.__ = e.__e = e.__d = void 0));
        }
        function xr(e, t, r) {
            return this.constructor(e, r);
        }
        function Nr(e, t, r) {
            var n, o, i, u;
            (Xt.__ && Xt.__(e, t),
                (o = (n = 'function' == typeof r) ? null : (r && r.__k) || t.__k),
                (i = []),
                (u = []),
                Er(
                    t,
                    (e = ((!n && r) || t).__k = pr(vr, null, [e])),
                    o || ur,
                    ur,
                    t.namespaceURI,
                    !n && r ? [r] : o ? null : t.firstChild ? Jt.call(t.childNodes) : null,
                    i,
                    !n && r ? r : o ? o.__e : t.firstChild,
                    n,
                    u
                ),
                Ar(i, e, u));
        }
        function Tr(e, t) {
            return t.reduce(function (e, t) {
                return e && e[t];
            }, e);
        }
        ((Jt = ar.slice),
            (Xt = {
                __e: function (e, t, r, n) {
                    for (var o, i, u; (t = t.__); )
                        if ((o = t.__c) && !o.__)
                            try {
                                if (
                                    ((i = o.constructor) &&
                                        null != i.getDerivedStateFromError &&
                                        (o.setState(i.getDerivedStateFromError(e)), (u = o.__d)),
                                    null != o.componentDidCatch && (o.componentDidCatch(e, n || {}), (u = o.__d)),
                                    u)
                                )
                                    return (o.__E = o);
                            } catch (t) {
                                e = t;
                            }
                    throw e;
                },
            }),
            (Yt = 0),
            (yr.prototype.setState = function (e, t) {
                var r;
                ((r = null != this.__s && this.__s !== this.state ? this.__s : (this.__s = sr({}, this.state))),
                    'function' == typeof e && (e = e(sr({}, r), this.props)),
                    e && sr(r, e),
                    null != e && this.__v && (t && this._sb.push(t), gr(this)));
            }),
            (yr.prototype.forceUpdate = function (e) {
                this.__v && ((this.__e = !0), e && this.__h.push(e), gr(this));
            }),
            (yr.prototype.render = vr),
            (Zt = []),
            (tr = 'function' == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout),
            (rr = function (e, t) {
                return e.__v.__b - t.__v.__b;
            }),
            (hr.__r = 0),
            (nr = 0),
            (or = Ir(!1)),
            (ir = Ir(!0)));
        var Br = '__aa-highlight__',
            qr = '__/aa-highlight__';
        function Rr(e) {
            var t = e.highlightedValue.split(Br),
                r = t.shift(),
                n = (function () {
                    var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : [];
                    return {
                        get: function () {
                            return e;
                        },
                        add: function (t) {
                            var r = e[e.length - 1];
                            (null == r ? void 0 : r.isHighlighted) === t.isHighlighted
                                ? (e[e.length - 1] = { value: r.value + t.value, isHighlighted: r.isHighlighted })
                                : e.push(t);
                        },
                    };
                })(r ? [{ value: r, isHighlighted: !1 }] : []);
            return (
                t.forEach(function (e) {
                    var t = e.split(qr);
                    (n.add({ value: t[0], isHighlighted: !0 }), '' !== t[1] && n.add({ value: t[1], isHighlighted: !1 }));
                }),
                n.get()
            );
        }
        function Lr(e) {
            return (
                (function (e) {
                    if (Array.isArray(e)) return Fr(e);
                })(e) ||
                (function (e) {
                    if (('undefined' != typeof Symbol && null != e[Symbol.iterator]) || null != e['@@iterator']) return Array.from(e);
                })(e) ||
                (function (e, t) {
                    if (!e) return;
                    if ('string' == typeof e) return Fr(e, t);
                    var r = Object.prototype.toString.call(e).slice(8, -1);
                    'Object' === r && e.constructor && (r = e.constructor.name);
                    if ('Map' === r || 'Set' === r) return Array.from(e);
                    if ('Arguments' === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)) return Fr(e, t);
                })(e) ||
                (function () {
                    throw new TypeError(
                        'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                    );
                })()
            );
        }
        function Fr(e, t) {
            (null == t || t > e.length) && (t = e.length);
            for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
            return n;
        }
        function Ur(e) {
            var t = e.hit,
                r = e.attribute,
                n = Array.isArray(r) ? r : [r],
                o = Tr(t, ['_highlightResult'].concat(Lr(n), ['value']));
            return ('string' != typeof o && (o = Tr(t, n) || ''), Rr({ highlightedValue: o }));
        }
        function Mr(e) {
            var t = e.createElement,
                r = e.Fragment;
            function n(e) {
                var n = e.hit,
                    o = e.attribute,
                    i = e.tagName,
                    u = void 0 === i ? 'mark' : i;
                return t(
                    r,
                    {},
                    Ur({ hit: n, attribute: o }).map(function (e, r) {
                        return e.isHighlighted ? t(u, { key: r }, e.value) : e.value;
                    })
                );
            }
            return ((n.__autocomplete_componentName = 'Highlight'), n);
        }
        var Hr = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" },
            Vr = new RegExp(/\w/i),
            Wr = /&(amp|quot|lt|gt|#39);/g,
            Qr = RegExp(Wr.source);
        function $r(e, t) {
            var r,
                n,
                o,
                i = e[t],
                u = (null === (r = e[t + 1]) || void 0 === r ? void 0 : r.isHighlighted) || !0,
                a = (null === (n = e[t - 1]) || void 0 === n ? void 0 : n.isHighlighted) || !0;
            return Vr.test(
                (o = i.value) && Qr.test(o)
                    ? o.replace(Wr, function (e) {
                          return Hr[e];
                      })
                    : o
            ) || a !== u
                ? i.isHighlighted
                : a;
        }
        function Kr(e) {
            return (
                (Kr =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                Kr(e)
            );
        }
        function zr(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function Gr(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? zr(Object(r), !0).forEach(function (t) {
                          Jr(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : zr(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function Jr(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== Kr(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== Kr(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === Kr(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function Xr(e) {
            return e.some(function (e) {
                return e.isHighlighted;
            })
                ? e.map(function (t, r) {
                      return Gr(Gr({}, t), {}, { isHighlighted: !$r(e, r) });
                  })
                : e.map(function (e) {
                      return Gr(Gr({}, e), {}, { isHighlighted: !1 });
                  });
        }
        function Yr(e) {
            var t = e.createElement,
                r = e.Fragment;
            function n(e) {
                var n,
                    o = e.hit,
                    i = e.attribute,
                    u = e.tagName,
                    a = void 0 === u ? 'mark' : u;
                return t(
                    r,
                    {},
                    ((n = { hit: o, attribute: i }), Xr(Ur(n))).map(function (e, r) {
                        return e.isHighlighted ? t(a, { key: r }, e.value) : e.value;
                    })
                );
            }
            return ((n.__autocomplete_componentName = 'ReverseHighlight'), n);
        }
        function Zr(e) {
            return (
                (function (e) {
                    if (Array.isArray(e)) return en(e);
                })(e) ||
                (function (e) {
                    if (('undefined' != typeof Symbol && null != e[Symbol.iterator]) || null != e['@@iterator']) return Array.from(e);
                })(e) ||
                (function (e, t) {
                    if (!e) return;
                    if ('string' == typeof e) return en(e, t);
                    var r = Object.prototype.toString.call(e).slice(8, -1);
                    'Object' === r && e.constructor && (r = e.constructor.name);
                    if ('Map' === r || 'Set' === r) return Array.from(e);
                    if ('Arguments' === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)) return en(e, t);
                })(e) ||
                (function () {
                    throw new TypeError(
                        'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                    );
                })()
            );
        }
        function en(e, t) {
            (null == t || t > e.length) && (t = e.length);
            for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
            return n;
        }
        function tn(e) {
            var t = e.hit,
                r = e.attribute,
                n = Array.isArray(r) ? r : [r],
                o = Tr(t, ['_snippetResult'].concat(Zr(n), ['value']));
            return ('string' != typeof o && (o = Tr(t, n) || ''), Rr({ highlightedValue: o }));
        }
        function rn(e) {
            var t = e.createElement,
                r = e.Fragment;
            function n(e) {
                var n,
                    o = e.hit,
                    i = e.attribute,
                    u = e.tagName,
                    a = void 0 === u ? 'mark' : u;
                return t(
                    r,
                    {},
                    ((n = { hit: o, attribute: i }), Xr(tn(n))).map(function (e, r) {
                        return e.isHighlighted ? t(a, { key: r }, e.value) : e.value;
                    })
                );
            }
            return ((n.__autocomplete_componentName = 'ReverseSnippet'), n);
        }
        function nn(e) {
            var t = e.createElement,
                r = e.Fragment;
            function n(e) {
                var n = e.hit,
                    o = e.attribute,
                    i = e.tagName,
                    u = void 0 === i ? 'mark' : i;
                return t(
                    r,
                    {},
                    tn({ hit: n, attribute: o }).map(function (e, r) {
                        return e.isHighlighted ? t(u, { key: r }, e.value) : e.value;
                    })
                );
            }
            return ((n.__autocomplete_componentName = 'Snippet'), n);
        }
        function on(e, t) {
            if ('string' == typeof t) {
                var r = e.document.querySelector(t);
                return ('The element '.concat(JSON.stringify(t), ' is not in the document.'), r);
            }
            return t;
        }
        function un() {
            for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++) t[r] = arguments[r];
            return t.reduce(function (e, t) {
                return (
                    Object.keys(t).forEach(function (r) {
                        var n = e[r],
                            o = t[r];
                        n !== o && (e[r] = [n, o].filter(Boolean).join(' '));
                    }),
                    e
                );
            }, {});
        }
        function an(e) {
            return (
                (an =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                an(e)
            );
        }
        var cn = [
            'classNames',
            'container',
            'getEnvironmentProps',
            'getFormProps',
            'getInputProps',
            'getItemProps',
            'getLabelProps',
            'getListProps',
            'getPanelProps',
            'getRootProps',
            'panelContainer',
            'panelPlacement',
            'render',
            'renderNoResults',
            'renderer',
            'detachedMediaQuery',
            'components',
            'translations',
        ];
        function ln(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function sn(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? ln(Object(r), !0).forEach(function (t) {
                          fn(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : ln(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function fn(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== an(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== an(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === an(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function pn(e, t) {
            if (null == e) return {};
            var r,
                n,
                o = (function (e, t) {
                    if (null == e) return {};
                    var r,
                        n,
                        o = {},
                        i = Object.keys(e);
                    for (n = 0; n < i.length; n++) ((r = i[n]), t.indexOf(r) >= 0 || (o[r] = e[r]));
                    return o;
                })(e, t);
            if (Object.getOwnPropertySymbols) {
                var i = Object.getOwnPropertySymbols(e);
                for (n = 0; n < i.length; n++)
                    ((r = i[n]), t.indexOf(r) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, r) && (o[r] = e[r])));
            }
            return o;
        }
        var mn = {
                clearButton: 'aa-ClearButton',
                detachedCancelButton: 'aa-DetachedCancelButton',
                detachedContainer: 'aa-DetachedContainer',
                detachedFormContainer: 'aa-DetachedFormContainer',
                detachedOverlay: 'aa-DetachedOverlay',
                detachedSearchButton: 'aa-DetachedSearchButton',
                detachedSearchButtonIcon: 'aa-DetachedSearchButtonIcon',
                detachedSearchButtonPlaceholder: 'aa-DetachedSearchButtonPlaceholder',
                detachedSearchButtonQuery: 'aa-DetachedSearchButtonQuery',
                form: 'aa-Form',
                input: 'aa-Input',
                inputWrapper: 'aa-InputWrapper',
                inputWrapperPrefix: 'aa-InputWrapperPrefix',
                inputWrapperSuffix: 'aa-InputWrapperSuffix',
                item: 'aa-Item',
                label: 'aa-Label',
                list: 'aa-List',
                loadingIndicator: 'aa-LoadingIndicator',
                panel: 'aa-Panel',
                panelLayout: 'aa-PanelLayout aa-Panel--scrollable',
                root: 'aa-Autocomplete',
                source: 'aa-Source',
                sourceFooter: 'aa-SourceFooter',
                sourceHeader: 'aa-SourceHeader',
                sourceNoResults: 'aa-SourceNoResults',
                submitButton: 'aa-SubmitButton',
            },
            vn = function (e, t) {
                var r = e.children;
                (0, e.render)(r, t);
            },
            yn = { createElement: pr, Fragment: vr, render: Nr };
        function dn(e) {
            var t = e.panelPlacement,
                r = e.container,
                n = e.form,
                o = e.environment,
                i = r.getBoundingClientRect(),
                u = (o.pageYOffset || o.document.documentElement.scrollTop || o.document.body.scrollTop || 0) + i.top + i.height;
            switch (t) {
                case 'start':
                    return { top: u, left: i.left };
                case 'end':
                    return { top: u, right: o.document.documentElement.clientWidth - (i.left + i.width) };
                case 'full-width':
                    return { top: u, left: 0, right: 0, width: 'unset', maxWidth: 'unset' };
                case 'input-wrapper-width':
                    var a = n.getBoundingClientRect();
                    return {
                        top: u,
                        left: a.left,
                        right: o.document.documentElement.clientWidth - (a.left + a.width),
                        width: 'unset',
                        maxWidth: 'unset',
                    };
                default:
                    throw new Error('[Autocomplete] The `panelPlacement` value '.concat(JSON.stringify(t), ' is not valid.'));
            }
        }
        function bn(e) {
            return (
                (bn =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                bn(e)
            );
        }
        function gn() {
            return (
                (gn = Object.assign
                    ? Object.assign.bind()
                    : function (e) {
                          for (var t = 1; t < arguments.length; t++) {
                              var r = arguments[t];
                              for (var n in r) Object.prototype.hasOwnProperty.call(r, n) && (e[n] = r[n]);
                          }
                          return e;
                      }),
                gn.apply(this, arguments)
            );
        }
        function hn(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function On(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? hn(Object(r), !0).forEach(function (t) {
                          _n(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : hn(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function _n(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== bn(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== bn(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === bn(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        var Sn = [{ segment: 'autocomplete-js', version: rt }];
        function jn(e) {
            return (
                (function (e) {
                    if (Array.isArray(e)) return Pn(e);
                })(e) ||
                (function (e) {
                    if (('undefined' != typeof Symbol && null != e[Symbol.iterator]) || null != e['@@iterator']) return Array.from(e);
                })(e) ||
                (function (e, t) {
                    if (!e) return;
                    if ('string' == typeof e) return Pn(e, t);
                    var r = Object.prototype.toString.call(e).slice(8, -1);
                    'Object' === r && e.constructor && (r = e.constructor.name);
                    if ('Map' === r || 'Set' === r) return Array.from(e);
                    if ('Arguments' === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)) return Pn(e, t);
                })(e) ||
                (function () {
                    throw new TypeError(
                        'Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                    );
                })()
            );
        }
        function Pn(e, t) {
            (null == t || t > e.length) && (t = e.length);
            for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
            return n;
        }
        function wn(e) {
            return (
                (wn =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                wn(e)
            );
        }
        var In = function (e) {
            return e && 'object' === wn(e) && '[object Object]' === Object.prototype.toString.call(e);
        };
        function En() {
            for (var e = arguments.length, t = new Array(e), r = 0; r < e; r++) t[r] = arguments[r];
            return t.reduce(function (e, t) {
                return (
                    Object.keys(t).forEach(function (r) {
                        var n = e[r],
                            o = t[r];
                        Array.isArray(n) && Array.isArray(o)
                            ? (e[r] = n.concat.apply(n, jn(o)))
                            : In(n) && In(o)
                              ? (e[r] = En(n, o))
                              : (e[r] = o);
                    }),
                    e
                );
            }, {});
        }
        function An(e) {
            return (
                (An =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                An(e)
            );
        }
        function Dn(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function Cn(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? Dn(Object(r), !0).forEach(function (t) {
                          kn(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : Dn(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function kn(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== An(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== An(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === An(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function xn(e, t) {
            return (
                (function (e) {
                    if (Array.isArray(e)) return e;
                })(e) ||
                (function (e, t) {
                    var r = null == e ? null : ('undefined' != typeof Symbol && e[Symbol.iterator]) || e['@@iterator'];
                    if (null != r) {
                        var n,
                            o,
                            i,
                            u,
                            a = [],
                            c = !0,
                            l = !1;
                        try {
                            if (((i = (r = r.call(e)).next), 0 === t)) {
                                if (Object(r) !== r) return;
                                c = !1;
                            } else for (; !(c = (n = i.call(r)).done) && (a.push(n.value), a.length !== t); c = !0);
                        } catch (e) {
                            ((l = !0), (o = e));
                        } finally {
                            try {
                                if (!c && null != r.return && ((u = r.return()), Object(u) !== u)) return;
                            } finally {
                                if (l) throw o;
                            }
                        }
                        return a;
                    }
                })(e, t) ||
                (function (e, t) {
                    if (!e) return;
                    if ('string' == typeof e) return Nn(e, t);
                    var r = Object.prototype.toString.call(e).slice(8, -1);
                    'Object' === r && e.constructor && (r = e.constructor.name);
                    if ('Map' === r || 'Set' === r) return Array.from(e);
                    if ('Arguments' === r || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)) return Nn(e, t);
                })(e, t) ||
                (function () {
                    throw new TypeError(
                        'Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
                    );
                })()
            );
        }
        function Nn(e, t) {
            (null == t || t > e.length) && (t = e.length);
            for (var r = 0, n = new Array(t); r < t; r++) n[r] = e[r];
            return n;
        }
        var Tn = ['components'];
        function Bn(e) {
            return (
                (Bn =
                    'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                        ? function (e) {
                              return typeof e;
                          }
                        : function (e) {
                              return e && 'function' == typeof Symbol && e.constructor === Symbol && e !== Symbol.prototype
                                  ? 'symbol'
                                  : typeof e;
                          }),
                Bn(e)
            );
        }
        function qn(e, t) {
            if (null == e) return {};
            var r,
                n,
                o = (function (e, t) {
                    if (null == e) return {};
                    var r,
                        n,
                        o = {},
                        i = Object.keys(e);
                    for (n = 0; n < i.length; n++) ((r = i[n]), t.indexOf(r) >= 0 || (o[r] = e[r]));
                    return o;
                })(e, t);
            if (Object.getOwnPropertySymbols) {
                var i = Object.getOwnPropertySymbols(e);
                for (n = 0; n < i.length; n++)
                    ((r = i[n]), t.indexOf(r) >= 0 || (Object.prototype.propertyIsEnumerable.call(e, r) && (o[r] = e[r])));
            }
            return o;
        }
        function Rn(e, t) {
            var r = Object.keys(e);
            if (Object.getOwnPropertySymbols) {
                var n = Object.getOwnPropertySymbols(e);
                (t &&
                    (n = n.filter(function (t) {
                        return Object.getOwnPropertyDescriptor(e, t).enumerable;
                    })),
                    r.push.apply(r, n));
            }
            return r;
        }
        function Ln(e) {
            for (var t = 1; t < arguments.length; t++) {
                var r = null != arguments[t] ? arguments[t] : {};
                t % 2
                    ? Rn(Object(r), !0).forEach(function (t) {
                          Fn(e, t, r[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                      ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(r))
                      : Rn(Object(r)).forEach(function (t) {
                            Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(r, t));
                        });
            }
            return e;
        }
        function Fn(e, t, r) {
            return (
                (t = (function (e) {
                    var t = (function (e, t) {
                        if ('object' !== Bn(e) || null === e) return e;
                        var r = e[Symbol.toPrimitive];
                        if (void 0 !== r) {
                            var n = r.call(e, t || 'default');
                            if ('object' !== Bn(n)) return n;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === t ? String : Number)(e);
                    })(e, 'string');
                    return 'symbol' === Bn(t) ? t : String(t);
                })(t)) in e
                    ? Object.defineProperty(e, t, { value: r, enumerable: !0, configurable: !0, writable: !0 })
                    : (e[t] = r),
                e
            );
        }
        function Un(e) {
            var t,
                o = (function () {
                    var e = [],
                        t = [];
                    function r(r) {
                        e.push(r);
                        var n = r();
                        t.push(n);
                    }
                    return {
                        runEffect: r,
                        cleanupEffects: function () {
                            var e = t;
                            ((t = []),
                                e.forEach(function (e) {
                                    e();
                                }));
                        },
                        runEffects: function () {
                            var t = e;
                            ((e = []),
                                t.forEach(function (e) {
                                    r(e);
                                }));
                        },
                    };
                })(),
                i = o.runEffect,
                u = o.cleanupEffects,
                a = o.runEffects,
                c =
                    ((t = []),
                    {
                        reactive: function (e) {
                            var r = e(),
                                n = {
                                    _fn: e,
                                    _ref: { current: r },
                                    get value() {
                                        return this._ref.current;
                                    },
                                    set value(e) {
                                        this._ref.current = e;
                                    },
                                };
                            return (t.push(n), n);
                        },
                        runReactives: function () {
                            t.forEach(function (e) {
                                e._ref.current = e._fn();
                            });
                        },
                    }),
                l = c.reactive,
                s = c.runReactives,
                f = n(!1),
                p = n(e),
                m = n(void 0),
                v = l(function () {
                    return (function (e) {
                        var t,
                            r = e.classNames,
                            n = e.container,
                            o = e.getEnvironmentProps,
                            i = e.getFormProps,
                            u = e.getInputProps,
                            a = e.getItemProps,
                            c = e.getLabelProps,
                            l = e.getListProps,
                            s = e.getPanelProps,
                            f = e.getRootProps,
                            p = e.panelContainer,
                            m = e.panelPlacement,
                            v = e.render,
                            y = e.renderNoResults,
                            d = e.renderer,
                            b = e.detachedMediaQuery,
                            g = e.components,
                            h = e.translations,
                            O = pn(e, cn),
                            _ = 'undefined' != typeof window ? window : {},
                            S = on(_, n);
                        S.tagName;
                        var j = sn(sn({}, yn), d),
                            P = { Highlight: Mr(j), ReverseHighlight: Yr(j), ReverseSnippet: rn(j), Snippet: nn(j) };
                        return {
                            renderer: {
                                classNames: un(mn, null != r ? r : {}),
                                container: S,
                                getEnvironmentProps:
                                    null != o
                                        ? o
                                        : function (e) {
                                              return e.props;
                                          },
                                getFormProps:
                                    null != i
                                        ? i
                                        : function (e) {
                                              return e.props;
                                          },
                                getInputProps:
                                    null != u
                                        ? u
                                        : function (e) {
                                              return e.props;
                                          },
                                getItemProps:
                                    null != a
                                        ? a
                                        : function (e) {
                                              return e.props;
                                          },
                                getLabelProps:
                                    null != c
                                        ? c
                                        : function (e) {
                                              return e.props;
                                          },
                                getListProps:
                                    null != l
                                        ? l
                                        : function (e) {
                                              return e.props;
                                          },
                                getPanelProps:
                                    null != s
                                        ? s
                                        : function (e) {
                                              return e.props;
                                          },
                                getRootProps:
                                    null != f
                                        ? f
                                        : function (e) {
                                              return e.props;
                                          },
                                panelContainer: p ? on(_, p) : _.document.body,
                                panelPlacement: null != m ? m : 'input-wrapper-width',
                                render: null != v ? v : vn,
                                renderNoResults: y,
                                renderer: j,
                                detachedMediaQuery:
                                    null != b
                                        ? b
                                        : getComputedStyle(_.document.documentElement).getPropertyValue('--aa-detached-media-query'),
                                components: sn(sn({}, P), g),
                                translations: sn(
                                    sn(
                                        {},
                                        {
                                            clearButtonTitle: 'Clear',
                                            detachedCancelButtonText: 'Cancel',
                                            detachedSearchButtonTitle: 'Search',
                                            submitButtonTitle: 'Submit',
                                        }
                                    ),
                                    h
                                ),
                            },
                            core: sn(sn({}, O), {}, { id: null !== (t = O.id) && void 0 !== t ? t : $(), environment: _ }),
                        };
                    })(p.current);
                }),
                y = l(function () {
                    return v.value.core.environment.matchMedia(v.value.renderer.detachedMediaQuery).matches;
                }),
                d = l(function () {
                    return Ot(
                        Ln(
                            Ln({}, v.value.core),
                            {},
                            {
                                onStateChange: function (e) {
                                    var t, r, n;
                                    ((f.current = e.state.collections.some(function (e) {
                                        return e.source.templates.noResults;
                                    })),
                                        null === (t = m.current) || void 0 === t || t.call(m, e),
                                        null === (r = (n = v.value.core).onStateChange) || void 0 === r || r.call(n, e));
                                },
                                shouldPanelOpen:
                                    p.current.shouldPanelOpen ||
                                    function (e) {
                                        var t = e.state;
                                        if (y.value) return !0;
                                        var r = W(t) > 0;
                                        if (!v.value.core.openOnFocus && !t.query) return r;
                                        var n = Boolean(f.current || v.value.renderer.renderNoResults);
                                        return (!r && n) || r;
                                    },
                                __autocomplete_metadata: { userAgents: Sn, options: e },
                            }
                        )
                    );
                }),
                b = n(
                    Ln(
                        { collections: [], completion: null, context: {}, isOpen: !1, query: '', activeItemId: null, status: 'idle' },
                        v.value.core.initialState
                    )
                ),
                g = {
                    getEnvironmentProps: v.value.renderer.getEnvironmentProps,
                    getFormProps: v.value.renderer.getFormProps,
                    getInputProps: v.value.renderer.getInputProps,
                    getItemProps: v.value.renderer.getItemProps,
                    getLabelProps: v.value.renderer.getLabelProps,
                    getListProps: v.value.renderer.getListProps,
                    getPanelProps: v.value.renderer.getPanelProps,
                    getRootProps: v.value.renderer.getRootProps,
                },
                h = {
                    setActiveItemId: d.value.setActiveItemId,
                    setQuery: d.value.setQuery,
                    setCollections: d.value.setCollections,
                    setIsOpen: d.value.setIsOpen,
                    setStatus: d.value.setStatus,
                    setContext: d.value.setContext,
                    refresh: d.value.refresh,
                    navigator: d.value.navigator,
                },
                O = l(function () {
                    return jt.bind(v.value.renderer.renderer.createElement);
                }),
                _ = l(function () {
                    return (function (e) {
                        var t = e.autocomplete,
                            r = e.autocompleteScopeApi,
                            n = e.classNames,
                            o = e.environment,
                            i = e.isDetached,
                            u = e.placeholder,
                            a = void 0 === u ? 'Search' : u,
                            c = e.propGetters,
                            l = e.setIsModalOpen,
                            s = e.state,
                            f = e.translations,
                            p = Lt(o),
                            m = c.getRootProps(zt({ state: s, props: t.getRootProps({}) }, r)),
                            v = p('div', zt({ class: n.root }, m)),
                            y = p('div', {
                                class: n.detachedContainer,
                                onMouseDown: function (e) {
                                    e.stopPropagation();
                                },
                            }),
                            d = p('div', {
                                class: n.detachedOverlay,
                                children: [y],
                                onMouseDown: function () {
                                    (l(!1), t.setIsOpen(!1));
                                },
                            }),
                            b = c.getLabelProps(zt({ state: s, props: t.getLabelProps({}) }, r)),
                            g = p('button', {
                                class: n.submitButton,
                                type: 'submit',
                                title: f.submitButtonTitle,
                                children: [Pt({ environment: o })],
                            }),
                            h = p('label', zt({ class: n.label, children: [g], ariaLabel: f.submitButtonTitle }, b)),
                            O = p('button', {
                                class: n.clearButton,
                                type: 'reset',
                                title: f.clearButtonTitle,
                                children: [wt({ environment: o })],
                            }),
                            _ = p('div', { class: n.loadingIndicator, children: [It({ environment: o })] }),
                            S = Qt({
                                class: n.input,
                                environment: o,
                                state: s,
                                getInputProps: c.getInputProps,
                                getInputPropsCore: t.getInputProps,
                                autocompleteScopeApi: r,
                                isDetached: i,
                            }),
                            j = p('div', { class: n.inputWrapperPrefix, children: [h, _] }),
                            P = p('div', { class: n.inputWrapperSuffix, children: [O] }),
                            w = p('div', { class: n.inputWrapper, children: [S] }),
                            I = c.getFormProps(zt({ state: s, props: t.getFormProps({ inputElement: S }) }, r)),
                            E = p('form', zt({ class: n.form, children: [j, w, P] }, I)),
                            A = c.getPanelProps(zt({ state: s, props: t.getPanelProps({}) }, r)),
                            D = p('div', zt({ class: n.panel }, A)),
                            C = p('div', { class: n.detachedSearchButtonQuery, textContent: s.query }),
                            k = p('div', { class: n.detachedSearchButtonPlaceholder, hidden: Boolean(s.query), textContent: a });
                        if (i) {
                            var x = p('div', { class: n.detachedSearchButtonIcon, children: [Pt({ environment: o })] }),
                                N = p('button', {
                                    type: 'button',
                                    class: n.detachedSearchButton,
                                    title: f.detachedSearchButtonTitle,
                                    id: b.id,
                                    onClick: function () {
                                        l(!0);
                                    },
                                    children: [x, k, C],
                                }),
                                T = p('button', {
                                    type: 'button',
                                    class: n.detachedCancelButton,
                                    textContent: f.detachedCancelButtonText,
                                    onTouchStart: function (e) {
                                        e.stopPropagation();
                                    },
                                    onClick: function () {
                                        (t.setIsOpen(!1), l(!1));
                                    },
                                }),
                                B = p('div', { class: n.detachedFormContainer, children: [E, T] });
                            (y.appendChild(B), v.appendChild(N));
                        } else v.appendChild(E);
                        return {
                            detachedContainer: y,
                            detachedOverlay: d,
                            detachedSearchButtonQuery: C,
                            detachedSearchButtonPlaceholder: k,
                            inputWrapper: w,
                            input: S,
                            root: v,
                            form: E,
                            label: h,
                            submitButton: g,
                            clearButton: O,
                            loadingIndicator: _,
                            panel: D,
                        };
                    })({
                        autocomplete: d.value,
                        autocompleteScopeApi: h,
                        classNames: v.value.renderer.classNames,
                        environment: v.value.core.environment,
                        isDetached: y.value,
                        placeholder: v.value.core.placeholder,
                        propGetters: g,
                        setIsModalOpen: w,
                        state: b.current,
                        translations: v.value.renderer.translations,
                    });
                });
            function S() {
                xt(_.value.panel, {
                    style: y.value
                        ? {}
                        : dn({
                              panelPlacement: v.value.renderer.panelPlacement,
                              container: _.value.root,
                              form: _.value.form,
                              environment: v.value.core.environment,
                          }),
                });
            }
            function j(e) {
                b.current = e;
                var t = {
                        autocomplete: d.value,
                        autocompleteScopeApi: h,
                        classNames: v.value.renderer.classNames,
                        components: v.value.renderer.components,
                        container: v.value.renderer.container,
                        html: O.value,
                        dom: _.value,
                        panelContainer: y.value ? _.value.detachedContainer : v.value.renderer.panelContainer,
                        propGetters: g,
                        state: b.current,
                        renderer: v.value.renderer.renderer,
                    },
                    r = (!W(e) && !f.current && v.value.renderer.renderNoResults) || v.value.renderer.render;
                (!(function (e) {
                    var t = e.autocomplete,
                        r = e.autocompleteScopeApi,
                        n = e.dom,
                        o = e.propGetters,
                        i = e.state;
                    (Nt(n.root, o.getRootProps(On({ state: i, props: t.getRootProps({}) }, r))),
                        Nt(
                            n.input,
                            o.getInputProps(On({ state: i, props: t.getInputProps({ inputElement: n.input }), inputElement: n.input }, r))
                        ),
                        xt(n.label, { hidden: 'stalled' === i.status }),
                        xt(n.loadingIndicator, { hidden: 'stalled' !== i.status }),
                        xt(n.clearButton, { hidden: !i.query }),
                        xt(n.detachedSearchButtonQuery, { textContent: i.query }),
                        xt(n.detachedSearchButtonPlaceholder, { hidden: Boolean(i.query) }));
                })(t),
                    (function (e, t) {
                        var r = t.autocomplete,
                            n = t.autocompleteScopeApi,
                            o = t.classNames,
                            i = t.html,
                            u = t.dom,
                            a = t.panelContainer,
                            c = t.propGetters,
                            l = t.state,
                            s = t.components,
                            f = t.renderer;
                        if (l.isOpen) {
                            (a.contains(u.panel) || 'loading' === l.status || a.appendChild(u.panel),
                                u.panel.classList.toggle('aa-Panel--stalled', 'stalled' === l.status));
                            var p = l.collections
                                    .filter(function (e) {
                                        var t = e.source,
                                            r = e.items;
                                        return t.templates.noResults || r.length > 0;
                                    })
                                    .map(function (e, t) {
                                        var u = e.source,
                                            a = e.items;
                                        return f.createElement(
                                            'section',
                                            { key: t, className: o.source, 'data-autocomplete-source-id': u.sourceId },
                                            u.templates.header &&
                                                f.createElement(
                                                    'div',
                                                    { className: o.sourceHeader },
                                                    u.templates.header({
                                                        components: s,
                                                        createElement: f.createElement,
                                                        Fragment: f.Fragment,
                                                        items: a,
                                                        source: u,
                                                        state: l,
                                                        html: i,
                                                    })
                                                ),
                                            u.templates.noResults && 0 === a.length
                                                ? f.createElement(
                                                      'div',
                                                      { className: o.sourceNoResults },
                                                      u.templates.noResults({
                                                          components: s,
                                                          createElement: f.createElement,
                                                          Fragment: f.Fragment,
                                                          source: u,
                                                          state: l,
                                                          html: i,
                                                      })
                                                  )
                                                : f.createElement(
                                                      'ul',
                                                      gn(
                                                          { className: o.list },
                                                          c.getListProps(On({ state: l, props: r.getListProps({ source: u }) }, n))
                                                      ),
                                                      a.map(function (e) {
                                                          var t = r.getItemProps({ item: e, source: u });
                                                          return f.createElement(
                                                              'li',
                                                              gn(
                                                                  { key: t.id, className: o.item },
                                                                  c.getItemProps(On({ state: l, props: t }, n))
                                                              ),
                                                              u.templates.item({
                                                                  components: s,
                                                                  createElement: f.createElement,
                                                                  Fragment: f.Fragment,
                                                                  item: e,
                                                                  state: l,
                                                                  html: i,
                                                              })
                                                          );
                                                      })
                                                  ),
                                            u.templates.footer &&
                                                f.createElement(
                                                    'div',
                                                    { className: o.sourceFooter },
                                                    u.templates.footer({
                                                        components: s,
                                                        createElement: f.createElement,
                                                        Fragment: f.Fragment,
                                                        items: a,
                                                        source: u,
                                                        state: l,
                                                        html: i,
                                                    })
                                                )
                                        );
                                    }),
                                m = f.createElement(
                                    f.Fragment,
                                    null,
                                    f.createElement('div', { className: o.panelLayout }, p),
                                    f.createElement('div', { className: 'aa-GradientBottom' })
                                ),
                                v = p.reduce(function (e, t) {
                                    return ((e[t.props['data-autocomplete-source-id']] = t), e);
                                }, {});
                            e(On(On({ children: m, state: l, sections: p, elements: v }, f), {}, { components: s, html: i }, n), u.panel);
                        } else a.contains(u.panel) && a.removeChild(u.panel);
                    })(r, t));
            }
            function P() {
                var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {};
                u();
                var t,
                    r,
                    n = v.value.renderer,
                    o = n.components,
                    i = qn(n, Tn);
                ((p.current = En(
                    i,
                    v.value.core,
                    {
                        components:
                            ((t = o),
                            (r = function (e) {
                                return !e.value.hasOwnProperty('__autocomplete_componentName');
                            }),
                            Object.entries(t).reduce(function (e, t) {
                                var n = xn(t, 2),
                                    o = n[0],
                                    i = n[1];
                                return r({ key: o, value: i }) ? Cn(Cn({}, e), {}, kn({}, o, i)) : e;
                            }, {})),
                        initialState: b.current,
                    },
                    e
                )),
                    s(),
                    a(),
                    d.value.refresh().then(function () {
                        j(b.current);
                    }));
            }
            function w(e) {
                e !== v.value.core.environment.document.body.contains(_.value.detachedOverlay) &&
                    (e
                        ? (v.value.core.environment.document.body.appendChild(_.value.detachedOverlay),
                          v.value.core.environment.document.body.classList.add('aa-Detached'),
                          _.value.input.focus())
                        : (v.value.core.environment.document.body.removeChild(_.value.detachedOverlay),
                          v.value.core.environment.document.body.classList.remove('aa-Detached')));
            }
            return (
                i(function () {
                    var e = d.value.getEnvironmentProps({
                        formElement: _.value.form,
                        panelElement: _.value.panel,
                        inputElement: _.value.input,
                    });
                    return (
                        xt(v.value.core.environment, e),
                        function () {
                            xt(
                                v.value.core.environment,
                                Object.keys(e).reduce(function (e, t) {
                                    return Ln(Ln({}, e), {}, Fn({}, t, void 0));
                                }, {})
                            );
                        }
                    );
                }),
                i(function () {
                    var e = y.value ? v.value.core.environment.document.body : v.value.renderer.panelContainer,
                        t = y.value ? _.value.detachedOverlay : _.value.panel;
                    return (
                        y.value && b.current.isOpen && w(!0),
                        j(b.current),
                        function () {
                            e.contains(t) && (e.removeChild(t), e.classList.remove('aa-Detached'));
                        }
                    );
                }),
                i(function () {
                    var e = v.value.renderer.container;
                    return (
                        e.appendChild(_.value.root),
                        function () {
                            e.removeChild(_.value.root);
                        }
                    );
                }),
                i(function () {
                    var e = r(function (e) {
                        j(e.state);
                    }, 0);
                    return (
                        (m.current = function (t) {
                            var r = t.state,
                                n = t.prevState;
                            (y.value && n.isOpen !== r.isOpen && w(r.isOpen),
                            y.value || !r.isOpen || n.isOpen || S(),
                            r.query !== n.query) &&
                                v.value.core.environment.document.querySelectorAll('.aa-Panel--scrollable').forEach(function (e) {
                                    0 !== e.scrollTop && (e.scrollTop = 0);
                                });
                            e({ state: r });
                        }),
                        function () {
                            m.current = void 0;
                        }
                    );
                }),
                i(function () {
                    var e = r(function () {
                        var e = y.value;
                        ((y.value = v.value.core.environment.matchMedia(v.value.renderer.detachedMediaQuery).matches),
                            e !== y.value ? P({}) : requestAnimationFrame(S));
                    }, 20);
                    return (
                        v.value.core.environment.addEventListener('resize', e),
                        function () {
                            v.value.core.environment.removeEventListener('resize', e);
                        }
                    );
                }),
                i(function () {
                    if (!y.value) return function () {};
                    function e(e) {
                        _.value.detachedContainer.classList.toggle('aa-DetachedContainer--modal', e);
                    }
                    function t(t) {
                        e(t.matches);
                    }
                    var r = v.value.core.environment.matchMedia(
                        getComputedStyle(v.value.core.environment.document.documentElement).getPropertyValue(
                            '--aa-detached-modal-media-query'
                        )
                    );
                    e(r.matches);
                    var n = Boolean(r.addEventListener);
                    return (
                        n ? r.addEventListener('change', t) : r.addListener(t),
                        function () {
                            n ? r.removeEventListener('change', t) : r.removeListener(t);
                        }
                    );
                }),
                i(function () {
                    return (requestAnimationFrame(S), function () {});
                }),
                Ln(
                    Ln({}, h),
                    {},
                    {
                        update: P,
                        destroy: function () {
                            u();
                        },
                    }
                )
            );
        }
        try {
            window.autocomplete = Un;
        } catch (nr) {}
        return t;
    })();
});
