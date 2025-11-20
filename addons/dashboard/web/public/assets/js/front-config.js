/**
 * @namespace: addons/dashboard/web/public/assets/js/front-config.js
 * @type: Module
 * @copyright © 2025 kenndeclouv
 * @assistant chaa & graa
 * @version 0.9.12-beta
 */

((window.assetsPath = document.documentElement.getAttribute('data-assets-path')),
    (window.templateName = document.documentElement.getAttribute('data-template')),
    (window.config = { colors: { black: window.Helpers.getCssVar('pure-black'), white: window.Helpers.getCssVar('white') } }),
    'undefined' != typeof TemplateCustomizer &&
        (window.templateCustomizer = new TemplateCustomizer({ displayCustomizer: !1, controls: ['color', 'theme', 'rtl'] })));
