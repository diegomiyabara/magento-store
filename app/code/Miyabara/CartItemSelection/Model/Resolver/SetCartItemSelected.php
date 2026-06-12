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
 * Resolver for the setCartItemSelected mutation — toggles is_active on a single quote item.
 */
class SetCartItemSelected implements ResolverInterface
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
     * Validates the cart item, sets its is_active flag, resets shipping, and returns the updated cart.
     *
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
        $cartItemUid = (string) ($args['input']['cart_item_uid'] ?? '');
        $isActive = (bool) ($args['input']['is_active'] ?? true);

        $storeId = (int) $context->getExtensionAttributes()->getStore()->getId();
        $quote = $this->getCartForUser->execute($maskedCartId, $context->getUserId(), $storeId);

        $itemId = (int) $this->uidEncoder->decode($cartItemUid);
        $item = $quote->getItemById($itemId);

        if ($item === null || $item->getParentItemId()) {
            throw new GraphQlInputException(__('The cart item with uid "%1" was not found.', $cartItemUid));
        }

        $this->updateItemActive($item, $isActive);
        $this->resetShippingAndCache($quote);

        $quote->collectTotals();
        $this->cartRepository->save($quote);

        return ['cart' => ['model' => $quote]];
    }

    /**
     * Writes the is_active flag to the quote item data bag without persisting.
     *
     * @param Item $item
     * @param bool $isActive
     * @return void
     */
    private function updateItemActive(Item $item, bool $isActive): void
    {
        $item->setData('is_active', $isActive);
    }

    /**
     * Invalidates the address item cache and forces shipping recalculation on all quote addresses.
     *
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
