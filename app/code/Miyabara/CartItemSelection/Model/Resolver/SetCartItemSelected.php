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

use Magento\Framework\App\ResourceConnection;
use Magento\Framework\GraphQl\Config\Element\Field;
use Magento\Framework\GraphQl\Exception\GraphQlInputException;
use Magento\Framework\GraphQl\Query\ResolverInterface;
use Magento\Framework\GraphQl\Query\Uid;
use Magento\Framework\GraphQl\Schema\Type\ResolveInfo;
use Magento\Quote\Model\Quote;
use Magento\Quote\Model\Quote\Address;
use Magento\Quote\Model\Quote\Item;
use Magento\Quote\Model\ResourceModel\Quote as QuoteResource;
use Magento\QuoteGraphQl\Model\Cart\GetCartForUser;

/**
 * Resolver for the setCartItemSelected mutation — toggles is_active on a single quote item.
 */
class SetCartItemSelected implements ResolverInterface
{
    /**
     * @param GetCartForUser $getCartForUser
     * @param QuoteResource $quoteResource
     * @param Uid $uidEncoder
     * @param ResourceConnection $resourceConnection
     */
    public function __construct(
        private readonly GetCartForUser $getCartForUser,
        private readonly QuoteResource $quoteResource,
        private readonly Uid $uidEncoder,
        private readonly ResourceConnection $resourceConnection,
    ) {
    }

    /**
     * Validates the cart item, persists is_active via direct DB write, recalculates totals, and returns the updated cart.
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

        if (!$item || $item->getParentItemId()) {
            throw new GraphQlInputException(__('The cart item with uid "%1" was not found.', $cartItemUid));
        }

        $this->persistIsActive($itemId, $isActive);
        $item->setData('is_active', $isActive);
        $this->resetShippingAndCache($quote);

        $this->quoteResource->save($quote->collectTotals());

        return ['cart' => ['model' => $quote]];
    }

    /**
     * Writes is_active directly to quote_item via a single UPDATE, bypassing CartItemPersister validation.
     *
     * @param int $itemId
     * @param bool $isActive
     * @return void
     */
    private function persistIsActive(int $itemId, bool $isActive): void
    {
        $connection = $this->resourceConnection->getConnection();
        $table = $this->resourceConnection->getTableName('quote_item');

        $connection->update($table, ['is_active' => (int) $isActive], ['item_id = ?' => $itemId]);
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
