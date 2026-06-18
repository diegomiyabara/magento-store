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

use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\QuoteGraphQl\Model\CartItem\GetItemsData;
use Magento\QuoteGraphQl\Model\Resolver\CartItems;

/**
 * Bypasses the core CartItems resolver to serve all items (active and inactive) from the unfiltered collection.
 */
class CartItemsGraphQlResolver
{
    /**
     * @param GetItemsData $getItemsData
     */
    public function __construct(
        private readonly GetItemsData $getItemsData,
    ) {
    }

    /**
     * Returns all cart items including inactive ones, bypassing the filtered getAllVisibleItems source.
     *
     * @param CartItems $subject
     * @param callable $proceed
     * @param Field $field
     * @param mixed $context
     * @param ResolveInfo $info
     * @param array|null $value
     * @param array|null $args
     * @return array
     */
    public function aroundResolve(
        CartItems $subject,
        callable $proceed,
        Field $field,
        $context,
        ResolveInfo $info,
        ?array $value = null,
        ?array $args = null,
    ): array {
        if (!isset($value['model'])) {
            return $proceed($field, $context, $info, $value, $args);
        }

        $cart = $value['model'];
        $items = [];

        foreach ($cart->getItemsCollection() as $cartItem) {
            if ($cartItem->isDeleted() || $cartItem->getParentItemId() || $cartItem->getParentItem()) {
                continue;
            }

            $items[] = $cartItem;
        }

        return $this->getItemsData->execute($items);
    }
}
