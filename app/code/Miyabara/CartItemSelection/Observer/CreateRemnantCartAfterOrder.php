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

namespace Miyabara\CartItemSelection\Observer;

use Magento\Framework\DataObject;
use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Message\ManagerInterface;
use Magento\Quote\Api\CartManagementInterface;
use Magento\Quote\Api\CartRepositoryInterface;
use Magento\Quote\Model\Quote;
use Magento\Quote\Model\Quote\Item;
use Magento\Quote\Model\ResourceModel\Quote as QuoteResource;
use Psr\Log\LoggerInterface;

/**
 * After order placement, moves inactive quote items into a new cart for the customer.
 */
class CreateRemnantCartAfterOrder implements ObserverInterface
{
    /**
     * @param CartManagementInterface $cartManagement
     * @param CartRepositoryInterface $cartRepository
     * @param QuoteResource $quoteResource
     * @param ManagerInterface $messageManager
     * @param LoggerInterface $logger
     */
    public function __construct(
        private readonly CartManagementInterface $cartManagement,
        private readonly CartRepositoryInterface $cartRepository,
        private readonly QuoteResource $quoteResource,
        private readonly ManagerInterface $messageManager,
        private readonly LoggerInterface $logger,
    ) {
    }

    /**
     * Creates a new customer cart from the inactive items in the original quote after checkout.
     *
     * @param Observer $observer
     * @return void
     */
    public function execute(Observer $observer): void
    {
        try {
            /** @var Quote $quote */
            $quote = $observer->getData('quote');
            $customerId = (int) $quote->getData('customer_id');

            if (!$customerId) {
                return;
            }

            $inactiveItems = $this->getInactiveParentItems($quote);

            if (empty($inactiveItems)) {
                return;
            }

            $newCartId = $this->cartManagement->createEmptyCartForCustomer($customerId);
            $newQuote = $this->cartRepository->get($newCartId);

            foreach ($inactiveItems as $inactiveItem) {
                try {
                    $this->addItemToQuote($newQuote, $inactiveItem);
                } catch (\Exception $e) {
                    $productName = $inactiveItem->getName();
                    $this->logger->warning(
                        'Could not add item to remnant cart',
                        ['product' => $productName, 'exception' => $e],
                    );
                    $this->messageManager->addWarningMessage(
                        __(
                            '"%1" could not be added to your cart: %2',
                            $productName,
                            $e->getMessage(),
                        ),
                    );
                }
            }

            $this->quoteResource->save($newQuote->collectTotals());
        } catch (\Exception $e) {
            $this->logger->error('Failed to create remnant cart after order', ['exception' => $e]);
        }
    }

    /**
     * Adds a copy of the given item to the new quote using addProduct to avoid item_id conflicts.
     *
     * @param Quote $newQuote
     * @param Item $sourceItem
     * @return void
     */
    private function addItemToQuote(Quote $newQuote, Item $sourceItem): void
    {
        $product = $sourceItem->getProduct();
        $buyRequest = $sourceItem->getBuyRequest();

        $request = new DataObject(array_merge(
            (array) $buyRequest->getData(),
            ['qty' => $sourceItem->getQty()],
        ));

        $result = $newQuote->addProduct($product, $request);

        if (is_string($result)) {
            throw new \RuntimeException($result);
        }
    }

    /**
     * Returns top-level items from the unfiltered collection where is_active = 0.
     *
     * @param Quote $quote
     * @return array
     */
    private function getInactiveParentItems(Quote $quote): array
    {
        $inactive = [];

        foreach ($quote->getItemsCollection() as $item) {
            if ($item->getData('parent_item_id') !== null) {
                continue;
            }

            if ((int) ($item->getData('is_active') ?? 1) === 0) {
                $inactive[] = $item;
            }
        }

        return $inactive;
    }
}
