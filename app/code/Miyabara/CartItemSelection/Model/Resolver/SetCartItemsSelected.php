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

namespace Miyabara\CartItemSelection\Model\Resolver;

use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Exception\GraphQlInputException;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Query\Uid;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\Quote\Api\CartRepositoryInterface;
use Magento\Quote\Model\Quote;
use Magento\Quote\Model\Quote\Address;
use Magento\Quote\Model\Quote\Item;
use Magento\QuoteGraphQl\Model\Cart\GetCartForUser;

/**
 * Resolver for the setCartItemsSelected bulk mutation — atomically toggles is_active on multiple quote items.
 */
class SetCartItemsSelected implements ResolverInterface
{
    /**
     * @param GetCartForUser $getCartForUser
     * @param CartRepositoryInterface $cartRepository
     * @param Uid $uidEncoder
     */
    public function __construct(
        private readonly GetCartForUser $getCartForUser,
        private readonly CartRepositoryInterface $cartRepository,
        private readonly Uid $uidEncoder,
    ) {
    }

    /**
     * @param Field $field
     * @param mixed $context
     * @param ResolveInfo $info
     * @param array|null $value
     * @param array|null $args
     * @return array
     * @throws GraphQlInputException
     */
    public function resolve(Field $field, $context, ResolveInfo $info, ?array $value = null, ?array $args = null): array
    {
        $maskedCartId = $args['input']['cart_id'] ?? '';
        $itemInputs = $args['input']['items'] ?? [];

        $storeId = (int) $context->getExtensionAttributes()->getStore()->getId();
        $quote = $this->getCartForUser->execute($maskedCartId, $context->getUserId(), $storeId);

        $resolvedItems = $this->resolveAndValidateItems($quote, $itemInputs);

        foreach ($resolvedItems as [$item, $isActive]) {
            $this->updateItemActive($item, $isActive);
        }

        $this->resetShippingAndCache($quote);

        $quote->collectTotals();
        $this->cartRepository->save($quote);

        return ['cart' => ['model' => $quote]];
    }

    /**
     * @param Quote $quote
     * @param array $itemInputs
     * @return array
     * @throws GraphQlInputException
     */
    private function resolveAndValidateItems(Quote $quote, array $itemInputs): array
    {
        $resolved = [];

        foreach ($itemInputs as $itemInput) {
            $cartItemUid = (string) ($itemInput['cart_item_uid'] ?? '');
            $isActive = (bool) ($itemInput['is_active'] ?? true);

            $itemId = (int) $this->uidEncoder->decode($cartItemUid);
            $item = $quote->getItemById($itemId);

            if ($item === null || $item->getParentItemId()) {
                throw new GraphQlInputException(__('The cart item with uid "%1" was not found.', $cartItemUid));
            }

            $resolved[] = [$item, $isActive];
        }

        return $resolved;
    }

    /**
     * @param Item $item
     * @param bool $isActive
     * @return void
     */
    private function updateItemActive(Item $item, bool $isActive): void
    {
        $item->setData('is_active', $isActive);
    }

    /**
     * @param Quote $quote
     * @return void
     */
    private function resetShippingAndCache(Quote $quote): void
    {
        foreach ($quote->getAllAddresses() as $address) {
            /** @var Address $address */
            $address->setCollectShippingRates(true);
            $address->unsetData('cached_items_all');
            $address->setShippingMethod(null);
        }
    }
}
