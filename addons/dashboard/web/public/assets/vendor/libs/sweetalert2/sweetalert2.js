/**
 * @namespace: addons/dashboard/web/public/assets/vendor/libs/sweetalert2/sweetalert2.js
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
        for (var o in n) ('object' == typeof exports ? exports : e)[o] = n[o];
    }
})(self, function () {
    return (function () {
        var e = {
                8764: function (e) {
                    ((e.exports = (function () {
                        'use strict';
                        function e(e, t, n) {
                            if ('function' == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n;
                            throw new TypeError('Private element is not present on this object');
                        }
                        function t(e, t) {
                            if (t.has(e)) throw new TypeError('Cannot initialize the same private elements twice on an object');
                        }
                        function n(t, n) {
                            return t.get(e(t, n));
                        }
                        function o(e, n, o) {
                            (t(e, n), n.set(e, o));
                        }
                        function i(t, n, o) {
                            return (t.set(e(t, n), o), o);
                        }
                        const r = 100,
                            s = {},
                            a = () => {
                                s.previousActiveElement instanceof HTMLElement
                                    ? (s.previousActiveElement.focus(), (s.previousActiveElement = null))
                                    : document.body && document.body.focus();
                            },
                            l = (e) =>
                                new Promise((t) => {
                                    if (!e) return t();
                                    const n = window.scrollX,
                                        o = window.scrollY;
                                    ((s.restoreFocusTimeout = setTimeout(() => {
                                        (a(), t());
                                    }, r)),
                                        window.scrollTo(n, o));
                                }),
                            c = 'swal2-',
                            u = [
                                'container',
                                'shown',
                                'height-auto',
                                'iosfix',
                                'popup',
                                'modal',
                                'no-backdrop',
                                'no-transition',
                                'toast',
                                'toast-shown',
                                'show',
                                'hide',
                                'close',
                                'title',
                                'html-container',
                                'actions',
                                'confirm',
                                'deny',
                                'cancel',
                                'default-outline',
                                'footer',
                                'icon',
                                'icon-content',
                                'image',
                                'input',
                                'file',
                                'range',
                                'select',
                                'radio',
                                'checkbox',
                                'label',
                                'textarea',
                                'inputerror',
                                'input-label',
                                'validation-message',
                                'progress-steps',
                                'active-progress-step',
                                'progress-step',
                                'progress-step-line',
                                'loader',
                                'loading',
                                'styled',
                                'top',
                                'top-start',
                                'top-end',
                                'top-left',
                                'top-right',
                                'center',
                                'center-start',
                                'center-end',
                                'center-left',
                                'center-right',
                                'bottom',
                                'bottom-start',
                                'bottom-end',
                                'bottom-left',
                                'bottom-right',
                                'grow-row',
                                'grow-column',
                                'grow-fullscreen',
                                'rtl',
                                'timer-progress-bar',
                                'timer-progress-bar-container',
                                'scrollbar-measure',
                                'icon-success',
                                'icon-warning',
                                'icon-info',
                                'icon-question',
                                'icon-error',
                            ].reduce((e, t) => ((e[t] = c + t), e), {}),
                            d = ['success', 'warning', 'info', 'question', 'error'].reduce((e, t) => ((e[t] = c + t), e), {}),
                            p = (e) => e.charAt(0).toUpperCase() + e.slice(1),
                            m = (e) => {},
                            h = (e) => {},
                            g = [],
                            f = (e) => {
                                g.includes(e) || (g.push(e), m(e));
                            },
                            b = function (e) {
                                let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : null;
                                f(`"${e}" is deprecated and will be removed in the next major release.${t ? ` Use "${t}" instead.` : ''}`);
                            },
                            y = (e) => ('function' == typeof e ? e() : e),
                            v = (e) => e && 'function' == typeof e.toPromise,
                            w = (e) => (v(e) ? e.toPromise() : Promise.resolve(e)),
                            C = (e) => e && Promise.resolve(e) === e,
                            A = () => document.body.querySelector(`.${u.container}`),
                            k = (e) => {
                                const t = A();
                                return t ? t.querySelector(e) : null;
                            },
                            E = (e) => k(`.${e}`),
                            B = () => E(u.popup),
                            x = () => E(u.icon),
                            P = () => E(u['icon-content']),
                            $ = () => E(u.title),
                            L = () => E(u['html-container']),
                            T = () => E(u.image),
                            S = () => E(u['progress-steps']),
                            O = () => E(u['validation-message']),
                            M = () => k(`.${u.actions} .${u.confirm}`),
                            j = () => k(`.${u.actions} .${u.cancel}`),
                            H = () => k(`.${u.actions} .${u.deny}`),
                            I = () => E(u['input-label']),
                            D = () => k(`.${u.loader}`),
                            q = () => E(u.actions),
                            V = () => E(u.footer),
                            _ = () => E(u['timer-progress-bar']),
                            N = () => E(u.close),
                            F =
                                '\n  a[href],\n  area[href],\n  input:not([disabled]),\n  select:not([disabled]),\n  textarea:not([disabled]),\n  button:not([disabled]),\n  iframe,\n  object,\n  embed,\n  [tabindex="0"],\n  [contenteditable],\n  audio[controls],\n  video[controls],\n  summary\n',
                            R = () => {
                                const e = B();
                                if (!e) return [];
                                const t = e.querySelectorAll('[tabindex]:not([tabindex="-1"]):not([tabindex="0"])'),
                                    n = Array.from(t).sort((e, t) => {
                                        const n = parseInt(e.getAttribute('tabindex') || '0'),
                                            o = parseInt(t.getAttribute('tabindex') || '0');
                                        return n > o ? 1 : n < o ? -1 : 0;
                                    }),
                                    o = e.querySelectorAll(F),
                                    i = Array.from(o).filter((e) => '-1' !== e.getAttribute('tabindex'));
                                return [...new Set(n.concat(i))].filter((e) => ce(e));
                            },
                            U = () =>
                                Y(document.body, u.shown) && !Y(document.body, u['toast-shown']) && !Y(document.body, u['no-backdrop']),
                            z = () => {
                                const e = B();
                                return !!e && Y(e, u.toast);
                            },
                            K = () => {
                                const e = B();
                                return !!e && e.hasAttribute('data-loading');
                            },
                            W = (e, t) => {
                                if (((e.textContent = ''), t)) {
                                    const n = new DOMParser().parseFromString(t, 'text/html'),
                                        o = n.querySelector('head');
                                    o &&
                                        Array.from(o.childNodes).forEach((t) => {
                                            e.appendChild(t);
                                        });
                                    const i = n.querySelector('body');
                                    i &&
                                        Array.from(i.childNodes).forEach((t) => {
                                            t instanceof HTMLVideoElement || t instanceof HTMLAudioElement
                                                ? e.appendChild(t.cloneNode(!0))
                                                : e.appendChild(t);
                                        });
                                }
                            },
                            Y = (e, t) => {
                                if (!t) return !1;
                                const n = t.split(/\s+/);
                                for (let t = 0; t < n.length; t++) if (!e.classList.contains(n[t])) return !1;
                                return !0;
                            },
                            Z = (e, t) => {
                                Array.from(e.classList).forEach((n) => {
                                    Object.values(u).includes(n) ||
                                        Object.values(d).includes(n) ||
                                        Object.values(t.showClass || {}).includes(n) ||
                                        e.classList.remove(n);
                                });
                            },
                            J = (e, t, n) => {
                                if ((Z(e, t), !t.customClass)) return;
                                const o = t.customClass[n];
                                o &&
                                    ('string' == typeof o || o.forEach
                                        ? ee(e, o)
                                        : m(`Invalid type of customClass.${n}! Expected string or iterable object, got "${typeof o}"`));
                            },
                            X = (e, t) => {
                                if (!t) return null;
                                switch (t) {
                                    case 'select':
                                    case 'textarea':
                                    case 'file':
                                        return e.querySelector(`.${u.popup} > .${u[t]}`);
                                    case 'checkbox':
                                        return e.querySelector(`.${u.popup} > .${u.checkbox} input`);
                                    case 'radio':
                                        return (
                                            e.querySelector(`.${u.popup} > .${u.radio} input:checked`) ||
                                            e.querySelector(`.${u.popup} > .${u.radio} input:first-child`)
                                        );
                                    case 'range':
                                        return e.querySelector(`.${u.popup} > .${u.range} input`);
                                    default:
                                        return e.querySelector(`.${u.popup} > .${u.input}`);
                                }
                            },
                            G = (e) => {
                                if ((e.focus(), 'file' !== e.type)) {
                                    const t = e.value;
                                    ((e.value = ''), (e.value = t));
                                }
                            },
                            Q = (e, t, n) => {
                                e &&
                                    t &&
                                    ('string' == typeof t && (t = t.split(/\s+/).filter(Boolean)),
                                    t.forEach((t) => {
                                        Array.isArray(e)
                                            ? e.forEach((e) => {
                                                  n ? e.classList.add(t) : e.classList.remove(t);
                                              })
                                            : n
                                              ? e.classList.add(t)
                                              : e.classList.remove(t);
                                    }));
                            },
                            ee = (e, t) => {
                                Q(e, t, !0);
                            },
                            te = (e, t) => {
                                Q(e, t, !1);
                            },
                            ne = (e, t) => {
                                const n = Array.from(e.children);
                                for (let e = 0; e < n.length; e++) {
                                    const o = n[e];
                                    if (o instanceof HTMLElement && Y(o, t)) return o;
                                }
                            },
                            oe = (e, t, n) => {
                                (n === `${parseInt(n)}` && (n = parseInt(n)),
                                    n || 0 === parseInt(n)
                                        ? e.style.setProperty(t, 'number' == typeof n ? `${n}px` : n)
                                        : e.style.removeProperty(t));
                            },
                            ie = function (e) {
                                let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 'flex';
                                e && (e.style.display = t);
                            },
                            re = (e) => {
                                e && (e.style.display = 'none');
                            },
                            se = function (e) {
                                let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 'block';
                                e &&
                                    new MutationObserver(() => {
                                        le(e, e.innerHTML, t);
                                    }).observe(e, { childList: !0, subtree: !0 });
                            },
                            ae = (e, t, n, o) => {
                                const i = e.querySelector(t);
                                i && i.style.setProperty(n, o);
                            },
                            le = function (e, t) {
                                t ? ie(e, arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : 'flex') : re(e);
                            },
                            ce = (e) => !(!e || !(e.offsetWidth || e.offsetHeight || e.getClientRects().length)),
                            ue = () => !ce(M()) && !ce(H()) && !ce(j()),
                            de = (e) => !!(e.scrollHeight > e.clientHeight),
                            pe = (e) => {
                                const t = window.getComputedStyle(e),
                                    n = parseFloat(t.getPropertyValue('animation-duration') || '0'),
                                    o = parseFloat(t.getPropertyValue('transition-duration') || '0');
                                return n > 0 || o > 0;
                            },
                            me = function (e) {
                                let t = arguments.length > 1 && void 0 !== arguments[1] && arguments[1];
                                const n = _();
                                n &&
                                    ce(n) &&
                                    (t && ((n.style.transition = 'none'), (n.style.width = '100%')),
                                    setTimeout(() => {
                                        ((n.style.transition = `width ${e / 1e3}s linear`), (n.style.width = '0%'));
                                    }, 10));
                            },
                            he = () => {
                                const e = _();
                                if (!e) return;
                                const t = parseInt(window.getComputedStyle(e).width);
                                (e.style.removeProperty('transition'), (e.style.width = '100%'));
                                const n = (t / parseInt(window.getComputedStyle(e).width)) * 100;
                                e.style.width = `${n}%`;
                            },
                            ge = () => 'undefined' == typeof window || 'undefined' == typeof document,
                            fe =
                                `\n <div aria-labelledby="${u.title}" aria-describedby="${u['html-container']}" class="${u.popup}" tabindex="-1">\n   <button type="button" class="${u.close}"></button>\n   <ul class="${u['progress-steps']}"></ul>\n   <div class="${u.icon}"></div>\n   <img class="${u.image}" />\n   <h2 class="${u.title}" id="${u.title}"></h2>\n   <div class="${u['html-container']}" id="${u['html-container']}"></div>\n   <input class="${u.input}" id="${u.input}" />\n   <input type="file" class="${u.file}" />\n   <div class="${u.range}">\n     <input type="range" />\n     <output></output>\n   </div>\n   <select class="${u.select}" id="${u.select}"></select>\n   <div class="${u.radio}"></div>\n   <label class="${u.checkbox}">\n     <input type="checkbox" id="${u.checkbox}" />\n     <span class="${u.label}"></span>\n   </label>\n   <textarea class="${u.textarea}" id="${u.textarea}"></textarea>\n   <div class="${u['validation-message']}" id="${u['validation-message']}"></div>\n   <div class="${u.actions}">\n     <div class="${u.loader}"></div>\n     <button type="button" class="${u.confirm}"></button>\n     <button type="button" class="${u.deny}"></button>\n     <button type="button" class="${u.cancel}"></button>\n   </div>\n   <div class="${u.footer}"></div>\n   <div class="${u['timer-progress-bar-container']}">\n     <div class="${u['timer-progress-bar']}"></div>\n   </div>\n </div>\n`.replace(
                                    /(^|\n)\s*/g,
                                    ''
                                ),
                            be = () => {
                                const e = A();
                                return (
                                    !!e &&
                                    (e.remove(),
                                    te([document.documentElement, document.body], [u['no-backdrop'], u['toast-shown'], u['has-column']]),
                                    !0)
                                );
                            },
                            ye = () => {
                                s.currentInstance.resetValidationMessage();
                            },
                            ve = () => {
                                const e = B(),
                                    t = ne(e, u.input),
                                    n = ne(e, u.file),
                                    o = e.querySelector(`.${u.range} input`),
                                    i = e.querySelector(`.${u.range} output`),
                                    r = ne(e, u.select),
                                    s = e.querySelector(`.${u.checkbox} input`),
                                    a = ne(e, u.textarea);
                                ((t.oninput = ye),
                                    (n.onchange = ye),
                                    (r.onchange = ye),
                                    (s.onchange = ye),
                                    (a.oninput = ye),
                                    (o.oninput = () => {
                                        (ye(), (i.value = o.value));
                                    }),
                                    (o.onchange = () => {
                                        (ye(), (i.value = o.value));
                                    }));
                            },
                            we = (e) => ('string' == typeof e ? document.querySelector(e) : e),
                            Ce = (e) => {
                                const t = B();
                                (t.setAttribute('role', e.toast ? 'alert' : 'dialog'),
                                    t.setAttribute('aria-live', e.toast ? 'polite' : 'assertive'),
                                    e.toast || t.setAttribute('aria-modal', 'true'));
                            },
                            Ae = (e) => {
                                'rtl' === window.getComputedStyle(e).direction && ee(A(), u.rtl);
                            },
                            ke = (e) => {
                                const t = be();
                                if (ge()) return void h('SweetAlert2 requires document to initialize');
                                const n = document.createElement('div');
                                ((n.className = u.container), t && ee(n, u['no-transition']), W(n, fe));
                                const o = we(e.target);
                                (o.appendChild(n), Ce(e), Ae(o), ve());
                            },
                            Ee = (e, t) => {
                                e instanceof HTMLElement ? t.appendChild(e) : 'object' == typeof e ? Be(e, t) : e && W(t, e);
                            },
                            Be = (e, t) => {
                                e.jquery ? xe(t, e) : W(t, e.toString());
                            },
                            xe = (e, t) => {
                                if (((e.textContent = ''), 0 in t)) for (let n = 0; n in t; n++) e.appendChild(t[n].cloneNode(!0));
                                else e.appendChild(t.cloneNode(!0));
                            },
                            Pe = (e, t) => {
                                const n = q(),
                                    o = D();
                                n &&
                                    o &&
                                    (t.showConfirmButton || t.showDenyButton || t.showCancelButton ? ie(n) : re(n),
                                    J(n, t, 'actions'),
                                    $e(n, o, t),
                                    W(o, t.loaderHtml || ''),
                                    J(o, t, 'loader'));
                            };
                        function $e(e, t, n) {
                            const o = M(),
                                i = H(),
                                r = j();
                            o &&
                                i &&
                                r &&
                                (Te(o, 'confirm', n),
                                Te(i, 'deny', n),
                                Te(r, 'cancel', n),
                                Le(o, i, r, n),
                                n.reverseButtons &&
                                    (n.toast
                                        ? (e.insertBefore(r, o), e.insertBefore(i, o))
                                        : (e.insertBefore(r, t), e.insertBefore(i, t), e.insertBefore(o, t))));
                        }
                        function Le(e, t, n, o) {
                            o.buttonsStyling
                                ? (ee([e, t, n], u.styled),
                                  o.confirmButtonColor && ((e.style.backgroundColor = o.confirmButtonColor), ee(e, u['default-outline'])),
                                  o.denyButtonColor && ((t.style.backgroundColor = o.denyButtonColor), ee(t, u['default-outline'])),
                                  o.cancelButtonColor && ((n.style.backgroundColor = o.cancelButtonColor), ee(n, u['default-outline'])))
                                : te([e, t, n], u.styled);
                        }
                        function Te(e, t, n) {
                            const o = p(t);
                            (le(e, n[`show${o}Button`], 'inline-block'),
                                W(e, n[`${t}ButtonText`] || ''),
                                e.setAttribute('aria-label', n[`${t}ButtonAriaLabel`] || ''),
                                (e.className = u[t]),
                                J(e, n, `${t}Button`));
                        }
                        const Se = (e, t) => {
                                const n = N();
                                n &&
                                    (W(n, t.closeButtonHtml || ''),
                                    J(n, t, 'closeButton'),
                                    le(n, t.showCloseButton),
                                    n.setAttribute('aria-label', t.closeButtonAriaLabel || ''));
                            },
                            Oe = (e, t) => {
                                const n = A();
                                n && (Me(n, t.backdrop), je(n, t.position), He(n, t.grow), J(n, t, 'container'));
                            };
                        function Me(e, t) {
                            'string' == typeof t
                                ? (e.style.background = t)
                                : t || ee([document.documentElement, document.body], u['no-backdrop']);
                        }
                        function je(e, t) {
                            t &&
                                (t in u
                                    ? ee(e, u[t])
                                    : (m('The "position" parameter is not valid, defaulting to "center"'), ee(e, u.center)));
                        }
                        function He(e, t) {
                            t && ee(e, u[`grow-${t}`]);
                        }
                        var Ie = { innerParams: new WeakMap(), domCache: new WeakMap() };
                        const De = ['input', 'file', 'range', 'select', 'radio', 'checkbox', 'textarea'],
                            qe = (e, t) => {
                                const n = B();
                                if (!n) return;
                                const o = Ie.innerParams.get(e),
                                    i = !o || t.input !== o.input;
                                (De.forEach((e) => {
                                    const o = ne(n, u[e]);
                                    o && (Ne(e, t.inputAttributes), (o.className = u[e]), i && re(o));
                                }),
                                    t.input && (i && Ve(t), Fe(t)));
                            },
                            Ve = (e) => {
                                if (!e.input) return;
                                if (!We[e.input])
                                    return void h(`Unexpected type of input! Expected ${Object.keys(We).join(' | ')}, got "${e.input}"`);
                                const t = ze(e.input);
                                if (!t) return;
                                const n = We[e.input](t, e);
                                (ie(t),
                                    e.inputAutoFocus &&
                                        setTimeout(() => {
                                            G(n);
                                        }));
                            },
                            _e = (e) => {
                                for (let t = 0; t < e.attributes.length; t++) {
                                    const n = e.attributes[t].name;
                                    ['id', 'type', 'value', 'style'].includes(n) || e.removeAttribute(n);
                                }
                            },
                            Ne = (e, t) => {
                                const n = B();
                                if (!n) return;
                                const o = X(n, e);
                                if (o) {
                                    _e(o);
                                    for (const e in t) o.setAttribute(e, t[e]);
                                }
                            },
                            Fe = (e) => {
                                if (!e.input) return;
                                const t = ze(e.input);
                                t && J(t, e, 'input');
                            },
                            Re = (e, t) => {
                                !e.placeholder && t.inputPlaceholder && (e.placeholder = t.inputPlaceholder);
                            },
                            Ue = (e, t, n) => {
                                if (n.inputLabel) {
                                    const o = document.createElement('label'),
                                        i = u['input-label'];
                                    (o.setAttribute('for', e.id),
                                        (o.className = i),
                                        'object' == typeof n.customClass && ee(o, n.customClass.inputLabel),
                                        (o.innerText = n.inputLabel),
                                        t.insertAdjacentElement('beforebegin', o));
                                }
                            },
                            ze = (e) => {
                                const t = B();
                                if (t) return ne(t, u[e] || u.input);
                            },
                            Ke = (e, t) => {
                                ['string', 'number'].includes(typeof t)
                                    ? (e.value = `${t}`)
                                    : C(t) ||
                                      m(`Unexpected type of inputValue! Expected "string", "number" or "Promise", got "${typeof t}"`);
                            },
                            We = {};
                        ((We.text =
                            We.email =
                            We.password =
                            We.number =
                            We.tel =
                            We.url =
                            We.search =
                            We.date =
                            We['datetime-local'] =
                            We.time =
                            We.week =
                            We.month =
                                (e, t) => (Ke(e, t.inputValue), Ue(e, e, t), Re(e, t), (e.type = t.input), e)),
                            (We.file = (e, t) => (Ue(e, e, t), Re(e, t), e)),
                            (We.range = (e, t) => {
                                const n = e.querySelector('input'),
                                    o = e.querySelector('output');
                                return (Ke(n, t.inputValue), (n.type = t.input), Ke(o, t.inputValue), Ue(n, e, t), e);
                            }),
                            (We.select = (e, t) => {
                                if (((e.textContent = ''), t.inputPlaceholder)) {
                                    const n = document.createElement('option');
                                    (W(n, t.inputPlaceholder), (n.value = ''), (n.disabled = !0), (n.selected = !0), e.appendChild(n));
                                }
                                return (Ue(e, e, t), e);
                            }),
                            (We.radio = (e) => ((e.textContent = ''), e)),
                            (We.checkbox = (e, t) => {
                                const n = X(B(), 'checkbox');
                                ((n.value = '1'), (n.checked = Boolean(t.inputValue)));
                                const o = e.querySelector('span');
                                return (W(o, t.inputPlaceholder || t.inputLabel), n);
                            }),
                            (We.textarea = (e, t) => {
                                (Ke(e, t.inputValue), Re(e, t), Ue(e, e, t));
                                const n = (e) =>
                                    parseInt(window.getComputedStyle(e).marginLeft) + parseInt(window.getComputedStyle(e).marginRight);
                                return (
                                    setTimeout(() => {
                                        if ('MutationObserver' in window) {
                                            const o = parseInt(window.getComputedStyle(B()).width);
                                            new MutationObserver(() => {
                                                if (!document.body.contains(e)) return;
                                                const i = e.offsetWidth + n(e);
                                                i > o ? (B().style.width = `${i}px`) : oe(B(), 'width', t.width);
                                            }).observe(e, { attributes: !0, attributeFilter: ['style'] });
                                        }
                                    }),
                                    e
                                );
                            }));
                        const Ye = (e, t) => {
                                const n = L();
                                n &&
                                    (se(n),
                                    J(n, t, 'htmlContainer'),
                                    t.html ? (Ee(t.html, n), ie(n, 'block')) : t.text ? ((n.textContent = t.text), ie(n, 'block')) : re(n),
                                    qe(e, t));
                            },
                            Ze = (e, t) => {
                                const n = V();
                                n && (se(n), le(n, t.footer, 'block'), t.footer && Ee(t.footer, n), J(n, t, 'footer'));
                            },
                            Je = (e, t) => {
                                const n = Ie.innerParams.get(e),
                                    o = x();
                                if (o) {
                                    if (n && t.icon === n.icon) return (tt(o, t), void Xe(o, t));
                                    if (t.icon || t.iconHtml) {
                                        if (t.icon && -1 === Object.keys(d).indexOf(t.icon))
                                            return (
                                                h(
                                                    `Unknown icon! Expected "success", "error", "warning", "info" or "question", got "${t.icon}"`
                                                ),
                                                void re(o)
                                            );
                                        (ie(o), tt(o, t), Xe(o, t), ee(o, t.showClass && t.showClass.icon));
                                    } else re(o);
                                }
                            },
                            Xe = (e, t) => {
                                for (const [n, o] of Object.entries(d)) t.icon !== n && te(e, o);
                                (ee(e, t.icon && d[t.icon]), nt(e, t), Ge(), J(e, t, 'icon'));
                            },
                            Ge = () => {
                                const e = B();
                                if (!e) return;
                                const t = window.getComputedStyle(e).getPropertyValue('background-color'),
                                    n = e.querySelectorAll('[class^=swal2-success-circular-line], .swal2-success-fix');
                                for (let e = 0; e < n.length; e++) n[e].style.backgroundColor = t;
                            },
                            Qe =
                                '\n  <div class="swal2-success-circular-line-left"></div>\n  <span class="swal2-success-line-tip"></span> <span class="swal2-success-line-long"></span>\n  <div class="swal2-success-ring"></div> <div class="swal2-success-fix"></div>\n  <div class="swal2-success-circular-line-right"></div>\n',
                            et =
                                '\n  <span class="swal2-x-mark">\n    <span class="swal2-x-mark-line-left"></span>\n    <span class="swal2-x-mark-line-right"></span>\n  </span>\n',
                            tt = (e, t) => {
                                if (!t.icon && !t.iconHtml) return;
                                let n = e.innerHTML,
                                    o = '';
                                (t.iconHtml
                                    ? (o = ot(t.iconHtml))
                                    : 'success' === t.icon
                                      ? ((o = Qe), (n = n.replace(/ style=".*?"/g, '')))
                                      : 'error' === t.icon
                                        ? (o = et)
                                        : t.icon && (o = ot({ question: '?', warning: '!', info: 'i' }[t.icon])),
                                    n.trim() !== o.trim() && W(e, o));
                            },
                            nt = (e, t) => {
                                if (t.iconColor) {
                                    ((e.style.color = t.iconColor), (e.style.borderColor = t.iconColor));
                                    for (const n of [
                                        '.swal2-success-line-tip',
                                        '.swal2-success-line-long',
                                        '.swal2-x-mark-line-left',
                                        '.swal2-x-mark-line-right',
                                    ])
                                        ae(e, n, 'background-color', t.iconColor);
                                    ae(e, '.swal2-success-ring', 'border-color', t.iconColor);
                                }
                            },
                            ot = (e) => `<div class="${u['icon-content']}">${e}</div>`,
                            it = (e, t) => {
                                const n = T();
                                n &&
                                    (t.imageUrl
                                        ? (ie(n, ''),
                                          n.setAttribute('src', t.imageUrl),
                                          n.setAttribute('alt', t.imageAlt || ''),
                                          oe(n, 'width', t.imageWidth),
                                          oe(n, 'height', t.imageHeight),
                                          (n.className = u.image),
                                          J(n, t, 'image'))
                                        : re(n));
                            },
                            rt = (e, t) => {
                                const n = A(),
                                    o = B();
                                if (n && o) {
                                    if (t.toast) {
                                        (oe(n, 'width', t.width), (o.style.width = '100%'));
                                        const e = D();
                                        e && o.insertBefore(e, x());
                                    } else oe(o, 'width', t.width);
                                    (oe(o, 'padding', t.padding),
                                        t.color && (o.style.color = t.color),
                                        t.background && (o.style.background = t.background),
                                        re(O()),
                                        st(o, t));
                                }
                            },
                            st = (e, t) => {
                                const n = t.showClass || {};
                                ((e.className = `${u.popup} ${ce(e) ? n.popup : ''}`),
                                    t.toast
                                        ? (ee([document.documentElement, document.body], u['toast-shown']), ee(e, u.toast))
                                        : ee(e, u.modal),
                                    J(e, t, 'popup'),
                                    'string' == typeof t.customClass && ee(e, t.customClass),
                                    t.icon && ee(e, u[`icon-${t.icon}`]));
                            },
                            at = (e, t) => {
                                const n = S();
                                if (!n) return;
                                const { progressSteps: o, currentProgressStep: i } = t;
                                o && 0 !== o.length && void 0 !== i
                                    ? (ie(n),
                                      (n.textContent = ''),
                                      i >= o.length &&
                                          m(
                                              'Invalid currentProgressStep parameter, it should be less than progressSteps.length (currentProgressStep like JS arrays starts from 0)'
                                          ),
                                      o.forEach((e, r) => {
                                          const s = lt(e);
                                          if ((n.appendChild(s), r === i && ee(s, u['active-progress-step']), r !== o.length - 1)) {
                                              const e = ct(t);
                                              n.appendChild(e);
                                          }
                                      }))
                                    : re(n);
                            },
                            lt = (e) => {
                                const t = document.createElement('li');
                                return (ee(t, u['progress-step']), W(t, e), t);
                            },
                            ct = (e) => {
                                const t = document.createElement('li');
                                return (
                                    ee(t, u['progress-step-line']),
                                    e.progressStepsDistance && oe(t, 'width', e.progressStepsDistance),
                                    t
                                );
                            },
                            ut = (e, t) => {
                                const n = $();
                                n &&
                                    (se(n),
                                    le(n, t.title || t.titleText, 'block'),
                                    t.title && Ee(t.title, n),
                                    t.titleText && (n.innerText = t.titleText),
                                    J(n, t, 'title'));
                            },
                            dt = (e, t) => {
                                (rt(e, t), Oe(e, t), at(e, t), Je(e, t), it(e, t), ut(e, t), Se(e, t), Ye(e, t), Pe(e, t), Ze(e, t));
                                const n = B();
                                ('function' == typeof t.didRender && n && t.didRender(n), s.eventEmitter.emit('didRender', n));
                            },
                            pt = () => ce(B()),
                            mt = () => {
                                var e;
                                return null === (e = M()) || void 0 === e ? void 0 : e.click();
                            },
                            ht = () => {
                                var e;
                                return null === (e = H()) || void 0 === e ? void 0 : e.click();
                            },
                            gt = () => {
                                var e;
                                return null === (e = j()) || void 0 === e ? void 0 : e.click();
                            },
                            ft = Object.freeze({ cancel: 'cancel', backdrop: 'backdrop', close: 'close', esc: 'esc', timer: 'timer' }),
                            bt = (e) => {
                                e.keydownTarget &&
                                    e.keydownHandlerAdded &&
                                    (e.keydownTarget.removeEventListener('keydown', e.keydownHandler, {
                                        capture: e.keydownListenerCapture,
                                    }),
                                    (e.keydownHandlerAdded = !1));
                            },
                            yt = (e, t, n) => {
                                (bt(e),
                                    t.toast ||
                                        ((e.keydownHandler = (e) => At(t, e, n)),
                                        (e.keydownTarget = t.keydownListenerCapture ? window : B()),
                                        (e.keydownListenerCapture = t.keydownListenerCapture),
                                        e.keydownTarget.addEventListener('keydown', e.keydownHandler, {
                                            capture: e.keydownListenerCapture,
                                        }),
                                        (e.keydownHandlerAdded = !0)));
                            },
                            vt = (e, t) => {
                                var n;
                                const o = R();
                                if (o.length) return ((e += t) === o.length ? (e = 0) : -1 === e && (e = o.length - 1), void o[e].focus());
                                null === (n = B()) || void 0 === n || n.focus();
                            },
                            wt = ['ArrowRight', 'ArrowDown'],
                            Ct = ['ArrowLeft', 'ArrowUp'],
                            At = (e, t, n) => {
                                e &&
                                    (t.isComposing ||
                                        229 === t.keyCode ||
                                        (e.stopKeydownPropagation && t.stopPropagation(),
                                        'Enter' === t.key
                                            ? kt(t, e)
                                            : 'Tab' === t.key
                                              ? Et(t)
                                              : [...wt, ...Ct].includes(t.key)
                                                ? Bt(t.key)
                                                : 'Escape' === t.key && xt(t, e, n)));
                            },
                            kt = (e, t) => {
                                if (!y(t.allowEnterKey)) return;
                                const n = X(B(), t.input);
                                if (e.target && n && e.target instanceof HTMLElement && e.target.outerHTML === n.outerHTML) {
                                    if (['textarea', 'file'].includes(t.input)) return;
                                    (mt(), e.preventDefault());
                                }
                            },
                            Et = (e) => {
                                const t = e.target,
                                    n = R();
                                let o = -1;
                                for (let e = 0; e < n.length; e++)
                                    if (t === n[e]) {
                                        o = e;
                                        break;
                                    }
                                (e.shiftKey ? vt(o, -1) : vt(o, 1), e.stopPropagation(), e.preventDefault());
                            },
                            Bt = (e) => {
                                const t = q(),
                                    n = M(),
                                    o = H(),
                                    i = j();
                                if (!(t && n && o && i)) return;
                                const r = [n, o, i];
                                if (document.activeElement instanceof HTMLElement && !r.includes(document.activeElement)) return;
                                const s = wt.includes(e) ? 'nextElementSibling' : 'previousElementSibling';
                                let a = document.activeElement;
                                if (a) {
                                    for (let e = 0; e < t.children.length; e++) {
                                        if (((a = a[s]), !a)) return;
                                        if (a instanceof HTMLButtonElement && ce(a)) break;
                                    }
                                    a instanceof HTMLButtonElement && a.focus();
                                }
                            },
                            xt = (e, t, n) => {
                                y(t.allowEscapeKey) && (e.preventDefault(), n(ft.esc));
                            };
                        var Pt = { swalPromiseResolve: new WeakMap(), swalPromiseReject: new WeakMap() };
                        const $t = () => {
                                const e = A();
                                Array.from(document.body.children).forEach((t) => {
                                    t.contains(e) ||
                                        (t.hasAttribute('aria-hidden') &&
                                            t.setAttribute('data-previous-aria-hidden', t.getAttribute('aria-hidden') || ''),
                                        t.setAttribute('aria-hidden', 'true'));
                                });
                            },
                            Lt = () => {
                                Array.from(document.body.children).forEach((e) => {
                                    e.hasAttribute('data-previous-aria-hidden')
                                        ? (e.setAttribute('aria-hidden', e.getAttribute('data-previous-aria-hidden') || ''),
                                          e.removeAttribute('data-previous-aria-hidden'))
                                        : e.removeAttribute('aria-hidden');
                                });
                            },
                            Tt = 'undefined' != typeof window && !!window.GestureEvent,
                            St = () => {
                                if (Tt && !Y(document.body, u.iosfix)) {
                                    const e = document.body.scrollTop;
                                    ((document.body.style.top = -1 * e + 'px'), ee(document.body, u.iosfix), Ot());
                                }
                            },
                            Ot = () => {
                                const e = A();
                                if (!e) return;
                                let t;
                                ((e.ontouchstart = (e) => {
                                    t = Mt(e);
                                }),
                                    (e.ontouchmove = (e) => {
                                        t && (e.preventDefault(), e.stopPropagation());
                                    }));
                            },
                            Mt = (e) => {
                                const t = e.target,
                                    n = A(),
                                    o = L();
                                return !(
                                    !n ||
                                    !o ||
                                    jt(e) ||
                                    Ht(e) ||
                                    (t !== n &&
                                        (de(n) ||
                                            !(t instanceof HTMLElement) ||
                                            'INPUT' === t.tagName ||
                                            'TEXTAREA' === t.tagName ||
                                            (de(o) && o.contains(t))))
                                );
                            },
                            jt = (e) => e.touches && e.touches.length && 'stylus' === e.touches[0].touchType,
                            Ht = (e) => e.touches && e.touches.length > 1,
                            It = () => {
                                if (Y(document.body, u.iosfix)) {
                                    const e = parseInt(document.body.style.top, 10);
                                    (te(document.body, u.iosfix), (document.body.style.top = ''), (document.body.scrollTop = -1 * e));
                                }
                            },
                            Dt = () => {
                                const e = document.createElement('div');
                                ((e.className = u['scrollbar-measure']), document.body.appendChild(e));
                                const t = e.getBoundingClientRect().width - e.clientWidth;
                                return (document.body.removeChild(e), t);
                            };
                        let qt = null;
                        const Vt = (e) => {
                                null === qt &&
                                    (document.body.scrollHeight > window.innerHeight || 'scroll' === e) &&
                                    ((qt = parseInt(window.getComputedStyle(document.body).getPropertyValue('padding-right'))),
                                    (document.body.style.paddingRight = `${qt + Dt()}px`));
                            },
                            _t = () => {
                                null !== qt && ((document.body.style.paddingRight = `${qt}px`), (qt = null));
                            };
                        function Nt(e, t, n, o) {
                            (z() ? Jt(e, o) : (l(n).then(() => Jt(e, o)), bt(s)),
                                Tt
                                    ? (t.setAttribute('style', 'display:none !important'), t.removeAttribute('class'), (t.innerHTML = ''))
                                    : t.remove(),
                                U() && (_t(), It(), Lt()),
                                Ft());
                        }
                        function Ft() {
                            te([document.documentElement, document.body], [u.shown, u['height-auto'], u['no-backdrop'], u['toast-shown']]);
                        }
                        function Rt(e) {
                            e = Wt(e);
                            const t = Pt.swalPromiseResolve.get(this),
                                n = Ut(this);
                            this.isAwaitingPromise ? e.isDismissed || (Kt(this), t(e)) : n && t(e);
                        }
                        const Ut = (e) => {
                            const t = B();
                            if (!t) return !1;
                            const n = Ie.innerParams.get(e);
                            if (!n || Y(t, n.hideClass.popup)) return !1;
                            (te(t, n.showClass.popup), ee(t, n.hideClass.popup));
                            const o = A();
                            return (te(o, n.showClass.backdrop), ee(o, n.hideClass.backdrop), Yt(e, t, n), !0);
                        };
                        function zt(e) {
                            const t = Pt.swalPromiseReject.get(this);
                            (Kt(this), t && t(e));
                        }
                        const Kt = (e) => {
                                e.isAwaitingPromise && (delete e.isAwaitingPromise, Ie.innerParams.get(e) || e._destroy());
                            },
                            Wt = (e) =>
                                void 0 === e
                                    ? { isConfirmed: !1, isDenied: !1, isDismissed: !0 }
                                    : Object.assign({ isConfirmed: !1, isDenied: !1, isDismissed: !1 }, e),
                            Yt = (e, t, n) => {
                                var o;
                                const i = A(),
                                    r = pe(t);
                                ('function' == typeof n.willClose && n.willClose(t),
                                    null === (o = s.eventEmitter) || void 0 === o || o.emit('willClose', t),
                                    r ? Zt(e, t, i, n.returnFocus, n.didClose) : Nt(e, i, n.returnFocus, n.didClose));
                            },
                            Zt = (e, t, n, o, i) => {
                                s.swalCloseEventFinishedCallback = Nt.bind(null, e, n, o, i);
                                const r = function (e) {
                                    var n;
                                    e.target === t &&
                                        (null === (n = s.swalCloseEventFinishedCallback) || void 0 === n || n.call(s),
                                        delete s.swalCloseEventFinishedCallback,
                                        t.removeEventListener('animationend', r),
                                        t.removeEventListener('transitionend', r));
                                };
                                (t.addEventListener('animationend', r), t.addEventListener('transitionend', r));
                            },
                            Jt = (e, t) => {
                                setTimeout(() => {
                                    var n;
                                    ('function' == typeof t && t.bind(e.params)(),
                                        null === (n = s.eventEmitter) || void 0 === n || n.emit('didClose'),
                                        e._destroy && e._destroy());
                                });
                            },
                            Xt = (e) => {
                                let t = B();
                                if ((t || new ni(), (t = B()), !t)) return;
                                const n = D();
                                (z() ? re(x()) : Gt(t, e),
                                    ie(n),
                                    t.setAttribute('data-loading', 'true'),
                                    t.setAttribute('aria-busy', 'true'),
                                    t.focus());
                            },
                            Gt = (e, t) => {
                                const n = q(),
                                    o = D();
                                n &&
                                    o &&
                                    (!t && ce(M()) && (t = M()),
                                    ie(n),
                                    t && (re(t), o.setAttribute('data-button-to-replace', t.className), n.insertBefore(o, t)),
                                    ee([e, n], u.loading));
                            },
                            Qt = (e, t) => {
                                'select' === t.input || 'radio' === t.input
                                    ? rn(e, t)
                                    : ['text', 'email', 'number', 'tel', 'textarea'].some((e) => e === t.input) &&
                                      (v(t.inputValue) || C(t.inputValue)) &&
                                      (Xt(M()), sn(e, t));
                            },
                            en = (e, t) => {
                                const n = e.getInput();
                                if (!n) return null;
                                switch (t.input) {
                                    case 'checkbox':
                                        return tn(n);
                                    case 'radio':
                                        return nn(n);
                                    case 'file':
                                        return on(n);
                                    default:
                                        return t.inputAutoTrim ? n.value.trim() : n.value;
                                }
                            },
                            tn = (e) => (e.checked ? 1 : 0),
                            nn = (e) => (e.checked ? e.value : null),
                            on = (e) => (e.files && e.files.length ? (null !== e.getAttribute('multiple') ? e.files : e.files[0]) : null),
                            rn = (e, t) => {
                                const n = B();
                                if (!n) return;
                                const o = (e) => {
                                    'select' === t.input ? an(n, cn(e), t) : 'radio' === t.input && ln(n, cn(e), t);
                                };
                                v(t.inputOptions) || C(t.inputOptions)
                                    ? (Xt(M()),
                                      w(t.inputOptions).then((t) => {
                                          (e.hideLoading(), o(t));
                                      }))
                                    : 'object' == typeof t.inputOptions
                                      ? o(t.inputOptions)
                                      : h('Unexpected type of inputOptions! Expected object, Map or Promise, got ' + typeof t.inputOptions);
                            },
                            sn = (e, t) => {
                                const n = e.getInput();
                                n &&
                                    (re(n),
                                    w(t.inputValue)
                                        .then((o) => {
                                            ((n.value = 'number' === t.input ? `${parseFloat(o) || 0}` : `${o}`),
                                                ie(n),
                                                n.focus(),
                                                e.hideLoading());
                                        })
                                        .catch((t) => {
                                            (h(`Error in inputValue promise: ${t}`), (n.value = ''), ie(n), n.focus(), e.hideLoading());
                                        }));
                            };
                        function an(e, t, n) {
                            const o = ne(e, u.select);
                            if (!o) return;
                            const i = (e, t, o) => {
                                const i = document.createElement('option');
                                ((i.value = o), W(i, t), (i.selected = un(o, n.inputValue)), e.appendChild(i));
                            };
                            (t.forEach((e) => {
                                const t = e[0],
                                    n = e[1];
                                if (Array.isArray(n)) {
                                    const e = document.createElement('optgroup');
                                    ((e.label = t), (e.disabled = !1), o.appendChild(e), n.forEach((t) => i(e, t[1], t[0])));
                                } else i(o, n, t);
                            }),
                                o.focus());
                        }
                        function ln(e, t, n) {
                            const o = ne(e, u.radio);
                            if (!o) return;
                            t.forEach((e) => {
                                const t = e[0],
                                    i = e[1],
                                    r = document.createElement('input'),
                                    s = document.createElement('label');
                                ((r.type = 'radio'), (r.name = u.radio), (r.value = t), un(t, n.inputValue) && (r.checked = !0));
                                const a = document.createElement('span');
                                (W(a, i), (a.className = u.label), s.appendChild(r), s.appendChild(a), o.appendChild(s));
                            });
                            const i = o.querySelectorAll('input');
                            i.length && i[0].focus();
                        }
                        const cn = (e) => {
                                const t = [];
                                return (
                                    e instanceof Map
                                        ? e.forEach((e, n) => {
                                              let o = e;
                                              ('object' == typeof o && (o = cn(o)), t.push([n, o]));
                                          })
                                        : Object.keys(e).forEach((n) => {
                                              let o = e[n];
                                              ('object' == typeof o && (o = cn(o)), t.push([n, o]));
                                          }),
                                    t
                                );
                            },
                            un = (e, t) => !!t && t.toString() === e.toString(),
                            dn = (e) => {
                                const t = Ie.innerParams.get(e);
                                (e.disableButtons(), t.input ? hn(e, 'confirm') : vn(e, !0));
                            },
                            pn = (e) => {
                                const t = Ie.innerParams.get(e);
                                (e.disableButtons(), t.returnInputValueOnDeny ? hn(e, 'deny') : fn(e, !1));
                            },
                            mn = (e, t) => {
                                (e.disableButtons(), t(ft.cancel));
                            },
                            hn = (e, t) => {
                                const n = Ie.innerParams.get(e);
                                if (!n.input)
                                    return void h(`The "input" parameter is needed to be set when using returnInputValueOn${p(t)}`);
                                const o = e.getInput(),
                                    i = en(e, n);
                                n.inputValidator
                                    ? gn(e, i, t)
                                    : o && !o.checkValidity()
                                      ? (e.enableButtons(), e.showValidationMessage(n.validationMessage || o.validationMessage))
                                      : 'deny' === t
                                        ? fn(e, i)
                                        : vn(e, i);
                            },
                            gn = (e, t, n) => {
                                const o = Ie.innerParams.get(e);
                                (e.disableInput(),
                                    Promise.resolve()
                                        .then(() => w(o.inputValidator(t, o.validationMessage)))
                                        .then((o) => {
                                            (e.enableButtons(),
                                                e.enableInput(),
                                                o ? e.showValidationMessage(o) : 'deny' === n ? fn(e, t) : vn(e, t));
                                        }));
                            },
                            fn = (e, t) => {
                                const n = Ie.innerParams.get(e || void 0);
                                (n.showLoaderOnDeny && Xt(H()),
                                    n.preDeny
                                        ? ((e.isAwaitingPromise = !0),
                                          Promise.resolve()
                                              .then(() => w(n.preDeny(t, n.validationMessage)))
                                              .then((n) => {
                                                  !1 === n
                                                      ? (e.hideLoading(), Kt(e))
                                                      : e.close({ isDenied: !0, value: void 0 === n ? t : n });
                                              })
                                              .catch((t) => yn(e || void 0, t)))
                                        : e.close({ isDenied: !0, value: t }));
                            },
                            bn = (e, t) => {
                                e.close({ isConfirmed: !0, value: t });
                            },
                            yn = (e, t) => {
                                e.rejectPromise(t);
                            },
                            vn = (e, t) => {
                                const n = Ie.innerParams.get(e || void 0);
                                (n.showLoaderOnConfirm && Xt(),
                                    n.preConfirm
                                        ? (e.resetValidationMessage(),
                                          (e.isAwaitingPromise = !0),
                                          Promise.resolve()
                                              .then(() => w(n.preConfirm(t, n.validationMessage)))
                                              .then((n) => {
                                                  ce(O()) || !1 === n ? (e.hideLoading(), Kt(e)) : bn(e, void 0 === n ? t : n);
                                              })
                                              .catch((t) => yn(e || void 0, t)))
                                        : bn(e, t));
                            };
                        function wn() {
                            const e = Ie.innerParams.get(this);
                            if (!e) return;
                            const t = Ie.domCache.get(this);
                            (re(t.loader),
                                z() ? e.icon && ie(x()) : Cn(t),
                                te([t.popup, t.actions], u.loading),
                                t.popup.removeAttribute('aria-busy'),
                                t.popup.removeAttribute('data-loading'),
                                (t.confirmButton.disabled = !1),
                                (t.denyButton.disabled = !1),
                                (t.cancelButton.disabled = !1));
                        }
                        const Cn = (e) => {
                            const t = e.popup.getElementsByClassName(e.loader.getAttribute('data-button-to-replace'));
                            t.length ? ie(t[0], 'inline-block') : ue() && re(e.actions);
                        };
                        function An() {
                            const e = Ie.innerParams.get(this),
                                t = Ie.domCache.get(this);
                            return t ? X(t.popup, e.input) : null;
                        }
                        function kn(e, t, n) {
                            const o = Ie.domCache.get(e);
                            t.forEach((e) => {
                                o[e].disabled = n;
                            });
                        }
                        function En(e, t) {
                            const n = B();
                            if (n && e)
                                if ('radio' === e.type) {
                                    const e = n.querySelectorAll(`[name="${u.radio}"]`);
                                    for (let n = 0; n < e.length; n++) e[n].disabled = t;
                                } else e.disabled = t;
                        }
                        function Bn() {
                            kn(this, ['confirmButton', 'denyButton', 'cancelButton'], !1);
                        }
                        function xn() {
                            kn(this, ['confirmButton', 'denyButton', 'cancelButton'], !0);
                        }
                        function Pn() {
                            En(this.getInput(), !1);
                        }
                        function $n() {
                            En(this.getInput(), !0);
                        }
                        function Ln(e) {
                            const t = Ie.domCache.get(this),
                                n = Ie.innerParams.get(this);
                            (W(t.validationMessage, e),
                                (t.validationMessage.className = u['validation-message']),
                                n.customClass &&
                                    n.customClass.validationMessage &&
                                    ee(t.validationMessage, n.customClass.validationMessage),
                                ie(t.validationMessage));
                            const o = this.getInput();
                            o &&
                                (o.setAttribute('aria-invalid', 'true'),
                                o.setAttribute('aria-describedby', u['validation-message']),
                                G(o),
                                ee(o, u.inputerror));
                        }
                        function Tn() {
                            const e = Ie.domCache.get(this);
                            e.validationMessage && re(e.validationMessage);
                            const t = this.getInput();
                            t && (t.removeAttribute('aria-invalid'), t.removeAttribute('aria-describedby'), te(t, u.inputerror));
                        }
                        const Sn = {
                                title: '',
                                titleText: '',
                                text: '',
                                html: '',
                                footer: '',
                                icon: void 0,
                                iconColor: void 0,
                                iconHtml: void 0,
                                template: void 0,
                                toast: !1,
                                animation: !0,
                                showClass: { popup: 'swal2-show', backdrop: 'swal2-backdrop-show', icon: 'swal2-icon-show' },
                                hideClass: { popup: 'swal2-hide', backdrop: 'swal2-backdrop-hide', icon: 'swal2-icon-hide' },
                                customClass: {},
                                target: 'body',
                                color: void 0,
                                backdrop: !0,
                                heightAuto: !0,
                                allowOutsideClick: !0,
                                allowEscapeKey: !0,
                                allowEnterKey: !0,
                                stopKeydownPropagation: !0,
                                keydownListenerCapture: !1,
                                showConfirmButton: !0,
                                showDenyButton: !1,
                                showCancelButton: !1,
                                preConfirm: void 0,
                                preDeny: void 0,
                                confirmButtonText: 'OK',
                                confirmButtonAriaLabel: '',
                                confirmButtonColor: void 0,
                                denyButtonText: 'No',
                                denyButtonAriaLabel: '',
                                denyButtonColor: void 0,
                                cancelButtonText: 'Cancel',
                                cancelButtonAriaLabel: '',
                                cancelButtonColor: void 0,
                                buttonsStyling: !0,
                                reverseButtons: !1,
                                focusConfirm: !0,
                                focusDeny: !1,
                                focusCancel: !1,
                                returnFocus: !0,
                                showCloseButton: !1,
                                closeButtonHtml: '&times;',
                                closeButtonAriaLabel: 'Close this dialog',
                                loaderHtml: '',
                                showLoaderOnConfirm: !1,
                                showLoaderOnDeny: !1,
                                imageUrl: void 0,
                                imageWidth: void 0,
                                imageHeight: void 0,
                                imageAlt: '',
                                timer: void 0,
                                timerProgressBar: !1,
                                width: void 0,
                                padding: void 0,
                                background: void 0,
                                input: void 0,
                                inputPlaceholder: '',
                                inputLabel: '',
                                inputValue: '',
                                inputOptions: {},
                                inputAutoFocus: !0,
                                inputAutoTrim: !0,
                                inputAttributes: {},
                                inputValidator: void 0,
                                returnInputValueOnDeny: !1,
                                validationMessage: void 0,
                                grow: !1,
                                position: 'center',
                                progressSteps: [],
                                currentProgressStep: void 0,
                                progressStepsDistance: void 0,
                                willOpen: void 0,
                                didOpen: void 0,
                                didRender: void 0,
                                willClose: void 0,
                                didClose: void 0,
                                didDestroy: void 0,
                                scrollbarPadding: !0,
                            },
                            On = [
                                'allowEscapeKey',
                                'allowOutsideClick',
                                'background',
                                'buttonsStyling',
                                'cancelButtonAriaLabel',
                                'cancelButtonColor',
                                'cancelButtonText',
                                'closeButtonAriaLabel',
                                'closeButtonHtml',
                                'color',
                                'confirmButtonAriaLabel',
                                'confirmButtonColor',
                                'confirmButtonText',
                                'currentProgressStep',
                                'customClass',
                                'denyButtonAriaLabel',
                                'denyButtonColor',
                                'denyButtonText',
                                'didClose',
                                'didDestroy',
                                'footer',
                                'hideClass',
                                'html',
                                'icon',
                                'iconColor',
                                'iconHtml',
                                'imageAlt',
                                'imageHeight',
                                'imageUrl',
                                'imageWidth',
                                'preConfirm',
                                'preDeny',
                                'progressSteps',
                                'returnFocus',
                                'reverseButtons',
                                'showCancelButton',
                                'showCloseButton',
                                'showConfirmButton',
                                'showDenyButton',
                                'text',
                                'title',
                                'titleText',
                                'willClose',
                            ],
                            Mn = { allowEnterKey: void 0 },
                            jn = [
                                'allowOutsideClick',
                                'allowEnterKey',
                                'backdrop',
                                'focusConfirm',
                                'focusDeny',
                                'focusCancel',
                                'returnFocus',
                                'heightAuto',
                                'keydownListenerCapture',
                            ],
                            Hn = (e) => Object.prototype.hasOwnProperty.call(Sn, e),
                            In = (e) => -1 !== On.indexOf(e),
                            Dn = (e) => Mn[e],
                            qn = (e) => {
                                Hn(e) || m(`Unknown parameter "${e}"`);
                            },
                            Vn = (e) => {
                                jn.includes(e) && m(`The parameter "${e}" is incompatible with toasts`);
                            },
                            _n = (e) => {
                                const t = Dn(e);
                                t && b(e, t);
                            },
                            Nn = (e) => {
                                !1 === e.backdrop &&
                                    e.allowOutsideClick &&
                                    m('"allowOutsideClick" parameter requires `backdrop` parameter to be set to `true`');
                                for (const t in e) (qn(t), e.toast && Vn(t), _n(t));
                            };
                        function Fn(e) {
                            const t = B(),
                                n = Ie.innerParams.get(this);
                            if (!t || Y(t, n.hideClass.popup))
                                return void m(
                                    "You're trying to update the closed or closing popup, that won't work. Use the update() method in preConfirm parameter or show a new popup."
                                );
                            const o = Rn(e),
                                i = Object.assign({}, n, o);
                            (dt(this, i),
                                Ie.innerParams.set(this, i),
                                Object.defineProperties(this, {
                                    params: { value: Object.assign({}, this.params, e), writable: !1, enumerable: !0 },
                                }));
                        }
                        const Rn = (e) => {
                            const t = {};
                            return (
                                Object.keys(e).forEach((n) => {
                                    In(n) ? (t[n] = e[n]) : m(`Invalid parameter to update: ${n}`);
                                }),
                                t
                            );
                        };
                        function Un() {
                            const e = Ie.domCache.get(this),
                                t = Ie.innerParams.get(this);
                            t
                                ? (e.popup &&
                                      s.swalCloseEventFinishedCallback &&
                                      (s.swalCloseEventFinishedCallback(), delete s.swalCloseEventFinishedCallback),
                                  'function' == typeof t.didDestroy && t.didDestroy(),
                                  s.eventEmitter.emit('didDestroy'),
                                  zn(this))
                                : Kn(this);
                        }
                        const zn = (e) => {
                                (Kn(e), delete e.params, delete s.keydownHandler, delete s.keydownTarget, delete s.currentInstance);
                            },
                            Kn = (e) => {
                                e.isAwaitingPromise
                                    ? (Wn(Ie, e), (e.isAwaitingPromise = !0))
                                    : (Wn(Pt, e),
                                      Wn(Ie, e),
                                      delete e.isAwaitingPromise,
                                      delete e.disableButtons,
                                      delete e.enableButtons,
                                      delete e.getInput,
                                      delete e.disableInput,
                                      delete e.enableInput,
                                      delete e.hideLoading,
                                      delete e.disableLoading,
                                      delete e.showValidationMessage,
                                      delete e.resetValidationMessage,
                                      delete e.close,
                                      delete e.closePopup,
                                      delete e.closeModal,
                                      delete e.closeToast,
                                      delete e.rejectPromise,
                                      delete e.update,
                                      delete e._destroy);
                            },
                            Wn = (e, t) => {
                                for (const n in e) e[n].delete(t);
                            };
                        var Yn = Object.freeze({
                            __proto__: null,
                            _destroy: Un,
                            close: Rt,
                            closeModal: Rt,
                            closePopup: Rt,
                            closeToast: Rt,
                            disableButtons: xn,
                            disableInput: $n,
                            disableLoading: wn,
                            enableButtons: Bn,
                            enableInput: Pn,
                            getInput: An,
                            handleAwaitingPromise: Kt,
                            hideLoading: wn,
                            rejectPromise: zt,
                            resetValidationMessage: Tn,
                            showValidationMessage: Ln,
                            update: Fn,
                        });
                        const Zn = (e, t, n) => {
                                e.toast ? Jn(e, t, n) : (Qn(t), eo(t), to(e, t, n));
                            },
                            Jn = (e, t, n) => {
                                t.popup.onclick = () => {
                                    (e && (Xn(e) || e.timer || e.input)) || n(ft.close);
                                };
                            },
                            Xn = (e) => !!(e.showConfirmButton || e.showDenyButton || e.showCancelButton || e.showCloseButton);
                        let Gn = !1;
                        const Qn = (e) => {
                                e.popup.onmousedown = () => {
                                    e.container.onmouseup = function (t) {
                                        ((e.container.onmouseup = () => {}), t.target === e.container && (Gn = !0));
                                    };
                                };
                            },
                            eo = (e) => {
                                e.container.onmousedown = (t) => {
                                    (t.target === e.container && t.preventDefault(),
                                        (e.popup.onmouseup = function (t) {
                                            ((e.popup.onmouseup = () => {}),
                                                (t.target === e.popup || (t.target instanceof HTMLElement && e.popup.contains(t.target))) &&
                                                    (Gn = !0));
                                        }));
                                };
                            },
                            to = (e, t, n) => {
                                t.container.onclick = (o) => {
                                    Gn ? (Gn = !1) : o.target === t.container && y(e.allowOutsideClick) && n(ft.backdrop);
                                };
                            },
                            no = (e) => 'object' == typeof e && e.jquery,
                            oo = (e) => e instanceof Element || no(e),
                            io = (e) => {
                                const t = {};
                                return (
                                    'object' != typeof e[0] || oo(e[0])
                                        ? ['title', 'html', 'icon'].forEach((n, o) => {
                                              const i = e[o];
                                              'string' == typeof i || oo(i)
                                                  ? (t[n] = i)
                                                  : void 0 !== i &&
                                                    h(`Unexpected type of ${n}! Expected "string" or "Element", got ${typeof i}`);
                                          })
                                        : Object.assign(t, e[0]),
                                    t
                                );
                            };
                        function ro() {
                            for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
                            return new this(...t);
                        }
                        function so(e) {
                            class t extends this {
                                _main(t, n) {
                                    return super._main(t, Object.assign({}, e, n));
                                }
                            }
                            return t;
                        }
                        const ao = () => s.timeout && s.timeout.getTimerLeft(),
                            lo = () => {
                                if (s.timeout) return (he(), s.timeout.stop());
                            },
                            co = () => {
                                if (s.timeout) {
                                    const e = s.timeout.start();
                                    return (me(e), e);
                                }
                            },
                            uo = () => {
                                const e = s.timeout;
                                return e && (e.running ? lo() : co());
                            },
                            po = (e) => {
                                if (s.timeout) {
                                    const t = s.timeout.increase(e);
                                    return (me(t, !0), t);
                                }
                            },
                            mo = () => !(!s.timeout || !s.timeout.isRunning());
                        let ho = !1;
                        const go = {};
                        function fo() {
                            ((go[arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : 'data-swal-template'] = this),
                                ho || (document.body.addEventListener('click', bo), (ho = !0)));
                        }
                        const bo = (e) => {
                            for (let t = e.target; t && t !== document; t = t.parentNode)
                                for (const e in go) {
                                    const n = t.getAttribute(e);
                                    if (n) return void go[e].fire({ template: n });
                                }
                        };
                        class yo {
                            constructor() {
                                this.events = {};
                            }
                            _getHandlersByEventName(e) {
                                return (void 0 === this.events[e] && (this.events[e] = []), this.events[e]);
                            }
                            on(e, t) {
                                const n = this._getHandlersByEventName(e);
                                n.includes(t) || n.push(t);
                            }
                            once(e, t) {
                                var n = this;
                                const o = function () {
                                    n.removeListener(e, o);
                                    for (var i = arguments.length, r = new Array(i), s = 0; s < i; s++) r[s] = arguments[s];
                                    t.apply(n, r);
                                };
                                this.on(e, o);
                            }
                            emit(e) {
                                for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), o = 1; o < t; o++) n[o - 1] = arguments[o];
                                this._getHandlersByEventName(e).forEach((e) => {
                                    try {
                                        e.apply(this, n);
                                    } catch (e) {}
                                });
                            }
                            removeListener(e, t) {
                                const n = this._getHandlersByEventName(e),
                                    o = n.indexOf(t);
                                o > -1 && n.splice(o, 1);
                            }
                            removeAllListeners(e) {
                                void 0 !== this.events[e] && (this.events[e].length = 0);
                            }
                            reset() {
                                this.events = {};
                            }
                        }
                        s.eventEmitter = new yo();
                        const vo = (e, t) => {
                                s.eventEmitter.on(e, t);
                            },
                            wo = (e, t) => {
                                s.eventEmitter.once(e, t);
                            },
                            Co = (e, t) => {
                                e
                                    ? t
                                        ? s.eventEmitter.removeListener(e, t)
                                        : s.eventEmitter.removeAllListeners(e)
                                    : s.eventEmitter.reset();
                            };
                        var Ao = Object.freeze({
                            __proto__: null,
                            argsToParams: io,
                            bindClickHandler: fo,
                            clickCancel: gt,
                            clickConfirm: mt,
                            clickDeny: ht,
                            enableLoading: Xt,
                            fire: ro,
                            getActions: q,
                            getCancelButton: j,
                            getCloseButton: N,
                            getConfirmButton: M,
                            getContainer: A,
                            getDenyButton: H,
                            getFocusableElements: R,
                            getFooter: V,
                            getHtmlContainer: L,
                            getIcon: x,
                            getIconContent: P,
                            getImage: T,
                            getInputLabel: I,
                            getLoader: D,
                            getPopup: B,
                            getProgressSteps: S,
                            getTimerLeft: ao,
                            getTimerProgressBar: _,
                            getTitle: $,
                            getValidationMessage: O,
                            increaseTimer: po,
                            isDeprecatedParameter: Dn,
                            isLoading: K,
                            isTimerRunning: mo,
                            isUpdatableParameter: In,
                            isValidParameter: Hn,
                            isVisible: pt,
                            mixin: so,
                            off: Co,
                            on: vo,
                            once: wo,
                            resumeTimer: co,
                            showLoading: Xt,
                            stopTimer: lo,
                            toggleTimer: uo,
                        });
                        class ko {
                            constructor(e, t) {
                                ((this.callback = e), (this.remaining = t), (this.running = !1), this.start());
                            }
                            start() {
                                return (
                                    this.running ||
                                        ((this.running = !0),
                                        (this.started = new Date()),
                                        (this.id = setTimeout(this.callback, this.remaining))),
                                    this.remaining
                                );
                            }
                            stop() {
                                return (
                                    this.started &&
                                        this.running &&
                                        ((this.running = !1),
                                        clearTimeout(this.id),
                                        (this.remaining -= new Date().getTime() - this.started.getTime())),
                                    this.remaining
                                );
                            }
                            increase(e) {
                                const t = this.running;
                                return (t && this.stop(), (this.remaining += e), t && this.start(), this.remaining);
                            }
                            getTimerLeft() {
                                return (this.running && (this.stop(), this.start()), this.remaining);
                            }
                            isRunning() {
                                return this.running;
                            }
                        }
                        const Eo = ['swal-title', 'swal-html', 'swal-footer'],
                            Bo = (e) => {
                                const t = 'string' == typeof e.template ? document.querySelector(e.template) : e.template;
                                if (!t) return {};
                                const n = t.content;
                                return (Mo(n), Object.assign(xo(n), Po(n), $o(n), Lo(n), To(n), So(n), Oo(n, Eo)));
                            },
                            xo = (e) => {
                                const t = {};
                                return (
                                    Array.from(e.querySelectorAll('swal-param')).forEach((e) => {
                                        jo(e, ['name', 'value']);
                                        const n = e.getAttribute('name'),
                                            o = e.getAttribute('value');
                                        n &&
                                            o &&
                                            ('boolean' == typeof Sn[n]
                                                ? (t[n] = 'false' !== o)
                                                : 'object' == typeof Sn[n]
                                                  ? (t[n] = JSON.parse(o))
                                                  : (t[n] = o));
                                    }),
                                    t
                                );
                            },
                            Po = (e) => {
                                const t = {};
                                return (
                                    Array.from(e.querySelectorAll('swal-function-param')).forEach((e) => {
                                        const n = e.getAttribute('name'),
                                            o = e.getAttribute('value');
                                        n && o && (t[n] = new Function(`return ${o}`)());
                                    }),
                                    t
                                );
                            },
                            $o = (e) => {
                                const t = {};
                                return (
                                    Array.from(e.querySelectorAll('swal-button')).forEach((e) => {
                                        jo(e, ['type', 'color', 'aria-label']);
                                        const n = e.getAttribute('type');
                                        n &&
                                            ['confirm', 'cancel', 'deny'].includes(n) &&
                                            ((t[`${n}ButtonText`] = e.innerHTML),
                                            (t[`show${p(n)}Button`] = !0),
                                            e.hasAttribute('color') && (t[`${n}ButtonColor`] = e.getAttribute('color')),
                                            e.hasAttribute('aria-label') && (t[`${n}ButtonAriaLabel`] = e.getAttribute('aria-label')));
                                    }),
                                    t
                                );
                            },
                            Lo = (e) => {
                                const t = {},
                                    n = e.querySelector('swal-image');
                                return (
                                    n &&
                                        (jo(n, ['src', 'width', 'height', 'alt']),
                                        n.hasAttribute('src') && (t.imageUrl = n.getAttribute('src') || void 0),
                                        n.hasAttribute('width') && (t.imageWidth = n.getAttribute('width') || void 0),
                                        n.hasAttribute('height') && (t.imageHeight = n.getAttribute('height') || void 0),
                                        n.hasAttribute('alt') && (t.imageAlt = n.getAttribute('alt') || void 0)),
                                    t
                                );
                            },
                            To = (e) => {
                                const t = {},
                                    n = e.querySelector('swal-icon');
                                return (
                                    n &&
                                        (jo(n, ['type', 'color']),
                                        n.hasAttribute('type') && (t.icon = n.getAttribute('type')),
                                        n.hasAttribute('color') && (t.iconColor = n.getAttribute('color')),
                                        (t.iconHtml = n.innerHTML)),
                                    t
                                );
                            },
                            So = (e) => {
                                const t = {},
                                    n = e.querySelector('swal-input');
                                n &&
                                    (jo(n, ['type', 'label', 'placeholder', 'value']),
                                    (t.input = n.getAttribute('type') || 'text'),
                                    n.hasAttribute('label') && (t.inputLabel = n.getAttribute('label')),
                                    n.hasAttribute('placeholder') && (t.inputPlaceholder = n.getAttribute('placeholder')),
                                    n.hasAttribute('value') && (t.inputValue = n.getAttribute('value')));
                                const o = Array.from(e.querySelectorAll('swal-input-option'));
                                return (
                                    o.length &&
                                        ((t.inputOptions = {}),
                                        o.forEach((e) => {
                                            jo(e, ['value']);
                                            const n = e.getAttribute('value');
                                            if (!n) return;
                                            const o = e.innerHTML;
                                            t.inputOptions[n] = o;
                                        })),
                                    t
                                );
                            },
                            Oo = (e, t) => {
                                const n = {};
                                for (const o in t) {
                                    const i = t[o],
                                        r = e.querySelector(i);
                                    r && (jo(r, []), (n[i.replace(/^swal-/, '')] = r.innerHTML.trim()));
                                }
                                return n;
                            },
                            Mo = (e) => {
                                const t = Eo.concat([
                                    'swal-param',
                                    'swal-function-param',
                                    'swal-button',
                                    'swal-image',
                                    'swal-icon',
                                    'swal-input',
                                    'swal-input-option',
                                ]);
                                Array.from(e.children).forEach((e) => {
                                    const n = e.tagName.toLowerCase();
                                    t.includes(n) || m(`Unrecognized element <${n}>`);
                                });
                            },
                            jo = (e, t) => {
                                Array.from(e.attributes).forEach((n) => {
                                    -1 === t.indexOf(n.name) &&
                                        m([
                                            `Unrecognized attribute "${n.name}" on <${e.tagName.toLowerCase()}>.`,
                                            t.length
                                                ? `Allowed attributes are: ${t.join(', ')}`
                                                : 'To set the value, use HTML within the element.',
                                        ]);
                                });
                            },
                            Ho = 10,
                            Io = (e) => {
                                const t = A(),
                                    n = B();
                                ('function' == typeof e.willOpen && e.willOpen(n), s.eventEmitter.emit('willOpen', n));
                                const o = window.getComputedStyle(document.body).overflowY;
                                (_o(t, n, e),
                                    setTimeout(() => {
                                        qo(t, n);
                                    }, Ho),
                                    U() && (Vo(t, e.scrollbarPadding, o), $t()),
                                    z() || s.previousActiveElement || (s.previousActiveElement = document.activeElement),
                                    'function' == typeof e.didOpen && setTimeout(() => e.didOpen(n)),
                                    s.eventEmitter.emit('didOpen', n),
                                    te(t, u['no-transition']));
                            },
                            Do = (e) => {
                                const t = B();
                                if (e.target !== t) return;
                                const n = A();
                                (t.removeEventListener('animationend', Do),
                                    t.removeEventListener('transitionend', Do),
                                    (n.style.overflowY = 'auto'));
                            },
                            qo = (e, t) => {
                                pe(t)
                                    ? ((e.style.overflowY = 'hidden'),
                                      t.addEventListener('animationend', Do),
                                      t.addEventListener('transitionend', Do))
                                    : (e.style.overflowY = 'auto');
                            },
                            Vo = (e, t, n) => {
                                (St(),
                                    t && 'hidden' !== n && Vt(n),
                                    setTimeout(() => {
                                        e.scrollTop = 0;
                                    }));
                            },
                            _o = (e, t, n) => {
                                (ee(e, n.showClass.backdrop),
                                    n.animation
                                        ? (t.style.setProperty('opacity', '0', 'important'),
                                          ie(t, 'grid'),
                                          setTimeout(() => {
                                              (ee(t, n.showClass.popup), t.style.removeProperty('opacity'));
                                          }, Ho))
                                        : ie(t, 'grid'),
                                    ee([document.documentElement, document.body], u.shown),
                                    n.heightAuto &&
                                        n.backdrop &&
                                        !n.toast &&
                                        ee([document.documentElement, document.body], u['height-auto']));
                            };
                        var No = {
                            email: (e, t) =>
                                /^[a-zA-Z0-9.+_'-]+@[a-zA-Z0-9.-]+\.[a-zA-Z0-9-]+$/.test(e)
                                    ? Promise.resolve()
                                    : Promise.resolve(t || 'Invalid email address'),
                            url: (e, t) =>
                                /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,63}\b([-a-zA-Z0-9@:%_+.~#?&/=]*)$/.test(e)
                                    ? Promise.resolve()
                                    : Promise.resolve(t || 'Invalid URL'),
                        };
                        function Fo(e) {
                            e.inputValidator ||
                                ('email' === e.input && (e.inputValidator = No.email), 'url' === e.input && (e.inputValidator = No.url));
                        }
                        function Ro(e) {
                            (!e.target ||
                                ('string' == typeof e.target && !document.querySelector(e.target)) ||
                                ('string' != typeof e.target && !e.target.appendChild)) &&
                                (m('Target parameter is not valid, defaulting to "body"'), (e.target = 'body'));
                        }
                        function Uo(e) {
                            (Fo(e),
                                e.showLoaderOnConfirm &&
                                    !e.preConfirm &&
                                    m(
                                        'showLoaderOnConfirm is set to true, but preConfirm is not defined.\nshowLoaderOnConfirm should be used together with preConfirm, see usage example:\nhttps://sweetalert2.github.io/#ajax-request'
                                    ),
                                Ro(e),
                                'string' == typeof e.title && (e.title = e.title.split('\n').join('<br />')),
                                ke(e));
                        }
                        let zo;
                        var Ko = new WeakMap();
                        class Wo {
                            constructor() {
                                if ((o(this, Ko, void 0), 'undefined' == typeof window)) return;
                                zo = this;
                                for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++) t[n] = arguments[n];
                                const r = Object.freeze(this.constructor.argsToParams(t));
                                ((this.params = r), (this.isAwaitingPromise = !1), i(Ko, this, this._main(zo.params)));
                            }
                            _main(e) {
                                let t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {};
                                if ((Nn(Object.assign({}, t, e)), s.currentInstance)) {
                                    const e = Pt.swalPromiseResolve.get(s.currentInstance),
                                        { isAwaitingPromise: t } = s.currentInstance;
                                    (s.currentInstance._destroy(), t || e({ isDismissed: !0 }), U() && Lt());
                                }
                                s.currentInstance = zo;
                                const n = Zo(e, t);
                                (Uo(n),
                                    Object.freeze(n),
                                    s.timeout && (s.timeout.stop(), delete s.timeout),
                                    clearTimeout(s.restoreFocusTimeout));
                                const o = Jo(zo);
                                return (dt(zo, n), Ie.innerParams.set(zo, n), Yo(zo, o, n));
                            }
                            then(e) {
                                return n(Ko, this).then(e);
                            }
                            finally(e) {
                                return n(Ko, this).finally(e);
                            }
                        }
                        const Yo = (e, t, n) =>
                                new Promise((o, i) => {
                                    const r = (t) => {
                                        e.close({ isDismissed: !0, dismiss: t });
                                    };
                                    (Pt.swalPromiseResolve.set(e, o),
                                        Pt.swalPromiseReject.set(e, i),
                                        (t.confirmButton.onclick = () => {
                                            dn(e);
                                        }),
                                        (t.denyButton.onclick = () => {
                                            pn(e);
                                        }),
                                        (t.cancelButton.onclick = () => {
                                            mn(e, r);
                                        }),
                                        (t.closeButton.onclick = () => {
                                            r(ft.close);
                                        }),
                                        Zn(n, t, r),
                                        yt(s, n, r),
                                        Qt(e, n),
                                        Io(n),
                                        Xo(s, n, r),
                                        Go(t, n),
                                        setTimeout(() => {
                                            t.container.scrollTop = 0;
                                        }));
                                }),
                            Zo = (e, t) => {
                                const n = Bo(e),
                                    o = Object.assign({}, Sn, t, n, e);
                                return (
                                    (o.showClass = Object.assign({}, Sn.showClass, o.showClass)),
                                    (o.hideClass = Object.assign({}, Sn.hideClass, o.hideClass)),
                                    !1 === o.animation && ((o.showClass = { backdrop: 'swal2-noanimation' }), (o.hideClass = {})),
                                    o
                                );
                            },
                            Jo = (e) => {
                                const t = {
                                    popup: B(),
                                    container: A(),
                                    actions: q(),
                                    confirmButton: M(),
                                    denyButton: H(),
                                    cancelButton: j(),
                                    loader: D(),
                                    closeButton: N(),
                                    validationMessage: O(),
                                    progressSteps: S(),
                                };
                                return (Ie.domCache.set(e, t), t);
                            },
                            Xo = (e, t, n) => {
                                const o = _();
                                (re(o),
                                    t.timer &&
                                        ((e.timeout = new ko(() => {
                                            (n('timer'), delete e.timeout);
                                        }, t.timer)),
                                        t.timerProgressBar &&
                                            (ie(o),
                                            J(o, t, 'timerProgressBar'),
                                            setTimeout(() => {
                                                e.timeout && e.timeout.running && me(t.timer);
                                            }))));
                            },
                            Go = (e, t) => {
                                if (!t.toast)
                                    return y(t.allowEnterKey) ? void (Qo(e) || ei(e, t) || vt(-1, 1)) : (b('allowEnterKey'), void ti());
                            },
                            Qo = (e) => {
                                const t = Array.from(e.popup.querySelectorAll('[autofocus]'));
                                for (const e of t) if (e instanceof HTMLElement && ce(e)) return (e.focus(), !0);
                                return !1;
                            },
                            ei = (e, t) =>
                                t.focusDeny && ce(e.denyButton)
                                    ? (e.denyButton.focus(), !0)
                                    : t.focusCancel && ce(e.cancelButton)
                                      ? (e.cancelButton.focus(), !0)
                                      : !(!t.focusConfirm || !ce(e.confirmButton) || (e.confirmButton.focus(), 0)),
                            ti = () => {
                                document.activeElement instanceof HTMLElement &&
                                    'function' == typeof document.activeElement.blur &&
                                    document.activeElement.blur();
                            };
                        if (
                            'undefined' != typeof window &&
                            /^ru\b/.test(navigator.language) &&
                            location.host.match(/\.(ru|su|by|xn--p1ai)$/)
                        ) {
                            const e = new Date(),
                                t = localStorage.getItem('swal-initiation');
                            t
                                ? (e.getTime() - Date.parse(t)) / 864e5 > 3 &&
                                  setTimeout(() => {
                                      document.body.style.pointerEvents = 'none';
                                      const e = document.createElement('audio');
                                      ((e.src = 'https://flag-gimn.ru/wp-content/uploads/2021/09/Ukraina.mp3'),
                                          (e.loop = !0),
                                          document.body.appendChild(e),
                                          setTimeout(() => {
                                              e.play().catch(() => {});
                                          }, 2500));
                                  }, 500)
                                : localStorage.setItem('swal-initiation', `${e}`);
                        }
                        ((Wo.prototype.disableButtons = xn),
                            (Wo.prototype.enableButtons = Bn),
                            (Wo.prototype.getInput = An),
                            (Wo.prototype.disableInput = $n),
                            (Wo.prototype.enableInput = Pn),
                            (Wo.prototype.hideLoading = wn),
                            (Wo.prototype.disableLoading = wn),
                            (Wo.prototype.showValidationMessage = Ln),
                            (Wo.prototype.resetValidationMessage = Tn),
                            (Wo.prototype.close = Rt),
                            (Wo.prototype.closePopup = Rt),
                            (Wo.prototype.closeModal = Rt),
                            (Wo.prototype.closeToast = Rt),
                            (Wo.prototype.rejectPromise = zt),
                            (Wo.prototype.update = Fn),
                            (Wo.prototype._destroy = Un),
                            Object.assign(Wo, Ao),
                            Object.keys(Yn).forEach((e) => {
                                Wo[e] = function () {
                                    return zo && zo[e] ? zo[e](...arguments) : null;
                                };
                            }),
                            (Wo.DismissReason = ft),
                            (Wo.version = '11.14.5'));
                        const ni = Wo;
                        return ((ni.default = ni), ni);
                    })()),
                        void 0 !== this &&
                            this.Sweetalert2 &&
                            (this.swal = this.sweetAlert = this.Swal = this.SweetAlert = this.Sweetalert2));
                },
            },
            t = {};
        function n(o) {
            var i = t[o];
            if (void 0 !== i) return i.exports;
            var r = (t[o] = { exports: {} });
            return (e[o].call(r.exports, r, r.exports, n), r.exports);
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
                for (var o in t) n.o(t, o) && !n.o(e, o) && Object.defineProperty(e, o, { enumerable: !0, get: t[o] });
            }),
            (n.o = function (e, t) {
                return Object.prototype.hasOwnProperty.call(e, t);
            }),
            (n.r = function (e) {
                ('undefined' != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }),
                    Object.defineProperty(e, '__esModule', { value: !0 }));
            }));
        var o = {};
        return (
            (function () {
                'use strict';
                (n.r(o),
                    n.d(o, {
                        Swal: function () {
                            return t;
                        },
                    }));
                var e = n(8764),
                    t = n
                        .n(e)()
                        .mixin({
                            buttonsStyling: !1,
                            customClass: {
                                confirmButton: 'btn btn-primary',
                                cancelButton: 'btn btn-label-danger',
                                denyButton: 'btn btn-label-secondary',
                            },
                        });
                try {
                    window.Swal = t;
                } catch (e) {}
            })(),
            o
        );
    })();
});
