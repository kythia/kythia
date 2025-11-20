/**
 * @namespace: addons/dashboard/web/public/assets/vendor/libs/select2/select2.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

!(function (e, t) {
    if ('object' == typeof exports && 'object' == typeof module) module.exports = t(require('jQuery'));
    else if ('function' == typeof define && define.amd) define(['jQuery'], t);
    else {
        var n = 'object' == typeof exports ? t(require('jQuery')) : t(e.jQuery);
        for (var i in n) ('object' == typeof exports ? exports : e)[i] = n[i];
    }
})(self, function (e) {
    return (function () {
        var t = {
                1908: function (e, t, n) {
                    var i, r, o;
                    ((r = [n(1145)]),
                        (i = function (t) {
                            var n = (function () {
                                    if (t && t.fn && t.fn.select2 && t.fn.select2.amd) var n = t.fn.select2.amd;
                                    return (
                                        (function () {
                                            var e, t, i;
                                            (n && n.requirejs) ||
                                                (n ? (t = n) : (n = {}),
                                                (function (n) {
                                                    var r,
                                                        o,
                                                        s,
                                                        a,
                                                        l = {},
                                                        c = {},
                                                        u = {},
                                                        d = {},
                                                        p = Object.prototype.hasOwnProperty,
                                                        h = [].slice,
                                                        f = /\.js$/;
                                                    function g(e, t) {
                                                        return p.call(e, t);
                                                    }
                                                    function m(e, t) {
                                                        var n,
                                                            i,
                                                            r,
                                                            o,
                                                            s,
                                                            a,
                                                            l,
                                                            c,
                                                            d,
                                                            p,
                                                            h,
                                                            g = t && t.split('/'),
                                                            m = u.map,
                                                            v = (m && m['*']) || {};
                                                        if (e) {
                                                            for (
                                                                s = (e = e.split('/')).length - 1,
                                                                    u.nodeIdCompat && f.test(e[s]) && (e[s] = e[s].replace(f, '')),
                                                                    '.' === e[0].charAt(0) && g && (e = g.slice(0, g.length - 1).concat(e)),
                                                                    d = 0;
                                                                d < e.length;
                                                                d++
                                                            )
                                                                if ('.' === (h = e[d])) (e.splice(d, 1), (d -= 1));
                                                                else if ('..' === h) {
                                                                    if (0 === d || (1 === d && '..' === e[2]) || '..' === e[d - 1])
                                                                        continue;
                                                                    d > 0 && (e.splice(d - 1, 2), (d -= 2));
                                                                }
                                                            e = e.join('/');
                                                        }
                                                        if ((g || v) && m) {
                                                            for (d = (n = e.split('/')).length; d > 0; d -= 1) {
                                                                if (((i = n.slice(0, d).join('/')), g))
                                                                    for (p = g.length; p > 0; p -= 1)
                                                                        if ((r = m[g.slice(0, p).join('/')]) && (r = r[i])) {
                                                                            ((o = r), (a = d));
                                                                            break;
                                                                        }
                                                                if (o) break;
                                                                !l && v && v[i] && ((l = v[i]), (c = d));
                                                            }
                                                            (!o && l && ((o = l), (a = c)), o && (n.splice(0, a, o), (e = n.join('/'))));
                                                        }
                                                        return e;
                                                    }
                                                    function v(e, t) {
                                                        return function () {
                                                            var i = h.call(arguments, 0);
                                                            return (
                                                                'string' != typeof i[0] && 1 === i.length && i.push(null),
                                                                o.apply(n, i.concat([e, t]))
                                                            );
                                                        };
                                                    }
                                                    function y(e) {
                                                        return function (t) {
                                                            return m(t, e);
                                                        };
                                                    }
                                                    function _(e) {
                                                        return function (t) {
                                                            l[e] = t;
                                                        };
                                                    }
                                                    function w(e) {
                                                        if (g(c, e)) {
                                                            var t = c[e];
                                                            (delete c[e], (d[e] = !0), r.apply(n, t));
                                                        }
                                                        if (!g(l, e) && !g(d, e)) throw new Error('No ' + e);
                                                        return l[e];
                                                    }
                                                    function $(e) {
                                                        var t,
                                                            n = e ? e.indexOf('!') : -1;
                                                        return (
                                                            n > -1 && ((t = e.substring(0, n)), (e = e.substring(n + 1, e.length))),
                                                            [t, e]
                                                        );
                                                    }
                                                    function b(e) {
                                                        return e ? $(e) : [];
                                                    }
                                                    function x(e) {
                                                        return function () {
                                                            return (u && u.config && u.config[e]) || {};
                                                        };
                                                    }
                                                    ((s = function (e, t) {
                                                        var n,
                                                            i = $(e),
                                                            r = i[0],
                                                            o = t[1];
                                                        return (
                                                            (e = i[1]),
                                                            r && (n = w((r = m(r, o)))),
                                                            r
                                                                ? (e = n && n.normalize ? n.normalize(e, y(o)) : m(e, o))
                                                                : ((r = (i = $((e = m(e, o))))[0]), (e = i[1]), r && (n = w(r))),
                                                            { f: r ? r + '!' + e : e, n: e, pr: r, p: n }
                                                        );
                                                    }),
                                                        (a = {
                                                            require: function (e) {
                                                                return v(e);
                                                            },
                                                            exports: function (e) {
                                                                var t = l[e];
                                                                return void 0 !== t ? t : (l[e] = {});
                                                            },
                                                            module: function (e) {
                                                                return { id: e, uri: '', exports: l[e], config: x(e) };
                                                            },
                                                        }),
                                                        (r = function (e, t, i, r) {
                                                            var o,
                                                                u,
                                                                p,
                                                                h,
                                                                f,
                                                                m,
                                                                y,
                                                                $ = [],
                                                                x = typeof i;
                                                            if (((m = b((r = r || e))), 'undefined' === x || 'function' === x)) {
                                                                for (
                                                                    t = !t.length && i.length ? ['require', 'exports', 'module'] : t, f = 0;
                                                                    f < t.length;
                                                                    f += 1
                                                                )
                                                                    if ('require' === (u = (h = s(t[f], m)).f)) $[f] = a.require(e);
                                                                    else if ('exports' === u) (($[f] = a.exports(e)), (y = !0));
                                                                    else if ('module' === u) o = $[f] = a.module(e);
                                                                    else if (g(l, u) || g(c, u) || g(d, u)) $[f] = w(u);
                                                                    else {
                                                                        if (!h.p) throw new Error(e + ' missing ' + u);
                                                                        (h.p.load(h.n, v(r, !0), _(u), {}), ($[f] = l[u]));
                                                                    }
                                                                ((p = i ? i.apply(l[e], $) : void 0),
                                                                    e &&
                                                                        (o && o.exports !== n && o.exports !== l[e]
                                                                            ? (l[e] = o.exports)
                                                                            : (p === n && y) || (l[e] = p)));
                                                            } else e && (l[e] = i);
                                                        }),
                                                        (e =
                                                            t =
                                                            o =
                                                                function (e, t, i, l, c) {
                                                                    if ('string' == typeof e) return a[e] ? a[e](t) : w(s(e, b(t)).f);
                                                                    if (!e.splice) {
                                                                        if (((u = e).deps && o(u.deps, u.callback), !t)) return;
                                                                        t.splice ? ((e = t), (t = i), (i = null)) : (e = n);
                                                                    }
                                                                    return (
                                                                        (t = t || function () {}),
                                                                        'function' == typeof i && ((i = l), (l = c)),
                                                                        l
                                                                            ? r(n, e, t, i)
                                                                            : setTimeout(function () {
                                                                                  r(n, e, t, i);
                                                                              }, 4),
                                                                        o
                                                                    );
                                                                }),
                                                        (o.config = function (e) {
                                                            return o(e);
                                                        }),
                                                        (e._defined = l),
                                                        ((i = function (e, t, n) {
                                                            if ('string' != typeof e)
                                                                throw new Error(
                                                                    'See almond README: incorrect module build, no module name'
                                                                );
                                                            (t.splice || ((n = t), (t = [])), g(l, e) || g(c, e) || (c[e] = [e, t, n]));
                                                        }).amd = { jQuery: !0 }));
                                                })(),
                                                (n.requirejs = e),
                                                (n.require = t),
                                                (n.define = i));
                                        })(),
                                        n.define('almond', function () {}),
                                        n.define('jquery', [], function () {
                                            var e = t || $;
                                            return (null == e && console && console.error, e);
                                        }),
                                        n.define('select2/utils', ['jquery'], function (e) {
                                            var t = {};
                                            function n(e) {
                                                var t = e.prototype,
                                                    n = [];
                                                for (var i in t) 'function' == typeof t[i] && 'constructor' !== i && n.push(i);
                                                return n;
                                            }
                                            ((t.Extend = function (e, t) {
                                                var n = {}.hasOwnProperty;
                                                function i() {
                                                    this.constructor = e;
                                                }
                                                for (var r in t) n.call(t, r) && (e[r] = t[r]);
                                                return (
                                                    (i.prototype = t.prototype),
                                                    (e.prototype = new i()),
                                                    (e.__super__ = t.prototype),
                                                    e
                                                );
                                            }),
                                                (t.Decorate = function (e, t) {
                                                    var i = n(t),
                                                        r = n(e);
                                                    function o() {
                                                        var n = Array.prototype.unshift,
                                                            i = t.prototype.constructor.length,
                                                            r = e.prototype.constructor;
                                                        (i > 0 &&
                                                            (n.call(arguments, e.prototype.constructor), (r = t.prototype.constructor)),
                                                            r.apply(this, arguments));
                                                    }
                                                    function s() {
                                                        this.constructor = o;
                                                    }
                                                    ((t.displayName = e.displayName), (o.prototype = new s()));
                                                    for (var a = 0; a < r.length; a++) {
                                                        var l = r[a];
                                                        o.prototype[l] = e.prototype[l];
                                                    }
                                                    for (
                                                        var c = function (e) {
                                                                var n = function () {};
                                                                (e in o.prototype) && (n = o.prototype[e]);
                                                                var i = t.prototype[e];
                                                                return function () {
                                                                    return (
                                                                        Array.prototype.unshift.call(arguments, n),
                                                                        i.apply(this, arguments)
                                                                    );
                                                                };
                                                            },
                                                            u = 0;
                                                        u < i.length;
                                                        u++
                                                    ) {
                                                        var d = i[u];
                                                        o.prototype[d] = c(d);
                                                    }
                                                    return o;
                                                }));
                                            var i = function () {
                                                this.listeners = {};
                                            };
                                            ((i.prototype.on = function (e, t) {
                                                ((this.listeners = this.listeners || {}),
                                                    e in this.listeners ? this.listeners[e].push(t) : (this.listeners[e] = [t]));
                                            }),
                                                (i.prototype.trigger = function (e) {
                                                    var t = Array.prototype.slice,
                                                        n = t.call(arguments, 1);
                                                    ((this.listeners = this.listeners || {}),
                                                        null == n && (n = []),
                                                        0 === n.length && n.push({}),
                                                        (n[0]._type = e),
                                                        e in this.listeners && this.invoke(this.listeners[e], t.call(arguments, 1)),
                                                        '*' in this.listeners && this.invoke(this.listeners['*'], arguments));
                                                }),
                                                (i.prototype.invoke = function (e, t) {
                                                    for (var n = 0, i = e.length; n < i; n++) e[n].apply(this, t);
                                                }),
                                                (t.Observable = i),
                                                (t.generateChars = function (e) {
                                                    for (var t = '', n = 0; n < e; n++) t += Math.floor(36 * Math.random()).toString(36);
                                                    return t;
                                                }),
                                                (t.bind = function (e, t) {
                                                    return function () {
                                                        e.apply(t, arguments);
                                                    };
                                                }),
                                                (t._convertData = function (e) {
                                                    for (var t in e) {
                                                        var n = t.split('-'),
                                                            i = e;
                                                        if (1 !== n.length) {
                                                            for (var r = 0; r < n.length; r++) {
                                                                var o = n[r];
                                                                ((o = o.substring(0, 1).toLowerCase() + o.substring(1)) in i || (i[o] = {}),
                                                                    r == n.length - 1 && (i[o] = e[t]),
                                                                    (i = i[o]));
                                                            }
                                                            delete e[t];
                                                        }
                                                    }
                                                    return e;
                                                }),
                                                (t.hasScroll = function (t, n) {
                                                    var i = e(n),
                                                        r = n.style.overflowX,
                                                        o = n.style.overflowY;
                                                    return (
                                                        (r !== o || ('hidden' !== o && 'visible' !== o)) &&
                                                        ('scroll' === r ||
                                                            'scroll' === o ||
                                                            i.innerHeight() < n.scrollHeight ||
                                                            i.innerWidth() < n.scrollWidth)
                                                    );
                                                }),
                                                (t.escapeMarkup = function (e) {
                                                    var t = {
                                                        '\\': '&#92;',
                                                        '&': '&amp;',
                                                        '<': '&lt;',
                                                        '>': '&gt;',
                                                        '"': '&quot;',
                                                        "'": '&#39;',
                                                        '/': '&#47;',
                                                    };
                                                    return 'string' != typeof e
                                                        ? e
                                                        : String(e).replace(/[&<>"'\/\\]/g, function (e) {
                                                              return t[e];
                                                          });
                                                }),
                                                (t.appendMany = function (t, n) {
                                                    if ('1.7' === e.fn.jquery.substr(0, 3)) {
                                                        var i = e();
                                                        (e.map(n, function (e) {
                                                            i = i.add(e);
                                                        }),
                                                            (n = i));
                                                    }
                                                    t.append(n);
                                                }),
                                                (t.__cache = {}));
                                            var r = 0;
                                            return (
                                                (t.GetUniqueElementId = function (e) {
                                                    var t = e.getAttribute('data-select2-id');
                                                    return (
                                                        null == t &&
                                                            (e.id
                                                                ? ((t = e.id), e.setAttribute('data-select2-id', t))
                                                                : (e.setAttribute('data-select2-id', ++r), (t = r.toString()))),
                                                        t
                                                    );
                                                }),
                                                (t.StoreData = function (e, n, i) {
                                                    var r = t.GetUniqueElementId(e);
                                                    (t.__cache[r] || (t.__cache[r] = {}), (t.__cache[r][n] = i));
                                                }),
                                                (t.GetData = function (n, i) {
                                                    var r = t.GetUniqueElementId(n);
                                                    return i
                                                        ? t.__cache[r] && null != t.__cache[r][i]
                                                            ? t.__cache[r][i]
                                                            : e(n).data(i)
                                                        : t.__cache[r];
                                                }),
                                                (t.RemoveData = function (e) {
                                                    var n = t.GetUniqueElementId(e);
                                                    (null != t.__cache[n] && delete t.__cache[n], e.removeAttribute('data-select2-id'));
                                                }),
                                                t
                                            );
                                        }),
                                        n.define('select2/results', ['jquery', './utils'], function (e, t) {
                                            function n(e, t, i) {
                                                ((this.$element = e),
                                                    (this.data = i),
                                                    (this.options = t),
                                                    n.__super__.constructor.call(this));
                                            }
                                            return (
                                                t.Extend(n, t.Observable),
                                                (n.prototype.render = function () {
                                                    var t = e('<ul class="select2-results__options" role="listbox"></ul>');
                                                    return (
                                                        this.options.get('multiple') && t.attr('aria-multiselectable', 'true'),
                                                        (this.$results = t),
                                                        t
                                                    );
                                                }),
                                                (n.prototype.clear = function () {
                                                    this.$results.empty();
                                                }),
                                                (n.prototype.displayMessage = function (t) {
                                                    var n = this.options.get('escapeMarkup');
                                                    (this.clear(), this.hideLoading());
                                                    var i = e(
                                                            '<li role="alert" aria-live="assertive" class="select2-results__option"></li>'
                                                        ),
                                                        r = this.options.get('translations').get(t.message);
                                                    (i.append(n(r(t.args))),
                                                        (i[0].className += ' select2-results__message'),
                                                        this.$results.append(i));
                                                }),
                                                (n.prototype.hideMessages = function () {
                                                    this.$results.find('.select2-results__message').remove();
                                                }),
                                                (n.prototype.append = function (e) {
                                                    this.hideLoading();
                                                    var t = [];
                                                    if (null != e.results && 0 !== e.results.length) {
                                                        e.results = this.sort(e.results);
                                                        for (var n = 0; n < e.results.length; n++) {
                                                            var i = e.results[n],
                                                                r = this.option(i);
                                                            t.push(r);
                                                        }
                                                        this.$results.append(t);
                                                    } else
                                                        0 === this.$results.children().length &&
                                                            this.trigger('results:message', { message: 'noResults' });
                                                }),
                                                (n.prototype.position = function (e, t) {
                                                    t.find('.select2-results').append(e);
                                                }),
                                                (n.prototype.sort = function (e) {
                                                    return this.options.get('sorter')(e);
                                                }),
                                                (n.prototype.highlightFirstItem = function () {
                                                    var e = this.$results.find('.select2-results__option[aria-selected]'),
                                                        t = e.filter('[aria-selected=true]');
                                                    (t.length > 0 ? t.first().trigger('mouseenter') : e.first().trigger('mouseenter'),
                                                        this.ensureHighlightVisible());
                                                }),
                                                (n.prototype.setClasses = function () {
                                                    var n = this;
                                                    this.data.current(function (i) {
                                                        var r = e.map(i, function (e) {
                                                            return e.id.toString();
                                                        });
                                                        n.$results.find('.select2-results__option[aria-selected]').each(function () {
                                                            var n = e(this),
                                                                i = t.GetData(this, 'data'),
                                                                o = '' + i.id;
                                                            (null != i.element && i.element.selected) ||
                                                            (null == i.element && e.inArray(o, r) > -1)
                                                                ? n.attr('aria-selected', 'true')
                                                                : n.attr('aria-selected', 'false');
                                                        });
                                                    });
                                                }),
                                                (n.prototype.showLoading = function (e) {
                                                    this.hideLoading();
                                                    var t = {
                                                            disabled: !0,
                                                            loading: !0,
                                                            text: this.options.get('translations').get('searching')(e),
                                                        },
                                                        n = this.option(t);
                                                    ((n.className += ' loading-results'), this.$results.prepend(n));
                                                }),
                                                (n.prototype.hideLoading = function () {
                                                    this.$results.find('.loading-results').remove();
                                                }),
                                                (n.prototype.option = function (n) {
                                                    var i = document.createElement('li');
                                                    i.className = 'select2-results__option';
                                                    var r = { role: 'option', 'aria-selected': 'false' },
                                                        o =
                                                            window.Element.prototype.matches ||
                                                            window.Element.prototype.msMatchesSelector ||
                                                            window.Element.prototype.webkitMatchesSelector;
                                                    for (var s in (((null != n.element && o.call(n.element, ':disabled')) ||
                                                        (null == n.element && n.disabled)) &&
                                                        (delete r['aria-selected'], (r['aria-disabled'] = 'true')),
                                                    null == n.id && delete r['aria-selected'],
                                                    null != n._resultId && (i.id = n._resultId),
                                                    n.title && (i.title = n.title),
                                                    n.children &&
                                                        ((r.role = 'group'), (r['aria-label'] = n.text), delete r['aria-selected']),
                                                    r)) {
                                                        var a = r[s];
                                                        i.setAttribute(s, a);
                                                    }
                                                    if (n.children) {
                                                        var l = e(i),
                                                            c = document.createElement('strong');
                                                        ((c.className = 'select2-results__group'), e(c), this.template(n, c));
                                                        for (var u = [], d = 0; d < n.children.length; d++) {
                                                            var p = n.children[d],
                                                                h = this.option(p);
                                                            u.push(h);
                                                        }
                                                        var f = e('<ul></ul>', {
                                                            class: 'select2-results__options select2-results__options--nested',
                                                        });
                                                        (f.append(u), l.append(c), l.append(f));
                                                    } else this.template(n, i);
                                                    return (t.StoreData(i, 'data', n), i);
                                                }),
                                                (n.prototype.bind = function (n, i) {
                                                    var r = this,
                                                        o = n.id + '-results';
                                                    (this.$results.attr('id', o),
                                                        n.on('results:all', function (e) {
                                                            (r.clear(),
                                                                r.append(e.data),
                                                                n.isOpen() && (r.setClasses(), r.highlightFirstItem()));
                                                        }),
                                                        n.on('results:append', function (e) {
                                                            (r.append(e.data), n.isOpen() && r.setClasses());
                                                        }),
                                                        n.on('query', function (e) {
                                                            (r.hideMessages(), r.showLoading(e));
                                                        }),
                                                        n.on('select', function () {
                                                            n.isOpen() &&
                                                                (r.setClasses(),
                                                                r.options.get('scrollAfterSelect') && r.highlightFirstItem());
                                                        }),
                                                        n.on('unselect', function () {
                                                            n.isOpen() &&
                                                                (r.setClasses(),
                                                                r.options.get('scrollAfterSelect') && r.highlightFirstItem());
                                                        }),
                                                        n.on('open', function () {
                                                            (r.$results.attr('aria-expanded', 'true'),
                                                                r.$results.attr('aria-hidden', 'false'),
                                                                r.setClasses(),
                                                                r.ensureHighlightVisible());
                                                        }),
                                                        n.on('close', function () {
                                                            (r.$results.attr('aria-expanded', 'false'),
                                                                r.$results.attr('aria-hidden', 'true'),
                                                                r.$results.removeAttr('aria-activedescendant'));
                                                        }),
                                                        n.on('results:toggle', function () {
                                                            var e = r.getHighlightedResults();
                                                            0 !== e.length && e.trigger('mouseup');
                                                        }),
                                                        n.on('results:select', function () {
                                                            var e = r.getHighlightedResults();
                                                            if (0 !== e.length) {
                                                                var n = t.GetData(e[0], 'data');
                                                                'true' == e.attr('aria-selected')
                                                                    ? r.trigger('close', {})
                                                                    : r.trigger('select', { data: n });
                                                            }
                                                        }),
                                                        n.on('results:previous', function () {
                                                            var e = r.getHighlightedResults(),
                                                                t = r.$results.find('[aria-selected]'),
                                                                n = t.index(e);
                                                            if (!(n <= 0)) {
                                                                var i = n - 1;
                                                                0 === e.length && (i = 0);
                                                                var o = t.eq(i);
                                                                o.trigger('mouseenter');
                                                                var s = r.$results.offset().top,
                                                                    a = o.offset().top,
                                                                    l = r.$results.scrollTop() + (a - s);
                                                                0 === i ? r.$results.scrollTop(0) : a - s < 0 && r.$results.scrollTop(l);
                                                            }
                                                        }),
                                                        n.on('results:next', function () {
                                                            var e = r.getHighlightedResults(),
                                                                t = r.$results.find('[aria-selected]'),
                                                                n = t.index(e) + 1;
                                                            if (!(n >= t.length)) {
                                                                var i = t.eq(n);
                                                                i.trigger('mouseenter');
                                                                var o = r.$results.offset().top + r.$results.outerHeight(!1),
                                                                    s = i.offset().top + i.outerHeight(!1),
                                                                    a = r.$results.scrollTop() + s - o;
                                                                0 === n ? r.$results.scrollTop(0) : s > o && r.$results.scrollTop(a);
                                                            }
                                                        }),
                                                        n.on('results:focus', function (e) {
                                                            e.element.addClass('select2-results__option--highlighted');
                                                        }),
                                                        n.on('results:message', function (e) {
                                                            r.displayMessage(e);
                                                        }),
                                                        e.fn.mousewheel &&
                                                            this.$results.on('mousewheel', function (e) {
                                                                var t = r.$results.scrollTop(),
                                                                    n = r.$results.get(0).scrollHeight - t + e.deltaY,
                                                                    i = e.deltaY > 0 && t - e.deltaY <= 0,
                                                                    o = e.deltaY < 0 && n <= r.$results.height();
                                                                i
                                                                    ? (r.$results.scrollTop(0), e.preventDefault(), e.stopPropagation())
                                                                    : o &&
                                                                      (r.$results.scrollTop(
                                                                          r.$results.get(0).scrollHeight - r.$results.height()
                                                                      ),
                                                                      e.preventDefault(),
                                                                      e.stopPropagation());
                                                            }),
                                                        this.$results.on(
                                                            'mouseup',
                                                            '.select2-results__option[aria-selected]',
                                                            function (n) {
                                                                var i = e(this),
                                                                    o = t.GetData(this, 'data');
                                                                'true' !== i.attr('aria-selected')
                                                                    ? r.trigger('select', { originalEvent: n, data: o })
                                                                    : r.options.get('multiple')
                                                                      ? r.trigger('unselect', { originalEvent: n, data: o })
                                                                      : r.trigger('close', {});
                                                            }
                                                        ),
                                                        this.$results.on(
                                                            'mouseenter',
                                                            '.select2-results__option[aria-selected]',
                                                            function (n) {
                                                                var i = t.GetData(this, 'data');
                                                                (r
                                                                    .getHighlightedResults()
                                                                    .removeClass('select2-results__option--highlighted'),
                                                                    r.trigger('results:focus', { data: i, element: e(this) }));
                                                            }
                                                        ));
                                                }),
                                                (n.prototype.getHighlightedResults = function () {
                                                    return this.$results.find('.select2-results__option--highlighted');
                                                }),
                                                (n.prototype.destroy = function () {
                                                    this.$results.remove();
                                                }),
                                                (n.prototype.ensureHighlightVisible = function () {
                                                    var e = this.getHighlightedResults();
                                                    if (0 !== e.length) {
                                                        var t = this.$results.find('[aria-selected]').index(e),
                                                            n = this.$results.offset().top,
                                                            i = e.offset().top,
                                                            r = this.$results.scrollTop() + (i - n),
                                                            o = i - n;
                                                        ((r -= 2 * e.outerHeight(!1)),
                                                            t <= 2
                                                                ? this.$results.scrollTop(0)
                                                                : (o > this.$results.outerHeight() || o < 0) && this.$results.scrollTop(r));
                                                    }
                                                }),
                                                (n.prototype.template = function (t, n) {
                                                    var i = this.options.get('templateResult'),
                                                        r = this.options.get('escapeMarkup'),
                                                        o = i(t, n);
                                                    null == o
                                                        ? (n.style.display = 'none')
                                                        : 'string' == typeof o
                                                          ? (n.innerHTML = r(o))
                                                          : e(n).append(o);
                                                }),
                                                n
                                            );
                                        }),
                                        n.define('select2/keys', [], function () {
                                            return {
                                                BACKSPACE: 8,
                                                TAB: 9,
                                                ENTER: 13,
                                                SHIFT: 16,
                                                CTRL: 17,
                                                ALT: 18,
                                                ESC: 27,
                                                SPACE: 32,
                                                PAGE_UP: 33,
                                                PAGE_DOWN: 34,
                                                END: 35,
                                                HOME: 36,
                                                LEFT: 37,
                                                UP: 38,
                                                RIGHT: 39,
                                                DOWN: 40,
                                                DELETE: 46,
                                            };
                                        }),
                                        n.define('select2/selection/base', ['jquery', '../utils', '../keys'], function (e, t, n) {
                                            function i(e, t) {
                                                ((this.$element = e), (this.options = t), i.__super__.constructor.call(this));
                                            }
                                            return (
                                                t.Extend(i, t.Observable),
                                                (i.prototype.render = function () {
                                                    var n = e(
                                                        '<span class="select2-selection" role="combobox"  aria-haspopup="true" aria-expanded="false"></span>'
                                                    );
                                                    return (
                                                        (this._tabindex = 0),
                                                        null != t.GetData(this.$element[0], 'old-tabindex')
                                                            ? (this._tabindex = t.GetData(this.$element[0], 'old-tabindex'))
                                                            : null != this.$element.attr('tabindex') &&
                                                              (this._tabindex = this.$element.attr('tabindex')),
                                                        n.attr('title', this.$element.attr('title')),
                                                        n.attr('tabindex', this._tabindex),
                                                        n.attr('aria-disabled', 'false'),
                                                        (this.$selection = n),
                                                        n
                                                    );
                                                }),
                                                (i.prototype.bind = function (e, t) {
                                                    var i = this,
                                                        r = e.id + '-results';
                                                    ((this.container = e),
                                                        this.$selection.on('focus', function (e) {
                                                            i.trigger('focus', e);
                                                        }),
                                                        this.$selection.on('blur', function (e) {
                                                            i._handleBlur(e);
                                                        }),
                                                        this.$selection.on('keydown', function (e) {
                                                            (i.trigger('keypress', e), e.which === n.SPACE && e.preventDefault());
                                                        }),
                                                        e.on('results:focus', function (e) {
                                                            i.$selection.attr('aria-activedescendant', e.data._resultId);
                                                        }),
                                                        e.on('selection:update', function (e) {
                                                            i.update(e.data);
                                                        }),
                                                        e.on('open', function () {
                                                            (i.$selection.attr('aria-expanded', 'true'),
                                                                i.$selection.attr('aria-owns', r),
                                                                i._attachCloseHandler(e));
                                                        }),
                                                        e.on('close', function () {
                                                            (i.$selection.attr('aria-expanded', 'false'),
                                                                i.$selection.removeAttr('aria-activedescendant'),
                                                                i.$selection.removeAttr('aria-owns'),
                                                                i.$selection.trigger('focus'),
                                                                i._detachCloseHandler(e));
                                                        }),
                                                        e.on('enable', function () {
                                                            (i.$selection.attr('tabindex', i._tabindex),
                                                                i.$selection.attr('aria-disabled', 'false'));
                                                        }),
                                                        e.on('disable', function () {
                                                            (i.$selection.attr('tabindex', '-1'),
                                                                i.$selection.attr('aria-disabled', 'true'));
                                                        }));
                                                }),
                                                (i.prototype._handleBlur = function (t) {
                                                    var n = this;
                                                    window.setTimeout(function () {
                                                        document.activeElement == n.$selection[0] ||
                                                            e.contains(n.$selection[0], document.activeElement) ||
                                                            n.trigger('blur', t);
                                                    }, 1);
                                                }),
                                                (i.prototype._attachCloseHandler = function (n) {
                                                    e(document.body).on('mousedown.select2.' + n.id, function (n) {
                                                        var i = e(n.target).closest('.select2');
                                                        e('.select2.select2-container--open').each(function () {
                                                            this != i[0] && t.GetData(this, 'element').select2('close');
                                                        });
                                                    });
                                                }),
                                                (i.prototype._detachCloseHandler = function (t) {
                                                    e(document.body).off('mousedown.select2.' + t.id);
                                                }),
                                                (i.prototype.position = function (e, t) {
                                                    t.find('.selection').append(e);
                                                }),
                                                (i.prototype.destroy = function () {
                                                    this._detachCloseHandler(this.container);
                                                }),
                                                (i.prototype.update = function (e) {
                                                    throw new Error('The `update` method must be defined in child classes.');
                                                }),
                                                (i.prototype.isEnabled = function () {
                                                    return !this.isDisabled();
                                                }),
                                                (i.prototype.isDisabled = function () {
                                                    return this.options.get('disabled');
                                                }),
                                                i
                                            );
                                        }),
                                        n.define(
                                            'select2/selection/single',
                                            ['jquery', './base', '../utils', '../keys'],
                                            function (e, t, n, i) {
                                                function r() {
                                                    r.__super__.constructor.apply(this, arguments);
                                                }
                                                return (
                                                    n.Extend(r, t),
                                                    (r.prototype.render = function () {
                                                        var e = r.__super__.render.call(this);
                                                        return (
                                                            e.addClass('select2-selection--single'),
                                                            e.html(
                                                                '<span class="select2-selection__rendered"></span><span class="select2-selection__arrow" role="presentation"><b role="presentation"></b></span>'
                                                            ),
                                                            e
                                                        );
                                                    }),
                                                    (r.prototype.bind = function (e, t) {
                                                        var n = this;
                                                        r.__super__.bind.apply(this, arguments);
                                                        var i = e.id + '-container';
                                                        (this.$selection
                                                            .find('.select2-selection__rendered')
                                                            .attr('id', i)
                                                            .attr('role', 'textbox')
                                                            .attr('aria-readonly', 'true'),
                                                            this.$selection.attr('aria-labelledby', i),
                                                            this.$selection.on('mousedown', function (e) {
                                                                1 === e.which && n.trigger('toggle', { originalEvent: e });
                                                            }),
                                                            this.$selection.on('focus', function (e) {}),
                                                            this.$selection.on('blur', function (e) {}),
                                                            e.on('focus', function (t) {
                                                                e.isOpen() || n.$selection.trigger('focus');
                                                            }));
                                                    }),
                                                    (r.prototype.clear = function () {
                                                        var e = this.$selection.find('.select2-selection__rendered');
                                                        (e.empty(), e.removeAttr('title'));
                                                    }),
                                                    (r.prototype.display = function (e, t) {
                                                        var n = this.options.get('templateSelection');
                                                        return this.options.get('escapeMarkup')(n(e, t));
                                                    }),
                                                    (r.prototype.selectionContainer = function () {
                                                        return e('<span></span>');
                                                    }),
                                                    (r.prototype.update = function (e) {
                                                        if (0 !== e.length) {
                                                            var t = e[0],
                                                                n = this.$selection.find('.select2-selection__rendered'),
                                                                i = this.display(t, n);
                                                            n.empty().append(i);
                                                            var r = t.title || t.text;
                                                            r ? n.attr('title', r) : n.removeAttr('title');
                                                        } else this.clear();
                                                    }),
                                                    r
                                                );
                                            }
                                        ),
                                        n.define('select2/selection/multiple', ['jquery', './base', '../utils'], function (e, t, n) {
                                            function i(e, t) {
                                                i.__super__.constructor.apply(this, arguments);
                                            }
                                            return (
                                                n.Extend(i, t),
                                                (i.prototype.render = function () {
                                                    var e = i.__super__.render.call(this);
                                                    return (
                                                        e.addClass('select2-selection--multiple'),
                                                        e.html('<ul class="select2-selection__rendered"></ul>'),
                                                        e
                                                    );
                                                }),
                                                (i.prototype.bind = function (t, r) {
                                                    var o = this;
                                                    (i.__super__.bind.apply(this, arguments),
                                                        this.$selection.on('click', function (e) {
                                                            o.trigger('toggle', { originalEvent: e });
                                                        }),
                                                        this.$selection.on('click', '.select2-selection__choice__remove', function (t) {
                                                            if (!o.isDisabled()) {
                                                                var i = e(this).parent(),
                                                                    r = n.GetData(i[0], 'data');
                                                                o.trigger('unselect', { originalEvent: t, data: r });
                                                            }
                                                        }));
                                                }),
                                                (i.prototype.clear = function () {
                                                    var e = this.$selection.find('.select2-selection__rendered');
                                                    (e.empty(), e.removeAttr('title'));
                                                }),
                                                (i.prototype.display = function (e, t) {
                                                    var n = this.options.get('templateSelection');
                                                    return this.options.get('escapeMarkup')(n(e, t));
                                                }),
                                                (i.prototype.selectionContainer = function () {
                                                    return e(
                                                        '<li class="select2-selection__choice"><span class="select2-selection__choice__remove" role="presentation">&times;</span></li>'
                                                    );
                                                }),
                                                (i.prototype.update = function (e) {
                                                    if ((this.clear(), 0 !== e.length)) {
                                                        for (var t = [], i = 0; i < e.length; i++) {
                                                            var r = e[i],
                                                                o = this.selectionContainer(),
                                                                s = this.display(r, o);
                                                            o.append(s);
                                                            var a = r.title || r.text;
                                                            (a && o.attr('title', a), n.StoreData(o[0], 'data', r), t.push(o));
                                                        }
                                                        var l = this.$selection.find('.select2-selection__rendered');
                                                        n.appendMany(l, t);
                                                    }
                                                }),
                                                i
                                            );
                                        }),
                                        n.define('select2/selection/placeholder', ['../utils'], function (e) {
                                            function t(e, t, n) {
                                                ((this.placeholder = this.normalizePlaceholder(n.get('placeholder'))), e.call(this, t, n));
                                            }
                                            return (
                                                (t.prototype.normalizePlaceholder = function (e, t) {
                                                    return ('string' == typeof t && (t = { id: '', text: t }), t);
                                                }),
                                                (t.prototype.createPlaceholder = function (e, t) {
                                                    var n = this.selectionContainer();
                                                    return (
                                                        n.html(this.display(t)),
                                                        n
                                                            .addClass('select2-selection__placeholder')
                                                            .removeClass('select2-selection__choice'),
                                                        n
                                                    );
                                                }),
                                                (t.prototype.update = function (e, t) {
                                                    var n = 1 == t.length && t[0].id != this.placeholder.id;
                                                    if (t.length > 1 || n) return e.call(this, t);
                                                    this.clear();
                                                    var i = this.createPlaceholder(this.placeholder);
                                                    this.$selection.find('.select2-selection__rendered').append(i);
                                                }),
                                                t
                                            );
                                        }),
                                        n.define('select2/selection/allowClear', ['jquery', '../keys', '../utils'], function (e, t, n) {
                                            function i() {}
                                            return (
                                                (i.prototype.bind = function (e, t, n) {
                                                    var i = this;
                                                    (e.call(this, t, n),
                                                        null == this.placeholder &&
                                                            this.options.get('debug') &&
                                                            window.console &&
                                                            console.error,
                                                        this.$selection.on('mousedown', '.select2-selection__clear', function (e) {
                                                            i._handleClear(e);
                                                        }),
                                                        t.on('keypress', function (e) {
                                                            i._handleKeyboardClear(e, t);
                                                        }));
                                                }),
                                                (i.prototype._handleClear = function (e, t) {
                                                    if (!this.isDisabled()) {
                                                        var i = this.$selection.find('.select2-selection__clear');
                                                        if (0 !== i.length) {
                                                            t.stopPropagation();
                                                            var r = n.GetData(i[0], 'data'),
                                                                o = this.$element.val();
                                                            this.$element.val(this.placeholder.id);
                                                            var s = { data: r };
                                                            if ((this.trigger('clear', s), s.prevented)) this.$element.val(o);
                                                            else {
                                                                for (var a = 0; a < r.length; a++)
                                                                    if (((s = { data: r[a] }), this.trigger('unselect', s), s.prevented))
                                                                        return void this.$element.val(o);
                                                                (this.$element.trigger('input').trigger('change'),
                                                                    this.trigger('toggle', {}));
                                                            }
                                                        }
                                                    }
                                                }),
                                                (i.prototype._handleKeyboardClear = function (e, n, i) {
                                                    i.isOpen() || (n.which != t.DELETE && n.which != t.BACKSPACE) || this._handleClear(n);
                                                }),
                                                (i.prototype.update = function (t, i) {
                                                    if (
                                                        (t.call(this, i),
                                                        !(
                                                            this.$selection.find('.select2-selection__placeholder').length > 0 ||
                                                            0 === i.length
                                                        ))
                                                    ) {
                                                        var r = this.options.get('translations').get('removeAllItems'),
                                                            o = e(
                                                                '<span class="select2-selection__clear" title="' + r() + '">&times;</span>'
                                                            );
                                                        (n.StoreData(o[0], 'data', i),
                                                            this.$selection.find('.select2-selection__rendered').prepend(o));
                                                    }
                                                }),
                                                i
                                            );
                                        }),
                                        n.define('select2/selection/search', ['jquery', '../utils', '../keys'], function (e, t, n) {
                                            function i(e, t, n) {
                                                e.call(this, t, n);
                                            }
                                            return (
                                                (i.prototype.render = function (t) {
                                                    var n = e(
                                                        '<li class="select2-search select2-search--inline"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" role="searchbox" aria-autocomplete="list" /></li>'
                                                    );
                                                    ((this.$searchContainer = n), (this.$search = n.find('input')));
                                                    var i = t.call(this);
                                                    return (this._transferTabIndex(), i);
                                                }),
                                                (i.prototype.bind = function (e, i, r) {
                                                    var o = this,
                                                        s = i.id + '-results';
                                                    (e.call(this, i, r),
                                                        i.on('open', function () {
                                                            (o.$search.attr('aria-controls', s), o.$search.trigger('focus'));
                                                        }),
                                                        i.on('close', function () {
                                                            (o.$search.val(''),
                                                                o.$search.removeAttr('aria-controls'),
                                                                o.$search.removeAttr('aria-activedescendant'),
                                                                o.$search.trigger('focus'));
                                                        }),
                                                        i.on('enable', function () {
                                                            (o.$search.prop('disabled', !1), o._transferTabIndex());
                                                        }),
                                                        i.on('disable', function () {
                                                            o.$search.prop('disabled', !0);
                                                        }),
                                                        i.on('focus', function (e) {
                                                            o.$search.trigger('focus');
                                                        }),
                                                        i.on('results:focus', function (e) {
                                                            e.data._resultId
                                                                ? o.$search.attr('aria-activedescendant', e.data._resultId)
                                                                : o.$search.removeAttr('aria-activedescendant');
                                                        }),
                                                        this.$selection.on('focusin', '.select2-search--inline', function (e) {
                                                            o.trigger('focus', e);
                                                        }),
                                                        this.$selection.on('focusout', '.select2-search--inline', function (e) {
                                                            o._handleBlur(e);
                                                        }),
                                                        this.$selection.on('keydown', '.select2-search--inline', function (e) {
                                                            if (
                                                                (e.stopPropagation(),
                                                                o.trigger('keypress', e),
                                                                (o._keyUpPrevented = e.isDefaultPrevented()),
                                                                e.which === n.BACKSPACE && '' === o.$search.val())
                                                            ) {
                                                                var i = o.$searchContainer.prev('.select2-selection__choice');
                                                                if (i.length > 0) {
                                                                    var r = t.GetData(i[0], 'data');
                                                                    (o.searchRemoveChoice(r), e.preventDefault());
                                                                }
                                                            }
                                                        }),
                                                        this.$selection.on('click', '.select2-search--inline', function (e) {
                                                            o.$search.val() && e.stopPropagation();
                                                        }));
                                                    var a = document.documentMode,
                                                        l = a && a <= 11;
                                                    (this.$selection.on('input.searchcheck', '.select2-search--inline', function (e) {
                                                        l
                                                            ? o.$selection.off('input.search input.searchcheck')
                                                            : o.$selection.off('keyup.search');
                                                    }),
                                                        this.$selection.on(
                                                            'keyup.search input.search',
                                                            '.select2-search--inline',
                                                            function (e) {
                                                                if (l && 'input' === e.type)
                                                                    o.$selection.off('input.search input.searchcheck');
                                                                else {
                                                                    var t = e.which;
                                                                    t != n.SHIFT &&
                                                                        t != n.CTRL &&
                                                                        t != n.ALT &&
                                                                        t != n.TAB &&
                                                                        o.handleSearch(e);
                                                                }
                                                            }
                                                        ));
                                                }),
                                                (i.prototype._transferTabIndex = function (e) {
                                                    (this.$search.attr('tabindex', this.$selection.attr('tabindex')),
                                                        this.$selection.attr('tabindex', '-1'));
                                                }),
                                                (i.prototype.createPlaceholder = function (e, t) {
                                                    this.$search.attr('placeholder', t.text);
                                                }),
                                                (i.prototype.update = function (e, t) {
                                                    var n = this.$search[0] == document.activeElement;
                                                    (this.$search.attr('placeholder', ''),
                                                        e.call(this, t),
                                                        this.$selection.find('.select2-selection__rendered').append(this.$searchContainer),
                                                        this.resizeSearch(),
                                                        n && this.$search.trigger('focus'));
                                                }),
                                                (i.prototype.handleSearch = function () {
                                                    if ((this.resizeSearch(), !this._keyUpPrevented)) {
                                                        var e = this.$search.val();
                                                        this.trigger('query', { term: e });
                                                    }
                                                    this._keyUpPrevented = !1;
                                                }),
                                                (i.prototype.searchRemoveChoice = function (e, t) {
                                                    (this.trigger('unselect', { data: t }), this.$search.val(t.text), this.handleSearch());
                                                }),
                                                (i.prototype.resizeSearch = function () {
                                                    this.$search.css('width', '25px');
                                                    var e = '';
                                                    ((e =
                                                        '' !== this.$search.attr('placeholder')
                                                            ? this.$selection.find('.select2-selection__rendered').width()
                                                            : 0.75 * (this.$search.val().length + 1) + 'em'),
                                                        this.$search.css('width', e));
                                                }),
                                                i
                                            );
                                        }),
                                        n.define('select2/selection/eventRelay', ['jquery'], function (e) {
                                            function t() {}
                                            return (
                                                (t.prototype.bind = function (t, n, i) {
                                                    var r = this,
                                                        o = [
                                                            'open',
                                                            'opening',
                                                            'close',
                                                            'closing',
                                                            'select',
                                                            'selecting',
                                                            'unselect',
                                                            'unselecting',
                                                            'clear',
                                                            'clearing',
                                                        ],
                                                        s = ['opening', 'closing', 'selecting', 'unselecting', 'clearing'];
                                                    (t.call(this, n, i),
                                                        n.on('*', function (t, n) {
                                                            if (-1 !== e.inArray(t, o)) {
                                                                n = n || {};
                                                                var i = e.Event('select2:' + t, { params: n });
                                                                (r.$element.trigger(i),
                                                                    -1 !== e.inArray(t, s) && (n.prevented = i.isDefaultPrevented()));
                                                            }
                                                        }));
                                                }),
                                                t
                                            );
                                        }),
                                        n.define('select2/translation', ['jquery', 'require'], function (e, t) {
                                            function n(e) {
                                                this.dict = e || {};
                                            }
                                            return (
                                                (n.prototype.all = function () {
                                                    return this.dict;
                                                }),
                                                (n.prototype.get = function (e) {
                                                    return this.dict[e];
                                                }),
                                                (n.prototype.extend = function (t) {
                                                    this.dict = e.extend({}, t.all(), this.dict);
                                                }),
                                                (n._cache = {}),
                                                (n.loadPath = function (e) {
                                                    if (!(e in n._cache)) {
                                                        var i = t(e);
                                                        n._cache[e] = i;
                                                    }
                                                    return new n(n._cache[e]);
                                                }),
                                                n
                                            );
                                        }),
                                        n.define('select2/diacritics', [], function () {
                                            return {
                                                'Ⓐ': 'A',
                                                Ａ: 'A',
                                                À: 'A',
                                                Á: 'A',
                                                Â: 'A',
                                                Ầ: 'A',
                                                Ấ: 'A',
                                                Ẫ: 'A',
                                                Ẩ: 'A',
                                                Ã: 'A',
                                                Ā: 'A',
                                                Ă: 'A',
                                                Ằ: 'A',
                                                Ắ: 'A',
                                                Ẵ: 'A',
                                                Ẳ: 'A',
                                                Ȧ: 'A',
                                                Ǡ: 'A',
                                                Ä: 'A',
                                                Ǟ: 'A',
                                                Ả: 'A',
                                                Å: 'A',
                                                Ǻ: 'A',
                                                Ǎ: 'A',
                                                Ȁ: 'A',
                                                Ȃ: 'A',
                                                Ạ: 'A',
                                                Ậ: 'A',
                                                Ặ: 'A',
                                                Ḁ: 'A',
                                                Ą: 'A',
                                                Ⱥ: 'A',
                                                Ɐ: 'A',
                                                Ꜳ: 'AA',
                                                Æ: 'AE',
                                                Ǽ: 'AE',
                                                Ǣ: 'AE',
                                                Ꜵ: 'AO',
                                                Ꜷ: 'AU',
                                                Ꜹ: 'AV',
                                                Ꜻ: 'AV',
                                                Ꜽ: 'AY',
                                                'Ⓑ': 'B',
                                                Ｂ: 'B',
                                                Ḃ: 'B',
                                                Ḅ: 'B',
                                                Ḇ: 'B',
                                                Ƀ: 'B',
                                                Ƃ: 'B',
                                                Ɓ: 'B',
                                                'Ⓒ': 'C',
                                                Ｃ: 'C',
                                                Ć: 'C',
                                                Ĉ: 'C',
                                                Ċ: 'C',
                                                Č: 'C',
                                                Ç: 'C',
                                                Ḉ: 'C',
                                                Ƈ: 'C',
                                                Ȼ: 'C',
                                                Ꜿ: 'C',
                                                'Ⓓ': 'D',
                                                Ｄ: 'D',
                                                Ḋ: 'D',
                                                Ď: 'D',
                                                Ḍ: 'D',
                                                Ḑ: 'D',
                                                Ḓ: 'D',
                                                Ḏ: 'D',
                                                Đ: 'D',
                                                Ƌ: 'D',
                                                Ɗ: 'D',
                                                Ɖ: 'D',
                                                Ꝺ: 'D',
                                                Ǳ: 'DZ',
                                                Ǆ: 'DZ',
                                                ǲ: 'Dz',
                                                ǅ: 'Dz',
                                                'Ⓔ': 'E',
                                                Ｅ: 'E',
                                                È: 'E',
                                                É: 'E',
                                                Ê: 'E',
                                                Ề: 'E',
                                                Ế: 'E',
                                                Ễ: 'E',
                                                Ể: 'E',
                                                Ẽ: 'E',
                                                Ē: 'E',
                                                Ḕ: 'E',
                                                Ḗ: 'E',
                                                Ĕ: 'E',
                                                Ė: 'E',
                                                Ë: 'E',
                                                Ẻ: 'E',
                                                Ě: 'E',
                                                Ȅ: 'E',
                                                Ȇ: 'E',
                                                Ẹ: 'E',
                                                Ệ: 'E',
                                                Ȩ: 'E',
                                                Ḝ: 'E',
                                                Ę: 'E',
                                                Ḙ: 'E',
                                                Ḛ: 'E',
                                                Ɛ: 'E',
                                                Ǝ: 'E',
                                                'Ⓕ': 'F',
                                                Ｆ: 'F',
                                                Ḟ: 'F',
                                                Ƒ: 'F',
                                                Ꝼ: 'F',
                                                'Ⓖ': 'G',
                                                Ｇ: 'G',
                                                Ǵ: 'G',
                                                Ĝ: 'G',
                                                Ḡ: 'G',
                                                Ğ: 'G',
                                                Ġ: 'G',
                                                Ǧ: 'G',
                                                Ģ: 'G',
                                                Ǥ: 'G',
                                                Ɠ: 'G',
                                                Ꞡ: 'G',
                                                Ᵹ: 'G',
                                                Ꝿ: 'G',
                                                'Ⓗ': 'H',
                                                Ｈ: 'H',
                                                Ĥ: 'H',
                                                Ḣ: 'H',
                                                Ḧ: 'H',
                                                Ȟ: 'H',
                                                Ḥ: 'H',
                                                Ḩ: 'H',
                                                Ḫ: 'H',
                                                Ħ: 'H',
                                                Ⱨ: 'H',
                                                Ⱶ: 'H',
                                                Ɥ: 'H',
                                                'Ⓘ': 'I',
                                                Ｉ: 'I',
                                                Ì: 'I',
                                                Í: 'I',
                                                Î: 'I',
                                                Ĩ: 'I',
                                                Ī: 'I',
                                                Ĭ: 'I',
                                                İ: 'I',
                                                Ï: 'I',
                                                Ḯ: 'I',
                                                Ỉ: 'I',
                                                Ǐ: 'I',
                                                Ȉ: 'I',
                                                Ȋ: 'I',
                                                Ị: 'I',
                                                Į: 'I',
                                                Ḭ: 'I',
                                                Ɨ: 'I',
                                                'Ⓙ': 'J',
                                                Ｊ: 'J',
                                                Ĵ: 'J',
                                                Ɉ: 'J',
                                                'Ⓚ': 'K',
                                                Ｋ: 'K',
                                                Ḱ: 'K',
                                                Ǩ: 'K',
                                                Ḳ: 'K',
                                                Ķ: 'K',
                                                Ḵ: 'K',
                                                Ƙ: 'K',
                                                Ⱪ: 'K',
                                                Ꝁ: 'K',
                                                Ꝃ: 'K',
                                                Ꝅ: 'K',
                                                Ꞣ: 'K',
                                                'Ⓛ': 'L',
                                                Ｌ: 'L',
                                                Ŀ: 'L',
                                                Ĺ: 'L',
                                                Ľ: 'L',
                                                Ḷ: 'L',
                                                Ḹ: 'L',
                                                Ļ: 'L',
                                                Ḽ: 'L',
                                                Ḻ: 'L',
                                                Ł: 'L',
                                                Ƚ: 'L',
                                                Ɫ: 'L',
                                                Ⱡ: 'L',
                                                Ꝉ: 'L',
                                                Ꝇ: 'L',
                                                Ꞁ: 'L',
                                                Ǉ: 'LJ',
                                                ǈ: 'Lj',
                                                'Ⓜ': 'M',
                                                Ｍ: 'M',
                                                Ḿ: 'M',
                                                Ṁ: 'M',
                                                Ṃ: 'M',
                                                Ɱ: 'M',
                                                Ɯ: 'M',
                                                'Ⓝ': 'N',
                                                Ｎ: 'N',
                                                Ǹ: 'N',
                                                Ń: 'N',
                                                Ñ: 'N',
                                                Ṅ: 'N',
                                                Ň: 'N',
                                                Ṇ: 'N',
                                                Ņ: 'N',
                                                Ṋ: 'N',
                                                Ṉ: 'N',
                                                Ƞ: 'N',
                                                Ɲ: 'N',
                                                Ꞑ: 'N',
                                                Ꞥ: 'N',
                                                Ǌ: 'NJ',
                                                ǋ: 'Nj',
                                                'Ⓞ': 'O',
                                                Ｏ: 'O',
                                                Ò: 'O',
                                                Ó: 'O',
                                                Ô: 'O',
                                                Ồ: 'O',
                                                Ố: 'O',
                                                Ỗ: 'O',
                                                Ổ: 'O',
                                                Õ: 'O',
                                                Ṍ: 'O',
                                                Ȭ: 'O',
                                                Ṏ: 'O',
                                                Ō: 'O',
                                                Ṑ: 'O',
                                                Ṓ: 'O',
                                                Ŏ: 'O',
                                                Ȯ: 'O',
                                                Ȱ: 'O',
                                                Ö: 'O',
                                                Ȫ: 'O',
                                                Ỏ: 'O',
                                                Ő: 'O',
                                                Ǒ: 'O',
                                                Ȍ: 'O',
                                                Ȏ: 'O',
                                                Ơ: 'O',
                                                Ờ: 'O',
                                                Ớ: 'O',
                                                Ỡ: 'O',
                                                Ở: 'O',
                                                Ợ: 'O',
                                                Ọ: 'O',
                                                Ộ: 'O',
                                                Ǫ: 'O',
                                                Ǭ: 'O',
                                                Ø: 'O',
                                                Ǿ: 'O',
                                                Ɔ: 'O',
                                                Ɵ: 'O',
                                                Ꝋ: 'O',
                                                Ꝍ: 'O',
                                                Œ: 'OE',
                                                Ƣ: 'OI',
                                                Ꝏ: 'OO',
                                                Ȣ: 'OU',
                                                'Ⓟ': 'P',
                                                Ｐ: 'P',
                                                Ṕ: 'P',
                                                Ṗ: 'P',
                                                Ƥ: 'P',
                                                Ᵽ: 'P',
                                                Ꝑ: 'P',
                                                Ꝓ: 'P',
                                                Ꝕ: 'P',
                                                'Ⓠ': 'Q',
                                                Ｑ: 'Q',
                                                Ꝗ: 'Q',
                                                Ꝙ: 'Q',
                                                Ɋ: 'Q',
                                                'Ⓡ': 'R',
                                                Ｒ: 'R',
                                                Ŕ: 'R',
                                                Ṙ: 'R',
                                                Ř: 'R',
                                                Ȑ: 'R',
                                                Ȓ: 'R',
                                                Ṛ: 'R',
                                                Ṝ: 'R',
                                                Ŗ: 'R',
                                                Ṟ: 'R',
                                                Ɍ: 'R',
                                                Ɽ: 'R',
                                                Ꝛ: 'R',
                                                Ꞧ: 'R',
                                                Ꞃ: 'R',
                                                'Ⓢ': 'S',
                                                Ｓ: 'S',
                                                ẞ: 'S',
                                                Ś: 'S',
                                                Ṥ: 'S',
                                                Ŝ: 'S',
                                                Ṡ: 'S',
                                                Š: 'S',
                                                Ṧ: 'S',
                                                Ṣ: 'S',
                                                Ṩ: 'S',
                                                Ș: 'S',
                                                Ş: 'S',
                                                Ȿ: 'S',
                                                Ꞩ: 'S',
                                                Ꞅ: 'S',
                                                'Ⓣ': 'T',
                                                Ｔ: 'T',
                                                Ṫ: 'T',
                                                Ť: 'T',
                                                Ṭ: 'T',
                                                Ț: 'T',
                                                Ţ: 'T',
                                                Ṱ: 'T',
                                                Ṯ: 'T',
                                                Ŧ: 'T',
                                                Ƭ: 'T',
                                                Ʈ: 'T',
                                                Ⱦ: 'T',
                                                Ꞇ: 'T',
                                                Ꜩ: 'TZ',
                                                'Ⓤ': 'U',
                                                Ｕ: 'U',
                                                Ù: 'U',
                                                Ú: 'U',
                                                Û: 'U',
                                                Ũ: 'U',
                                                Ṹ: 'U',
                                                Ū: 'U',
                                                Ṻ: 'U',
                                                Ŭ: 'U',
                                                Ü: 'U',
                                                Ǜ: 'U',
                                                Ǘ: 'U',
                                                Ǖ: 'U',
                                                Ǚ: 'U',
                                                Ủ: 'U',
                                                Ů: 'U',
                                                Ű: 'U',
                                                Ǔ: 'U',
                                                Ȕ: 'U',
                                                Ȗ: 'U',
                                                Ư: 'U',
                                                Ừ: 'U',
                                                Ứ: 'U',
                                                Ữ: 'U',
                                                Ử: 'U',
                                                Ự: 'U',
                                                Ụ: 'U',
                                                Ṳ: 'U',
                                                Ų: 'U',
                                                Ṷ: 'U',
                                                Ṵ: 'U',
                                                Ʉ: 'U',
                                                'Ⓥ': 'V',
                                                Ｖ: 'V',
                                                Ṽ: 'V',
                                                Ṿ: 'V',
                                                Ʋ: 'V',
                                                Ꝟ: 'V',
                                                Ʌ: 'V',
                                                Ꝡ: 'VY',
                                                'Ⓦ': 'W',
                                                Ｗ: 'W',
                                                Ẁ: 'W',
                                                Ẃ: 'W',
                                                Ŵ: 'W',
                                                Ẇ: 'W',
                                                Ẅ: 'W',
                                                Ẉ: 'W',
                                                Ⱳ: 'W',
                                                'Ⓧ': 'X',
                                                Ｘ: 'X',
                                                Ẋ: 'X',
                                                Ẍ: 'X',
                                                'Ⓨ': 'Y',
                                                Ｙ: 'Y',
                                                Ỳ: 'Y',
                                                Ý: 'Y',
                                                Ŷ: 'Y',
                                                Ỹ: 'Y',
                                                Ȳ: 'Y',
                                                Ẏ: 'Y',
                                                Ÿ: 'Y',
                                                Ỷ: 'Y',
                                                Ỵ: 'Y',
                                                Ƴ: 'Y',
                                                Ɏ: 'Y',
                                                Ỿ: 'Y',
                                                'Ⓩ': 'Z',
                                                Ｚ: 'Z',
                                                Ź: 'Z',
                                                Ẑ: 'Z',
                                                Ż: 'Z',
                                                Ž: 'Z',
                                                Ẓ: 'Z',
                                                Ẕ: 'Z',
                                                Ƶ: 'Z',
                                                Ȥ: 'Z',
                                                Ɀ: 'Z',
                                                Ⱬ: 'Z',
                                                Ꝣ: 'Z',
                                                'ⓐ': 'a',
                                                ａ: 'a',
                                                ẚ: 'a',
                                                à: 'a',
                                                á: 'a',
                                                â: 'a',
                                                ầ: 'a',
                                                ấ: 'a',
                                                ẫ: 'a',
                                                ẩ: 'a',
                                                ã: 'a',
                                                ā: 'a',
                                                ă: 'a',
                                                ằ: 'a',
                                                ắ: 'a',
                                                ẵ: 'a',
                                                ẳ: 'a',
                                                ȧ: 'a',
                                                ǡ: 'a',
                                                ä: 'a',
                                                ǟ: 'a',
                                                ả: 'a',
                                                å: 'a',
                                                ǻ: 'a',
                                                ǎ: 'a',
                                                ȁ: 'a',
                                                ȃ: 'a',
                                                ạ: 'a',
                                                ậ: 'a',
                                                ặ: 'a',
                                                ḁ: 'a',
                                                ą: 'a',
                                                ⱥ: 'a',
                                                ɐ: 'a',
                                                ꜳ: 'aa',
                                                æ: 'ae',
                                                ǽ: 'ae',
                                                ǣ: 'ae',
                                                ꜵ: 'ao',
                                                ꜷ: 'au',
                                                ꜹ: 'av',
                                                ꜻ: 'av',
                                                ꜽ: 'ay',
                                                'ⓑ': 'b',
                                                ｂ: 'b',
                                                ḃ: 'b',
                                                ḅ: 'b',
                                                ḇ: 'b',
                                                ƀ: 'b',
                                                ƃ: 'b',
                                                ɓ: 'b',
                                                'ⓒ': 'c',
                                                ｃ: 'c',
                                                ć: 'c',
                                                ĉ: 'c',
                                                ċ: 'c',
                                                č: 'c',
                                                ç: 'c',
                                                ḉ: 'c',
                                                ƈ: 'c',
                                                ȼ: 'c',
                                                ꜿ: 'c',
                                                ↄ: 'c',
                                                'ⓓ': 'd',
                                                ｄ: 'd',
                                                ḋ: 'd',
                                                ď: 'd',
                                                ḍ: 'd',
                                                ḑ: 'd',
                                                ḓ: 'd',
                                                ḏ: 'd',
                                                đ: 'd',
                                                ƌ: 'd',
                                                ɖ: 'd',
                                                ɗ: 'd',
                                                ꝺ: 'd',
                                                ǳ: 'dz',
                                                ǆ: 'dz',
                                                'ⓔ': 'e',
                                                ｅ: 'e',
                                                è: 'e',
                                                é: 'e',
                                                ê: 'e',
                                                ề: 'e',
                                                ế: 'e',
                                                ễ: 'e',
                                                ể: 'e',
                                                ẽ: 'e',
                                                ē: 'e',
                                                ḕ: 'e',
                                                ḗ: 'e',
                                                ĕ: 'e',
                                                ė: 'e',
                                                ë: 'e',
                                                ẻ: 'e',
                                                ě: 'e',
                                                ȅ: 'e',
                                                ȇ: 'e',
                                                ẹ: 'e',
                                                ệ: 'e',
                                                ȩ: 'e',
                                                ḝ: 'e',
                                                ę: 'e',
                                                ḙ: 'e',
                                                ḛ: 'e',
                                                ɇ: 'e',
                                                ɛ: 'e',
                                                ǝ: 'e',
                                                'ⓕ': 'f',
                                                ｆ: 'f',
                                                ḟ: 'f',
                                                ƒ: 'f',
                                                ꝼ: 'f',
                                                'ⓖ': 'g',
                                                ｇ: 'g',
                                                ǵ: 'g',
                                                ĝ: 'g',
                                                ḡ: 'g',
                                                ğ: 'g',
                                                ġ: 'g',
                                                ǧ: 'g',
                                                ģ: 'g',
                                                ǥ: 'g',
                                                ɠ: 'g',
                                                ꞡ: 'g',
                                                ᵹ: 'g',
                                                ꝿ: 'g',
                                                'ⓗ': 'h',
                                                ｈ: 'h',
                                                ĥ: 'h',
                                                ḣ: 'h',
                                                ḧ: 'h',
                                                ȟ: 'h',
                                                ḥ: 'h',
                                                ḩ: 'h',
                                                ḫ: 'h',
                                                ẖ: 'h',
                                                ħ: 'h',
                                                ⱨ: 'h',
                                                ⱶ: 'h',
                                                ɥ: 'h',
                                                ƕ: 'hv',
                                                'ⓘ': 'i',
                                                ｉ: 'i',
                                                ì: 'i',
                                                í: 'i',
                                                î: 'i',
                                                ĩ: 'i',
                                                ī: 'i',
                                                ĭ: 'i',
                                                ï: 'i',
                                                ḯ: 'i',
                                                ỉ: 'i',
                                                ǐ: 'i',
                                                ȉ: 'i',
                                                ȋ: 'i',
                                                ị: 'i',
                                                į: 'i',
                                                ḭ: 'i',
                                                ɨ: 'i',
                                                ı: 'i',
                                                'ⓙ': 'j',
                                                ｊ: 'j',
                                                ĵ: 'j',
                                                ǰ: 'j',
                                                ɉ: 'j',
                                                'ⓚ': 'k',
                                                ｋ: 'k',
                                                ḱ: 'k',
                                                ǩ: 'k',
                                                ḳ: 'k',
                                                ķ: 'k',
                                                ḵ: 'k',
                                                ƙ: 'k',
                                                ⱪ: 'k',
                                                ꝁ: 'k',
                                                ꝃ: 'k',
                                                ꝅ: 'k',
                                                ꞣ: 'k',
                                                'ⓛ': 'l',
                                                ｌ: 'l',
                                                ŀ: 'l',
                                                ĺ: 'l',
                                                ľ: 'l',
                                                ḷ: 'l',
                                                ḹ: 'l',
                                                ļ: 'l',
                                                ḽ: 'l',
                                                ḻ: 'l',
                                                ſ: 'l',
                                                ł: 'l',
                                                ƚ: 'l',
                                                ɫ: 'l',
                                                ⱡ: 'l',
                                                ꝉ: 'l',
                                                ꞁ: 'l',
                                                ꝇ: 'l',
                                                ǉ: 'lj',
                                                'ⓜ': 'm',
                                                ｍ: 'm',
                                                ḿ: 'm',
                                                ṁ: 'm',
                                                ṃ: 'm',
                                                ɱ: 'm',
                                                ɯ: 'm',
                                                'ⓝ': 'n',
                                                ｎ: 'n',
                                                ǹ: 'n',
                                                ń: 'n',
                                                ñ: 'n',
                                                ṅ: 'n',
                                                ň: 'n',
                                                ṇ: 'n',
                                                ņ: 'n',
                                                ṋ: 'n',
                                                ṉ: 'n',
                                                ƞ: 'n',
                                                ɲ: 'n',
                                                ŉ: 'n',
                                                ꞑ: 'n',
                                                ꞥ: 'n',
                                                ǌ: 'nj',
                                                'ⓞ': 'o',
                                                ｏ: 'o',
                                                ò: 'o',
                                                ó: 'o',
                                                ô: 'o',
                                                ồ: 'o',
                                                ố: 'o',
                                                ỗ: 'o',
                                                ổ: 'o',
                                                õ: 'o',
                                                ṍ: 'o',
                                                ȭ: 'o',
                                                ṏ: 'o',
                                                ō: 'o',
                                                ṑ: 'o',
                                                ṓ: 'o',
                                                ŏ: 'o',
                                                ȯ: 'o',
                                                ȱ: 'o',
                                                ö: 'o',
                                                ȫ: 'o',
                                                ỏ: 'o',
                                                ő: 'o',
                                                ǒ: 'o',
                                                ȍ: 'o',
                                                ȏ: 'o',
                                                ơ: 'o',
                                                ờ: 'o',
                                                ớ: 'o',
                                                ỡ: 'o',
                                                ở: 'o',
                                                ợ: 'o',
                                                ọ: 'o',
                                                ộ: 'o',
                                                ǫ: 'o',
                                                ǭ: 'o',
                                                ø: 'o',
                                                ǿ: 'o',
                                                ɔ: 'o',
                                                ꝋ: 'o',
                                                ꝍ: 'o',
                                                ɵ: 'o',
                                                œ: 'oe',
                                                ƣ: 'oi',
                                                ȣ: 'ou',
                                                ꝏ: 'oo',
                                                'ⓟ': 'p',
                                                ｐ: 'p',
                                                ṕ: 'p',
                                                ṗ: 'p',
                                                ƥ: 'p',
                                                ᵽ: 'p',
                                                ꝑ: 'p',
                                                ꝓ: 'p',
                                                ꝕ: 'p',
                                                'ⓠ': 'q',
                                                ｑ: 'q',
                                                ɋ: 'q',
                                                ꝗ: 'q',
                                                ꝙ: 'q',
                                                'ⓡ': 'r',
                                                ｒ: 'r',
                                                ŕ: 'r',
                                                ṙ: 'r',
                                                ř: 'r',
                                                ȑ: 'r',
                                                ȓ: 'r',
                                                ṛ: 'r',
                                                ṝ: 'r',
                                                ŗ: 'r',
                                                ṟ: 'r',
                                                ɍ: 'r',
                                                ɽ: 'r',
                                                ꝛ: 'r',
                                                ꞧ: 'r',
                                                ꞃ: 'r',
                                                'ⓢ': 's',
                                                ｓ: 's',
                                                ß: 's',
                                                ś: 's',
                                                ṥ: 's',
                                                ŝ: 's',
                                                ṡ: 's',
                                                š: 's',
                                                ṧ: 's',
                                                ṣ: 's',
                                                ṩ: 's',
                                                ș: 's',
                                                ş: 's',
                                                ȿ: 's',
                                                ꞩ: 's',
                                                ꞅ: 's',
                                                ẛ: 's',
                                                'ⓣ': 't',
                                                ｔ: 't',
                                                ṫ: 't',
                                                ẗ: 't',
                                                ť: 't',
                                                ṭ: 't',
                                                ț: 't',
                                                ţ: 't',
                                                ṱ: 't',
                                                ṯ: 't',
                                                ŧ: 't',
                                                ƭ: 't',
                                                ʈ: 't',
                                                ⱦ: 't',
                                                ꞇ: 't',
                                                ꜩ: 'tz',
                                                'ⓤ': 'u',
                                                ｕ: 'u',
                                                ù: 'u',
                                                ú: 'u',
                                                û: 'u',
                                                ũ: 'u',
                                                ṹ: 'u',
                                                ū: 'u',
                                                ṻ: 'u',
                                                ŭ: 'u',
                                                ü: 'u',
                                                ǜ: 'u',
                                                ǘ: 'u',
                                                ǖ: 'u',
                                                ǚ: 'u',
                                                ủ: 'u',
                                                ů: 'u',
                                                ű: 'u',
                                                ǔ: 'u',
                                                ȕ: 'u',
                                                ȗ: 'u',
                                                ư: 'u',
                                                ừ: 'u',
                                                ứ: 'u',
                                                ữ: 'u',
                                                ử: 'u',
                                                ự: 'u',
                                                ụ: 'u',
                                                ṳ: 'u',
                                                ų: 'u',
                                                ṷ: 'u',
                                                ṵ: 'u',
                                                ʉ: 'u',
                                                'ⓥ': 'v',
                                                ｖ: 'v',
                                                ṽ: 'v',
                                                ṿ: 'v',
                                                ʋ: 'v',
                                                ꝟ: 'v',
                                                ʌ: 'v',
                                                ꝡ: 'vy',
                                                'ⓦ': 'w',
                                                ｗ: 'w',
                                                ẁ: 'w',
                                                ẃ: 'w',
                                                ŵ: 'w',
                                                ẇ: 'w',
                                                ẅ: 'w',
                                                ẘ: 'w',
                                                ẉ: 'w',
                                                ⱳ: 'w',
                                                'ⓧ': 'x',
                                                ｘ: 'x',
                                                ẋ: 'x',
                                                ẍ: 'x',
                                                'ⓨ': 'y',
                                                ｙ: 'y',
                                                ỳ: 'y',
                                                ý: 'y',
                                                ŷ: 'y',
                                                ỹ: 'y',
                                                ȳ: 'y',
                                                ẏ: 'y',
                                                ÿ: 'y',
                                                ỷ: 'y',
                                                ẙ: 'y',
                                                ỵ: 'y',
                                                ƴ: 'y',
                                                ɏ: 'y',
                                                ỿ: 'y',
                                                'ⓩ': 'z',
                                                ｚ: 'z',
                                                ź: 'z',
                                                ẑ: 'z',
                                                ż: 'z',
                                                ž: 'z',
                                                ẓ: 'z',
                                                ẕ: 'z',
                                                ƶ: 'z',
                                                ȥ: 'z',
                                                ɀ: 'z',
                                                ⱬ: 'z',
                                                ꝣ: 'z',
                                                Ά: 'Α',
                                                Έ: 'Ε',
                                                Ή: 'Η',
                                                Ί: 'Ι',
                                                Ϊ: 'Ι',
                                                Ό: 'Ο',
                                                Ύ: 'Υ',
                                                Ϋ: 'Υ',
                                                Ώ: 'Ω',
                                                ά: 'α',
                                                έ: 'ε',
                                                ή: 'η',
                                                ί: 'ι',
                                                ϊ: 'ι',
                                                ΐ: 'ι',
                                                ό: 'ο',
                                                ύ: 'υ',
                                                ϋ: 'υ',
                                                ΰ: 'υ',
                                                ώ: 'ω',
                                                ς: 'σ',
                                                '’': "'",
                                            };
                                        }),
                                        n.define('select2/data/base', ['../utils'], function (e) {
                                            function t(e, n) {
                                                t.__super__.constructor.call(this);
                                            }
                                            return (
                                                e.Extend(t, e.Observable),
                                                (t.prototype.current = function (e) {
                                                    throw new Error('The `current` method must be defined in child classes.');
                                                }),
                                                (t.prototype.query = function (e, t) {
                                                    throw new Error('The `query` method must be defined in child classes.');
                                                }),
                                                (t.prototype.bind = function (e, t) {}),
                                                (t.prototype.destroy = function () {}),
                                                (t.prototype.generateResultId = function (t, n) {
                                                    var i = t.id + '-result-';
                                                    return (
                                                        (i += e.generateChars(4)),
                                                        null != n.id ? (i += '-' + n.id.toString()) : (i += '-' + e.generateChars(4)),
                                                        i
                                                    );
                                                }),
                                                t
                                            );
                                        }),
                                        n.define('select2/data/select', ['./base', '../utils', 'jquery'], function (e, t, n) {
                                            function i(e, t) {
                                                ((this.$element = e), (this.options = t), i.__super__.constructor.call(this));
                                            }
                                            return (
                                                t.Extend(i, e),
                                                (i.prototype.current = function (e) {
                                                    var t = [],
                                                        i = this;
                                                    (this.$element.find(':selected').each(function () {
                                                        var e = n(this),
                                                            r = i.item(e);
                                                        t.push(r);
                                                    }),
                                                        e(t));
                                                }),
                                                (i.prototype.select = function (e) {
                                                    var t = this;
                                                    if (((e.selected = !0), n(e.element).is('option')))
                                                        return (
                                                            (e.element.selected = !0),
                                                            void this.$element.trigger('input').trigger('change')
                                                        );
                                                    if (this.$element.prop('multiple'))
                                                        this.current(function (i) {
                                                            var r = [];
                                                            (e = [e]).push.apply(e, i);
                                                            for (var o = 0; o < e.length; o++) {
                                                                var s = e[o].id;
                                                                -1 === n.inArray(s, r) && r.push(s);
                                                            }
                                                            (t.$element.val(r), t.$element.trigger('input').trigger('change'));
                                                        });
                                                    else {
                                                        var i = e.id;
                                                        (this.$element.val(i), this.$element.trigger('input').trigger('change'));
                                                    }
                                                }),
                                                (i.prototype.unselect = function (e) {
                                                    var t = this;
                                                    if (this.$element.prop('multiple')) {
                                                        if (((e.selected = !1), n(e.element).is('option')))
                                                            return (
                                                                (e.element.selected = !1),
                                                                void this.$element.trigger('input').trigger('change')
                                                            );
                                                        this.current(function (i) {
                                                            for (var r = [], o = 0; o < i.length; o++) {
                                                                var s = i[o].id;
                                                                s !== e.id && -1 === n.inArray(s, r) && r.push(s);
                                                            }
                                                            (t.$element.val(r), t.$element.trigger('input').trigger('change'));
                                                        });
                                                    }
                                                }),
                                                (i.prototype.bind = function (e, t) {
                                                    var n = this;
                                                    ((this.container = e),
                                                        e.on('select', function (e) {
                                                            n.select(e.data);
                                                        }),
                                                        e.on('unselect', function (e) {
                                                            n.unselect(e.data);
                                                        }));
                                                }),
                                                (i.prototype.destroy = function () {
                                                    this.$element.find('*').each(function () {
                                                        t.RemoveData(this);
                                                    });
                                                }),
                                                (i.prototype.query = function (e, t) {
                                                    var i = [],
                                                        r = this;
                                                    (this.$element.children().each(function () {
                                                        var t = n(this);
                                                        if (t.is('option') || t.is('optgroup')) {
                                                            var o = r.item(t),
                                                                s = r.matches(e, o);
                                                            null !== s && i.push(s);
                                                        }
                                                    }),
                                                        t({ results: i }));
                                                }),
                                                (i.prototype.addOptions = function (e) {
                                                    t.appendMany(this.$element, e);
                                                }),
                                                (i.prototype.option = function (e) {
                                                    var i;
                                                    (e.children
                                                        ? ((i = document.createElement('optgroup')).label = e.text)
                                                        : void 0 !== (i = document.createElement('option')).textContent
                                                          ? (i.textContent = e.text)
                                                          : (i.innerText = e.text),
                                                        void 0 !== e.id && (i.value = e.id),
                                                        e.disabled && (i.disabled = !0),
                                                        e.selected && (i.selected = !0),
                                                        e.title && (i.title = e.title));
                                                    var r = n(i),
                                                        o = this._normalizeItem(e);
                                                    return ((o.element = i), t.StoreData(i, 'data', o), r);
                                                }),
                                                (i.prototype.item = function (e) {
                                                    var i = {};
                                                    if (null != (i = t.GetData(e[0], 'data'))) return i;
                                                    if (e.is('option'))
                                                        i = {
                                                            id: e.val(),
                                                            text: e.text(),
                                                            disabled: e.prop('disabled'),
                                                            selected: e.prop('selected'),
                                                            title: e.prop('title'),
                                                        };
                                                    else if (e.is('optgroup')) {
                                                        i = { text: e.prop('label'), children: [], title: e.prop('title') };
                                                        for (var r = e.children('option'), o = [], s = 0; s < r.length; s++) {
                                                            var a = n(r[s]),
                                                                l = this.item(a);
                                                            o.push(l);
                                                        }
                                                        i.children = o;
                                                    }
                                                    return (((i = this._normalizeItem(i)).element = e[0]), t.StoreData(e[0], 'data', i), i);
                                                }),
                                                (i.prototype._normalizeItem = function (e) {
                                                    e !== Object(e) && (e = { id: e, text: e });
                                                    var t = { selected: !1, disabled: !1 };
                                                    return (
                                                        null != (e = n.extend({}, { text: '' }, e)).id && (e.id = e.id.toString()),
                                                        null != e.text && (e.text = e.text.toString()),
                                                        null == e._resultId &&
                                                            e.id &&
                                                            null != this.container &&
                                                            (e._resultId = this.generateResultId(this.container, e)),
                                                        n.extend({}, t, e)
                                                    );
                                                }),
                                                (i.prototype.matches = function (e, t) {
                                                    return this.options.get('matcher')(e, t);
                                                }),
                                                i
                                            );
                                        }),
                                        n.define('select2/data/array', ['./select', '../utils', 'jquery'], function (e, t, n) {
                                            function i(e, t) {
                                                ((this._dataToConvert = t.get('data') || []), i.__super__.constructor.call(this, e, t));
                                            }
                                            return (
                                                t.Extend(i, e),
                                                (i.prototype.bind = function (e, t) {
                                                    (i.__super__.bind.call(this, e, t),
                                                        this.addOptions(this.convertToOptions(this._dataToConvert)));
                                                }),
                                                (i.prototype.select = function (e) {
                                                    var t = this.$element.find('option').filter(function (t, n) {
                                                        return n.value == e.id.toString();
                                                    });
                                                    (0 === t.length && ((t = this.option(e)), this.addOptions(t)),
                                                        i.__super__.select.call(this, e));
                                                }),
                                                (i.prototype.convertToOptions = function (e) {
                                                    var i = this,
                                                        r = this.$element.find('option'),
                                                        o = r
                                                            .map(function () {
                                                                return i.item(n(this)).id;
                                                            })
                                                            .get(),
                                                        s = [];
                                                    function a(e) {
                                                        return function () {
                                                            return n(this).val() == e.id;
                                                        };
                                                    }
                                                    for (var l = 0; l < e.length; l++) {
                                                        var c = this._normalizeItem(e[l]);
                                                        if (n.inArray(c.id, o) >= 0) {
                                                            var u = r.filter(a(c)),
                                                                d = this.item(u),
                                                                p = n.extend(!0, {}, c, d),
                                                                h = this.option(p);
                                                            u.replaceWith(h);
                                                        } else {
                                                            var f = this.option(c);
                                                            if (c.children) {
                                                                var g = this.convertToOptions(c.children);
                                                                t.appendMany(f, g);
                                                            }
                                                            s.push(f);
                                                        }
                                                    }
                                                    return s;
                                                }),
                                                i
                                            );
                                        }),
                                        n.define('select2/data/ajax', ['./array', '../utils', 'jquery'], function (e, t, n) {
                                            function i(e, t) {
                                                ((this.ajaxOptions = this._applyDefaults(t.get('ajax'))),
                                                    null != this.ajaxOptions.processResults &&
                                                        (this.processResults = this.ajaxOptions.processResults),
                                                    i.__super__.constructor.call(this, e, t));
                                            }
                                            return (
                                                t.Extend(i, e),
                                                (i.prototype._applyDefaults = function (e) {
                                                    var t = {
                                                        data: function (e) {
                                                            return n.extend({}, e, { q: e.term });
                                                        },
                                                        transport: function (e, t, i) {
                                                            var r = n.ajax(e);
                                                            return (r.then(t), r.fail(i), r);
                                                        },
                                                    };
                                                    return n.extend({}, t, e, !0);
                                                }),
                                                (i.prototype.processResults = function (e) {
                                                    return e;
                                                }),
                                                (i.prototype.query = function (e, t) {
                                                    var i = this;
                                                    null != this._request &&
                                                        (n.isFunction(this._request.abort) && this._request.abort(),
                                                        (this._request = null));
                                                    var r = n.extend({ type: 'GET' }, this.ajaxOptions);
                                                    function o() {
                                                        var o = r.transport(
                                                            r,
                                                            function (r) {
                                                                var o = i.processResults(r, e);
                                                                (i.options.get('debug') &&
                                                                    window.console &&
                                                                    console.error &&
                                                                    (!o || !o.results || n.isArray(o.results)),
                                                                    t(o));
                                                            },
                                                            function () {
                                                                (!('status' in o) || (0 !== o.status && '0' !== o.status)) &&
                                                                    i.trigger('results:message', { message: 'errorLoading' });
                                                            }
                                                        );
                                                        i._request = o;
                                                    }
                                                    ('function' == typeof r.url && (r.url = r.url.call(this.$element, e)),
                                                        'function' == typeof r.data && (r.data = r.data.call(this.$element, e)),
                                                        this.ajaxOptions.delay && null != e.term
                                                            ? (this._queryTimeout && window.clearTimeout(this._queryTimeout),
                                                              (this._queryTimeout = window.setTimeout(o, this.ajaxOptions.delay)))
                                                            : o());
                                                }),
                                                i
                                            );
                                        }),
                                        n.define('select2/data/tags', ['jquery'], function (e) {
                                            function t(t, n, i) {
                                                var r = i.get('tags'),
                                                    o = i.get('createTag');
                                                void 0 !== o && (this.createTag = o);
                                                var s = i.get('insertTag');
                                                if ((void 0 !== s && (this.insertTag = s), t.call(this, n, i), e.isArray(r)))
                                                    for (var a = 0; a < r.length; a++) {
                                                        var l = r[a],
                                                            c = this._normalizeItem(l),
                                                            u = this.option(c);
                                                        this.$element.append(u);
                                                    }
                                            }
                                            return (
                                                (t.prototype.query = function (e, t, n) {
                                                    var i = this;
                                                    function r(e, o) {
                                                        for (var s = e.results, a = 0; a < s.length; a++) {
                                                            var l = s[a],
                                                                c = null != l.children && !r({ results: l.children }, !0);
                                                            if ((l.text || '').toUpperCase() === (t.term || '').toUpperCase() || c)
                                                                return !o && ((e.data = s), void n(e));
                                                        }
                                                        if (o) return !0;
                                                        var u = i.createTag(t);
                                                        if (null != u) {
                                                            var d = i.option(u);
                                                            (d.attr('data-select2-tag', !0), i.addOptions([d]), i.insertTag(s, u));
                                                        }
                                                        ((e.results = s), n(e));
                                                    }
                                                    (this._removeOldTags(),
                                                        null != t.term && null == t.page ? e.call(this, t, r) : e.call(this, t, n));
                                                }),
                                                (t.prototype.createTag = function (t, n) {
                                                    var i = e.trim(n.term);
                                                    return '' === i ? null : { id: i, text: i };
                                                }),
                                                (t.prototype.insertTag = function (e, t, n) {
                                                    t.unshift(n);
                                                }),
                                                (t.prototype._removeOldTags = function (t) {
                                                    this.$element.find('option[data-select2-tag]').each(function () {
                                                        this.selected || e(this).remove();
                                                    });
                                                }),
                                                t
                                            );
                                        }),
                                        n.define('select2/data/tokenizer', ['jquery'], function (e) {
                                            function t(e, t, n) {
                                                var i = n.get('tokenizer');
                                                (void 0 !== i && (this.tokenizer = i), e.call(this, t, n));
                                            }
                                            return (
                                                (t.prototype.bind = function (e, t, n) {
                                                    (e.call(this, t, n),
                                                        (this.$search =
                                                            t.dropdown.$search || t.selection.$search || n.find('.select2-search__field')));
                                                }),
                                                (t.prototype.query = function (t, n, i) {
                                                    var r = this;
                                                    function o(t) {
                                                        var n = r._normalizeItem(t);
                                                        if (
                                                            !r.$element.find('option').filter(function () {
                                                                return e(this).val() === n.id;
                                                            }).length
                                                        ) {
                                                            var i = r.option(n);
                                                            (i.attr('data-select2-tag', !0), r._removeOldTags(), r.addOptions([i]));
                                                        }
                                                        s(n);
                                                    }
                                                    function s(e) {
                                                        r.trigger('select', { data: e });
                                                    }
                                                    n.term = n.term || '';
                                                    var a = this.tokenizer(n, this.options, o);
                                                    (a.term !== n.term &&
                                                        (this.$search.length && (this.$search.val(a.term), this.$search.trigger('focus')),
                                                        (n.term = a.term)),
                                                        t.call(this, n, i));
                                                }),
                                                (t.prototype.tokenizer = function (t, n, i, r) {
                                                    for (
                                                        var o = i.get('tokenSeparators') || [],
                                                            s = n.term,
                                                            a = 0,
                                                            l =
                                                                this.createTag ||
                                                                function (e) {
                                                                    return { id: e.term, text: e.term };
                                                                };
                                                        a < s.length;

                                                    ) {
                                                        var c = s[a];
                                                        if (-1 !== e.inArray(c, o)) {
                                                            var u = s.substr(0, a),
                                                                d = l(e.extend({}, n, { term: u }));
                                                            null != d ? (r(d), (s = s.substr(a + 1) || ''), (a = 0)) : a++;
                                                        } else a++;
                                                    }
                                                    return { term: s };
                                                }),
                                                t
                                            );
                                        }),
                                        n.define('select2/data/minimumInputLength', [], function () {
                                            function e(e, t, n) {
                                                ((this.minimumInputLength = n.get('minimumInputLength')), e.call(this, t, n));
                                            }
                                            return (
                                                (e.prototype.query = function (e, t, n) {
                                                    ((t.term = t.term || ''),
                                                        t.term.length < this.minimumInputLength
                                                            ? this.trigger('results:message', {
                                                                  message: 'inputTooShort',
                                                                  args: { minimum: this.minimumInputLength, input: t.term, params: t },
                                                              })
                                                            : e.call(this, t, n));
                                                }),
                                                e
                                            );
                                        }),
                                        n.define('select2/data/maximumInputLength', [], function () {
                                            function e(e, t, n) {
                                                ((this.maximumInputLength = n.get('maximumInputLength')), e.call(this, t, n));
                                            }
                                            return (
                                                (e.prototype.query = function (e, t, n) {
                                                    ((t.term = t.term || ''),
                                                        this.maximumInputLength > 0 && t.term.length > this.maximumInputLength
                                                            ? this.trigger('results:message', {
                                                                  message: 'inputTooLong',
                                                                  args: { maximum: this.maximumInputLength, input: t.term, params: t },
                                                              })
                                                            : e.call(this, t, n));
                                                }),
                                                e
                                            );
                                        }),
                                        n.define('select2/data/maximumSelectionLength', [], function () {
                                            function e(e, t, n) {
                                                ((this.maximumSelectionLength = n.get('maximumSelectionLength')), e.call(this, t, n));
                                            }
                                            return (
                                                (e.prototype.bind = function (e, t, n) {
                                                    var i = this;
                                                    (e.call(this, t, n),
                                                        t.on('select', function () {
                                                            i._checkIfMaximumSelected();
                                                        }));
                                                }),
                                                (e.prototype.query = function (e, t, n) {
                                                    var i = this;
                                                    this._checkIfMaximumSelected(function () {
                                                        e.call(i, t, n);
                                                    });
                                                }),
                                                (e.prototype._checkIfMaximumSelected = function (e, t) {
                                                    var n = this;
                                                    this.current(function (e) {
                                                        var i = null != e ? e.length : 0;
                                                        n.maximumSelectionLength > 0 && i >= n.maximumSelectionLength
                                                            ? n.trigger('results:message', {
                                                                  message: 'maximumSelected',
                                                                  args: { maximum: n.maximumSelectionLength },
                                                              })
                                                            : t && t();
                                                    });
                                                }),
                                                e
                                            );
                                        }),
                                        n.define('select2/dropdown', ['jquery', './utils'], function (e, t) {
                                            function n(e, t) {
                                                ((this.$element = e), (this.options = t), n.__super__.constructor.call(this));
                                            }
                                            return (
                                                t.Extend(n, t.Observable),
                                                (n.prototype.render = function () {
                                                    var t = e(
                                                        '<span class="select2-dropdown"><span class="select2-results"></span></span>'
                                                    );
                                                    return (t.attr('dir', this.options.get('dir')), (this.$dropdown = t), t);
                                                }),
                                                (n.prototype.bind = function () {}),
                                                (n.prototype.position = function (e, t) {}),
                                                (n.prototype.destroy = function () {
                                                    this.$dropdown.remove();
                                                }),
                                                n
                                            );
                                        }),
                                        n.define('select2/dropdown/search', ['jquery', '../utils'], function (e, t) {
                                            function n() {}
                                            return (
                                                (n.prototype.render = function (t) {
                                                    var n = t.call(this),
                                                        i = e(
                                                            '<span class="select2-search select2-search--dropdown"><input class="select2-search__field" type="search" tabindex="-1" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" role="searchbox" aria-autocomplete="list" /></span>'
                                                        );
                                                    return ((this.$searchContainer = i), (this.$search = i.find('input')), n.prepend(i), n);
                                                }),
                                                (n.prototype.bind = function (t, n, i) {
                                                    var r = this,
                                                        o = n.id + '-results';
                                                    (t.call(this, n, i),
                                                        this.$search.on('keydown', function (e) {
                                                            (r.trigger('keypress', e), (r._keyUpPrevented = e.isDefaultPrevented()));
                                                        }),
                                                        this.$search.on('input', function (t) {
                                                            e(this).off('keyup');
                                                        }),
                                                        this.$search.on('keyup input', function (e) {
                                                            r.handleSearch(e);
                                                        }),
                                                        n.on('open', function () {
                                                            (r.$search.attr('tabindex', 0),
                                                                r.$search.attr('aria-controls', o),
                                                                r.$search.trigger('focus'),
                                                                window.setTimeout(function () {
                                                                    r.$search.trigger('focus');
                                                                }, 0));
                                                        }),
                                                        n.on('close', function () {
                                                            (r.$search.attr('tabindex', -1),
                                                                r.$search.removeAttr('aria-controls'),
                                                                r.$search.removeAttr('aria-activedescendant'),
                                                                r.$search.val(''),
                                                                r.$search.trigger('blur'));
                                                        }),
                                                        n.on('focus', function () {
                                                            n.isOpen() || r.$search.trigger('focus');
                                                        }),
                                                        n.on('results:all', function (e) {
                                                            (null != e.query.term && '' !== e.query.term) ||
                                                                (r.showSearch(e)
                                                                    ? r.$searchContainer.removeClass('select2-search--hide')
                                                                    : r.$searchContainer.addClass('select2-search--hide'));
                                                        }),
                                                        n.on('results:focus', function (e) {
                                                            e.data._resultId
                                                                ? r.$search.attr('aria-activedescendant', e.data._resultId)
                                                                : r.$search.removeAttr('aria-activedescendant');
                                                        }));
                                                }),
                                                (n.prototype.handleSearch = function (e) {
                                                    if (!this._keyUpPrevented) {
                                                        var t = this.$search.val();
                                                        this.trigger('query', { term: t });
                                                    }
                                                    this._keyUpPrevented = !1;
                                                }),
                                                (n.prototype.showSearch = function (e, t) {
                                                    return !0;
                                                }),
                                                n
                                            );
                                        }),
                                        n.define('select2/dropdown/hidePlaceholder', [], function () {
                                            function e(e, t, n, i) {
                                                ((this.placeholder = this.normalizePlaceholder(n.get('placeholder'))),
                                                    e.call(this, t, n, i));
                                            }
                                            return (
                                                (e.prototype.append = function (e, t) {
                                                    ((t.results = this.removePlaceholder(t.results)), e.call(this, t));
                                                }),
                                                (e.prototype.normalizePlaceholder = function (e, t) {
                                                    return ('string' == typeof t && (t = { id: '', text: t }), t);
                                                }),
                                                (e.prototype.removePlaceholder = function (e, t) {
                                                    for (var n = t.slice(0), i = t.length - 1; i >= 0; i--) {
                                                        var r = t[i];
                                                        this.placeholder.id === r.id && n.splice(i, 1);
                                                    }
                                                    return n;
                                                }),
                                                e
                                            );
                                        }),
                                        n.define('select2/dropdown/infiniteScroll', ['jquery'], function (e) {
                                            function t(e, t, n, i) {
                                                ((this.lastParams = {}),
                                                    e.call(this, t, n, i),
                                                    (this.$loadingMore = this.createLoadingMore()),
                                                    (this.loading = !1));
                                            }
                                            return (
                                                (t.prototype.append = function (e, t) {
                                                    (this.$loadingMore.remove(),
                                                        (this.loading = !1),
                                                        e.call(this, t),
                                                        this.showLoadingMore(t) &&
                                                            (this.$results.append(this.$loadingMore), this.loadMoreIfNeeded()));
                                                }),
                                                (t.prototype.bind = function (e, t, n) {
                                                    var i = this;
                                                    (e.call(this, t, n),
                                                        t.on('query', function (e) {
                                                            ((i.lastParams = e), (i.loading = !0));
                                                        }),
                                                        t.on('query:append', function (e) {
                                                            ((i.lastParams = e), (i.loading = !0));
                                                        }),
                                                        this.$results.on('scroll', this.loadMoreIfNeeded.bind(this)));
                                                }),
                                                (t.prototype.loadMoreIfNeeded = function () {
                                                    var t = e.contains(document.documentElement, this.$loadingMore[0]);
                                                    !this.loading &&
                                                        t &&
                                                        this.$results.offset().top + this.$results.outerHeight(!1) + 50 >=
                                                            this.$loadingMore.offset().top + this.$loadingMore.outerHeight(!1) &&
                                                        this.loadMore();
                                                }),
                                                (t.prototype.loadMore = function () {
                                                    this.loading = !0;
                                                    var t = e.extend({}, { page: 1 }, this.lastParams);
                                                    (t.page++, this.trigger('query:append', t));
                                                }),
                                                (t.prototype.showLoadingMore = function (e, t) {
                                                    return t.pagination && t.pagination.more;
                                                }),
                                                (t.prototype.createLoadingMore = function () {
                                                    var t = e(
                                                            '<li class="select2-results__option select2-results__option--load-more"role="option" aria-disabled="true"></li>'
                                                        ),
                                                        n = this.options.get('translations').get('loadingMore');
                                                    return (t.html(n(this.lastParams)), t);
                                                }),
                                                t
                                            );
                                        }),
                                        n.define('select2/dropdown/attachBody', ['jquery', '../utils'], function (e, t) {
                                            function n(t, n, i) {
                                                ((this.$dropdownParent = e(i.get('dropdownParent') || document.body)), t.call(this, n, i));
                                            }
                                            return (
                                                (n.prototype.bind = function (e, t, n) {
                                                    var i = this;
                                                    (e.call(this, t, n),
                                                        t.on('open', function () {
                                                            (i._showDropdown(),
                                                                i._attachPositioningHandler(t),
                                                                i._bindContainerResultHandlers(t));
                                                        }),
                                                        t.on('close', function () {
                                                            (i._hideDropdown(), i._detachPositioningHandler(t));
                                                        }),
                                                        this.$dropdownContainer.on('mousedown', function (e) {
                                                            e.stopPropagation();
                                                        }));
                                                }),
                                                (n.prototype.destroy = function (e) {
                                                    (e.call(this), this.$dropdownContainer.remove());
                                                }),
                                                (n.prototype.position = function (e, t, n) {
                                                    (t.attr('class', n.attr('class')),
                                                        t.removeClass('select2'),
                                                        t.addClass('select2-container--open'),
                                                        t.css({ position: 'absolute', top: -999999 }),
                                                        (this.$container = n));
                                                }),
                                                (n.prototype.render = function (t) {
                                                    var n = e('<span></span>'),
                                                        i = t.call(this);
                                                    return (n.append(i), (this.$dropdownContainer = n), n);
                                                }),
                                                (n.prototype._hideDropdown = function (e) {
                                                    this.$dropdownContainer.detach();
                                                }),
                                                (n.prototype._bindContainerResultHandlers = function (e, t) {
                                                    if (!this._containerResultsHandlersBound) {
                                                        var n = this;
                                                        (t.on('results:all', function () {
                                                            (n._positionDropdown(), n._resizeDropdown());
                                                        }),
                                                            t.on('results:append', function () {
                                                                (n._positionDropdown(), n._resizeDropdown());
                                                            }),
                                                            t.on('results:message', function () {
                                                                (n._positionDropdown(), n._resizeDropdown());
                                                            }),
                                                            t.on('select', function () {
                                                                (n._positionDropdown(), n._resizeDropdown());
                                                            }),
                                                            t.on('unselect', function () {
                                                                (n._positionDropdown(), n._resizeDropdown());
                                                            }),
                                                            (this._containerResultsHandlersBound = !0));
                                                    }
                                                }),
                                                (n.prototype._attachPositioningHandler = function (n, i) {
                                                    var r = this,
                                                        o = 'scroll.select2.' + i.id,
                                                        s = 'resize.select2.' + i.id,
                                                        a = 'orientationchange.select2.' + i.id,
                                                        l = this.$container.parents().filter(t.hasScroll);
                                                    (l.each(function () {
                                                        t.StoreData(this, 'select2-scroll-position', {
                                                            x: e(this).scrollLeft(),
                                                            y: e(this).scrollTop(),
                                                        });
                                                    }),
                                                        l.on(o, function (n) {
                                                            var i = t.GetData(this, 'select2-scroll-position');
                                                            e(this).scrollTop(i.y);
                                                        }),
                                                        e(window).on(o + ' ' + s + ' ' + a, function (e) {
                                                            (r._positionDropdown(), r._resizeDropdown());
                                                        }));
                                                }),
                                                (n.prototype._detachPositioningHandler = function (n, i) {
                                                    var r = 'scroll.select2.' + i.id,
                                                        o = 'resize.select2.' + i.id,
                                                        s = 'orientationchange.select2.' + i.id;
                                                    (this.$container.parents().filter(t.hasScroll).off(r),
                                                        e(window).off(r + ' ' + o + ' ' + s));
                                                }),
                                                (n.prototype._positionDropdown = function () {
                                                    var t = e(window),
                                                        n = this.$dropdown.hasClass('select2-dropdown--above'),
                                                        i = this.$dropdown.hasClass('select2-dropdown--below'),
                                                        r = null,
                                                        o = this.$container.offset();
                                                    o.bottom = o.top + this.$container.outerHeight(!1);
                                                    var s = { height: this.$container.outerHeight(!1) };
                                                    ((s.top = o.top), (s.bottom = o.top + s.height));
                                                    var a = { height: this.$dropdown.outerHeight(!1) },
                                                        l = { top: t.scrollTop(), bottom: t.scrollTop() + t.height() },
                                                        c = l.top < o.top - a.height,
                                                        u = l.bottom > o.bottom + a.height,
                                                        d = { left: o.left, top: s.bottom },
                                                        p = this.$dropdownParent;
                                                    'static' === p.css('position') && (p = p.offsetParent());
                                                    var h = { top: 0, left: 0 };
                                                    ((e.contains(document.body, p[0]) || p[0].isConnected) && (h = p.offset()),
                                                        (d.top -= h.top),
                                                        (d.left -= h.left),
                                                        n || i || (r = 'below'),
                                                        u || !c || n ? !c && u && n && (r = 'below') : (r = 'above'),
                                                        ('above' == r || (n && 'below' !== r)) && (d.top = s.top - h.top - a.height),
                                                        null != r &&
                                                            (this.$dropdown
                                                                .removeClass('select2-dropdown--below select2-dropdown--above')
                                                                .addClass('select2-dropdown--' + r),
                                                            this.$container
                                                                .removeClass('select2-container--below select2-container--above')
                                                                .addClass('select2-container--' + r)),
                                                        this.$dropdownContainer.css(d));
                                                }),
                                                (n.prototype._resizeDropdown = function () {
                                                    var e = { width: this.$container.outerWidth(!1) + 'px' };
                                                    (this.options.get('dropdownAutoWidth') &&
                                                        ((e.minWidth = e.width), (e.position = 'relative'), (e.width = 'auto')),
                                                        this.$dropdown.css(e));
                                                }),
                                                (n.prototype._showDropdown = function (e) {
                                                    (this.$dropdownContainer.appendTo(this.$dropdownParent),
                                                        this._positionDropdown(),
                                                        this._resizeDropdown());
                                                }),
                                                n
                                            );
                                        }),
                                        n.define('select2/dropdown/minimumResultsForSearch', [], function () {
                                            function e(t) {
                                                for (var n = 0, i = 0; i < t.length; i++) {
                                                    var r = t[i];
                                                    r.children ? (n += e(r.children)) : n++;
                                                }
                                                return n;
                                            }
                                            function t(e, t, n, i) {
                                                ((this.minimumResultsForSearch = n.get('minimumResultsForSearch')),
                                                    this.minimumResultsForSearch < 0 && (this.minimumResultsForSearch = 1 / 0),
                                                    e.call(this, t, n, i));
                                            }
                                            return (
                                                (t.prototype.showSearch = function (t, n) {
                                                    return !(e(n.data.results) < this.minimumResultsForSearch) && t.call(this, n);
                                                }),
                                                t
                                            );
                                        }),
                                        n.define('select2/dropdown/selectOnClose', ['../utils'], function (e) {
                                            function t() {}
                                            return (
                                                (t.prototype.bind = function (e, t, n) {
                                                    var i = this;
                                                    (e.call(this, t, n),
                                                        t.on('close', function (e) {
                                                            i._handleSelectOnClose(e);
                                                        }));
                                                }),
                                                (t.prototype._handleSelectOnClose = function (t, n) {
                                                    if (n && null != n.originalSelect2Event) {
                                                        var i = n.originalSelect2Event;
                                                        if ('select' === i._type || 'unselect' === i._type) return;
                                                    }
                                                    var r = this.getHighlightedResults();
                                                    if (!(r.length < 1)) {
                                                        var o = e.GetData(r[0], 'data');
                                                        (null != o.element && o.element.selected) ||
                                                            (null == o.element && o.selected) ||
                                                            this.trigger('select', { data: o });
                                                    }
                                                }),
                                                t
                                            );
                                        }),
                                        n.define('select2/dropdown/closeOnSelect', [], function () {
                                            function e() {}
                                            return (
                                                (e.prototype.bind = function (e, t, n) {
                                                    var i = this;
                                                    (e.call(this, t, n),
                                                        t.on('select', function (e) {
                                                            i._selectTriggered(e);
                                                        }),
                                                        t.on('unselect', function (e) {
                                                            i._selectTriggered(e);
                                                        }));
                                                }),
                                                (e.prototype._selectTriggered = function (e, t) {
                                                    var n = t.originalEvent;
                                                    (n && (n.ctrlKey || n.metaKey)) ||
                                                        this.trigger('close', { originalEvent: n, originalSelect2Event: t });
                                                }),
                                                e
                                            );
                                        }),
                                        n.define('select2/i18n/en', [], function () {
                                            return {
                                                errorLoading: function () {
                                                    return 'The results could not be loaded.';
                                                },
                                                inputTooLong: function (e) {
                                                    var t = e.input.length - e.maximum,
                                                        n = 'Please delete ' + t + ' character';
                                                    return (1 != t && (n += 's'), n);
                                                },
                                                inputTooShort: function (e) {
                                                    return 'Please enter ' + (e.minimum - e.input.length) + ' or more characters';
                                                },
                                                loadingMore: function () {
                                                    return 'Loading more results…';
                                                },
                                                maximumSelected: function (e) {
                                                    var t = 'You can only select ' + e.maximum + ' item';
                                                    return (1 != e.maximum && (t += 's'), t);
                                                },
                                                noResults: function () {
                                                    return 'No results found';
                                                },
                                                searching: function () {
                                                    return 'Searching…';
                                                },
                                                removeAllItems: function () {
                                                    return 'Remove all items';
                                                },
                                            };
                                        }),
                                        n.define(
                                            'select2/defaults',
                                            [
                                                'jquery',
                                                'require',
                                                './results',
                                                './selection/single',
                                                './selection/multiple',
                                                './selection/placeholder',
                                                './selection/allowClear',
                                                './selection/search',
                                                './selection/eventRelay',
                                                './utils',
                                                './translation',
                                                './diacritics',
                                                './data/select',
                                                './data/array',
                                                './data/ajax',
                                                './data/tags',
                                                './data/tokenizer',
                                                './data/minimumInputLength',
                                                './data/maximumInputLength',
                                                './data/maximumSelectionLength',
                                                './dropdown',
                                                './dropdown/search',
                                                './dropdown/hidePlaceholder',
                                                './dropdown/infiniteScroll',
                                                './dropdown/attachBody',
                                                './dropdown/minimumResultsForSearch',
                                                './dropdown/selectOnClose',
                                                './dropdown/closeOnSelect',
                                                './i18n/en',
                                            ],
                                            function (
                                                e,
                                                t,
                                                n,
                                                i,
                                                r,
                                                o,
                                                s,
                                                a,
                                                l,
                                                c,
                                                u,
                                                d,
                                                p,
                                                h,
                                                f,
                                                g,
                                                m,
                                                v,
                                                y,
                                                _,
                                                w,
                                                $,
                                                b,
                                                x,
                                                A,
                                                D,
                                                C,
                                                S,
                                                E
                                            ) {
                                                function O() {
                                                    this.reset();
                                                }
                                                return (
                                                    (O.prototype.apply = function (u) {
                                                        if (null == (u = e.extend(!0, {}, this.defaults, u)).dataAdapter) {
                                                            if (
                                                                (null != u.ajax
                                                                    ? (u.dataAdapter = f)
                                                                    : null != u.data
                                                                      ? (u.dataAdapter = h)
                                                                      : (u.dataAdapter = p),
                                                                u.minimumInputLength > 0 && (u.dataAdapter = c.Decorate(u.dataAdapter, v)),
                                                                u.maximumInputLength > 0 && (u.dataAdapter = c.Decorate(u.dataAdapter, y)),
                                                                u.maximumSelectionLength > 0 &&
                                                                    (u.dataAdapter = c.Decorate(u.dataAdapter, _)),
                                                                u.tags && (u.dataAdapter = c.Decorate(u.dataAdapter, g)),
                                                                (null == u.tokenSeparators && null == u.tokenizer) ||
                                                                    (u.dataAdapter = c.Decorate(u.dataAdapter, m)),
                                                                null != u.query)
                                                            ) {
                                                                var d = t(u.amdBase + 'compat/query');
                                                                u.dataAdapter = c.Decorate(u.dataAdapter, d);
                                                            }
                                                            if (null != u.initSelection) {
                                                                var E = t(u.amdBase + 'compat/initSelection');
                                                                u.dataAdapter = c.Decorate(u.dataAdapter, E);
                                                            }
                                                        }
                                                        if (
                                                            (null == u.resultsAdapter &&
                                                                ((u.resultsAdapter = n),
                                                                null != u.ajax && (u.resultsAdapter = c.Decorate(u.resultsAdapter, x)),
                                                                null != u.placeholder &&
                                                                    (u.resultsAdapter = c.Decorate(u.resultsAdapter, b)),
                                                                u.selectOnClose && (u.resultsAdapter = c.Decorate(u.resultsAdapter, C))),
                                                            null == u.dropdownAdapter)
                                                        ) {
                                                            if (u.multiple) u.dropdownAdapter = w;
                                                            else {
                                                                var O = c.Decorate(w, $);
                                                                u.dropdownAdapter = O;
                                                            }
                                                            if (
                                                                (0 !== u.minimumResultsForSearch &&
                                                                    (u.dropdownAdapter = c.Decorate(u.dropdownAdapter, D)),
                                                                u.closeOnSelect && (u.dropdownAdapter = c.Decorate(u.dropdownAdapter, S)),
                                                                null != u.dropdownCssClass ||
                                                                    null != u.dropdownCss ||
                                                                    null != u.adaptDropdownCssClass)
                                                            ) {
                                                                var q = t(u.amdBase + 'compat/dropdownCss');
                                                                u.dropdownAdapter = c.Decorate(u.dropdownAdapter, q);
                                                            }
                                                            u.dropdownAdapter = c.Decorate(u.dropdownAdapter, A);
                                                        }
                                                        if (null == u.selectionAdapter) {
                                                            if (
                                                                (u.multiple ? (u.selectionAdapter = r) : (u.selectionAdapter = i),
                                                                null != u.placeholder &&
                                                                    (u.selectionAdapter = c.Decorate(u.selectionAdapter, o)),
                                                                u.allowClear && (u.selectionAdapter = c.Decorate(u.selectionAdapter, s)),
                                                                u.multiple && (u.selectionAdapter = c.Decorate(u.selectionAdapter, a)),
                                                                null != u.containerCssClass ||
                                                                    null != u.containerCss ||
                                                                    null != u.adaptContainerCssClass)
                                                            ) {
                                                                var T = t(u.amdBase + 'compat/containerCss');
                                                                u.selectionAdapter = c.Decorate(u.selectionAdapter, T);
                                                            }
                                                            u.selectionAdapter = c.Decorate(u.selectionAdapter, l);
                                                        }
                                                        ((u.language = this._resolveLanguage(u.language)), u.language.push('en'));
                                                        for (var j = [], L = 0; L < u.language.length; L++) {
                                                            var I = u.language[L];
                                                            -1 === j.indexOf(I) && j.push(I);
                                                        }
                                                        return (
                                                            (u.language = j),
                                                            (u.translations = this._processTranslations(u.language, u.debug)),
                                                            u
                                                        );
                                                    }),
                                                    (O.prototype.reset = function () {
                                                        function t(e) {
                                                            function t(e) {
                                                                return d[e] || e;
                                                            }
                                                            return e.replace(/[^\u0000-\u007E]/g, t);
                                                        }
                                                        function n(i, r) {
                                                            if ('' === e.trim(i.term)) return r;
                                                            if (r.children && r.children.length > 0) {
                                                                for (var o = e.extend(!0, {}, r), s = r.children.length - 1; s >= 0; s--)
                                                                    null == n(i, r.children[s]) && o.children.splice(s, 1);
                                                                return o.children.length > 0 ? o : n(i, o);
                                                            }
                                                            var a = t(r.text).toUpperCase(),
                                                                l = t(i.term).toUpperCase();
                                                            return a.indexOf(l) > -1 ? r : null;
                                                        }
                                                        this.defaults = {
                                                            amdBase: './',
                                                            amdLanguageBase: './i18n/',
                                                            closeOnSelect: !0,
                                                            debug: !1,
                                                            dropdownAutoWidth: !1,
                                                            escapeMarkup: c.escapeMarkup,
                                                            language: {},
                                                            matcher: n,
                                                            minimumInputLength: 0,
                                                            maximumInputLength: 0,
                                                            maximumSelectionLength: 0,
                                                            minimumResultsForSearch: 0,
                                                            selectOnClose: !1,
                                                            scrollAfterSelect: !1,
                                                            sorter: function (e) {
                                                                return e;
                                                            },
                                                            templateResult: function (e) {
                                                                return e.text;
                                                            },
                                                            templateSelection: function (e) {
                                                                return e.text;
                                                            },
                                                            theme: 'default',
                                                            width: 'resolve',
                                                        };
                                                    }),
                                                    (O.prototype.applyFromElement = function (e, t) {
                                                        var n = e.language,
                                                            i = this.defaults.language,
                                                            r = t.prop('lang'),
                                                            o = t.closest('[lang]').prop('lang'),
                                                            s = Array.prototype.concat.call(
                                                                this._resolveLanguage(r),
                                                                this._resolveLanguage(n),
                                                                this._resolveLanguage(i),
                                                                this._resolveLanguage(o)
                                                            );
                                                        return ((e.language = s), e);
                                                    }),
                                                    (O.prototype._resolveLanguage = function (t) {
                                                        if (!t) return [];
                                                        if (e.isEmptyObject(t)) return [];
                                                        if (e.isPlainObject(t)) return [t];
                                                        var n;
                                                        n = e.isArray(t) ? t : [t];
                                                        for (var i = [], r = 0; r < n.length; r++)
                                                            if ((i.push(n[r]), 'string' == typeof n[r] && n[r].indexOf('-') > 0)) {
                                                                var o = n[r].split('-')[0];
                                                                i.push(o);
                                                            }
                                                        return i;
                                                    }),
                                                    (O.prototype._processTranslations = function (t, n) {
                                                        for (var i = new u(), r = 0; r < t.length; r++) {
                                                            var o = new u(),
                                                                s = t[r];
                                                            if ('string' == typeof s)
                                                                try {
                                                                    o = u.loadPath(s);
                                                                } catch (e) {
                                                                    try {
                                                                        ((s = this.defaults.amdLanguageBase + s), (o = u.loadPath(s)));
                                                                    } catch (e) {
                                                                        n && window.console && console.warn;
                                                                    }
                                                                }
                                                            else o = e.isPlainObject(s) ? new u(s) : s;
                                                            i.extend(o);
                                                        }
                                                        return i;
                                                    }),
                                                    (O.prototype.set = function (t, n) {
                                                        var i = {};
                                                        i[e.camelCase(t)] = n;
                                                        var r = c._convertData(i);
                                                        e.extend(!0, this.defaults, r);
                                                    }),
                                                    new O()
                                                );
                                            }
                                        ),
                                        n.define('select2/options', ['require', 'jquery', './defaults', './utils'], function (e, t, n, i) {
                                            function r(t, r) {
                                                if (
                                                    ((this.options = t),
                                                    null != r && this.fromElement(r),
                                                    null != r && (this.options = n.applyFromElement(this.options, r)),
                                                    (this.options = n.apply(this.options)),
                                                    r && r.is('input'))
                                                ) {
                                                    var o = e(this.get('amdBase') + 'compat/inputData');
                                                    this.options.dataAdapter = i.Decorate(this.options.dataAdapter, o);
                                                }
                                            }
                                            return (
                                                (r.prototype.fromElement = function (e) {
                                                    var n = ['select2'];
                                                    (null == this.options.multiple && (this.options.multiple = e.prop('multiple')),
                                                        null == this.options.disabled && (this.options.disabled = e.prop('disabled')),
                                                        null == this.options.dir &&
                                                            (e.prop('dir')
                                                                ? (this.options.dir = e.prop('dir'))
                                                                : e.closest('[dir]').prop('dir')
                                                                  ? (this.options.dir = e.closest('[dir]').prop('dir'))
                                                                  : (this.options.dir = 'ltr')),
                                                        e.prop('disabled', this.options.disabled),
                                                        e.prop('multiple', this.options.multiple),
                                                        i.GetData(e[0], 'select2Tags') &&
                                                            (this.options.debug && window.console && console.warn,
                                                            i.StoreData(e[0], 'data', i.GetData(e[0], 'select2Tags')),
                                                            i.StoreData(e[0], 'tags', !0)),
                                                        i.GetData(e[0], 'ajaxUrl') &&
                                                            (this.options.debug && window.console && console.warn,
                                                            e.attr('ajax--url', i.GetData(e[0], 'ajaxUrl')),
                                                            i.StoreData(e[0], 'ajax-Url', i.GetData(e[0], 'ajaxUrl'))));
                                                    var r = {};
                                                    function o(e, t) {
                                                        return t.toUpperCase();
                                                    }
                                                    for (var s = 0; s < e[0].attributes.length; s++) {
                                                        var a = e[0].attributes[s].name,
                                                            l = 'data-';
                                                        if (a.substr(0, l.length) == l) {
                                                            var c = a.substring(l.length),
                                                                u = i.GetData(e[0], c);
                                                            r[c.replace(/-([a-z])/g, o)] = u;
                                                        }
                                                    }
                                                    t.fn.jquery &&
                                                        '1.' == t.fn.jquery.substr(0, 2) &&
                                                        e[0].dataset &&
                                                        (r = t.extend(!0, {}, e[0].dataset, r));
                                                    var d = t.extend(!0, {}, i.GetData(e[0]), r);
                                                    for (var p in (d = i._convertData(d)))
                                                        t.inArray(p, n) > -1 ||
                                                            (t.isPlainObject(this.options[p])
                                                                ? t.extend(this.options[p], d[p])
                                                                : (this.options[p] = d[p]));
                                                    return this;
                                                }),
                                                (r.prototype.get = function (e) {
                                                    return this.options[e];
                                                }),
                                                (r.prototype.set = function (e, t) {
                                                    this.options[e] = t;
                                                }),
                                                r
                                            );
                                        }),
                                        n.define('select2/core', ['jquery', './options', './utils', './keys'], function (e, t, n, i) {
                                            var r = function (e, i) {
                                                (null != n.GetData(e[0], 'select2') && n.GetData(e[0], 'select2').destroy(),
                                                    (this.$element = e),
                                                    (this.id = this._generateId(e)),
                                                    (i = i || {}),
                                                    (this.options = new t(i, e)),
                                                    r.__super__.constructor.call(this));
                                                var o = e.attr('tabindex') || 0;
                                                (n.StoreData(e[0], 'old-tabindex', o), e.attr('tabindex', '-1'));
                                                var s = this.options.get('dataAdapter');
                                                this.dataAdapter = new s(e, this.options);
                                                var a = this.render();
                                                this._placeContainer(a);
                                                var l = this.options.get('selectionAdapter');
                                                ((this.selection = new l(e, this.options)),
                                                    (this.$selection = this.selection.render()),
                                                    this.selection.position(this.$selection, a));
                                                var c = this.options.get('dropdownAdapter');
                                                ((this.dropdown = new c(e, this.options)),
                                                    (this.$dropdown = this.dropdown.render()),
                                                    this.dropdown.position(this.$dropdown, a));
                                                var u = this.options.get('resultsAdapter');
                                                ((this.results = new u(e, this.options, this.dataAdapter)),
                                                    (this.$results = this.results.render()),
                                                    this.results.position(this.$results, this.$dropdown));
                                                var d = this;
                                                (this._bindAdapters(),
                                                    this._registerDomEvents(),
                                                    this._registerDataEvents(),
                                                    this._registerSelectionEvents(),
                                                    this._registerDropdownEvents(),
                                                    this._registerResultsEvents(),
                                                    this._registerEvents(),
                                                    this.dataAdapter.current(function (e) {
                                                        d.trigger('selection:update', { data: e });
                                                    }),
                                                    e.addClass('select2-hidden-accessible'),
                                                    e.attr('aria-hidden', 'true'),
                                                    this._syncAttributes(),
                                                    n.StoreData(e[0], 'select2', this),
                                                    e.data('select2', this));
                                            };
                                            return (
                                                n.Extend(r, n.Observable),
                                                (r.prototype._generateId = function (e) {
                                                    return (
                                                        'select2-' +
                                                        (null != e.attr('id')
                                                            ? e.attr('id')
                                                            : null != e.attr('name')
                                                              ? e.attr('name') + '-' + n.generateChars(2)
                                                              : n.generateChars(4)
                                                        ).replace(/(:|\.|\[|\]|,)/g, '')
                                                    );
                                                }),
                                                (r.prototype._placeContainer = function (e) {
                                                    e.insertAfter(this.$element);
                                                    var t = this._resolveWidth(this.$element, this.options.get('width'));
                                                    null != t && e.css('width', t);
                                                }),
                                                (r.prototype._resolveWidth = function (e, t) {
                                                    var n = /^width:(([-+]?([0-9]*\.)?[0-9]+)(px|em|ex|%|in|cm|mm|pt|pc))/i;
                                                    if ('resolve' == t) {
                                                        var i = this._resolveWidth(e, 'style');
                                                        return null != i ? i : this._resolveWidth(e, 'element');
                                                    }
                                                    if ('element' == t) {
                                                        var r = e.outerWidth(!1);
                                                        return r <= 0 ? 'auto' : r + 'px';
                                                    }
                                                    if ('style' == t) {
                                                        var o = e.attr('style');
                                                        if ('string' != typeof o) return null;
                                                        for (var s = o.split(';'), a = 0, l = s.length; a < l; a += 1) {
                                                            var c = s[a].replace(/\s/g, '').match(n);
                                                            if (null !== c && c.length >= 1) return c[1];
                                                        }
                                                        return null;
                                                    }
                                                    return 'computedstyle' == t ? window.getComputedStyle(e[0]).width : t;
                                                }),
                                                (r.prototype._bindAdapters = function () {
                                                    (this.dataAdapter.bind(this, this.$container),
                                                        this.selection.bind(this, this.$container),
                                                        this.dropdown.bind(this, this.$container),
                                                        this.results.bind(this, this.$container));
                                                }),
                                                (r.prototype._registerDomEvents = function () {
                                                    var e = this;
                                                    (this.$element.on('change.select2', function () {
                                                        e.dataAdapter.current(function (t) {
                                                            e.trigger('selection:update', { data: t });
                                                        });
                                                    }),
                                                        this.$element.on('focus.select2', function (t) {
                                                            e.trigger('focus', t);
                                                        }),
                                                        (this._syncA = n.bind(this._syncAttributes, this)),
                                                        (this._syncS = n.bind(this._syncSubtree, this)),
                                                        this.$element[0].attachEvent &&
                                                            this.$element[0].attachEvent('onpropertychange', this._syncA));
                                                    var t =
                                                        window.MutationObserver ||
                                                        window.WebKitMutationObserver ||
                                                        window.MozMutationObserver;
                                                    null != t
                                                        ? ((this._observer = new t(function (t) {
                                                              (e._syncA(), e._syncS(null, t));
                                                          })),
                                                          this._observer.observe(this.$element[0], {
                                                              attributes: !0,
                                                              childList: !0,
                                                              subtree: !1,
                                                          }))
                                                        : this.$element[0].addEventListener &&
                                                          (this.$element[0].addEventListener('DOMAttrModified', e._syncA, !1),
                                                          this.$element[0].addEventListener('DOMNodeInserted', e._syncS, !1),
                                                          this.$element[0].addEventListener('DOMNodeRemoved', e._syncS, !1));
                                                }),
                                                (r.prototype._registerDataEvents = function () {
                                                    var e = this;
                                                    this.dataAdapter.on('*', function (t, n) {
                                                        e.trigger(t, n);
                                                    });
                                                }),
                                                (r.prototype._registerSelectionEvents = function () {
                                                    var t = this,
                                                        n = ['toggle', 'focus'];
                                                    (this.selection.on('toggle', function () {
                                                        t.toggleDropdown();
                                                    }),
                                                        this.selection.on('focus', function (e) {
                                                            t.focus(e);
                                                        }),
                                                        this.selection.on('*', function (i, r) {
                                                            -1 === e.inArray(i, n) && t.trigger(i, r);
                                                        }));
                                                }),
                                                (r.prototype._registerDropdownEvents = function () {
                                                    var e = this;
                                                    this.dropdown.on('*', function (t, n) {
                                                        e.trigger(t, n);
                                                    });
                                                }),
                                                (r.prototype._registerResultsEvents = function () {
                                                    var e = this;
                                                    this.results.on('*', function (t, n) {
                                                        e.trigger(t, n);
                                                    });
                                                }),
                                                (r.prototype._registerEvents = function () {
                                                    var e = this;
                                                    (this.on('open', function () {
                                                        e.$container.addClass('select2-container--open');
                                                    }),
                                                        this.on('close', function () {
                                                            e.$container.removeClass('select2-container--open');
                                                        }),
                                                        this.on('enable', function () {
                                                            e.$container.removeClass('select2-container--disabled');
                                                        }),
                                                        this.on('disable', function () {
                                                            e.$container.addClass('select2-container--disabled');
                                                        }),
                                                        this.on('blur', function () {
                                                            e.$container.removeClass('select2-container--focus');
                                                        }),
                                                        this.on('query', function (t) {
                                                            (e.isOpen() || e.trigger('open', {}),
                                                                this.dataAdapter.query(t, function (n) {
                                                                    e.trigger('results:all', { data: n, query: t });
                                                                }));
                                                        }),
                                                        this.on('query:append', function (t) {
                                                            this.dataAdapter.query(t, function (n) {
                                                                e.trigger('results:append', { data: n, query: t });
                                                            });
                                                        }),
                                                        this.on('keypress', function (t) {
                                                            var n = t.which;
                                                            e.isOpen()
                                                                ? n === i.ESC || n === i.TAB || (n === i.UP && t.altKey)
                                                                    ? (e.close(t), t.preventDefault())
                                                                    : n === i.ENTER
                                                                      ? (e.trigger('results:select', {}), t.preventDefault())
                                                                      : n === i.SPACE && t.ctrlKey
                                                                        ? (e.trigger('results:toggle', {}), t.preventDefault())
                                                                        : n === i.UP
                                                                          ? (e.trigger('results:previous', {}), t.preventDefault())
                                                                          : n === i.DOWN &&
                                                                            (e.trigger('results:next', {}), t.preventDefault())
                                                                : (n === i.ENTER || n === i.SPACE || (n === i.DOWN && t.altKey)) &&
                                                                  (e.open(), t.preventDefault());
                                                        }));
                                                }),
                                                (r.prototype._syncAttributes = function () {
                                                    (this.options.set('disabled', this.$element.prop('disabled')),
                                                        this.isDisabled()
                                                            ? (this.isOpen() && this.close(), this.trigger('disable', {}))
                                                            : this.trigger('enable', {}));
                                                }),
                                                (r.prototype._isChangeMutation = function (t, n) {
                                                    var i = !1,
                                                        r = this;
                                                    if (
                                                        !t ||
                                                        !t.target ||
                                                        'OPTION' === t.target.nodeName ||
                                                        'OPTGROUP' === t.target.nodeName
                                                    ) {
                                                        if (n)
                                                            if (n.addedNodes && n.addedNodes.length > 0)
                                                                for (var o = 0; o < n.addedNodes.length; o++)
                                                                    n.addedNodes[o].selected && (i = !0);
                                                            else
                                                                n.removedNodes && n.removedNodes.length > 0
                                                                    ? (i = !0)
                                                                    : e.isArray(n) &&
                                                                      e.each(n, function (e, t) {
                                                                          if (r._isChangeMutation(e, t)) return ((i = !0), !1);
                                                                      });
                                                        else i = !0;
                                                        return i;
                                                    }
                                                }),
                                                (r.prototype._syncSubtree = function (e, t) {
                                                    var n = this._isChangeMutation(e, t),
                                                        i = this;
                                                    n &&
                                                        this.dataAdapter.current(function (e) {
                                                            i.trigger('selection:update', { data: e });
                                                        });
                                                }),
                                                (r.prototype.trigger = function (e, t) {
                                                    var n = r.__super__.trigger,
                                                        i = {
                                                            open: 'opening',
                                                            close: 'closing',
                                                            select: 'selecting',
                                                            unselect: 'unselecting',
                                                            clear: 'clearing',
                                                        };
                                                    if ((void 0 === t && (t = {}), e in i)) {
                                                        var o = i[e],
                                                            s = { prevented: !1, name: e, args: t };
                                                        if ((n.call(this, o, s), s.prevented)) return void (t.prevented = !0);
                                                    }
                                                    n.call(this, e, t);
                                                }),
                                                (r.prototype.toggleDropdown = function () {
                                                    this.isDisabled() || (this.isOpen() ? this.close() : this.open());
                                                }),
                                                (r.prototype.open = function () {
                                                    this.isOpen() || this.isDisabled() || this.trigger('query', {});
                                                }),
                                                (r.prototype.close = function (e) {
                                                    this.isOpen() && this.trigger('close', { originalEvent: e });
                                                }),
                                                (r.prototype.isEnabled = function () {
                                                    return !this.isDisabled();
                                                }),
                                                (r.prototype.isDisabled = function () {
                                                    return this.options.get('disabled');
                                                }),
                                                (r.prototype.isOpen = function () {
                                                    return this.$container.hasClass('select2-container--open');
                                                }),
                                                (r.prototype.hasFocus = function () {
                                                    return this.$container.hasClass('select2-container--focus');
                                                }),
                                                (r.prototype.focus = function (e) {
                                                    this.hasFocus() ||
                                                        (this.$container.addClass('select2-container--focus'), this.trigger('focus', {}));
                                                }),
                                                (r.prototype.enable = function (e) {
                                                    (this.options.get('debug') && window.console && console.warn,
                                                        (null != e && 0 !== e.length) || (e = [!0]));
                                                    var t = !e[0];
                                                    this.$element.prop('disabled', t);
                                                }),
                                                (r.prototype.data = function () {
                                                    this.options.get('debug') && arguments.length > 0 && window.console && console.warn;
                                                    var e = [];
                                                    return (
                                                        this.dataAdapter.current(function (t) {
                                                            e = t;
                                                        }),
                                                        e
                                                    );
                                                }),
                                                (r.prototype.val = function (t) {
                                                    if (
                                                        (this.options.get('debug') && window.console && console.warn,
                                                        null == t || 0 === t.length)
                                                    )
                                                        return this.$element.val();
                                                    var n = t[0];
                                                    (e.isArray(n) &&
                                                        (n = e.map(n, function (e) {
                                                            return e.toString();
                                                        })),
                                                        this.$element.val(n).trigger('input').trigger('change'));
                                                }),
                                                (r.prototype.destroy = function () {
                                                    (this.$container.remove(),
                                                        this.$element[0].detachEvent &&
                                                            this.$element[0].detachEvent('onpropertychange', this._syncA),
                                                        null != this._observer
                                                            ? (this._observer.disconnect(), (this._observer = null))
                                                            : this.$element[0].removeEventListener &&
                                                              (this.$element[0].removeEventListener('DOMAttrModified', this._syncA, !1),
                                                              this.$element[0].removeEventListener('DOMNodeInserted', this._syncS, !1),
                                                              this.$element[0].removeEventListener('DOMNodeRemoved', this._syncS, !1)),
                                                        (this._syncA = null),
                                                        (this._syncS = null),
                                                        this.$element.off('.select2'),
                                                        this.$element.attr('tabindex', n.GetData(this.$element[0], 'old-tabindex')),
                                                        this.$element.removeClass('select2-hidden-accessible'),
                                                        this.$element.attr('aria-hidden', 'false'),
                                                        n.RemoveData(this.$element[0]),
                                                        this.$element.removeData('select2'),
                                                        this.dataAdapter.destroy(),
                                                        this.selection.destroy(),
                                                        this.dropdown.destroy(),
                                                        this.results.destroy(),
                                                        (this.dataAdapter = null),
                                                        (this.selection = null),
                                                        (this.dropdown = null),
                                                        (this.results = null));
                                                }),
                                                (r.prototype.render = function () {
                                                    var t = e(
                                                        '<span class="select2 select2-container"><span class="selection"></span><span class="dropdown-wrapper" aria-hidden="true"></span></span>'
                                                    );
                                                    return (
                                                        t.attr('dir', this.options.get('dir')),
                                                        (this.$container = t),
                                                        this.$container.addClass('select2-container--' + this.options.get('theme')),
                                                        n.StoreData(t[0], 'element', this.$element),
                                                        t
                                                    );
                                                }),
                                                r
                                            );
                                        }),
                                        n.define('select2/compat/utils', ['jquery'], function (e) {
                                            function t(t, n, i) {
                                                var r,
                                                    o,
                                                    s = [];
                                                ((r = e.trim(t.attr('class'))) &&
                                                    e((r = '' + r).split(/\s+/)).each(function () {
                                                        0 === this.indexOf('select2-') && s.push(this);
                                                    }),
                                                    (r = e.trim(n.attr('class'))) &&
                                                        e((r = '' + r).split(/\s+/)).each(function () {
                                                            0 !== this.indexOf('select2-') && null != (o = i(this)) && s.push(o);
                                                        }),
                                                    t.attr('class', s.join(' ')));
                                            }
                                            return { syncCssClasses: t };
                                        }),
                                        n.define('select2/compat/containerCss', ['jquery', './utils'], function (e, t) {
                                            function n(e) {
                                                return null;
                                            }
                                            function i() {}
                                            return (
                                                (i.prototype.render = function (i) {
                                                    var r = i.call(this),
                                                        o = this.options.get('containerCssClass') || '';
                                                    e.isFunction(o) && (o = o(this.$element));
                                                    var s = this.options.get('adaptContainerCssClass');
                                                    if (((s = s || n), -1 !== o.indexOf(':all:'))) {
                                                        o = o.replace(':all:', '');
                                                        var a = s;
                                                        s = function (e) {
                                                            var t = a(e);
                                                            return null != t ? t + ' ' + e : e;
                                                        };
                                                    }
                                                    var l = this.options.get('containerCss') || {};
                                                    return (
                                                        e.isFunction(l) && (l = l(this.$element)),
                                                        t.syncCssClasses(r, this.$element, s),
                                                        r.css(l),
                                                        r.addClass(o),
                                                        r
                                                    );
                                                }),
                                                i
                                            );
                                        }),
                                        n.define('select2/compat/dropdownCss', ['jquery', './utils'], function (e, t) {
                                            function n(e) {
                                                return null;
                                            }
                                            function i() {}
                                            return (
                                                (i.prototype.render = function (i) {
                                                    var r = i.call(this),
                                                        o = this.options.get('dropdownCssClass') || '';
                                                    e.isFunction(o) && (o = o(this.$element));
                                                    var s = this.options.get('adaptDropdownCssClass');
                                                    if (((s = s || n), -1 !== o.indexOf(':all:'))) {
                                                        o = o.replace(':all:', '');
                                                        var a = s;
                                                        s = function (e) {
                                                            var t = a(e);
                                                            return null != t ? t + ' ' + e : e;
                                                        };
                                                    }
                                                    var l = this.options.get('dropdownCss') || {};
                                                    return (
                                                        e.isFunction(l) && (l = l(this.$element)),
                                                        t.syncCssClasses(r, this.$element, s),
                                                        r.css(l),
                                                        r.addClass(o),
                                                        r
                                                    );
                                                }),
                                                i
                                            );
                                        }),
                                        n.define('select2/compat/initSelection', ['jquery'], function (e) {
                                            function t(e, t, n) {
                                                (n.get('debug') && window.console && console.warn,
                                                    (this.initSelection = n.get('initSelection')),
                                                    (this._isInitialized = !1),
                                                    e.call(this, t, n));
                                            }
                                            return (
                                                (t.prototype.current = function (t, n) {
                                                    var i = this;
                                                    this._isInitialized
                                                        ? t.call(this, n)
                                                        : this.initSelection.call(null, this.$element, function (t) {
                                                              ((i._isInitialized = !0), e.isArray(t) || (t = [t]), n(t));
                                                          });
                                                }),
                                                t
                                            );
                                        }),
                                        n.define('select2/compat/inputData', ['jquery', '../utils'], function (e, t) {
                                            function n(e, t, n) {
                                                ((this._currentData = []),
                                                    (this._valueSeparator = n.get('valueSeparator') || ','),
                                                    'hidden' === t.prop('type') && n.get('debug') && console && console.warn,
                                                    e.call(this, t, n));
                                            }
                                            return (
                                                (n.prototype.current = function (t, n) {
                                                    function i(t, n) {
                                                        var r = [];
                                                        return (
                                                            t.selected || -1 !== e.inArray(t.id, n)
                                                                ? ((t.selected = !0), r.push(t))
                                                                : (t.selected = !1),
                                                            t.children && r.push.apply(r, i(t.children, n)),
                                                            r
                                                        );
                                                    }
                                                    for (var r = [], o = 0; o < this._currentData.length; o++) {
                                                        var s = this._currentData[o];
                                                        r.push.apply(r, i(s, this.$element.val().split(this._valueSeparator)));
                                                    }
                                                    n(r);
                                                }),
                                                (n.prototype.select = function (t, n) {
                                                    if (this.options.get('multiple')) {
                                                        var i = this.$element.val();
                                                        ((i += this._valueSeparator + n.id),
                                                            this.$element.val(i),
                                                            this.$element.trigger('input').trigger('change'));
                                                    } else
                                                        (this.current(function (t) {
                                                            e.map(t, function (e) {
                                                                e.selected = !1;
                                                            });
                                                        }),
                                                            this.$element.val(n.id),
                                                            this.$element.trigger('input').trigger('change'));
                                                }),
                                                (n.prototype.unselect = function (e, t) {
                                                    var n = this;
                                                    ((t.selected = !1),
                                                        this.current(function (e) {
                                                            for (var i = [], r = 0; r < e.length; r++) {
                                                                var o = e[r];
                                                                t.id != o.id && i.push(o.id);
                                                            }
                                                            (n.$element.val(i.join(n._valueSeparator)),
                                                                n.$element.trigger('input').trigger('change'));
                                                        }));
                                                }),
                                                (n.prototype.query = function (e, t, n) {
                                                    for (var i = [], r = 0; r < this._currentData.length; r++) {
                                                        var o = this._currentData[r],
                                                            s = this.matches(t, o);
                                                        null !== s && i.push(s);
                                                    }
                                                    n({ results: i });
                                                }),
                                                (n.prototype.addOptions = function (n, i) {
                                                    var r = e.map(i, function (e) {
                                                        return t.GetData(e[0], 'data');
                                                    });
                                                    this._currentData.push.apply(this._currentData, r);
                                                }),
                                                n
                                            );
                                        }),
                                        n.define('select2/compat/matcher', ['jquery'], function (e) {
                                            function t(t) {
                                                function n(n, i) {
                                                    var r = e.extend(!0, {}, i);
                                                    if (null == n.term || '' === e.trim(n.term)) return r;
                                                    if (i.children) {
                                                        for (var o = i.children.length - 1; o >= 0; o--) {
                                                            var s = i.children[o];
                                                            t(n.term, s.text, s) || r.children.splice(o, 1);
                                                        }
                                                        if (r.children.length > 0) return r;
                                                    }
                                                    return t(n.term, i.text, i) ? r : null;
                                                }
                                                return n;
                                            }
                                            return t;
                                        }),
                                        n.define('select2/compat/query', [], function () {
                                            function e(e, t, n) {
                                                (n.get('debug') && window.console && console.warn, e.call(this, t, n));
                                            }
                                            return (
                                                (e.prototype.query = function (e, t, n) {
                                                    ((t.callback = n), this.options.get('query').call(null, t));
                                                }),
                                                e
                                            );
                                        }),
                                        n.define('select2/dropdown/attachContainer', [], function () {
                                            function e(e, t, n) {
                                                e.call(this, t, n);
                                            }
                                            return (
                                                (e.prototype.position = function (e, t, n) {
                                                    (n.find('.dropdown-wrapper').append(t),
                                                        t.addClass('select2-dropdown--below'),
                                                        n.addClass('select2-container--below'));
                                                }),
                                                e
                                            );
                                        }),
                                        n.define('select2/dropdown/stopPropagation', [], function () {
                                            function e() {}
                                            return (
                                                (e.prototype.bind = function (e, t, n) {
                                                    e.call(this, t, n);
                                                    var i = [
                                                        'blur',
                                                        'change',
                                                        'click',
                                                        'dblclick',
                                                        'focus',
                                                        'focusin',
                                                        'focusout',
                                                        'input',
                                                        'keydown',
                                                        'keyup',
                                                        'keypress',
                                                        'mousedown',
                                                        'mouseenter',
                                                        'mouseleave',
                                                        'mousemove',
                                                        'mouseover',
                                                        'mouseup',
                                                        'search',
                                                        'touchend',
                                                        'touchstart',
                                                    ];
                                                    this.$dropdown.on(i.join(' '), function (e) {
                                                        e.stopPropagation();
                                                    });
                                                }),
                                                e
                                            );
                                        }),
                                        n.define('select2/selection/stopPropagation', [], function () {
                                            function e() {}
                                            return (
                                                (e.prototype.bind = function (e, t, n) {
                                                    e.call(this, t, n);
                                                    var i = [
                                                        'blur',
                                                        'change',
                                                        'click',
                                                        'dblclick',
                                                        'focus',
                                                        'focusin',
                                                        'focusout',
                                                        'input',
                                                        'keydown',
                                                        'keyup',
                                                        'keypress',
                                                        'mousedown',
                                                        'mouseenter',
                                                        'mouseleave',
                                                        'mousemove',
                                                        'mouseover',
                                                        'mouseup',
                                                        'search',
                                                        'touchend',
                                                        'touchstart',
                                                    ];
                                                    this.$selection.on(i.join(' '), function (e) {
                                                        e.stopPropagation();
                                                    });
                                                }),
                                                e
                                            );
                                        }),
                                        (function (t) {
                                            'function' == typeof n.define && n.define.amd
                                                ? n.define('jquery-mousewheel', ['jquery'], t)
                                                : (e.exports = t);
                                        })(function (e) {
                                            var t,
                                                n,
                                                i = ['wheel', 'mousewheel', 'DOMMouseScroll', 'MozMousePixelScroll'],
                                                r =
                                                    'onwheel' in document || document.documentMode >= 9
                                                        ? ['wheel']
                                                        : ['mousewheel', 'DomMouseScroll', 'MozMousePixelScroll'],
                                                o = Array.prototype.slice;
                                            if (e.event.fixHooks) for (var s = i.length; s; ) e.event.fixHooks[i[--s]] = e.event.mouseHooks;
                                            var a = (e.event.special.mousewheel = {
                                                version: '3.1.12',
                                                setup: function () {
                                                    if (this.addEventListener)
                                                        for (var t = r.length; t; ) this.addEventListener(r[--t], l, !1);
                                                    else this.onmousewheel = l;
                                                    (e.data(this, 'mousewheel-line-height', a.getLineHeight(this)),
                                                        e.data(this, 'mousewheel-page-height', a.getPageHeight(this)));
                                                },
                                                teardown: function () {
                                                    if (this.removeEventListener)
                                                        for (var t = r.length; t; ) this.removeEventListener(r[--t], l, !1);
                                                    else this.onmousewheel = null;
                                                    (e.removeData(this, 'mousewheel-line-height'),
                                                        e.removeData(this, 'mousewheel-page-height'));
                                                },
                                                getLineHeight: function (t) {
                                                    var n = e(t),
                                                        i = n['offsetParent' in e.fn ? 'offsetParent' : 'parent']();
                                                    return (
                                                        i.length || (i = e('body')),
                                                        parseInt(i.css('fontSize'), 10) || parseInt(n.css('fontSize'), 10) || 16
                                                    );
                                                },
                                                getPageHeight: function (t) {
                                                    return e(t).height();
                                                },
                                                settings: { adjustOldDeltas: !0, normalizeOffset: !0 },
                                            });
                                            function l(i) {
                                                var r = i || window.event,
                                                    s = o.call(arguments, 1),
                                                    l = 0,
                                                    d = 0,
                                                    p = 0,
                                                    h = 0,
                                                    f = 0,
                                                    g = 0;
                                                if (
                                                    (((i = e.event.fix(r)).type = 'mousewheel'),
                                                    'detail' in r && (p = -1 * r.detail),
                                                    'wheelDelta' in r && (p = r.wheelDelta),
                                                    'wheelDeltaY' in r && (p = r.wheelDeltaY),
                                                    'wheelDeltaX' in r && (d = -1 * r.wheelDeltaX),
                                                    'axis' in r && r.axis === r.HORIZONTAL_AXIS && ((d = -1 * p), (p = 0)),
                                                    (l = 0 === p ? d : p),
                                                    'deltaY' in r && (l = p = -1 * r.deltaY),
                                                    'deltaX' in r && ((d = r.deltaX), 0 === p && (l = -1 * d)),
                                                    0 !== p || 0 !== d)
                                                ) {
                                                    if (1 === r.deltaMode) {
                                                        var m = e.data(this, 'mousewheel-line-height');
                                                        ((l *= m), (p *= m), (d *= m));
                                                    } else if (2 === r.deltaMode) {
                                                        var v = e.data(this, 'mousewheel-page-height');
                                                        ((l *= v), (p *= v), (d *= v));
                                                    }
                                                    if (
                                                        ((h = Math.max(Math.abs(p), Math.abs(d))),
                                                        (!n || h < n) && ((n = h), u(r, h) && (n /= 40)),
                                                        u(r, h) && ((l /= 40), (d /= 40), (p /= 40)),
                                                        (l = Math[l >= 1 ? 'floor' : 'ceil'](l / n)),
                                                        (d = Math[d >= 1 ? 'floor' : 'ceil'](d / n)),
                                                        (p = Math[p >= 1 ? 'floor' : 'ceil'](p / n)),
                                                        a.settings.normalizeOffset && this.getBoundingClientRect)
                                                    ) {
                                                        var y = this.getBoundingClientRect();
                                                        ((f = i.clientX - y.left), (g = i.clientY - y.top));
                                                    }
                                                    return (
                                                        (i.deltaX = d),
                                                        (i.deltaY = p),
                                                        (i.deltaFactor = n),
                                                        (i.offsetX = f),
                                                        (i.offsetY = g),
                                                        (i.deltaMode = 0),
                                                        s.unshift(i, l, d, p),
                                                        t && clearTimeout(t),
                                                        (t = setTimeout(c, 200)),
                                                        (e.event.dispatch || e.event.handle).apply(this, s)
                                                    );
                                                }
                                            }
                                            function c() {
                                                n = null;
                                            }
                                            function u(e, t) {
                                                return a.settings.adjustOldDeltas && 'mousewheel' === e.type && t % 120 == 0;
                                            }
                                            e.fn.extend({
                                                mousewheel: function (e) {
                                                    return e ? this.bind('mousewheel', e) : this.trigger('mousewheel');
                                                },
                                                unmousewheel: function (e) {
                                                    return this.unbind('mousewheel', e);
                                                },
                                            });
                                        }),
                                        n.define(
                                            'jquery.select2',
                                            ['jquery', 'jquery-mousewheel', './select2/core', './select2/defaults', './select2/utils'],
                                            function (e, t, n, i, r) {
                                                if (null == e.fn.select2) {
                                                    var o = ['open', 'close', 'destroy'];
                                                    e.fn.select2 = function (t) {
                                                        if ('object' == typeof (t = t || {}))
                                                            return (
                                                                this.each(function () {
                                                                    var i = e.extend(!0, {}, t);
                                                                    new n(e(this), i);
                                                                }),
                                                                this
                                                            );
                                                        if ('string' == typeof t) {
                                                            var i,
                                                                s = Array.prototype.slice.call(arguments, 1);
                                                            return (
                                                                this.each(function () {
                                                                    var e = r.GetData(this, 'select2');
                                                                    (null == e && window.console && console.error, (i = e[t].apply(e, s)));
                                                                }),
                                                                e.inArray(t, o) > -1 ? this : i
                                                            );
                                                        }
                                                        throw new Error('Invalid arguments for Select2: ' + t);
                                                    };
                                                }
                                                return (null == e.fn.select2.defaults && (e.fn.select2.defaults = i), n);
                                            }
                                        ),
                                        { define: n.define, require: n.require }
                                    );
                                })(),
                                i = n.require('jquery.select2');
                            return ((t.fn.select2.amd = n), i);
                        }),
                        void 0 === (o = 'function' == typeof i ? i.apply(t, r) : i) || (e.exports = o));
                },
                1145: function (t) {
                    'use strict';
                    t.exports = e;
                },
            },
            n = {};
        function i(e) {
            var r = n[e];
            if (void 0 !== r) return r.exports;
            var o = (n[e] = { exports: {} });
            return (t[e](o, o.exports, i), o.exports);
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
        var r = {};
        return (
            (function () {
                'use strict';
                (i.r(r),
                    i.d(r, {
                        select2: function () {
                            return t.a;
                        },
                    }));
                var e = i(1908),
                    t = i.n(e);
                try {
                    window.select2 = t();
                } catch (e) {}
            })(),
            r
        );
    })();
});
