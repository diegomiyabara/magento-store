/**
 * Miyabara_MagentoAI — mixin for Magento_PageBuilder/js/form/element/html-code
 *
 * Injects MagentoAI generate buttons into the Page Builder HTML editor toolbar.
 */
define([
    'jquery',
    'underscore',
    'mage/translate'
], function ($, _, $t) {
    'use strict';

    var BUTTONS_CONTAINER = '#buttonspagebuilder_html_form_html';
    var MAX_ATTEMPTS      = 10;
    var RETRY_INTERVAL    = 100;

    var htmlCodeMixin = {
        defaults: {
            editProductPageSelector: 'catalog-product-edit',
            newProductPageSelector:  'catalog-product-new'
        },

        initialize: function () {
            this._super();
            if (this.isBtnVisible()) {
                this._attemptButtonInjection(0);
            }
            return this;
        },

        /**
         * Poll until the Page Builder buttons container is in the DOM, then inject.
         * Retries up to MAX_ATTEMPTS times to handle async KO template rendering.
         *
         * @param {number} attempt
         */
        _attemptButtonInjection: function (attempt) {
            var self       = this;
            var $container = $(BUTTONS_CONTAINER);

            if ($container.length) {
                this._injectButtons($container);
            } else if (attempt < MAX_ATTEMPTS) {
                _.delay(function () {
                    self._attemptButtonInjection(attempt + 1);
                }, RETRY_INTERVAL);
            }
        },

        /**
         * Append MagentoAI buttons to the Page Builder buttons container. Guards against duplicate injection.
         *
         * @param {jQuery} $container
         */
        _injectButtons: function ($container) {
            if ($container.find('.generate-mageai-btn').length) { return; }

            $container.append(
                '<button type="button" class="scalable generate-mageai-btn">' +
                    '<span><span><span>' + $t('Generate with MagentoAI') + '</span></span></span>' +
                '</button>' +
                '<button type="button" class="scalable advanced-generate-mageai-btn">' +
                    '<span><span><span>' + $t('Advanced Generate with MagentoAI') + '</span></span></span>' +
                '</button>'
            );
        },

        /**
         * Returns true only on product edit/new pages when the module is enabled.
         *
         * @returns {boolean}
         */
        isBtnVisible: function () {
            var isEnabled  = window.isMpMageAIEnabled;
            var isEditPage = $('body').hasClass(this.editProductPageSelector);
            var isNewPage  = $('body').hasClass(this.newProductPageSelector);
            return !!(isEnabled && (isEditPage || isNewPage));
        }
    };

    return function (target) {
        return target.extend(htmlCodeMixin);
    };
});
