var config = {
    map: {
        '*': {
            'mageAiGenerate':      'Miyabara_MagentoAI/js/generate',
            'mageAiImageGenerate': 'Miyabara_MagentoAI/js/image-generate',
            'mageAiImageModify':   'Miyabara_MagentoAI/js/image-modify'
        }
    },
    config: {
        mixins: {
            'Magento_PageBuilder/js/form/element/html-code': {
                'Miyabara_MagentoAI/js/html-code-mixin': true
            }
        }
    }
};
