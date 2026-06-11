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

namespace Miyabara\Buffer\Controller\Adminhtml\Post;

use Miyabara\Buffer\Api\BufferClientInterface;
use Miyabara\Buffer\Model\Config;
use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\App\Request\Http;
use Magento\Framework\Controller\Result\Redirect;
use Magento\Framework\Controller\Result\RedirectFactory;
use Magento\Framework\Exception\LocalizedException;

class Save extends Action
{
    /**
     * @param string
     */
    public const ADMIN_RESOURCE = 'Miyabara_Buffer::post_index';

    /**
     * @param Context               $context
     * @param BufferClientInterface $bufferClient
     * @param Config                $config
     * @param RedirectFactory       $redirectFactory
     */
    public function __construct(
        Context $context,
        private readonly BufferClientInterface $bufferClient,
        private readonly Config $config,
        private readonly RedirectFactory $redirectFactory
    ) {
        parent::__construct($context);
    }

    /**
     * Validate the post form, send to Buffer on each selected channel, and redirect with feedback messages.
     *
     * @return Redirect
     */
    public function execute(): Redirect
    {
        $redirect = $this->redirectFactory->create();
        $redirect->setPath('*/post/index');

        if (!$this->getRequest()->isPost()) {
            return $redirect;
        }

        /** @var Http $request */
        $request = $this->getRequest();

        $text       = trim((string) $request->getParam('post_text'));
        $imageUrl   = trim((string) $request->getParam('image_url'));
        $channelIds = (array) $request->getParam('channel_ids', []);
        $mode       = (string) $request->getParam('scheduling_mode', 'addToQueue');
        $dueAt      = trim((string) $request->getParam('due_at'));

        if ($text === '') {
            $this->messageManager->addErrorMessage(__('Post text cannot be empty.'));
            return $redirect;
        }

        if (empty($channelIds)) {
            $this->messageManager->addErrorMessage(__('Please select at least one channel.'));
            return $redirect;
        }

        if (!$this->config->isConfigured()) {
            $this->messageManager->addErrorMessage(
                __('Buffer API key is not configured. Go to Stores → Configuration → DM3D → Buffer API.')
            );
            return $redirect;
        }

        if ($mode === 'customScheduled' && $dueAt !== '') {
            $dueAt = (new \DateTime($dueAt, new \DateTimeZone('UTC')))->format(\DateTime::ATOM);
        } else {
            $dueAt = null;
        }

        $imageUrl = $imageUrl !== '' ? $imageUrl : null;

        $successCount = 0;
        $errors       = [];

        foreach ($channelIds as $channelId) {
            try {
                $this->bufferClient->createPost($channelId, $text, $imageUrl, $mode, $dueAt);
                $successCount++;
            } catch (LocalizedException $e) {
                $errors[] = $e->getMessage();
            }
        }

        if ($successCount > 0) {
            $this->messageManager->addSuccessMessage(
                __('Post queued successfully on %1 channel(s).', $successCount)
            );
        }

        foreach ($errors as $error) {
            $this->messageManager->addErrorMessage($error);
        }

        return $redirect;
    }
}
