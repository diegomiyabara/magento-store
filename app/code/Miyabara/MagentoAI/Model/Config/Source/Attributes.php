<?php
/**
 * Miyabara_MagentoAI
 *
 * @vendor    Miyabara
 * @package   MagentoAI
 *
 * @copyright © 2026 Diego M. Miyabara. All rights reserved.
 * @author    Diego M. Miyabara <diego.miyabara@hotmail.com>
 */

declare(strict_types=1);

namespace Miyabara\MagentoAI\Model\Config\Source;

use Magento\Catalog\Model\ResourceModel\Product\Attribute\CollectionFactory;
use Magento\Framework\Data\OptionSourceInterface;

class Attributes implements OptionSourceInterface
{
    /**
     * @param CollectionFactory $collectionFactory
     */
    public function __construct(
        private readonly CollectionFactory $collectionFactory
    ) {}

    /**
     * Returns all catalog product EAV attributes as option array, sorted by label.
     *
     * @return array<int, array<string, string>>
     */
    public function toOptionArray(): array
    {
        $options = [];
        foreach ($this->toArray() as $code => $label) {
            $options[] = ['value' => $code, 'label' => $label];
        }
        return $options;
    }

    /**
     * Returns all catalog product EAV attributes as code => label map, sorted alphabetically.
     *
     * @return array<string, string>
     */
    public function toArray(): array
    {
        $attributes = [];
        $collection = $this->collectionFactory->create();

        foreach ($collection as $attribute) {
            $label = $attribute->getFrontendLabel();
            if ($label) {
                $attributes[$attribute->getAttributeCode()] = $label;
            }
        }

        asort($attributes);
        return $attributes;
    }
}
