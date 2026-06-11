<?php
/**
 * Miyabara_Buffer
 *
 * @vendor    Miyabara
 * @package   Buffer
 *
 * @copyright © 2026 Diego M. Miyabara. All rights reserved.
 * @author    Diego M. Miyabara <diego.miyabara@hotmail.com>
 */

declare(strict_types=1);

namespace Miyabara\Buffer\Controller\Adminhtml\Channel;

use Miyabara\Buffer\Api\BufferClientInterface;
use Miyabara\Buffer\Model\Config;
use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\App\Config\Storage\WriterInterface;
use Magento\Framework\Controller\Result\Json;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Serialize\Serializer\Json as JsonSerializer;

class Sync extends Action
{
    /**
     * @param string
     */
    public const ADMIN_RESOURCE = 'Miyabara_Buffer::post_index';

    /**
     * @param Context $context
     * @param BufferClientInterface $bufferClient
     * @param Config $config
     * @param JsonFactory $jsonFactory
     * @param JsonSerializer $jsonSerializer
     * @param WriterInterface $configWriter
     */
    public function __construct(
        Context $context,
        private readonly BufferClientInterface $bufferClient,
        private readonly Config $config,
        private readonly JsonFactory $jsonFactory,
        private readonly JsonSerializer $jsonSerializer,
        private readonly WriterInterface $configWriter
    ) {
        parent::__construct($context);
    }

    /**
     * Synchronize Buffer channels by fetching them from the Buffer API and saving to Magento configuration.
     * 
     * @return Json
     */
    public function execute(): Json
    {
        $result = $this->jsonFactory->create();

        try {
            if (!$this->config->isConfigured()) {
                throw new LocalizedException(
                    __('Buffer API key is not configured. Go to Stores → Configuration → DM3D → Buffer API.')
                );
            }

            $orgId    = $this->bufferClient->getOrganizationId();
            $channels = $this->bufferClient->getChannels($orgId);

            $this->configWriter->save(
                'miyabara_buffer/channels/data',
                $this->jsonSerializer->serialize($channels)
            );

            $result->setData(['success' => true, 'channels' => $channels]);
        } catch (LocalizedException $e) {
            $result->setData(['success' => false, 'error' => $e->getMessage()]);
        } catch (\Exception $e) {
            $result->setData(['success' => false, 'error' => __('Unexpected error: %1', $e->getMessage())]);
        }

        return $result;
    }
}
