<?php

declare(strict_types=1);

namespace Miyabara\Buffer\Controller\Adminhtml\Post;

use Miyabara\Buffer\Controller\Adminhtml\AbstractAction;
use Magento\Framework\Controller\ResultInterface;

class Index extends AbstractAction
{
    public function execute(): ResultInterface
    {
        $resultPage = $this->resultPageFactory->create();
        $resultPage->setActiveMenu('Miyabara_Buffer::post_index');
        $resultPage->getConfig()->getTitle()->prepend(__('Buffer — Create Social Post'));

        return $resultPage;
    }
}
