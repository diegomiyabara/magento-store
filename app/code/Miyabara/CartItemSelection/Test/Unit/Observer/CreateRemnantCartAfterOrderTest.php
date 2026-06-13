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

namespace Miyabara\CartItemSelection\Test\Unit\Observer;

use ArrayObject;
use Exception;
use Magento\Catalog\Model\Product;
use Magento\Framework\DataObject;
use Magento\Framework\Event\Observer;
use Magento\Framework\Message\ManagerInterface;
use Magento\Quote\Api\CartManagementInterface;
use Magento\Quote\Api\CartRepositoryInterface;
use Magento\Quote\Model\Quote;
use Magento\Quote\Model\Quote\Item;
use Magento\Quote\Model\ResourceModel\Quote as QuoteResource;
use Miyabara\CartItemSelection\Observer\CreateRemnantCartAfterOrder;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use RuntimeException;

class CreateRemnantCartAfterOrderTest extends TestCase
{
    private CartManagementInterface $cartManagement;
    private CartRepositoryInterface $cartRepository;
    private QuoteResource $quoteResource;
    private ManagerInterface $messageManager;
    private LoggerInterface $logger;
    private CreateRemnantCartAfterOrder $observer;
    private Quote $newQuoteMock;

    protected function setUp(): void
    {
        $this->cartManagement = $this->createMock(CartManagementInterface::class);
        $this->cartRepository = $this->createMock(CartRepositoryInterface::class);
        $this->quoteResource = $this->createMock(QuoteResource::class);
        $this->messageManager = $this->createMock(ManagerInterface::class);
        $this->logger = $this->createMock(LoggerInterface::class);

        $this->observer = new CreateRemnantCartAfterOrder(
            $this->cartManagement,
            $this->cartRepository,
            $this->quoteResource,
            $this->messageManager,
            $this->logger,
        );

        $this->newQuoteMock = $this->createMock(Quote::class);
        $this->newQuoteMock->method('collectTotals')->willReturnSelf();
    }

    private function makeItem(bool $isActive, ?int $parentItemId = null, string $name = 'Test Product', float $qty = 1.0): Item
    {
        $item = $this->createMock(Item::class);
        $item->method('getData')
            ->willReturnMap([
                ['is_active', null, $isActive ? 1 : 0],
                ['parent_item_id', null, $parentItemId],
            ]);
        $item->method('getName')->willReturn($name);
        $item->method('getQty')->willReturn($qty);
        $item->method('getProduct')->willReturn($this->createMock(Product::class));
        $item->method('getBuyRequest')->willReturn(new DataObject());

        return $item;
    }

    private function makeQuoteWithItems(array $items, ?int $customerId = 1): Quote
    {
        $collection = new ArrayObject($items);
        $quote = $this->createMock(Quote::class);
        $quote->method('getData')
            ->with('customer_id')
            ->willReturn($customerId);
        $quote->method('getItemsCollection')->willReturn($collection);

        return $quote;
    }

    private function makeObserver(Quote $quote): Observer
    {
        $observer = $this->createMock(Observer::class);
        $observer->method('getData')
            ->willReturnMap([
                ['quote', null, $quote],
            ]);

        return $observer;
    }

    public function testItAddsWarningMessagesForEachIndividualFailedItemNotJustOneGenericMessage(): void
    {
        $item1 = $this->makeItem(false, null, 'Product Alpha');
        $item2 = $this->makeItem(false, null, 'Product Beta');
        $quote = $this->makeQuoteWithItems([$item1, $item2], 1);
        $eventObserver = $this->makeObserver($quote);

        $this->cartManagement->method('createEmptyCartForCustomer')->willReturn(10);
        $this->cartRepository->method('get')->with(10)->willReturn($this->newQuoteMock);
        $this->newQuoteMock->method('addProduct')->willReturn('Product unavailable');

        $this->messageManager
            ->expects($this->exactly(2))
            ->method('addWarningMessage');

        $this->logger->method('warning');
        $this->quoteResource->method('save');

        $this->observer->execute($eventObserver);
    }

