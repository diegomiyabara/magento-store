<?php

declare(strict_types=1);

namespace Miyabara\CartItemSelection\Test\Unit\Observer;

use ArrayObject;
use Exception;
use Magento\Framework\Event\Observer;
use Magento\Framework\Message\ManagerInterface;
use Magento\Quote\Api\CartItemRepositoryInterface;
use Magento\Quote\Api\CartManagementInterface;
use Magento\Quote\Model\Quote;
use Magento\Quote\Model\Quote\Item;
use Miyabara\CartItemSelection\Observer\CreateRemnantCartAfterOrder;
use PHPUnit\Framework\TestCase;
use Psr\Log\LoggerInterface;
use RuntimeException;

class CreateRemnantCartAfterOrderTest extends TestCase
{
    private CartManagementInterface $cartManagement;
    private CartItemRepositoryInterface $cartItemRepository;
    private ManagerInterface $messageManager;
    private LoggerInterface $logger;
    private CreateRemnantCartAfterOrder $observer;

    protected function setUp(): void
    {
        $this->cartManagement = $this->createMock(CartManagementInterface::class);
        $this->cartItemRepository = $this->createMock(CartItemRepositoryInterface::class);
        $this->messageManager = $this->createMock(ManagerInterface::class);
        $this->logger = $this->createMock(LoggerInterface::class);

        $this->observer = new CreateRemnantCartAfterOrder(
            $this->cartManagement,
            $this->cartItemRepository,
            $this->messageManager,
            $this->logger,
        );
    }

    private function makeItem(bool $isActive, ?int $parentItemId = null, string $name = 'Test Product'): Item
    {
        $item = $this->createMock(Item::class);
        $item->method('getData')
            ->willReturnMap([
                ['is_active', null, $isActive ? 1 : 0],
                ['parent_item_id', null, $parentItemId],
            ]);
        $item->method('getName')
            ->willReturn($name);

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
        $this->cartItemRepository->method('save')->willThrowException(new Exception('Unavailable'));

        $this->messageManager
            ->expects($this->exactly(2))
            ->method('addWarningMessage');

        $this->logger->method('warning');

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

        $this->cartItemRepository->method('save');

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
        $exception = new Exception('Item save failed');
        $inactiveItem = $this->makeItem(false, null, 'Logged Product');
        $quote = $this->makeQuoteWithItems([$inactiveItem], 1);
        $eventObserver = $this->makeObserver($quote);

        $this->cartManagement->method('createEmptyCartForCustomer')->willReturn(10);
        $this->cartItemRepository->method('save')->willThrowException($exception);

        $this->logger
            ->expects($this->once())
            ->method('warning')
            ->with(
                $this->isType('string'),
                $this->callback(static function (array $context) use ($exception): bool {
                    return isset($context['product'])
                        && isset($context['exception'])
                        && $context['exception'] === $exception;
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
        $this->cartItemRepository->method('save')->willThrowException(new Exception('Product is disabled'));

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
        $this->cartItemRepository->method('save')->willThrowException(new Exception('Out of stock'));

        $this->messageManager
            ->expects($this->once())
            ->method('addWarningMessage');

        $this->observer->execute($eventObserver);
    }

    public function testItPreservesQtyAndProductOptionsWhenReAddingItemsToTheRemnantCart(): void
    {
        $inactiveItem = $this->createMock(Item::class);
        $inactiveItem->method('getData')
            ->willReturnMap([
                ['is_active', null, 0],
                ['parent_item_id', null, null],
            ]);
        $inactiveItem->method('getName')->willReturn('Test Product');
        $inactiveItem->expects($this->once())
            ->method('setData')
            ->with('quote_id', 55);

        $quote = $this->makeQuoteWithItems([$inactiveItem], 7);
        $eventObserver = $this->makeObserver($quote);

        $this->cartManagement->method('createEmptyCartForCustomer')->willReturn(55);

        $this->cartItemRepository
            ->expects($this->once())
            ->method('save')
            ->with($inactiveItem);

        $this->observer->execute($eventObserver);
    }

    public function testItSkipsChildItemsConfigurableProductChildrenWhenCreatingRemnantCart(): void
    {
        $parentItem = $this->makeItem(false, null, 'Configurable Parent');
        $childItem = $this->makeItem(false, 10, 'Configurable Child');
        $quote = $this->makeQuoteWithItems([$parentItem, $childItem], 1);
        $eventObserver = $this->makeObserver($quote);

        $this->cartManagement->method('createEmptyCartForCustomer')->willReturn(7);

        $this->cartItemRepository
            ->expects($this->once())
            ->method('save')
            ->with($parentItem);

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

        $this->cartItemRepository
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

        $this->cartItemRepository
            ->expects($this->once())
            ->method('save')
            ->with($inactiveItem);

        $this->observer->execute($eventObserver);
    }
}
