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

use Magento\Framework\Event\Observer;
use Magento\Framework\Event\ObserverInterface;
use Magento\Framework\Message\ManagerInterface;
use Magento\Quote\Api\CartItemRepositoryInterface;
use Magento\Quote\Api\CartManagementInterface;
use Magento\Quote\Model\Quote;
use Psr\Log\LoggerInterface;

/**
 * After order placement, moves inactive quote items into a new cart for the customer.
 */
class CreateRemnantCartAfterOrder implements ObserverInterface
{
    /**
     * @param CartManagementInterface $cartManagement
     * @param CartItemRepositoryInterface $cartItemRepository
     * @param ManagerInterface $messageManager
     * @param LoggerInterface $logger
     */
    public function __construct(
        private readonly CartManagementInterface $cartManagement,
        private readonly CartItemRepositoryInterface $cartItemRepository,
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
            $quote = $observer->getData('quote');
            $customerId = $quote->getData('customer_id');

            if (!$customerId) {
                return;
            }

            $inactiveItems = $this->getInactiveParentItems($quote);

            if (empty($inactiveItems)) {
                return;
            }

            $newCartId = $this->cartManagement->createEmptyCartForCustomer((int) $customerId);

            foreach ($inactiveItems as $inactiveItem) {
                try {
                    $inactiveItem->setData('quote_id', $newCartId);
                    $this->cartItemRepository->save($inactiveItem);
                } catch (\Exception $e) {
                    $productName = $inactiveItem->getName();
                    $this->logger->warning(
                        'Could not add item to remnant cart',
                        ['product' => $productName, 'exception' => $e],
                    );
                    $this->messageManager->addWarningMessage(
                        __(
                            '"%1" não pôde ser adicionado ao seu carrinho: %2',
                            $productName,
                            $e->getMessage(),
                        ),
                    );
                }
            }
        } catch (\Exception $e) {
            $this->logger->error('Failed to create remnant cart after order', ['exception' => $e]);
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
