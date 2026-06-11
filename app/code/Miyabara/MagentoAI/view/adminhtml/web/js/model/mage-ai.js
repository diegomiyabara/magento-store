/**
 * Miyabara_MagentoAI — core model shared across all widgets
 */
define([
    'jquery',
    'Magento_Ui/js/modal/alert',
    'Magento_Ui/js/modal/modal'
], function ($, alert, modal) {
    'use strict';

    var mageAI = {
        options: {
            generateBtnSelector:          '.generate-mageai-btn',
            advancedGenerateBtnSelector:  '.advanced-generate-mageai-btn',
            advancedGenerateModalSelector: '#advanced-generate-modal',
            promptGenerateTextAreaSelector: '#mp-custom-prompt',
            shortDescriptionFieldId:       'product_form_short_description'
        },

        /**
         * Opens the advanced generate modal for a custom prompt.
         *
         * @param {HTMLElement} targetField
         */
        clickAdvancedGenerateButton: function (targetField) {
            var self = this;
            var modalOptions = {
                type: 'popup',
                responsive: true,
                title: $.mage.__('Custom Content Prompt'),
                modalClass: 'mp-mageai-genereate-modal',
                buttons: [{
                    text: $.mage.__('Generate with MagentoAI'),
                    class: 'action-default secondary',
                    click: function () {
                        self.promptGenerateButtonClick(targetField);
                    }
                }]
            };

            modal(modalOptions, $(this.options.advancedGenerateModalSelector));
            $(this.options.advancedGenerateModalSelector).modal('openModal');
        },

        /**
         * Handle the custom-prompt submit button click.
         *
         * @param {HTMLElement} targetField
         */
        promptGenerateButtonClick: function (targetField) {
            var self = this;
            var customPrompt = $(this.options.promptGenerateTextAreaSelector).val().trim();

            if (mageAI.validateCustomPrompt(customPrompt)) {
                this.generateContent({}, false, customPrompt)
                    .done(function (content) {
                        if (content) {
                            self.updateDescription(content, targetField);
                        }
                    })
                    .fail(function (error) {
                        console.error('Error generating content:', error);
                    });
            }
        },

        /**
         * Collect current product attribute display values from the form DOM.
         *
         * @param {Array} [attributes] Attribute codes to collect; defaults to window.mpMageAIAttributes
         * @returns {Object} map of attributeCode → display value
         */
        collectAttributeData: function (attributes) {
            var data = {};
            attributes = attributes || window.mpMageAIAttributes || [];

            $.each(attributes, function (i, code) {
                var value = mageAI.getAttributeFormValue(code);
                if (value !== null && value !== '') {
                    data[code] = value;
                }
            });

            return data;
        },

        /**
         * Read the display value for a single product attribute from the form.
         * Returns null if the field is not present.
         *
         * @param {string} code
         * @returns {string|null}
         */
        getAttributeFormValue: function (code) {
            if (typeof tinymce !== 'undefined') {
                var editor = tinymce.get('product_form_' + code);
                if (editor) {
                    var text = $('<div>').html(editor.getContent()).text().trim();
                    return text || null;
                }
            }

            var $field = $('[name="product[' + code + ']"]');
            if (!$field.length) {
                $field = $('[name="product[' + code + '][]"]');
            }
            if (!$field.length) {
                return null;
            }

            if ($field.is('select[multiple]')) {
                var labels = [];
                $field.find('option:selected').each(function () {
                    var label = $.trim($(this).text());
                    if (label) { labels.push(label); }
                });
                return labels.length ? labels.join(', ') : null;
            }

            if ($field.is('select')) {
                var selected = $field.find('option:selected').text().trim();
                return selected || null;
            }

            var val = $field.val();
            return (val !== null && String(val).trim() !== '') ? String(val).trim() : null;
        },

        /**
         * Write generated content back to the editor field.
         *
         * Prefers resolving the target via data-editor-id so the lookup is ID-based
         * (stable) rather than relying on a fixed number of parent traversals.
         *
         * @param {string}             content
         * @param {HTMLElement|string} targetField  The clicked button element
         */
        updateDescription: function (content, targetField) {
            var isPageBuilder = $(targetField).parent().attr('id') === 'buttonspagebuilder_html_form_html';

            if (isPageBuilder) {
                $(targetField).parents().next('textarea').val(content).change();
                return;
            }

            var editorId = $(targetField).data('editor-id');
            if (editorId) {
                var $textarea = $('#' + editorId);
                var $iframe   = $('#' + editorId + '_ifr');

                if ($iframe.length) {
                    $iframe.contents().find('body').html(content);
                }
                $textarea.val(content).change();
                return;
            }

            // Fallback: legacy DOM traversal for any field without data-editor-id
            var $iframe2   = $(targetField).parent().parent().find('iframe');
            var $textarea2 = $(targetField).parent().parent().find('textarea');
            $iframe2.contents().find('body').html(content).change();
            $textarea2.val(content).change();
        },

        /**
         * Validate that a custom prompt is not empty.
         *
         * @param {string} prompt
         * @returns {boolean}
         */
        validateCustomPrompt: function (prompt) {
            if (!prompt) {
                alert({
                    title: $.mage.__('Please enter a custom prompt'),
                    content: ''
                });
                return false;
            }
            return true;
        },

        /**
         * POST to the generate controller and return a deferred resolving to the generated string.
         *
         * @param {Object}        attributeData
         * @param {string|false}  type     'short', 'full', or false for custom prompts
         * @param {string|false}  prompt   Custom prompt, or false for attribute-based generation
         * @returns {jQuery.Deferred}
         */
        generateContent: function (attributeData, type, prompt) {
            var self    = this;
            var deferred = $.Deferred();

            $.ajax({
                url:        window.mageAIAjaxUrl,
                type:       'POST',
                showLoader: true,
                data: {
                    'form_key':      FORM_KEY,
                    'attribute_data': attributeData || {},
                    'type':          type,
                    'custom_prompt': prompt
                },
                success: function (response) {
                    if (response.error === false || response.error === 'false') {
                        deferred.resolve(response.data);
                    } else {
                        alert({
                            title:   $.mage.__('API Error'),
                            content: response.data
                        });
                        deferred.resolve(false);
                    }

                    if (prompt) {
                        $(self.options.advancedGenerateModalSelector).modal('closeModal');
                    }
                },
                error: function (xhr, status, errorThrown) {
                    console.error('MagentoAI AJAX error:', errorThrown);
                    deferred.reject(errorThrown);
                }
            });

            return deferred.promise();
        }
    };

    return mageAI;
});
