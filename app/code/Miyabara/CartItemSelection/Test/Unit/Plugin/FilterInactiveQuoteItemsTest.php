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

namespace Miyabara\CartItemSelection\Test\Unit\Plugin;

use Magento\Quote\Model\Quote;
use Magento\Quote\Model\Quote\Item;
use Miyabara\CartItemSelection\Plugin\FilterInactiveQuoteItems;
use PHPUnit\Framework\TestCase;

class FilterInactiveQuoteItemsTest extends TestCase
{
    private FilterInactiveQuoteItems $plugin;
    private Quote $quoteMock;

    protected function setUp(): void
    {
        $this->plugin = new FilterInactiveQuoteItems();
        $this->quoteMock = $this->createMock(Quote::class);
    }

    private function makeItem(?int $isActive): Item
    {
        $item = $this->createMock(Item::class);
        $item->method('getData')
            ->with('is_active')
            ->willReturn($isActive);

        return $item;
    }

    public function testItReturnsOnlyActiveItemsFromQuoteGetAllVisibleItemsWhenQuoteHasMix(): void
    {
        $activeItem = $this->makeItem(1);
        $inactiveItem = $this->makeItem(0);

        $result = $this->plugin->afterGetAllVisibleItems(
            $this->quoteMock,
            [$activeItem, $inactiveItem],
        );

        $this->assertCount(1, $result);
        $this->assertSame($activeItem, $result[0]);
    }

    public function testItReturnsOnlyActiveItemsFromQuoteGetAllItemsWhenQuoteHasMix(): void
    {
        $activeItem = $this->makeItem(1);
        $inactiveItem = $this->makeItem(0);

        $result = $this->plugin->afterGetAllItems(
            $this->quoteMock,
            [$activeItem, $inactiveItem],
        );

        $this->assertCount(1, $result);
        $this->assertSame($activeItem, $result[0]);
    }

    public function testItReturnsAllItemsWhenAllItemsAreActive(): void
    {
        $item1 = $this->makeItem(1);
        $item2 = $this->makeItem(1);

        $resultVisible = $this->plugin->afterGetAllVisibleItems(
            $this->quoteMock,
            [$item1, $item2],
        );

        $resultAll = $this->plugin->afterGetAllItems(
            $this->quoteMock,
            [$item1, $item2],
        );

        $this->assertCount(2, $resultVisible);
        $this->assertCount(2, $resultAll);
    }

    public function testItReturnsEmptyArrayWhenAllItemsAreInactive(): void
    {
        $item1 = $this->makeItem(0);
        $item2 = $this->makeItem(0);

        $resultVisible = $this->plugin->afterGetAllVisibleItems(
            $this->quoteMock,
            [$item1, $item2],
        );

        $resultAll = $this->plugin->afterGetAllItems(
            $this->quoteMock,
            [$item1, $item2],
        );

        $this->assertSame([], $resultVisible);
        $this->assertSame([], $resultAll);
    }

    public function testItTreatsItemsWithNullIsActiveAsActiveBackwardCompatibility(): void
    {
        $nullItem = $this->makeItem(null);

        $resultVisible = $this->plugin->afterGetAllVisibleItems(
            $this->quoteMock,
            [$nullItem],
        );

        $resultAll = $this->plugin->afterGetAllItems(
            $this->quoteMock,
            [$nullItem],
        );

        $this->assertCount(1, $resultVisible);
        $this->assertCount(1, $resultAll);
        $this->assertSame($nullItem, $resultVisible[0]);
        $this->assertSame($nullItem, $resultAll[0]);
    }

    public function testItPreservesArrayValuesReindexesSoCallersGetACleanArray(): void
    {
        $active1 = $this->makeItem(1);
        $inactive = $this->makeItem(0);
        $active2 = $this->makeItem(1);

        $result = $this->plugin->afterGetAllVisibleItems(
            $this->quoteMock,
            [$active1, $inactive, $active2],
        );

        $this->assertSame([0 => $active1, 1 => $active2], $result);
    }

    public function testItNeverMutatesItemIsDeletedFlagWhileFiltering(): void
    {
        $activeItem = $this->createMock(Item::class);
        $activeItem->method('getData')->with('is_active')->willReturn(1);
        $activeItem->expects($this->never())->method('isDeleted');

        $inactiveItem = $this->createMock(Item::class);
        $inactiveItem->method('getData')->with('is_active')->willReturn(0);
        $inactiveItem->expects($this->never())->method('isDeleted');

        $this->plugin->afterGetAllVisibleItems(
            $this->quoteMock,
            [$activeItem, $inactiveItem],
        );

        $this->plugin->afterGetAllItems(
            $this->quoteMock,
            [$activeItem, $inactiveItem],
        );
    }
}
