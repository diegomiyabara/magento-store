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

use Miyabara\Buffer\Controller\Adminhtml\AbstractAction;
use Magento\Framework\Controller\ResultInterface;

class Index extends AbstractAction
{
    /**
     * Render the Buffer — Create Social Post admin page.
     *
     * @return ResultInterface
     */
    public function execute(): ResultInterface
    {
        $resultPage = $this->resultPageFactory->create();
        $resultPage->setActiveMenu('Miyabara_Buffer::post_index');
        $resultPage->getConfig()->getTitle()->prepend(__('Buffer — Create Social Post'));

        return $resultPage;
    }
}
