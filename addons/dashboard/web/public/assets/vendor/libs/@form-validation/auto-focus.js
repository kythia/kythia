/**
 * @namespace: addons/dashboard/web/public/assets/vendor/libs/@form-validation/auto-focus.js
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
        'use strict';
        var e = {
                1979: function (e, t) {
                    var i = {
                            luhn: function (e) {
                                for (
                                    var t = e.length,
                                        i = [
                                            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                                            [0, 2, 4, 6, 8, 1, 3, 5, 7, 9],
                                        ],
                                        n = 0,
                                        r = 0;
                                    t--;

                                )
                                    ((r += i[n][parseInt(e.charAt(t), 10)]), (n = 1 - n));
                                return r % 10 == 0 && r > 0;
                            },
                            mod11And10: function (e) {
                                for (var t = e.length, i = 5, n = 0; n < t; n++)
                                    i = (((2 * (i || 10)) % 11) + parseInt(e.charAt(n), 10)) % 10;
                                return 1 === i;
                            },
                            mod37And36: function (e, t) {
                                void 0 === t && (t = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ');
                                for (var i = e.length, n = t.length, r = Math.floor(n / 2), o = 0; o < i; o++)
                                    r = (((2 * (r || n)) % (n + 1)) + t.indexOf(e.charAt(o))) % n;
                                return 1 === r;
                            },
                            mod97And10: function (e) {
                                for (
                                    var t = (function (e) {
                                            return e
                                                .split('')
                                                .map(function (e) {
                                                    var t = e.charCodeAt(0);
                                                    return t >= 65 && t <= 90 ? t - 55 : e;
                                                })
                                                .join('')
                                                .split('')
                                                .map(function (e) {
                                                    return parseInt(e, 10);
                                                });
                                        })(e),
                                        i = 0,
                                        n = t.length,
                                        r = 0;
                                    r < n - 1;
                                    ++r
                                )
                                    i = (10 * (i + t[r])) % 97;
                                return (i += t[n - 1]) % 97 == 1;
                            },
                            verhoeff: function (e) {
                                for (
                                    var t = [
                                            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                                            [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
                                            [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
                                            [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
                                            [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
                                            [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
                                            [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
                                            [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
                                            [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
                                            [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
                                        ],
                                        i = [
                                            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
                                            [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
                                            [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
                                            [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
                                            [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
                                            [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
                                            [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
                                            [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
                                        ],
                                        n = e.reverse(),
                                        r = 0,
                                        o = 0;
                                    o < n.length;
                                    o++
                                )
                                    r = t[r][i[o % 8][n[o]]];
                                return 0 === r;
                            },
                        },
                        n = (function () {
                            function e(e, t) {
                                ((this.fields = {}),
                                    (this.elements = {}),
                                    (this.ee = {
                                        fns: {},
                                        clear: function () {
                                            this.fns = {};
                                        },
                                        emit: function (e) {
                                            for (var t = [], i = 1; i < arguments.length; i++) t[i - 1] = arguments[i];
                                            (this.fns[e] || []).map(function (e) {
                                                return e.apply(e, t);
                                            });
                                        },
                                        off: function (e, t) {
                                            if (this.fns[e]) {
                                                var i = this.fns[e].indexOf(t);
                                                i >= 0 && this.fns[e].splice(i, 1);
                                            }
                                        },
                                        on: function (e, t) {
                                            (this.fns[e] = this.fns[e] || []).push(t);
                                        },
                                    }),
                                    (this.filter = {
                                        filters: {},
                                        add: function (e, t) {
                                            (this.filters[e] = this.filters[e] || []).push(t);
                                        },
                                        clear: function () {
                                            this.filters = {};
                                        },
                                        execute: function (e, t, i) {
                                            if (!this.filters[e] || !this.filters[e].length) return t;
                                            for (var n = t, r = this.filters[e], o = r.length, s = 0; s < o; s++) n = r[s].apply(n, i);
                                            return n;
                                        },
                                        remove: function (e, t) {
                                            this.filters[e] &&
                                                (this.filters[e] = this.filters[e].filter(function (e) {
                                                    return e !== t;
                                                }));
                                        },
                                    }),
                                    (this.plugins = {}),
                                    (this.results = new Map()),
                                    (this.validators = {}),
                                    (this.form = e),
                                    (this.fields = t));
                            }
                            return (
                                (e.prototype.on = function (e, t) {
                                    return (this.ee.on(e, t), this);
                                }),
                                (e.prototype.off = function (e, t) {
                                    return (this.ee.off(e, t), this);
                                }),
                                (e.prototype.emit = function (e) {
                                    for (var t, i = [], n = 1; n < arguments.length; n++) i[n - 1] = arguments[n];
                                    return (
                                        (t = this.ee).emit.apply(
                                            t,
                                            (function (e, t, i) {
                                                if (i || 2 === arguments.length)
                                                    for (var n, r = 0, o = t.length; r < o; r++)
                                                        (!n && r in t) || (n || (n = Array.prototype.slice.call(t, 0, r)), (n[r] = t[r]));
                                                return e.concat(n || Array.prototype.slice.call(t));
                                            })([e], i, !1)
                                        ),
                                        this
                                    );
                                }),
                                (e.prototype.registerPlugin = function (e, t) {
                                    if (this.plugins[e]) throw new Error('The plguin '.concat(e, ' is registered'));
                                    return (t.setCore(this), t.install(), (this.plugins[e] = t), this);
                                }),
                                (e.prototype.deregisterPlugin = function (e) {
                                    var t = this.plugins[e];
                                    return (t && t.uninstall(), delete this.plugins[e], this);
                                }),
                                (e.prototype.enablePlugin = function (e) {
                                    var t = this.plugins[e];
                                    return (t && t.enable(), this);
                                }),
                                (e.prototype.disablePlugin = function (e) {
                                    var t = this.plugins[e];
                                    return (t && t.disable(), this);
                                }),
                                (e.prototype.isPluginEnabled = function (e) {
                                    var t = this.plugins[e];
                                    return !!t && t.isPluginEnabled();
                                }),
                                (e.prototype.registerValidator = function (e, t) {
                                    if (this.validators[e]) throw new Error('The validator '.concat(e, ' is registered'));
                                    return ((this.validators[e] = t), this);
                                }),
                                (e.prototype.registerFilter = function (e, t) {
                                    return (this.filter.add(e, t), this);
                                }),
                                (e.prototype.deregisterFilter = function (e, t) {
                                    return (this.filter.remove(e, t), this);
                                }),
                                (e.prototype.executeFilter = function (e, t, i) {
                                    return this.filter.execute(e, t, i);
                                }),
                                (e.prototype.addField = function (e, t) {
                                    var i = Object.assign({}, { selector: '', validators: {} }, t);
                                    return (
                                        (this.fields[e] = this.fields[e]
                                            ? {
                                                  selector: i.selector || this.fields[e].selector,
                                                  validators: Object.assign({}, this.fields[e].validators, i.validators),
                                              }
                                            : i),
                                        (this.elements[e] = this.queryElements(e)),
                                        this.emit('core.field.added', { elements: this.elements[e], field: e, options: this.fields[e] }),
                                        this
                                    );
                                }),
                                (e.prototype.removeField = function (e) {
                                    if (!this.fields[e])
                                        throw new Error(
                                            'The field '.concat(e, ' validators are not defined. Please ensure the field is added first')
                                        );
                                    var t = this.elements[e],
                                        i = this.fields[e];
                                    return (
                                        delete this.elements[e],
                                        delete this.fields[e],
                                        this.emit('core.field.removed', { elements: t, field: e, options: i }),
                                        this
                                    );
                                }),
                                (e.prototype.validate = function () {
                                    var e = this;
                                    return (
                                        this.emit('core.form.validating', { formValidation: this }),
                                        this.filter.execute('validate-pre', Promise.resolve(), []).then(function () {
                                            return Promise.all(
                                                Object.keys(e.fields).map(function (t) {
                                                    return e.validateField(t);
                                                })
                                            ).then(function (t) {
                                                switch (!0) {
                                                    case -1 !== t.indexOf('Invalid'):
                                                        return (
                                                            e.emit('core.form.invalid', { formValidation: e }),
                                                            Promise.resolve('Invalid')
                                                        );
                                                    case -1 !== t.indexOf('NotValidated'):
                                                        return (
                                                            e.emit('core.form.notvalidated', { formValidation: e }),
                                                            Promise.resolve('NotValidated')
                                                        );
                                                    default:
                                                        return (e.emit('core.form.valid', { formValidation: e }), Promise.resolve('Valid'));
                                                }
                                            });
                                        })
                                    );
                                }),
                                (e.prototype.validateField = function (e) {
                                    var t = this,
                                        i = this.results.get(e);
                                    if ('Valid' === i || 'Invalid' === i) return Promise.resolve(i);
                                    this.emit('core.field.validating', e);
                                    var n = this.elements[e];
                                    if (0 === n.length) return (this.emit('core.field.valid', e), Promise.resolve('Valid'));
                                    var r = n[0].getAttribute('type');
                                    return 'radio' === r || 'checkbox' === r || 1 === n.length
                                        ? this.validateElement(e, n[0])
                                        : Promise.all(
                                              n.map(function (i) {
                                                  return t.validateElement(e, i);
                                              })
                                          ).then(function (i) {
                                              switch (!0) {
                                                  case -1 !== i.indexOf('Invalid'):
                                                      return (
                                                          t.emit('core.field.invalid', e),
                                                          t.results.set(e, 'Invalid'),
                                                          Promise.resolve('Invalid')
                                                      );
                                                  case -1 !== i.indexOf('NotValidated'):
                                                      return (
                                                          t.emit('core.field.notvalidated', e),
                                                          t.results.delete(e),
                                                          Promise.resolve('NotValidated')
                                                      );
                                                  default:
                                                      return (
                                                          t.emit('core.field.valid', e),
                                                          t.results.set(e, 'Valid'),
                                                          Promise.resolve('Valid')
                                                      );
                                              }
                                          });
                                }),
                                (e.prototype.validateElement = function (e, t) {
                                    var i = this;
                                    this.results.delete(e);
                                    var n = this.elements[e];
                                    if (this.filter.execute('element-ignored', !1, [e, t, n]))
                                        return (
                                            this.emit('core.element.ignored', { element: t, elements: n, field: e }),
                                            Promise.resolve('Ignored')
                                        );
                                    var r = this.fields[e].validators;
                                    this.emit('core.element.validating', { element: t, elements: n, field: e });
                                    var o = Object.keys(r).map(function (n) {
                                        return function () {
                                            return i.executeValidator(e, t, n, r[n]);
                                        };
                                    });
                                    return this.waterfall(o)
                                        .then(function (r) {
                                            var o = -1 === r.indexOf('Invalid');
                                            i.emit('core.element.validated', { element: t, elements: n, field: e, valid: o });
                                            var s = t.getAttribute('type');
                                            return (
                                                ('radio' !== s && 'checkbox' !== s && 1 !== n.length) ||
                                                    i.emit(o ? 'core.field.valid' : 'core.field.invalid', e),
                                                Promise.resolve(o ? 'Valid' : 'Invalid')
                                            );
                                        })
                                        .catch(function (r) {
                                            return (
                                                i.emit('core.element.notvalidated', { element: t, elements: n, field: e }),
                                                Promise.resolve(r)
                                            );
                                        });
                                }),
                                (e.prototype.executeValidator = function (e, t, i, n) {
                                    var r = this,
                                        o = this.elements[e],
                                        s = this.filter.execute('validator-name', i, [i, e]);
                                    if (
                                        ((n.message = this.filter.execute('validator-message', n.message, [this.locale, e, s])),
                                        !this.validators[s] || !1 === n.enabled)
                                    )
                                        return (
                                            this.emit('core.validator.validated', {
                                                element: t,
                                                elements: o,
                                                field: e,
                                                result: this.normalizeResult(e, s, { valid: !0 }),
                                                validator: s,
                                            }),
                                            Promise.resolve('Valid')
                                        );
                                    var l = this.validators[s],
                                        a = this.getElementValue(e, t, s);
                                    if (!this.filter.execute('field-should-validate', !0, [e, t, a, i]))
                                        return (
                                            this.emit('core.validator.notvalidated', { element: t, elements: o, field: e, validator: i }),
                                            Promise.resolve('NotValidated')
                                        );
                                    this.emit('core.validator.validating', { element: t, elements: o, field: e, validator: i });
                                    var d = l().validate({
                                        element: t,
                                        elements: o,
                                        field: e,
                                        l10n: this.localization,
                                        options: n,
                                        value: a,
                                    });
                                    if ('function' == typeof d.then)
                                        return d.then(function (n) {
                                            var s = r.normalizeResult(e, i, n);
                                            return (
                                                r.emit('core.validator.validated', {
                                                    element: t,
                                                    elements: o,
                                                    field: e,
                                                    result: s,
                                                    validator: i,
                                                }),
                                                s.valid ? 'Valid' : 'Invalid'
                                            );
                                        });
                                    var u = this.normalizeResult(e, i, d);
                                    return (
                                        this.emit('core.validator.validated', {
                                            element: t,
                                            elements: o,
                                            field: e,
                                            result: u,
                                            validator: i,
                                        }),
                                        Promise.resolve(u.valid ? 'Valid' : 'Invalid')
                                    );
                                }),
                                (e.prototype.getElementValue = function (e, t, i) {
                                    var n = (function (e, t, i, n) {
                                        var r = (i.getAttribute('type') || '').toLowerCase(),
                                            o = i.tagName.toLowerCase();
                                        if ('textarea' === o) return i.value;
                                        if ('select' === o) {
                                            var s = i,
                                                l = s.selectedIndex;
                                            return l >= 0 ? s.options.item(l).value : '';
                                        }
                                        if ('input' === o) {
                                            if ('radio' === r || 'checkbox' === r) {
                                                var a = n.filter(function (e) {
                                                    return e.checked;
                                                }).length;
                                                return 0 === a ? '' : a + '';
                                            }
                                            return i.value;
                                        }
                                        return '';
                                    })(this.form, 0, t, this.elements[e]);
                                    return this.filter.execute('field-value', n, [n, e, t, i]);
                                }),
                                (e.prototype.getElements = function (e) {
                                    return this.elements[e];
                                }),
                                (e.prototype.getFields = function () {
                                    return this.fields;
                                }),
                                (e.prototype.getFormElement = function () {
                                    return this.form;
                                }),
                                (e.prototype.getLocale = function () {
                                    return this.locale;
                                }),
                                (e.prototype.getPlugin = function (e) {
                                    return this.plugins[e];
                                }),
                                (e.prototype.updateFieldStatus = function (e, t, i) {
                                    var n = this,
                                        r = this.elements[e],
                                        o = r[0].getAttribute('type');
                                    if (
                                        (('radio' === o || 'checkbox' === o ? [r[0]] : r).forEach(function (r) {
                                            return n.updateElementStatus(e, r, t, i);
                                        }),
                                        i)
                                    )
                                        'Invalid' === t && (this.emit('core.field.invalid', e), this.results.set(e, 'Invalid'));
                                    else
                                        switch (t) {
                                            case 'NotValidated':
                                                (this.emit('core.field.notvalidated', e), this.results.delete(e));
                                                break;
                                            case 'Validating':
                                                (this.emit('core.field.validating', e), this.results.delete(e));
                                                break;
                                            case 'Valid':
                                                (this.emit('core.field.valid', e), this.results.set(e, 'Valid'));
                                                break;
                                            case 'Invalid':
                                                (this.emit('core.field.invalid', e), this.results.set(e, 'Invalid'));
                                        }
                                    return this;
                                }),
                                (e.prototype.updateElementStatus = function (e, t, i, n) {
                                    var r = this,
                                        o = this.elements[e],
                                        s = this.fields[e].validators,
                                        l = n ? [n] : Object.keys(s);
                                    switch (i) {
                                        case 'NotValidated':
                                            (l.forEach(function (i) {
                                                return r.emit('core.validator.notvalidated', {
                                                    element: t,
                                                    elements: o,
                                                    field: e,
                                                    validator: i,
                                                });
                                            }),
                                                this.emit('core.element.notvalidated', { element: t, elements: o, field: e }));
                                            break;
                                        case 'Validating':
                                            (l.forEach(function (i) {
                                                return r.emit('core.validator.validating', {
                                                    element: t,
                                                    elements: o,
                                                    field: e,
                                                    validator: i,
                                                });
                                            }),
                                                this.emit('core.element.validating', { element: t, elements: o, field: e }));
                                            break;
                                        case 'Valid':
                                            (l.forEach(function (i) {
                                                return r.emit('core.validator.validated', {
                                                    element: t,
                                                    elements: o,
                                                    field: e,
                                                    result: { message: s[i].message, valid: !0 },
                                                    validator: i,
                                                });
                                            }),
                                                this.emit('core.element.validated', { element: t, elements: o, field: e, valid: !0 }));
                                            break;
                                        case 'Invalid':
                                            (l.forEach(function (i) {
                                                return r.emit('core.validator.validated', {
                                                    element: t,
                                                    elements: o,
                                                    field: e,
                                                    result: { message: s[i].message, valid: !1 },
                                                    validator: i,
                                                });
                                            }),
                                                this.emit('core.element.validated', { element: t, elements: o, field: e, valid: !1 }));
                                    }
                                    return this;
                                }),
                                (e.prototype.resetForm = function (e) {
                                    var t = this;
                                    return (
                                        Object.keys(this.fields).forEach(function (i) {
                                            return t.resetField(i, e);
                                        }),
                                        this.emit('core.form.reset', { formValidation: this, reset: e }),
                                        this
                                    );
                                }),
                                (e.prototype.resetField = function (e, t) {
                                    if (t) {
                                        var i = this.elements[e],
                                            n = i[0].getAttribute('type');
                                        i.forEach(function (e) {
                                            'radio' === n || 'checkbox' === n
                                                ? (e.removeAttribute('selected'), e.removeAttribute('checked'), (e.checked = !1))
                                                : (e.setAttribute('value', ''),
                                                  (e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement) && (e.value = ''));
                                        });
                                    }
                                    return (
                                        this.updateFieldStatus(e, 'NotValidated'),
                                        this.emit('core.field.reset', { field: e, reset: t }),
                                        this
                                    );
                                }),
                                (e.prototype.revalidateField = function (e) {
                                    return this.fields[e]
                                        ? (this.updateFieldStatus(e, 'NotValidated'), this.validateField(e))
                                        : Promise.resolve('Ignored');
                                }),
                                (e.prototype.disableValidator = function (e, t) {
                                    if (!this.fields[e]) return this;
                                    var i = this.elements[e];
                                    return (
                                        this.toggleValidator(!1, e, t),
                                        this.emit('core.validator.disabled', { elements: i, field: e, formValidation: this, validator: t }),
                                        this
                                    );
                                }),
                                (e.prototype.enableValidator = function (e, t) {
                                    if (!this.fields[e]) return this;
                                    var i = this.elements[e];
                                    return (
                                        this.toggleValidator(!0, e, t),
                                        this.emit('core.validator.enabled', { elements: i, field: e, formValidation: this, validator: t }),
                                        this
                                    );
                                }),
                                (e.prototype.updateValidatorOption = function (e, t, i, n) {
                                    return (
                                        this.fields[e] &&
                                            this.fields[e].validators &&
                                            this.fields[e].validators[t] &&
                                            (this.fields[e].validators[t][i] = n),
                                        this
                                    );
                                }),
                                (e.prototype.setFieldOptions = function (e, t) {
                                    return ((this.fields[e] = t), this);
                                }),
                                (e.prototype.destroy = function () {
                                    var e = this;
                                    return (
                                        Object.keys(this.plugins).forEach(function (t) {
                                            return e.plugins[t].uninstall();
                                        }),
                                        this.ee.clear(),
                                        this.filter.clear(),
                                        this.results.clear(),
                                        (this.plugins = {}),
                                        this
                                    );
                                }),
                                (e.prototype.setLocale = function (e, t) {
                                    return ((this.locale = e), (this.localization = t), this);
                                }),
                                (e.prototype.waterfall = function (e) {
                                    return e.reduce(function (e, t) {
                                        return e.then(function (e) {
                                            return t().then(function (t) {
                                                return (e.push(t), e);
                                            });
                                        });
                                    }, Promise.resolve([]));
                                }),
                                (e.prototype.queryElements = function (e) {
                                    var t = this.fields[e].selector
                                        ? '#' === this.fields[e].selector.charAt(0)
                                            ? '[id="'.concat(this.fields[e].selector.substring(1), '"]')
                                            : this.fields[e].selector
                                        : '[name="'.concat(e.replace(/"/g, '\\"'), '"]');
                                    return [].slice.call(this.form.querySelectorAll(t));
                                }),
                                (e.prototype.normalizeResult = function (e, t, i) {
                                    var n = this.fields[e].validators[t];
                                    return Object.assign({}, i, {
                                        message:
                                            i.message ||
                                            (n ? n.message : '') ||
                                            (this.localization && this.localization[t] && this.localization[t].default
                                                ? this.localization[t].default
                                                : '') ||
                                            'The field '.concat(e, ' is not valid'),
                                    });
                                }),
                                (e.prototype.toggleValidator = function (e, t, i) {
                                    var n = this,
                                        r = this.fields[t].validators;
                                    return (
                                        i && r && r[i]
                                            ? (this.fields[t].validators[i].enabled = e)
                                            : i ||
                                              Object.keys(r).forEach(function (i) {
                                                  return (n.fields[t].validators[i].enabled = e);
                                              }),
                                        this.updateFieldStatus(t, 'NotValidated', i)
                                    );
                                }),
                                e
                            );
                        })(),
                        r = (function () {
                            function e(e) {
                                ((this.opts = e), (this.isEnabled = !0));
                            }
                            return (
                                (e.prototype.setCore = function (e) {
                                    return ((this.core = e), this);
                                }),
                                (e.prototype.enable = function () {
                                    return ((this.isEnabled = !0), this.onEnabled(), this);
                                }),
                                (e.prototype.disable = function () {
                                    return ((this.isEnabled = !1), this.onDisabled(), this);
                                }),
                                (e.prototype.isPluginEnabled = function () {
                                    return this.isEnabled;
                                }),
                                (e.prototype.onEnabled = function () {}),
                                (e.prototype.onDisabled = function () {}),
                                (e.prototype.install = function () {}),
                                (e.prototype.uninstall = function () {}),
                                e
                            );
                        })(),
                        o = function (e, t) {
                            var i = e.matches || e.webkitMatchesSelector || e.mozMatchesSelector || e.msMatchesSelector;
                            return i ? i.call(e, t) : [].slice.call(e.parentElement.querySelectorAll(t)).indexOf(e) >= 0;
                        },
                        s = {
                            call: function (e, t) {
                                if ('function' == typeof e) return e.apply(this, t);
                                if ('string' == typeof e) {
                                    var i = e;
                                    '()' === i.substring(i.length - 2) && (i = i.substring(0, i.length - 2));
                                    for (var n = i.split('.'), r = n.pop(), o = window, s = 0, l = n; s < l.length; s++) o = o[l[s]];
                                    return void 0 === o[r] ? null : o[r].apply(this, t);
                                }
                            },
                            classSet: function (e, t) {
                                var i = [],
                                    n = [];
                                (Object.keys(t).forEach(function (e) {
                                    e && (t[e] ? i.push(e) : n.push(e));
                                }),
                                    n.forEach(function (t) {
                                        return (function (e, t) {
                                            t.split(' ').forEach(function (t) {
                                                e.classList ? e.classList.remove(t) : (e.className = e.className.replace(t, ''));
                                            });
                                        })(e, t);
                                    }),
                                    i.forEach(function (t) {
                                        return (function (e, t) {
                                            t.split(' ').forEach(function (t) {
                                                e.classList
                                                    ? e.classList.add(t)
                                                    : ' '.concat(e.className, ' ').indexOf(' '.concat(t, ' ')) &&
                                                      (e.className += ' '.concat(t));
                                            });
                                        })(e, t);
                                    }));
                            },
                            closest: function (e, t) {
                                for (var i = e; i && !o(i, t); ) i = i.parentElement;
                                return i;
                            },
                            fetch: function (e, t) {
                                return new Promise(function (i, n) {
                                    var r,
                                        o = Object.assign({}, { crossDomain: !1, headers: {}, method: 'GET', params: {} }, t),
                                        s = Object.keys(o.params)
                                            .map(function (e) {
                                                return ''.concat(encodeURIComponent(e), '=').concat(encodeURIComponent(o.params[e]));
                                            })
                                            .join('&'),
                                        l = e.indexOf('?') > -1,
                                        a =
                                            'GET' === o.method
                                                ? ''
                                                      .concat(e)
                                                      .concat(l ? '&' : '?')
                                                      .concat(s)
                                                : e;
                                    if (o.crossDomain) {
                                        var d = document.createElement('script'),
                                            u = '___FormValidationFetch_'.concat(
                                                Array(12)
                                                    .fill('')
                                                    .map(function (e) {
                                                        return Math.random().toString(36).charAt(2);
                                                    })
                                                    .join(''),
                                                '___'
                                            );
                                        ((window[u] = function (e) {
                                            (delete window[u], i(e));
                                        }),
                                            (d.src = ''
                                                .concat(a)
                                                .concat(l ? '&' : '?', 'callback=')
                                                .concat(u)),
                                            (d.async = !0),
                                            d.addEventListener('load', function () {
                                                d.parentNode.removeChild(d);
                                            }),
                                            d.addEventListener('error', function () {
                                                return n;
                                            }),
                                            document.head.appendChild(d));
                                    } else {
                                        var c = new XMLHttpRequest();
                                        (c.open(o.method, a),
                                            c.setRequestHeader('X-Requested-With', 'XMLHttpRequest'),
                                            'POST' === o.method && c.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'),
                                            Object.keys(o.headers).forEach(function (e) {
                                                return c.setRequestHeader(e, o.headers[e]);
                                            }),
                                            c.addEventListener('load', function () {
                                                i(JSON.parse(this.responseText));
                                            }),
                                            c.addEventListener('error', function () {
                                                return n;
                                            }),
                                            c.send(
                                                ((r = o.params),
                                                Object.keys(r)
                                                    .map(function (e) {
                                                        return ''.concat(encodeURIComponent(e), '=').concat(encodeURIComponent(r[e]));
                                                    })
                                                    .join('&'))
                                            ));
                                    }
                                });
                            },
                            format: function (e, t) {
                                var i = Array.isArray(t) ? t : [t],
                                    n = e;
                                return (
                                    i.forEach(function (e) {
                                        n = n.replace('%s', e);
                                    }),
                                    n
                                );
                            },
                            hasClass: function (e, t) {
                                return e.classList
                                    ? e.classList.contains(t)
                                    : new RegExp('(^| )'.concat(t, '( |$)'), 'gi').test(e.className);
                            },
                            isValidDate: function (e, t, i, n) {
                                if (isNaN(e) || isNaN(t) || isNaN(i)) return !1;
                                if (e < 1e3 || e > 9999 || t <= 0 || t > 12) return !1;
                                if (
                                    i <= 0 ||
                                    i >
                                        [
                                            31,
                                            e % 400 == 0 || (e % 100 != 0 && e % 4 == 0) ? 29 : 28,
                                            31,
                                            30,
                                            31,
                                            30,
                                            31,
                                            31,
                                            30,
                                            31,
                                            30,
                                            31,
                                        ][t - 1]
                                )
                                    return !1;
                                if (!0 === n) {
                                    var r = new Date(),
                                        o = r.getFullYear(),
                                        s = r.getMonth(),
                                        l = r.getDate();
                                    return e < o || (e === o && t - 1 < s) || (e === o && t - 1 === s && i < l);
                                }
                                return !0;
                            },
                            removeUndefined: function (e) {
                                return e
                                    ? Object.entries(e).reduce(function (e, t) {
                                          var i = t[0],
                                              n = t[1];
                                          return (void 0 === n || (e[i] = n), e);
                                      }, {})
                                    : {};
                            },
                        };
                    ((t.Plugin = r),
                        (t.algorithms = i),
                        (t.formValidation = function (e, t) {
                            var i = Object.assign({}, { fields: {}, locale: 'en_US', plugins: {}, init: function (e) {} }, t),
                                r = new n(e, i.fields);
                            return (
                                r.setLocale(i.locale, i.localization),
                                Object.keys(i.plugins).forEach(function (e) {
                                    return r.registerPlugin(e, i.plugins[e]);
                                }),
                                i.init(r),
                                Object.keys(i.fields).forEach(function (e) {
                                    return r.addField(e, i.fields[e]);
                                }),
                                r
                            );
                        }),
                        (t.utils = s));
                },
                4786: function (e, t, i) {
                    e.exports = i(1979);
                },
                7478: function (e, t, i) {
                    var n = i(4786),
                        r = i(8435),
                        o = function (e, t) {
                            return (
                                (o =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (e, t) {
                                            e.__proto__ = t;
                                        }) ||
                                    function (e, t) {
                                        for (var i in t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
                                    }),
                                o(e, t)
                            );
                        },
                        s = (function (e) {
                            function t(t) {
                                var i = e.call(this, t) || this;
                                return (
                                    (i.opts = Object.assign({}, { onPrefocus: function () {} }, t)),
                                    (i.invalidFormHandler = i.onFormInvalid.bind(i)),
                                    i
                                );
                            }
                            return (
                                (function (e, t) {
                                    if ('function' != typeof t && null !== t)
                                        throw new TypeError('Class extends value ' + String(t) + ' is not a constructor or null');
                                    function i() {
                                        this.constructor = e;
                                    }
                                    (o(e, t), (e.prototype = null === t ? Object.create(t) : ((i.prototype = t.prototype), new i())));
                                })(t, e),
                                (t.prototype.install = function () {
                                    this.core
                                        .on('core.form.invalid', this.invalidFormHandler)
                                        .registerPlugin(t.FIELD_STATUS_PLUGIN, new r.FieldStatus());
                                }),
                                (t.prototype.uninstall = function () {
                                    this.core.off('core.form.invalid', this.invalidFormHandler).deregisterPlugin(t.FIELD_STATUS_PLUGIN);
                                }),
                                (t.prototype.onEnabled = function () {
                                    this.core.enablePlugin(t.FIELD_STATUS_PLUGIN);
                                }),
                                (t.prototype.onDisabled = function () {
                                    this.core.disablePlugin(t.FIELD_STATUS_PLUGIN);
                                }),
                                (t.prototype.onFormInvalid = function () {
                                    if (this.isEnabled) {
                                        var e = this.core.getPlugin(t.FIELD_STATUS_PLUGIN).getStatuses(),
                                            i = Object.keys(this.core.getFields()).filter(function (t) {
                                                return 'Invalid' === e.get(t);
                                            });
                                        if (i.length > 0) {
                                            var n = i[0],
                                                r = this.core.getElements(n);
                                            if (r.length > 0) {
                                                var o = r[0],
                                                    s = { firstElement: o, field: n };
                                                (this.core.emit('plugins.autofocus.prefocus', s), this.opts.onPrefocus(s), o.focus());
                                            }
                                        }
                                    }
                                }),
                                (t.FIELD_STATUS_PLUGIN = '___autoFocusFieldStatus'),
                                t
                            );
                        })(n.Plugin);
                    t.AutoFocus = s;
                },
                518: function (e, t, i) {
                    e.exports = i(7478);
                },
                3377: function (e, t, i) {
                    var n = i(4786),
                        r = function (e, t) {
                            return (
                                (r =
                                    Object.setPrototypeOf ||
                                    ({ __proto__: [] } instanceof Array &&
                                        function (e, t) {
                                            e.__proto__ = t;
                                        }) ||
                                    function (e, t) {
                                        for (var i in t) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
                                    }),
                                r(e, t)
                            );
                        },
                        o = (function (e) {
                            function t(t) {
                                var i = e.call(this, t) || this;
                                return (
                                    (i.statuses = new Map()),
                                    (i.opts = Object.assign({}, { onStatusChanged: function () {} }, t)),
                                    (i.elementValidatingHandler = i.onElementValidating.bind(i)),
                                    (i.elementValidatedHandler = i.onElementValidated.bind(i)),
                                    (i.elementNotValidatedHandler = i.onElementNotValidated.bind(i)),
                                    (i.elementIgnoredHandler = i.onElementIgnored.bind(i)),
                                    (i.fieldAddedHandler = i.onFieldAdded.bind(i)),
                                    (i.fieldRemovedHandler = i.onFieldRemoved.bind(i)),
                                    i
                                );
                            }
                            return (
                                (function (e, t) {
                                    if ('function' != typeof t && null !== t)
                                        throw new TypeError('Class extends value ' + String(t) + ' is not a constructor or null');
                                    function i() {
                                        this.constructor = e;
                                    }
                                    (r(e, t), (e.prototype = null === t ? Object.create(t) : ((i.prototype = t.prototype), new i())));
                                })(t, e),
                                (t.prototype.install = function () {
                                    this.core
                                        .on('core.element.validating', this.elementValidatingHandler)
                                        .on('core.element.validated', this.elementValidatedHandler)
                                        .on('core.element.notvalidated', this.elementNotValidatedHandler)
                                        .on('core.element.ignored', this.elementIgnoredHandler)
                                        .on('core.field.added', this.fieldAddedHandler)
                                        .on('core.field.removed', this.fieldRemovedHandler);
                                }),
                                (t.prototype.uninstall = function () {
                                    (this.statuses.clear(),
                                        this.core
                                            .off('core.element.validating', this.elementValidatingHandler)
                                            .off('core.element.validated', this.elementValidatedHandler)
                                            .off('core.element.notvalidated', this.elementNotValidatedHandler)
                                            .off('core.element.ignored', this.elementIgnoredHandler)
                                            .off('core.field.added', this.fieldAddedHandler)
                                            .off('core.field.removed', this.fieldRemovedHandler));
                                }),
                                (t.prototype.areFieldsValid = function () {
                                    return Array.from(this.statuses.values()).every(function (e) {
                                        return 'Valid' === e || 'NotValidated' === e || 'Ignored' === e;
                                    });
                                }),
                                (t.prototype.getStatuses = function () {
                                    return this.isEnabled ? this.statuses : new Map();
                                }),
                                (t.prototype.onFieldAdded = function (e) {
                                    this.statuses.set(e.field, 'NotValidated');
                                }),
                                (t.prototype.onFieldRemoved = function (e) {
                                    (this.statuses.has(e.field) && this.statuses.delete(e.field),
                                        this.handleStatusChanged(this.areFieldsValid()));
                                }),
                                (t.prototype.onElementValidating = function (e) {
                                    (this.statuses.set(e.field, 'Validating'), this.handleStatusChanged(!1));
                                }),
                                (t.prototype.onElementValidated = function (e) {
                                    (this.statuses.set(e.field, e.valid ? 'Valid' : 'Invalid'),
                                        e.valid ? this.handleStatusChanged(this.areFieldsValid()) : this.handleStatusChanged(!1));
                                }),
                                (t.prototype.onElementNotValidated = function (e) {
                                    (this.statuses.set(e.field, 'NotValidated'), this.handleStatusChanged(!1));
                                }),
                                (t.prototype.onElementIgnored = function (e) {
                                    (this.statuses.set(e.field, 'Ignored'), this.handleStatusChanged(this.areFieldsValid()));
                                }),
                                (t.prototype.handleStatusChanged = function (e) {
                                    this.isEnabled && this.opts.onStatusChanged(e);
                                }),
                                t
                            );
                        })(n.Plugin);
                    t.FieldStatus = o;
                },
                8435: function (e, t, i) {
                    e.exports = i(3377);
                },
            },
            t = {};
        function i(n) {
            var r = t[n];
            if (void 0 !== r) return r.exports;
            var o = (t[n] = { exports: {} });
            return (e[n](o, o.exports, i), o.exports);
        }
        ((i.d = function (e, t) {
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
                (i.r(n),
                    i.d(n, {
                        AutoFocus: function () {
                            return e.AutoFocus;
                        },
                    }));
                var e = i(518);
                try {
                    FormValidation.plugins.AutoFocus = e.AutoFocus;
                } catch (e) {}
            })(),
            n
        );
    })();
});
