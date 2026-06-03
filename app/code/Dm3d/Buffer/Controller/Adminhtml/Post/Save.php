<?php

declare(strict_types=1);

namespace Dm3d\Buffer\Controller\Adminhtml\Post;

use Dm3d\Buffer\Api\BufferClientInterface;
use Dm3d\Buffer\Model\Config;
use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Backend\Model\View\Result\Redirect;
use Magento\Backend\Model\View\Result\RedirectFactory;
use Magento\Framework\App\Action\HttpPostActionInterface;
use Magento\Framework\Exception\LocalizedException;

class Save extends Action implements HttpPostActionInterface
{
    public const ADMIN_RESOURCE = 'Dm3d_Buffer::post_save';

    public function __construct(
        Context $context,
        private readonly BufferClientInterface $bufferClient,
        private readonly Config $config,
        private readonly RedirectFactory $redirectFactory
    ) {
        parent::__construct($context);
    }

    public function execute(): Redirect
    {
        /** @var Redirect $resultRedirect */
        $resultRedirect = $this->redirectFactory->create();

        if (!$this->getRequest()->isPost()) {
            return $resultRedirect->setPath('*/*/');
        }

        $text         = (string) $this->getRequest()->getParam('post_text');
        $imageUrl     = $this->getRequest()->getParam('image_url') ?: null;
        $channelIds   = $this->getRequest()->getParam('channel_ids', []);
        $mode         = (string) ($this->getRequest()->getParam('scheduling_mode') ?: 'addToQueue');
        $dueAt        = $this->getRequest()->getParam('due_at') ?: null;

        if (trim($text) === '') {
            $this->messageManager->addErrorMessage(__('Post text is required.'));
            return $resultRedirect->setPath('*/*/');
        }

        if (empty($channelIds)) {
            $this->messageManager->addErrorMessage(__('Please select at least one channel.'));
            return $resultRedirect->setPath('*/*/');
        }

        if (!$this->config->isConfigured()) {
            $this->messageManager->addErrorMessage(__('Buffer API is not configured.'));
            return $resultRedirect->setPath('*/*/');
        }

        try {
            foreach ((array) $channelIds as $channelId) {
                $this->bufferClient->createPost(
                    (string) $channelId,
                    $text,
                    $imageUrl !== null ? (string) $imageUrl : null,
                    $mode,
                    $dueAt !== null ? (string) $dueAt : null
                );
            }
            $this->messageManager->addSuccessMessage(__('Post scheduled successfully.'));
        } catch (LocalizedException $e) {
            $this->messageManager->addErrorMessage($e->getMessage());
        }

        return $resultRedirect->setPath('*/*/');
    }
}
