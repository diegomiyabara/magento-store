<?php

declare(strict_types=1);

namespace Dm3d\Buffer\Controller\Adminhtml\Product;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Catalog\Helper\Image as ImageHelper;
use Magento\Catalog\Model\ResourceModel\Product\CollectionFactory;
use Magento\Framework\App\Action\HttpGetActionInterface;
use Magento\Framework\Controller\Result\Json;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Store\Model\App\Emulation;
use Magento\Store\Model\StoreManagerInterface;

class Search extends Action implements HttpGetActionInterface
{
    public const ADMIN_RESOURCE = 'Dm3d_Buffer::product_search';

    public function __construct(
        Context $context,
        private readonly CollectionFactory $collectionFactory,
        private readonly ImageHelper $imageHelper,
        private readonly JsonFactory $jsonFactory,
        private readonly Emulation $emulation,
        private readonly StoreManagerInterface $storeManager
    ) {
        parent::__construct($context);
    }

    public function execute(): Json
    {
        /** @var Json $result */
        $result = $this->jsonFactory->create();

        $query = (string) $this->getRequest()->getParam('q', '');

        if (trim($query) === '') {
            return $result->setData([]);
        }

        $storeId = (int) $this->storeManager->getDefaultStoreView()->getId();
        $this->emulation->startEnvironmentEmulation($storeId);

        $products = [];
        try {
            $collection = $this->collectionFactory->create();
            $collection->addAttributeToSelect(['name', 'thumbnail'])
                ->addAttributeToFilter('name', ['like' => '%' . $query . '%'])
                ->setPageSize(10)
                ->setCurPage(1);

            foreach ($collection as $product) {
                $imageUrl = $this->imageHelper
                    ->init($product, 'product_thumbnail_image')
                    ->setImageFile($product->getThumbnail())
                    ->getUrl();

                $products[] = [
                    'id'       => $product->getId(),
                    'sku'      => $product->getSku(),
                    'name'     => $product->getName(),
                    'imageUrl' => $imageUrl,
                ];
            }
        } finally {
            $this->emulation->stopEnvironmentEmulation();
        }

        return $result->setData($products);
    }
}
