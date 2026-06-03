<?php

declare(strict_types=1);

namespace Dm3d\Buffer\Controller\Adminhtml\Channel;

use Dm3d\Buffer\Api\BufferClientInterface;
use Dm3d\Buffer\Model\Config;
use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\App\Action\HttpGetActionInterface;
use Magento\Framework\App\Config\Storage\WriterInterface;
use Magento\Framework\Controller\Result\Json;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Framework\Exception\LocalizedException;
use Magento\Framework\Serialize\Serializer\Json as JsonSerializer;

class Sync extends Action implements HttpGetActionInterface
{
    public const ADMIN_RESOURCE = 'Dm3d_Buffer::channel_sync';

    private const XML_PATH_CHANNELS_DATA = 'dm3d_buffer/channels/data';

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

    public function execute(): Json
    {
        /** @var Json $result */
        $result = $this->jsonFactory->create();

        if (!$this->config->isConfigured()) {
            return $result->setData(['success' => false, 'error' => 'Buffer API is not configured.']);
        }

        try {
            $organizationId = $this->bufferClient->getOrganizationId();
            $channels       = $this->bufferClient->getChannels($organizationId);

            $this->configWriter->save(
                self::XML_PATH_CHANNELS_DATA,
                $this->jsonSerializer->serialize($channels)
            );

            return $result->setData(['success' => true, 'channels' => $channels]);
        } catch (LocalizedException $e) {
            return $result->setData(['success' => false, 'error' => $e->getMessage()]);
        }
    }
}