    public function testItCreatesOnlyOneNewCartRegardlessOfHowManyInactiveItemsExist(): void
    {
        $item1 = $this->makeItem(false, null, 'Item One');
        $item2 = $this->makeItem(false, null, 'Item Two');
        $item3 = $this->makeItem(false, null, 'Item Three');
        $quote = $this->makeQuoteWithItems([$item1, $item2, $item3], 5);
        $eventObserver = $this->makeObserver($quote);

        $this->cartManagement
            ->expects($this->once())
            ->method('createEmptyCartForCustomer')
            ->with(5)
            ->willReturn(20);

        $this->cartRepository->method('get')->with(20)->willReturn($this->newQuoteMock);
        $this->newQuoteMock->method('addProduct')->willReturn($this->createMock(Item::class));
        $this->quoteResource->method('save');

        $this->observer->execute($eventObserver);
    }

    public function testItDoesNotThrowExceptionsOnAnyFailureProtectsCheckoutSuccessFlow(): void
    {
        $quote = $this->createMock(Quote::class);
        $quote->method('getData')
            ->with('customer_id')
            ->willReturn(1);
        $quote->method('getItemsCollection')
            ->willThrowException(new RuntimeException('DB connection lost'));

        $eventObserver = $this->makeObserver($quote);

        $this->logger->method('error');

        $this->assertNull($this->observer->execute($eventObserver));
    }

    public function testItLogsTheErrorWithContextInAdditionToAddingTheWarningMessage(): void
    {
        $inactiveItem = $this->makeItem(false, null, 'Logged Product');
        $quote = $this->makeQuoteWithItems([$inactiveItem], 1);
        $eventObserver = $this->makeObserver($quote);

        $this->cartManagement->method('createEmptyCartForCustomer')->willReturn(10);
        $this->cartRepository->method('get')->with(10)->willReturn($this->newQuoteMock);
        $this->newQuoteMock->method('addProduct')->willReturn('Out of stock');
        $this->quoteResource->method('save');

        $this->logger
            ->expects($this->once())
            ->method('warning')
            ->with(
                $this->isType('string'),
                $this->callback(static function (array $context): bool {
                    return isset($context['product'])
                        && isset($context['exception'])
                        && $context['exception'] instanceof \Exception;
                }),
            );

        $this->messageManager->method('addWarningMessage');

        $this->observer->execute($eventObserver);
    }

    public function testItIncludesTheFailureReasonInTheWarningMessageText(): void
    {
        $inactiveItem = $this->makeItem(false, null, 'Special Widget');
        $quote = $this->makeQuoteWithItems([$inactiveItem], 1);
        $eventObserver = $this->makeObserver($quote);

        $this->cartManagement->method('createEmptyCartForCustomer')->willReturn(10);
        $this->cartRepository->method('get')->with(10)->willReturn($this->newQuoteMock);
        $this->newQuoteMock->method('addProduct')->willReturn('Product is disabled');
        $this->quoteResource->method('save');

        $this->messageManager
            ->expects($this->once())
            ->method('addWarningMessage')
            ->with($this->callback(static function ($message): bool {
                $text = (string) $message;

                return str_contains($text, 'Special Widget')
                    && str_contains($text, 'Product is disabled');
            }));

        $this->observer->execute($eventObserver);
    }

    public function testItAddsAWarningMessageViaMessageManagerWhenAnItemFailsToBeAdded(): void
    {
        $inactiveItem = $this->makeItem(false, null, 'Failing Product');
        $quote = $this->makeQuoteWithItems([$inactiveItem], 1);
        $eventObserver = $this->makeObserver($quote);

        $this->cartManagement->method('createEmptyCartForCustomer')->willReturn(10);
        $this->cartRepository->method('get')->with(10)->willReturn($this->newQuoteMock);
        $this->newQuoteMock->method('addProduct')->willReturn('Out of stock');
        $this->quoteResource->method('save');

        $this->messageManager
            ->expects($this->once())
            ->method('addWarningMessage');

        $this->observer->execute($eventObserver);
    }

