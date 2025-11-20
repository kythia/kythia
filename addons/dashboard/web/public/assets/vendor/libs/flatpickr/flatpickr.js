/**
 * @namespace: addons/dashboard/web/public/assets/vendor/libs/flatpickr/flatpickr.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

!(function (e, t) {
    if ('object' == typeof exports && 'object' == typeof module) module.exports = t();
    else if ('function' == typeof define && define.amd) define([], t);
    else {
        var n = t();
        for (var a in n) ('object' == typeof exports ? exports : e)[a] = n[a];
    }
})(self, function () {
    return (function () {
        var e = {
                4953: function (e) {
                    e.exports = (function () {
                        'use strict';
                        var e = function () {
                            return (
                                (e =
                                    Object.assign ||
                                    function (e) {
                                        for (var t, n = 1, a = arguments.length; n < a; n++)
                                            for (var i in (t = arguments[n])) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
                                        return e;
                                    }),
                                e.apply(this, arguments)
                            );
                        };
                        function t() {
                            for (var e = 0, t = 0, n = arguments.length; t < n; t++) e += arguments[t].length;
                            var a = Array(e),
                                i = 0;
                            for (t = 0; t < n; t++) for (var o = arguments[t], r = 0, l = o.length; r < l; r++, i++) a[i] = o[r];
                            return a;
                        }
                        var n = [
                                'onChange',
                                'onClose',
                                'onDayCreate',
                                'onDestroy',
                                'onKeyDown',
                                'onMonthChange',
                                'onOpen',
                                'onParseConfig',
                                'onReady',
                                'onValueUpdate',
                                'onYearChange',
                                'onPreCalendarPosition',
                            ],
                            a = {
                                _disable: [],
                                allowInput: !1,
                                allowInvalidPreload: !1,
                                altFormat: 'F j, Y',
                                altInput: !1,
                                altInputClass: 'form-control input',
                                animate: 'object' == typeof window && -1 === window.navigator.userAgent.indexOf('MSIE'),
                                ariaDateFormat: 'F j, Y',
                                autoFillDefaultTime: !0,
                                clickOpens: !0,
                                closeOnSelect: !0,
                                conjunction: ', ',
                                dateFormat: 'Y-m-d',
                                defaultHour: 12,
                                defaultMinute: 0,
                                defaultSeconds: 0,
                                disable: [],
                                disableMobile: !1,
                                enableSeconds: !1,
                                enableTime: !1,
                                errorHandler: function (e) {
                                    return 'undefined' != typeof console && void 0;
                                },
                                getWeek: function (e) {
                                    var t = new Date(e.getTime());
                                    (t.setHours(0, 0, 0, 0), t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7)));
                                    var n = new Date(t.getFullYear(), 0, 4);
                                    return 1 + Math.round(((t.getTime() - n.getTime()) / 864e5 - 3 + ((n.getDay() + 6) % 7)) / 7);
                                },
                                hourIncrement: 1,
                                ignoredFocusElements: [],
                                inline: !1,
                                locale: 'default',
                                minuteIncrement: 5,
                                mode: 'single',
                                monthSelectorType: 'dropdown',
                                nextArrow:
                                    "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M13.207 8.472l-7.854 7.854-0.707-0.707 7.146-7.146-7.146-7.148 0.707-0.707 7.854 7.854z' /></svg>",
                                noCalendar: !1,
                                now: new Date(),
                                onChange: [],
                                onClose: [],
                                onDayCreate: [],
                                onDestroy: [],
                                onKeyDown: [],
                                onMonthChange: [],
                                onOpen: [],
                                onParseConfig: [],
                                onReady: [],
                                onValueUpdate: [],
                                onYearChange: [],
                                onPreCalendarPosition: [],
                                plugins: [],
                                position: 'auto',
                                positionElement: void 0,
                                prevArrow:
                                    "<svg version='1.1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' viewBox='0 0 17 17'><g></g><path d='M5.207 8.471l7.146 7.147-0.707 0.707-7.853-7.854 7.854-7.853 0.707 0.707-7.147 7.146z' /></svg>",
                                shorthandCurrentMonth: !1,
                                showMonths: 1,
                                static: !1,
                                time_24hr: !1,
                                weekNumbers: !1,
                                wrap: !1,
                            },
                            i = {
                                weekdays: {
                                    shorthand: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                                    longhand: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                                },
                                months: {
                                    shorthand: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                    longhand: [
                                        'January',
                                        'February',
                                        'March',
                                        'April',
                                        'May',
                                        'June',
                                        'July',
                                        'August',
                                        'September',
                                        'October',
                                        'November',
                                        'December',
                                    ],
                                },
                                daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
                                firstDayOfWeek: 0,
                                ordinal: function (e) {
                                    var t = e % 100;
                                    if (t > 3 && t < 21) return 'th';
                                    switch (t % 10) {
                                        case 1:
                                            return 'st';
                                        case 2:
                                            return 'nd';
                                        case 3:
                                            return 'rd';
                                        default:
                                            return 'th';
                                    }
                                },
                                rangeSeparator: ' to ',
                                weekAbbreviation: 'Wk',
                                scrollTitle: 'Scroll to increment',
                                toggleTitle: 'Click to toggle',
                                amPM: ['AM', 'PM'],
                                yearAriaLabel: 'Year',
                                monthAriaLabel: 'Month',
                                hourAriaLabel: 'Hour',
                                minuteAriaLabel: 'Minute',
                                time_24hr: !1,
                            },
                            o = function (e, t) {
                                return (void 0 === t && (t = 2), ('000' + e).slice(-1 * t));
                            },
                            r = function (e) {
                                return !0 === e ? 1 : 0;
                            };
                        function l(e, t) {
                            var n;
                            return function () {
                                var a = this,
                                    i = arguments;
                                (clearTimeout(n),
                                    (n = setTimeout(function () {
                                        return e.apply(a, i);
                                    }, t)));
                            };
                        }
                        var c = function (e) {
                            return e instanceof Array ? e : [e];
                        };
                        function s(e, t, n) {
                            if (!0 === n) return e.classList.add(t);
                            e.classList.remove(t);
                        }
                        function d(e, t, n) {
                            var a = window.document.createElement(e);
                            return ((t = t || ''), (n = n || ''), (a.className = t), void 0 !== n && (a.textContent = n), a);
                        }
                        function u(e) {
                            for (; e.firstChild; ) e.removeChild(e.firstChild);
                        }
                        function f(e, t) {
                            return t(e) ? e : e.parentNode ? f(e.parentNode, t) : void 0;
                        }
                        function m(e, t) {
                            var n = d('div', 'numInputWrapper'),
                                a = d('input', 'numInput ' + e),
                                i = d('span', 'arrowUp'),
                                o = d('span', 'arrowDown');
                            if (
                                (-1 === navigator.userAgent.indexOf('MSIE 9.0')
                                    ? (a.type = 'number')
                                    : ((a.type = 'text'), (a.pattern = '\\d*')),
                                void 0 !== t)
                            )
                                for (var r in t) a.setAttribute(r, t[r]);
                            return (n.appendChild(a), n.appendChild(i), n.appendChild(o), n);
                        }
                        function g(e) {
                            try {
                                return 'function' == typeof e.composedPath ? e.composedPath()[0] : e.target;
                            } catch (t) {
                                return e.target;
                            }
                        }
                        var p = function () {},
                            h = function (e, t, n) {
                                return n.months[t ? 'shorthand' : 'longhand'][e];
                            },
                            v = {
                                D: p,
                                F: function (e, t, n) {
                                    e.setMonth(n.months.longhand.indexOf(t));
                                },
                                G: function (e, t) {
                                    e.setHours((e.getHours() >= 12 ? 12 : 0) + parseFloat(t));
                                },
                                H: function (e, t) {
                                    e.setHours(parseFloat(t));
                                },
                                J: function (e, t) {
                                    e.setDate(parseFloat(t));
                                },
                                K: function (e, t, n) {
                                    e.setHours((e.getHours() % 12) + 12 * r(new RegExp(n.amPM[1], 'i').test(t)));
                                },
                                M: function (e, t, n) {
                                    e.setMonth(n.months.shorthand.indexOf(t));
                                },
                                S: function (e, t) {
                                    e.setSeconds(parseFloat(t));
                                },
                                U: function (e, t) {
                                    return new Date(1e3 * parseFloat(t));
                                },
                                W: function (e, t, n) {
                                    var a = parseInt(t),
                                        i = new Date(e.getFullYear(), 0, 2 + 7 * (a - 1), 0, 0, 0, 0);
                                    return (i.setDate(i.getDate() - i.getDay() + n.firstDayOfWeek), i);
                                },
                                Y: function (e, t) {
                                    e.setFullYear(parseFloat(t));
                                },
                                Z: function (e, t) {
                                    return new Date(t);
                                },
                                d: function (e, t) {
                                    e.setDate(parseFloat(t));
                                },
                                h: function (e, t) {
                                    e.setHours((e.getHours() >= 12 ? 12 : 0) + parseFloat(t));
                                },
                                i: function (e, t) {
                                    e.setMinutes(parseFloat(t));
                                },
                                j: function (e, t) {
                                    e.setDate(parseFloat(t));
                                },
                                l: p,
                                m: function (e, t) {
                                    e.setMonth(parseFloat(t) - 1);
                                },
                                n: function (e, t) {
                                    e.setMonth(parseFloat(t) - 1);
                                },
                                s: function (e, t) {
                                    e.setSeconds(parseFloat(t));
                                },
                                u: function (e, t) {
                                    return new Date(parseFloat(t));
                                },
                                w: p,
                                y: function (e, t) {
                                    e.setFullYear(2e3 + parseFloat(t));
                                },
                            },
                            D = {
                                D: '',
                                F: '',
                                G: '(\\d\\d|\\d)',
                                H: '(\\d\\d|\\d)',
                                J: '(\\d\\d|\\d)\\w+',
                                K: '',
                                M: '',
                                S: '(\\d\\d|\\d)',
                                U: '(.+)',
                                W: '(\\d\\d|\\d)',
                                Y: '(\\d{4})',
                                Z: '(.+)',
                                d: '(\\d\\d|\\d)',
                                h: '(\\d\\d|\\d)',
                                i: '(\\d\\d|\\d)',
                                j: '(\\d\\d|\\d)',
                                l: '',
                                m: '(\\d\\d|\\d)',
                                n: '(\\d\\d|\\d)',
                                s: '(\\d\\d|\\d)',
                                u: '(.+)',
                                w: '(\\d\\d|\\d)',
                                y: '(\\d{2})',
                            },
                            b = {
                                Z: function (e) {
                                    return e.toISOString();
                                },
                                D: function (e, t, n) {
                                    return t.weekdays.shorthand[b.w(e, t, n)];
                                },
                                F: function (e, t, n) {
                                    return h(b.n(e, t, n) - 1, !1, t);
                                },
                                G: function (e, t, n) {
                                    return o(b.h(e, t, n));
                                },
                                H: function (e) {
                                    return o(e.getHours());
                                },
                                J: function (e, t) {
                                    return void 0 !== t.ordinal ? e.getDate() + t.ordinal(e.getDate()) : e.getDate();
                                },
                                K: function (e, t) {
                                    return t.amPM[r(e.getHours() > 11)];
                                },
                                M: function (e, t) {
                                    return h(e.getMonth(), !0, t);
                                },
                                S: function (e) {
                                    return o(e.getSeconds());
                                },
                                U: function (e) {
                                    return e.getTime() / 1e3;
                                },
                                W: function (e, t, n) {
                                    return n.getWeek(e);
                                },
                                Y: function (e) {
                                    return o(e.getFullYear(), 4);
                                },
                                d: function (e) {
                                    return o(e.getDate());
                                },
                                h: function (e) {
                                    return e.getHours() % 12 ? e.getHours() % 12 : 12;
                                },
                                i: function (e) {
                                    return o(e.getMinutes());
                                },
                                j: function (e) {
                                    return e.getDate();
                                },
                                l: function (e, t) {
                                    return t.weekdays.longhand[e.getDay()];
                                },
                                m: function (e) {
                                    return o(e.getMonth() + 1);
                                },
                                n: function (e) {
                                    return e.getMonth() + 1;
                                },
                                s: function (e) {
                                    return e.getSeconds();
                                },
                                u: function (e) {
                                    return e.getTime();
                                },
                                w: function (e) {
                                    return e.getDay();
                                },
                                y: function (e) {
                                    return String(e.getFullYear()).substring(2);
                                },
                            },
                            w = function (e) {
                                var t = e.config,
                                    n = void 0 === t ? a : t,
                                    o = e.l10n,
                                    r = void 0 === o ? i : o,
                                    l = e.isMobile,
                                    c = void 0 !== l && l;
                                return function (e, t, a) {
                                    var i = a || r;
                                    return void 0 === n.formatDate || c
                                        ? t
                                              .split('')
                                              .map(function (t, a, o) {
                                                  return b[t] && '\\' !== o[a - 1] ? b[t](e, i, n) : '\\' !== t ? t : '';
                                              })
                                              .join('')
                                        : n.formatDate(e, t, i);
                                };
                            },
                            y = function (e) {
                                var t = e.config,
                                    n = void 0 === t ? a : t,
                                    o = e.l10n,
                                    r = void 0 === o ? i : o;
                                return function (e, t, i, o) {
                                    if (0 === e || e) {
                                        var l,
                                            c = o || r,
                                            s = e;
                                        if (e instanceof Date) l = new Date(e.getTime());
                                        else if ('string' != typeof e && void 0 !== e.toFixed) l = new Date(e);
                                        else if ('string' == typeof e) {
                                            var d = t || (n || a).dateFormat,
                                                u = String(e).trim();
                                            if ('today' === u) ((l = new Date()), (i = !0));
                                            else if (n && n.parseDate) l = n.parseDate(e, d);
                                            else if (/Z$/.test(u) || /GMT$/.test(u)) l = new Date(e);
                                            else {
                                                for (var f = void 0, m = [], g = 0, p = 0, h = ''; g < d.length; g++) {
                                                    var b = d[g],
                                                        w = '\\' === b,
                                                        y = '\\' === d[g - 1] || w;
                                                    if (D[b] && !y) {
                                                        h += D[b];
                                                        var C = new RegExp(h).exec(e);
                                                        C && (f = !0) && m['Y' !== b ? 'push' : 'unshift']({ fn: v[b], val: C[++p] });
                                                    } else w || (h += '.');
                                                }
                                                ((l =
                                                    n && n.noCalendar
                                                        ? new Date(new Date().setHours(0, 0, 0, 0))
                                                        : new Date(new Date().getFullYear(), 0, 1, 0, 0, 0, 0)),
                                                    m.forEach(function (e) {
                                                        var t = e.fn,
                                                            n = e.val;
                                                        return (l = t(l, n, c) || l);
                                                    }),
                                                    (l = f ? l : void 0));
                                            }
                                        }
                                        if (l instanceof Date && !isNaN(l.getTime())) return (!0 === i && l.setHours(0, 0, 0, 0), l);
                                        n.errorHandler(new Error('Invalid date provided: ' + s));
                                    }
                                };
                            };
                        function C(e, t, n) {
                            return (
                                void 0 === n && (n = !0),
                                !1 !== n
                                    ? new Date(e.getTime()).setHours(0, 0, 0, 0) - new Date(t.getTime()).setHours(0, 0, 0, 0)
                                    : e.getTime() - t.getTime()
                            );
                        }
                        var M = function (e, t, n) {
                                return e > Math.min(t, n) && e < Math.max(t, n);
                            },
                            x = function (e, t, n) {
                                return 3600 * e + 60 * t + n;
                            },
                            E = function (e) {
                                var t = Math.floor(e / 3600),
                                    n = (e - 3600 * t) / 60;
                                return [t, n, e - 3600 * t - 60 * n];
                            },
                            k = { DAY: 864e5 };
                        function T(e) {
                            var t = e.defaultHour,
                                n = e.defaultMinute,
                                a = e.defaultSeconds;
                            if (void 0 !== e.minDate) {
                                var i = e.minDate.getHours(),
                                    o = e.minDate.getMinutes(),
                                    r = e.minDate.getSeconds();
                                (t < i && (t = i),
                                    t === i && n < o && (n = o),
                                    t === i && n === o && a < r && (a = e.minDate.getSeconds()));
                            }
                            if (void 0 !== e.maxDate) {
                                var l = e.maxDate.getHours(),
                                    c = e.maxDate.getMinutes();
                                ((t = Math.min(t, l)) === l && (n = Math.min(c, n)), t === l && n === c && (a = e.maxDate.getSeconds()));
                            }
                            return { hours: t, minutes: n, seconds: a };
                        }
                        'function' != typeof Object.assign &&
                            (Object.assign = function (e) {
                                for (var t = [], n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
                                if (!e) throw TypeError('Cannot convert undefined or null to object');
                                for (
                                    var a = function (t) {
                                            t &&
                                                Object.keys(t).forEach(function (n) {
                                                    return (e[n] = t[n]);
                                                });
                                        },
                                        i = 0,
                                        o = t;
                                    i < o.length;
                                    i++
                                )
                                    a(o[i]);
                                return e;
                            });
                        var S = 300;
                        function I(p, v) {
                            var b = { config: e(e({}, a), O.defaultConfig), l10n: i };
                            function I() {
                                b.utils = {
                                    getDaysInMonth: function (e, t) {
                                        return (
                                            void 0 === e && (e = b.currentMonth),
                                            void 0 === t && (t = b.currentYear),
                                            1 === e && ((t % 4 == 0 && t % 100 != 0) || t % 400 == 0) ? 29 : b.l10n.daysInMonth[e]
                                        );
                                    },
                                };
                            }
                            function _() {
                                ((b.element = b.input = p),
                                    (b.isOpen = !1),
                                    Ee(),
                                    Te(),
                                    Re(),
                                    Le(),
                                    I(),
                                    b.isMobile || V(),
                                    K(),
                                    (b.selectedDates.length || b.config.noCalendar) &&
                                        (b.config.enableTime && L(b.config.noCalendar ? b.latestSelectedDateObj : void 0), Ge(!1)),
                                    N());
                                var e = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                                (!b.isMobile && e && Se(), Ke('onReady'));
                            }
                            function F() {
                                var e;
                                return (
                                    (null === (e = b.calendarContainer) || void 0 === e ? void 0 : e.getRootNode()).activeElement ||
                                    document.activeElement
                                );
                            }
                            function A(e) {
                                return e.bind(b);
                            }
                            function N() {
                                var e = b.config;
                                (!1 === e.weekNumbers && 1 === e.showMonths) ||
                                    (!0 !== e.noCalendar &&
                                        window.requestAnimationFrame(function () {
                                            if (
                                                (void 0 !== b.calendarContainer &&
                                                    ((b.calendarContainer.style.visibility = 'hidden'),
                                                    (b.calendarContainer.style.display = 'block')),
                                                void 0 !== b.daysContainer)
                                            ) {
                                                var t = (b.days.offsetWidth + 1) * e.showMonths;
                                                ((b.daysContainer.style.width = t + 'px'),
                                                    (b.calendarContainer.style.width =
                                                        t + (void 0 !== b.weekWrapper ? b.weekWrapper.offsetWidth : 0) + 'px'),
                                                    b.calendarContainer.style.removeProperty('visibility'),
                                                    b.calendarContainer.style.removeProperty('display'));
                                            }
                                        }));
                            }
                            function P(e) {
                                if (0 === b.selectedDates.length) {
                                    var t =
                                            void 0 === b.config.minDate || C(new Date(), b.config.minDate) >= 0
                                                ? new Date()
                                                : new Date(b.config.minDate.getTime()),
                                        n = T(b.config);
                                    (t.setHours(n.hours, n.minutes, n.seconds, t.getMilliseconds()),
                                        (b.selectedDates = [t]),
                                        (b.latestSelectedDateObj = t));
                                }
                                void 0 !== e && 'blur' !== e.type && Qe(e);
                                var a = b._input.value;
                                (H(), Ge(), b._input.value !== a && b._debouncedChange());
                            }
                            function Y(e, t) {
                                return (e % 12) + 12 * r(t === b.l10n.amPM[1]);
                            }
                            function j(e) {
                                switch (e % 24) {
                                    case 0:
                                    case 12:
                                        return 12;
                                    default:
                                        return e % 12;
                                }
                            }
                            function H() {
                                if (void 0 !== b.hourElement && void 0 !== b.minuteElement) {
                                    var e = (parseInt(b.hourElement.value.slice(-2), 10) || 0) % 24,
                                        t = (parseInt(b.minuteElement.value, 10) || 0) % 60,
                                        n = void 0 !== b.secondElement ? (parseInt(b.secondElement.value, 10) || 0) % 60 : 0;
                                    void 0 !== b.amPM && (e = Y(e, b.amPM.textContent));
                                    var a =
                                            void 0 !== b.config.minTime ||
                                            (b.config.minDate &&
                                                b.minDateHasTime &&
                                                b.latestSelectedDateObj &&
                                                0 === C(b.latestSelectedDateObj, b.config.minDate, !0)),
                                        i =
                                            void 0 !== b.config.maxTime ||
                                            (b.config.maxDate &&
                                                b.maxDateHasTime &&
                                                b.latestSelectedDateObj &&
                                                0 === C(b.latestSelectedDateObj, b.config.maxDate, !0));
                                    if (void 0 !== b.config.maxTime && void 0 !== b.config.minTime && b.config.minTime > b.config.maxTime) {
                                        var o = x(
                                                b.config.minTime.getHours(),
                                                b.config.minTime.getMinutes(),
                                                b.config.minTime.getSeconds()
                                            ),
                                            r = x(
                                                b.config.maxTime.getHours(),
                                                b.config.maxTime.getMinutes(),
                                                b.config.maxTime.getSeconds()
                                            ),
                                            l = x(e, t, n);
                                        if (l > r && l < o) {
                                            var c = E(o);
                                            ((e = c[0]), (t = c[1]), (n = c[2]));
                                        }
                                    } else {
                                        if (i) {
                                            var s = void 0 !== b.config.maxTime ? b.config.maxTime : b.config.maxDate;
                                            ((e = Math.min(e, s.getHours())) === s.getHours() && (t = Math.min(t, s.getMinutes())),
                                                t === s.getMinutes() && (n = Math.min(n, s.getSeconds())));
                                        }
                                        if (a) {
                                            var d = void 0 !== b.config.minTime ? b.config.minTime : b.config.minDate;
                                            ((e = Math.max(e, d.getHours())) === d.getHours() && t < d.getMinutes() && (t = d.getMinutes()),
                                                t === d.getMinutes() && (n = Math.max(n, d.getSeconds())));
                                        }
                                    }
                                    R(e, t, n);
                                }
                            }
                            function L(e) {
                                var t = e || b.latestSelectedDateObj;
                                t && t instanceof Date && R(t.getHours(), t.getMinutes(), t.getSeconds());
                            }
                            function R(e, t, n) {
                                (void 0 !== b.latestSelectedDateObj && b.latestSelectedDateObj.setHours(e % 24, t, n || 0, 0),
                                    b.hourElement &&
                                        b.minuteElement &&
                                        !b.isMobile &&
                                        ((b.hourElement.value = o(b.config.time_24hr ? e : ((12 + e) % 12) + 12 * r(e % 12 == 0))),
                                        (b.minuteElement.value = o(t)),
                                        void 0 !== b.amPM && (b.amPM.textContent = b.l10n.amPM[r(e >= 12)]),
                                        void 0 !== b.secondElement && (b.secondElement.value = o(n))));
                            }
                            function W(e) {
                                var t = g(e),
                                    n = parseInt(t.value) + (e.delta || 0);
                                (n / 1e3 > 1 || ('Enter' === e.key && !/[^\d]/.test(n.toString()))) && he(n);
                            }
                            function B(e, t, n, a) {
                                return t instanceof Array
                                    ? t.forEach(function (t) {
                                          return B(e, t, n, a);
                                      })
                                    : e instanceof Array
                                      ? e.forEach(function (e) {
                                            return B(e, t, n, a);
                                        })
                                      : (e.addEventListener(t, n, a),
                                        void b._handlers.push({
                                            remove: function () {
                                                return e.removeEventListener(t, n, a);
                                            },
                                        }));
                            }
                            function J() {
                                Ke('onChange');
                            }
                            function K() {
                                if (
                                    (b.config.wrap &&
                                        ['open', 'close', 'toggle', 'clear'].forEach(function (e) {
                                            Array.prototype.forEach.call(b.element.querySelectorAll('[data-' + e + ']'), function (t) {
                                                return B(t, 'click', b[e]);
                                            });
                                        }),
                                    b.isMobile)
                                )
                                    Be();
                                else {
                                    var e = l(Ce, 50);
                                    if (
                                        ((b._debouncedChange = l(J, S)),
                                        b.daysContainer &&
                                            !/iPhone|iPad|iPod/i.test(navigator.userAgent) &&
                                            B(b.daysContainer, 'mouseover', function (e) {
                                                'range' === b.config.mode && ye(g(e));
                                            }),
                                        B(b._input, 'keydown', we),
                                        void 0 !== b.calendarContainer && B(b.calendarContainer, 'keydown', we),
                                        b.config.inline || b.config.static || B(window, 'resize', e),
                                        void 0 !== window.ontouchstart
                                            ? B(window.document, 'touchstart', pe)
                                            : B(window.document, 'mousedown', pe),
                                        B(window.document, 'focus', pe, { capture: !0 }),
                                        !0 === b.config.clickOpens && (B(b._input, 'focus', b.open), B(b._input, 'click', b.open)),
                                        void 0 !== b.daysContainer &&
                                            (B(b.monthNav, 'click', Ze),
                                            B(b.monthNav, ['keyup', 'increment'], W),
                                            B(b.daysContainer, 'click', Ae)),
                                        void 0 !== b.timeContainer && void 0 !== b.minuteElement && void 0 !== b.hourElement)
                                    ) {
                                        var t = function (e) {
                                            return g(e).select();
                                        };
                                        (B(b.timeContainer, ['increment'], P),
                                            B(b.timeContainer, 'blur', P, { capture: !0 }),
                                            B(b.timeContainer, 'click', q),
                                            B([b.hourElement, b.minuteElement], ['focus', 'click'], t),
                                            void 0 !== b.secondElement &&
                                                B(b.secondElement, 'focus', function () {
                                                    return b.secondElement && b.secondElement.select();
                                                }),
                                            void 0 !== b.amPM &&
                                                B(b.amPM, 'click', function (e) {
                                                    P(e);
                                                }));
                                    }
                                    b.config.allowInput && B(b._input, 'blur', be);
                                }
                            }
                            function U(e, t) {
                                var n =
                                        void 0 !== e
                                            ? b.parseDate(e)
                                            : b.latestSelectedDateObj ||
                                              (b.config.minDate && b.config.minDate > b.now
                                                  ? b.config.minDate
                                                  : b.config.maxDate && b.config.maxDate < b.now
                                                    ? b.config.maxDate
                                                    : b.now),
                                    a = b.currentYear,
                                    i = b.currentMonth;
                                try {
                                    void 0 !== n && ((b.currentYear = n.getFullYear()), (b.currentMonth = n.getMonth()));
                                } catch (e) {
                                    ((e.message = 'Invalid date supplied: ' + n), b.config.errorHandler(e));
                                }
                                (t && b.currentYear !== a && (Ke('onYearChange'), ne()),
                                    !t || (b.currentYear === a && b.currentMonth === i) || Ke('onMonthChange'),
                                    b.redraw());
                            }
                            function q(e) {
                                var t = g(e);
                                ~t.className.indexOf('arrow') && $(e, t.classList.contains('arrowUp') ? 1 : -1);
                            }
                            function $(e, t, n) {
                                var a = e && g(e),
                                    i = n || (a && a.parentNode && a.parentNode.firstChild),
                                    o = Ue('increment');
                                ((o.delta = t), i && i.dispatchEvent(o));
                            }
                            function V() {
                                var e = window.document.createDocumentFragment();
                                if (
                                    ((b.calendarContainer = d('div', 'flatpickr-calendar')),
                                    (b.calendarContainer.tabIndex = -1),
                                    !b.config.noCalendar)
                                ) {
                                    if (
                                        (e.appendChild(oe()),
                                        (b.innerContainer = d('div', 'flatpickr-innerContainer')),
                                        b.config.weekNumbers)
                                    ) {
                                        var t = se(),
                                            n = t.weekWrapper,
                                            a = t.weekNumbers;
                                        (b.innerContainer.appendChild(n), (b.weekNumbers = a), (b.weekWrapper = n));
                                    }
                                    ((b.rContainer = d('div', 'flatpickr-rContainer')),
                                        b.rContainer.appendChild(le()),
                                        b.daysContainer ||
                                            ((b.daysContainer = d('div', 'flatpickr-days')), (b.daysContainer.tabIndex = -1)),
                                        te(),
                                        b.rContainer.appendChild(b.daysContainer),
                                        b.innerContainer.appendChild(b.rContainer),
                                        e.appendChild(b.innerContainer));
                                }
                                (b.config.enableTime && e.appendChild(re()),
                                    s(b.calendarContainer, 'rangeMode', 'range' === b.config.mode),
                                    s(b.calendarContainer, 'animate', !0 === b.config.animate),
                                    s(b.calendarContainer, 'multiMonth', b.config.showMonths > 1),
                                    b.calendarContainer.appendChild(e));
                                var i = void 0 !== b.config.appendTo && void 0 !== b.config.appendTo.nodeType;
                                if (
                                    (b.config.inline || b.config.static) &&
                                    (b.calendarContainer.classList.add(b.config.inline ? 'inline' : 'static'),
                                    b.config.inline &&
                                        (!i && b.element.parentNode
                                            ? b.element.parentNode.insertBefore(b.calendarContainer, b._input.nextSibling)
                                            : void 0 !== b.config.appendTo && b.config.appendTo.appendChild(b.calendarContainer)),
                                    b.config.static)
                                ) {
                                    var o = d('div', 'flatpickr-wrapper');
                                    (b.element.parentNode && b.element.parentNode.insertBefore(o, b.element),
                                        o.appendChild(b.element),
                                        b.altInput && o.appendChild(b.altInput),
                                        o.appendChild(b.calendarContainer));
                                }
                                b.config.static ||
                                    b.config.inline ||
                                    (void 0 !== b.config.appendTo ? b.config.appendTo : window.document.body).appendChild(
                                        b.calendarContainer
                                    );
                            }
                            function z(e, t, n, a) {
                                var i = ve(t, !0),
                                    o = d('span', e, t.getDate().toString());
                                return (
                                    (o.dateObj = t),
                                    (o.$i = a),
                                    o.setAttribute('aria-label', b.formatDate(t, b.config.ariaDateFormat)),
                                    -1 === e.indexOf('hidden') &&
                                        0 === C(t, b.now) &&
                                        ((b.todayDateElem = o), o.classList.add('today'), o.setAttribute('aria-current', 'date')),
                                    i
                                        ? ((o.tabIndex = -1),
                                          qe(t) &&
                                              (o.classList.add('selected'),
                                              (b.selectedDateElem = o),
                                              'range' === b.config.mode &&
                                                  (s(o, 'startRange', b.selectedDates[0] && 0 === C(t, b.selectedDates[0], !0)),
                                                  s(o, 'endRange', b.selectedDates[1] && 0 === C(t, b.selectedDates[1], !0)),
                                                  'nextMonthDay' === e && o.classList.add('inRange'))))
                                        : o.classList.add('flatpickr-disabled'),
                                    'range' === b.config.mode && $e(t) && !qe(t) && o.classList.add('inRange'),
                                    b.weekNumbers &&
                                        1 === b.config.showMonths &&
                                        'prevMonthDay' !== e &&
                                        a % 7 == 6 &&
                                        b.weekNumbers.insertAdjacentHTML(
                                            'beforeend',
                                            "<span class='flatpickr-day'>" + b.config.getWeek(t) + '</span>'
                                        ),
                                    Ke('onDayCreate', o),
                                    o
                                );
                            }
                            function G(e) {
                                (e.focus(), 'range' === b.config.mode && ye(e));
                            }
                            function Z(e) {
                                for (
                                    var t = e > 0 ? 0 : b.config.showMonths - 1, n = e > 0 ? b.config.showMonths : -1, a = t;
                                    a != n;
                                    a += e
                                )
                                    for (
                                        var i = b.daysContainer.children[a],
                                            o = e > 0 ? 0 : i.children.length - 1,
                                            r = e > 0 ? i.children.length : -1,
                                            l = o;
                                        l != r;
                                        l += e
                                    ) {
                                        var c = i.children[l];
                                        if (-1 === c.className.indexOf('hidden') && ve(c.dateObj)) return c;
                                    }
                            }
                            function Q(e, t) {
                                for (
                                    var n = -1 === e.className.indexOf('Month') ? e.dateObj.getMonth() : b.currentMonth,
                                        a = t > 0 ? b.config.showMonths : -1,
                                        i = t > 0 ? 1 : -1,
                                        o = n - b.currentMonth;
                                    o != a;
                                    o += i
                                )
                                    for (
                                        var r = b.daysContainer.children[o],
                                            l = n - b.currentMonth === o ? e.$i + t : t < 0 ? r.children.length - 1 : 0,
                                            c = r.children.length,
                                            s = l;
                                        s >= 0 && s < c && s != (t > 0 ? c : -1);
                                        s += i
                                    ) {
                                        var d = r.children[s];
                                        if (-1 === d.className.indexOf('hidden') && ve(d.dateObj) && Math.abs(e.$i - s) >= Math.abs(t))
                                            return G(d);
                                    }
                                (b.changeMonth(i), X(Z(i), 0));
                            }
                            function X(e, t) {
                                var n = F(),
                                    a = De(n || document.body),
                                    i =
                                        void 0 !== e
                                            ? e
                                            : a
                                              ? n
                                              : void 0 !== b.selectedDateElem && De(b.selectedDateElem)
                                                ? b.selectedDateElem
                                                : void 0 !== b.todayDateElem && De(b.todayDateElem)
                                                  ? b.todayDateElem
                                                  : Z(t > 0 ? 1 : -1);
                                void 0 === i ? b._input.focus() : a ? Q(i, t) : G(i);
                            }
                            function ee(e, t) {
                                for (
                                    var n = (new Date(e, t, 1).getDay() - b.l10n.firstDayOfWeek + 7) % 7,
                                        a = b.utils.getDaysInMonth((t - 1 + 12) % 12, e),
                                        i = b.utils.getDaysInMonth(t, e),
                                        o = window.document.createDocumentFragment(),
                                        r = b.config.showMonths > 1,
                                        l = r ? 'prevMonthDay hidden' : 'prevMonthDay',
                                        c = r ? 'nextMonthDay hidden' : 'nextMonthDay',
                                        s = a + 1 - n,
                                        u = 0;
                                    s <= a;
                                    s++, u++
                                )
                                    o.appendChild(z('flatpickr-day ' + l, new Date(e, t - 1, s), s, u));
                                for (s = 1; s <= i; s++, u++) o.appendChild(z('flatpickr-day', new Date(e, t, s), s, u));
                                for (var f = i + 1; f <= 42 - n && (1 === b.config.showMonths || u % 7 != 0); f++, u++)
                                    o.appendChild(z('flatpickr-day ' + c, new Date(e, t + 1, f % i), f, u));
                                var m = d('div', 'dayContainer');
                                return (m.appendChild(o), m);
                            }
                            function te() {
                                if (void 0 !== b.daysContainer) {
                                    (u(b.daysContainer), b.weekNumbers && u(b.weekNumbers));
                                    for (var e = document.createDocumentFragment(), t = 0; t < b.config.showMonths; t++) {
                                        var n = new Date(b.currentYear, b.currentMonth, 1);
                                        (n.setMonth(b.currentMonth + t), e.appendChild(ee(n.getFullYear(), n.getMonth())));
                                    }
                                    (b.daysContainer.appendChild(e),
                                        (b.days = b.daysContainer.firstChild),
                                        'range' === b.config.mode && 1 === b.selectedDates.length && ye());
                                }
                            }
                            function ne() {
                                if (!(b.config.showMonths > 1 || 'dropdown' !== b.config.monthSelectorType)) {
                                    var e = function (e) {
                                        return !(
                                            (void 0 !== b.config.minDate &&
                                                b.currentYear === b.config.minDate.getFullYear() &&
                                                e < b.config.minDate.getMonth()) ||
                                            (void 0 !== b.config.maxDate &&
                                                b.currentYear === b.config.maxDate.getFullYear() &&
                                                e > b.config.maxDate.getMonth())
                                        );
                                    };
                                    ((b.monthsDropdownContainer.tabIndex = -1), (b.monthsDropdownContainer.innerHTML = ''));
                                    for (var t = 0; t < 12; t++)
                                        if (e(t)) {
                                            var n = d('option', 'flatpickr-monthDropdown-month');
                                            ((n.value = new Date(b.currentYear, t).getMonth().toString()),
                                                (n.textContent = h(t, b.config.shorthandCurrentMonth, b.l10n)),
                                                (n.tabIndex = -1),
                                                b.currentMonth === t && (n.selected = !0),
                                                b.monthsDropdownContainer.appendChild(n));
                                        }
                                }
                            }
                            function ae() {
                                var e,
                                    t = d('div', 'flatpickr-month'),
                                    n = window.document.createDocumentFragment();
                                b.config.showMonths > 1 || 'static' === b.config.monthSelectorType
                                    ? (e = d('span', 'cur-month'))
                                    : ((b.monthsDropdownContainer = d('select', 'flatpickr-monthDropdown-months')),
                                      b.monthsDropdownContainer.setAttribute('aria-label', b.l10n.monthAriaLabel),
                                      B(b.monthsDropdownContainer, 'change', function (e) {
                                          var t = g(e),
                                              n = parseInt(t.value, 10);
                                          (b.changeMonth(n - b.currentMonth), Ke('onMonthChange'));
                                      }),
                                      ne(),
                                      (e = b.monthsDropdownContainer));
                                var a = m('cur-year', { tabindex: '-1' }),
                                    i = a.getElementsByTagName('input')[0];
                                (i.setAttribute('aria-label', b.l10n.yearAriaLabel),
                                    b.config.minDate && i.setAttribute('min', b.config.minDate.getFullYear().toString()),
                                    b.config.maxDate &&
                                        (i.setAttribute('max', b.config.maxDate.getFullYear().toString()),
                                        (i.disabled =
                                            !!b.config.minDate && b.config.minDate.getFullYear() === b.config.maxDate.getFullYear())));
                                var o = d('div', 'flatpickr-current-month');
                                return (
                                    o.appendChild(e),
                                    o.appendChild(a),
                                    n.appendChild(o),
                                    t.appendChild(n),
                                    { container: t, yearElement: i, monthElement: e }
                                );
                            }
                            function ie() {
                                (u(b.monthNav),
                                    b.monthNav.appendChild(b.prevMonthNav),
                                    b.config.showMonths && ((b.yearElements = []), (b.monthElements = [])));
                                for (var e = b.config.showMonths; e--; ) {
                                    var t = ae();
                                    (b.yearElements.push(t.yearElement),
                                        b.monthElements.push(t.monthElement),
                                        b.monthNav.appendChild(t.container));
                                }
                                b.monthNav.appendChild(b.nextMonthNav);
                            }
                            function oe() {
                                return (
                                    (b.monthNav = d('div', 'flatpickr-months')),
                                    (b.yearElements = []),
                                    (b.monthElements = []),
                                    (b.prevMonthNav = d('span', 'flatpickr-prev-month')),
                                    (b.prevMonthNav.innerHTML = b.config.prevArrow),
                                    (b.nextMonthNav = d('span', 'flatpickr-next-month')),
                                    (b.nextMonthNav.innerHTML = b.config.nextArrow),
                                    ie(),
                                    Object.defineProperty(b, '_hidePrevMonthArrow', {
                                        get: function () {
                                            return b.__hidePrevMonthArrow;
                                        },
                                        set: function (e) {
                                            b.__hidePrevMonthArrow !== e &&
                                                (s(b.prevMonthNav, 'flatpickr-disabled', e), (b.__hidePrevMonthArrow = e));
                                        },
                                    }),
                                    Object.defineProperty(b, '_hideNextMonthArrow', {
                                        get: function () {
                                            return b.__hideNextMonthArrow;
                                        },
                                        set: function (e) {
                                            b.__hideNextMonthArrow !== e &&
                                                (s(b.nextMonthNav, 'flatpickr-disabled', e), (b.__hideNextMonthArrow = e));
                                        },
                                    }),
                                    (b.currentYearElement = b.yearElements[0]),
                                    Ve(),
                                    b.monthNav
                                );
                            }
                            function re() {
                                (b.calendarContainer.classList.add('hasTime'),
                                    b.config.noCalendar && b.calendarContainer.classList.add('noCalendar'));
                                var e = T(b.config);
                                ((b.timeContainer = d('div', 'flatpickr-time')), (b.timeContainer.tabIndex = -1));
                                var t = d('span', 'flatpickr-time-separator', ':'),
                                    n = m('flatpickr-hour', { 'aria-label': b.l10n.hourAriaLabel });
                                b.hourElement = n.getElementsByTagName('input')[0];
                                var a = m('flatpickr-minute', { 'aria-label': b.l10n.minuteAriaLabel });
                                if (
                                    ((b.minuteElement = a.getElementsByTagName('input')[0]),
                                    (b.hourElement.tabIndex = b.minuteElement.tabIndex = -1),
                                    (b.hourElement.value = o(
                                        b.latestSelectedDateObj
                                            ? b.latestSelectedDateObj.getHours()
                                            : b.config.time_24hr
                                              ? e.hours
                                              : j(e.hours)
                                    )),
                                    (b.minuteElement.value = o(b.latestSelectedDateObj ? b.latestSelectedDateObj.getMinutes() : e.minutes)),
                                    b.hourElement.setAttribute('step', b.config.hourIncrement.toString()),
                                    b.minuteElement.setAttribute('step', b.config.minuteIncrement.toString()),
                                    b.hourElement.setAttribute('min', b.config.time_24hr ? '0' : '1'),
                                    b.hourElement.setAttribute('max', b.config.time_24hr ? '23' : '12'),
                                    b.hourElement.setAttribute('maxlength', '2'),
                                    b.minuteElement.setAttribute('min', '0'),
                                    b.minuteElement.setAttribute('max', '59'),
                                    b.minuteElement.setAttribute('maxlength', '2'),
                                    b.timeContainer.appendChild(n),
                                    b.timeContainer.appendChild(t),
                                    b.timeContainer.appendChild(a),
                                    b.config.time_24hr && b.timeContainer.classList.add('time24hr'),
                                    b.config.enableSeconds)
                                ) {
                                    b.timeContainer.classList.add('hasSeconds');
                                    var i = m('flatpickr-second');
                                    ((b.secondElement = i.getElementsByTagName('input')[0]),
                                        (b.secondElement.value = o(
                                            b.latestSelectedDateObj ? b.latestSelectedDateObj.getSeconds() : e.seconds
                                        )),
                                        b.secondElement.setAttribute('step', b.minuteElement.getAttribute('step')),
                                        b.secondElement.setAttribute('min', '0'),
                                        b.secondElement.setAttribute('max', '59'),
                                        b.secondElement.setAttribute('maxlength', '2'),
                                        b.timeContainer.appendChild(d('span', 'flatpickr-time-separator', ':')),
                                        b.timeContainer.appendChild(i));
                                }
                                return (
                                    b.config.time_24hr ||
                                        ((b.amPM = d(
                                            'span',
                                            'flatpickr-am-pm',
                                            b.l10n.amPM[r((b.latestSelectedDateObj ? b.hourElement.value : b.config.defaultHour) > 11)]
                                        )),
                                        (b.amPM.title = b.l10n.toggleTitle),
                                        (b.amPM.tabIndex = -1),
                                        b.timeContainer.appendChild(b.amPM)),
                                    b.timeContainer
                                );
                            }
                            function le() {
                                b.weekdayContainer ? u(b.weekdayContainer) : (b.weekdayContainer = d('div', 'flatpickr-weekdays'));
                                for (var e = b.config.showMonths; e--; ) {
                                    var t = d('div', 'flatpickr-weekdaycontainer');
                                    b.weekdayContainer.appendChild(t);
                                }
                                return (ce(), b.weekdayContainer);
                            }
                            function ce() {
                                if (b.weekdayContainer) {
                                    var e = b.l10n.firstDayOfWeek,
                                        n = t(b.l10n.weekdays.shorthand);
                                    e > 0 && e < n.length && (n = t(n.splice(e, n.length), n.splice(0, e)));
                                    for (var a = b.config.showMonths; a--; )
                                        b.weekdayContainer.children[a].innerHTML =
                                            "\n      <span class='flatpickr-weekday'>\n        " +
                                            n.join("</span><span class='flatpickr-weekday'>") +
                                            '\n      </span>\n      ';
                                }
                            }
                            function se() {
                                b.calendarContainer.classList.add('hasWeeks');
                                var e = d('div', 'flatpickr-weekwrapper');
                                e.appendChild(d('span', 'flatpickr-weekday', b.l10n.weekAbbreviation));
                                var t = d('div', 'flatpickr-weeks');
                                return (e.appendChild(t), { weekWrapper: e, weekNumbers: t });
                            }
                            function de(e, t) {
                                void 0 === t && (t = !0);
                                var n = t ? e : e - b.currentMonth;
                                (n < 0 && !0 === b._hidePrevMonthArrow) ||
                                    (n > 0 && !0 === b._hideNextMonthArrow) ||
                                    ((b.currentMonth += n),
                                    (b.currentMonth < 0 || b.currentMonth > 11) &&
                                        ((b.currentYear += b.currentMonth > 11 ? 1 : -1),
                                        (b.currentMonth = (b.currentMonth + 12) % 12),
                                        Ke('onYearChange'),
                                        ne()),
                                    te(),
                                    Ke('onMonthChange'),
                                    Ve());
                            }
                            function ue(e, t) {
                                if (
                                    (void 0 === e && (e = !0),
                                    void 0 === t && (t = !0),
                                    (b.input.value = ''),
                                    void 0 !== b.altInput && (b.altInput.value = ''),
                                    void 0 !== b.mobileInput && (b.mobileInput.value = ''),
                                    (b.selectedDates = []),
                                    (b.latestSelectedDateObj = void 0),
                                    !0 === t &&
                                        ((b.currentYear = b._initialDate.getFullYear()), (b.currentMonth = b._initialDate.getMonth())),
                                    !0 === b.config.enableTime)
                                ) {
                                    var n = T(b.config);
                                    R(n.hours, n.minutes, n.seconds);
                                }
                                (b.redraw(), e && Ke('onChange'));
                            }
                            function fe() {
                                ((b.isOpen = !1),
                                    b.isMobile ||
                                        (void 0 !== b.calendarContainer && b.calendarContainer.classList.remove('open'),
                                        void 0 !== b._input && b._input.classList.remove('active')),
                                    Ke('onClose'));
                            }
                            function me() {
                                void 0 !== b.config && Ke('onDestroy');
                                for (var e = b._handlers.length; e--; ) b._handlers[e].remove();
                                if (((b._handlers = []), b.mobileInput))
                                    (b.mobileInput.parentNode && b.mobileInput.parentNode.removeChild(b.mobileInput),
                                        (b.mobileInput = void 0));
                                else if (b.calendarContainer && b.calendarContainer.parentNode)
                                    if (b.config.static && b.calendarContainer.parentNode) {
                                        var t = b.calendarContainer.parentNode;
                                        if ((t.lastChild && t.removeChild(t.lastChild), t.parentNode)) {
                                            for (; t.firstChild; ) t.parentNode.insertBefore(t.firstChild, t);
                                            t.parentNode.removeChild(t);
                                        }
                                    } else b.calendarContainer.parentNode.removeChild(b.calendarContainer);
                                (b.altInput &&
                                    ((b.input.type = 'text'),
                                    b.altInput.parentNode && b.altInput.parentNode.removeChild(b.altInput),
                                    delete b.altInput),
                                    b.input &&
                                        ((b.input.type = b.input._type),
                                        b.input.classList.remove('flatpickr-input'),
                                        b.input.removeAttribute('readonly')),
                                    [
                                        '_showTimeInput',
                                        'latestSelectedDateObj',
                                        '_hideNextMonthArrow',
                                        '_hidePrevMonthArrow',
                                        '__hideNextMonthArrow',
                                        '__hidePrevMonthArrow',
                                        'isMobile',
                                        'isOpen',
                                        'selectedDateElem',
                                        'minDateHasTime',
                                        'maxDateHasTime',
                                        'days',
                                        'daysContainer',
                                        '_input',
                                        '_positionElement',
                                        'innerContainer',
                                        'rContainer',
                                        'monthNav',
                                        'todayDateElem',
                                        'calendarContainer',
                                        'weekdayContainer',
                                        'prevMonthNav',
                                        'nextMonthNav',
                                        'monthsDropdownContainer',
                                        'currentMonthElement',
                                        'currentYearElement',
                                        'navigationCurrentMonth',
                                        'selectedDateElem',
                                        'config',
                                    ].forEach(function (e) {
                                        try {
                                            delete b[e];
                                        } catch (e) {}
                                    }));
                            }
                            function ge(e) {
                                return b.calendarContainer.contains(e);
                            }
                            function pe(e) {
                                if (b.isOpen && !b.config.inline) {
                                    var t = g(e),
                                        n = ge(t),
                                        a = !(
                                            t === b.input ||
                                            t === b.altInput ||
                                            b.element.contains(t) ||
                                            (e.path && e.path.indexOf && (~e.path.indexOf(b.input) || ~e.path.indexOf(b.altInput))) ||
                                            n ||
                                            ge(e.relatedTarget)
                                        ),
                                        i = !b.config.ignoredFocusElements.some(function (e) {
                                            return e.contains(t);
                                        });
                                    a &&
                                        i &&
                                        (b.config.allowInput &&
                                            b.setDate(b._input.value, !1, b.config.altInput ? b.config.altFormat : b.config.dateFormat),
                                        void 0 !== b.timeContainer &&
                                            void 0 !== b.minuteElement &&
                                            void 0 !== b.hourElement &&
                                            '' !== b.input.value &&
                                            void 0 !== b.input.value &&
                                            P(),
                                        b.close(),
                                        b.config && 'range' === b.config.mode && 1 === b.selectedDates.length && b.clear(!1));
                                }
                            }
                            function he(e) {
                                if (
                                    !(
                                        !e ||
                                        (b.config.minDate && e < b.config.minDate.getFullYear()) ||
                                        (b.config.maxDate && e > b.config.maxDate.getFullYear())
                                    )
                                ) {
                                    var t = e,
                                        n = b.currentYear !== t;
                                    ((b.currentYear = t || b.currentYear),
                                        b.config.maxDate && b.currentYear === b.config.maxDate.getFullYear()
                                            ? (b.currentMonth = Math.min(b.config.maxDate.getMonth(), b.currentMonth))
                                            : b.config.minDate &&
                                              b.currentYear === b.config.minDate.getFullYear() &&
                                              (b.currentMonth = Math.max(b.config.minDate.getMonth(), b.currentMonth)),
                                        n && (b.redraw(), Ke('onYearChange'), ne()));
                                }
                            }
                            function ve(e, t) {
                                var n;
                                void 0 === t && (t = !0);
                                var a = b.parseDate(e, void 0, t);
                                if (
                                    (b.config.minDate && a && C(a, b.config.minDate, void 0 !== t ? t : !b.minDateHasTime) < 0) ||
                                    (b.config.maxDate && a && C(a, b.config.maxDate, void 0 !== t ? t : !b.maxDateHasTime) > 0)
                                )
                                    return !1;
                                if (!b.config.enable && 0 === b.config.disable.length) return !0;
                                if (void 0 === a) return !1;
                                for (
                                    var i = !!b.config.enable,
                                        o = null !== (n = b.config.enable) && void 0 !== n ? n : b.config.disable,
                                        r = 0,
                                        l = void 0;
                                    r < o.length;
                                    r++
                                ) {
                                    if ('function' == typeof (l = o[r]) && l(a)) return i;
                                    if (l instanceof Date && void 0 !== a && l.getTime() === a.getTime()) return i;
                                    if ('string' == typeof l) {
                                        var c = b.parseDate(l, void 0, !0);
                                        return c && c.getTime() === a.getTime() ? i : !i;
                                    }
                                    if (
                                        'object' == typeof l &&
                                        void 0 !== a &&
                                        l.from &&
                                        l.to &&
                                        a.getTime() >= l.from.getTime() &&
                                        a.getTime() <= l.to.getTime()
                                    )
                                        return i;
                                }
                                return !i;
                            }
                            function De(e) {
                                return (
                                    void 0 !== b.daysContainer &&
                                    -1 === e.className.indexOf('hidden') &&
                                    -1 === e.className.indexOf('flatpickr-disabled') &&
                                    b.daysContainer.contains(e)
                                );
                            }
                            function be(e) {
                                var t = e.target === b._input,
                                    n = b._input.value.trimEnd() !== ze();
                                !t ||
                                    !n ||
                                    (e.relatedTarget && ge(e.relatedTarget)) ||
                                    b.setDate(b._input.value, !0, e.target === b.altInput ? b.config.altFormat : b.config.dateFormat);
                            }
                            function we(e) {
                                var t = g(e),
                                    n = b.config.wrap ? p.contains(t) : t === b._input,
                                    a = b.config.allowInput,
                                    i = b.isOpen && (!a || !n),
                                    o = b.config.inline && n && !a;
                                if (13 === e.keyCode && n) {
                                    if (a)
                                        return (
                                            b.setDate(b._input.value, !0, t === b.altInput ? b.config.altFormat : b.config.dateFormat),
                                            b.close(),
                                            t.blur()
                                        );
                                    b.open();
                                } else if (ge(t) || i || o) {
                                    var r = !!b.timeContainer && b.timeContainer.contains(t);
                                    switch (e.keyCode) {
                                        case 13:
                                            r ? (e.preventDefault(), P(), Fe()) : Ae(e);
                                            break;
                                        case 27:
                                            (e.preventDefault(), Fe());
                                            break;
                                        case 8:
                                        case 46:
                                            n && !b.config.allowInput && (e.preventDefault(), b.clear());
                                            break;
                                        case 37:
                                        case 39:
                                            if (r || n) b.hourElement && b.hourElement.focus();
                                            else {
                                                e.preventDefault();
                                                var l = F();
                                                if (void 0 !== b.daysContainer && (!1 === a || (l && De(l)))) {
                                                    var c = 39 === e.keyCode ? 1 : -1;
                                                    e.ctrlKey ? (e.stopPropagation(), de(c), X(Z(1), 0)) : X(void 0, c);
                                                }
                                            }
                                            break;
                                        case 38:
                                        case 40:
                                            e.preventDefault();
                                            var s = 40 === e.keyCode ? 1 : -1;
                                            (b.daysContainer && void 0 !== t.$i) || t === b.input || t === b.altInput
                                                ? e.ctrlKey
                                                    ? (e.stopPropagation(), he(b.currentYear - s), X(Z(1), 0))
                                                    : r || X(void 0, 7 * s)
                                                : t === b.currentYearElement
                                                  ? he(b.currentYear - s)
                                                  : b.config.enableTime &&
                                                    (!r && b.hourElement && b.hourElement.focus(), P(e), b._debouncedChange());
                                            break;
                                        case 9:
                                            if (r) {
                                                var d = [b.hourElement, b.minuteElement, b.secondElement, b.amPM]
                                                        .concat(b.pluginElements)
                                                        .filter(function (e) {
                                                            return e;
                                                        }),
                                                    u = d.indexOf(t);
                                                if (-1 !== u) {
                                                    var f = d[u + (e.shiftKey ? -1 : 1)];
                                                    (e.preventDefault(), (f || b._input).focus());
                                                }
                                            } else
                                                !b.config.noCalendar &&
                                                    b.daysContainer &&
                                                    b.daysContainer.contains(t) &&
                                                    e.shiftKey &&
                                                    (e.preventDefault(), b._input.focus());
                                    }
                                }
                                if (void 0 !== b.amPM && t === b.amPM)
                                    switch (e.key) {
                                        case b.l10n.amPM[0].charAt(0):
                                        case b.l10n.amPM[0].charAt(0).toLowerCase():
                                            ((b.amPM.textContent = b.l10n.amPM[0]), H(), Ge());
                                            break;
                                        case b.l10n.amPM[1].charAt(0):
                                        case b.l10n.amPM[1].charAt(0).toLowerCase():
                                            ((b.amPM.textContent = b.l10n.amPM[1]), H(), Ge());
                                    }
                                (n || ge(t)) && Ke('onKeyDown', e);
                            }
                            function ye(e, t) {
                                if (
                                    (void 0 === t && (t = 'flatpickr-day'),
                                    1 === b.selectedDates.length &&
                                        (!e || (e.classList.contains(t) && !e.classList.contains('flatpickr-disabled'))))
                                ) {
                                    for (
                                        var n = e ? e.dateObj.getTime() : b.days.firstElementChild.dateObj.getTime(),
                                            a = b.parseDate(b.selectedDates[0], void 0, !0).getTime(),
                                            i = Math.min(n, b.selectedDates[0].getTime()),
                                            o = Math.max(n, b.selectedDates[0].getTime()),
                                            r = !1,
                                            l = 0,
                                            c = 0,
                                            s = i;
                                        s < o;
                                        s += k.DAY
                                    )
                                        ve(new Date(s), !0) ||
                                            ((r = r || (s > i && s < o)),
                                            s < a && (!l || s > l) ? (l = s) : s > a && (!c || s < c) && (c = s));
                                    Array.from(
                                        b.rContainer.querySelectorAll('*:nth-child(-n+' + b.config.showMonths + ') > .' + t)
                                    ).forEach(function (t) {
                                        var i = t.dateObj.getTime(),
                                            o = (l > 0 && i < l) || (c > 0 && i > c);
                                        if (o)
                                            return (
                                                t.classList.add('notAllowed'),
                                                void ['inRange', 'startRange', 'endRange'].forEach(function (e) {
                                                    t.classList.remove(e);
                                                })
                                            );
                                        (r && !o) ||
                                            (['startRange', 'inRange', 'endRange', 'notAllowed'].forEach(function (e) {
                                                t.classList.remove(e);
                                            }),
                                            void 0 !== e &&
                                                (e.classList.add(n <= b.selectedDates[0].getTime() ? 'startRange' : 'endRange'),
                                                a < n && i === a
                                                    ? t.classList.add('startRange')
                                                    : a > n && i === a && t.classList.add('endRange'),
                                                i >= l && (0 === c || i <= c) && M(i, a, n) && t.classList.add('inRange')));
                                    });
                                }
                            }
                            function Ce() {
                                !b.isOpen || b.config.static || b.config.inline || Se();
                            }
                            function Me(e, t) {
                                if ((void 0 === t && (t = b._positionElement), !0 === b.isMobile)) {
                                    if (e) {
                                        e.preventDefault();
                                        var n = g(e);
                                        n && n.blur();
                                    }
                                    return (void 0 !== b.mobileInput && (b.mobileInput.focus(), b.mobileInput.click()), void Ke('onOpen'));
                                }
                                if (!b._input.disabled && !b.config.inline) {
                                    var a = b.isOpen;
                                    ((b.isOpen = !0),
                                        a ||
                                            (b.calendarContainer.classList.add('open'),
                                            b._input.classList.add('active'),
                                            Ke('onOpen'),
                                            Se(t)),
                                        !0 === b.config.enableTime &&
                                            !0 === b.config.noCalendar &&
                                            (!1 !== b.config.allowInput ||
                                                (void 0 !== e && b.timeContainer.contains(e.relatedTarget)) ||
                                                setTimeout(function () {
                                                    return b.hourElement.select();
                                                }, 50)));
                                }
                            }
                            function xe(e) {
                                return function (t) {
                                    var n = (b.config['_' + e + 'Date'] = b.parseDate(t, b.config.dateFormat)),
                                        a = b.config['_' + ('min' === e ? 'max' : 'min') + 'Date'];
                                    (void 0 !== n &&
                                        (b['min' === e ? 'minDateHasTime' : 'maxDateHasTime'] =
                                            n.getHours() > 0 || n.getMinutes() > 0 || n.getSeconds() > 0),
                                        b.selectedDates &&
                                            ((b.selectedDates = b.selectedDates.filter(function (e) {
                                                return ve(e);
                                            })),
                                            b.selectedDates.length || 'min' !== e || L(n),
                                            Ge()),
                                        b.daysContainer &&
                                            (Oe(),
                                            void 0 !== n
                                                ? (b.currentYearElement[e] = n.getFullYear().toString())
                                                : b.currentYearElement.removeAttribute(e),
                                            (b.currentYearElement.disabled = !!a && void 0 !== n && a.getFullYear() === n.getFullYear())));
                                };
                            }
                            function Ee() {
                                var t = [
                                        'wrap',
                                        'weekNumbers',
                                        'allowInput',
                                        'allowInvalidPreload',
                                        'clickOpens',
                                        'time_24hr',
                                        'enableTime',
                                        'noCalendar',
                                        'altInput',
                                        'shorthandCurrentMonth',
                                        'inline',
                                        'static',
                                        'enableSeconds',
                                        'disableMobile',
                                    ],
                                    i = e(e({}, JSON.parse(JSON.stringify(p.dataset || {}))), v),
                                    o = {};
                                ((b.config.parseDate = i.parseDate),
                                    (b.config.formatDate = i.formatDate),
                                    Object.defineProperty(b.config, 'enable', {
                                        get: function () {
                                            return b.config._enable;
                                        },
                                        set: function (e) {
                                            b.config._enable = He(e);
                                        },
                                    }),
                                    Object.defineProperty(b.config, 'disable', {
                                        get: function () {
                                            return b.config._disable;
                                        },
                                        set: function (e) {
                                            b.config._disable = He(e);
                                        },
                                    }));
                                var r = 'time' === i.mode;
                                if (!i.dateFormat && (i.enableTime || r)) {
                                    var l = O.defaultConfig.dateFormat || a.dateFormat;
                                    o.dateFormat =
                                        i.noCalendar || r
                                            ? 'H:i' + (i.enableSeconds ? ':S' : '')
                                            : l + ' H:i' + (i.enableSeconds ? ':S' : '');
                                }
                                if (i.altInput && (i.enableTime || r) && !i.altFormat) {
                                    var s = O.defaultConfig.altFormat || a.altFormat;
                                    o.altFormat =
                                        i.noCalendar || r
                                            ? 'h:i' + (i.enableSeconds ? ':S K' : ' K')
                                            : s + ' h:i' + (i.enableSeconds ? ':S' : '') + ' K';
                                }
                                (Object.defineProperty(b.config, 'minDate', {
                                    get: function () {
                                        return b.config._minDate;
                                    },
                                    set: xe('min'),
                                }),
                                    Object.defineProperty(b.config, 'maxDate', {
                                        get: function () {
                                            return b.config._maxDate;
                                        },
                                        set: xe('max'),
                                    }));
                                var d = function (e) {
                                    return function (t) {
                                        b.config['min' === e ? '_minTime' : '_maxTime'] = b.parseDate(t, 'H:i:S');
                                    };
                                };
                                (Object.defineProperty(b.config, 'minTime', {
                                    get: function () {
                                        return b.config._minTime;
                                    },
                                    set: d('min'),
                                }),
                                    Object.defineProperty(b.config, 'maxTime', {
                                        get: function () {
                                            return b.config._maxTime;
                                        },
                                        set: d('max'),
                                    }),
                                    'time' === i.mode && ((b.config.noCalendar = !0), (b.config.enableTime = !0)),
                                    Object.assign(b.config, o, i));
                                for (var u = 0; u < t.length; u++) b.config[t[u]] = !0 === b.config[t[u]] || 'true' === b.config[t[u]];
                                for (
                                    n
                                        .filter(function (e) {
                                            return void 0 !== b.config[e];
                                        })
                                        .forEach(function (e) {
                                            b.config[e] = c(b.config[e] || []).map(A);
                                        }),
                                        b.isMobile =
                                            !b.config.disableMobile &&
                                            !b.config.inline &&
                                            'single' === b.config.mode &&
                                            !b.config.disable.length &&
                                            !b.config.enable &&
                                            !b.config.weekNumbers &&
                                            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                                        u = 0;
                                    u < b.config.plugins.length;
                                    u++
                                ) {
                                    var f = b.config.plugins[u](b) || {};
                                    for (var m in f)
                                        n.indexOf(m) > -1
                                            ? (b.config[m] = c(f[m]).map(A).concat(b.config[m]))
                                            : void 0 === i[m] && (b.config[m] = f[m]);
                                }
                                (i.altInputClass || (b.config.altInputClass = ke().className + ' ' + b.config.altInputClass),
                                    Ke('onParseConfig'));
                            }
                            function ke() {
                                return b.config.wrap ? p.querySelector('[data-input]') : p;
                            }
                            function Te() {
                                ('object' != typeof b.config.locale &&
                                    void 0 === O.l10ns[b.config.locale] &&
                                    b.config.errorHandler(new Error('flatpickr: invalid locale ' + b.config.locale)),
                                    (b.l10n = e(
                                        e({}, O.l10ns.default),
                                        'object' == typeof b.config.locale
                                            ? b.config.locale
                                            : 'default' !== b.config.locale
                                              ? O.l10ns[b.config.locale]
                                              : void 0
                                    )),
                                    (D.D = '(' + b.l10n.weekdays.shorthand.join('|') + ')'),
                                    (D.l = '(' + b.l10n.weekdays.longhand.join('|') + ')'),
                                    (D.M = '(' + b.l10n.months.shorthand.join('|') + ')'),
                                    (D.F = '(' + b.l10n.months.longhand.join('|') + ')'),
                                    (D.K =
                                        '(' +
                                        b.l10n.amPM[0] +
                                        '|' +
                                        b.l10n.amPM[1] +
                                        '|' +
                                        b.l10n.amPM[0].toLowerCase() +
                                        '|' +
                                        b.l10n.amPM[1].toLowerCase() +
                                        ')'),
                                    void 0 === e(e({}, v), JSON.parse(JSON.stringify(p.dataset || {}))).time_24hr &&
                                        void 0 === O.defaultConfig.time_24hr &&
                                        (b.config.time_24hr = b.l10n.time_24hr),
                                    (b.formatDate = w(b)),
                                    (b.parseDate = y({ config: b.config, l10n: b.l10n })));
                            }
                            function Se(e) {
                                if ('function' != typeof b.config.position) {
                                    if (void 0 !== b.calendarContainer) {
                                        Ke('onPreCalendarPosition');
                                        var t = e || b._positionElement,
                                            n = Array.prototype.reduce.call(
                                                b.calendarContainer.children,
                                                function (e, t) {
                                                    return e + t.offsetHeight;
                                                },
                                                0
                                            ),
                                            a = b.calendarContainer.offsetWidth,
                                            i = b.config.position.split(' '),
                                            o = i[0],
                                            r = i.length > 1 ? i[1] : null,
                                            l = t.getBoundingClientRect(),
                                            c = window.innerHeight - l.bottom,
                                            d = 'above' === o || ('below' !== o && c < n && l.top > n),
                                            u = window.pageYOffset + l.top + (d ? -n - 2 : t.offsetHeight + 2);
                                        if (
                                            (s(b.calendarContainer, 'arrowTop', !d),
                                            s(b.calendarContainer, 'arrowBottom', d),
                                            !b.config.inline)
                                        ) {
                                            var f = window.pageXOffset + l.left,
                                                m = !1,
                                                g = !1;
                                            ('center' === r
                                                ? ((f -= (a - l.width) / 2), (m = !0))
                                                : 'right' === r && ((f -= a - l.width), (g = !0)),
                                                s(b.calendarContainer, 'arrowLeft', !m && !g),
                                                s(b.calendarContainer, 'arrowCenter', m),
                                                s(b.calendarContainer, 'arrowRight', g));
                                            var p = window.document.body.offsetWidth - (window.pageXOffset + l.right),
                                                h = f + a > window.document.body.offsetWidth,
                                                v = p + a > window.document.body.offsetWidth;
                                            if ((s(b.calendarContainer, 'rightMost', h), !b.config.static))
                                                if (((b.calendarContainer.style.top = u + 'px'), h))
                                                    if (v) {
                                                        var D = Ie();
                                                        if (void 0 === D) return;
                                                        var w = window.document.body.offsetWidth,
                                                            y = Math.max(0, w / 2 - a / 2),
                                                            C = '.flatpickr-calendar.centerMost:before',
                                                            M = '.flatpickr-calendar.centerMost:after',
                                                            x = D.cssRules.length,
                                                            E = '{left:' + l.left + 'px;right:auto;}';
                                                        (s(b.calendarContainer, 'rightMost', !1),
                                                            s(b.calendarContainer, 'centerMost', !0),
                                                            D.insertRule(C + ',' + M + E, x),
                                                            (b.calendarContainer.style.left = y + 'px'),
                                                            (b.calendarContainer.style.right = 'auto'));
                                                    } else
                                                        ((b.calendarContainer.style.left = 'auto'),
                                                            (b.calendarContainer.style.right = p + 'px'));
                                                else
                                                    ((b.calendarContainer.style.left = f + 'px'),
                                                        (b.calendarContainer.style.right = 'auto'));
                                        }
                                    }
                                } else b.config.position(b, e);
                            }
                            function Ie() {
                                for (var e = null, t = 0; t < document.styleSheets.length; t++) {
                                    var n = document.styleSheets[t];
                                    if (n.cssRules) {
                                        try {
                                            n.cssRules;
                                        } catch (e) {
                                            continue;
                                        }
                                        e = n;
                                        break;
                                    }
                                }
                                return null != e ? e : _e();
                            }
                            function _e() {
                                var e = document.createElement('style');
                                return (document.head.appendChild(e), e.sheet);
                            }
                            function Oe() {
                                b.config.noCalendar || b.isMobile || (ne(), Ve(), te());
                            }
                            function Fe() {
                                (b._input.focus(),
                                    -1 !== window.navigator.userAgent.indexOf('MSIE') || void 0 !== navigator.msMaxTouchPoints
                                        ? setTimeout(b.close, 0)
                                        : b.close());
                            }
                            function Ae(e) {
                                (e.preventDefault(), e.stopPropagation());
                                var t = function (e) {
                                        return (
                                            e.classList &&
                                            e.classList.contains('flatpickr-day') &&
                                            !e.classList.contains('flatpickr-disabled') &&
                                            !e.classList.contains('notAllowed')
                                        );
                                    },
                                    n = f(g(e), t);
                                if (void 0 !== n) {
                                    var a = n,
                                        i = (b.latestSelectedDateObj = new Date(a.dateObj.getTime())),
                                        o =
                                            (i.getMonth() < b.currentMonth || i.getMonth() > b.currentMonth + b.config.showMonths - 1) &&
                                            'range' !== b.config.mode;
                                    if (((b.selectedDateElem = a), 'single' === b.config.mode)) b.selectedDates = [i];
                                    else if ('multiple' === b.config.mode) {
                                        var r = qe(i);
                                        r ? b.selectedDates.splice(parseInt(r), 1) : b.selectedDates.push(i);
                                    } else
                                        'range' === b.config.mode &&
                                            (2 === b.selectedDates.length && b.clear(!1, !1),
                                            (b.latestSelectedDateObj = i),
                                            b.selectedDates.push(i),
                                            0 !== C(i, b.selectedDates[0], !0) &&
                                                b.selectedDates.sort(function (e, t) {
                                                    return e.getTime() - t.getTime();
                                                }));
                                    if ((H(), o)) {
                                        var l = b.currentYear !== i.getFullYear();
                                        ((b.currentYear = i.getFullYear()),
                                            (b.currentMonth = i.getMonth()),
                                            l && (Ke('onYearChange'), ne()),
                                            Ke('onMonthChange'));
                                    }
                                    if (
                                        (Ve(),
                                        te(),
                                        Ge(),
                                        o || 'range' === b.config.mode || 1 !== b.config.showMonths
                                            ? void 0 !== b.selectedDateElem &&
                                              void 0 === b.hourElement &&
                                              b.selectedDateElem &&
                                              b.selectedDateElem.focus()
                                            : G(a),
                                        void 0 !== b.hourElement && void 0 !== b.hourElement && b.hourElement.focus(),
                                        b.config.closeOnSelect)
                                    ) {
                                        var c = 'single' === b.config.mode && !b.config.enableTime,
                                            s = 'range' === b.config.mode && 2 === b.selectedDates.length && !b.config.enableTime;
                                        (c || s) && Fe();
                                    }
                                    J();
                                }
                            }
                            ((b.parseDate = y({ config: b.config, l10n: b.l10n })),
                                (b._handlers = []),
                                (b.pluginElements = []),
                                (b.loadedPlugins = []),
                                (b._bind = B),
                                (b._setHoursFromDate = L),
                                (b._positionCalendar = Se),
                                (b.changeMonth = de),
                                (b.changeYear = he),
                                (b.clear = ue),
                                (b.close = fe),
                                (b.onMouseOver = ye),
                                (b._createElement = d),
                                (b.createDay = z),
                                (b.destroy = me),
                                (b.isEnabled = ve),
                                (b.jumpToDate = U),
                                (b.updateValue = Ge),
                                (b.open = Me),
                                (b.redraw = Oe),
                                (b.set = Pe),
                                (b.setDate = je),
                                (b.toggle = Je));
                            var Ne = {
                                locale: [Te, ce],
                                showMonths: [ie, N, le],
                                minDate: [U],
                                maxDate: [U],
                                positionElement: [We],
                                clickOpens: [
                                    function () {
                                        !0 === b.config.clickOpens
                                            ? (B(b._input, 'focus', b.open), B(b._input, 'click', b.open))
                                            : (b._input.removeEventListener('focus', b.open),
                                              b._input.removeEventListener('click', b.open));
                                    },
                                ],
                            };
                            function Pe(e, t) {
                                if (null !== e && 'object' == typeof e)
                                    for (var a in (Object.assign(b.config, e), e))
                                        void 0 !== Ne[a] &&
                                            Ne[a].forEach(function (e) {
                                                return e();
                                            });
                                else
                                    ((b.config[e] = t),
                                        void 0 !== Ne[e]
                                            ? Ne[e].forEach(function (e) {
                                                  return e();
                                              })
                                            : n.indexOf(e) > -1 && (b.config[e] = c(t)));
                                (b.redraw(), Ge(!0));
                            }
                            function Ye(e, t) {
                                var n = [];
                                if (e instanceof Array)
                                    n = e.map(function (e) {
                                        return b.parseDate(e, t);
                                    });
                                else if (e instanceof Date || 'number' == typeof e) n = [b.parseDate(e, t)];
                                else if ('string' == typeof e)
                                    switch (b.config.mode) {
                                        case 'single':
                                        case 'time':
                                            n = [b.parseDate(e, t)];
                                            break;
                                        case 'multiple':
                                            n = e.split(b.config.conjunction).map(function (e) {
                                                return b.parseDate(e, t);
                                            });
                                            break;
                                        case 'range':
                                            n = e.split(b.l10n.rangeSeparator).map(function (e) {
                                                return b.parseDate(e, t);
                                            });
                                    }
                                else b.config.errorHandler(new Error('Invalid date supplied: ' + JSON.stringify(e)));
                                ((b.selectedDates = b.config.allowInvalidPreload
                                    ? n
                                    : n.filter(function (e) {
                                          return e instanceof Date && ve(e, !1);
                                      })),
                                    'range' === b.config.mode &&
                                        b.selectedDates.sort(function (e, t) {
                                            return e.getTime() - t.getTime();
                                        }));
                            }
                            function je(e, t, n) {
                                if (
                                    (void 0 === t && (t = !1),
                                    void 0 === n && (n = b.config.dateFormat),
                                    (0 !== e && !e) || (e instanceof Array && 0 === e.length))
                                )
                                    return b.clear(t);
                                (Ye(e, n),
                                    (b.latestSelectedDateObj = b.selectedDates[b.selectedDates.length - 1]),
                                    b.redraw(),
                                    U(void 0, t),
                                    L(),
                                    0 === b.selectedDates.length && b.clear(!1),
                                    Ge(t),
                                    t && Ke('onChange'));
                            }
                            function He(e) {
                                return e
                                    .slice()
                                    .map(function (e) {
                                        return 'string' == typeof e || 'number' == typeof e || e instanceof Date
                                            ? b.parseDate(e, void 0, !0)
                                            : e && 'object' == typeof e && e.from && e.to
                                              ? { from: b.parseDate(e.from, void 0), to: b.parseDate(e.to, void 0) }
                                              : e;
                                    })
                                    .filter(function (e) {
                                        return e;
                                    });
                            }
                            function Le() {
                                ((b.selectedDates = []), (b.now = b.parseDate(b.config.now) || new Date()));
                                var e =
                                    b.config.defaultDate ||
                                    (('INPUT' !== b.input.nodeName && 'TEXTAREA' !== b.input.nodeName) ||
                                    !b.input.placeholder ||
                                    b.input.value !== b.input.placeholder
                                        ? b.input.value
                                        : null);
                                (e && Ye(e, b.config.dateFormat),
                                    (b._initialDate =
                                        b.selectedDates.length > 0
                                            ? b.selectedDates[0]
                                            : b.config.minDate && b.config.minDate.getTime() > b.now.getTime()
                                              ? b.config.minDate
                                              : b.config.maxDate && b.config.maxDate.getTime() < b.now.getTime()
                                                ? b.config.maxDate
                                                : b.now),
                                    (b.currentYear = b._initialDate.getFullYear()),
                                    (b.currentMonth = b._initialDate.getMonth()),
                                    b.selectedDates.length > 0 && (b.latestSelectedDateObj = b.selectedDates[0]),
                                    void 0 !== b.config.minTime && (b.config.minTime = b.parseDate(b.config.minTime, 'H:i')),
                                    void 0 !== b.config.maxTime && (b.config.maxTime = b.parseDate(b.config.maxTime, 'H:i')),
                                    (b.minDateHasTime =
                                        !!b.config.minDate &&
                                        (b.config.minDate.getHours() > 0 ||
                                            b.config.minDate.getMinutes() > 0 ||
                                            b.config.minDate.getSeconds() > 0)),
                                    (b.maxDateHasTime =
                                        !!b.config.maxDate &&
                                        (b.config.maxDate.getHours() > 0 ||
                                            b.config.maxDate.getMinutes() > 0 ||
                                            b.config.maxDate.getSeconds() > 0)));
                            }
                            function Re() {
                                ((b.input = ke()),
                                    b.input
                                        ? ((b.input._type = b.input.type),
                                          (b.input.type = 'text'),
                                          b.input.classList.add('flatpickr-input'),
                                          (b._input = b.input),
                                          b.config.altInput &&
                                              ((b.altInput = d(b.input.nodeName, b.config.altInputClass)),
                                              (b._input = b.altInput),
                                              (b.altInput.placeholder = b.input.placeholder),
                                              (b.altInput.disabled = b.input.disabled),
                                              (b.altInput.required = b.input.required),
                                              (b.altInput.tabIndex = b.input.tabIndex),
                                              (b.altInput.type = 'text'),
                                              b.input.setAttribute('type', 'hidden'),
                                              !b.config.static &&
                                                  b.input.parentNode &&
                                                  b.input.parentNode.insertBefore(b.altInput, b.input.nextSibling)),
                                          b.config.allowInput || b._input.setAttribute('readonly', 'readonly'),
                                          We())
                                        : b.config.errorHandler(new Error('Invalid input element specified')));
                            }
                            function We() {
                                b._positionElement = b.config.positionElement || b._input;
                            }
                            function Be() {
                                var e = b.config.enableTime ? (b.config.noCalendar ? 'time' : 'datetime-local') : 'date';
                                ((b.mobileInput = d('input', b.input.className + ' flatpickr-mobile')),
                                    (b.mobileInput.tabIndex = 1),
                                    (b.mobileInput.type = e),
                                    (b.mobileInput.disabled = b.input.disabled),
                                    (b.mobileInput.required = b.input.required),
                                    (b.mobileInput.placeholder = b.input.placeholder),
                                    (b.mobileFormatStr = 'datetime-local' === e ? 'Y-m-d\\TH:i:S' : 'date' === e ? 'Y-m-d' : 'H:i:S'),
                                    b.selectedDates.length > 0 &&
                                        (b.mobileInput.defaultValue = b.mobileInput.value =
                                            b.formatDate(b.selectedDates[0], b.mobileFormatStr)),
                                    b.config.minDate && (b.mobileInput.min = b.formatDate(b.config.minDate, 'Y-m-d')),
                                    b.config.maxDate && (b.mobileInput.max = b.formatDate(b.config.maxDate, 'Y-m-d')),
                                    b.input.getAttribute('step') && (b.mobileInput.step = String(b.input.getAttribute('step'))),
                                    (b.input.type = 'hidden'),
                                    void 0 !== b.altInput && (b.altInput.type = 'hidden'));
                                try {
                                    b.input.parentNode && b.input.parentNode.insertBefore(b.mobileInput, b.input.nextSibling);
                                } catch (e) {}
                                B(b.mobileInput, 'change', function (e) {
                                    (b.setDate(g(e).value, !1, b.mobileFormatStr), Ke('onChange'), Ke('onClose'));
                                });
                            }
                            function Je(e) {
                                if (!0 === b.isOpen) return b.close();
                                b.open(e);
                            }
                            function Ke(e, t) {
                                if (void 0 !== b.config) {
                                    var n = b.config[e];
                                    if (void 0 !== n && n.length > 0)
                                        for (var a = 0; n[a] && a < n.length; a++) n[a](b.selectedDates, b.input.value, b, t);
                                    'onChange' === e && (b.input.dispatchEvent(Ue('change')), b.input.dispatchEvent(Ue('input')));
                                }
                            }
                            function Ue(e) {
                                var t = document.createEvent('Event');
                                return (t.initEvent(e, !0, !0), t);
                            }
                            function qe(e) {
                                for (var t = 0; t < b.selectedDates.length; t++) {
                                    var n = b.selectedDates[t];
                                    if (n instanceof Date && 0 === C(n, e)) return '' + t;
                                }
                                return !1;
                            }
                            function $e(e) {
                                return (
                                    !('range' !== b.config.mode || b.selectedDates.length < 2) &&
                                    C(e, b.selectedDates[0]) >= 0 &&
                                    C(e, b.selectedDates[1]) <= 0
                                );
                            }
                            function Ve() {
                                b.config.noCalendar ||
                                    b.isMobile ||
                                    !b.monthNav ||
                                    (b.yearElements.forEach(function (e, t) {
                                        var n = new Date(b.currentYear, b.currentMonth, 1);
                                        (n.setMonth(b.currentMonth + t),
                                            b.config.showMonths > 1 || 'static' === b.config.monthSelectorType
                                                ? (b.monthElements[t].textContent =
                                                      h(n.getMonth(), b.config.shorthandCurrentMonth, b.l10n) + ' ')
                                                : (b.monthsDropdownContainer.value = n.getMonth().toString()),
                                            (e.value = n.getFullYear().toString()));
                                    }),
                                    (b._hidePrevMonthArrow =
                                        void 0 !== b.config.minDate &&
                                        (b.currentYear === b.config.minDate.getFullYear()
                                            ? b.currentMonth <= b.config.minDate.getMonth()
                                            : b.currentYear < b.config.minDate.getFullYear())),
                                    (b._hideNextMonthArrow =
                                        void 0 !== b.config.maxDate &&
                                        (b.currentYear === b.config.maxDate.getFullYear()
                                            ? b.currentMonth + 1 > b.config.maxDate.getMonth()
                                            : b.currentYear > b.config.maxDate.getFullYear())));
                            }
                            function ze(e) {
                                var t = e || (b.config.altInput ? b.config.altFormat : b.config.dateFormat);
                                return b.selectedDates
                                    .map(function (e) {
                                        return b.formatDate(e, t);
                                    })
                                    .filter(function (e, t, n) {
                                        return 'range' !== b.config.mode || b.config.enableTime || n.indexOf(e) === t;
                                    })
                                    .join('range' !== b.config.mode ? b.config.conjunction : b.l10n.rangeSeparator);
                            }
                            function Ge(e) {
                                (void 0 === e && (e = !0),
                                    void 0 !== b.mobileInput &&
                                        b.mobileFormatStr &&
                                        (b.mobileInput.value =
                                            void 0 !== b.latestSelectedDateObj
                                                ? b.formatDate(b.latestSelectedDateObj, b.mobileFormatStr)
                                                : ''),
                                    (b.input.value = ze(b.config.dateFormat)),
                                    void 0 !== b.altInput && (b.altInput.value = ze(b.config.altFormat)),
                                    !1 !== e && Ke('onValueUpdate'));
                            }
                            function Ze(e) {
                                var t = g(e),
                                    n = b.prevMonthNav.contains(t),
                                    a = b.nextMonthNav.contains(t);
                                n || a
                                    ? de(n ? -1 : 1)
                                    : b.yearElements.indexOf(t) >= 0
                                      ? t.select()
                                      : t.classList.contains('arrowUp')
                                        ? b.changeYear(b.currentYear + 1)
                                        : t.classList.contains('arrowDown') && b.changeYear(b.currentYear - 1);
                            }
                            function Qe(e) {
                                e.preventDefault();
                                var t = 'keydown' === e.type,
                                    n = g(e),
                                    a = n;
                                void 0 !== b.amPM &&
                                    n === b.amPM &&
                                    (b.amPM.textContent = b.l10n.amPM[r(b.amPM.textContent === b.l10n.amPM[0])]);
                                var i = parseFloat(a.getAttribute('min')),
                                    l = parseFloat(a.getAttribute('max')),
                                    c = parseFloat(a.getAttribute('step')),
                                    s = parseInt(a.value, 10),
                                    d = s + c * (e.delta || (t ? (38 === e.which ? 1 : -1) : 0));
                                if (void 0 !== a.value && 2 === a.value.length) {
                                    var u = a === b.hourElement,
                                        f = a === b.minuteElement;
                                    (d < i
                                        ? ((d = l + d + r(!u) + (r(u) && r(!b.amPM))), f && $(void 0, -1, b.hourElement))
                                        : d > l && ((d = a === b.hourElement ? d - l - r(!b.amPM) : i), f && $(void 0, 1, b.hourElement)),
                                        b.amPM &&
                                            u &&
                                            (1 === c ? d + s === 23 : Math.abs(d - s) > c) &&
                                            (b.amPM.textContent = b.l10n.amPM[r(b.amPM.textContent === b.l10n.amPM[0])]),
                                        (a.value = o(d)));
                                }
                            }
                            return (_(), b);
                        }
                        function _(e, t) {
                            for (
                                var n = Array.prototype.slice.call(e).filter(function (e) {
                                        return e instanceof HTMLElement;
                                    }),
                                    a = [],
                                    i = 0;
                                i < n.length;
                                i++
                            ) {
                                var o = n[i];
                                try {
                                    if (null !== o.getAttribute('data-fp-omit')) continue;
                                    (void 0 !== o._flatpickr && (o._flatpickr.destroy(), (o._flatpickr = void 0)),
                                        (o._flatpickr = I(o, t || {})),
                                        a.push(o._flatpickr));
                                } catch (e) {}
                            }
                            return 1 === a.length ? a[0] : a;
                        }
                        'undefined' != typeof HTMLElement &&
                            'undefined' != typeof HTMLCollection &&
                            'undefined' != typeof NodeList &&
                            ((HTMLCollection.prototype.flatpickr = NodeList.prototype.flatpickr =
                                function (e) {
                                    return _(this, e);
                                }),
                            (HTMLElement.prototype.flatpickr = function (e) {
                                return _([this], e);
                            }));
                        var O = function (e, t) {
                            return 'string' == typeof e
                                ? _(window.document.querySelectorAll(e), t)
                                : e instanceof Node
                                  ? _([e], t)
                                  : _(e, t);
                        };
                        return (
                            (O.defaultConfig = {}),
                            (O.l10ns = { en: e({}, i), default: e({}, i) }),
                            (O.localize = function (t) {
                                O.l10ns.default = e(e({}, O.l10ns.default), t);
                            }),
                            (O.setDefaults = function (t) {
                                O.defaultConfig = e(e({}, O.defaultConfig), t);
                            }),
                            (O.parseDate = y({})),
                            (O.formatDate = w({})),
                            (O.compareDates = C),
                            'undefined' != typeof jQuery &&
                                void 0 !== jQuery.fn &&
                                (jQuery.fn.flatpickr = function (e) {
                                    return _(this, e);
                                }),
                            (Date.prototype.fp_incr = function (e) {
                                return new Date(
                                    this.getFullYear(),
                                    this.getMonth(),
                                    this.getDate() + ('string' == typeof e ? parseInt(e, 10) : e)
                                );
                            }),
                            'undefined' != typeof window && (window.flatpickr = O),
                            O
                        );
                    })();
                },
            },
            t = {};
        function n(a) {
            var i = t[a];
            if (void 0 !== i) return i.exports;
            var o = (t[a] = { exports: {} });
            return (e[a].call(o.exports, o, o.exports, n), o.exports);
        }
        ((n.n = function (e) {
            var t =
                e && e.__esModule
                    ? function () {
                          return e.default;
                      }
                    : function () {
                          return e;
                      };
            return (n.d(t, { a: t }), t);
        }),
            (n.d = function (e, t) {
                for (var a in t) n.o(t, a) && !n.o(e, a) && Object.defineProperty(e, a, { enumerable: !0, get: t[a] });
            }),
            (n.o = function (e, t) {
                return Object.prototype.hasOwnProperty.call(e, t);
            }),
            (n.r = function (e) {
                ('undefined' != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
                    Object.defineProperty(e, '__esModule', { value: !0 }));
            }));
        var a = {};
        return (
            (function () {
                'use strict';
                (n.r(a),
                    n.d(a, {
                        flatpickr: function () {
                            return t.a;
                        },
                    }));
                var e = n(4953),
                    t = n.n(e);
                try {
                    window.flatpickr = t();
                } catch (e) {}
            })(),
            a
        );
    })();
});
