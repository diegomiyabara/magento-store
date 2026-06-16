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
use Miyabara\MagentoAI\Api\TextGenerationServiceInterface;
use Miyabara\MagentoAI\Model\Service\Exception\AiServiceException;
use Psr\Log\LoggerInterface;

class Generate extends Action implements HttpPostActionInterface
{
    /**
     * @param string
     */
    public const ADMIN_RESOURCE = 'Miyabara_MagentoAI::generate';

    /**
     * @param Context                        $context
     * @param JsonFactory                    $jsonFactory
     * @param ConfigInterface                $config
     * @param TextGenerationServiceInterface $textService
     * @param LoggerInterface                $logger
     */
    public function __construct(
        Context $context,
        private readonly JsonFactory $jsonFactory,
        private readonly ConfigInterface $config,
        private readonly TextGenerationServiceInterface $textService,
        private readonly LoggerInterface $logger,
    ) {
        parent::__construct($context);
    }

    /**
     * Generate text content (product description or custom prompt) via the configured AI provider.
     *
     * @return Json
     */
    public function execute(): Json
    {
        $response = ['error' => true, 'data' => __('An unknown error occurred.')];

        if ($this->config->isEnabled()) {
            try {
                $customPrompt = $this->getRequest()->getParam('custom_prompt');

                if ($customPrompt === 'false' || $customPrompt === false) {
                    $attributeData = $this->getRequest()->getParam('attribute_data', []);

                    if (!is_array($attributeData) || empty($attributeData)) {
                        $response = [
                            'error' => true,
                            'data'  => __(
                                'No attribute data was received. Please ensure the configured '
                                . 'attributes have values in the product form.'
                            ),
                        ];
                    } else {
                        $type     = (string) $this->getRequest()->getParam('type', 'full');
                        $response = [
                            'error' => false,
                            'data'  => $this->textService->generateFromAttributeData($attributeData, $type),
                        ];
                    }
                } else {
                    $response = [
                        'error' => false,
                        'data'  => $this->textService->generateCustomContent((string) $customPrompt),
                    ];
                }
            } catch (AiServiceException $e) {
                $this->logger->error('MagentoAI text generation failed', ['exception' => $e]);
                $response = ['error' => true, 'data' => $e->getMessage()];
            } catch (\Exception $e) {
                $this->logger->error('MagentoAI text generation unexpected error', ['exception' => $e]);
                $response = ['error' => true, 'data' => $e->getMessage()];
            }
        }

        return $this->jsonFactory->create()->setData($response);
    }
}
