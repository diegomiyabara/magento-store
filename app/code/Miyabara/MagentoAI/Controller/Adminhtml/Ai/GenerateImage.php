<?php
/**
 * Miyabara_MagentoAI
 *
 * @vendor    Miyabara
 * @package   MagentoAI
 *
 * @copyright © 2026 Diego M. Miyabara. All rights reserved.
 * @author    Diego M. Miyabara <diego.miyabara@hotmail.com>
 */

declare(strict_types=1);

namespace Miyabara\MagentoAI\Controller\Adminhtml\Ai;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\App\Action\HttpPostActionInterface;
use Magento\Framework\Controller\Result\Json;
use Magento\Framework\Controller\Result\JsonFactory;
use Miyabara\MagentoAI\Api\ConfigInterface;
use Miyabara\MagentoAI\Api\ImageGenerationServiceInterface;
use Miyabara\MagentoAI\Model\AttributeData\Formatter as AttributeFormatter;
use Miyabara\MagentoAI\Model\Service\Exception\AiServiceException;

class GenerateImage extends Action implements HttpPostActionInterface
{
    /**
     * @param string
     */
    public const ADMIN_RESOURCE = 'Miyabara_MagentoAI::generate';

    /**
     * @param Context                          $context
     * @param JsonFactory                      $jsonFactory
     * @param ConfigInterface                  $config
     * @param ImageGenerationServiceInterface  $imageService
     * @param AttributeFormatter               $attributeFormatter
     */
    public function __construct(
        Context $context,
        private readonly JsonFactory $jsonFactory,
        private readonly ConfigInterface $config,
        private readonly ImageGenerationServiceInterface $imageService,
        private readonly AttributeFormatter $attributeFormatter
    ) {
        parent::__construct($context);
    }

    /**
     * Generate a product image via the configured AI provider and return gallery-compatible file data.
     *
     * @return Json
     */
    public function execute(): Json
    {
        $response = ['error' => true, 'data' => __('An unknown error occurred.')];

        if ($this->config->isEnabled()) {
            try {
                $prompt      = trim((string) $this->getRequest()->getParam('custom_prompt'));
                $productName = trim((string) $this->getRequest()->getParam('product_name'));
                $attrData    = (array) $this->getRequest()->getParam('attribute_data', []);

                if ($prompt === '') {
                    $prompt = $this->config->getImagePrompt();
                }

                $prompt = str_replace('{{ product.name }}', $productName, $prompt);
                $prompt = str_replace(
                    '{{ product.attributes }}',
                    $this->attributeFormatter->buildLabelValueText($attrData),
                    $prompt
                );

                $response = $this->imageService->generate($prompt);
            } catch (AiServiceException $e) {
                $response = ['error' => true, 'data' => $e->getMessage()];
            } catch (\Exception $e) {
                $response = ['error' => true, 'data' => $e->getMessage()];
            }
        }

        return $this->jsonFactory->create()->setData($response);
    }
}
