<?php

declare(strict_types=1);

namespace Miyabara\CartItemSelection\Plugin;

use Magento\Quote\Model\Quote;
use Magento\Quote\Model\Quote\Item;

class FilterInactiveQuoteItems
{
    /**
     * @param Quote $subject
     * @param array $result
     * @return array
     */
    public function afterGetAllVisibleItems(Quote $subject, array $result): array
    {
        return $this->filterActive($result);
    }

    /**
     * @param Quote $subject
     * @param array $result
     * @return array
     */
    public function afterGetAllItems(Quote $subject, array $result): array
    {
        return $this->filterActive($result);
    }

    /**
     * @param array $items
     * @return array
     */
    private function filterActive(array $items): array
    {
        return array_values(
            array_filter($items, static fn(Item $item): bool => (bool) ($item->getData('is_active') ?? 1)),
        );
    }
}
