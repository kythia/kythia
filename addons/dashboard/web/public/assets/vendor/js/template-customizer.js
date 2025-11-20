/**
 * @namespace: addons/dashboard/web/public/assets/vendor/js/template-customizer.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

!(function (t, e) {
    if ('object' == typeof exports && 'object' == typeof module) module.exports = e();
    else if ('function' == typeof define && define.amd) define([], e);
    else {
        var o = e();
        for (var i in o) ('object' == typeof exports ? exports : t)[i] = o[i];
    }
})(self, function () {
    return (function () {
        'use strict';
        var t = {
                7621: function (t, e, o) {
                    var i = o(8081),
                        n = o.n(i),
                        a = o(3645),
                        s = o.n(a),
                        r = o(1667),
                        l = o.n(r),
                        c = new URL(o(6468), o.b),
                        u = s()(n()),
                        d = l()(c);
                    (u.push([
                        t.id,
                        '#template-customizer{position:fixed;z-index:99999999;display:flex;flex-direction:column;block-size:100%;-webkit-box-direction:normal;-webkit-box-orient:vertical;box-shadow:0 .3125rem 1.375rem 0 rgba(34,48,62,.18);font-family:"Public Sans",-apple-system,blinkmacsystemfont,"Segoe UI",Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",sans-serif;font-size:inherit;inline-size:400px;inset-block-start:0;inset-inline-end:0;transform:translateX(420px);transition:transform .2s ease-in}[data-bs-theme=dark] #template-customizer{box-shadow:0 .3125rem 1.375rem 0 rgba(20,20,29,.26)}#template-customizer h5{position:relative;font-size:11px}#template-customizer .form-label{font-size:.9375rem;font-weight:500}#template-customizer .template-customizer-colors-options{display:flex;flex-direction:row;justify-content:space-around;margin:0;gap:.3rem}#template-customizer .template-customizer-colors-options .custom-option{inline-size:50px}#template-customizer .template-customizer-colors-options .custom-option .custom-option-content{padding:0;min-block-size:46px}#template-customizer .template-customizer-colors-options .custom-option .custom-option-content .pcr-button{padding:.625rem;block-size:30px;inline-size:30px}#template-customizer .template-customizer-colors-options .custom-option .custom-option-content .pcr-button::before,#template-customizer .template-customizer-colors-options .custom-option .custom-option-content .pcr-button::after{border-radius:.5rem}#template-customizer .template-customizer-colors-options .custom-option .custom-option-content .pcr-button:focus{box-shadow:none}#template-customizer .template-customizer-colors-options .custom-option-body{border-radius:.5rem;block-size:30px;inline-size:30px}#template-customizer .custom-option-icon{padding:0}#template-customizer .custom-option-icon .custom-option-content{display:flex;align-items:center;justify-content:center;min-block-size:50px}#template-customizer hr{border-color:var(--ky-border-color)}#template-customizer .custom-option{border-width:2px;margin:0}#template-customizer .custom-option.custom-option-image .custom-option-content .custom-option-body svg{inline-size:100%}#template-customizer.template-customizer-open{transform:none;transition-delay:.1s}#template-customizer.template-customizer-open .template-customizer-theme .custom-option.checked{background-color:rgba(var(--ky-primary-rgb), 0.08)}#template-customizer.template-customizer-open .template-customizer-theme .custom-option.checked *,#template-customizer.template-customizer-open .template-customizer-theme .custom-option.checked *::before,#template-customizer.template-customizer-open .template-customizer-theme .custom-option.checked *::after{color:var(--ky-primary)}#template-customizer.template-customizer-open .custom-option.checked{border-width:2px;color:var(--ky-primary)}#template-customizer.template-customizer-open .custom-option.checked .custom-option-content{border:none}#template-customizer .template-customizer-header a:hover,#template-customizer .template-customizer-header a:hover .icon-base{color:inherit !important}#template-customizer .template-customizer-open-btn{position:absolute;z-index:-1;display:block;background:var(--ky-primary);block-size:38px;border-end-start-radius:.375rem;border-start-start-radius:.375rem;box-shadow:0 .125rem .25rem 0 rgba(var(--ky-primary-rgb), 0.4);color:#fff;font-size:18px;inline-size:38px;inset-block-start:180px;inset-inline-start:0;line-height:38px;opacity:1;text-align:center;transform:translateX(-58px);transition:all .1s linear .2s}#template-customizer .template-customizer-open-btn::before{position:absolute;display:block;background-image:url(' +
                            d +
                            ');background-size:100% 100%;block-size:22px;content:"";inline-size:22px;inset-block-start:50%;inset-inline-start:50%;transform:translate(-50%, -50%)}:dir(rtl) #template-customizer .template-customizer-open-btn::before{margin-inline-start:2px;transform:translate(50%, -50%)}.customizer-hide #template-customizer .template-customizer-open-btn{display:none}:dir(rtl) #template-customizer .template-customizer-open-btn{transform:translateX(58px)}#template-customizer.template-customizer-open .template-customizer-open-btn{opacity:0;transform:none;transition-delay:0s}#template-customizer .template-customizer-inner{position:relative;overflow:auto;flex:0 1 auto;-webkit-box-flex:0;opacity:1;transition:opacity .2s ;}@media(max-width: 1200px){#template-customizer{display:none;visibility:hidden}}.layout-menu-100vh #template-customizer{block-size:100dvh}:dir(rtl) #template-customizer:not(.template-customizer-open){transform:translateX(-420px)}',
                        '',
                    ]),
                        (e.Z = u));
                },
                3645: function (t) {
                    t.exports = function (t) {
                        var e = [];
                        return (
                            (e.toString = function () {
                                return this.map(function (e) {
                                    var o = '',
                                        i = void 0 !== e[5];
                                    return (
                                        e[4] && (o += '@supports ('.concat(e[4], ') {')),
                                        e[2] && (o += '@media '.concat(e[2], ' {')),
                                        i && (o += '@layer'.concat(e[5].length > 0 ? ' '.concat(e[5]) : '', ' {')),
                                        (o += t(e)),
                                        i && (o += '}'),
                                        e[2] && (o += '}'),
                                        e[4] && (o += '}'),
                                        o
                                    );
                                }).join('');
                            }),
                            (e.i = function (t, o, i, n, a) {
                                'string' == typeof t && (t = [[null, t, void 0]]);
                                var s = {};
                                if (i)
                                    for (var r = 0; r < this.length; r++) {
                                        var l = this[r][0];
                                        null != l && (s[l] = !0);
                                    }
                                for (var c = 0; c < t.length; c++) {
                                    var u = [].concat(t[c]);
                                    (i && s[u[0]]) ||
                                        (void 0 !== a &&
                                            (void 0 === u[5] ||
                                                (u[1] = '@layer'.concat(u[5].length > 0 ? ' '.concat(u[5]) : '', ' {').concat(u[1], '}')),
                                            (u[5] = a)),
                                        o && (u[2] ? ((u[1] = '@media '.concat(u[2], ' {').concat(u[1], '}')), (u[2] = o)) : (u[2] = o)),
                                        n &&
                                            (u[4]
                                                ? ((u[1] = '@supports ('.concat(u[4], ') {').concat(u[1], '}')), (u[4] = n))
                                                : (u[4] = ''.concat(n))),
                                        e.push(u));
                                }
                            }),
                            e
                        );
                    };
                },
                1667: function (t) {
                    t.exports = function (t, e) {
                        return (
                            e || (e = {}),
                            t
                                ? ((t = String(t.__esModule ? t.default : t)),
                                  /^['"].*['"]$/.test(t) && (t = t.slice(1, -1)),
                                  e.hash && (t += e.hash),
                                  /["'() \t\n]|(%20)/.test(t) || e.needQuotes
                                      ? '"'.concat(t.replace(/"/g, '\\"').replace(/\n/g, '\\n'), '"')
                                      : t)
                                : t
                        );
                    };
                },
                8081: function (t) {
                    t.exports = function (t) {
                        return t[1];
                    };
                },
                3379: function (t) {
                    var e = [];
                    function o(t) {
                        for (var o = -1, i = 0; i < e.length; i++)
                            if (e[i].identifier === t) {
                                o = i;
                                break;
                            }
                        return o;
                    }
                    function i(t, i) {
                        for (var a = {}, s = [], r = 0; r < t.length; r++) {
                            var l = t[r],
                                c = i.base ? l[0] + i.base : l[0],
                                u = a[c] || 0,
                                d = ''.concat(c, ' ').concat(u);
                            a[c] = u + 1;
                            var m = o(d),
                                p = {
                                    css: l[1],
                                    media: l[2],
                                    sourceMap: l[3],
                                    supports: l[4],
                                    layer: l[5],
                                };
                            if (-1 !== m) (e[m].references++, e[m].updater(p));
                            else {
                                var h = n(p, i);
                                ((i.byIndex = r), e.splice(r, 0, { identifier: d, updater: h, references: 1 }));
                            }
                            s.push(d);
                        }
                        return s;
                    }
                    function n(t, e) {
                        var o = e.domAPI(e);
                        o.update(t);
                        return function (e) {
                            if (e) {
                                if (
                                    e.css === t.css &&
                                    e.media === t.media &&
                                    e.sourceMap === t.sourceMap &&
                                    e.supports === t.supports &&
                                    e.layer === t.layer
                                )
                                    return;
                                o.update((t = e));
                            } else o.remove();
                        };
                    }
                    t.exports = function (t, n) {
                        var a = i((t = t || []), (n = n || {}));
                        return function (t) {
                            t = t || [];
                            for (var s = 0; s < a.length; s++) {
                                var r = o(a[s]);
                                e[r].references--;
                            }
                            for (var l = i(t, n), c = 0; c < a.length; c++) {
                                var u = o(a[c]);
                                0 === e[u].references && (e[u].updater(), e.splice(u, 1));
                            }
                            a = l;
                        };
                    };
                },
                569: function (t) {
                    var e = {};
                    t.exports = function (t, o) {
                        var i = (function (t) {
                            if (void 0 === e[t]) {
                                var o = document.querySelector(t);
                                if (window.HTMLIFrameElement && o instanceof window.HTMLIFrameElement)
                                    try {
                                        o = o.contentDocument.head;
                                    } catch (t) {
                                        o = null;
                                    }
                                e[t] = o;
                            }
                            return e[t];
                        })(t);
                        if (!i)
                            throw new Error(
                                "Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid."
                            );
                        i.appendChild(o);
                    };
                },
                9216: function (t) {
                    t.exports = function (t) {
                        var e = document.createElement('style');
                        return (t.setAttributes(e, t.attributes), t.insert(e, t.options), e);
                    };
                },
                3565: function (t, e, o) {
                    t.exports = function (t) {
                        var e = o.nc;
                        e && t.setAttribute('nonce', e);
                    };
                },
                7795: function (t) {
                    t.exports = function (t) {
                        if ('undefined' == typeof document) return { update: function () {}, remove: function () {} };
                        var e = t.insertStyleElement(t);
                        return {
                            update: function (o) {
                                !(function (t, e, o) {
                                    var i = '';
                                    (o.supports && (i += '@supports ('.concat(o.supports, ') {')),
                                        o.media && (i += '@media '.concat(o.media, ' {')));
                                    var n = void 0 !== o.layer;
                                    (n && (i += '@layer'.concat(o.layer.length > 0 ? ' '.concat(o.layer) : '', ' {')),
                                        (i += o.css),
                                        n && (i += '}'),
                                        o.media && (i += '}'),
                                        o.supports && (i += '}'));
                                    var a = o.sourceMap;
                                    (a &&
                                        'undefined' != typeof btoa &&
                                        (i += '\n/*# sourceMappingURL=data:application/json;base64,'.concat(
                                            btoa(unescape(encodeURIComponent(JSON.stringify(a)))),
                                            ' */'
                                        )),
                                        e.styleTagTransform(i, t, e.options));
                                })(e, t, o);
                            },
                            remove: function () {
                                !(function (t) {
                                    if (null === t.parentNode) return !1;
                                    t.parentNode.removeChild(t);
                                })(e);
                            },
                        };
                    };
                },
                4589: function (t) {
                    t.exports = function (t, e) {
                        if (e.styleSheet) e.styleSheet.cssText = t;
                        else {
                            for (; e.firstChild; ) e.removeChild(e.firstChild);
                            e.appendChild(document.createTextNode(t));
                        }
                    };
                },
                6468: function (t) {
                    t.exports =
                        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAABClJREFUaEPtmY1RFEEQhbsjUCIQIhAiUCNQIxAiECIQIxAiECIAIpAMhAiECIQI2vquZqnZvp6fhb3SK5mqq6Ju92b69bzXf6is+dI1t1+eAfztG5z1BsxsU0S+ici2iPB3vm5E5EpEDlSVv2dZswFIxv8UkZcNy+5EZGcuEHMCOBeR951uvVDVD53vVl+bE8DvDu8Pxtyo6ta/BsByg1R15Bwzqz5/LJgn34CZwfnPInI4BUB6/1hV0cSjVxcAM4PbcBZjL0XklIPN7Is3fLCkdQPpPYw/VNXj5IhPIvJWRIhSl6p60ULWBGBm30Vk123EwRxCuIzWkkjNrCZywith10ewE1Xdq4GoAjCz/RTXW44Ynt+LyBEfT43kYfbj86J3w5Q32DNcRQDpwF+dkQXDMey8xem0L3TEqB4g3PZWad8agBMRgZPeu96D1/C2Zbh3X0p80Op1xxloztN48bMQQNoc7+eLEuAoPSPiIDY4Ooo+E6ixeNXM+D3GERz2U3CIqMstLJUgJQDe+7eq6mub0NYEkLAKwEHkiBQDCZtddZCZ8d6r7JDwFkoARklHRPZUFVDVZWbwGuNrC4EfdOzFrRABh3Wnqhv+d70AEBLGFROPmeHlnM81G69UdSd6IUuM0GgUVn1uqWmg5EmMfBeEyB7Pe3txBkY+rGT8j0J+WXq/BgDkUCaqLgEAnwcRog0veMIqFAAwCy2wnw+bI2GaGboBgF9k5N0o0rUSGUb4eO0BeO9j/GYhkSHMHMTIqwGARX6p6a+nlPBl8kZuXMD9j6pKfF9aZuaFOdJCEL5D4eYb9wCYVCanrBmGyii/tIq+SLj/HQBCaM5bLzwfPqdQ6FpVHyra4IbuVbXaY7dETC2ESPNNWiIOi69CcdgSMXsh4tNSUiklMgwmC0aNd08Y5WAES6HHehM4gu97wyhBgWpgqXsrASglprDy7CwhehMZOSbK6JMSma+Fio1KltCmlBIj7gfZOGx8ppQSXrhzFnOhJ/31BDkjFHRvOd09x0mRBA9SFgxUgHpQg0q0t5ymPMlL+EnldFTfDA0NAmf+OTQ0X0sRouf7NNkYGhrOYNrxtIaGg83MNzVDSe3LXLhP7O/yrCsCz1zlWTpjWkuZAOBpX3yVnLqI1yLCOKU6qMrmP7SSrUEw54XF4WBIK5FxCMOr3lVsfGqNSmPzBXUnJTIX1jyVBq9wO6UObOpgC5GjO98vFKnTdQMZXxEsWZlDiCZMIxAbNxQOqlpVZtobejBaZNoBnRDzMFpkxvTQOD36BlrcySZuI6p1ACB6LU3wWuf5581+oHfD1vi89bz3nFUC8Nm7ZlP3nKkFbM4bWPt/MSFwklprYItwt6cmvpWJ2IVcQBCz6bLysSCv3SaANCiTsnaNRrNRqMXVVT1/BrAqz/buu/Y38Ad3KC5PARej0QAAAABJRU5ErkJggg==';
                },
            },
            e = {};
        function o(i) {
            var n = e[i];
            if (void 0 !== n) return n.exports;
            var a = (e[i] = { id: i, exports: {} });
            return (t[i](a, a.exports, o), a.exports);
        }
        ((o.m = t),
            (o.n = function (t) {
                var e =
                    t && t.__esModule
                        ? function () {
                              return t.default;
                          }
                        : function () {
                              return t;
                          };
                return (o.d(e, { a: e }), e);
            }),
            (o.d = function (t, e) {
                for (var i in e) o.o(e, i) && !o.o(t, i) && Object.defineProperty(t, i, { enumerable: !0, get: e[i] });
            }),
            (o.o = function (t, e) {
                return Object.prototype.hasOwnProperty.call(t, e);
            }),
            (o.r = function (t) {
                ('undefined' != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, { value: 'Module' }),
                    Object.defineProperty(t, '__esModule', { value: !0 }));
            }),
            (o.b = document.baseURI || self.location.href),
            (o.nc = void 0));
        var i = {};
        return (
            (function () {
                (o.r(i),
                    o.d(i, {
                        TemplateCustomizer: function () {
                            return D;
                        },
                    }));
                var t = o(3379),
                    e = o.n(t),
                    n = o(7795),
                    a = o.n(n),
                    s = o(569),
                    r = o.n(s),
                    l = o(3565),
                    c = o.n(l),
                    u = o(9216),
                    d = o.n(u),
                    m = o(4589),
                    p = o.n(m),
                    h = o(7621),
                    g = {};
                ((g.styleTagTransform = p()),
                    (g.setAttributes = c()),
                    (g.insert = r().bind(null, 'head')),
                    (g.domAPI = a()),
                    (g.insertStyleElement = d()));
                (e()(h.Z, g), h.Z && h.Z.locals && h.Z.locals);
                function v(t) {
                    return (
                        (v =
                            'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
                                ? function (t) {
                                      return typeof t;
                                  }
                                : function (t) {
                                      return t && 'function' == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype
                                          ? 'symbol'
                                          : typeof t;
                                  }),
                        v(t)
                    );
                }
                function b(t, e) {
                    for (var o = 0; o < e.length; o++) {
                        var i = e[o];
                        ((i.enumerable = i.enumerable || !1),
                            (i.configurable = !0),
                            'value' in i && (i.writable = !0),
                            Object.defineProperty(t, f(i.key), i));
                    }
                }
                function f(t) {
                    var e = (function (t, e) {
                        if ('object' != v(t) || !t) return t;
                        var o = t[Symbol.toPrimitive];
                        if (void 0 !== o) {
                            var i = o.call(t, e || 'default');
                            if ('object' != v(i)) return i;
                            throw new TypeError('@@toPrimitive must return a primitive value.');
                        }
                        return ('string' === e ? String : Number)(t);
                    })(t, 'string');
                    return 'symbol' == v(e) ? e : e + '';
                }
                var y,
                    _ = [
                        'color',
                        'theme',
                        'skins',
                        'semiDark',
                        'contentLayout',
                        'headerType',
                        'layoutCollapsed',
                        'layoutNavbarOptions',
                        'rtl',
                        'layoutFooterFixed',
                        'showDropdownOnHover',
                    ],
                    k = ['light', 'dark', 'system'],
                    S = document.documentElement.classList;
                y = S.contains('layout-navbar-fixed') ? 'sticky' : S.contains('layout-navbar-hidden') ? 'hidden' : 'static';
                var z,
                    w = document.documentElement.getAttribute('data-bs-theme') || 'light',
                    C = document.getElementsByTagName('HTML')[0].getAttribute('data-skin') || 0,
                    x = S.contains('layout-wide') ? 'wide' : 'compact',
                    A = S.contains('layout-menu-offcanvas')
                        ? 'static-offcanvas'
                        : S.contains('layout-menu-fixed')
                          ? 'fixed'
                          : S.contains('layout-menu-fixed-offcanvas')
                            ? 'fixed-offcanvas'
                            : 'static',
                    L = !!S.contains('layout-menu-collapsed'),
                    E = y,
                    N = 'rtl' === document.documentElement.getAttribute('dir'),
                    T = !!S.contains('layout-footer-fixed'),
                    O = getComputedStyle(document.documentElement),
                    D = (function () {
                        function t(e) {
                            var o = e.displayCustomizer,
                                i = e.lang,
                                n = e.defaultPrimaryColor,
                                a = e.defaultSkin,
                                s = e.defaultTheme,
                                r = e.defaultSemiDark,
                                l = e.defaultContentLayout,
                                c = e.defaultHeaderType,
                                u = e.defaultMenuCollapsed,
                                d = e.defaultNavbarType,
                                m = e.defaultTextDir,
                                p = e.defaultFooterFixed,
                                h = e.defaultShowDropdownOnHover,
                                g = e.controls,
                                v = e.themes,
                                b = e.availableColors,
                                f = e.availableSkins,
                                y = e.availableThemes,
                                S = e.availableContentLayouts,
                                D = e.availableHeaderTypes,
                                q = e.availableMenuCollapsed,
                                H = e.availableNavbarOptions,
                                I = e.availableDirections,
                                F = e.onSettingsChange;
                            if (
                                ((function (t, e) {
                                    if (!(t instanceof e)) throw new TypeError('Cannot call a class as a function');
                                })(this, t),
                                !this._ssr)
                            ) {
                                if (!window.Helpers) throw new Error('window.Helpers required.');
                                if (
                                    ((this.settings = {}),
                                    (this.settings.displayCustomizer = void 0 === o || o),
                                    (this.settings.lang = i || 'en'),
                                    n
                                        ? ((this.settings.defaultPrimaryColor = n), (z = !0))
                                        : ((this.settings.defaultPrimaryColor = O.getPropertyValue('--ky-primary').trim()), (z = !1)),
                                    (this.settings.defaultTheme = s || w),
                                    (this.settings.defaultSemiDark = void 0 !== r && r),
                                    (this.settings.defaultContentLayout = void 0 !== l ? l : x),
                                    (this.settings.defaultHeaderType = c || A),
                                    (this.settings.defaultMenuCollapsed = void 0 !== u ? u : L),
                                    (this.settings.defaultNavbarType = void 0 !== d ? d : E),
                                    (this.settings.defaultTextDir = 'rtl' === m || N),
                                    (this.settings.defaultFooterFixed = void 0 !== p ? p : T),
                                    (this.settings.defaultShowDropdownOnHover = void 0 === h || h),
                                    (this.settings.controls = g || _),
                                    (this.settings.availableColors = b || t.COLORS),
                                    (this.settings.availableSkins = f || t.SKINS),
                                    (this.settings.availableThemes = y || t.THEMES),
                                    (this.settings.availableContentLayouts = S || t.CONTENT),
                                    (this.settings.availableHeaderTypes = D || t.HEADER_TYPES),
                                    (this.settings.availableMenuCollapsed = q || t.LAYOUTS),
                                    (this.settings.availableNavbarOptions = H || t.NAVBAR_OPTIONS),
                                    (this.settings.availableDirections = I || t.DIRECTIONS),
                                    (this.settings.defaultSkin = this._getDefaultSkin(void 0 !== a ? a : C)),
                                    (this.settings.themes = v || k),
                                    this.settings.themes.length < 2)
                                ) {
                                    var B = this.settings.controls.indexOf('theme');
                                    -1 !== B &&
                                        (this.settings.controls = this.settings.controls
                                            .slice(0, B)
                                            .concat(this.settings.controls.slice(B + 1)));
                                }
                                ((this.settings.onSettingsChange = 'function' == typeof F ? F : function () {}),
                                    this._loadSettings(),
                                    (this._listeners = []),
                                    (this._controls = {}),
                                    this._initDirection(),
                                    this.setContentLayout(this.settings.contentLayout, !1),
                                    this.setHeaderType(this.settings.headerType, !1),
                                    this.setLayoutNavbarOption(this.settings.layoutNavbarOptions, !1),
                                    this.setLayoutFooterFixed(this.settings.layoutFooterFixed, !1),
                                    this.setDropdownOnHover(this.settings.showDropdownOnHover, !1),
                                    this._setup());
                            }
                        }
                        return (
                            (e = t),
                            (o = [
                                {
                                    key: 'setColor',
                                    value: function (t) {
                                        var e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                                        window.Helpers.setColor(t, e);
                                    },
                                },
                                {
                                    key: 'setTheme',
                                    value: function (t) {
                                        this._setSetting('Theme', t);
                                    },
                                },
                                {
                                    key: 'setSkin',
                                    value: function (t) {
                                        var e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
                                        if (this._hasControls('skins')) {
                                            var o = this._getSkinByName(t);
                                            o &&
                                                ((this.settings.skin = o),
                                                e && this._setSetting('Skin', t),
                                                e && this.settings.onSettingsChange.call(this, this.settings));
                                        }
                                    },
                                },
                                {
                                    key: 'setLayoutNavbarOption',
                                    value: function (t) {
                                        var e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
                                        this._hasControls('layoutNavbarOptions') &&
                                            ((this.settings.layoutNavbarOptions = t),
                                            e && this._setSetting('FixedNavbarOption', t),
                                            window.Helpers.setNavbar(t),
                                            e && this.settings.onSettingsChange.call(this, this.settings));
                                    },
                                },
                                {
                                    key: 'setContentLayout',
                                    value: function (t) {
                                        var e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
                                        this._hasControls('contentLayout') &&
                                            ((this.settings.contentLayout = t),
                                            e && this._setSetting('contentLayout', t),
                                            window.Helpers.setContentLayout(t),
                                            e && this.settings.onSettingsChange.call(this, this.settings));
                                    },
                                },
                                {
                                    key: 'setHeaderType',
                                    value: function (t) {
                                        var e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
                                        if (
                                            this._hasControls('headerType') &&
                                            ['static', 'static-offcanvas', 'fixed', 'fixed-offcanvas'].includes(t)
                                        ) {
                                            ((this.settings.headerType = t),
                                                e && this._setSetting('HeaderType', t),
                                                window.Helpers.setPosition(
                                                    'fixed' === t || 'fixed-offcanvas' === t,
                                                    'static-offcanvas' === t || 'fixed-offcanvas' === t
                                                ),
                                                e && this.settings.onSettingsChange.call(this, this.settings));
                                            var o = window.Helpers.menuPsScroll,
                                                i = window.PerfectScrollbar;
                                            'fixed' === this.settings.headerType || 'fixed-offcanvas' === this.settings.headerType
                                                ? i &&
                                                  o &&
                                                  (window.Helpers.menuPsScroll.destroy(),
                                                  (o = new i(document.querySelector('.menu-inner'), {
                                                      suppressScrollX: !0,
                                                      wheelPropagation: !1,
                                                  })),
                                                  (window.Helpers.menuPsScroll = o))
                                                : o && window.Helpers.menuPsScroll.destroy();
                                        }
                                    },
                                },
                                {
                                    key: 'setLayoutFooterFixed',
                                    value: function (t) {
                                        var e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
                                        ((this.settings.layoutFooterFixed = t),
                                            e && this._setSetting('FixedFooter', t),
                                            window.Helpers.setFooterFixed(t),
                                            e && this.settings.onSettingsChange.call(this, this.settings));
                                    },
                                },
                                {
                                    key: 'setDropdownOnHover',
                                    value: function (t) {
                                        var e = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1];
                                        if (this._hasControls('showDropdownOnHover')) {
                                            if (
                                                ((this.settings.showDropdownOnHover = t),
                                                e && this._setSetting('ShowDropdownOnHover', t),
                                                window.Helpers.mainMenu)
                                            ) {
                                                (window.Helpers.mainMenu.destroy(), (config.showDropdownOnHover = t));
                                                var o = window.Menu;
                                                window.Helpers.mainMenu = new o(document.getElementById('layout-menu'), {
                                                    orientation: 'horizontal',
                                                    closeChildren: !0,
                                                    showDropdownOnHover: config.showDropdownOnHover,
                                                });
                                            }
                                            e && this.settings.onSettingsChange.call(this, this.settings);
                                        }
                                    },
                                },
                                {
                                    key: 'setRtl',
                                    value: function (t) {
                                        this._hasControls('rtl') && this._setSetting('Rtl', String(t));
                                    },
                                },
                                {
                                    key: 'setLang',
                                    value: function (e) {
                                        var o = this,
                                            i = !(arguments.length > 1 && void 0 !== arguments[1]) || arguments[1],
                                            n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2];
                                        if (e !== this.settings.lang || n) {
                                            if (!t.LANGUAGES[e]) throw new Error('Language "'.concat(e, '" not found!'));
                                            var a = t.LANGUAGES[e];
                                            ([
                                                'panel_header',
                                                'panel_sub_header',
                                                'theming_header',
                                                'color_label',
                                                'theme_label',
                                                'style_switch_light',
                                                'style_switch_dark',
                                                'layout_header',
                                                'layout_label',
                                                'layout_header_label',
                                                'content_label',
                                                'layout_static',
                                                'layout_offcanvas',
                                                'layout_fixed',
                                                'layout_fixed_offcanvas',
                                                'layout_dd_open_label',
                                                'layout_navbar_label',
                                                'layout_footer_label',
                                                'misc_header',
                                                'skin_label',
                                                'semiDark_label',
                                                'direction_label',
                                            ].forEach(function (t) {
                                                var e = o.container.querySelector('.template-customizer-t-'.concat(t));
                                                e && (e.textContent = a[t]);
                                            }),
                                                (this.settings.lang = e),
                                                i && this._setSetting('Lang', e),
                                                i && this.settings.onSettingsChange.call(this, this.settings));
                                        }
                                    },
                                },
                                {
                                    key: 'update',
                                    value: function () {
                                        if (!this._ssr) {
                                            var t = !!document.querySelector('.layout-navbar'),
                                                e = !!document.querySelector('.layout-menu'),
                                                o = !!document.querySelector('.layout-menu-horizontal.menu, .layout-menu-horizontal .menu'),
                                                i = !!document.querySelector('.content-footer');
                                            (this._controls.showDropdownOnHover &&
                                                (e
                                                    ? (this._controls.showDropdownOnHover.setAttribute('disabled', 'disabled'),
                                                      this._controls.showDropdownOnHover.classList.add('disabled'))
                                                    : (this._controls.showDropdownOnHover.removeAttribute('disabled'),
                                                      this._controls.showDropdownOnHover.classList.remove('disabled'))),
                                                this._controls.layoutNavbarOptions &&
                                                    (t
                                                        ? (this._controls.layoutNavbarOptions.removeAttribute('disabled'),
                                                          this._controls.layoutNavbarOptionsW.classList.remove('disabled'))
                                                        : (this._controls.layoutNavbarOptions.setAttribute('disabled', 'disabled'),
                                                          this._controls.layoutNavbarOptionsW.classList.add('disabled')),
                                                    o &&
                                                        t &&
                                                        'fixed' === this.settings.headerType &&
                                                        (this._controls.layoutNavbarOptions.setAttribute('disabled', 'disabled'),
                                                        this._controls.layoutNavbarOptionsW.classList.add('disabled'))),
                                                this._controls.layoutFooterFixed &&
                                                    (i
                                                        ? (this._controls.layoutFooterFixed.removeAttribute('disabled'),
                                                          this._controls.layoutFooterFixedW.classList.remove('disabled'))
                                                        : (this._controls.layoutFooterFixed.setAttribute('disabled', 'disabled'),
                                                          this._controls.layoutFooterFixedW.classList.add('disabled'))),
                                                this._controls.headerType &&
                                                    (e || o
                                                        ? this._controls.headerType.removeAttribute('disabled')
                                                        : this._controls.headerType.setAttribute('disabled', 'disabled')));
                                        }
                                    },
                                },
                                {
                                    key: 'clearLocalStorage',
                                    value: function () {
                                        if (!this._ssr) {
                                            var t = this._getLayoutName();
                                            ([
                                                'Color',
                                                'Theme',
                                                'Skin',
                                                'SemiDark',
                                                'LayoutCollapsed',
                                                'FixedNavbarOption',
                                                'HeaderType',
                                                'contentLayout',
                                                'Rtl',
                                                'Lang',
                                            ].forEach(function (e) {
                                                var o = 'templateCustomizer-'.concat(t, '--').concat(e);
                                                localStorage.removeItem(o);
                                            }),
                                                this._showResetBtnNotification(!1));
                                        }
                                    },
                                },
                                {
                                    key: 'destroy',
                                    value: function () {
                                        this._ssr ||
                                            (this._cleanup(),
                                            (this.settings = null),
                                            this.container.parentNode.removeChild(this.container),
                                            (this.container = null));
                                    },
                                },
                                {
                                    key: '_loadSettings',
                                    value: function () {
                                        var t = this._getSetting('Rtl'),
                                            e = this._getSetting('Color'),
                                            o = this._getSetting('Theme'),
                                            i = this._getSetting('Skin'),
                                            n = this._getSetting('SemiDark'),
                                            a = this._getSetting('contentLayout'),
                                            s = this._getSetting('LayoutCollapsed'),
                                            r = this._getSetting('ShowDropdownOnHover'),
                                            l = this._getSetting('FixedNavbarOption'),
                                            c = this._getSetting('FixedFooter'),
                                            u = this._getSetting('HeaderType');
                                        (t || o || i || a || s || l || u || e || n
                                            ? this._showResetBtnNotification(!0)
                                            : this._showResetBtnNotification(!1),
                                            (this.settings.headerType = ['static', 'static-offcanvas', 'fixed', 'fixed-offcanvas'].includes(
                                                u
                                            )
                                                ? u
                                                : this.settings.defaultHeaderType),
                                            (this.settings.rtl = '' !== t ? 'true' === t : this.settings.defaultTextDir),
                                            e && (z = !0),
                                            (this.settings.color = e || this.settings.defaultPrimaryColor),
                                            this.setColor(this.settings.color, z),
                                            (this.settings.themesOpt = this.settings.themes.includes(o) ? o : this.settings.defaultTheme));
                                        var d,
                                            m = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                                        ((d = this.settings.themes.includes(o)
                                            ? 'system' === o
                                                ? m
                                                : o
                                            : 'system' === this.settings.defaultTheme
                                              ? m
                                              : this.settings.defaultTheme),
                                            (this.settings.theme = this.settings.defaultTheme),
                                            document.documentElement.setAttribute('data-bs-theme', d),
                                            (this.settings.semiDark = n ? 'true' === n : this.settings.defaultSemiDark),
                                            this.settings.semiDark &&
                                                document.documentElement.setAttribute('data-semidark-menu', this.settings.semiDark),
                                            (this.settings.contentLayout = a || this.settings.defaultContentLayout),
                                            (this.settings.layoutCollapsed = s ? 'true' === s : this.settings.defaultMenuCollapsed),
                                            this.settings.layoutCollapsed &&
                                                document.documentElement.classList.add('layout-menu-collapsed'),
                                            (this.settings.showDropdownOnHover = r
                                                ? 'true' === r
                                                : this.settings.defaultShowDropdownOnHover),
                                            (this.settings.layoutNavbarOptions = ['static', 'sticky', 'hidden'].includes(l)
                                                ? l
                                                : this.settings.defaultNavbarType),
                                            (this.settings.layoutFooterFixed = c ? 'true' === c : this.settings.defaultFooterFixed),
                                            (this.settings.skin = this._getSkinByName(this._getSetting('Skin'), !0)),
                                            this._hasControls('rtl') ||
                                                (this.settings.rtl = 'rtl' === document.documentElement.getAttribute('dir')),
                                            this._hasControls('theme') ||
                                                (this.settings.theme = window.Helpers.isDarkStyle() ? 'dark' : 'light'),
                                            this._hasControls('contentLayout') || (this.settings.contentLayout = null),
                                            this._hasControls('headerType') || (this.settings.headerType = null),
                                            this._hasControls('layoutCollapsed') || (this.settings.layoutCollapsed = null),
                                            this._hasControls('layoutNavbarOptions') || (this.settings.layoutNavbarOptions = null),
                                            this._hasControls('skins') || (this.settings.skin = null),
                                            this._hasControls('semiDark') || (this.settings.semiDark = null));
                                    },
                                },
                                {
                                    key: '_setup',
                                    value: function () {
                                        var t = this,
                                            e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : document,
                                            o = function (t, e, o, i) {
                                                var n = arguments.length > 4 && void 0 !== arguments[4] && arguments[4],
                                                    a = document.createElement('div');
                                                a.classList.add('col-4', 'px-2');
                                                var s = n
                                                    ? 'custom-option custom-option-icon'
                                                    : 'custom-option custom-option-image custom-option-image-radio';
                                                return (
                                                    (a.innerHTML = '\n        <div class="form-check '
                                                        .concat(
                                                            s,
                                                            ' mb-0">\n          <label class="form-check-label custom-option-content p-0" for="'
                                                        )
                                                        .concat(o)
                                                        .concat(
                                                            t,
                                                            '">\n            <span class="custom-option-body mb-0 scaleX-n1-rtl"></span>\n          </label>\n          <input\n            name="'
                                                        )
                                                        .concat(
                                                            o,
                                                            '"\n            class="form-check-input d-none"\n            type="radio"\n            value="'
                                                        )
                                                        .concat(t, '"\n            id="')
                                                        .concat(o)
                                                        .concat(
                                                            t,
                                                            '" />\n        </div>\n        <label class="form-check-label small text-nowrap text-body" for="'
                                                        )
                                                        .concat(o)
                                                        .concat(t, '">')
                                                        .concat(e, '</label>\n      ')),
                                                    n
                                                        ? (a.querySelector('.custom-option-body').innerHTML = i)
                                                        : fetch(''.concat(assetsPath, 'img/customizer/').concat(i))
                                                              .then(function (t) {
                                                                  return t.text();
                                                              })
                                                              .then(function (t) {
                                                                  a.querySelector('.custom-option-body').innerHTML = t;
                                                              })
                                                              .catch(function (t) {}),
                                                    a
                                                );
                                            };
                                        (this._cleanup(),
                                            (this.container = this._getElementFromString(
                                                '<div id="template-customizer" class="card rounded-0 glass-effect"> <a href="javascript:void(0)" class="template-customizer-open-btn" tabindex="-1"></a> <div class="p-6 m-0 lh-sm border-bottom template-customizer-header position-relative py-4"> <h6 class="template-customizer-t-panel_header mb-1"></h6> <p class="template-customizer-t-panel_sub_header mb-0 small"></p> <div class="d-flex align-items-center gap-2 position-absolute end-0 top-0 mt-6 me-5"> <a href="javascript:void(0)" class="template-customizer-reset-btn text-heading" data-bs-toggle="tooltip" data-bs-placement="bottom" title="Reset Customizer"><i class="icon-base bx bx-refresh icon-24px"></i><span class="badge rounded-pill bg-danger badge-dot badge-notifications d-none"></span></a> <a href="javascript:void(0)" class="template-customizer-close-btn fw-light text-heading" tabindex="-1"> <i class="icon-base bx bx-x icon-lg"></i> </a> </div> </div> <div class="template-customizer-inner pt-6"> <div class="template-customizer-theming"> <h5 class="m-0 px-6 pb-6"> <span class="template-customizer-t-theming_header bg-label-primary rounded-1 py-1 px-3 small"></span> </h5> <div class="m-0 px-6 pb-6 template-customizer-color w-100"> <label for="customizerColor" class="form-label d-block template-customizer-t-color_label mb-2"></label> <div class="row template-customizer-colors-options"></div> </div> <div class="m-0 px-6 pb-6 template-customizer-theme w-100"> <label for="customizerTheme" class="form-label d-block template-customizer-t-theme_label mb-2"></label> <div class="row px-1 template-customizer-themes-options"></div> </div> <div class="m-0 px-6 pb-6 template-customizer-skins w-100"> <label for="customizerSkin" class="form-label template-customizer-t-skin_label mb-2"></label> <div class="row px-1 template-customizer-skins-options"></div> </div> <div class="m-0 px-6 template-customizer-semiDark w-100 d-flex justify-content-between pe-12"> <span class="form-label template-customizer-t-semiDark_label"></span> <label class="switch template-customizer-t-semiDark_label"> <input type="checkbox" class="template-customizer-semi-dark-switch switch-input"/> <span class="switch-toggle-slider"> <span class="switch-on"></span> <span class="switch-off"></span> </span> </label> </div> <hr class="m-0 px-6 my-6"/> </div> <div class="template-customizer-layout"> <h5 class="m-0 px-6 pb-6"> <span class="template-customizer-t-layout_header bg-label-primary rounded-2 py-1 px-3 small"></span> </h5> <div class="m-0 px-6 pb-6 d-block template-customizer-layouts"> <label for="customizerStyle" class="form-label d-block template-customizer-t-layout_label mb-2"></label> <div class="row px-1 template-customizer-layouts-options"></div> </div> <div class="m-0 px-6 pb-6 template-customizer-headerOptions w-100"> <label for="customizerHeader" class="form-label template-customizer-t-layout_header_label mb-2"></label> <div class="row px-1 template-customizer-header-options"></div> </div> <div class="m-0 px-6 pb-6 template-customizer-layoutNavbarOptions w-100"> <label for="customizerNavbar" class="form-label template-customizer-t-layout_navbar_label mb-2"></label> <div class="row px-1 template-customizer-navbar-options"></div> </div> <div class="m-0 px-6 pb-6 template-customizer-content w-100"> <label for="customizerContent" class="form-label template-customizer-t-content_label mb-2"></label> <div class="row px-1 template-customizer-content-options"></div> </div> <div class="m-0 px-6 pb-6 template-customizer-directions w-100"> <label for="customizerDirection" class="form-label template-customizer-t-direction_label mb-2"></label> <div class="row px-1 template-customizer-directions-options"></div> </div> </div> </div> </div> '
                                            )),
                                            this.container.setAttribute(
                                                'style',
                                                'visibility: '.concat(this.settings.displayCustomizer ? 'visible' : 'hidden')
                                            ));
                                        var i = this.container.querySelector('.template-customizer-open-btn'),
                                            n = function () {
                                                (t.container.classList.add('template-customizer-open'),
                                                    t.update(),
                                                    t._updateInterval && clearInterval(t._updateInterval),
                                                    (t._updateInterval = setInterval(function () {
                                                        t.update();
                                                    }, 500)));
                                            };
                                        (i.addEventListener('click', n), this._listeners.push([i, 'click', n]));
                                        var a = this.container.querySelector('.template-customizer-reset-btn'),
                                            s = function () {
                                                (t.clearLocalStorage(), window.location.reload());
                                            };
                                        (a.addEventListener('click', s), this._listeners.push([a, 'click', s]));
                                        var r = this.container.querySelector('.template-customizer-close-btn'),
                                            l = function () {
                                                (t.container.classList.remove('template-customizer-open'),
                                                    t._updateInterval && (clearInterval(t._updateInterval), (t._updateInterval = null)));
                                            };
                                        (r.addEventListener('click', l), this._listeners.push([r, 'click', l]));
                                        var c = this.container.querySelector('.template-customizer-color'),
                                            u = c.querySelector('.template-customizer-colors-options');
                                        if (this._hasControls('color')) {
                                            var d = 'colorRadioIcon';
                                            (this.settings.availableColors.forEach(function (e) {
                                                var o =
                                                        '<div class="form-check custom-option custom-option-icon mb-0">\n          <label class="form-check-label custom-option-content p-0" for="'
                                                            .concat(d)
                                                            .concat(
                                                                e.name,
                                                                '">\n            <span class="custom-option-body mb-0 scaleX-n1-rtl" style="background-color: '
                                                            )
                                                            .concat(
                                                                e.color,
                                                                ';"></span>\n          </label>\n          <input\n            name="'
                                                            )
                                                            .concat(
                                                                d,
                                                                '"\n            class="form-check-input d-none"\n            type="radio"\n            value="'
                                                            )
                                                            .concat(e.color, '"\n            data-color="')
                                                            .concat(e.color, '"\n            id="')
                                                            .concat(d)
                                                            .concat(e.name, '" />\n        </div>'),
                                                    i = t._getElementFromString(o);
                                                u.appendChild(i);
                                            }),
                                                u.appendChild(
                                                    this._getElementFromString(
                                                        '<div class="form-check custom-option custom-option-icon mb-0"><label class="form-check-label custom-option-content" for="colorRadioIcon"><span class="custom-option-body customizer-nano-picker mb-50"><i class="bx bxs-color-fill icon-base"></i></span></label><input name="colorRadioIcon" class="form-check-input picker d-none" type="radio" value="picker" id="colorRadioIcon" /> </div>'
                                                    )
                                                ));
                                            var m = u.querySelector('input[value="'.concat(this.settings.color, '"]'));
                                            m
                                                ? (m.setAttribute('checked', 'checked'),
                                                  u.querySelector('input[value="picker"]').removeAttribute('checked'))
                                                : u.querySelector('input[value="picker"]').setAttribute('checked', 'checked');
                                            var p = function (e) {
                                                'picker' === e.target.value
                                                    ? document.querySelector('.custom-option-content .pcr-button').click()
                                                    : (t._setSetting('Color', e.target.dataset.color),
                                                      t.setColor(
                                                          e.target.dataset.color,
                                                          function () {
                                                              t._loadingState(!1);
                                                          },
                                                          !0
                                                      ));
                                            };
                                            (u.addEventListener('change', p), this._listeners.push([u, 'change', p]));
                                        } else c.parentNode.removeChild(c);
                                        var h = this.container.querySelector('.template-customizer-theme'),
                                            g = h.querySelector('.template-customizer-themes-options');
                                        if (this._hasControls('theme')) {
                                            (this.settings.availableThemes.forEach(function (t) {
                                                var e = o(t.name, t.title, 'customRadioIcon', t.image, !0);
                                                g.appendChild(e);
                                            }),
                                                g.querySelector('input[value="'.concat(this.settings.themesOpt, '"]')) &&
                                                    g
                                                        .querySelector('input[value="'.concat(this.settings.themesOpt, '"]'))
                                                        .setAttribute('checked', 'checked'));
                                            var v = function (e) {
                                                if (
                                                    (document.documentElement.setAttribute('data-bs-theme', e.target.value),
                                                    t._hasControls('semiDark'))
                                                ) {
                                                    var o = t.container.querySelector('.template-customizer-semiDark');
                                                    'dark' === e.target.value ? o.classList.add('d-none') : o.classList.remove('d-none');
                                                }
                                                (window.Helpers.syncThemeToggles(e.target.value),
                                                    t.setTheme(e.target.value, !0, function () {
                                                        t._loadingState(!1);
                                                    }));
                                            };
                                            (g.addEventListener('change', v), this._listeners.push([g, 'change', v]));
                                        } else h.parentNode.removeChild(h);
                                        var b = this.container.querySelector('.template-customizer-skins'),
                                            f = b.querySelector('.template-customizer-skins-options');
                                        if (this._hasControls('skins')) {
                                            (this.settings.availableSkins.forEach(function (t) {
                                                var e = o(t.name, t.title, 'skinRadios', t.image);
                                                f.appendChild(e);
                                            }),
                                                f
                                                    .querySelector('input[value="'.concat(this.settings.skin.name, '"]'))
                                                    .setAttribute('checked', 'checked'),
                                                document.documentElement.setAttribute('data-skin', this.settings.skin.name));
                                            var y = function (e) {
                                                (document.documentElement.setAttribute('data-skin', e.target.value),
                                                    t.setSkin(e.target.value, !0, function () {
                                                        t._loadingState(!1, !0);
                                                    }));
                                            };
                                            (f.addEventListener('change', y), this._listeners.push([f, 'change', y]));
                                        } else b.parentNode.removeChild(b);
                                        var _ = this.container.querySelector('.template-customizer-semi-dark-switch'),
                                            k = this.container.querySelector('.template-customizer-semiDark');
                                        if (
                                            ('dark' === document.documentElement.getAttribute('data-bs-theme') && k.classList.add('d-none'),
                                            this._hasControls('semiDark'))
                                        )
                                            if (this._hasControls('semiDark') && 'dark' === this._getSetting('Theme'))
                                                _.classList.add('d-none');
                                            else {
                                                this.settings.semiDark && _.setAttribute('checked', 'checked');
                                                var S = function (e) {
                                                    var o = e.target.checked,
                                                        i = o ? 'dark' : 'light';
                                                    ('dark' === i
                                                        ? (document.getElementById('layout-menu').setAttribute('data-bs-theme', i),
                                                          document.documentElement.setAttribute('data-semidark-menu', 'true'))
                                                        : (document.getElementById('layout-menu').removeAttribute('data-bs-theme'),
                                                          document.documentElement.removeAttribute('data-semidark-menu')),
                                                        t._setSetting('SemiDark', o));
                                                };
                                                (_.addEventListener('change', S), this._listeners.push([_, 'change', S]));
                                            }
                                        else k.remove();
                                        var z = this.container.querySelector('.template-customizer-theming');
                                        this._hasControls('color') ||
                                            this._hasControls('theme') ||
                                            this._hasControls('skins') ||
                                            this._hasControls('semiDark') ||
                                            z.parentNode.removeChild(z);
                                        var w = this.container.querySelector('.template-customizer-layout');
                                        if (this._hasControls('contentLayout headerType layoutCollapsed layoutNavbarOptions rtl', !0)) {
                                            var C = this.container.querySelector('.template-customizer-layouts');
                                            if (this._hasControls('layoutCollapsed')) {
                                                setTimeout(function () {
                                                    document.querySelector('.layout-menu-horizontal') && C.parentNode.removeChild(C);
                                                }, 100);
                                                var x = C.querySelector('.template-customizer-layouts-options');
                                                (this.settings.availableMenuCollapsed.forEach(function (t) {
                                                    var e = o(t.name, t.title, 'layoutsRadios', t.image);
                                                    x.appendChild(e);
                                                }),
                                                    x
                                                        .querySelector(
                                                            'input[value="'.concat(
                                                                this.settings.layoutCollapsed ? 'collapsed' : 'expanded',
                                                                '"]'
                                                            )
                                                        )
                                                        .setAttribute('checked', 'checked'));
                                                var A = function (e) {
                                                    (window.Helpers.setCollapsed('collapsed' === e.target.value, !0),
                                                        t._setSetting('LayoutCollapsed', 'collapsed' === e.target.value));
                                                };
                                                (x.addEventListener('change', A), this._listeners.push([x, 'change', A]));
                                            } else C.parentNode.removeChild(C);
                                            var L = this.container.querySelector('.template-customizer-content');
                                            if (this._hasControls('contentLayout')) {
                                                var E = L.querySelector('.template-customizer-content-options');
                                                (this.settings.availableContentLayouts.forEach(function (t) {
                                                    var e = o(t.name, t.title, 'contentRadioIcon', t.image);
                                                    E.appendChild(e);
                                                }),
                                                    E.querySelector('input[value="'.concat(this.settings.contentLayout, '"]')).setAttribute(
                                                        'checked',
                                                        'checked'
                                                    ));
                                                var N = function (e) {
                                                    ((t._loading = !0),
                                                        t._loadingState(!0, !0),
                                                        t.setContentLayout(e.target.value, !0, function () {
                                                            ((t._loading = !1), t._loadingState(!1, !0));
                                                        }));
                                                };
                                                (E.addEventListener('change', N), this._listeners.push([E, 'change', N]));
                                            } else L.parentNode.removeChild(L);
                                            var T = this.container.querySelector('.template-customizer-headerOptions'),
                                                O = document.documentElement.getAttribute('data-template').split('-');
                                            if (this._hasControls('headerType')) {
                                                var D = T.querySelector('.template-customizer-header-options');
                                                (setTimeout(function () {
                                                    O.includes('vertical') && T.parentNode.removeChild(T);
                                                }, 100),
                                                    this.settings.availableHeaderTypes.forEach(function (t) {
                                                        var e = o(t.name, t.title, 'headerRadioIcon', t.image);
                                                        D.appendChild(e);
                                                    }),
                                                    D.querySelector('input[value="'.concat(this.settings.headerType, '"]')).setAttribute(
                                                        'checked',
                                                        'checked'
                                                    ));
                                                var q = function (e) {
                                                    t.setHeaderType(e.target.value);
                                                };
                                                (D.addEventListener('change', q), this._listeners.push([D, 'change', q]));
                                            } else T.parentNode.removeChild(T);
                                            var H = this.container.querySelector('.template-customizer-layoutNavbarOptions');
                                            if (this._hasControls('layoutNavbarOptions')) {
                                                setTimeout(function () {
                                                    O.includes('horizontal') && H.parentNode.removeChild(H);
                                                }, 100);
                                                var I = H.querySelector('.template-customizer-navbar-options');
                                                (this.settings.availableNavbarOptions.forEach(function (t) {
                                                    var e = o(t.name, t.title, 'navbarOptionRadios', t.image);
                                                    I.appendChild(e);
                                                }),
                                                    I.querySelector(
                                                        'input[value="'.concat(this.settings.layoutNavbarOptions, '"]')
                                                    ).setAttribute('checked', 'checked'));
                                                var F = function (e) {
                                                    ((t._loading = !0),
                                                        t._loadingState(!0, !0),
                                                        t.setLayoutNavbarOption(e.target.value, !0, function () {
                                                            ((t._loading = !1), t._loadingState(!1, !0));
                                                        }));
                                                };
                                                (I.addEventListener('change', F), this._listeners.push([I, 'change', F]));
                                            } else H.parentNode.removeChild(H);
                                            var B = this.container.querySelector('.template-customizer-directions');
                                            if (this._hasControls('rtl')) {
                                                var M = B.querySelector('.template-customizer-directions-options');
                                                (this.settings.availableDirections.forEach(function (t) {
                                                    var e = o(t.name, t.title, 'directionRadioIcon', t.image);
                                                    M.appendChild(e);
                                                }),
                                                    M.querySelector(
                                                        'input[value="'.concat(this.settings.rtl ? 'rtl' : 'ltr', '"]')
                                                    ).setAttribute('checked', 'checked'));
                                                var P = function (e) {
                                                    (t._setSetting('Lang', t.settings.lang),
                                                        t._setSetting('Lang', 'ar' === t.settings.lang ? 'en' : 'ar'),
                                                        (t.settings.rtl = 'rtl' === e.target.value));
                                                    var o = t._getSetting('Lang'),
                                                        i = document.querySelector('.dropdown-language .dropdown-menu');
                                                    (i && i.querySelector('[data-language="'.concat(o, '"]')).click(),
                                                        t._initDirection(),
                                                        t.setRtl('rtl' === e.target.value, !0, function () {
                                                            t._loadingState(!1);
                                                        }));
                                                };
                                                (M.addEventListener('change', P), this._listeners.push([M, 'change', P]));
                                            } else B.parentNode.removeChild(B);
                                        } else w.parentNode.removeChild(w);
                                        (setTimeout(function () {
                                            var e = t.container.querySelector('.template-customizer-layout'),
                                                o = t.container.querySelector('.template-customizer-theming'),
                                                i = !1;
                                            ('light' === document.documentElement.getAttribute('data-bs-theme') &&
                                                document.querySelector('.layout-menu') &&
                                                ('dark' === document.querySelector('.layout-menu').getAttribute('data-bs-theme') &&
                                                    (i = !0),
                                                !0 === i &&
                                                    o
                                                        .querySelector('.template-customizer-semi-dark-switch')
                                                        .setAttribute('checked', 'checked')),
                                                document.querySelector('.menu-vertical')
                                                    ? t._hasControls('rtl contentLayout layoutCollapsed layoutNavbarOptions', !0) ||
                                                      (e && e.parentNode.removeChild(e))
                                                    : document.querySelector('.menu-horizontal') &&
                                                      (t._hasControls('rtl contentLayout headerType', !0) ||
                                                          (e && e.parentNode.removeChild(e))));
                                        }, 100),
                                            this.setLang(this.settings.lang, !1, !0),
                                            e === document
                                                ? e.body
                                                    ? e.body.appendChild(this.container)
                                                    : window.addEventListener('DOMContentLoaded', function () {
                                                          return e.body.appendChild(t.container);
                                                      })
                                                : e.appendChild(this.container));
                                    },
                                },
                                {
                                    key: '_initDirection',
                                    value: function () {
                                        document.documentElement.lang =
                                            localStorage.getItem('templateCustomizer-' + window.templateName + '--Lang') || 'en';
                                        this._hasControls('rtl') &&
                                            document.documentElement.setAttribute('dir', this.settings.rtl ? 'rtl' : 'ltr');
                                    },
                                },
                                {
                                    key: '_loadingState',
                                    value: function (t, e) {
                                        this.container.classList[t ? 'add' : 'remove'](
                                            'template-customizer-loading'.concat(e ? '-theme' : '')
                                        );
                                    },
                                },
                                {
                                    key: '_getElementFromString',
                                    value: function (t) {
                                        var e = document.createElement('div');
                                        return ((e.innerHTML = t), e.firstChild);
                                    },
                                },
                                {
                                    key: '_setSetting',
                                    value: function (t, e) {
                                        var o = this._getLayoutName();
                                        try {
                                            (localStorage.setItem('templateCustomizer-'.concat(o, '--').concat(t), String(e)),
                                                this._showResetBtnNotification());
                                        } catch (t) {}
                                    },
                                },
                                {
                                    key: '_getSetting',
                                    value: function (t) {
                                        var e = null,
                                            o = this._getLayoutName();
                                        try {
                                            e = localStorage.getItem('templateCustomizer-'.concat(o, '--').concat(t));
                                        } catch (t) {}
                                        return String(e || '');
                                    },
                                },
                                {
                                    key: '_showResetBtnNotification',
                                    value: function () {
                                        var t = this,
                                            e = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0];
                                        setTimeout(function () {
                                            var o = t.container.querySelector('.template-customizer-reset-btn .badge');
                                            e ? o.classList.remove('d-none') : o.classList.add('d-none');
                                        }, 200);
                                    },
                                },
                                {
                                    key: '_getLayoutName',
                                    value: function () {
                                        return document.getElementsByTagName('HTML')[0].getAttribute('data-template');
                                    },
                                },
                                {
                                    key: '_removeListeners',
                                    value: function () {
                                        for (var t = 0, e = this._listeners.length; t < e; t++)
                                            this._listeners[t][0].removeEventListener(this._listeners[t][1], this._listeners[t][2]);
                                    },
                                },
                                {
                                    key: '_cleanup',
                                    value: function () {
                                        (this._removeListeners(),
                                            (this._listeners = []),
                                            (this._controls = {}),
                                            this._updateInterval && (clearInterval(this._updateInterval), (this._updateInterval = null)));
                                    },
                                },
                                {
                                    key: '_ssr',
                                    get: function () {
                                        return 'undefined' == typeof window;
                                    },
                                },
                                {
                                    key: '_hasControls',
                                    value: function (t) {
                                        var e = this,
                                            o = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                                        return t.split(' ').reduce(function (t, i) {
                                            return (
                                                -1 !== e.settings.controls.indexOf(i)
                                                    ? (o || !1 !== t) && (t = !0)
                                                    : (o && !0 === t) || (t = !1),
                                                t
                                            );
                                        }, null);
                                    },
                                },
                                {
                                    key: '_getDefaultSkin',
                                    value: function (t) {
                                        var e = 'string' == typeof t ? this._getSkinByName(t, !1) : this.settings.availableSkins[t];
                                        if (!e) throw new Error('Skin ID "'.concat(t, '" not found!'));
                                        return e;
                                    },
                                },
                                {
                                    key: '_getSkinByName',
                                    value: function (t) {
                                        for (
                                            var e = arguments.length > 1 && void 0 !== arguments[1] && arguments[1],
                                                o = this.settings.availableSkins,
                                                i = 0,
                                                n = o.length;
                                            i < n;
                                            i++
                                        )
                                            if (o[i].name === t) return o[i];
                                        return e ? this.settings.defaultSkin : null;
                                    },
                                },
                            ]),
                            o && b(e.prototype, o),
                            i && b(e, i),
                            Object.defineProperty(e, 'prototype', { writable: !1 }),
                            e
                        );
                        var e, o, i;
                    })();
                ((D.COLORS = [
                    {
                        name: 'primary',
                        title: 'Primary',
                        color: O.getPropertyValue('--ky-primary').trim(),
                    },
                    { name: 'success', title: 'Success', color: '#0D9394' },
                    { name: 'warning', title: 'Warning', color: '#FFAB1D' },
                    { name: 'danger', title: 'Danger', color: '#EB3D63' },
                    { name: 'info', title: 'Info', color: '#2092EC' },
                ]),
                    (D.THEMES = [
                        {
                            name: 'light',
                            title: 'Light',
                            image: '<i class="icon-base fa-solid fa-sun mb-0"></i>',
                        },
                        {
                            name: 'dark',
                            title: 'Dark',
                            image: '<i class="icon-base fa-solid fa-moon mb-0"></i>',
                        },
                        {
                            name: 'system',
                            title: 'System',
                            image: '<i class="icon-base fa-solid fa-gears mb-0"></i>',
                        },
                    ]),
                    (D.SKINS = [
                        { name: 'default', title: 'Default', image: 'skin-default.svg' },
                        { name: 'bordered', title: 'Bordered', image: 'skin-border.svg' },
                    ]),
                    (D.LAYOUTS = [
                        {
                            name: 'expanded',
                            title: 'Expanded',
                            image: 'layouts-expanded.svg',
                        },
                        {
                            name: 'collapsed',
                            title: 'Collapsed',
                            image: 'layouts-collapsed.svg',
                        },
                    ]),
                    (D.NAVBAR_OPTIONS = [
                        { name: 'sticky', title: 'Sticky', image: 'navbar-sticky.svg' },
                        { name: 'static', title: 'Static', image: 'navbar-static.svg' },
                        { name: 'hidden', title: 'Hidden', image: 'navbar-hidden.svg' },
                    ]),
                    (D.HEADER_TYPES = [
                        { name: 'fixed', title: 'Fixed', image: 'horizontal-fixed.svg' },
                        { name: 'static', title: 'Static', image: 'horizontal-static.svg' },
                    ]),
                    (D.CONTENT = [
                        { name: 'compact', title: 'Compact', image: 'content-compact.svg' },
                        { name: 'wide', title: 'Wide', image: 'content-wide.svg' },
                    ]),
                    (D.DIRECTIONS = [
                        {
                            name: 'ltr',
                            title: 'Left to Right (En)',
                            image: 'direction-ltr.svg',
                        },
                        {
                            name: 'rtl',
                            title: 'Right to Left (Ar)',
                            image: 'direction-rtl.svg',
                        },
                    ]),
                    (D.LANGUAGES = {
                        en: {
                            panel_header: 'Template Customizer',
                            panel_sub_header: 'Customize and preview in real time',
                            theming_header: 'Theming',
                            color_label: 'Primary Color',
                            theme_label: 'Theme',
                            skin_label: 'Skins',
                            semiDark_label: 'Semi Dark',
                            layout_header: 'Layout',
                            layout_label: 'Menu (Navigation)',
                            layout_header_label: 'Header Types',
                            content_label: 'Content',
                            layout_navbar_label: 'Navbar Type',
                            direction_label: 'Direction',
                        },
                        fr: {
                            panel_header: 'Modèle De Personnalisation',
                            panel_sub_header: 'Personnalisez et prévisualisez en temps réel',
                            theming_header: 'Thématisation',
                            color_label: 'Couleur primaire',
                            theme_label: 'Thème',
                            skin_label: 'Peaux',
                            semiDark_label: 'Demi-foncé',
                            layout_header: 'Disposition',
                            layout_label: 'Menu (Navigation)',
                            layout_header_label: "Types d'en-tête",
                            content_label: 'Contenu',
                            layout_navbar_label: 'Type de barre de navigation',
                            direction_label: 'Direction',
                        },
                        ar: {
                            panel_header: 'أداة تخصيص القالب',
                            panel_sub_header: 'تخصيص ومعاينة في الوقت الحقيقي',
                            theming_header: 'السمات',
                            color_label: 'اللون الأساسي',
                            theme_label: 'سمة',
                            skin_label: 'جلود',
                            semiDark_label: 'شبه داكن',
                            layout_header: 'تَخطِيط',
                            layout_label: 'القائمة (الملاحة)',
                            layout_header_label: 'أنواع الرأس',
                            content_label: 'محتوى',
                            layout_navbar_label: 'نوع شريط التنقل',
                            direction_label: 'اتجاه',
                        },
                        de: {
                            panel_header: 'Vorlagen-Anpasser',
                            panel_sub_header: 'Anpassen und Vorschau in Echtzeit',
                            theming_header: 'Themen',
                            color_label: 'Grundfarbe',
                            theme_label: 'Thema',
                            skin_label: 'Skins',
                            semiDark_label: 'Halbdunkel',
                            layout_header: 'Layout',
                            layout_label: 'Menü (Navigation)',
                            layout_header_label: 'Header-Typen',
                            content_label: 'Inhalt',
                            layout_navbar_label: 'Art der Navigationsleiste',
                            direction_label: 'Richtung',
                        },
                        id: {
                            panel_header: 'Penyesuai Template',
                            panel_sub_header: 'Sesuaikan dan pratinjau secara real-time',
                            theming_header: 'Tema',
                            color_label: 'Warna Utama',
                            theme_label: 'Tema',
                            skin_label: 'Kulit',
                            semiDark_label: 'Setengah Gelap',
                            layout_header: 'Tata Letak',
                            layout_label: 'Menu (Navigasi)',
                            layout_header_label: 'Jenis Header',
                            content_label: 'Konten',
                            layout_navbar_label: 'Jenis Navbar',
                            direction_label: 'Arah',
                        },
                        zh: {
                            panel_header: '模板定制器',
                            panel_sub_header: '实时定制和预览',
                            theming_header: '主题',
                            color_label: '主色',
                            theme_label: '主题',
                            skin_label: '皮肤',
                            semiDark_label: '半暗',
                            layout_header: '布局',
                            layout_label: '菜单（导航）',
                            layout_header_label: '头部类型',
                            content_label: '内容',
                            layout_navbar_label: '导航栏类型',
                            direction_label: '方向',
                        },
                    }),
                    (window.TemplateCustomizer = D));
                window.onload = function () {
                    !(function () {
                        var t = {
                            pickerWrapper: document.querySelector('.template-customizer-colors-options input[value="picker"]'),
                            pickerEl: document.querySelector('.customizer-nano-picker'),
                            pcrButton: document.querySelector('.custom-option-content .pcr-button'),
                        };
                        if (t.pickerWrapper && t.pickerEl) {
                            var e =
                                    'checked' === t.pickerWrapper.getAttribute('checked')
                                        ? window.templateCustomizer._getSetting('Color')
                                            ? window.templateCustomizer._getSetting('Color')
                                            : window.templateCustomizer.settings.defaultPrimaryColor
                                        : '#FF4961',
                                o = new Pickr({
                                    el: t.pickerEl,
                                    theme: 'nano',
                                    default: e,
                                    defaultRepresentation: 'HEX',
                                    comparison: !1,
                                    components: {
                                        hue: !0,
                                        preview: !0,
                                        interaction: { input: !0 },
                                    },
                                });
                            (o._root.button.classList.add('bx', 'bxs-color-fill'),
                                o.on('change', function (e) {
                                    var o,
                                        i = e.toHEXA().toString(),
                                        n = e.toRGBA().toString();
                                    (null === (o = t.pcrButton) || void 0 === o || o.style.setProperty('--pcr-color', n),
                                        (t.pickerWrapper.checked = !0),
                                        window.Helpers.updateCustomOptionCheck(t.pickerWrapper),
                                        window.templateCustomizer._setSetting('Color', i),
                                        window.templateCustomizer.setColor(i, !0));
                                }));
                        }
                    })();
                    var t = document.querySelector('.custom-option-content .pcr-button');
                    null == t || t.style.setProperty('--pcr-color', window.templateCustomizer.settings.defaultPrimaryColor);
                };
            })(),
            i
        );
    })();
});
