<?php
/**
 * Miyabara_CartItemSelection
 *
 * @vendor    Miyabara
 * @package   CartItemSelection
 *
 * @copyright © 2026 Diego M. Miyabara. All rights reserved.
 * @author    Diego M. Miyabara <diego.miyabara@gmail.com>
 */

declare(strict_types=1);

namespace Miyabara\CartItemSelection\Plugin;

use Magento\Quote\Model\Quote;
use Magento\Quote\Model\Quote\Item;

/**
 * Excludes inactive quote items from Quote::getAllItems and Quote::getAllVisibleItems so order conversion and the empty-cart guard skip deselected items.
 */
class FilterInactiveQuoteItems
{
    /**
     * Strips inactive items from the visible items list used for the empty-cart guard.
     *
     * @param Quote $subject
     * @param array $result
     * @return array
     */
    public function afterGetAllVisibleItems(Quote $subject, array $result): array
    {
        return $this->filterActive($result);
    }

    /**
     * Strips inactive items from the full items list used for order conversion.
     *
     * @param Quote $subject
     * @param array $result
     * @return array
     */
    public function afterGetAllItems(Quote $subject, array $result): array
    {
        return $this->filterActive($result);
    }

    /**
     * Returns only items where is_active evaluates to true, re-indexing the result array.
     *
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