    public function testItPreservesQtyAndProductOptionsWhenReAddingItemsToTheRemnantCart(): void
    {
        $buyRequestData = ['selected_configurable_option' => '42', 'super_attribute' => ['93' => '52']];

        $inactiveItem = $this->createMock(Item::class);
        $inactiveItem->method('getData')
            ->willReturnMap([
                ['is_active', null, 0],
                ['parent_item_id', null, null],
            ]);
        $inactiveItem->method('getName')->willReturn('Configurable Product');
        $inactiveItem->method('getQty')->willReturn(3.0);
        $inactiveItem->method('getProduct')->willReturn($this->createMock(Product::class));
        $inactiveItem->method('getBuyRequest')->willReturn(new DataObject($buyRequestData));

        $quote = $this->makeQuoteWithItems([$inactiveItem], 7);
        $eventObserver = $this->makeObserver($quote);

        $this->cartManagement->method('createEmptyCartForCustomer')->willReturn(55);
        $this->cartRepository->method('get')->with(55)->willReturn($this->newQuoteMock);
        $this->quoteResource->method('save');

        $this->newQuoteMock->expects($this->once())
            ->method('addProduct')
            ->with(
                $this->isInstanceOf(Product::class),
                $this->callback(static function (DataObject $request) use ($buyRequestData): bool {
                    return (float) $request->getData('qty') === 3.0
                        && $request->getData('selected_configurable_option') === $buyRequestData['selected_configurable_option'];
                }),
            )
            ->willReturn($this->createMock(Item::class));

        $this->observer->execute($eventObserver);
    }

    public function testItSkipsChildItemsConfigurableProductChildrenWhenCreatingRemnantCart(): void
    {
        $parentItem = $this->makeItem(false, null, 'Configurable Parent');
        $childItem = $this->makeItem(false, 10, 'Configurable Child');
        $quote = $this->makeQuoteWithItems([$parentItem, $childItem], 1);
        $eventObserver = $this->makeObserver($quote);

        $this->cartManagement->method('createEmptyCartForCustomer')->willReturn(7);
        $this->cartRepository->method('get')->with(7)->willReturn($this->newQuoteMock);
        $this->quoteResource->method('save');

        $this->newQuoteMock
            ->expects($this->once())
            ->method('addProduct')
            ->willReturn($this->createMock(Item::class));

        $this->observer->execute($eventObserver);
    }

    public function testItReadsInactiveItemsFromGetItemsCollectionNotGetAllItemsWhichIsNowFiltered(): void
    {
        $inactiveItem = $this->makeItem(false);
        $quote = $this->createMock(Quote::class);
        $quote->method('getData')->with('customer_id')->willReturn(1);
        $quote->expects($this->once())
            ->method('getItemsCollection')
            ->willReturn(new ArrayObject([$inactiveItem]));
        $quote->expects($this->never())->method('getAllItems');
        $quote->expects($this->never())->method('getAllVisibleItems');

        $this->cartManagement->method('createEmptyCartForCustomer')->willReturn(5);
        $this->cartRepository->method('get')->with(5)->willReturn($this->newQuoteMock);
        $this->newQuoteMock->method('addProduct')->willReturn($this->createMock(Item::class));
        $this->quoteResource->method('save');

        $eventObserver = $this->makeObserver($quote);

        $this->observer->execute($eventObserver);
    }

    public function testItDoesNothingWhenTheQuoteHasNoCustomerGuestCheckoutShouldNotHappenButGuardAnyway(): void
    {
        $inactiveItem = $this->makeItem(false);
        $quote = $this->makeQuoteWithItems([$inactiveItem], 0);
        $eventObserver = $this->makeObserver($quote);

        $this->cartManagement
            ->expects($this->never())
            ->method('createEmptyCartForCustomer');

        $this->observer->execute($eventObserver);
    }

    public function testItDoesNothingWhenAllItemsInTheOrderWereActive(): void
    {
        $activeItem = $this->makeItem(true);
        $quote = $this->makeQuoteWithItems([$activeItem], 42);
        $eventObserver = $this->makeObserver($quote);

        $this->cartManagement
            ->expects($this->never())
            ->method('createEmptyCartForCustomer');

        $this->quoteResource
            ->expects($this->never())
            ->method('save');

        $this->observer->execute($eventObserver);
    }

    public function testItCreatesANewCartWithInactiveItemsAfterOrderIsPlaced(): void
    {
        $inactiveItem = $this->makeItem(false);
        $quote = $this->makeQuoteWithItems([$inactiveItem], 42);
        $eventObserver = $this->makeObserver($quote);

        $this->cartManagement
            ->expects($this->once())
            ->method('createEmptyCartForCustomer')
            ->with(42)
            ->willReturn(99);

        $this->cartRepository->method('get')->with(99)->willReturn($this->newQuoteMock);
        $this->newQuoteMock->method('addProduct')->willReturn($this->createMock(Item::class));

        $this->quoteResource
            ->expects($this->once())
            ->method('save')
            ->with($this->newQuoteMock);

        $this->observer->execute($eventObserver);
    }
}
