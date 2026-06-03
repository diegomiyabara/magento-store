<?php

declare(strict_types=1);

namespace Miyabara\Buffer\Controller\Adminhtml\Product;

use Magento\Backend\App\Action;
use Magento\Backend\App\Action\Context;
use Magento\Catalog\Helper\Image as ImageHelper;
use Magento\Catalog\Model\ResourceModel\Product\CollectionFactory;
use Magento\Framework\Controller\Result\Json;
use Magento\Framework\Controller\Result\JsonFactory;
use Magento\Store\Model\App\Emulation;
use Magento\Store\Model\StoreManagerInterface;

class Search extends Action
{
    public const ADMIN_RESOURCE = 'Miyabara_Buffer::post_index';

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
        $result = $this->jsonFactory->create();
        $q      = trim((string) $this->getRequest()->getParam('q'));

        if ($q === '') {
            return $result->setData([]);
        }

        $storeId = (int) $this->storeManager->getDefaultStoreView()->getId();
        $this->emulation->startEnvironmentEmulation($storeId);

        $collection = $this->collectionFactory->create();
        $collection->addAttributeToSelect(['name', 'short_description', 'thumbnail'])
            ->addAttributeToFilter('name', ['like' => '%' . $q . '%'])
            ->addAttributeToFilter('status', \Magento\Catalog\Model\Product\Attribute\Source\Status::STATUS_ENABLED)
            ->setPageSize(10)
            ->setCurPage(1);

        $products = [];
        foreach ($collection as $product) {
            $imageUrl = $this->imageHelper
                ->init($product, 'product_thumbnail_image')
                ->setImageFile($product->getThumbnail())
                ->getUrl();

            $products[] = [
                'id'          => $product->getId(),
                'name'        => $product->getName(),
                'sku'         => $product->getSku(),
                'description' => strip_tags((string) $product->getShortDescription()),
                'imageUrl'    => $imageUrl,
            ];
        }

        $this->emulation->stopEnvironmentEmulation();

        return $result->setData($products);
    }
}
