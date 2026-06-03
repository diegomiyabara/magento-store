<?php

declare(strict_types=1);

namespace Miyabara\Buffer\Controller\Adminhtml;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Framework\View\Result\PageFactory;

abstract class AbstractAction extends Action
{
    public const ADMIN_RESOURCE = 'Miyabara_Buffer::post_index';

    public function __construct(
        Context $context,
        protected readonly PageFactory $resultPageFactory
    ) {
        parent::__construct($context);
    }
}
