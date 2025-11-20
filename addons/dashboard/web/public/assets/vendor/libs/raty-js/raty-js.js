/**
 * @namespace: addons/dashboard/web/public/assets/vendor/libs/raty-js/raty-js.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

!(function (t, e) {
    if ('object' == typeof exports && 'object' == typeof module) module.exports = e();
    else if ('function' == typeof define && define.amd) define([], e);
    else {
        var s = e();
        for (var i in s) ('object' == typeof exports ? exports : t)[i] = s[i];
    }
})(self, function () {
    return (function () {
        'use strict';
        var t = {
                d: function (e, s) {
                    for (var i in s) t.o(s, i) && !t.o(e, i) && Object.defineProperty(e, i, { enumerable: !0, get: s[i] });
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
        (t.r(e),
            t.d(e, {
                Raty: function () {
                    return s;
                },
            }));
        var s = class {
            constructor(t, e = {}) {
                ((this.element = t), (this.opt = { ...this.defaultOptions(), ...e, ...this._parseOptions(t.dataset) }));
            }
            defaultOptions() {
                return {
                    cancelButton: !1,
                    cancelClass: 'raty-cancel',
                    cancelHint: 'Cancel this rating!',
                    cancelOff: 'cancel-off.png',
                    cancelOn: 'cancel-on.png',
                    cancelPlace: 'left',
                    click: void 0,
                    half: !1,
                    halfShow: !0,
                    hints: ['bad', 'poor', 'regular', 'good', 'gorgeous'],
                    iconRange: void 0,
                    iconRangeSame: !1,
                    mouseout: void 0,
                    mouseover: void 0,
                    noRatedMsg: 'Not rated yet!',
                    number: 5,
                    numberMax: 20,
                    path: void 0,
                    precision: !1,
                    readOnly: !1,
                    round: { down: 0.25, full: 0.6, up: 0.76 },
                    score: void 0,
                    scoreName: 'score',
                    single: !1,
                    space: !0,
                    starHalf: 'star-half.png',
                    starOff: 'star-off.png',
                    starOn: 'star-on.png',
                    starType: 'img',
                    target: void 0,
                    targetFormat: '{score}',
                    targetKeep: !1,
                    targetScore: void 0,
                    targetText: '',
                    targetType: 'hint',
                };
            }
            cancel(t) {
                this._isReadOnly() || (this[t ? 'click' : 'score'](null), this.scoreField.removeAttribute('value'));
            }
            click(t) {
                this._isReadOnly() ||
                    ((t = this._adjustedScore(t)),
                    this._apply(t),
                    this.opt.click && this.opt.click.call(this, t, this.element),
                    this._target(t));
            }
            move(t) {
                var e = parseInt(t, 10),
                    s = this._getDecimal(t, 1);
                e >= this.opt.number && ((e = this.opt.number - 1), (s = 10));
                var i = this._getWidth() / 10,
                    o = this.stars[e],
                    n = o.offsetLeft + i * s,
                    r = new Event('mousemove');
                ((r.pageX = n), (this.isMove = !0), o.dispatchEvent(r), (this.isMove = !1));
            }
            readOnly(t) {
                this._isReadOnly() !== t && (t ? this._lock() : (this._binds(), this._unlock()), (this.element.dataset.readOnly = t));
            }
            score() {
                return arguments.length ? this.setScore(arguments[0]) : this.getScore();
            }
            setScore(t) {
                this._isReadOnly() || ((t = this._adjustedScore(t)), this._apply(t), this._target(t));
            }
            getScore() {
                var t,
                    e = [];
                return ((t = this.scoreField.value), e.push(t ? +t : void 0), e.length > 1 ? e : e[0]);
            }
            init() {
                return (
                    this._executeCallbacks(),
                    this._adjustNumber(),
                    this._adjustHints(),
                    (this.opt.score = this._adjustedScore(this.opt.score)),
                    'img' !== this.opt.starType && this._adjustStarName(),
                    this._setPath(),
                    this._createStars(),
                    this.opt.cancelButton && this._createCancel(),
                    this.opt.precision && this._adjustPrecision(),
                    this._createScore(),
                    this._apply(this.opt.score),
                    this._setTitle(this.opt.score),
                    this._target(this.opt.score),
                    this.opt.readOnly ? this._lock() : ((this.element.style.cursor = 'pointer'), this._binds()),
                    this
                );
            }
            _adjustedScore(t) {
                if (t || 0 === t) return this._between(t, 0, this.opt.number);
            }
            _adjustHints() {
                if ((this.opt.hints || (this.opt.hints = []), this.opt.halfShow || this.opt.half)) {
                    var t = this.opt.precision ? 10 : 2;
                    for (let o = 0; o < this.opt.number; o++) {
                        var e = this.opt.hints[o];
                        ('[object Array]' !== Object.prototype.toString.call(e) && (e = [e]), (this.opt.hints[o] = []));
                        for (let n = 0; n < t; n++) {
                            var s = e[n],
                                i = e[e.length - 1];
                            (void 0 === i && (i = null), (this.opt.hints[o][n] = void 0 === s ? i : s));
                        }
                    }
                }
            }
            _adjustNumber() {
                this.opt.number = this._between(this.opt.number, 1, this.opt.numberMax);
            }
            _adjustPrecision() {
                this.opt.half = !0;
            }
            _adjustStarName() {
                const t = ['cancelOff', 'cancelOn', 'starHalf', 'starOff', 'starOn'];
                this.opt.path = '';
                for (let e = 0; e < t.length; e++) this.opt[t[e]] = this.opt[t[e]].replace('.', '-');
            }
            _apply(t) {
                (this._fill(t), t && (t > 0 && (this.scoreField.value = t), this._roundStars(t)));
            }
            _attributesForIndex(t) {
                var e = this._nameForIndex(t),
                    s = { alt: t, src: this.opt.path + this.opt[e] };
                return ('img' !== this.opt.starType && (s = { 'data-alt': t, class: this.opt[e] }), (s.title = this._getHint(t)), s);
            }
            _between(t, e, s) {
                return Math.min(Math.max(parseFloat(t), e), s);
            }
            _binds() {
                (this.cancelButton && (this._bindOverCancel(), this._bindClickCancel(), this._bindOutCancel()),
                    this._bindOver(),
                    this._bindClick(),
                    this._bindOut());
            }
            _bindClick() {
                this.stars.forEach((t) => {
                    t.addEventListener('click', (e) => {
                        if (this._isReadOnly()) return;
                        let s,
                            i = this.opt.half || this.opt.precision ? this.element.dataset.score : t.alt || t.dataset.alt;
                        (this.opt.half && !this.opt.precision && (i = this._roundHalfScore(i)),
                            this.opt.click && (s = this.opt.click.call(this, +i, this.element, e)),
                            (s || void 0 === s) && this._apply(+i));
                    });
                });
            }
            _bindClickCancel() {
                this.cancelButton.addEventListener('click', (t) => {
                    (this.scoreField.removeAttribute('value'), this.opt.click && this.opt.click.call(this, null, this.element, t));
                });
            }
            _bindOut() {
                this.element.addEventListener('mouseleave', (t) => {
                    const e = +this.scoreField.value || void 0;
                    (this._apply(e),
                        this._target(e, t),
                        this._resetTitle(),
                        this.opt.mouseout && this.opt.mouseout.call(this, e, this.element, t));
                });
            }
            _bindOutCancel() {
                this.cancelButton.addEventListener('mouseleave', (t) => {
                    let e = this.opt.cancelOff;
                    if (
                        ('img' !== this.opt.starType && (e = `${this.opt.cancelClass} ${e}`),
                        this._setIcon(this.cancelButton, e),
                        this.opt.mouseout)
                    ) {
                        const e = +this.scoreField.value || void 0;
                        this.opt.mouseout.call(this, e, this.element, t);
                    }
                });
            }
            _bindOver() {
                const t = this.opt.half ? 'mousemove' : 'mouseover';
                this.stars.forEach((e) => {
                    e.addEventListener(t, (t) => {
                        const s = this._getScoreByPosition(t, e);
                        (this._fill(s),
                            this.opt.half && (this._roundStars(s, t), this._setTitle(s, t), (this.element.dataset.score = s)),
                            this._target(s, t),
                            this.opt.mouseover && this.opt.mouseover.call(this, s, this.element, t));
                    });
                });
            }
            _bindOverCancel() {
                this.cancelButton.addEventListener('mouseover', (t) => {
                    if (this._isReadOnly()) return;
                    const e = this.opt.path + this.opt.starOff;
                    let s = this.opt.cancelOn;
                    ('img' === this.opt.starType
                        ? this.stars.forEach((t) => {
                              t.src = e;
                          })
                        : ((s = this.opt.cancelClass + ' ' + s),
                          this.stars.forEach((t) => {
                              t.className = e;
                          })),
                        this._setIcon(this.cancelButton, s),
                        this._target(null, t),
                        this.opt.mouseover && this.opt.mouseover.call(this, null, this.element, t));
                });
            }
            _buildScoreField() {
                const t = document.createElement('input');
                return ((t.name = this.opt.scoreName), (t.type = 'hidden'), this.element.appendChild(t), t);
            }
            _createCancel() {
                const t = document.createElement(this.opt.starType),
                    e = this.opt.path + this.opt.cancelOff;
                (t.setAttribute('class', this.opt.cancelClass),
                    t.setAttribute('title', this.opt.cancelHint),
                    'img' === this.opt.starType
                        ? (t.setAttribute('alt', 'x'), t.setAttribute('src', e))
                        : (t.classList.add(e), t.setAttribute('data-alt', 'x')),
                    'left' === this.opt.cancelPlace
                        ? (this.element.prepend(' '), this.element.prepend(t))
                        : (this.element.append(' '), this.element.appendChild(t)),
                    (this.cancelButton = t));
            }
            _createScore() {
                this.scoreField = document.querySelector(this.opt.targetScore) || this._buildScoreField();
            }
            _createStars() {
                for (let t = 1; t <= this.opt.number; t++) {
                    const e = this._attributesForIndex(t);
                    let s = document.createElement(this.opt.starType);
                    for (const t in e) s.setAttribute(t, e[t]);
                    (this.element.appendChild(s), this.opt.space && t < this.opt.number && this.element.append(' '));
                }
                this.stars = this.element.querySelectorAll(this.opt.starType);
            }
            _error(t) {
                throw new Error(t);
            }
            _executeCallbacks() {
                const t = ['number', 'readOnly', 'score', 'scoreName', 'target', 'path'];
                for (let e = 0; e < t.length; e++)
                    if ('function' == typeof this.opt[t[e]]) {
                        const s = this.opt[t[e]].call(this, this.element);
                        s ? (this.opt[t[e]] = s) : delete this.opt[t[e]];
                    }
            }
            _fill(t) {
                let e = 0;
                if (this.opt.iconRangeSame && this.opt.iconRange)
                    for (; e < this.opt.iconRange.length && this.opt.iconRange[e].range < t; ) e++;
                for (let s = 1; s <= this.stars.length; s++) {
                    const i = this.stars[s - 1],
                        o = this._turnOn(s, t);
                    let n;
                    if (this.opt.iconRange && this.opt.iconRange.length > e) {
                        const t = this.opt.iconRange[e];
                        ((n = this._getRangeIcon(t, o)), s <= t.range && this._setIcon(i, n), s === t.range && e++);
                    } else ((n = this.opt[o ? 'starOn' : 'starOff']), this._setIcon(i, n));
                }
            }
            _getDecimal(t, e) {
                const s = t.toString().split('.')[1];
                let i = 0;
                return (s && ((i = parseInt(s.slice(0, e), 10)), '9999' === s.slice(1, 5) && i++), i);
            }
            _getRangeIcon(t, e) {
                return e ? t.on || this.opt.starOn : t.off || this.opt.starOff;
            }
            _getScoreByPosition(t, e) {
                let s = parseInt(e.alt || e.getAttribute('data-alt'), 10);
                if (this.opt.half) {
                    const i = this._getWidth();
                    s = s - 1 + parseFloat((t.pageX - e.getBoundingClientRect().x) / i);
                }
                return s;
            }
            _getHint(t, e) {
                if (0 !== t && !t) return this.opt.noRatedMsg;
                const s = Math.ceil(t),
                    i = this.opt.hints[(s || 1) - 1],
                    o = !e || this.isMove;
                let n = this._getDecimal(t, 1),
                    r = i;
                return (
                    this.opt.precision
                        ? (o && (n = 0 === n ? 9 : n - 1), (r = i[n]))
                        : (this.opt.halfShow || this.opt.half) && ((n = (o && 0 === n) || n > 5 ? 1 : 0), (r = i[n])),
                    '' === r ? '' : r || t
                );
            }
            _getWidth() {
                const t = parseFloat(this.stars[0].offsetWidth) || 16;
                return (t || this._error('Could not get the icon width!'), t);
            }
            _isReadOnly() {
                return { true: !0 }[this.element.dataset.readOnly] || !1;
            }
            _lock() {
                const t = this._getHint(this.scoreField.value);
                ((this.element.style.pointerEvents = 'none'),
                    (this.element.title = t),
                    (this.scoreField.readOnly = !0),
                    this.stars.forEach((e) => {
                        e.title = t;
                    }),
                    this.cancelButton && (this.cancelButton.style.display = 'none'),
                    (this.element.dataset.readOnly = !0));
            }
            _nameForIndex(t) {
                return this.opt.score && this.opt.score >= t ? 'starOn' : 'starOff';
            }
            _resetTitle() {
                for (let t = 0; t < this.opt.number; t++) this.stars[t].title = this._getHint(t + 1);
            }
            _parseOptions(t) {
                return Object.keys(t).reduce((e, s) => {
                    let i = { true: !0, false: !1 }[t[s]];
                    return ((i = null != i ? i : t[s]), !isNaN(i) && Number.isInteger(parseFloat(i)) && (i = Number(i)), (e[s] = i), e);
                }, {});
            }
            _roundHalfScore(t) {
                const e = parseInt(t, 10);
                let s = this._getDecimal(t, 1);
                return (0 !== s && (s = s > 5 ? 1 : 0.5), e + s);
            }
            _roundStars(t, e) {
                const s = this._starName(t, e);
                if (s) {
                    const e = this.opt[s],
                        i = this.stars[Math.ceil(t) - 1];
                    i && this._setIcon(i, e);
                }
            }
            _setIcon(t, e) {
                t['img' === this.opt.starType ? 'src' : 'className'] = this.opt.path + e;
            }
            _setPath() {
                ((this.opt.path = this.opt.path || ''), this.opt.path && '/' !== this.opt.path.slice(-1) && (this.opt.path += '/'));
            }
            _setTarget(t, e) {
                (e && (e = this.opt.targetFormat.toString().replace('{score}', e)),
                    t instanceof HTMLInputElement || t instanceof HTMLSelectElement ? (t.value = e) : (t.textContent = e));
            }
            _setTitle(t, e) {
                if (t) {
                    const s = parseInt(Math.ceil(t), 10);
                    this.stars.item(s - 1).title = this._getHint(t, e);
                }
            }
            _starName(t, e) {
                const s = +(t % 1).toFixed(2);
                return e || this.isMove
                    ? s > 0.5
                        ? 'starOn'
                        : 'starHalf'
                    : s <= this.opt.round.down
                      ? void 0
                      : this.opt.halfShow && s < this.opt.round.up
                        ? 'starHalf'
                        : s < this.opt.round.full
                          ? 'starOff'
                          : 'starOn';
            }
            _target(t, e) {
                if (this.opt.target) {
                    const s = document.querySelector(this.opt.target);
                    s || this._error('Target selector invalid or missing!');
                    const i = e && 'mouseover' === e.type;
                    if (void 0 === t) t = this.opt.targetText;
                    else if (null === t) t = i ? this.opt.cancelHint : this.opt.targetText;
                    else {
                        'hint' === this.opt.targetType ? (t = this._getHint(t, e)) : this.opt.precision && (t = parseFloat(t).toFixed(1));
                        const s = e && 'mousemove' === e.type;
                        i || s || this.opt.targetKeep || (t = this.opt.targetText);
                    }
                    this._setTarget(s, t);
                }
            }
            _turnOn(t, e) {
                return this.opt.single ? t === e : t <= e;
            }
            _unlock() {
                ((this.element.style.cursor = 'pointer'),
                    (this.element.style.pointerEvents = 'auto'),
                    this.element.removeAttribute('title'),
                    (this.element.dataset.readOnly = !1),
                    (this.scoreField.readOnly = !1),
                    this._resetTitle(),
                    this.cancelButton && (this.cancelButton.style.display = ''));
            }
        };
        try {
            window.Raty = s;
        } catch (t) {}
        return e;
    })();
});
