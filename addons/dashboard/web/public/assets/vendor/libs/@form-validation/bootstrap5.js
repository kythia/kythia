/**
 * @namespace: addons/dashboard/web/public/assets/vendor/libs/@form-validation/bootstrap5.js
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
                                            for (var n = t, r = this.filters[e], o = r.length, a = 0; a < o; a++) n = r[a].apply(n, i);
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
                                            var a = t.getAttribute('type');
                                            return (
                                                ('radio' !== a && 'checkbox' !== a && 1 !== n.length) ||
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
                                        a = this.filter.execute('validator-name', i, [i, e]);
                                    if (
                                        ((n.message = this.filter.execute('validator-message', n.message, [this.locale, e, a])),
                                        !this.validators[a] || !1 === n.enabled)
                                    )
                                        return (
                                            this.emit('core.validator.validated', {
                                                element: t,
                                                elements: o,
                                                field: e,
                                                result: this.normalizeResult(e, a, { valid: !0 }),
                                                validator: a,
                                            }),
                                            Promise.resolve('Valid')
                                        );
                                    var s = this.validators[a],
                                        l = this.getElementValue(e, t, a);
                                    if (!this.filter.execute('field-should-validate', !0, [e, t, l, i]))
                                        return (
                                            this.emit('core.validator.notvalidated', { element: t, elements: o, field: e, validator: i }),
                                            Promise.resolve('NotValidated')
                                        );
                                    this.emit('core.validator.validating', { element: t, elements: o, field: e, validator: i });
                                    var d = s().validate({
                                        element: t,
                                        elements: o,
                                        field: e,
                                        l10n: this.localization,
                                        options: n,
                                        value: l,
                                    });
                                    if ('function' == typeof d.then)
                                        return d.then(function (n) {
                                            var a = r.normalizeResult(e, i, n);
                                            return (
                                                r.emit('core.validator.validated', {
                                                    element: t,
                                                    elements: o,
                                                    field: e,
                                                    result: a,
                                                    validator: i,
                                                }),
                                                a.valid ? 'Valid' : 'Invalid'
                                            );
                                        });
                                    var c = this.normalizeResult(e, i, d);
                                    return (
                                        this.emit('core.validator.validated', {
                                            element: t,
                                            elements: o,
                                            field: e,
                                            result: c,
                                            validator: i,
                                        }),
                                        Promise.resolve(c.valid ? 'Valid' : 'Invalid')
                                    );
                                }),
                                (e.prototype.getElementValue = function (e, t, i) {
                                    var n = (function (e, t, i, n) {
                                        var r = (i.getAttribute('type') || '').toLowerCase(),
                                            o = i.tagName.toLowerCase();
                                        if ('textarea' === o) return i.value;
                                        if ('select' === o) {
                                            var a = i,
                                                s = a.selectedIndex;
                                            return s >= 0 ? a.options.item(s).value : '';
                                        }
                                        if ('input' === o) {
                                            if ('radio' === r || 'checkbox' === r) {
                                                var l = n.filter(function (e) {
                                                    return e.checked;
                                                }).length;
                                                return 0 === l ? '' : l + '';
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
                                        a = this.fields[e].validators,
                                        s = n ? [n] : Object.keys(a);
                                    switch (i) {
                                        case 'NotValidated':
                                            (s.forEach(function (i) {
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
                                            (s.forEach(function (i) {
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
                                            (s.forEach(function (i) {
                                                return r.emit('core.validator.validated', {
                                                    element: t,
                                                    elements: o,
                                                    field: e,
                                                    result: { message: a[i].message, valid: !0 },
                                                    validator: i,
                                                });
                                            }),
                                                this.emit('core.element.validated', { element: t, elements: o, field: e, valid: !0 }));
                                            break;
                                        case 'Invalid':
                                            (s.forEach(function (i) {
                                                return r.emit('core.validator.validated', {
                                                    element: t,
                                                    elements: o,
                                                    field: e,
                                                    result: { message: a[i].message, valid: !1 },
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
                        a = {
                            call: function (e, t) {
                                if ('function' == typeof e) return e.apply(this, t);
                                if ('string' == typeof e) {
                                    var i = e;
                                    '()' === i.substring(i.length - 2) && (i = i.substring(0, i.length - 2));
                                    for (var n = i.split('.'), r = n.pop(), o = window, a = 0, s = n; a < s.length; a++) o = o[s[a]];
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
                                        a = Object.keys(o.params)
                                            .map(function (e) {
                                                return ''.concat(encodeURIComponent(e), '=').concat(encodeURIComponent(o.params[e]));
                                            })
                                            .join('&'),
                                        s = e.indexOf('?') > -1,
                                        l =
                                            'GET' === o.method
                                                ? ''
                                                      .concat(e)
                                                      .concat(s ? '&' : '?')
                                                      .concat(a)
                                                : e;
                                    if (o.crossDomain) {
                                        var d = document.createElement('script'),
                                            c = '___FormValidationFetch_'.concat(
                                                Array(12)
                                                    .fill('')
                                                    .map(function (e) {
                                                        return Math.random().toString(36).charAt(2);
                                                    })
                                                    .join(''),
                                                '___'
                                            );
                                        ((window[c] = function (e) {
                                            (delete window[c], i(e));
                                        }),
                                            (d.src = ''
                                                .concat(l)
                                                .concat(s ? '&' : '?', 'callback=')
                                                .concat(c)),
                                            (d.async = !0),
                                            d.addEventListener('load', function () {
                                                d.parentNode.removeChild(d);
                                            }),
                                            d.addEventListener('error', function () {
                                                return n;
                                            }),
                                            document.head.appendChild(d));
                                    } else {
                                        var u = new XMLHttpRequest();
                                        (u.open(o.method, l),
                                            u.setRequestHeader('X-Requested-With', 'XMLHttpRequest'),
                                            'POST' === o.method && u.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'),
                                            Object.keys(o.headers).forEach(function (e) {
                                                return u.setRequestHeader(e, o.headers[e]);
                                            }),
                                            u.addEventListener('load', function () {
                                                i(JSON.parse(this.responseText));
                                            }),
                                            u.addEventListener('error', function () {
                                                return n;
                                            }),
                                            u.send(
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
                                        a = r.getMonth(),
                                        s = r.getDate();
                                    return e < o || (e === o && t - 1 < a) || (e === o && t - 1 === a && i < s);
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
                        (t.utils = a));
                },
                4786: function (e, t, i) {
                    e.exports = i(1979);
                },
                483: function (e, t, i) {
                    var n = i(4786),
                        r = i(1938),
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
                        a = n.utils.classSet,
                        s = n.utils.hasClass,
                        l = (function (e) {
                            function t(t) {
                                var i =
                                    e.call(
                                        this,
                                        Object.assign(
                                            {},
                                            {
                                                eleInvalidClass: 'is-invalid',
                                                eleValidClass: 'is-valid',
                                                formClass: 'fv-plugins-bootstrap5',
                                                rowInvalidClass: 'fv-plugins-bootstrap5-row-invalid',
                                                rowPattern: /^(.*)(col|offset)(-(sm|md|lg|xl))*-[0-9]+(.*)$/,
                                                rowSelector: '.row',
                                                rowValidClass: 'fv-plugins-bootstrap5-row-valid',
                                            },
                                            t
                                        )
                                    ) || this;
                                return ((i.eleValidatedHandler = i.handleElementValidated.bind(i)), i);
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
                                    (e.prototype.install.call(this), this.core.on('core.element.validated', this.eleValidatedHandler));
                                }),
                                (t.prototype.uninstall = function () {
                                    (e.prototype.uninstall.call(this), this.core.off('core.element.validated', this.eleValidatedHandler));
                                }),
                                (t.prototype.handleElementValidated = function (e) {
                                    var t = e.element.getAttribute('type');
                                    if (('checkbox' === t || 'radio' === t) && e.elements.length > 1 && s(e.element, 'form-check-input')) {
                                        var i = e.element.parentElement;
                                        s(i, 'form-check') &&
                                            s(i, 'form-check-inline') &&
                                            a(i, { 'is-invalid': !e.valid, 'is-valid': e.valid });
                                    }
                                }),
                                (t.prototype.onIconPlaced = function (e) {
                                    a(e.element, { 'fv-plugins-icon-input': !0 });
                                    var t = e.element.parentElement;
                                    s(t, 'input-group') &&
                                        (t.parentElement.insertBefore(e.iconElement, t.nextSibling),
                                        e.element.nextElementSibling &&
                                            s(e.element.nextElementSibling, 'input-group-text') &&
                                            a(e.iconElement, { 'fv-plugins-icon-input-group': !0 }));
                                    var i = e.element.getAttribute('type');
                                    if ('checkbox' === i || 'radio' === i) {
                                        var n = t.parentElement;
                                        s(t, 'form-check')
                                            ? (a(e.iconElement, { 'fv-plugins-icon-check': !0 }),
                                              t.parentElement.insertBefore(e.iconElement, t.nextSibling))
                                            : s(t.parentElement, 'form-check') &&
                                              (a(e.iconElement, { 'fv-plugins-icon-check': !0 }),
                                              n.parentElement.insertBefore(e.iconElement, n.nextSibling));
                                    }
                                }),
                                (t.prototype.onMessagePlaced = function (e) {
                                    e.messageElement.classList.add('invalid-feedback');
                                    var t = e.element.parentElement;
                                    if (s(t, 'input-group')) return (t.appendChild(e.messageElement), void a(t, { 'has-validation': !0 }));
                                    var i = e.element.getAttribute('type');
                                    ('checkbox' !== i && 'radio' !== i) ||
                                        !s(e.element, 'form-check-input') ||
                                        !s(t, 'form-check') ||
                                        s(t, 'form-check-inline') ||
                                        e.elements[e.elements.length - 1].parentElement.appendChild(e.messageElement);
                                }),
                                t
                            );
                        })(r.Framework);
                    t.Bootstrap5 = l;
                },
                5716: function (e, t, i) {
                    e.exports = i(483);
                },
                7964: function (e, t, i) {
                    var n = i(4786),
                        r = i(2891),
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
                        a = n.utils.classSet,
                        s = n.utils.closest,
                        l = (function (e) {
                            function t(t) {
                                var i = e.call(this, t) || this;
                                return (
                                    (i.results = new Map()),
                                    (i.containers = new Map()),
                                    (i.opts = Object.assign(
                                        {},
                                        {
                                            defaultMessageContainer: !0,
                                            eleInvalidClass: '',
                                            eleValidClass: '',
                                            rowClasses: '',
                                            rowValidatingClass: '',
                                        },
                                        t
                                    )),
                                    (i.elementIgnoredHandler = i.onElementIgnored.bind(i)),
                                    (i.elementValidatingHandler = i.onElementValidating.bind(i)),
                                    (i.elementValidatedHandler = i.onElementValidated.bind(i)),
                                    (i.elementNotValidatedHandler = i.onElementNotValidated.bind(i)),
                                    (i.iconPlacedHandler = i.onIconPlaced.bind(i)),
                                    (i.fieldAddedHandler = i.onFieldAdded.bind(i)),
                                    (i.fieldRemovedHandler = i.onFieldRemoved.bind(i)),
                                    (i.messagePlacedHandler = i.onMessagePlaced.bind(i)),
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
                                    var e,
                                        i = this;
                                    (a(
                                        this.core.getFormElement(),
                                        (((e = {})[this.opts.formClass] = !0), (e['fv-plugins-framework'] = !0), e)
                                    ),
                                        this.core
                                            .on('core.element.ignored', this.elementIgnoredHandler)
                                            .on('core.element.validating', this.elementValidatingHandler)
                                            .on('core.element.validated', this.elementValidatedHandler)
                                            .on('core.element.notvalidated', this.elementNotValidatedHandler)
                                            .on('plugins.icon.placed', this.iconPlacedHandler)
                                            .on('core.field.added', this.fieldAddedHandler)
                                            .on('core.field.removed', this.fieldRemovedHandler),
                                        this.opts.defaultMessageContainer &&
                                            (this.core.registerPlugin(
                                                t.MESSAGE_PLUGIN,
                                                new r.Message({
                                                    clazz: this.opts.messageClass,
                                                    container: function (e, t) {
                                                        var n =
                                                                'string' == typeof i.opts.rowSelector
                                                                    ? i.opts.rowSelector
                                                                    : i.opts.rowSelector(e, t),
                                                            o = s(t, n);
                                                        return r.Message.getClosestContainer(t, o, i.opts.rowPattern);
                                                    },
                                                })
                                            ),
                                            this.core.on('plugins.message.placed', this.messagePlacedHandler)));
                                }),
                                (t.prototype.uninstall = function () {
                                    var e;
                                    (this.results.clear(),
                                        this.containers.clear(),
                                        a(
                                            this.core.getFormElement(),
                                            (((e = {})[this.opts.formClass] = !1), (e['fv-plugins-framework'] = !1), e)
                                        ),
                                        this.core
                                            .off('core.element.ignored', this.elementIgnoredHandler)
                                            .off('core.element.validating', this.elementValidatingHandler)
                                            .off('core.element.validated', this.elementValidatedHandler)
                                            .off('core.element.notvalidated', this.elementNotValidatedHandler)
                                            .off('plugins.icon.placed', this.iconPlacedHandler)
                                            .off('core.field.added', this.fieldAddedHandler)
                                            .off('core.field.removed', this.fieldRemovedHandler),
                                        this.opts.defaultMessageContainer &&
                                            (this.core.deregisterPlugin(t.MESSAGE_PLUGIN),
                                            this.core.off('plugins.message.placed', this.messagePlacedHandler)));
                                }),
                                (t.prototype.onEnabled = function () {
                                    var e;
                                    (a(this.core.getFormElement(), (((e = {})[this.opts.formClass] = !0), e)),
                                        this.opts.defaultMessageContainer && this.core.enablePlugin(t.MESSAGE_PLUGIN));
                                }),
                                (t.prototype.onDisabled = function () {
                                    var e;
                                    (a(this.core.getFormElement(), (((e = {})[this.opts.formClass] = !1), e)),
                                        this.opts.defaultMessageContainer && this.core.disablePlugin(t.MESSAGE_PLUGIN));
                                }),
                                (t.prototype.onIconPlaced = function (e) {}),
                                (t.prototype.onMessagePlaced = function (e) {}),
                                (t.prototype.onFieldAdded = function (e) {
                                    var t = this,
                                        i = e.elements;
                                    i &&
                                        (i.forEach(function (e) {
                                            var i,
                                                n = t.containers.get(e);
                                            n &&
                                                (a(
                                                    n,
                                                    (((i = {})[t.opts.rowInvalidClass] = !1),
                                                    (i[t.opts.rowValidatingClass] = !1),
                                                    (i[t.opts.rowValidClass] = !1),
                                                    (i['fv-plugins-icon-container'] = !1),
                                                    i)
                                                ),
                                                t.containers.delete(e));
                                        }),
                                        this.prepareFieldContainer(e.field, i));
                                }),
                                (t.prototype.onFieldRemoved = function (e) {
                                    var t = this;
                                    e.elements.forEach(function (e) {
                                        var i,
                                            n = t.containers.get(e);
                                        n &&
                                            a(
                                                n,
                                                (((i = {})[t.opts.rowInvalidClass] = !1),
                                                (i[t.opts.rowValidatingClass] = !1),
                                                (i[t.opts.rowValidClass] = !1),
                                                i)
                                            );
                                    });
                                }),
                                (t.prototype.prepareFieldContainer = function (e, t) {
                                    var i = this;
                                    if (t.length) {
                                        var n = t[0].getAttribute('type');
                                        'radio' === n || 'checkbox' === n
                                            ? this.prepareElementContainer(e, t[0])
                                            : t.forEach(function (t) {
                                                  return i.prepareElementContainer(e, t);
                                              });
                                    }
                                }),
                                (t.prototype.prepareElementContainer = function (e, t) {
                                    var i,
                                        n = 'string' == typeof this.opts.rowSelector ? this.opts.rowSelector : this.opts.rowSelector(e, t),
                                        r = s(t, n);
                                    r !== t &&
                                        (a(r, (((i = {})[this.opts.rowClasses] = !0), (i['fv-plugins-icon-container'] = !0), i)),
                                        this.containers.set(t, r));
                                }),
                                (t.prototype.onElementValidating = function (e) {
                                    this.removeClasses(e.element, e.elements);
                                }),
                                (t.prototype.onElementNotValidated = function (e) {
                                    this.removeClasses(e.element, e.elements);
                                }),
                                (t.prototype.onElementIgnored = function (e) {
                                    this.removeClasses(e.element, e.elements);
                                }),
                                (t.prototype.removeClasses = function (e, t) {
                                    var i,
                                        n = this,
                                        r = e.getAttribute('type'),
                                        o = 'radio' === r || 'checkbox' === r ? t[0] : e;
                                    t.forEach(function (e) {
                                        var t;
                                        a(e, (((t = {})[n.opts.eleValidClass] = !1), (t[n.opts.eleInvalidClass] = !1), t));
                                    });
                                    var s = this.containers.get(o);
                                    s &&
                                        a(
                                            s,
                                            (((i = {})[this.opts.rowInvalidClass] = !1),
                                            (i[this.opts.rowValidatingClass] = !1),
                                            (i[this.opts.rowValidClass] = !1),
                                            i)
                                        );
                                }),
                                (t.prototype.onElementValidated = function (e) {
                                    var t,
                                        i,
                                        n = this,
                                        r = e.elements,
                                        o = e.element.getAttribute('type'),
                                        s = 'radio' === o || 'checkbox' === o ? r[0] : e.element;
                                    r.forEach(function (t) {
                                        var i;
                                        a(t, (((i = {})[n.opts.eleValidClass] = e.valid), (i[n.opts.eleInvalidClass] = !e.valid), i));
                                    });
                                    var l = this.containers.get(s);
                                    if (l)
                                        if (e.valid) {
                                            this.results.delete(s);
                                            var d = !0;
                                            (this.containers.forEach(function (e, t) {
                                                e === l && !1 === n.results.get(t) && (d = !1);
                                            }),
                                                d &&
                                                    a(
                                                        l,
                                                        (((i = {})[this.opts.rowInvalidClass] = !1),
                                                        (i[this.opts.rowValidatingClass] = !1),
                                                        (i[this.opts.rowValidClass] = !0),
                                                        i)
                                                    ));
                                        } else
                                            (this.results.set(s, !1),
                                                a(
                                                    l,
                                                    (((t = {})[this.opts.rowInvalidClass] = !0),
                                                    (t[this.opts.rowValidatingClass] = !1),
                                                    (t[this.opts.rowValidClass] = !1),
                                                    t)
                                                ));
                                }),
                                (t.MESSAGE_PLUGIN = '___frameworkMessage'),
                                t
                            );
                        })(n.Plugin);
                    t.Framework = l;
                },
                1938: function (e, t, i) {
                    e.exports = i(7964);
                },
                1954: function (e, t, i) {
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
                        o = n.utils.classSet,
                        a = (function (e) {
                            function t(t) {
                                var i = e.call(this, t) || this;
                                return (
                                    (i.useDefaultContainer = !1),
                                    (i.messages = new Map()),
                                    (i.defaultContainer = document.createElement('div')),
                                    (i.useDefaultContainer = !t || !t.container),
                                    (i.opts = Object.assign(
                                        {},
                                        {
                                            container: function (e, t) {
                                                return i.defaultContainer;
                                            },
                                        },
                                        t
                                    )),
                                    (i.elementIgnoredHandler = i.onElementIgnored.bind(i)),
                                    (i.fieldAddedHandler = i.onFieldAdded.bind(i)),
                                    (i.fieldRemovedHandler = i.onFieldRemoved.bind(i)),
                                    (i.validatorValidatedHandler = i.onValidatorValidated.bind(i)),
                                    (i.validatorNotValidatedHandler = i.onValidatorNotValidated.bind(i)),
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
                                (t.getClosestContainer = function (e, t, i) {
                                    for (var n = e; n && n !== t && ((n = n.parentElement), !i.test(n.className)); );
                                    return n;
                                }),
                                (t.prototype.install = function () {
                                    (this.useDefaultContainer && this.core.getFormElement().appendChild(this.defaultContainer),
                                        this.core
                                            .on('core.element.ignored', this.elementIgnoredHandler)
                                            .on('core.field.added', this.fieldAddedHandler)
                                            .on('core.field.removed', this.fieldRemovedHandler)
                                            .on('core.validator.validated', this.validatorValidatedHandler)
                                            .on('core.validator.notvalidated', this.validatorNotValidatedHandler));
                                }),
                                (t.prototype.uninstall = function () {
                                    (this.useDefaultContainer && this.core.getFormElement().removeChild(this.defaultContainer),
                                        this.messages.forEach(function (e) {
                                            return e.parentNode.removeChild(e);
                                        }),
                                        this.messages.clear(),
                                        this.core
                                            .off('core.element.ignored', this.elementIgnoredHandler)
                                            .off('core.field.added', this.fieldAddedHandler)
                                            .off('core.field.removed', this.fieldRemovedHandler)
                                            .off('core.validator.validated', this.validatorValidatedHandler)
                                            .off('core.validator.notvalidated', this.validatorNotValidatedHandler));
                                }),
                                (t.prototype.onEnabled = function () {
                                    this.messages.forEach(function (e, t, i) {
                                        o(t, { 'fv-plugins-message-container--enabled': !0, 'fv-plugins-message-container--disabled': !1 });
                                    });
                                }),
                                (t.prototype.onDisabled = function () {
                                    this.messages.forEach(function (e, t, i) {
                                        o(t, { 'fv-plugins-message-container--enabled': !1, 'fv-plugins-message-container--disabled': !0 });
                                    });
                                }),
                                (t.prototype.onFieldAdded = function (e) {
                                    var t = this,
                                        i = e.elements;
                                    i &&
                                        (i.forEach(function (e) {
                                            var i = t.messages.get(e);
                                            i && (i.parentNode.removeChild(i), t.messages.delete(e));
                                        }),
                                        this.prepareFieldContainer(e.field, i));
                                }),
                                (t.prototype.onFieldRemoved = function (e) {
                                    var t = this;
                                    if (e.elements.length && e.field) {
                                        var i = e.elements[0].getAttribute('type');
                                        ('radio' === i || 'checkbox' === i ? [e.elements[0]] : e.elements).forEach(function (e) {
                                            if (t.messages.has(e)) {
                                                var i = t.messages.get(e);
                                                (i.parentNode.removeChild(i), t.messages.delete(e));
                                            }
                                        });
                                    }
                                }),
                                (t.prototype.prepareFieldContainer = function (e, t) {
                                    var i = this;
                                    if (t.length) {
                                        var n = t[0].getAttribute('type');
                                        'radio' === n || 'checkbox' === n
                                            ? this.prepareElementContainer(e, t[0], t)
                                            : t.forEach(function (n) {
                                                  return i.prepareElementContainer(e, n, t);
                                              });
                                    }
                                }),
                                (t.prototype.prepareElementContainer = function (e, t, i) {
                                    var n;
                                    if ('string' == typeof this.opts.container) {
                                        var r =
                                            '#' === this.opts.container.charAt(0)
                                                ? '[id="'.concat(this.opts.container.substring(1), '"]')
                                                : this.opts.container;
                                        n = this.core.getFormElement().querySelector(r);
                                    } else n = this.opts.container(e, t);
                                    var a = document.createElement('div');
                                    (n.appendChild(a),
                                        o(a, {
                                            'fv-plugins-message-container': !0,
                                            'fv-plugins-message-container--enabled': this.isEnabled,
                                            'fv-plugins-message-container--disabled': !this.isEnabled,
                                        }),
                                        this.core.emit('plugins.message.placed', { element: t, elements: i, field: e, messageElement: a }),
                                        this.messages.set(t, a));
                                }),
                                (t.prototype.getMessage = function (e) {
                                    return 'string' == typeof e.message ? e.message : e.message[this.core.getLocale()];
                                }),
                                (t.prototype.onValidatorValidated = function (e) {
                                    var t,
                                        i = e.elements,
                                        n = e.element.getAttribute('type'),
                                        r = ('radio' === n || 'checkbox' === n) && i.length > 0 ? i[0] : e.element;
                                    if (this.messages.has(r)) {
                                        var a = this.messages.get(r),
                                            s = a.querySelector(
                                                '[data-field="'
                                                    .concat(e.field.replace(/"/g, '\\"'), '"][data-validator="')
                                                    .concat(e.validator.replace(/"/g, '\\"'), '"]')
                                            );
                                        if (s || e.result.valid)
                                            s && !e.result.valid
                                                ? ((s.innerHTML = this.getMessage(e.result)),
                                                  this.core.emit('plugins.message.displayed', {
                                                      element: e.element,
                                                      field: e.field,
                                                      message: e.result.message,
                                                      messageElement: s,
                                                      meta: e.result.meta,
                                                      validator: e.validator,
                                                  }))
                                                : s && e.result.valid && a.removeChild(s);
                                        else {
                                            var l = document.createElement('div');
                                            ((l.innerHTML = this.getMessage(e.result)),
                                                l.setAttribute('data-field', e.field),
                                                l.setAttribute('data-validator', e.validator),
                                                this.opts.clazz && o(l, (((t = {})[this.opts.clazz] = !0), t)),
                                                a.appendChild(l),
                                                this.core.emit('plugins.message.displayed', {
                                                    element: e.element,
                                                    field: e.field,
                                                    message: e.result.message,
                                                    messageElement: l,
                                                    meta: e.result.meta,
                                                    validator: e.validator,
                                                }));
                                        }
                                    }
                                }),
                                (t.prototype.onValidatorNotValidated = function (e) {
                                    var t = e.elements,
                                        i = e.element.getAttribute('type'),
                                        n = 'radio' === i || 'checkbox' === i ? t[0] : e.element;
                                    if (this.messages.has(n)) {
                                        var r = this.messages.get(n),
                                            o = r.querySelector(
                                                '[data-field="'
                                                    .concat(e.field.replace(/"/g, '\\"'), '"][data-validator="')
                                                    .concat(e.validator.replace(/"/g, '\\"'), '"]')
                                            );
                                        o && r.removeChild(o);
                                    }
                                }),
                                (t.prototype.onElementIgnored = function (e) {
                                    var t = e.elements,
                                        i = e.element.getAttribute('type'),
                                        n = 'radio' === i || 'checkbox' === i ? t[0] : e.element;
                                    if (this.messages.has(n)) {
                                        var r = this.messages.get(n);
                                        [].slice
                                            .call(r.querySelectorAll('[data-field="'.concat(e.field.replace(/"/g, '\\"'), '"]')))
                                            .forEach(function (e) {
                                                r.removeChild(e);
                                            });
                                    }
                                }),
                                t
                            );
                        })(n.Plugin);
                    t.Message = a;
                },
                2891: function (e, t, i) {
                    e.exports = i(1954);
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
                        Bootstrap5: function () {
                            return e.Bootstrap5;
                        },
                    }));
                var e = i(5716);
                try {
                    FormValidation.plugins.Bootstrap5 = e.Bootstrap5;
                } catch (e) {}
            })(),
            n
        );
    })();
});
