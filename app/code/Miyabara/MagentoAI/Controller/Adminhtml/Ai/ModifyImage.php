<?php
/**
 * Miyabara_MagentoAI
 *
 * @vendor    Miyabara
 * @package   MagentoAI
 *
 * @copyright © 2026 Diego M. Miyabara. All rights reserved.
 * @author    Diego M. Miyabara <diego.miyabara@gmail.com>
 */

declare(strict_types=1);

namespace Miyabara\MagentoAI\Controller\Adminhtml\Ai;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\App\Action\HttpPostActionInterface;
use Magento\Framework\Controller\Result\Json;
use Magento\Framework\Controller\Result\JsonFactory;
use Miyabara\MagentoAI\Api\ConfigInterface;
use Miyabara\MagentoAI\Api\ImageModificationServiceInterface;
use Miyabara\MagentoAI\Model\AttributeData\Formatter as AttributeFormatter;
use Miyabara\MagentoAI\Model\Service\Exception\AiServiceException;
use Psr\Log\LoggerInterface;

class ModifyImage extends Action implements HttpPostActionInterface
{
    /**
     * @param string
     */
    public const ADMIN_RESOURCE = 'Miyabara_MagentoAI::generate';

    /**
     * @param Context                            $context
     * @param JsonFactory                        $jsonFactory
     * @param ConfigInterface                    $config
     * @param ImageModificationServiceInterface  $modifyService
     * @param AttributeFormatter                 $attributeFormatter
     * @param LoggerInterface                    $logger
     */
    public function __construct(
        Context $context,
        private readonly JsonFactory $jsonFactory,
        private readonly ConfigInterface $config,
        private readonly ImageModificationServiceInterface $modifyService,
        private readonly AttributeFormatter $attributeFormatter,
        private readonly LoggerInterface $logger,
    ) {
        parent::__construct($context);
    }

    /**
     * Modify an existing product image via the configured AI provider and return gallery-compatible file data.
     *
     * The modify_prompt config template supports {{ product.name }}, {{ product.attributes }},
     * and {{ instructions }} (the user's typed instructions from the modal prompt field).
     *
     * @return Json
     */
    public function execute(): Json
    {
        $response = ['error' => true, 'data' => __('An unknown error occurred.')];

        if ($this->config->isEnabled()) {
            try {
                $userInstructions = trim((string) $this->getRequest()->getParam('custom_prompt'));
                $imageFile        = trim((string) $this->getRequest()->getParam('image_file'));
                $productName      = trim((string) $this->getRequest()->getParam('product_name'));
                $attrData         = (array) $this->getRequest()->getParam('attribute_data', []);

                $prompt = $this->config->getModifyImagePrompt();
                $prompt = str_replace('{{ product.name }}', $productName, $prompt);
                $prompt = str_replace('{{ instructions }}', $userInstructions, $prompt);
                $prompt = str_replace(
                    '{{ product.attributes }}',
                    $this->attributeFormatter->buildLabelValueText($attrData),
                    $prompt
                );

                $response = $this->modifyService->modify($prompt, $imageFile);
            } catch (AiServiceException $e) {
                $this->logger->error('MagentoAI modify image failed', ['exception' => $e]);
                $response = ['error' => true, 'data' => $e->getMessage()];
            } catch (\Exception $e) {
                $this->logger->error('MagentoAI modify image unexpected error', ['exception' => $e]);
                $response = ['error' => true, 'data' => $e->getMessage()];
            }
        }

        return $this->jsonFactory->create()->setData($response);
    }
}
