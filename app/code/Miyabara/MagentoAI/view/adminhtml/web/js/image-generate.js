/**
 * Miyabara_MagentoAI — image generation widget
 */
define([
    'jquery',
    'Miyabara_MagentoAI/js/model/mage-ai',
    'Magento_Ui/js/modal/alert',
    'Magento_Ui/js/modal/modal'
], function ($, mageAIModel, alert, modal) {
    'use strict';

    $.widget('mage.mageAiImageGenerate', {
        options: {
            modalSelector:         '#mp-image-generate-modal',
            gallerySelector:       '[data-mage-init*="productGallery"]',
            buttonId:              'mp-generate-image-btn',
            generateImageUrl:      window.mageAIGenerateImageUrl || ''
        },

        _create: function () {
            this._injectButton();
            $('body').on('contentUpdated', this._injectButton.bind(this));
        },

        /**
         * Inject the "Generate Image with MagentoAI" button after #add_video_button. Idempotent.
         */
        _injectButton: function () {
            if ($('#' + this.options.buttonId).length) { return; }

            var $anchor = $('#add_video_button');
            if (!$anchor.length) { return; }

            var $btn = $('<button>', {
                id:      this.options.buttonId,
                type:    'button',
                'class': 'action-secondary mp-generate-image-btn',
                title:   $.mage.__('Generate Image with MagentoAI')
            }).html('<span>' + $.mage.__('Generate Image with MagentoAI') + '</span>');

            $anchor.after($btn);
            this._bindButton();
        },

        _bindButton: function () {
            var self = this;
            $(document).off('click.mageAiImage', '#' + this.options.buttonId)
                .on('click.mageAiImage', '#' + this.options.buttonId, function () {
                    self._openModal();
                });
        },

        _openModal: function () {
            var self   = this;
            var $modal = $(this.options.modalSelector);

            if (!$modal.data('mpImageModalInited')) {
                modal({
                    type:        'popup',
                    responsive:  true,
                    title:       $.mage.__('Generate Image with MagentoAI'),
                    modalClass:  'mp-mageai-image-modal',
                    buttons: [{
                        text:  $.mage.__('Generate with MagentoAI'),
                        class: 'action-primary mp-generate-image-submit',
                        click: function () { self._generate(); }
                    }]
                }, $modal);
                $modal.data('mpImageModalInited', true);
            }

            $modal.modal('openModal');
        },

        _generate: function () {
            var self         = this;
            var prompt       = $('#mp-image-prompt').val().trim();
            var productName  = $('[name="product[name]"]').val() || '';
            var attributeData = mageAIModel.collectAttributeData(window.mpMageAIImageAttributes);

            $.ajax({
                url:        this.options.generateImageUrl,
                type:       'POST',
                showLoader: true,
                data: {
                    'form_key':       FORM_KEY,
                    'custom_prompt':  prompt,
                    'product_name':   productName,
                    'attribute_data': attributeData
                },
                success: function (response) {
                    if (response && response.error) {
                        alert({ title: $.mage.__('Image Generation Error'), content: response.data });
                        return;
                    }
                    if (response && response.file) {
                        self._addImageToGallery(response);
                        $(self.options.modalSelector).modal('closeModal');
                        $('#mp-image-prompt').val('');
                    } else {
                        alert({ title: $.mage.__('Error'), content: $.mage.__('Unexpected response from server. Please try again.') });
                    }
                },
                error: function () {
                    alert({ title: $.mage.__('Error'), content: $.mage.__('Failed to communicate with the server. Please try again.') });
                }
            });
        },

        /**
         * Add the generated image to the product gallery via the addItem event.
         *
         * @param {Object} imageData
         */
        _addImageToGallery: function (imageData) {
            var $gallery = $(this.options.gallerySelector).first();
            if (!$gallery.length) { $gallery = $('#media_gallery_content'); }
            if ($gallery.length) { $gallery.trigger('addItem', imageData); }
        }
    });

    return $.mage.mageAiImageGenerate;
});
