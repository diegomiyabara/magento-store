/**
 * Miyabara_MagentoAI — text generation widget
 */
define([
    'jquery',
    'Miyabara_MagentoAI/js/model/mage-ai'
], function ($, mageAIModel) {
    'use strict';

    $.widget('mage.mageAigenerateWidget', {

        /**
         * Initialise event listeners for generating product descriptions.
         */
        _create: function () {
            // Standard generate button (auto-mode: full or short based on button ID)
            $(document).on('click', mageAIModel.options.generateBtnSelector, function () {
                var currentTarget = this;
                var editorId      = $(this).data('editor-id') || '';
                var type          = editorId.indexOf(mageAIModel.options.shortDescriptionFieldId) !== -1
                    ? 'short'
                    : 'full';

                var attributeData = mageAIModel.collectAttributeData();
                mageAIModel.generateContent(attributeData, type, false)
                    .done(function (content) {
                        if (content) {
                            mageAIModel.updateDescription(content, currentTarget);
                        }
                    })
                    .fail(function (error) {
                        console.error('MagentoAI generation error:', error);
                    });
            });

            // Advanced (custom prompt) generate button
            $(document).on('click', mageAIModel.options.advancedGenerateBtnSelector, function () {
                mageAIModel.clickAdvancedGenerateButton(this);
            });
        }
    });

    return $.mage.mageAigenerateWidget;
});
