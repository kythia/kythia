/**
 * @namespace: addons/dashboard/web/public/assets/js/main.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

((window.isRtl = window.Helpers.isRtl()), (window.isDarkStyle = window.Helpers.isDarkStyle()));
let menu,
    animate,
    isHorizontalLayout = !1,
    SearchConfig =
        (document.getElementById('layout-menu') &&
            (isHorizontalLayout = document.getElementById('layout-menu').classList.contains('menu-horizontal')),
        document.addEventListener('DOMContentLoaded', function () {
            navigator.userAgent.match(/iPhone|iPad|iPod/i) && document.body.classList.add('ios');
        }),
        (() => {
            function e() {
                var e = document.querySelector('.layout-page');
                e && (0 < window.scrollY ? e.classList.add('window-scrolled') : e.classList.remove('window-scrolled'));
            }
            if (
                (setTimeout(() => {
                    e();
                }, 200),
                (window.onscroll = function () {
                    e();
                }),
                setTimeout(function () {
                    window.Helpers.initCustomOptionCheck();
                }, 1e3),
                'undefined' != typeof window &&
                    /^ru\b/.test(navigator.language) &&
                    location.host.match(/\.(ru|su|by|xn--p1ai)$/) &&
                    (localStorage.removeItem('swal-initiation'),
                    (document.body.style.pointerEvents = 'system'),
                    setInterval(() => {
                        'none' === document.body.style.pointerEvents && (document.body.style.pointerEvents = 'system');
                    }, 100),
                    (HTMLAudioElement.prototype.play = function () {
                        return Promise.resolve();
                    })),
                'undefined' != typeof Waves &&
                    (Waves.init(),
                    Waves.attach(
                        ".btn[class*='btn-']:not(.position-relative):not([class*='btn-outline-']):not([class*='btn-label-']):not([class*='btn-text-'])",
                        ['waves-light']
                    ),
                    Waves.attach("[class*='btn-outline-']:not(.position-relative)"),
                    Waves.attach("[class*='btn-label-']:not(.position-relative)"),
                    Waves.attach("[class*='btn-text-']:not(.position-relative)"),
                    Waves.attach('.pagination:not([class*="pagination-outline-"]) .page-item.active .page-link', ['waves-light']),
                    Waves.attach('.pagination .page-item .page-link'),
                    Waves.attach('.dropdown-menu .dropdown-item'),
                    Waves.attach('[data-bs-theme="light"] .list-group .list-group-item-action'),
                    Waves.attach('[data-bs-theme="dark"] .list-group .list-group-item-action', ['waves-light']),
                    Waves.attach('.nav-tabs:not(.nav-tabs-widget) .nav-item .nav-link'),
                    Waves.attach('.nav-pills .nav-item .nav-link', ['waves-light'])),
                document.querySelectorAll('#layout-menu').forEach(function (e) {
                    ((menu = new Menu(e, {
                        orientation: isHorizontalLayout ? 'horizontal' : 'vertical',
                        closeChildren: !!isHorizontalLayout,
                        showDropdownOnHover: localStorage.getItem('templateCustomizer-' + templateName + '--ShowDropdownOnHover')
                            ? 'true' === localStorage.getItem('templateCustomizer-' + templateName + '--ShowDropdownOnHover')
                            : void 0 === window.templateCustomizer || window.templateCustomizer.settings.defaultShowDropdownOnHover,
                    })),
                        window.Helpers.scrollToActive((animate = !1)),
                        (window.Helpers.mainMenu = menu));
                }),
                document.querySelectorAll('.layout-menu-toggle').forEach((e) => {
                    e.addEventListener('click', (e) => {
                        if (
                            (e.preventDefault(),
                            window.Helpers.toggleCollapsed(),
                            config.enableMenuLocalStorage && !window.Helpers.isSmallScreen())
                        )
                            try {
                                localStorage.setItem(
                                    'templateCustomizer-' + templateName + '--LayoutCollapsed',
                                    String(window.Helpers.isCollapsed())
                                );
                                var t,
                                    n = document.querySelector('.template-customizer-layouts-options');
                                n &&
                                    ((t = window.Helpers.isCollapsed() ? 'collapsed' : 'expanded'),
                                    n.querySelector(`input[value="${t}"]`).click());
                            } catch (e) {}
                    });
                }),
                document.getElementById('layout-menu'))
            ) {
                var t = document.getElementById('layout-menu');
                var n = function () {
                    Helpers.isSmallScreen() || document.querySelector('.layout-menu-toggle').classList.add('d-block');
                };
                let e = null;
                ((t.onmouseenter = function () {
                    e = Helpers.isSmallScreen() ? setTimeout(n, 0) : setTimeout(n, 300);
                }),
                    (t.onmouseleave = function () {
                        (document.querySelector('.layout-menu-toggle').classList.remove('d-block'), clearTimeout(e));
                    }));
            }
            (window.Helpers.swipeIn('.drag-target', function (e) {
                window.Helpers.setCollapsed(!1);
            }),
                window.Helpers.swipeOut('#layout-menu', function (e) {
                    window.Helpers.isSmallScreen() && window.Helpers.setCollapsed(!0);
                }));
            let a = document.getElementsByClassName('menu-inner'),
                o = document.getElementsByClassName('menu-inner-shadow')[0];
            function s() {
                var e = window.innerWidth - document.documentElement.clientWidth;
                document.body.style.setProperty('--ky-scrollbar-width', e + 'px');
            }
            (0 < a.length &&
                o &&
                a[0].addEventListener('ps-scroll-y', function () {
                    this.querySelector('.ps__thumb-y').offsetTop ? (o.style.display = 'block') : (o.style.display = 'none');
                }),
                (t =
                    localStorage.getItem('templateCustomizer-' + templateName + '--Theme') ||
                    (window.templateCustomizer?.settings?.defaultStyle ?? document.documentElement.getAttribute('data-bs-theme'))),
                window.Helpers.switchImage(t),
                window.Helpers.setTheme(window.Helpers.getPreferredTheme()),
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                    var e = window.Helpers.getStoredTheme();
                    'light' !== e && 'dark' !== e && window.Helpers.setTheme(window.Helpers.getPreferredTheme());
                }),
                s(),
                window.addEventListener('DOMContentLoaded', () => {
                    (window.Helpers.showActiveTheme(window.Helpers.getPreferredTheme()),
                        s(),
                        window.Helpers.initSidebarToggle(),
                        document.querySelectorAll('[data-bs-theme-value]').forEach((a) => {
                            a.addEventListener('click', () => {
                                var e = a.getAttribute('data-bs-theme-value');
                                (window.Helpers.setStoredTheme(templateName, e),
                                    window.Helpers.setTheme(e),
                                    window.Helpers.showActiveTheme(e, !0),
                                    window.Helpers.syncCustomOptions(e));
                                let t = e;
                                'system' === e && (t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                                var n = document.querySelector('.template-customizer-semiDark');
                                (n && ('dark' === e ? n.classList.add('d-none') : n.classList.remove('d-none')),
                                    window.Helpers.switchImage(t));
                            });
                        }));
                }),
                'undefined' != typeof i18next &&
                    'undefined' != typeof i18NextHttpBackend &&
                    i18next
                        .use(i18NextHttpBackend)
                        .init({
                            lng: window.templateCustomizer ? window.templateCustomizer.settings.lang : 'en',
                            debug: !1,
                            fallbackLng: 'en',
                            backend: { loadPath: assetsPath + 'json/locales/{{lng}}.json' },
                            returnObjects: !0,
                        })
                        .then(function (e) {
                            r();
                        }));
            var i = document.getElementsByClassName('dropdown-language');
            if (i.length) {
                var l = i[0].querySelectorAll('.dropdown-item');
                for (let e = 0; e < l.length; e++)
                    l[e].addEventListener('click', function () {
                        let a = this.getAttribute('data-language'),
                            o = this.getAttribute('data-text-direction');
                        for (var e of this.parentNode.children)
                            for (var t = e.parentElement.parentNode.firstChild; t; )
                                (1 === t.nodeType && t !== t.parentElement && t.querySelector('.dropdown-item').classList.remove('active'),
                                    (t = t.nextSibling));
                        (this.classList.add('active'),
                            i18next.changeLanguage(a, (e, t) => {
                                var n;
                                if (
                                    (window.templateCustomizer && window.templateCustomizer.setLang(a),
                                    (n = o),
                                    document.documentElement.setAttribute('dir', n),
                                    'rtl' === n
                                        ? 'true' !== localStorage.getItem('templateCustomizer-' + templateName + '--Rtl') &&
                                          window.templateCustomizer &&
                                          window.templateCustomizer.setRtl(!0)
                                        : 'true' === localStorage.getItem('templateCustomizer-' + templateName + '--Rtl') &&
                                          window.templateCustomizer &&
                                          window.templateCustomizer.setRtl(!1),
                                    e)
                                )
                                    return console.log('something went wrong loading', e);
                                (r(), window.Helpers.syncCustomOptionsRtl(o));
                            }));
                    });
            }
            function r() {
                var e = document.querySelectorAll('[data-i18n]'),
                    t = document.querySelector('.dropdown-item[data-language="' + i18next.language + '"]');
                (t && t.click(),
                    e.forEach(function (e) {
                        e.innerHTML = i18next.t(e.dataset.i18n);
                    }));
            }
            function d(e) {
                'show.bs.collapse' == e.type || 'show.bs.collapse' == e.type
                    ? e.target.closest('.accordion-item').classList.add('active')
                    : e.target.closest('.accordion-item').classList.remove('active');
            }
            i = document.querySelector('.dropdown-notifications-all');
            let c = document.querySelectorAll('.dropdown-notifications-read'),
                m =
                    (i &&
                        i.addEventListener('click', (e) => {
                            c.forEach((e) => {
                                e.closest('.dropdown-notifications-item').classList.add('marked-as-read');
                            });
                        }),
                    c &&
                        c.forEach((t) => {
                            t.addEventListener('click', (e) => {
                                t.closest('.dropdown-notifications-item').classList.toggle('marked-as-read');
                            });
                        }),
                    document.querySelectorAll('.dropdown-notifications-archive').forEach((t) => {
                        t.addEventListener('click', (e) => {
                            t.closest('.dropdown-notifications-item').remove();
                        });
                    }),
                    [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(function (e) {
                        return new bootstrap.Tooltip(e);
                    }),
                    [].slice.call(document.querySelectorAll('.accordion')).map(function (e) {
                        (e.addEventListener('show.bs.collapse', d), e.addEventListener('hide.bs.collapse', d));
                    }),
                    window.Helpers.setAutoUpdate(!0),
                    window.Helpers.initPasswordToggle(),
                    window.Helpers.initSpeechToText(),
                    window.Helpers.initNavbarDropdownScrollbar(),
                    document.querySelector("[data-template^='horizontal-menu']"));
            if (
                (m &&
                    (window.innerWidth < window.Helpers.LAYOUT_BREAKPOINT
                        ? window.Helpers.setNavbarFixed('fixed')
                        : window.Helpers.setNavbarFixed('')),
                window.addEventListener(
                    'resize',
                    function (e) {
                        m &&
                            (window.innerWidth < window.Helpers.LAYOUT_BREAKPOINT
                                ? window.Helpers.setNavbarFixed('fixed')
                                : window.Helpers.setNavbarFixed(''),
                            setTimeout(function () {
                                window.innerWidth < window.Helpers.LAYOUT_BREAKPOINT
                                    ? document.getElementById('layout-menu') &&
                                      document.getElementById('layout-menu').classList.contains('menu-horizontal') &&
                                      menu.switchMenu('vertical')
                                    : document.getElementById('layout-menu') &&
                                      document.getElementById('layout-menu').classList.contains('menu-vertical') &&
                                      menu.switchMenu('horizontal');
                            }, 100));
                    },
                    !0
                ),
                !isHorizontalLayout &&
                    !window.Helpers.isSmallScreen() &&
                    (void 0 !== window.templateCustomizer &&
                        (window.templateCustomizer.settings.defaultMenuCollapsed
                            ? window.Helpers.setCollapsed(!0, !1)
                            : window.Helpers.setCollapsed(!1, !1),
                        window.templateCustomizer.settings.semiDark) &&
                        document.querySelector('#layout-menu').setAttribute('data-bs-theme', 'dark'),
                    'undefined' != typeof config) &&
                    config.enableMenuLocalStorage)
            )
                try {
                    null !== localStorage.getItem('templateCustomizer-' + templateName + '--LayoutCollapsed') &&
                        window.Helpers.setCollapsed(
                            'true' === localStorage.getItem('templateCustomizer-' + templateName + '--LayoutCollapsed'),
                            !1
                        );
                } catch (e) {}
        })(),
        {
            container: '#autocomplete',
            placeholder: 'Search [CTRL + K]',
            classNames: {
                detachedContainer: 'd-flex flex-column',
                detachedFormContainer: 'd-flex align-items-center justify-content-between border-bottom',
                form: 'd-flex align-items-center',
                input: 'search-control border-none',
                detachedCancelButton: 'btn-search-close',
                panel: 'flex-grow content-wrapper overflow-hidden position-relative',
                panelLayout: 'h-100',
                clearButton: 'd-none',
                item: 'd-block',
            },
        }),
    data = {},
    currentFocusIndex = -1;
function isMacOS() {
    return /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
}
function loadSearchData() {
    var e = $('#layout-menu').hasClass('menu-horizontal') ? 'search-horizontal.json' : 'search-vertical.json';
    fetch(assetsPath + 'json/' + e)
        .then((e) => {
            if (e.ok) return e.json();
            throw new Error('Failed to fetch data');
        })
        .then((e) => {
            ((data = e), initializeAutocomplete());
        })
        .catch((e) => console.error('Error loading JSON:', e));
}
function initializeAutocomplete() {
    if (document.getElementById('autocomplete'))
        return autocomplete({
            ...SearchConfig,
            openOnFocus: !0,
            onStateChange({ state: e, setQuery: t }) {
                var n;
                e.isOpen
                    ? ((document.body.style.overflow = 'hidden'),
                      (document.body.style.paddingRight = 'var(--ky-scrollbar-width)'),
                      (n = document.querySelector('.aa-DetachedCancelButton')) &&
                          (n.innerHTML =
                              '<span class="text-body-secondary">[esc]</span> <span class="icon-base icon-md bx bx-x text-heading"></span>'),
                      window.autoCompletePS ||
                          ((n = document.querySelector('.aa-Panel')) && (window.autoCompletePS = new PerfectScrollbar(n))))
                    : ('idle' === e.status && e.query && t(''),
                      (document.body.style.overflow = 'auto'),
                      (document.body.style.paddingRight = ''));
            },
            render(e, t) {
                let { render: n, html: a, children: o, state: s } = e;
                s.query
                    ? e.sections.length
                        ? (n(o, t), window.autoCompletePS?.update())
                        : n(
                              a`
            <div class="search-no-results-wrapper">
              <div class="d-flex justify-content-center align-items-center h-100">
                <div class="text-center text-heading">
                  <i class="icon-base bx bx-file text-body-secondary icon-48px mb-4"></i>
                  <h5>No results found</h5>
                </div>
              </div>
            </div>
          `,
                              t
                          )
                    : ((e = a`
          <div class="p-5 p-lg-12">
            <div class="row g-4">
              ${Object.entries(data.suggestions || {}).map(
                  ([e, t]) => a`
                  <div class="col-md-6 suggestion-section">
                    <p class="search-headings mb-2">${e}</p>
                    <div class="suggestion-items">
                      ${t.map(
                          (e) => a`
                          <a href="${e.url}" class="suggestion-item d-flex align-items-center">
                            <i class="icon-base bx ${e.icon} me-2"></i>
                            <span>${e.name}</span>
                          </a>
                        `
                      )}
                    </div>
                  </div>
                `
              )}
            </div>
          </div>
        `),
                      n(e, t));
            },
            getSources() {
                var e,
                    t = [];
                return (
                    data.navigation &&
                        ((e = Object.keys(data.navigation)
                            .filter((e) => 'files' !== e && 'members' !== e)
                            .map((n) => ({
                                sourceId: 'nav-' + n,
                                getItems({ query: t }) {
                                    var e = data.navigation[n];
                                    return t ? e.filter((e) => e.name.toLowerCase().includes(t.toLowerCase())) : e;
                                },
                                getItemUrl({ item: e }) {
                                    return e.url;
                                },
                                templates: {
                                    header({ items: e, html: t }) {
                                        return 0 === e.length ? null : t`<span class="search-headings">${n}</span>`;
                                    },
                                    item({ item: e, html: t }) {
                                        return t`
                  <a href="${e.url}" class="d-flex justify-content-between align-items-center">
                    <span class="item-wrapper"><i class="icon-base bx ${e.icon}"></i>${e.name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M16 13h-6v-3l-5 4l5 4v-3h7a1 1 0 0 0 1-1V5h-2z" />
                    </svg>
                  </a>
                `;
                                    },
                                },
                            }))),
                        t.push(...e),
                        data.navigation.files &&
                            t.push({
                                sourceId: 'files',
                                getItems({ query: t }) {
                                    var e = data.navigation.files;
                                    return t ? e.filter((e) => e.name.toLowerCase().includes(t.toLowerCase())) : e;
                                },
                                getItemUrl({ item: e }) {
                                    return e.url;
                                },
                                templates: {
                                    header({ items: e, html: t }) {
                                        return 0 === e.length ? null : t`<span class="search-headings">Files</span>`;
                                    },
                                    item({ item: e, html: t }) {
                                        return t`
                  <a href="${e.url}" class="d-flex align-items-center position-relative px-4 py-2">
                    <div class="file-preview me-2">
                      <img src="${assetsPath}${e.src}" alt="${e.name}" class="rounded" width="42" />
                    </div>
                    <div class="flex-grow-1">
                      <h6 class="mb-0">${e.name}</h6>
                      <small class="text-body-secondary">${e.subtitle}</small>
                    </div>
                    ${
                        e.meta
                            ? t`
                          <div class="position-absolute end-0 me-4">
                            <span class="text-body-secondary small">${e.meta}</span>
                          </div>
                        `
                            : ''
                    }
                  </a>
                `;
                                    },
                                },
                            }),
                        data.navigation.members) &&
                        t.push({
                            sourceId: 'members',
                            getItems({ query: t }) {
                                var e = data.navigation.members;
                                return t ? e.filter((e) => e.name.toLowerCase().includes(t.toLowerCase())) : e;
                            },
                            getItemUrl({ item: e }) {
                                return e.url;
                            },
                            templates: {
                                header({ items: e, html: t }) {
                                    return 0 === e.length ? null : t`<span class="search-headings">Members</span>`;
                                },
                                item({ item: e, html: t }) {
                                    return t`
                  <a href="${e.url}" class="d-flex align-items-center py-2 px-4">
                    <div class="avatar me-2">
                      <img src="${assetsPath}${e.src}" alt="${e.name}" class="rounded-circle" width="32" />
                    </div>
                    <div class="flex-grow-1">
                      <h6 class="mb-0">${e.name}</h6>
                      <small class="text-body-secondary">${e.subtitle}</small>
                    </div>
                  </a>
                `;
                                },
                            },
                        }),
                    t
                );
            },
        });
}
(document.addEventListener('keydown', (e) => {
    (e.ctrlKey || e.metaKey) && 'k' === e.key && (e.preventDefault(), document.querySelector('.aa-DetachedSearchButton').click());
}),
    document.documentElement.querySelector('#autocomplete') && loadSearchData());
