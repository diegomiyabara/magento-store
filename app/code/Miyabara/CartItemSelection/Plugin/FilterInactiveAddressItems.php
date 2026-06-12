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

use Magento\Quote\Model\Quote\Address;

/**
 * Excludes inactive quote items from Address::getAllItems so totals and shipping ignore deselected items.
 */
class FilterInactiveAddressItems
{
    /**
     * @param Address $subject
     * @param array $result
     * @return array
     */
    public function afterGetAllItems(Address $subject, array $result): array
    {
        return array_values(
            array_filter($result, static fn($item): bool => (bool) ($item->getData('is_active') ?? 1)),
        );
    }
}
