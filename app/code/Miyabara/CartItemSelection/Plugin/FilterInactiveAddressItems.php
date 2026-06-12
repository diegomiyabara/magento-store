<?php

declare(strict_types=1);

namespace Miyabara\CartItemSelection\Plugin;

use Magento\Quote\Model\Quote\Address;

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
